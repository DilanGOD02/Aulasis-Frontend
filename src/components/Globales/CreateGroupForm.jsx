import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DUMMY_TEMPLATES } from '../../data/dummyTemplates';

const PERIODS = ['I Periodo', 'II Periodo', 'III Periodo'];
const DAYS = [
  { key: 'L', label: 'Lunes' },
  { key: 'K', label: 'Martes' },
  { key: 'M', label: 'Miércoles' },
  { key: 'J', label: 'Jueves' },
  { key: 'V', label: 'Viernes' },
];
const COLORS = ['#6366F1', '#0D9488', '#22C55E', '#F59E0B', '#EF4444', '#A855F7', '#0EA5E9', '#6D28D9'];

const emptySchedule = () => Object.fromEntries(DAYS.map((d) => [d.key, { enabled: false, from: '07:00', to: '08:20' }]));

/**
 * The "Crear grupo" form: name, period, weekly schedule, color, and starting
 * evaluation schema (picked from an existing template). Reused by both the
 * Navbar's "Crear grupo" button and the MainScreen's "Crear nuevo grupo" card
 * — both just navigate to the page that renders this form.
 */
function CreateGroupForm() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [period, setPeriod] = useState('II Periodo');
  const [schedule, setSchedule] = useState(emptySchedule);
  const [color, setColor] = useState(COLORS[0]);
  const [templateId, setTemplateId] = useState(DUMMY_TEMPLATES[0].id);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  const activeDays = DAYS.filter((d) => schedule[d.key].enabled);
  const template = DUMMY_TEMPLATES.find((t) => t.id === templateId);

  const toggleDay = (key) =>
    setSchedule((prev) => ({ ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }));
  const setDayTime = (key, field, value) =>
    setSchedule((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-start gap-[18px]">
      <div className="flex-[2] min-w-[300px] rounded-2xl border border-[#EEF1F6] bg-white p-5 sm:p-6">
        <label className="mb-2 block text-[13px] font-bold text-[#475569]">Nombre del grupo</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. 10-A · Matemática"
          className="mb-5 w-full rounded-[11px] border border-[#E2E8F0] px-3.5 py-3 text-[14.5px] font-semibold text-[#1E293B] outline-none focus:border-[var(--brand)]"
        />

        <label className="mb-2 block text-[13px] font-bold text-[#475569]">Periodo</label>
        <div className="mb-5 flex rounded-[11px] bg-[#EEF2F7] p-[3px]">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`press flex-1 rounded-[9px] py-2.5 text-[13.5px] font-bold ${
                period === p ? 'bg-white text-[#1E293B] shadow-sm' : 'text-[#64748B]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <label className="mb-1 block text-[13px] font-bold text-[#475569]">Horario de clases</label>
        <p className="mb-2.5 text-[12px] font-medium text-[#94A3B8]">
          Activá los días y tocá las horas para ajustar desde/hasta.
        </p>
        <div className="mb-3 flex gap-2">
          {DAYS.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => toggleDay(d.key)}
              className={`press flex h-9 w-9 items-center justify-center rounded-[10px] text-[13px] font-extrabold ${
                schedule[d.key].enabled ? 'bg-[var(--brand)] text-white' : 'bg-[#EEF2F7] text-[#94A3B8]'
              }`}
            >
              {d.key}
            </button>
          ))}
        </div>

        <div className="mb-5 flex flex-col gap-2.5">
          {activeDays.map((d) => (
            <div
              key={d.key}
              className="flex flex-wrap items-center gap-2.5 rounded-[12px] border border-[#E2E8F0] px-3.5 py-2.5"
            >
              <span className="w-[70px] shrink-0 text-[13.5px] font-bold text-[#334155]">{d.label}</span>
              <input
                type="time"
                value={schedule[d.key].from}
                onChange={(e) => setDayTime(d.key, 'from', e.target.value)}
                className="rounded-lg border border-[#E2E8F0] px-2 py-1.5 text-[13.5px] font-semibold text-[#1E293B] outline-none"
              />
              <span className="text-[#94A3B8]">–</span>
              <input
                type="time"
                value={schedule[d.key].to}
                onChange={(e) => setDayTime(d.key, 'to', e.target.value)}
                className="rounded-lg border border-[#E2E8F0] px-2 py-1.5 text-[13.5px] font-semibold text-[#1E293B] outline-none"
              />
            </div>
          ))}
        </div>

        <label className="mb-1 block text-[13px] font-bold text-[#475569]">Color identificador del grupo</label>
        <p className="mb-2.5 text-[12px] font-medium text-[#94A3B8]">
          Este color identificará al grupo en todas las pantallas.
        </p>
        <div className="mb-5 flex flex-wrap gap-2.5">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="press flex h-9 w-9 items-center justify-center rounded-full"
              style={{ background: c }}
            >
              {color === c && <i className="ph-bold ph-check text-[16px] text-white" />}
            </button>
          ))}
        </div>

        <label className="mb-2 block text-[13px] font-bold text-[#475569]">Esquema de evaluación</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTemplatePicker((v) => !v)}
            className="press flex w-full items-center gap-3 rounded-[12px] border border-[#E2E8F0] px-3.5 py-3 text-left"
          >
            <i className="ph-bold ph-sliders-horizontal shrink-0 text-[18px] text-[var(--brand)]" />
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-extrabold text-[#1E293B]">
                {template.name} · {template.categories.length} categorías
              </div>
              <div className="truncate text-[12px] font-semibold text-[var(--brand)]">
                {template.categories.map((c) => c.name).join(', ')}
              </div>
            </div>
            <i className={`ph-bold ${showTemplatePicker ? 'ph-caret-up' : 'ph-caret-down'} shrink-0 text-[14px] text-[#94A3B8]`} />
          </button>

          {showTemplatePicker && (
            <div className="absolute z-10 mt-1.5 w-full rounded-[12px] border border-[#EEF1F6] bg-white p-1.5 shadow-[0_20px_44px_-16px_rgba(16,24,40,0.34)]">
              {DUMMY_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTemplateId(t.id);
                    setShowTemplatePicker(false);
                  }}
                  className={`press flex w-full items-center justify-between rounded-[9px] px-3 py-2.5 text-left text-[13.5px] font-bold ${
                    t.id === templateId ? 'bg-[#F5F7FA] text-[#0F172A]' : 'text-[#475569]'
                  }`}
                >
                  {t.name}
                  {t.id === templateId && <i className="ph-bold ph-check text-[15px] text-[var(--brand)]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="min-w-[240px] flex-1">
        <div className="mb-3.5 rounded-2xl border border-[#EEF1F6] bg-white p-5">
          <div className="mb-2 text-[11.5px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
            Vista previa
          </div>
          <div className="rounded-[10px] border-l-4 bg-[#FAFBFD] p-3" style={{ borderColor: color }}>
            <div className="text-[15px] font-extrabold text-[#0F172A]">{name || 'Nombre del grupo'}</div>
            <div className="text-[12.5px] font-semibold text-[#94A3B8]">0 estudiantes</div>
          </div>
        </div>

        <div className="mb-3.5 rounded-2xl border border-[#EEF1F6] bg-white p-5">
          <div className="mb-1.5 text-[13.5px] font-extrabold text-[#0F172A]">Siguiente paso</div>
          <p className="text-[13px] font-medium text-[#64748B]">
            Después de crear el grupo, podrás agregar estudiantes manualmente o importarlos desde un Excel.
          </p>
        </div>

        {activeDays.length > 0 && (
          <div className="mb-3.5 rounded-2xl border border-[#EEF1F6] bg-white p-5">
            <div className="mb-2.5 flex items-center gap-2 text-[13.5px] font-extrabold text-[#0F172A]">
              <i className="ph ph-calendar-blank text-[16px] text-[var(--brand)]" />
              Horario
            </div>
            <div className="flex flex-col gap-2">
              {activeDays.map((d) => (
                <div key={d.key} className="flex items-center justify-between text-[13px] font-semibold">
                  <span className="flex items-center gap-2 text-[#475569]">
                    <span className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-[var(--brand)] text-[10px] font-extrabold text-white">
                      {d.key}
                    </span>
                    {d.label}
                  </span>
                  <span className="text-[#94A3B8]">
                    {schedule[d.key].from} – {schedule[d.key].to}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand)] py-3.5 text-[15px] font-extrabold text-white shadow-[0_12px_26px_-10px_rgba(99,102,241,0.6)]"
        >
          <i className="ph-bold ph-plus text-[17px]" />
          Crear grupo
        </button>
      </div>
    </form>
  );
}

export default CreateGroupForm;
