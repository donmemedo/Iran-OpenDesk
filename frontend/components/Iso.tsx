import type { Box } from "@/lib/api";

// Isometric renderer for furniture made of boxes [x, y, z, w, h, d] (cm, y up).
const C = Math.cos(Math.PI / 6);
const pt = (x: number, y: number, z: number) => `${((x - z) * C).toFixed(1)},${((x + z) / 2 - y).toFixed(1)}`;

/** Stretch along x (wide panels scale, narrow ones slide) and optionally explode parts outward. */
export function place(parts: Box[], explode = 0, stretch = 1): Box[] {
  const W = Math.max(...parts.map((p) => p[0] + p[3]));
  const bs = parts.map(([x, y, z, w, h, d]) =>
    w > W * 0.4 ? [x * stretch, y, z, w * stretch, h, d] : [(x + w / 2) * stretch - w / 2, y, z, w, h, d],
  );
  if (!explode) return bs;
  const c = [0, 1, 2].map((a) => (Math.min(...bs.map((b) => b[a])) + Math.max(...bs.map((b) => b[a] + b[a + 3]))) / 2);
  return bs.map((b, i) => {
    const k = Math.pow(explode, 1 + (i % 4) * 0.4); // staggered: parts arrive one after another
    return [
      b[0] + (b[0] + b[3] / 2 - c[0]) * k * 0.7,
      b[1] + (b[1] + b[4] / 2 - c[1]) * k * 0.9 + k * (18 + (i % 3) * 16),
      b[2] + (b[2] + b[5] / 2 - c[2]) * k * 1.6,
      b[3],
      b[4],
      b[5],
    ];
  });
}

// a must be painted before b: the first axis that separates them decides (viewer sits at +x +y +z).
function before(a: Box, b: Box) {
  for (const k of [0, 2, 1]) {
    if (a[k] + a[k + 3] <= b[k]) return true;
    if (b[k] + b[k + 3] <= a[k]) return false;
  }
  return a[0] + a[1] + a[2] < b[0] + b[1] + b[2];
}

function paintOrder(bs: Box[]) {
  const rest = bs.map((b, i) => ({ b, i }));
  const out: typeof rest = [];
  while (rest.length) {
    let j = rest.findIndex((r) => rest.every((o) => o === r || !before(o.b, r.b)));
    if (j < 0) j = 0; // cycle (overlapping parts): fall back to list order
    out.push(rest.splice(j, 1)[0]);
  }
  return out;
}

function bounds(sets: Box[][]) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const bs of sets)
    for (const [x, y, z, w, h, d] of bs) {
      x0 = Math.min(x0, (x - z - d) * C);
      x1 = Math.max(x1, (x + w - z) * C);
      y0 = Math.min(y0, (x + z) / 2 - y - h);
      y1 = Math.max(y1, (x + w + z + d) / 2 - y);
    }
  return [x0, y0, x1 - x0, y1 - y0];
}

type Props = {
  parts: Box[];
  color: string;
  explode?: number;
  stretch?: number;
  maxExplode?: number;
  maxStretch?: number;
  className?: string;
};

export function Iso({ parts, color, explode = 0, stretch = 1, maxExplode = 0, maxStretch = 1, className = "" }: Props) {
  const rest = place(parts, 0, stretch);
  const [x, y, w, h] = bounds([place(parts, 0, maxStretch), place(parts, maxExplode, maxStretch)]);
  const p = Math.max(w, h) * 0.05;
  const fx = [Math.min(...rest.map((b) => b[0])) - 4, Math.max(...rest.map((b) => b[0] + b[3])) + 4];
  const fz = [Math.min(...rest.map((b) => b[2])) - 4, Math.max(...rest.map((b) => b[2] + b[5])) + 4];
  return (
    <svg
      viewBox={`${x - p} ${y - p} ${w + 2 * p} ${h + 2 * p}`}
      className={`iso ${className}`}
      style={{ ["--mat" as string]: color }}
      aria-hidden
    >
      <polygon className="shadow" points={[pt(fx[0], 0, fz[0]), pt(fx[1], 0, fz[0]), pt(fx[1], 0, fz[1]), pt(fx[0], 0, fz[1])].join(" ")} />
      {paintOrder(place(parts, explode, stretch)).map(({ b: [x, y, z, w, h, d], i }) => (
        <g key={i}>
          <polygon className="t" points={`${pt(x, y + h, z)} ${pt(x + w, y + h, z)} ${pt(x + w, y + h, z + d)} ${pt(x, y + h, z + d)}`} />
          <polygon className="f" points={`${pt(x, y, z + d)} ${pt(x + w, y, z + d)} ${pt(x + w, y + h, z + d)} ${pt(x, y + h, z + d)}`} />
          <polygon className="s" points={`${pt(x + w, y, z)} ${pt(x + w, y, z + d)} ${pt(x + w, y + h, z + d)} ${pt(x + w, y + h, z)}`} />
        </g>
      ))}
    </svg>
  );
}
