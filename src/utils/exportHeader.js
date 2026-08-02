// Encabezado institucional (logo MEP + escudo del centro + nombre + "Ministerio
// de Educación Pública" + Dirección Regional + correo) para TODOS los
// exportables PDF/Excel — menos el formato SEA (exportNotasSea en
// exportNotas.js), que es un CSV plano para subir directo a la plataforma SEA
// del MEP, no un documento pensado para imprimirse con membrete.
import { MEP_LOGO_BASE64 } from '../assets/mepLogoBase64';
import { apiFetch, parseJsonOrThrow } from '../services/apiClient';

/** "Lic. Dilan Gutiérrez Hernández" — título/tratamiento profesional (`user.etiqueta`, ej. "Bach.", "Lic.",
 * "MSc.") pegado al nombre del docente que exporta, para que quede igual en todos los documentos. */
export function formatDocente(user) {
  return [user?.etiqueta, user?.nombre].filter(Boolean).join(' ') || undefined;
}

/** Alto en mm que ocupa el encabezado en el PDF — el resto del documento arranca después de esto. */
export const PDF_HEADER_HEIGHT = 32;
/** Cuántas filas de Excel ocupa el encabezado (1 a este número) — sumar este offset a toda fila que
 * antes empezaba en 1 (ej. fila 1 del contenido original pasa a ser 1 + EXCEL_HEADER_ROWS). */
export const EXCEL_HEADER_ROWS = 3;

/** Trae una imagen (típicamente el escudo del centro, en R2) y la convierte a data URL para poder
 * embeberla en el PDF/Excel. R2 no manda `Access-Control-Allow-Origin`, así que un fetch directo
 * desde el navegador queda bloqueado por CORS — por eso pasa por el backend (GET /uploads/proxy),
 * que no tiene esa restricción. Si falla igual (URL caída, etc.) devuelve null — el encabezado
 * sigue armándose, solo sin el escudo, no debe romper la exportación. */
export async function fetchImageAsDataUrl(url) {
  if (!url) return null;
  try {
    const res = await apiFetch(`/uploads/proxy?url=${encodeURIComponent(url)}`);
    const { dataUrl } = await parseJsonOrThrow(res);
    return dataUrl ?? null;
  } catch {
    return null;
  }
}

/**
 * Dibuja el membrete institucional arriba de un PDF de jsPDF: logo del MEP a
 * la izquierda, escudo del centro a la derecha (si se pudo cargar), y el
 * nombre del centro + "Ministerio de Educación Pública" + Dirección
 * Regional/correo centrados. Devuelve `PDF_HEADER_HEIGHT` para que el
 * llamador sepa desde dónde seguir dibujando.
 */
export async function drawPdfHeader(doc, centro) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const logoW = 20;
  const logoH = logoW / 1.51;
  const logoY = 4;

  try {
    doc.addImage(MEP_LOGO_BASE64, 'PNG', 10, logoY, logoW, logoH);
  } catch {
    // Si jsPDF no puede decodificar la imagen (raro, pero no debe tumbar el export), seguimos sin logo.
  }

  const escudoDataUrl = await fetchImageAsDataUrl(centro?.escudoUrl);
  if (escudoDataUrl) {
    try {
      doc.addImage(escudoDataUrl, pageWidth - 10 - logoH, logoY, logoH, logoH);
    } catch {
      // Escudo con formato que jsPDF no soporta (ej. SVG) — se omite, el resto del encabezado sigue.
    }
  }

  doc.setTextColor(15, 23, 42);
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text(centro?.nombre || 'Centro educativo', pageWidth / 2, 10, { align: 'center' });

  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.text('Ministerio de Educación Pública', pageWidth / 2, 16, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const linea3 = [centro?.direccionRegional, centro?.correo].filter(Boolean).join(' · ');
  if (linea3) doc.text(linea3, pageWidth / 2, 21, { align: 'center' });

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(10, PDF_HEADER_HEIGHT - 4, pageWidth - 10, PDF_HEADER_HEIGHT - 4);

  doc.setTextColor(15, 23, 42);
  return PDF_HEADER_HEIGHT;
}

/**
 * Arma el mismo membrete institucional arriba de una hoja de ExcelJS: logo
 * del MEP a la izquierda, escudo del centro a la derecha (si se pudo
 * cargar), nombre del centro + "Ministerio de Educación Pública" + Dirección
 * Regional/correo centrados en las primeras filas. `totalCols` es el ancho
 * (en columnas) de la tabla que sigue, para saber hasta dónde mergear.
 * Devuelve `EXCEL_HEADER_ROWS` para que el llamador sepa en qué fila seguir.
 */
export async function drawExcelHeader(workbook, worksheet, centro, totalCols) {
  const cols = Math.max(totalCols, 4);

  worksheet.mergeCells(1, 1, 1, cols);
  const nombreCell = worksheet.getCell(1, 1);
  nombreCell.value = centro?.nombre || 'Centro educativo';
  nombreCell.font = { size: 13, bold: true, color: { argb: 'FF0F172A' } };
  nombreCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 20;

  worksheet.mergeCells(2, 1, 2, cols);
  const mepCell = worksheet.getCell(2, 1);
  mepCell.value = 'Ministerio de Educación Pública';
  mepCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(2).height = 15;

  const linea3 = [centro?.direccionRegional, centro?.correo].filter(Boolean).join(' · ');
  if (linea3) {
    worksheet.mergeCells(3, 1, 3, cols);
    const lineaCell = worksheet.getCell(3, 1);
    lineaCell.value = linea3;
    lineaCell.font = { size: 9, color: { argb: 'FF64748B' } };
    lineaCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(3).height = 14;
  }

  try {
    const mepImageId = workbook.addImage({ base64: MEP_LOGO_BASE64, extension: 'png' });
    worksheet.addImage(mepImageId, { tl: { col: 0, row: 0 }, ext: { width: 60, height: 40 } });
  } catch {
    // no-op — si algo falla acá, el resto del encabezado (texto) sigue igual.
  }

  const escudoDataUrl = await fetchImageAsDataUrl(centro?.escudoUrl);
  if (escudoDataUrl) {
    try {
      const match = /^data:image\/(png|jpeg|jpg|gif);base64,/.exec(escudoDataUrl);
      const extension = match ? (match[1] === 'jpg' ? 'jpeg' : match[1]) : 'png';
      const escudoImageId = workbook.addImage({ base64: escudoDataUrl, extension });
      worksheet.addImage(escudoImageId, { tl: { col: cols - 1, row: 0 }, ext: { width: 40, height: 40 } });
    } catch {
      // Escudo con formato que ExcelJS no soporta — se omite, el resto del encabezado sigue.
    }
  }

  return EXCEL_HEADER_ROWS;
}

/**
 * Fila "Docente / Sección" + fila "Materia / (tipo de documento) / Año" —
 * reemplaza la vieja barra oscura con el título del grupo por un formato
 * plano tipo membrete oficial, igual al de los documentos que ya arma el
 * MEP. `startY` es el Y (mm) donde empieza esta sección; devuelve el Y
 * donde debería arrancar lo que sigue (resumen/tabla).
 */
export function drawPdfInfoRow(doc, { docente, seccion, materia, tipoDocumento, anio }, startY) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 10;

  doc.setFont(undefined, 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);

  const row1Y = startY + 5;
  doc.text(`Docente: ${docente || '—'}`, marginX, row1Y);
  doc.text(`Sección: ${seccion || '—'}`, pageWidth - marginX, row1Y, { align: 'right' });

  const row2Y = row1Y + 5.5;
  doc.text(`Materia: ${materia || '—'}`, marginX, row2Y);
  if (tipoDocumento) doc.text(tipoDocumento, pageWidth / 2, row2Y, { align: 'center' });
  doc.text(`Año: ${anio || '—'}`, pageWidth - marginX, row2Y, { align: 'right' });

  doc.setFont(undefined, 'normal');
  return row2Y + 5;
}

/**
 * Misma fila "Docente / Sección" + "Materia / (tipo de documento) / Año"
 * para ExcelJS — `startRow` es la fila donde empieza, `totalCols` el ancho
 * de la tabla que sigue. Devuelve cuántas filas ocupó (2).
 */
export function drawExcelInfoRow(worksheet, { docente, seccion, materia, tipoDocumento, anio }, startRow, totalCols) {
  const cols = Math.max(totalCols, 4);
  const half = Math.max(1, Math.floor(cols / 2));
  const third = Math.max(1, Math.floor(cols / 3));

  const r1 = startRow;
  worksheet.mergeCells(r1, 1, r1, half);
  const docenteCell = worksheet.getCell(r1, 1);
  docenteCell.value = `Docente: ${docente || '—'}`;
  docenteCell.font = { bold: true, size: 10 };
  worksheet.mergeCells(r1, half + 1, r1, cols);
  const seccionCell = worksheet.getCell(r1, half + 1);
  seccionCell.value = `Sección: ${seccion || '—'}`;
  seccionCell.font = { bold: true, size: 10 };
  seccionCell.alignment = { horizontal: 'right' };
  worksheet.getRow(r1).height = 15;

  const r2 = startRow + 1;
  worksheet.mergeCells(r2, 1, r2, third);
  const materiaCell = worksheet.getCell(r2, 1);
  materiaCell.value = `Materia: ${materia || '—'}`;
  materiaCell.font = { bold: true, size: 10 };
  if (tipoDocumento) {
    worksheet.mergeCells(r2, third + 1, r2, cols - third);
    const tipoCell = worksheet.getCell(r2, third + 1);
    tipoCell.value = tipoDocumento;
    tipoCell.font = { bold: true, size: 10 };
    tipoCell.alignment = { horizontal: 'center' };
  }
  worksheet.mergeCells(r2, cols - third + 1, r2, cols);
  const anioCell = worksheet.getCell(r2, cols - third + 1);
  anioCell.value = `Año: ${anio || '—'}`;
  anioCell.font = { bold: true, size: 10 };
  anioCell.alignment = { horizontal: 'right' };
  worksheet.getRow(r2).height = 15;

  return 2;
}
