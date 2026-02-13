export type LayoutBlockId = string;
export type LayoutRowId = string;

export type LayoutBlock = {
  id: LayoutBlockId;
  type: string;
  content: unknown;
};

export type LayoutRow = {
  id: LayoutRowId;
  blocks: LayoutBlock[];
  /** Percentages summing to 100. Same length as `blocks`. */
  widths: number[];
};

export type LayoutSlide = {
  id: string;
  title: string;
  themeId: string;
  rows: LayoutRow[];
};
