/**
 * Normaliza valores de entorno (Docker/Compose a veces inyectan comillas).
 */
export function trimEnvQuotes(value: string | undefined): string {
  if (value == null) return '';
  return String(value)
    .replace(/^["']|["']$/g, '')
    .trim();
}

export function parseEnvInt(
  value: string | undefined,
  fallback: number,
): number {
  const cleaned = trimEnvQuotes(value);
  if (cleaned === '') return fallback;
  const n = Number.parseInt(cleaned.replace(/['"]/g, ''), 10);
  return Number.isFinite(n) ? n : fallback;
}

export function parseEnvBoolean(value: string | undefined): boolean {
  const v = trimEnvQuotes(value).toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}
