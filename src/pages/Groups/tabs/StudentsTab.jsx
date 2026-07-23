import { useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  StudentsTable,
  AddStudentModal,
  EditStudentModal,
  TransferStudentModal,
} from '../../../components/Groups/Students';
import { estudiantesService } from '../../../services/estudiantesService';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';

function StudentsTab() {
  const { group, groupsList, reloadGroup } = useOutletContext();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editando, setEditando] = useState(null); // student | null
  const [trasladando, setTrasladando] = useState(null); // student | null
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef(null);

  const handleAddStudent = async (payload) => {
    await estudiantesService.matricular(group.id, payload);
    await reloadGroup();
  };

  const handleEditar = async (payload) => {
    await estudiantesService.editar(group.id, editando.id, payload);
    await reloadGroup();
    showToast('Estudiante actualizado', 'success');
  };

  const handleTrasladar = async (grupoDestinoId) => {
    await estudiantesService.trasladar(group.id, trasladando.id, grupoDestinoId);
    await reloadGroup();
    showToast('Estudiante trasladado', 'success');
  };

  const handleEliminar = async (student) => {
    const ok = await confirm({
      title: 'Quitar del grupo',
      message: `¿Quitar a ${student.name} de este grupo? Su historial de notas y asistencia se conserva.`,
      confirmLabel: 'Quitar',
      danger: true,
    });
    if (!ok) return;
    try {
      await estudiantesService.eliminar(group.id, student.id);
      await reloadGroup();
      showToast('Estudiante eliminado del grupo', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleImportarClick = () => fileInputRef.current?.click();

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo después
    if (!file) return;

    setImportError('');
    setImportResult(null);
    setIsImporting(true);
    try {
      const result = await estudiantesService.importarLista(group.id, file);
      setImportResult(result);
      await reloadGroup();
    } catch (err) {
      // Si el mensaje no parece una explicación pensada para el usuario (por
      // ejemplo un error técnico que se escapó sin envolver en el backend),
      // se muestra un mensaje genérico en vez del texto crudo del error.
      const esMensajeTecnico = /cannot read|undefined|is not a function|unexpected token|failed to fetch/i.test(
        err.message ?? '',
      );
      setImportError(
        esMensajeTecnico
          ? 'No se pudo importar el archivo — revisá que tenga el formato correcto (PDF o Excel con cédula y nombre) e intentá de nuevo.'
          : err.message,
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-[17px] font-extrabold text-[#0F172A]">Estudiantes</div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="press flex items-center gap-1.5 text-[13px] font-bold text-[var(--brand)]"
          >
            <i className="ph-bold ph-user-plus text-[15px]" />
            Agregar estudiante
          </button>
          <button
            type="button"
            onClick={handleImportarClick}
            disabled={isImporting}
            className="press flex items-center gap-1.5 text-[13px] font-bold text-[var(--brand)] disabled:opacity-60"
          >
            <i className="ph-bold ph-file-arrow-up text-[15px]" />
            {isImporting ? 'Importando…' : 'Importar lista'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx"
            onChange={handleFileSelected}
            className="hidden"
          />
        </div>
      </div>

      {importError && (
        <div className="mb-3 rounded-[12px] bg-[#FEF2F2] px-4 py-3 text-[13px] font-bold text-[#DC2626]">
          {importError}
        </div>
      )}
      {importResult && (
        <div className="mb-3 rounded-[12px] bg-[#ECFDF3] px-4 py-3 text-[13px] font-bold text-[#15803D]">
          Se leyeron {importResult.total} filas del archivo: {importResult.nuevos} estudiantes nuevos,{' '}
          {importResult.existentesAsociados} ya existían y se asociaron a este grupo,{' '}
          {importResult.yaEnElGrupo} ya estaban en el grupo
          {importResult.invalidos > 0 && `, ${importResult.invalidos} filas no se pudieron leer`}.
        </div>
      )}

      <StudentsTable
        students={group.students}
        onEditar={setEditando}
        onTrasladar={setTrasladando}
        onEliminar={handleEliminar}
      />

      {showAddModal && <AddStudentModal onClose={() => setShowAddModal(false)} onSubmit={handleAddStudent} />}
      {editando && (
        <EditStudentModal student={editando} onClose={() => setEditando(null)} onSubmit={handleEditar} />
      )}
      {trasladando && (
        <TransferStudentModal
          student={trasladando}
          currentGroupId={group.id}
          groups={groupsList ?? []}
          onClose={() => setTrasladando(null)}
          onSubmit={handleTrasladar}
        />
      )}
    </>
  );
}

export default StudentsTab;
