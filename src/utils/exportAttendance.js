import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { ATTENDANCE_STATUSES, countByStatus } from '../components/Groups/Attendance/attendanceStatus';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const DARK = '1E293B';
const ESTADO_LABEL = { presente: 'Presente', ausente: 'Ausente', tardia: 'Tardía', justificada: 'Justificada' };
const STATUS_META = Object.fromEntries(ATTENDANCE_STATUSES.map((s) => [s.key, { ...s, label: ESTADO_LABEL[s.key] }]));

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

function hexToRgb(hex) {
  const clean = (hex ?? '000000').replace('#', '');
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function hexToArgb(hex) {
  return `FF${(hex ?? '000000').replace('#', '').toUpperCase()}`;
}

const MONTHS_LARGOS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
function fechaLarga(fecha) {
  const [year, month, day] = fecha.split('-').map(Number);
  return `${day} de ${MONTHS_LARGOS[month - 1]} de ${year}`;
}

function summaryLine(students, counts) {
  return [
    `Estudiantes: ${students.length}`,
    ...ATTENDANCE_STATUSES.map((s) => `${s.label}: ${counts[s.key] ?? 0}`),
  ].join('   |   ');
}

// ---------------------------------------------------------------------------
// PDF — lista de asistencia de la fecha seleccionada, mismo estilo que la
// exportación de Notas (encabezado oscuro, resumen, tabla con estado coloreado).
// ---------------------------------------------------------------------------
export function exportAttendancePdf(group, fecha, students, statusById) {
  const counts = countByStatus(statusById);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(...hexToRgb(DARK));
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(`Asistencia — ${group.name}`, 10, 10);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  const sub = fechaLarga(fecha);
  doc.text(sub, 10, 17);

  doc.setTextColor(...hexToRgb(DARK));
  doc.setFontSize(9);
  const summaryY = 28;
  doc.text(summaryLine(students, counts), 10, summaryY);

  const body = students.map((s, idx) => [idx + 1, s.name, STATUS_META[statusById[s.id]]?.label ?? '—']);
  const estadoColIndex = 2;

  autoTable(doc, {
    head: [['N.°', 'Estudiante', 'Estado']],
    body,
    startY: summaryY + 4,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.1 },
    headStyles: { fillColor: hexToRgb(DARK), textColor: 255 },
    columnStyles: { 0: { halign: 'center', cellWidth: 12 }, 1: { halign: 'left', cellWidth: 90 }, 2: { halign: 'center' } },
    didParseCell: (data) => {
      if (data.section !== 'body' || data.column.index !== estadoColIndex) return;
      const status = STATUS_META[statusById[students[data.row.index].id]];
      if (!status) return;
      data.cell.styles.fillColor = hexToRgb(status.bg);
      data.cell.styles.textColor = hexToRgb(status.color);
      data.cell.styles.fontStyle = 'bold';
    },
  });

  doc.save(`asistencia_${fecha}_${sanitizeFilename(group.name)}.pdf`);
}

// ---------------------------------------------------------------------------
// Excel — misma tabla, con fila de título/resumen y estado coloreado.
// ---------------------------------------------------------------------------
export async function exportAttendanceExcel(group, fecha, students, statusById) {
  const counts = countByStatus(statusById);
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Asistencia');

  const totalCols = 3;
  ws.mergeCells(1, 1, 1, totalCols);
  const title = ws.getCell(1, 1);
  const sub = fechaLarga(fecha);
  title.value = `Asistencia — ${group.name} · ${sub}`;
  title.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  title.alignment = { horizontal: 'center', vertical: 'middle' };
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(DARK) } };
  ws.getRow(1).height = 24;

  ws.mergeCells(2, 1, 2, totalCols);
  const summary = ws.getCell(2, 1);
  summary.value = summaryLine(students, counts);
  summary.font = { italic: true, color: { argb: 'FF475569' } };
  ws.getRow(2).height = 18;

  const headRow = 3;
  ['N.°', 'Estudiante', 'Estado'].forEach((h, idx) => {
    const cell = ws.getCell(headRow, idx + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(DARK) } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  ws.getColumn(1).width = 6;
  ws.getColumn(2).width = 32;
  ws.getColumn(3).width = 16;

  students.forEach((s, idx) => {
    const r = headRow + 1 + idx;
    ws.getCell(r, 1).value = idx + 1;
    ws.getCell(r, 1).alignment = { horizontal: 'center' };
    ws.getCell(r, 2).value = s.name;

    const status = STATUS_META[statusById[s.id]];
    const estadoCell = ws.getCell(r, 3);
    estadoCell.value = status?.label ?? '—';
    estadoCell.alignment = { horizontal: 'center' };
    if (status) {
      estadoCell.font = { bold: true, color: { argb: hexToArgb(status.color) } };
      estadoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: hexToArgb(status.bg) } };
    }
  });

  const lastRow = headRow + students.length;
  for (let r = headRow; r <= lastRow; r += 1) {
    for (let c = 1; c <= totalCols; c += 1) {
      ws.getCell(r, c).border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
      };
    }
  }

  const buf = await wb.xlsx.writeBuffer();
  downloadBlob(new Blob([buf], { type: XLSX_MIME }), `asistencia_${fecha}_${sanitizeFilename(group.name)}.xlsx`);
}
