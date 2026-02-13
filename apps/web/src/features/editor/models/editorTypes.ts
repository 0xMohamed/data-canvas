/**
 * Client snapshot model aligned with Document.data.
 * Single source of truth for the editor.
 */
export type EditorBlock = {
  id: string;
  type: string;
  content: unknown;
};

export type EditorRow = {
  id: string;
  blocks: EditorBlock[];
  /** Percentages summing to 100. Same length as `blocks`. */
  widths: number[];
};

export type EditorSlide = {
  id: string;
  title: string;
  themeId: string;
  rows: EditorRow[];
};

export type EditorSnapshot = {
  slides: EditorSlide[];
};

export type DocumentMeta = {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
};

export const DEFAULT_SNAPSHOT: EditorSnapshot = {
  slides: [
    {
      id: "slide_1",
      title: "Slide 1",
      themeId: "dark-editorial",
      rows: [
        {
          id: "row_1",
          blocks: [{ id: "b_1", type: "text", content: { text: "" } }],
          widths: [100],
        },
      ],
    },
  ],
};

export function emptySnapshot(): EditorSnapshot {
  return {
    slides: [
      {
        id: `slide_${nanoid(8)}`,
        title: "Slide 1",
        themeId: "dark-editorial",
        rows: [
          {
            id: `row_${nanoid(8)}`,
            blocks: [{ id: `b_${nanoid(8)}`, type: "text", content: { text: "" } }],
            widths: [100],
          },
        ],
      },
    ],
  };
}

function nanoid(length: number): string {
  return Math.random().toString(36).slice(2, 2 + length);
}
