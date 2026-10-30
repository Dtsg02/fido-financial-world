// Earmarked procurement cash, consolidated as an asset, never as income.
export function treasury(b) {
  return (b.treasury ??= { enabled: false, cash: 0, target: 0, floor: 0, automatic: false, funded: 0, spent: 0 });
}
export function reservedCash(s) {
  return s.businesses.reduce((sum, b) => sum + (b.treasury?.cash || 0), 0);
}
export function setTreasury(b, enabled, automatic, target, floor) {
  if (typeof enabled !== 'boolean' || typeof automatic !== 'boolean' || ![target, floor].every(x => Number.isFinite(x) && x >= 0 && x <= 1e12)) return false;
  Object.assign(treasury(b), { enabled, automatic, target, floor });
  return true;
}
export function transferCash(s, b, amount) {
  if (!s.businesses.includes(b) || !Number.isFinite(amount) || amount === 0) return false;
  const t = treasury(b);
  if (amount > 0 ? amount > s.cash : -amount > t.cash) return false;
  s.cash -= amount;
  t.cash += amount;
  return true;
}
export function fundTreasuries(s) {
  for (const b of s.businesses) Object.assign(treasury(b), { funded: 0, spent: 0 });
  const rows = s.businesses.filter(b => b.treasury.enabled && b.treasury.automatic);
  // A common pool honors the most conservative parent cash floor; proportional
  // funding avoids giving earlier-created companies an accidental priority.
  const floor = Math.max(0, ...rows.map(b => b.treasury.floor));
  const need = rows.reduce((sum, b) => sum + Math.max(0, b.treasury.target - b.treasury.cash), 0);
  const ratio = need ? Math.min(1, Math.max(0, s.cash - floor) / need) : 0;
  for (const b of rows) {
    const t = b.treasury, amount = Math.min(Math.max(0, s.cash - floor), Math.max(0, t.target - t.cash) * ratio);
    t.cash += amount; s.cash -= amount; t.funded = amount;
  }
}
export function procurementCash(s, b) {
  return b.treasury?.enabled ? b.treasury.cash : s.cash;
}
export function payProcurement(s, b, amount) {
  if (!Number.isFinite(amount) || amount < 0 || amount > procurementCash(s, b) + 1e-8) return false;
  if (b.treasury?.enabled) { b.treasury.cash = Math.max(0, b.treasury.cash - amount); b.treasury.spent += amount; }
  else s.cash -= amount;
  return true;
}
