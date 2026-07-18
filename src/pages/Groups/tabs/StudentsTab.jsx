import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { QuickActionTiles, StudentsTable, AddStudentModal } from '../../../components/Groups/Students';

function StudentsTab() {
  const { group } = useOutletContext();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <QuickActionTiles />

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
          <button type="button" className="press flex items-center gap-1.5 text-[13px] font-bold text-[var(--brand)]">
            <i className="ph-bold ph-file-arrow-up text-[15px]" />
            Importar lista
          </button>
        </div>
      </div>

      <StudentsTable students={group.students} />

      {showAddModal && <AddStudentModal onClose={() => setShowAddModal(false)} />}
    </>
  );
}

export default StudentsTab;
