import React, { useState } from "react";
import { motion } from "framer-motion";

type StarRatingProps = {
  value: number;
  onChange: (v: number) => void;
  max?: number;
  size?: number;
  readOnly?: boolean;
  label?: string;
};

export default function StarRatingInput({
  value,
  onChange,
  max = 5,
  size = 30,
  readOnly = false,
  label,
}: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const active = hover ?? value;

  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (readOnly) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(max, (value || 0) + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(0, (value || 0) - 1));
    } else if (/^[1-9]$/.test(e.key)) {
      const n = Math.min(max, parseInt(e.key, 10));
      onChange(n);
    } else if (e.key === "0") {
      onChange(0);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-zinc-400 text-sm block">{label}</label>
      )}

      <div
        role="radiogroup"
        aria-label={label ?? "Ocena gwiazdkowa"}
        tabIndex={readOnly ? -1 : 0}
        onKeyDown={handleKey}
        className="inline-flex items-center gap-2"
      >
        {Array.from({ length: max }, (_, i) => {
          const index = i + 1;
          const filled = index <= active;
          const selected = index === value;

          return (
            <motion.button
              key={index}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={readOnly}
              onMouseEnter={() => !readOnly && setHover(index)}
              onMouseLeave={() => !readOnly && setHover(null)}
              onFocus={() => !readOnly && setHover(index)}
              onBlur={() => !readOnly && setHover(null)}
              onClick={() => !readOnly && onChange(index)}
              className="focus:outline-none"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                className="block drop-shadow-sm"
                aria-hidden="true"
              >
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.88L18.18 22 12 18.6 5.82 22 7 14.15l-5-4.88 6.91-1.01L12 2z"
                  className={`transition-all duration-300 ${
                    filled
                      ? "fill-violet-500 drop-shadow-[0_0_6px_rgba(139,92,246,0.6)]"
                      : "fill-transparent stroke-zinc-400"
                  }`}
                  strokeWidth={filled ? 0 : 2}
                />
              </svg>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
