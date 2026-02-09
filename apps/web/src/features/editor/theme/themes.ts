export type SlideTheme = {
  id: 'dark-editorial' | 'light-editorial' | 'high-contrast'
  name: string
  editorBg: string
  slideBg: string
  surface: string
  text: string
  muted: string
  accent: string
  gridLine: string
}

export const slideThemes: SlideTheme[] = [
  {
    id: 'dark-editorial',
    name: 'Dark Editorial',
    editorBg: 'hsl(222 24% 6%)',
    slideBg: 'hsl(222 24% 8%)',
    surface: 'hsl(222 20% 12%)',
    text: 'hsl(0 0% 98%)',
    muted: 'hsl(215 16% 70%)',
    accent: 'hsl(266 100% 70%)',
    gridLine: 'hsla(0 0% 100% / 0.06)',
  },
  {
    id: 'light-editorial',
    name: 'Light Editorial',
    editorBg: 'hsl(0 0% 98%)',
    slideBg: 'hsl(0 0% 100%)',
    surface: 'hsl(240 5% 96%)',
    text: 'hsl(240 10% 4%)',
    muted: 'hsl(240 4% 46%)',
    accent: 'hsl(221 83% 53%)',
    gridLine: 'hsla(240 10% 4% / 0.06)',
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    editorBg: 'hsl(0 0% 0%)',
    slideBg: 'hsl(0 0% 0%)',
    surface: 'hsl(0 0% 8%)',
    text: 'hsl(0 0% 100%)',
    muted: 'hsl(0 0% 85%)',
    accent: 'hsl(54 100% 55%)',
    gridLine: 'hsla(0 0% 100% / 0.10)',
  },
]

export function getSlideTheme(id: SlideTheme['id']) {
  return slideThemes.find((t) => t.id === id) ?? slideThemes[0]
}
