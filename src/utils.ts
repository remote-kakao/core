export function tryParse(str: string) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}
