import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import {
  buildGradeColumns,
  groupColumnsByCategory,
  categoryContributionPct,
  contributionPct,
} from '../components/Groups/Grades/categories';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const DARK = '1E293B';
const STATUS_LABEL = { ok: 'Aprobados', limit: 'Van bien', risk: 'En riesgo', reprobado: 'Reprobados' };

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function sanitizeFilename(name) {
  return (name ?? 'grupo').replace(/[^\w-]+/g, '_');
}

function normalize(str) {
  return (str ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

function hexToRgb(hex) {
  const clean = (hex ?? '000000').replace('#', '');
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function hexToArgb(hex) {
  return `FF${(hex ?? '000000').replace('#', '').toUpperCase()}`;
}

/** Promedio simple de un conjunto de items — mismo criterio que la tabla en pantalla. */
function averageOfIds(student, ids) {
  const values = ids.map((id) => student.grades[id]).filter((v) => v != null);
  return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
}

function columnValue(student, col) {
  return col.type === 'total' ? averageOfIds(student, col.leafKeys) : (student.grades[col.key] ?? null);
}

/**
 * Tanto para columnas de total por categoría como de item suelto: cuánto
 * aporta ya a la nota final — el mismo número que se ve en azul como "→X%"
 * debajo del puntaje en la tabla en pantalla (no la nota cruda sobre el
 * valor máximo del item, ni el % relativo al peso propio de la categoría).
 */
function columnValueDisplay(student, col, colByKey) {
  if (col.type === 'total') {
    const pct = categoryContributionPct(student, col, colByKey);
    return pct != null ? `${pct}%` : '—';
  }
  const value = columnValue(student, col);
  const pct = contributionPct(value, col);
  return pct != null ? `${pct}%` : '—';
}

/** La columna que representa el score de la categoría completa: su "total" si tiene más de un item, o su único item si no. */
function categoryScoreColumn(columns, categoryId) {
  return (
    columns.find((c) => c.categoryId === categoryId && c.type === 'total') ??
    columns.find((c) => c.categoryId === categoryId && c.type === 'leaf')
  );
}

/** Cuánto aporta ya la categoría a la nota final, para las columnas de "resumen" (sin desglose de items) — funciona igual con categorías de 1 solo item. */
function categoryPercentDisplay(student, col, colByKey) {
  const pct = categoryContributionPct(student, col, colByKey);
  return pct != null ? `${pct}%` : '—';
}

function statusDistribution(students) {
  return students.reduce((acc, s) => ({ ...acc, [s.status.key]: (acc[s.status.key] ?? 0) + 1 }), {});
}

function groupAverage(students) {
  const conNota = students.filter((s) => s.avg != null);
  return conNota.length ? conNota.reduce((sum, s) => sum + s.avg, 0) / conNota.length : null;
}

// ---------------------------------------------------------------------------
// PDF (vertical / portrait) — encabezado con datos del grupo, tabla agrupada
// por categoría con sus colores, fila de estado coloreada y leyenda al pie.
// ---------------------------------------------------------------------------
export function exportNotasDesglosadasPdf(group, students) {
  const columns = buildGradeColumns(group.evaluationSchema);
  const colByKey = Object.fromEntries(columns.map((c) => [c.key, c]));
  const groups = groupColumnsByCategory(columns);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(...hexToRgb(DARK));
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(`Notas — ${group.name}`, 10, 10);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  const sub = [group.materia, group.seccion, group.anioLectivo].filter(Boolean).join(' · ');
  if (sub) doc.text(sub, 10, 17);

  const dist = statusDistribution(students);
  const avg = groupAverage(students);
  doc.setTextColor(...hexToRgb(DARK));
  doc.setFontSize(9);
  const summaryY = 28;
  const summary = [
    `Estudiantes: ${students.length}`,
    `Promedio grupo: ${avg != null ? avg.toFixed(1) : '—'}`,
    `Aprobados: ${dist.ok ?? 0}`,
    `Van bien: ${dist.limit ?? 0}`,
    `En riesgo: ${dist.risk ?? 0}`,
    `Reprobados: ${dist.reprobado ?? 0}`,
  ].join('   |   ');
  doc.text(summary, 10, summaryY);

  const totalDataCols = 2 + columns.length + 2; // N°, Estudiante, ...columnas, Prom., Estado
  const fontSize = totalDataCols > 13 ? 6 : totalDataCols > 9 ? 7 : 8;

  const headRow1 = [
    { content: 'N.°', rowSpan: 2, styles: { valign: 'middle', fillColor: hexToRgb(DARK), textColor: 255 } },
    {
      content: 'Estudiante',
      rowSpan: 2,
      styles: { valign: 'middle', halign: 'left', fillColor: hexToRgb(DARK), textColor: 255 },
    },
    ...groups.map((g) => ({
      content: `${g.name}${g.weight ? ` ${g.weight}%` : ''}`,
      colSpan: g.count,
      styles: { fillColor: hexToRgb(g.color), textColor: 255 },
    })),
    { content: 'Prom.', rowSpan: 2, styles: { valign: 'middle', fillColor: hexToRgb(DARK), textColor: 255 } },
    { content: 'Estado', rowSpan: 2, styles: { valign: 'middle', fillColor: hexToRgb(DARK), textColor: 255 } },
  ];
  const headRow2 = columns.map((col) => ({
    content: col.header,
    styles: { fillColor: hexToRgb(col.color), textColor: 255, fontSize: fontSize - 1 },
  }));

  const body = students.map((s, idx) => [
    idx + 1,
    s.name,
    ...columns.map((col) => columnValueDisplay(s, col, colByKey)),
    s.avg != null ? `${s.avg.toFixed(1)}%` : '—',
    s.status.label,
  ]);

  const lastColIndex = totalDataCols - 1;
  const avgColIndex = totalDataCols - 2;

  autoTable(doc, {
    head: [headRow1, headRow2],
    body,
    startY: summaryY + 4,
    theme: 'grid',
    styles: { fontSize, cellPadding: 1.4, halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.1, valign: 'middle' },
    columnStyles: { 1: { halign: 'left', cellWidth: 30 }, 0: { cellWidth: 8 } },
    didParseCell: (data) => {
      if (data.section !== 'body') return;
      const student = students[data.row.index];
      if (data.column.index === lastColIndex) {
        data.cell.styles.fillColor = hexToRgb(student.status.bg);
        data.cell.styles.textColor = hexToRgb(student.status.color);
        data.cell.styles.fontStyle = 'bold';
      } else if (data.column.index === avgColIndex) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  let y = doc.lastAutoTable.finalY + 8;
  const legendItems = [
    ['ok', '16A34A'],
    ['limit', '1D4ED8'],
    ['risk', 'D97706'],
    ['reprobado', 'DC2626'],
  ];
  doc.setFontSize(9);
  let x = 10;
  legendItems.forEach(([key, color]) => {
    doc.setFillColor(...hexToRgb(color));
    doc.circle(x + 1, y - 1.2, 1.1, 'F');
    doc.setTextColor(...hexToRgb(DARK));
    const label = `${dist[key] ?? 0} ${STATUS_LABEL[key].toLowerCase()}`;
    doc.text(label, x + 4, y);
    x += doc.getTextWidth(label) + 12;
  });

  doc.save(`notas_desglosadas_${sanitizeFilename(group.name)}.pdf`);
}

// ---------------------------------------------------------------------------
// Excel — mismo agrupado por categoría con colores + fila de resumen/leyenda.
// ---------------------------------------------------------------------------
export async function exportNotasDesglosadasExcel(group, students) {
  const columns = buildGradeColumns(group.evaluationSchema);
  const colByKey = Object.fromEntries(columns.map((c) => [c.key, c]));
  const groups = groupColumnsByCategory(columns);
  const dist = statusDistribution(students);
  const avg = groupAverage(students);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Notas');

  const totalCols = 2 + columns.length + 2;

  // Título
  ws.mergeCells(1, 1, 1, totalCols);
  const title = ws.getCell(1, 1);
  const sub = [group.materia, group.seccion, group.anioLectivo].filter(Boolean).join(' · ');
  title.value = `Notas — ${group.name}${sub ? ' · ' + sub : ''}`;
  title.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  title.alignment = { horizontal: 'center', vertical: 'middle' };
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(DARK) } };
  ws.getRow(1).height = 24;

  // Resumen
  ws.mergeCells(2, 1, 2, totalCols);
  const summary = ws.getCell(2, 1);
  summary.value = `Estudiantes: ${students.length}   |   Promedio grupo: ${avg != null ? avg.toFixed(1) : '—'}   |   Aprobados: ${dist.ok ?? 0}   |   Van bien: ${dist.limit ?? 0}   |   En riesgo: ${dist.risk ?? 0}   |   Reprobados: ${dist.reprobado ?? 0}`;
  summary.font = { italic: true, color: { argb: 'FF475569' } };
  ws.getRow(2).height = 18;

  const headRow1 = 3;
  const headRow2 = 4;

  ws.mergeCells(headRow1, 1, headRow2, 1);
  ws.getCell(headRow1, 1).value = 'N.°';
  ws.mergeCells(headRow1, 2, headRow2, 2);
  ws.getCell(headRow1, 2).value = 'Estudiante';

  let col = 3;
  groups.forEach((g) => {
    const span = g.count;
    if (span > 1) ws.mergeCells(headRow1, col, headRow1, col + span - 1);
    else ws.mergeCells(headRow1, col, headRow2, col);
    const cell = ws.getCell(headRow1, col);
    cell.value = `${g.name}${g.weight ? ` ${g.weight}%` : ''}`;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(g.color) } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    col += span;
  });

  const promCol = col;
  ws.mergeCells(headRow1, promCol, headRow2, promCol);
  ws.getCell(headRow1, promCol).value = 'Prom.';
  const estadoCol = promCol + 1;
  ws.mergeCells(headRow1, estadoCol, headRow2, estadoCol);
  ws.getCell(headRow1, estadoCol).value = 'Estado';

  [1, 2, promCol, estadoCol].forEach((c) => {
    const cell = ws.getCell(headRow1, c);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(DARK) } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  col = 3;
  columns.forEach((c) => {
    const cell = ws.getCell(headRow2, col);
    cell.value = c.header;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(c.color) } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    col += 1;
  });

  ws.getColumn(1).width = 6;
  ws.getColumn(2).width = 28;
  for (let c = 3; c <= estadoCol; c += 1) ws.getColumn(c).width = 13;

  students.forEach((s, idx) => {
    const r = headRow2 + 1 + idx;
    ws.getCell(r, 1).value = idx + 1;
    ws.getCell(r, 2).value = s.name;
    let c = 3;
    columns.forEach((column) => {
      const cell = ws.getCell(r, c);
      if (column.type === 'total') {
        const pct = categoryContributionPct(s, column, colByKey);
        cell.value = pct;
        cell.font = { bold: true };
        if (pct != null) cell.numFmt = '0"%"';
      } else {
        const value = columnValue(s, column);
        const pct = contributionPct(value, column);
        cell.value = pct;
        if (pct != null) cell.numFmt = '0"%"';
      }
      cell.alignment = { horizontal: 'center' };
      c += 1;
    });
    const promCell = ws.getCell(r, promCol);
    promCell.value = s.avg != null ? Number(s.avg.toFixed(1)) : null;
    promCell.font = { bold: true };
    promCell.alignment = { horizontal: 'center' };
    if (s.avg != null) promCell.numFmt = '0.0"%"';

    const estadoCell = ws.getCell(r, estadoCol);
    estadoCell.value = s.status.label;
    estadoCell.font = { bold: true, color: { argb: hexToArgb(s.status.color) } };
    estadoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(s.status.bg) } };
    estadoCell.alignment = { horizontal: 'center' };
  });

  const lastRow = headRow2 + students.length;
  for (let r = headRow1; r <= lastRow; r += 1) {
    for (let c = 1; c <= estadoCol; c += 1) {
      ws.getCell(r, c).border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
      };
    }
  }

  const buf = await wb.xlsx.writeBuffer();
  downloadBlob(new Blob([buf], { type: XLSX_MIME }), `notas_desglosadas_${sanitizeFilename(group.name)}.xlsx`);
}

// ---------------------------------------------------------------------------
// "Resumen" — una sola columna por categoría (su nota final, sin desglose de
// ítems), para cuando no hace falta ver el detalle ítem por ítem.
// ---------------------------------------------------------------------------
export function exportNotasResumenPdf(group, students) {
  const columns = buildGradeColumns(group.evaluationSchema);
  const colByKey = Object.fromEntries(columns.map((c) => [c.key, c]));
  const categoryColumns = (group.evaluationSchema ?? []).map((cat) => categoryScoreColumn(columns, cat.id)).filter(Boolean);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(...hexToRgb(DARK));
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(`Notas — ${group.name}`, 10, 10);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  const sub = [group.materia, group.seccion, group.anioLectivo].filter(Boolean).join(' · ');
  if (sub) doc.text(sub, 10, 17);

  const dist = statusDistribution(students);
  const avg = groupAverage(students);
  doc.setTextColor(...hexToRgb(DARK));
  doc.setFontSize(9);
  const summaryY = 28;
  const summary = [
    `Estudiantes: ${students.length}`,
    `Promedio grupo: ${avg != null ? avg.toFixed(1) : '—'}`,
    `Aprobados: ${dist.ok ?? 0}`,
    `Van bien: ${dist.limit ?? 0}`,
    `En riesgo: ${dist.risk ?? 0}`,
    `Reprobados: ${dist.reprobado ?? 0}`,
  ].join('   |   ');
  doc.text(summary, 10, summaryY);

  const head = [
    [
      'N.°',
      'Estudiante',
      ...categoryColumns.map((c) => `${c.categoryName} · ${c.categoryWeight}%`),
      'Prom.',
      'Estado',
    ],
  ];
  const body = students.map((s, idx) => [
    idx + 1,
    s.name,
    ...categoryColumns.map((col) => categoryPercentDisplay(s, col, colByKey)),
    s.avg != null ? `${s.avg.toFixed(1)}%` : '—',
    s.status.label,
  ]);

  const lastColIndex = head[0].length - 1;
  const avgColIndex = head[0].length - 2;

  autoTable(doc, {
    head,
    body,
    startY: summaryY + 4,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.6, halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.1 },
    headStyles: { fillColor: hexToRgb(DARK), textColor: 255 },
    columnStyles: { 1: { halign: 'left', cellWidth: 40 } },
    didParseCell: (data) => {
      if (data.section !== 'body') return;
      const student = students[data.row.index];
      if (data.column.index === lastColIndex) {
        data.cell.styles.fillColor = hexToRgb(student.status.bg);
        data.cell.styles.textColor = hexToRgb(student.status.color);
        data.cell.styles.fontStyle = 'bold';
      } else if (data.column.index === avgColIndex) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  doc.save(`notas_${sanitizeFilename(group.name)}.pdf`);
}

export async function exportNotasResumenExcel(group, students) {
  const columns = buildGradeColumns(group.evaluationSchema);
  const colByKey = Object.fromEntries(columns.map((c) => [c.key, c]));
  const categoryColumns = (group.evaluationSchema ?? []).map((cat) => categoryScoreColumn(columns, cat.id)).filter(Boolean);
  const dist = statusDistribution(students);
  const avg = groupAverage(students);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Notas');

  const totalCols = 2 + categoryColumns.length + 2;
  ws.mergeCells(1, 1, 1, totalCols);
  const title = ws.getCell(1, 1);
  const sub = [group.materia, group.seccion, group.anioLectivo].filter(Boolean).join(' · ');
  title.value = `Notas — ${group.name}${sub ? ' · ' + sub : ''}`;
  title.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  title.alignment = { horizontal: 'center', vertical: 'middle' };
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(DARK) } };
  ws.getRow(1).height = 24;

  ws.mergeCells(2, 1, 2, totalCols);
  const summary = ws.getCell(2, 1);
  summary.value = `Estudiantes: ${students.length}   |   Promedio grupo: ${avg != null ? avg.toFixed(1) : '—'}   |   Aprobados: ${dist.ok ?? 0}   |   Van bien: ${dist.limit ?? 0}   |   En riesgo: ${dist.risk ?? 0}   |   Reprobados: ${dist.reprobado ?? 0}`;
  summary.font = { italic: true, color: { argb: 'FF475569' } };
  ws.getRow(2).height = 18;

  const headRow = 3;
  ws.columns = [
    { key: 'n', width: 6 },
    { key: 'name', width: 28 },
    ...categoryColumns.map(() => ({ width: 16 })),
    { key: 'avg', width: 12 },
    { key: 'estado', width: 14 },
  ];

  const headers = [
    'N.°',
    'Estudiante',
    ...categoryColumns.map((c) => `${c.categoryName} · ${c.categoryWeight}%`),
    'Prom.',
    'Estado',
  ];
  headers.forEach((h, idx) => {
    const cell = ws.getCell(headRow, idx + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(categoryColumns[idx - 2]?.color ?? DARK) } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  });

  const promCol = 3 + categoryColumns.length;
  const estadoCol = promCol + 1;

  students.forEach((s, idx) => {
    const r = headRow + 1 + idx;
    ws.getCell(r, 1).value = idx + 1;
    ws.getCell(r, 2).value = s.name;
    categoryColumns.forEach((col, cIdx) => {
      const cell = ws.getCell(r, 3 + cIdx);
      const pct = categoryContributionPct(s, col, colByKey);
      cell.value = pct;
      cell.alignment = { horizontal: 'center' };
      if (pct != null) cell.numFmt = '0"%"';
    });
    const promCell = ws.getCell(r, promCol);
    promCell.value = s.avg != null ? Number(s.avg.toFixed(1)) : null;
    promCell.font = { bold: true };
    promCell.alignment = { horizontal: 'center' };
    if (s.avg != null) promCell.numFmt = '0.0"%"';

    const estadoCell = ws.getCell(r, estadoCol);
    estadoCell.value = s.status.label;
    estadoCell.font = { bold: true, color: { argb: hexToArgb(s.status.color) } };
    estadoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(s.status.bg) } };
    estadoCell.alignment = { horizontal: 'center' };
  });

  const lastRow = headRow + students.length;
  for (let r = headRow; r <= lastRow; r += 1) {
    for (let c = 1; c <= estadoCol; c += 1) {
      ws.getCell(r, c).border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
      };
    }
  }

  const buf = await wb.xlsx.writeBuffer();
  downloadBlob(new Blob([buf], { type: XLSX_MIME }), `notas_${sanitizeFilename(group.name)}.xlsx`);
}

/**
 * Exportación en el formato oficial de la plataforma SEA del MEP: un CSV
 * separado por ";" con columnas fijas `Id;Nombre;Trabajo cotidiano;Tareas;
 * Prueba;Asistencia` (BOM UTF-8 incluido, como lo exige el importador de
 * SEA). Como el esquema de evaluación de cada grupo es libre, las categorías
 * se mapean por nombre (mejor esfuerzo): "trabajo cotidiano", "tarea(s)",
 * "prueba(s)/examen(es)" y la categoría automática de asistencia van a su
 * columna fija; cualquier otra categoría del esquema (ej. "Proyectos") no
 * tiene columna en este formato oficial y queda fuera del archivo.
 */
function buildSeaCategoryMap(schema) {
  const map = { trabajoCotidiano: null, tareas: null, prueba: null, asistencia: null };

  (schema ?? []).forEach((cat) => {
    const n = normalize(cat.name);
    if (!map.trabajoCotidiano && n.includes('trabajo cotidiano')) map.trabajoCotidiano = cat;
    else if (!map.tareas && n.includes('tarea')) map.tareas = cat;
    else if (!map.prueba && (n.includes('prueba') || n.includes('examen'))) map.prueba = cat;
    else if (!map.asistencia && (cat.auto || n.includes('asistencia'))) map.asistencia = cat;
  });

  return map;
}

function csvCell(value) {
  const str = value == null ? '' : String(value);
  return /[;"\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function exportNotasSea(group, students) {
  const columns = buildGradeColumns(group.evaluationSchema);
  const map = buildSeaCategoryMap(group.evaluationSchema);
  const seaCols = {
    tc: map.trabajoCotidiano && categoryScoreColumn(columns, map.trabajoCotidiano.id),
    tareas: map.tareas && categoryScoreColumn(columns, map.tareas.id),
    prueba: map.prueba && categoryScoreColumn(columns, map.prueba.id),
    asistencia: map.asistencia && categoryScoreColumn(columns, map.asistencia.id),
  };

  const header = ['Id', 'Nombre', 'Trabajo cotidiano', 'Tareas', 'Prueba', 'Asistencia'];
  const rows = students.map((s) => [
    s.cedula ?? '',
    s.name ?? '',
    seaCols.tc ? (columnValue(s, seaCols.tc) ?? '') : '',
    seaCols.tareas ? (columnValue(s, seaCols.tareas) ?? '') : '',
    seaCols.prueba ? (columnValue(s, seaCols.prueba) ?? '') : '',
    seaCols.asistencia ? (columnValue(s, seaCols.asistencia) ?? '') : '',
  ]);

  const BOM = '﻿';
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(';')).join('\r\n');
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `notas_SEA_${sanitizeFilename(group.name)}.csv`);
}

// ---------------------------------------------------------------------------
// "Año completo" — una columna por periodo (nota ya obtenida ahí) + nota final.
// Vista de solo lectura, sin desglose por ítem (igual que GradesGlobalTable).
// ---------------------------------------------------------------------------
export function exportNotasGlobalPdf(group, students) {
  const periodos = group.periodos ?? [];
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(...hexToRgb(DARK));
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(`Notas — Año completo — ${group.name}`, 10, 10);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  const sub = [group.materia, group.seccion, group.anioLectivo].filter(Boolean).join(' · ');
  if (sub) doc.text(sub, 10, 17);

  const dist = statusDistribution(students);
  const avg = groupAverage(students);
  doc.setTextColor(...hexToRgb(DARK));
  doc.setFontSize(9);
  const summaryY = 28;
  const summary = [
    `Estudiantes: ${students.length}`,
    `Promedio grupo: ${avg != null ? avg.toFixed(1) : '—'}`,
    `Aprobados: ${dist.ok ?? 0}`,
    `Van bien: ${dist.limit ?? 0}`,
    `En riesgo: ${dist.risk ?? 0}`,
    `Reprobados: ${dist.reprobado ?? 0}`,
  ].join('   |   ');
  doc.text(summary, 10, summaryY);

  const head = [['N.°', 'Estudiante', ...periodos.map((p) => p.nombre), 'Nota final', 'Estado']];
  const body = students.map((s, idx) => [
    idx + 1,
    s.name,
    ...periodos.map((p) => {
      const nota = s.periodoPromedios?.[p.id];
      return nota != null ? nota.toFixed(1) : '—';
    }),
    s.avg != null ? s.avg.toFixed(1) : '—',
    s.status.label,
  ]);

  const lastColIndex = head[0].length - 1;
  const avgColIndex = head[0].length - 2;

  autoTable(doc, {
    head,
    body,
    startY: summaryY + 4,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.6, halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.1 },
    headStyles: { fillColor: hexToRgb(DARK), textColor: 255 },
    columnStyles: { 1: { halign: 'left', cellWidth: 40 } },
    didParseCell: (data) => {
      if (data.section !== 'body') return;
      const student = students[data.row.index];
      if (data.column.index === lastColIndex) {
        data.cell.styles.fillColor = hexToRgb(student.status.bg);
        data.cell.styles.textColor = hexToRgb(student.status.color);
        data.cell.styles.fontStyle = 'bold';
      } else if (data.column.index === avgColIndex) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  doc.save(`notas_anio_completo_${sanitizeFilename(group.name)}.pdf`);
}

export async function exportNotasGlobalExcel(group, students) {
  const periodos = group.periodos ?? [];
  const dist = statusDistribution(students);
  const avg = groupAverage(students);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Año completo');

  const totalCols = 2 + periodos.length + 2;
  ws.mergeCells(1, 1, 1, totalCols);
  const title = ws.getCell(1, 1);
  const sub = [group.materia, group.seccion, group.anioLectivo].filter(Boolean).join(' · ');
  title.value = `Notas — Año completo — ${group.name}${sub ? ' · ' + sub : ''}`;
  title.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  title.alignment = { horizontal: 'center', vertical: 'middle' };
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(DARK) } };
  ws.getRow(1).height = 24;

  ws.mergeCells(2, 1, 2, totalCols);
  const summary = ws.getCell(2, 1);
  summary.value = `Estudiantes: ${students.length}   |   Promedio grupo: ${avg != null ? avg.toFixed(1) : '—'}   |   Aprobados: ${dist.ok ?? 0}   |   Van bien: ${dist.limit ?? 0}   |   En riesgo: ${dist.risk ?? 0}   |   Reprobados: ${dist.reprobado ?? 0}`;
  summary.font = { italic: true, color: { argb: 'FF475569' } };
  ws.getRow(2).height = 18;

  ws.columns = [
    { key: 'n', width: 6 },
    { key: 'name', width: 28 },
    ...periodos.map((p) => ({ key: `periodo-${p.id}`, width: 14 })),
    { key: 'avg', width: 12 },
    { key: 'estado', width: 14 },
  ];

  const headRow = ws.getRow(3);
  const headers = ['N.°', 'Estudiante', ...periodos.map((p) => p.nombre), 'Nota final', 'Estado'];
  headers.forEach((h, idx) => {
    const cell = headRow.getCell(idx + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(DARK) } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  students.forEach((s, idx) => {
    const r = 3 + 1 + idx;
    ws.getCell(r, 1).value = idx + 1;
    ws.getCell(r, 2).value = s.name;
    periodos.forEach((p, pIdx) => {
      const cell = ws.getCell(r, 3 + pIdx);
      cell.value = s.periodoPromedios?.[p.id] != null ? Number(s.periodoPromedios[p.id].toFixed(1)) : null;
      cell.alignment = { horizontal: 'center' };
    });
    const avgCell = ws.getCell(r, 3 + periodos.length);
    avgCell.value = s.avg != null ? Number(s.avg.toFixed(1)) : null;
    avgCell.font = { bold: true };
    avgCell.alignment = { horizontal: 'center' };

    const estadoCell = ws.getCell(r, 4 + periodos.length);
    estadoCell.value = s.status.label;
    estadoCell.font = { bold: true, color: { argb: hexToArgb(s.status.color) } };
    estadoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(s.status.bg) } };
    estadoCell.alignment = { horizontal: 'center' };
  });

  const lastRow = 4 + students.length;
  const lastCol = 4 + periodos.length;
  for (let r = 3; r <= lastRow; r += 1) {
    for (let c = 1; c <= lastCol; c += 1) {
      ws.getCell(r, c).border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
      };
    }
  }

  const buf = await wb.xlsx.writeBuffer();
  downloadBlob(new Blob([buf], { type: XLSX_MIME }), `notas_anio_completo_${sanitizeFilename(group.name)}.xlsx`);
}
