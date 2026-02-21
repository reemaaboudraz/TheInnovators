export function formatArrivalTimeFromNow(durationSec: number): string {
  const d = new Date(Date.now() + durationSec * 1000);
  const h = d.getHours();
  const m = d.getMinutes();
  return `${h}:${String(m).padStart(2, "0")}`;
}

export function secondsToMinutesString(seconds: number): string {
  return String(Math.max(1, Math.round(seconds / 60)));
}

export function metersToKmString(meters: number): string {
  const km = meters / 1000;
  return km >= 10 ? km.toFixed(0) : km.toFixed(1);
}
