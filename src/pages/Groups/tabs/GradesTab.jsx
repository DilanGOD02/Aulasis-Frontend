import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  CategoryFilterPills,
  GradesTable,
  GradesGlobalTable,
  RubricaGradingModal,
  ExportMenu,
  buildGradeColumns,
  buildGradeFilters,
} from '../../../components/Groups/Grades';
import { notasService } from '../../../services/notasService';
import { statusMeta } from '../../../utils/statusMeta';

const LEGEND = [
  { key: 'ok', dot: '#16A34A', label: 'aprobados' },
  { key: 'limit', dot: '#D97706', label: 'en riesgo' },
  { key: 'risk', dot: '#DC2626', label: 'reprobados' },
  { key: 'incomplete', dot: '#94A3B8', label: 'incompletos' },
];

function GradesTab() {
  const { group, reloadGroup, updateStudentGrade } = useOutletContext();
  const [students, setStudents] = useState(group.students);
  const [activeFilterKey, setActiveFilterKey] = useState('all');
  const [rubricaAbierta, setRubricaAbierta] = useState(null); // { studentId, itemId, studentName } | null
  const periodoLectivoId = group.periodoSeleccionadoId ?? group.periodoActualId;

  useEffect(() => {
    setStudents(group.students);
  }, [group.students]);

  const columns = useMemo(() => buildGradeColumns(group.evaluationSchema), [group]);
  const filters = useMemo(() => buildGradeFilters(group.evaluationSchema), [group]);
  const activeFilter = filters.find((f) => f.key === activeFilterKey) ?? filters[0];
  const visibleColumns = activeFilter.columnKeys ? columns.filter((c) => activeFilter.columnKeys.includes(c.key)) : columns;

  const handleGradeChange = (studentId, itemId, value) =>
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, grades: { ...s.grades, [itemId]: value === '' ? null : value } } : s)),
    );

  const handleGradeCommit = async (studentId, itemId, value) => {
    if (typeof itemId !== 'number' || !periodoLectivoId) return; // columnas "total" no son celdas editables
    try {
      const result = await notasService.upsert({
        grupoEstudianteId: studentId,
        itemEvaluacionId: itemId,
        periodoLectivoId,
        valorObtenido: value === '' || value === null ? null : Number(value),
      });
      const status = statusMeta(result.status);
      setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, avg: result.avg, status } : s)));
      updateStudentGrade?.(studentId, itemId, value === '' || value === null ? null : Number(value), result.avg, status);
    } catch {
      // silencioso: la celda queda con el valor tecleado, se reintentará en el próximo blur/guardado
    }
  };

  const distribution = students.reduce(
    (acc, s) => ({ ...acc, [s.status.key]: (acc[s.status.key] ?? 0) + 1 }),
    { ok: 0, limit: 0, risk: 0, incomplete: 0 },
  );
  const conNota = students.filter((s) => s.avg != null);
  const groupAvg = conNota.length ? conNota.reduce((sum, s) => sum + s.avg, 0) / conNota.length : null;

  if (group.modo === 'global') {
    return (
      <>
        <div className="mb-3 flex items-center justify-between gap-2 text-[13px] font-semibold text-[#64748B]">
          <div className="flex items-center gap-1.5">
            <i className="ph ph-info text-[16px] text-[var(--brand)]" />
            Año completo (solo lectura): la nota ya obtenida en cada periodo y la nota final (su promedio).
          </div>
          <ExportMenu group={group} students={students} />
        </div>

        <GradesGlobalTable students={students} periodos={group.periodos} />

        <div className="mt-3.5 flex flex-wrap items-center gap-3.5 text-[13px] font-semibold text-[#64748B]">
          {LEGEND.map(({ key, dot, label }) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: dot }} />
              {distribution[key]} {label}
            </div>
          ))}
          <div className="ml-auto text-[#94A3B8]">
            Promedio del grupo ·{' '}
            <span className="text-[15px] font-extrabold text-[#0F172A]">{groupAvg != null ? groupAvg.toFixed(1) : '—'}</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CategoryFilterPills
        filters={filters}
        active={activeFilterKey}
        onChange={setActiveFilterKey}
        actions={<ExportMenu group={group} students={students} />}
      />

      <div className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-[#64748B]">
        <i className="ph ph-cursor-click text-[16px] text-[var(--brand)]" />
        Tocá cualquier celda y escribí la nota — el promedio se recalcula solo, con el % que aporta a la nota final.
      </div>

      <GradesTable
        students={students}
        columns={visibleColumns}
        onGradeChange={handleGradeChange}
        onGradeCommit={handleGradeCommit}
        onOpenRubrica={(studentId, itemId) =>
          setRubricaAbierta({
            studentId,
            itemId,
            studentName: students.find((s) => s.id === studentId)?.name ?? '',
            itemName: columns.find((c) => c.key === itemId)?.header ?? '',
            itemValorMaximo: columns.find((c) => c.key === itemId)?.valorMaximo ?? 100,
          })
        }
      />

      <div className="mt-3.5 flex flex-wrap items-center gap-3.5 text-[13px] font-semibold text-[#64748B]">
        {LEGEND.map(({ key, dot, label }) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: dot }} />
            {distribution[key]} {label}
          </div>
        ))}
        <div className="ml-auto text-[#94A3B8]">
          Promedio del grupo ·{' '}
          <span className="text-[15px] font-extrabold text-[#0F172A]">{groupAvg != null ? groupAvg.toFixed(1) : '—'}</span>
        </div>
      </div>

      {rubricaAbierta && (
        <RubricaGradingModal
          group={group}
          grupoId={group.id}
          matriculaId={rubricaAbierta.studentId}
          itemId={rubricaAbierta.itemId}
          itemName={rubricaAbierta.itemName}
          itemValorMaximo={rubricaAbierta.itemValorMaximo}
          periodoLectivoId={periodoLectivoId}
          studentName={rubricaAbierta.studentName}
          onClose={() => setRubricaAbierta(null)}
          onSaved={reloadGroup}
        />
      )}
    </>
  );
}

export default GradesTab;
