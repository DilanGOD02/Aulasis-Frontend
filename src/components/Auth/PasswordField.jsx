import { useState } from 'react';

/** Password input with a show/hide toggle — reused across login, register and reset. */
function PasswordField({ label, value, onChange, placeholder = '••••••••' }) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-bold text-[#475569]">{label}</label>
      <div className="flex items-center gap-2.5 rounded-[12px] border border-[#E2E8F0] px-3.5 py-3 focus-within:border-[var(--brand)]">
        <i className="ph ph-lock-simple shrink-0 text-[18px] text-[#94A3B8]" />
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 border-none bg-transparent text-[14.5px] font-medium text-[#1E293B] outline-none"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="shrink-0 text-[#CBD5E1]"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          <i className={`ph ${visible ? 'ph-eye-slash' : 'ph-eye'} text-[18px]`} />
        </button>
      </div>
    </div>
  );
}

export default PasswordField;
