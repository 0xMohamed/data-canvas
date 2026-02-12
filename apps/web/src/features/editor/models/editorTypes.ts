/**
 * Client snapshot model aligned with Document.data.
 * Single source of truth for the editor.
 */
export type EditorBlock = {
  id: string;
  type: string;
  content: unknown;
  x: number;
  y: number;
};

export type EditorSlide = {
  id: string;
  title: string;
  themeId: string;
  blocks: EditorBlock[];
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
      blocks: [],
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
        blocks: [],
      },
    ],
  };
}

function nanoid(length: number): string {
  return Math.random().toString(36).slice(2, 2 + length);
}
