export function occurrenceCodeFromName(name: string): string {
  return name.trim().toLocaleLowerCase('pt-BR').replace(/\s+/g, '_');
}
