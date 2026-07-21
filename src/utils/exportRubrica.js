import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const BLACK = [0, 0, 0];
const HEADER_FILL = [250, 251, 253];
const GROUP_FILL = [255, 237, 213];
const LEVEL_FILL = [209, 250, 229];

function sanitizeFilename(name) {
  return (name ?? 'estudiante').replace(/[^\w-]+/g, '_');
}

/** "A. Define conceptos…" → "A" — el backend ya prefija cada indicador con su letra. */
function indicatorLetter(texto, idx) {
  const match = (texto ?? '').match(/^\s*([A-Za-z])[.)]/);
  return match ? match[1].toUpperCase() : String.fromCharCode(65 + idx);
}

/** Misma fórmula que usa el backend al guardar (rubricas.service.ts#evaluarEstudiante):
 * promedio de los niveles obtenidos, escalado al valor máximo del ítem. Solo si ya
 * se calificaron todos los indicadores — si no, no hay nota que mostrar todavía. */
function computeValorObtenido(rubrica, calificaciones, valorMaximo) {
  const nivelMax = rubrica.niveles.length ? Math.max(...rubrica.niveles.map((n) => n.valor)) : 0;
  const todasCalificadas = rubrica.indicadores.every((ind) => calificaciones[ind.id] !== undefined);
  if (!todasCalificadas || !nivelMax) return null;

  const suma = rubrica.indicadores.reduce((acc, ind) => acc + (calificaciones[ind.id] ?? 0), 0);
  const maximoPosible = rubrica.indicadores.length * nivelMax;
  return maximoPosible > 0 ? Math.round(((suma / maximoPosible) * (valorMaximo ?? 100) + Number.EPSILON) * 100) / 100 : null;
}

/**
 * PDF de una evaluación por rúbrica de un solo estudiante, al estilo de los
 * formatos de evaluación del MEP: encabezado (institución/docente/materia —
 * quemado mientras esos datos no vivan en BD), la tabla de la rúbrica con
 * Valor/Fecha dentro de su propio encabezado, la simbología, la tabla final
 * con el nivel marcado por indicador, y las observaciones del docente.
 */
export function exportRubricaPdf({ group, studentName, itemName, itemValorMaximo, rubrica, calificaciones, observacion }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 12;
  const valorObtenido = computeValorObtenido(rubrica, calificaciones, itemValorMaximo);
  const fecha = new Date().toLocaleDateString('es-CR');

  // Encabezado institucional — placeholders quemados: aún no hay institución/docente en BD.
  doc.setTextColor(...BLACK);
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.text('Institución Educativa', pageWidth / 2, 14, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text('Ministerio de Educación Pública', pageWidth / 2, 19, { align: 'center' });

  doc.setFontSize(9.5);
  doc.text('Docente: ________________________', marginX, 28);
  doc.text(`Materia: ${group?.materia ?? '—'}`, marginX, 34);
  doc.text(`Sección: ${group?.seccion ?? '—'}`, pageWidth - marginX - 45, 28);
  doc.text(`Año: ${group?.anioLectivo ?? '—'}`, pageWidth - marginX - 45, 34);

  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text(`Evaluación: ${rubrica.nombre || itemName}`, pageWidth / 2, 42, { align: 'center' });
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9.5);
  doc.text(`Estudiante: ${studentName}`, marginX, 49);

  // Tabla de la rúbrica — "Valor" y "Fecha" quedan dentro del propio encabezado de la tabla.
  const rubricaHead = [
    [
      { content: 'Indicadores', rowSpan: 2, styles: { valign: 'middle', textColor: BLACK, fillColor: HEADER_FILL } },
      {
        content: `Valor: ${valorObtenido != null ? valorObtenido : '____'}        Fecha: ${fecha}`,
        colSpan: rubrica.niveles.length,
        styles: { textColor: BLACK, fillColor: HEADER_FILL, halign: 'left' },
      },
    ],
    rubrica.niveles.map((n) => ({
      content: `(${n.valor}) ${n.etiqueta}`,
      styles: { textColor: BLACK, fillColor: HEADER_FILL, halign: 'center' },
    })),
  ];
  const rubricaBody = rubrica.indicadores.map((ind) => [
    ind.texto,
    ...rubrica.niveles.map((n) => ind.celdas?.find((c) => c.nivelValor === n.valor)?.descripcion || '—'),
  ]);

  autoTable(doc, {
    head: rubricaHead,
    body: rubricaBody,
    startY: 54,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, lineColor: BLACK, lineWidth: 0.1, valign: 'top', textColor: BLACK },
    headStyles: { fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 42, fontStyle: 'bold' } },
  });

  // Simbología — un ítem por nivel configurado en la rúbrica.
  let y = doc.lastAutoTable.finalY + 6;
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...BLACK);
  doc.text('Simbología', marginX, y);
  y += 4;
  const simbologia = [['No responde: 0', ...rubrica.niveles.map((n) => `${n.etiqueta}: ${n.valor}`)]];
  autoTable(doc, {
    body: simbologia,
    startY: y,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, lineColor: BLACK, lineWidth: 0.1, halign: 'center', textColor: BLACK },
  });

  // Tabla final de puntuación — un solo estudiante, un sub-grupo de columnas por indicador.
  y = doc.lastAutoTable.finalY + 6;
  const headRow1 = [
    { content: 'N°', rowSpan: 2, styles: { fillColor: GROUP_FILL, textColor: BLACK, fontStyle: 'bold', valign: 'middle' } },
    {
      content: 'Estudiante',
      rowSpan: 2,
      styles: { fillColor: GROUP_FILL, textColor: BLACK, fontStyle: 'bold', valign: 'middle', halign: 'left' },
    },
    ...rubrica.indicadores.map((ind, idx) => ({
      content: `Indicador ${indicatorLetter(ind.texto, idx)}`,
      colSpan: rubrica.niveles.length,
      styles: { fillColor: GROUP_FILL, textColor: BLACK, fontStyle: 'bold' },
    })),
  ];
  const headRow2 = rubrica.indicadores.flatMap(() =>
    rubrica.niveles.map((n) => ({
      content: String(n.valor),
      styles: { fillColor: LEVEL_FILL, textColor: BLACK, fontStyle: 'bold' },
    })),
  );

  const body = [
    [
      '1',
      studentName,
      ...rubrica.indicadores.flatMap((ind) =>
        rubrica.niveles.map((n) => (calificaciones[ind.id] === n.valor ? 'X' : '')),
      ),
    ],
  ];

  autoTable(doc, {
    head: [headRow1, headRow2],
    body,
    startY: y,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, halign: 'center', lineColor: BLACK, lineWidth: 0.1, valign: 'middle', textColor: BLACK },
    columnStyles: { 1: { halign: 'left', cellWidth: 40 }, 0: { cellWidth: 8 } },
  });

  // Observaciones del docente.
  y = doc.lastAutoTable.finalY + 8;
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text('Observaciones', marginX, y);
  y += 5;
  doc.setFont(undefined, 'normal');
  const texto = doc.splitTextToSize(observacion?.trim() || 'Ninguna', pageWidth - marginX * 2);
  doc.text(texto, marginX, y);

  doc.save(`rubrica_${sanitizeFilename(studentName)}.pdf`);
}
