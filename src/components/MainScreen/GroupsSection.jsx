import { useNavigate } from 'react-router-dom';
import GroupCard from './GroupCard';

/** "Mis grupos" heading + responsive card grid, with a dashed "create group" tile at the end. */
function GroupsSection({ groups }) {
  const navigate = useNavigate();

  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <div className="text-[19px] font-extrabold tracking-tight text-[#0F172A]">Mis grupos</div>
        <div className="text-[13px] font-semibold text-[#64748B]">{groups.length} grupos</div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}

        <div
          onClick={() => navigate('/grupos/crear')}
          className="press flex min-h-[150px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-[1.5px] border-dashed border-[#CBD8E8] px-4 py-6 text-center"
        >
          <div className="mb-1 flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#EEF2F7]">
            <i className="ph-bold ph-plus text-[22px] text-[#64748B]" />
          </div>
          <div className="text-[15px] font-extrabold text-[#1E293B]">Crear nuevo grupo</div>
          <div className="text-[12.5px] font-medium text-[#94A3B8]">Configura horario y evaluación</div>
        </div>
      </div>
    </div>
  );
}

export default GroupsSection;
