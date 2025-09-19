import React, { useState } from "react";

type StarRatingProps = {
  value: number;              // 0..max
  onChange: (v: number) => void;
  max?: number;               // domyślnie 5
  size?: number;              // px
  readOnly?: boolean;
  label?: string;             // np. "Minimalny stopień zaawansowania"
};

export default function StarRatingInput({
                                     value,
                                     onChange,
                                     max = 5,
                                     size = 28,
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
        <label className="text-gray-400 text-sm mb-1 block">{label}</label>
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

          return (
            <button
              key={index}
              type="button"
              role="radio"
              aria-checked={index === value}
              title={`${index} / ${max}`}
              disabled={readOnly}
              onMouseEnter={() => !readOnly && setHover(index)}
              onMouseLeave={() => !readOnly && setHover(null)}
              onFocus={() => !readOnly && setHover(index)}
              onBlur={() => !readOnly && setHover(null)}
              onClick={() => !readOnly && onChange(index)}
              className="p-0.5 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
            >
              {/* SVG gwiazdy: wypełniona lub tylko obrys */}
              <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                className="block"
                aria-hidden="true"
              >
                {filled ? (
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.88L18.18 22 12 18.6 5.82 22 7 14.15l-5-4.88 6.91-1.01L12 2z"
                    className="fill-purple-600"
                  />
                ) : (
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.88L18.18 22 12 18.6 5.82 22 7 14.15l-5-4.88 6.91-1.01L12 2z"
                    className="fill-transparent stroke-white"
                    strokeWidth={2}
                  />
                )}
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}
