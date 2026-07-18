import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CategoryFilterPills, GradesTable, buildGradeColumns, buildGradeFilters } from '../../../components/Groups/Grades';
import { getGradeStatus, computeWeightedAverage } from '../../../data/dummyGroups';

const LEGEND = [
  { key: 'ok', dot: '#16A34A', label: 'aprobados' },
  { key: 'limit', dot: '#D97706', label: 'al límite' },
  { key: 'risk', dot: '#DC2626', label: 'en riesgo' },
];

function GradesTab() {
  const { group } = useOutletContext();
  const [gradesByStudentId, setGradesByStudentId] = useState(() =>
    Object.fromEntries(group.students.map((s) => [s.id, { ...s.grades }])),
  );
  const [activeFilterKey, setActiveFilterKey] = useState('all');

  const columns = useMemo(() => buildGradeColumns(group.evaluationSchema), [group]);
  const filters = useMemo(() => buildGradeFilters(group.evaluationSchema), [group]);
  const activeFilter = filters.find((f) => f.key === activeFilterKey) ?? filters[0];
  const visibleColumns = activeFilter.columnKeys ? columns.filter((c) => activeFilter.columnKeys.includes(c.key)) : columns;

  // Recompute each student's average/status live from their (possibly edited) grades — the
  // group's own evaluation schema drives the weighting, so this stays correct if the schema changes.
  const liveStudents = group.students.map((student) => {
    const grades = gradesByStudentId[student.id];
    const studentLike = { grades, attendance: student.attendance };
    const avg = computeWeightedAverage(group.evaluationSchema, studentLike);
    return { ...student, grades, avg, status: getGradeStatus(avg) };
  });

  const distribution = liveStudents.reduce(
    (acc, s) => ({ ...acc, [s.status.key]: acc[s.status.key] + 1 }),
    { ok: 0, limit: 0, risk: 0 },
  );
  const groupAvg = liveStudents.reduce((sum, s) => sum + s.avg, 0) / liveStudents.length;

  const handleGradeChange = (studentId, key, value) =>
    setGradesByStudentId((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [key]: value === '' ? null : value },
    }));

  return (
    <>
      <CategoryFilterPills filters={filters} active={activeFilterKey} onChange={setActiveFilterKey} />

      <div className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-[#64748B]">
        <i className="ph ph-cursor-click text-[16px] text-[var(--brand)]" />
        Tocá cualquier celda y escribí la nota — el promedio se recalcula solo.
      </div>

      <GradesTable students={liveStudents} columns={visibleColumns} onGradeChange={handleGradeChange} />

      <div className="mt-3.5 flex flex-wrap items-center gap-3.5 text-[13px] font-semibold text-[#64748B]">
        {LEGEND.map(({ key, dot, label }) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: dot }} />
            {distribution[key]} {label}
          </div>
        ))}
        <div className="ml-auto text-[#94A3B8]">
          Promedio del grupo ·{' '}
          <span className="text-[15px] font-extrabold text-[#0F172A]">{groupAvg.toFixed(1)}</span>
        </div>
      </div>
    </>
  );
}

export default GradesTab;
