const HH_MM_REGEX = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;

/**
 * Converte string HH:mm em minutos desde meia-noite.
 * Fórmula: minutes = (hours * 60) + minutes
 * Ex: '07:00' => 420, '07:50' => 470
 */
export function timeToMinutes(timeStr: string): number {
  const match = timeStr.trim().match(HH_MM_REGEX);
  if (!match) {
    throw new Error(`Invalid time format: ${timeStr}. Use HH:mm`);
  }
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  return hours * 60 + minutes;
}

/**
 * Verifica se dois intervalos [start1, end1) e [start2, end2) se sobrepõem.
 * start/end são strings HH:mm (convertidas para minutos internamente).
 * Intervalo é fechado no início e aberto no fim (end não inclui o minuto final).
 */
export function timeRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string,
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && s2 < e1;
}
