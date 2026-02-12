export function generateBlockId(): string {
  return `b_${Math.random().toString(36).slice(2, 10)}`;
}

export function generateSlideId(): string {
  return `slide_${Math.random().toString(36).slice(2, 10)}`;
}
