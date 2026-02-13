export const MIN_COL_PERCENT = 8;

function sum(values: number[]) {
  return values.reduce((a, b) => a + b, 0);
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function normalizeTo100(values: number[]) {
  const total = sum(values);
  if (total === 0) return values;
  const scaled = values.map((v) => (v / total) * 100);

  // Avoid floating drift by fixing the last cell.
  const fixed = scaled.slice(0, -1);
  const last = 100 - sum(fixed);
  return [...fixed, last];
}

export function resizeRowWidths(params: {
  widths: number[];
  dividerIndex: number; // between dividerIndex and dividerIndex+1
  deltaPercent: number; // + means grow left, shrink right
  minPercent?: number;
}): number[] {
  return resizeRowWidthsWithMeta(params).widths;
}

export function resizeRowWidthsWithMeta(params: {
  widths: number[];
  dividerIndex: number; // between dividerIndex and dividerIndex+1
  deltaPercent: number; // + means grow left, shrink right
  minPercent?: number;
}): { widths: number[]; clamped: boolean } {
  const { widths, dividerIndex, deltaPercent } = params;
  const minPercent =
    params.minPercent ??
    (widths.length >= 4 ? 6 : widths.length === 3 ? 7 : MIN_COL_PERCENT);

  if (widths.length < 2) return { widths, clamped: false };
  if (dividerIndex < 0 || dividerIndex >= widths.length - 1) return { widths, clamped: false };

  const next = [...widths];

  const left = next[dividerIndex];
  const right = next[dividerIndex + 1];
  const pairTotal = left + right;

  // Keep the pair sum constant. Only adjust these two columns.
  // Clamp left so both columns stay >= minPercent.
  const maxLeft = Math.max(minPercent, pairTotal - minPercent);
  const nextLeft = clamp(left + deltaPercent, minPercent, maxLeft);
  const nextRight = pairTotal - nextLeft;

  const clamped = nextLeft !== left + deltaPercent;

  next[dividerIndex] = nextLeft;
  next[dividerIndex + 1] = nextRight;

  return { widths: normalizeTo100(next), clamped };
}
