import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { drawPdfHeader, drawPdfInfoRow } from './exportHeader';

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

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Mismo criterio que usa el backend al guardar (rubricas.service.ts#evaluarEstudiante):
 * promedio de los niveles obtenidos, escalado al valor máximo del ítem. Devuelve el
 * desglose completo — puntos crudos obtenidos/máximos (suma de niveles, sin escalar),
 * la nota ya escalada al valor máximo del ítem, y "porcentaje" — solo si ya se
 * calificaron todos los indicadores; si no, no hay nada que mostrar todavía (todo null).
 *
 * "porcentaje" NO es la nota sobre la propia escala de la rúbrica (eso ya es "nota" —
 * mismo número si el ítem vale 100, por eso confundía) — es cuánto de la NOTA FINAL del
 * esquema ya aportó este ítem, igual que el hint "→X%" que se ve en cada celda de la
 * grilla de Notas (`contributionPct` en categories.js): la nota del ítem, escalada a su
 * peso (`itemWeight`) dentro del 100% del esquema. Si no se sabe el peso (no vino desde
 * el llamador), cae al % crudo sobre la escala de la rúbrica como mejor esfuerzo.
 */
function computeResultado(rubrica, calificaciones, valorMaximo, itemWeight) {
  const nivelMax = rubrica.niveles.length ? Math.max(...rubrica.niveles.map((n) => n.valor)) : 0;
  const maximoPosible = rubrica.indicadores.length * nivelMax;
  const todasCalificadas = rubrica.indicadores.every((ind) => calificaciones[ind.id] !== undefined);
  if (!todasCalificadas || !nivelMax || maximoPosible === 0) {
    return { puntosObtenidos: null, puntosMaximos: maximoPosible, nota: null, porcentaje: null };
  }

  const suma = rubrica.indicadores.reduce((acc, ind) => acc + (calificaciones[ind.id] ?? 0), 0);
  const fraccion = suma / maximoPosible;
  return {
    puntosObtenidos: suma,
    puntosMaximos: maximoPosible,
    nota: round2(fraccion * (valorMaximo ?? 100)),
    porcentaje: round2(fraccion * (itemWeight ?? 100)),
  };
}

/**
 * PDF de una evaluación por rúbrica de un solo estudiante, al estilo de los
 * formatos de evaluación del MEP: membrete institucional (logo MEP + escudo
 * del centro + Docente/Sección/Materia/Año, igual que el resto de
 * exportables — ver exportHeader.js), la tabla de la rúbrica con Valor/Fecha
 * dentro de su propio encabezado, la simbología, la tabla final con el nivel
 * marcado por indicador, y las observaciones del docente.
 */
export async function exportRubricaPdf({ group, studentName, itemName, itemValorMaximo, itemWeight, rubrica, calificaciones, observacion, docente }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 12;
  const resultado = computeResultado(rubrica, calificaciones, itemValorMaximo, itemWeight);
  const fecha = new Date().toLocaleDateString('es-CR');

  const offset = await drawPdfHeader(doc, group?.centro);
  const infoY = drawPdfInfoRow(
    doc,
    { docente, seccion: group?.seccion, materia: group?.materia, tipoDocumento: 'Rúbrica de evaluación', anio: group?.anioLectivo },
    offset,
  );

  doc.setTextColor(...BLACK);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text(`Evaluación: ${rubrica.nombre || itemName}`, pageWidth / 2, infoY + 6, { align: 'center' });
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9.5);
  doc.text(`Estudiante: ${studentName}`, marginX, infoY + 13);

  // Este ítem vale X% de la nota final del esquema — resaltado, porque las rúbricas
  // son items dentro de una categoría (no la nota final en sí).
  if (itemWeight != null) {
    doc.setFillColor(255, 237, 213);
    doc.roundedRect(pageWidth - marginX - 52, infoY + 8, 52, 7, 1.5, 1.5, 'F');
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.setTextColor(194, 65, 12);
    doc.text(`Vale ${itemWeight}% de la nota final`, pageWidth - marginX - 26, infoY + 12.5, { align: 'center' });
    doc.setTextColor(...BLACK);
    doc.setFont(undefined, 'normal');
  }

  // Tabla de la rúbrica — "Valor" (puntos que suma la rúbrica: indicadores × nivel
  // máximo) a la izquierda y "Fecha" a la derecha del propio encabezado de la tabla,
  // con "ESCALA DE VALORACIÓN" arriba de los niveles — mismo formato que usa el MEP.
  const mitad = Math.ceil(rubrica.niveles.length / 2);
  const rubricaHead = [
    [
      { content: 'Indicadores', rowSpan: 3, styles: { valign: 'middle', textColor: BLACK, fillColor: HEADER_FILL } },
      {
        content: `Valor: ${resultado.puntosMaximos} ptos.`,
        colSpan: mitad,
        styles: { textColor: BLACK, fillColor: HEADER_FILL, halign: 'left' },
      },
      {
        content: `Fecha: ${fecha}`,
        colSpan: rubrica.niveles.length - mitad,
        styles: { textColor: BLACK, fillColor: HEADER_FILL, halign: 'right' },
      },
    ],
    [
      {
        content: 'ESCALA DE VALORACIÓN',
        colSpan: rubrica.niveles.length,
        styles: { textColor: BLACK, fillColor: HEADER_FILL, halign: 'center' },
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
    startY: infoY + 18,
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

  // Resultado — puntos crudos (suma de niveles), nota ya escalada al valor máximo
  // del ítem, y cuánto de la NOTA FINAL ya aportó este ítem (no el % sobre la propia
  // escala de la rúbrica — eso ya es "Nota obtenida") — todo en un solo lugar.
  y = doc.lastAutoTable.finalY + 7;
  doc.setFillColor(...HEADER_FILL);
  doc.rect(marginX, y - 4.5, pageWidth - marginX * 2, 9, 'F');
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.1);
  doc.rect(marginX, y - 4.5, pageWidth - marginX * 2, 9, 'S');
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(...BLACK);
  const resumen = [
    `Puntos obtenidos: ${resultado.puntosObtenidos ?? '—'} de ${resultado.puntosMaximos}`,
    `Nota obtenida: ${resultado.nota ?? '—'}${resultado.nota != null ? ` de ${itemValorMaximo ?? 100}` : ''}`,
    `Aportó a la nota final: ${resultado.porcentaje != null ? `${resultado.porcentaje}%` : '—'}`,
  ].join('     |     ');
  doc.text(resumen, pageWidth / 2, y + 1, { align: 'center' });

  // Observaciones del docente.
  y += 14;
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text('Observaciones', marginX, y);
  y += 5;
  doc.setFont(undefined, 'normal');
  const texto = doc.splitTextToSize(observacion?.trim() || 'Ninguna', pageWidth - marginX * 2);
  doc.text(texto, marginX, y);

  doc.save(`rubrica_${sanitizeFilename(studentName)}.pdf`);
}
