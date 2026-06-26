import { motion, useReducedMotion } from "motion/react";
import { useShohay } from "../../lib/store";
import { divisions } from "../../lib/data";

// Stylized river/delta network of Bangladesh. Not a literal map — a calm,
// legible metaphor: aid flows along the rivers and units light up by coverage.
const RIVERS = [
  "M50 2 C 48 18, 56 26, 54 40 C 52 56, 58 70, 50 96",
  "M44 14 C 40 30, 34 40, 36 54 C 38 66, 34 80, 40 96",
  "M78 28 C 70 38, 66 48, 60 56 C 54 64, 52 78, 50 92",
  "M30 36 C 38 46, 46 50, 52 58 C 60 66, 70 70, 80 82",
  "M58 30 C 56 44, 52 52, 50 62",
];

// soft radial fade so the scene blends into the page instead of reading as a hard square
const FADE_MASK =
  "radial-gradient(ellipse 75% 75% at 60% 45%, #000 35%, rgba(0,0,0,0.45) 62%, transparent 85%)";

export function DeltaScene({ className = "" }: { className?: string }) {
  const { theme } = useShohay();
  // Lite tier: honour the OS "reduce motion" setting — render the calm final
  // state instead of the looping river/ping animations (battery + low-end cost).
  const reduce = useReducedMotion();

  return (
    <div
      className={`pointer-events-none h-full w-full ${className}`}
      style={{
        WebkitMaskImage: FADE_MASK,
        maskImage: FADE_MASK,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full"
        role="img"
        aria-label="Stylized river delta of Bangladesh with relief flowing to districts"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="delta-glow" cx="60%" cy="45%" r="60%">
            <stop offset="0%" stopColor="var(--river-2)" stopOpacity={theme === "dark" ? 0.28 : 0.16} />
            <stop offset="100%" stopColor="var(--river-2)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="river-stroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--river-2)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--river)" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        <rect x="-20" y="-20" width="140" height="140" fill="url(#delta-glow)" />

        {/* faint topographic contour rings */}
        {[14, 26, 38, 50].map((r) => (
          <circle key={r} cx="58" cy="46" r={r} fill="none" stroke="var(--river)" strokeOpacity="0.06" strokeWidth="0.4" />
        ))}

        {/* river network */}
        {RIVERS.map((d, i) => (
          <g key={i}>
            <path d={d} fill="none" stroke="url(#river-stroke)" strokeWidth="0.9" strokeLinecap="round" />
            {!reduce && (
              <motion.path
                d={d}
                fill="none"
                stroke="var(--river-2)"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeDasharray="2 10"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: -120 }}
                transition={{ duration: 6 + i, repeat: Infinity, ease: "linear" }}
                style={{ filter: "drop-shadow(0 0 1.5px var(--river-2))" }}
              />
            )}
          </g>
        ))}

        {/* division nodes light up by coverage */}
        {divisions.map((u, i) => {
          const lit = u.fulfillment / 100;
          return (
            <g key={u.geocode}>
              <motion.circle
                cx={u.x}
                cy={u.y}
                r={2.4}
                fill="var(--river)"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.12, duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
                style={{ opacity: 0.35 + lit * 0.6 }}
              />
              {!reduce && (
                <motion.circle
                  cx={u.x}
                  cy={u.y}
                  r={2.4}
                  fill="none"
                  stroke="var(--river-2)"
                  strokeWidth="0.5"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 3, opacity: 0 }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
