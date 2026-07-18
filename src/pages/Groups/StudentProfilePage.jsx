import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/Globales';
import {
  StudentIdentityCard,
  CategoryBreakdownCard,
  AttendanceHistoryCard,
} from '../../components/Groups/StudentProfile';
import { DUMMY_GROUPS } from '../../data/dummyGroups';

function StudentProfilePage() {
  const { groupId, studentId } = useParams();
  const group = DUMMY_GROUPS.find((g) => String(g.id) === groupId);
  const student = group?.students.find((s) => String(s.id) === studentId);

  if (!group || !student) {
    return (
      <>
        <PageHeader title="Estudiante no encontrado" crumb="Grupos" showBack />
        <div className="flex flex-1 items-center justify-center px-6 py-16 text-center text-[15px] font-semibold text-[#94A3B8]">
          No encontramos ese estudiante. Puede que haya sido eliminado del grupo.
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader crumb={group.name} title={student.name} showBack />

      <div className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
        <div className="mb-[18px] flex flex-wrap items-start gap-[18px]">
          <div className="flex-[2] min-w-[300px]">
            <StudentIdentityCard student={student} group={group} />
          </div>
          <div className="min-w-[240px] flex-1">
            <CategoryBreakdownCard schema={group.evaluationSchema} student={student} />
          </div>
        </div>

        <AttendanceHistoryCard student={student} />
      </div>
    </>
  );
}

export default StudentProfilePage;
