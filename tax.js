// Fictional sandbox tax rules, deliberately separate from any real jurisdiction.
export function taxOffice(s) {
  return (s.taxOffice ??= {
    payable: 0,
    losses: [],
    history: [],
    totalPaid: 0,
    expired: 0,
  });
}
export function taxLiability(s) {
  return s.taxOffice?.payable || 0;
}
export function taxClose(s, income) {
  const t = taxOffice(s);
  const expired = t.losses
    .filter((l) => l.expires <= s.month)
    .reduce((n, l) => n + l.amount, 0);
  t.expired += expired;
  t.losses = t.losses.filter((l) => l.expires > s.month);
  let offset = 0;
  if (income < 0) t.losses.push({ amount: -income, expires: s.month + 120 });
  else {
    let allowed = income * 0.8;
    t.losses.sort((a, b) => a.expires - b.expires);
    for (const loss of t.losses) {
      const used = Math.min(allowed, loss.amount);
      loss.amount -= used;
      allowed -= used;
      offset += used;
      if (allowed <= 0) break;
    }
    t.losses = t.losses.filter((l) => l.amount > 1e-8);
  }
  const taxable = Math.max(0, income - offset),
    provision = taxable * s.world.policy.tax;
  t.payable += provision;
  const paid = s.month % 3 === 0 ? t.payable : 0;
  t.payable -= paid;
  t.totalPaid += paid;
  const record = {
    month: s.month,
    income,
    offset,
    taxable,
    rate: s.world.policy.tax,
    provision,
    paid,
    expired,
  };
  t.history.push(record);
  t.history = t.history.slice(-120);
  return record;
}
export function nextTaxMonth(s) {
  return s.month + (3 - (s.month % 3));
}
