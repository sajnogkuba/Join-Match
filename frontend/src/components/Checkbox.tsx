import { motion } from "framer-motion";
import { Check } from "lucide-react";

type CheckboxProps = {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function Checkbox({ id, label, checked, onChange }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-3 cursor-pointer select-none group mt-2"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="hidden"
      />

      <motion.span
        initial={false}
        animate={{
          backgroundColor: checked ? "rgb(139 92 246 / 0.15)" : "transparent",
          borderColor: checked ? "rgb(139 92 246)" : "rgb(63 63 70)",
        }}
        transition={{ duration: 0.2 }}
        className="w-6 h-6 flex items-center justify-center border rounded-md"
      >
        {checked && (
          <Check
            size={16}
            className="text-violet-400"
            strokeWidth={3}
          />
        )}
      </motion.span>

      <span className="text-zinc-300 text-sm group-hover:text-white transition">
        {label}
      </span>
    </label>
  );
}
