import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { buildGradeColumns, groupColumnsByCategory } from '../components/Groups/Grades/categories';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const DARK = '1E293B';

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
  return (name ?? 'estudiante').replace(/[^\w-]+/g, '_');
}

function hexToRgb(hex) {
  const clean = (hex ?? '000000').replace('#', '');
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function hexToArgb(hex) {
  return `FF${(hex ?? '000000').replace('#', '').toUpperCase()}`;
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function dateLabelOf(fecha) {
  const [, month, day] = fecha.split('-').map(Number);
  return `${day} ${MONTHS[month - 1]}`;
}
const ESTADO_LABEL = { presente: 'Presente', ausente: 'Ausente', tardia: 'Tardía', justificada: 'Justificada' };

/** Un mapa item.id -> valorObtenido y category.id -> score, para reusar buildGradeColumns tal como en la grilla de Notas. */
function buildGradesFromSchema(schema) {
  const grades = {};
  const scoreByCategory = {};
  schema.forEach((cat) => {
    scoreByCategory[cat.id] = cat.score;
    (cat.items ?? []).forEach((item) => {
      grades[item.id] = item.valorObtenido;
    });
  });
  return { grades, scoreByCategory };
}

function columnValue(col, grades, scoreByCategory) {
  if (col.type === 'total') return scoreByCategory[col.categoryId] != null ? Math.round(scoreByCategory[col.categoryId]) : null;
  return grades[col.key] ?? null;
}

// ---------------------------------------------------------------------------
// PDF — una sola tabla ancha con encabezado agrupado por categoría (igual
// estilo que la exportación de Notas de todo el grupo, pero con una única
// fila: la de este estudiante), + historial de asistencia debajo.
// ---------------------------------------------------------------------------
export function exportStudentProfilePdf({ group, student, schema, modo, periodos, historial }) {
  const esGlobal = modo === 'global';
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 12;

  doc.setFillColor(...hexToRgb(DARK));
  doc.rect(0, 0, pageWidth, 24, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.text(student.name, marginX, 12);
  doc.setFontSize(9.5);
  doc.setFont(undefined, 'normal');
  const sub = [group.name, student.cedula ? `Cédula ${student.cedula}` : null].filter(Boolean).join(' · ');
  doc.text(sub, marginX, 19);

  doc.setTextColor(...hexToRgb(DARK));
  let y = 32;
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  let summary = `Promedio: ${student.avg != null ? student.avg.toFixed(1) : '—'} — ${student.status.label}`;
  if (student.asistenciaCounts) {
    const c = student.asistenciaCounts;
    const tardia = c.tardiaInjustificada + c.tardiaJustificada;
    const ausente = c.ausenteInjustificada + c.ausenteJustificada;
    summary += `   |   Asistencia: ${c.presente} presente · ${tardia} tardía · ${ausente} ausente`;
  }
  doc.text(summary, marginX, y);
  y += 6;

  if (esGlobal) {
    const head = [['Estudiante', ...periodos.map((p) => p.nombre), 'Nota final', 'Estado']];
    const body = [
      [
        student.name,
        ...periodos.map((p) => {
          const nota = student.promediosPorPeriodo?.[p.id];
          return nota != null ? nota.toFixed(1) : '—';
        }),
        student.avg != null ? student.avg.toFixed(1) : '—',
        student.status.label,
      ],
    ];
    const lastColIndex = head[0].length - 1;
    const avgColIndex = head[0].length - 2;
    autoTable(doc, {
      head,
      body,
      startY: y,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2.2, halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.1 },
      headStyles: { fillColor: hexToRgb(DARK), textColor: 255 },
      columnStyles: { 0: { halign: 'left', cellWidth: 45 } },
      didParseCell: (data) => {
        if (data.section !== 'body') return;
        if (data.column.index === lastColIndex) {
          data.cell.styles.fillColor = hexToRgb(student.status.bg);
          data.cell.styles.textColor = hexToRgb(student.status.color);
          data.cell.styles.fontStyle = 'bold';
        } else if (data.column.index === avgColIndex) {
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });
  } else {
    const columns = buildGradeColumns(schema);
    const groups = groupColumnsByCategory(columns);
    const { grades, scoreByCategory } = buildGradesFromSchema(schema);

    const headRow1 = [
      { content: 'Estudiante', rowSpan: 2, styles: { valign: 'middle', halign: 'left', fillColor: hexToRgb(DARK), textColor: 255 } },
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
      styles: { fillColor: hexToRgb(col.color), textColor: 255, fontSize: 8 },
    }));

    const body = [
      [
        student.name,
        ...columns.map((col) => columnValue(col, grades, scoreByCategory) ?? '—'),
        student.avg != null ? student.avg.toFixed(1) : '—',
        student.status.label,
      ],
    ];
    const lastColIndex = 1 + columns.length + 1;
    const avgColIndex = lastColIndex - 1;

    autoTable(doc, {
      head: [headRow1, headRow2],
      body,
      startY: y,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2.2, halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.1, valign: 'middle' },
      columnStyles: { 0: { halign: 'left', cellWidth: 42 } },
      didParseCell: (data) => {
        if (data.section !== 'body') return;
        if (data.column.index === lastColIndex) {
          data.cell.styles.fillColor = hexToRgb(student.status.bg);
          data.cell.styles.textColor = hexToRgb(student.status.color);
          data.cell.styles.fontStyle = 'bold';
        } else if (data.column.index === avgColIndex) {
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });
  }

  y = doc.lastAutoTable.finalY + 8;
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Historial de asistencia', marginX, y);
  y += 3;

  autoTable(doc, {
    head: [['Fecha', 'Estado']],
    body: historial.map((h) => [dateLabelOf(h.fecha), ESTADO_LABEL[h.estado] ?? h.estado]),
    startY: y,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.1, textColor: [0, 0, 0], halign: 'center' },
    headStyles: { fillColor: hexToRgb(DARK), textColor: 255 },
    tableWidth: 90,
  });

  doc.save(`perfil_${sanitizeFilename(student.name)}.pdf`);
}

// ---------------------------------------------------------------------------
// Excel — una sola hoja: título, resumen, la tabla ancha de una fila (mismo
// criterio que la exportación de Notas del grupo) y el historial debajo.
// ---------------------------------------------------------------------------
export async function exportStudentProfileExcel({ group, student, schema, modo, periodos, historial }) {
  const esGlobal = modo === 'global';
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Perfil');

  const columns = esGlobal ? [] : buildGradeColumns(schema);
  const groups = esGlobal ? [] : groupColumnsByCategory(columns);
  const { grades, scoreByCategory } = esGlobal ? { grades: {}, scoreByCategory: {} } : buildGradesFromSchema(schema);

  const dataColCount = esGlobal ? periodos.length : columns.length;
  const totalCols = 1 + dataColCount + 2; // Estudiante + columnas + Prom. + Estado

  ws.mergeCells(1, 1, 1, totalCols);
  const title = ws.getCell(1, 1);
  const sub = [group.name, student.cedula ? `Cédula ${student.cedula}` : null].filter(Boolean).join(' · ');
  title.value = `${student.name} · ${sub}`;
  title.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  title.alignment = { horizontal: 'center', vertical: 'middle' };
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(DARK) } };
  ws.getRow(1).height = 24;

  ws.mergeCells(2, 1, 2, totalCols);
  const summaryCell = ws.getCell(2, 1);
  let summaryText = `Promedio: ${student.avg != null ? student.avg.toFixed(1) : '—'}   |   Estado: ${student.status.label}`;
  if (student.asistenciaCounts) {
    const c = student.asistenciaCounts;
    const tardia = c.tardiaInjustificada + c.tardiaJustificada;
    const ausente = c.ausenteInjustificada + c.ausenteJustificada;
    summaryText += `   |   Asistencia: ${c.presente} presente · ${tardia} tardía · ${ausente} ausente`;
  }
  summaryCell.value = summaryText;
  summaryCell.font = { italic: true, color: { argb: 'FF475569' } };
  ws.getRow(2).height = 18;

  const headRow1 = 3;
  const headRow2 = 4;
  ws.mergeCells(headRow1, 1, headRow2, 1);
  ws.getCell(headRow1, 1).value = 'Estudiante';

  let col = 2;
  if (esGlobal) {
    periodos.forEach((p) => {
      ws.mergeCells(headRow1, col, headRow2, col);
      const cell = ws.getCell(headRow1, col);
      cell.value = p.nombre;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(DARK) } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      col += 1;
    });
  } else {
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
  }

  const promCol = col;
  ws.mergeCells(headRow1, promCol, headRow2, promCol);
  ws.getCell(headRow1, promCol).value = esGlobal ? 'Nota final' : 'Prom.';
  const estadoCol = promCol + 1;
  ws.mergeCells(headRow1, estadoCol, headRow2, estadoCol);
  ws.getCell(headRow1, estadoCol).value = 'Estado';

  [1, promCol, estadoCol].forEach((c) => {
    const cell = ws.getCell(headRow1, c);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(DARK) } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  if (!esGlobal) {
    col = 2;
    columns.forEach((c) => {
      const cell = ws.getCell(headRow2, col);
      cell.value = c.header;
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(c.color) } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      col += 1;
    });
  }

  ws.getColumn(1).width = 30;
  for (let c = 2; c <= estadoCol; c += 1) ws.getColumn(c).width = 14;

  const dataRow = headRow2 + 1;
  ws.getCell(dataRow, 1).value = student.name;
  if (esGlobal) {
    periodos.forEach((p, idx) => {
      const cell = ws.getCell(dataRow, 2 + idx);
      const nota = student.promediosPorPeriodo?.[p.id];
      cell.value = nota != null ? Number(nota.toFixed(1)) : null;
      cell.alignment = { horizontal: 'center' };
    });
  } else {
    col = 2;
    columns.forEach((column) => {
      const cell = ws.getCell(dataRow, col);
      cell.value = columnValue(column, grades, scoreByCategory) ?? null;
      cell.alignment = { horizontal: 'center' };
      if (column.type === 'total') cell.font = { bold: true };
      col += 1;
    });
  }
  const promCell = ws.getCell(dataRow, promCol);
  promCell.value = student.avg != null ? Number(student.avg.toFixed(1)) : null;
  promCell.font = { bold: true };
  promCell.alignment = { horizontal: 'center' };

  const estadoCell = ws.getCell(dataRow, estadoCol);
  estadoCell.value = student.status.label;
  estadoCell.font = { bold: true, color: { argb: hexToArgb(student.status.color) } };
  estadoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(student.status.bg) } };
  estadoCell.alignment = { horizontal: 'center' };

  for (let r = headRow1; r <= dataRow; r += 1) {
    for (let c = 1; c <= estadoCol; c += 1) {
      ws.getCell(r, c).border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
      };
    }
  }

  // Historial de asistencia, debajo de la misma hoja.
  let r = dataRow + 3;
  const historialTitle = ws.getCell(r, 1);
  historialTitle.value = 'Historial de asistencia';
  historialTitle.font = { bold: true, size: 12 };
  r += 1;
  const histHeadRow = r;
  ws.getCell(histHeadRow, 1).value = 'Fecha';
  ws.getCell(histHeadRow, 2).value = 'Estado';
  [1, 2].forEach((c) => {
    const cell = ws.getCell(histHeadRow, c);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(DARK) } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: 'center' };
  });
  historial.forEach((h, idx) => {
    const hr = histHeadRow + 1 + idx;
    ws.getCell(hr, 1).value = dateLabelOf(h.fecha);
    ws.getCell(hr, 2).value = ESTADO_LABEL[h.estado] ?? h.estado;
    ws.getCell(hr, 1).alignment = { horizontal: 'center' };
    ws.getCell(hr, 2).alignment = { horizontal: 'center' };
  });
  const histLastRow = histHeadRow + historial.length;
  for (let hr = histHeadRow; hr <= histLastRow; hr += 1) {
    for (let c = 1; c <= 2; c += 1) {
      ws.getCell(hr, c).border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
      };
    }
  }

  const buf = await wb.xlsx.writeBuffer();
  downloadBlob(new Blob([buf], { type: XLSX_MIME }), `perfil_${sanitizeFilename(student.name)}.xlsx`);
}
