type CheckboxProps = {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const Checkbox = ({ id, label, checked, onChange }: CheckboxProps)=> {
  return (
    <label htmlFor={id} className="flex items-center gap-3 cursor-pointer select-none">
      <span className="text-gray-400 text-sm mb-1 block">{label}</span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="hidden"
      />
      <span
        className={`
          w-8 h-8 flex items-center justify-center rounded-md border-3 bg-white
          ${checked ? "border-purple-600 text-purple-600" : "border-purple-600 text-transparent"}
        `}
      >
        {/* Ikona X */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 24 24"
          stroke="currentColor"
          fill="none"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
    </label>
  );
}

export default Checkbox;
