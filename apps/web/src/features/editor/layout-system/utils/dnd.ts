export type DropAxis = 'horizontal' | 'vertical';

export type DropTarget =
  | {
      kind: 'new-row';
      rowIndex: number;
      edge: 'before' | 'after';
    }
  | {
      kind: 'row-reorder';
      rowIndex: number;
      edge: 'before' | 'after';
    }
  | {
      kind: 'in-row';
      rowIndex: number;
      blockIndex: number;
      edge: 'before' | 'after';
      axis: DropAxis;
    };

export function pickDropTarget(params: {
  mode: 'block' | 'toolbar' | 'row';
  point: { x: number; y: number };
  rowRects: Array<{ top: number; bottom: number; left: number; right: number } | null>;
  blockRectsByRow: Array<Array<{ left: number; right: number; top: number; bottom: number } | null>>;
  maxBlocksPerRow: number;
  blocksCountByRow: number[];
}): DropTarget | null {
  const { mode, point, rowRects, blockRectsByRow, maxBlocksPerRow, blocksCountByRow } = params;

  const rows = rowRects
    .map((r, i) => ({ r, i }))
    .filter((x): x is { r: { top: number; bottom: number; left: number; right: number }; i: number } => Boolean(x.r));

  if (rows.length === 0) return null;

  // Prefer an in-row hit.
  let rowIndex = rows.find((x) => point.y >= x.r.top && point.y <= x.r.bottom)?.i ?? -1;

  // If pointer is not inside any row, allow targets in gaps / above / below.
  if (rowIndex === -1) {
    const first = rows[0];
    const last = rows[rows.length - 1];

    if (point.y < first.r.top) {
      rowIndex = first.i;
    } else if (point.y > last.r.bottom) {
      rowIndex = last.i;
    } else {
      // Between rows: find the closest boundary.
      let best:
        | { dist: number; rowIndex: number }
        | null = null;
      for (const { r, i } of rows) {
        const dTop = Math.abs(point.y - r.top);
        const dBottom = Math.abs(point.y - r.bottom);
        const d = Math.min(dTop, dBottom);
        if (!best || d < best.dist) best = { dist: d, rowIndex: i };
      }
      rowIndex = best?.rowIndex ?? first.i;
    }
  }

  const row = rowRects[rowIndex];
  if (!row) return null;

  if (mode === 'row') {
    const midY = (row.top + row.bottom) / 2;
    return {
      kind: 'row-reorder',
      rowIndex,
      edge: point.y < midY ? 'before' : 'after',
    };
  }

  // If pointer is outside all rows, treat above-first/below-last as new-row insertion.
  const firstRow = rows[0].r;
  const lastRow = rows[rows.length - 1].r;
  if (point.y < firstRow.top) {
    return { kind: 'new-row', rowIndex: rows[0].i, edge: 'before' };
  }
  if (point.y > lastRow.bottom) {
    return { kind: 'new-row', rowIndex: rows[rows.length - 1].i, edge: 'after' };
  }

  const rowHeight = Math.max(1, row.bottom - row.top);
  const verticalEdgeZone = rowHeight * 0.22;

  // Intent: new row insertion when close to top/bottom edge of the row.
  if (point.y <= row.top + verticalEdgeZone) {
    return { kind: 'new-row', rowIndex, edge: 'before' };
  }
  if (point.y >= row.bottom - verticalEdgeZone) {
    return { kind: 'new-row', rowIndex, edge: 'after' };
  }

  const blocksCount = blocksCountByRow[rowIndex] ?? 0;

  // If the row is full, disallow in-row insertion and fallback to "after" new row.
  if (blocksCount >= maxBlocksPerRow) {
    return { kind: 'new-row', rowIndex, edge: 'after' };
  }

  const blockRects = blockRectsByRow[rowIndex] ?? [];
  if (blockRects.length === 0) {
    return {
      kind: 'in-row',
      rowIndex,
      blockIndex: 0,
      edge: 'after',
      axis: 'horizontal',
    };
  }

  // Horizontal intent inside row: use block centers for stable between-block insertion.
  // This avoids jitter when hovering near adjacent edges.
  const rects = blockRects
    .map((r, i) => ({ r, i }))
    .filter((x): x is { r: { left: number; right: number; top: number; bottom: number }; i: number } => Boolean(x.r));

  if (rects.length === 0) {
    return { kind: 'new-row', rowIndex, edge: 'after' };
  }

  for (const { r, i } of rects) {
    const midX = (r.left + r.right) / 2;
    if (point.x < midX) {
      return {
        kind: 'in-row',
        rowIndex,
        blockIndex: i,
        edge: 'before',
        axis: 'horizontal',
      };
    }
  }

  const lastIndex = rects[rects.length - 1]?.i ?? 0;
  return {
    kind: 'in-row',
    rowIndex,
    blockIndex: lastIndex,
    edge: 'after',
    axis: 'horizontal',
  };
}
