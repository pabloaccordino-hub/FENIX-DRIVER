export function hoursBetween(start, now = new Date()) {
  const startDate = start instanceof Date ? start : new Date(start);
  const nowDate = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(nowDate.getTime()) || nowDate < startDate) return 0;
  return (nowDate.getTime() - startDate.getTime()) / 3600000;
}
