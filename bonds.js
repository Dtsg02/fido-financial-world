import { sellerDebt } from "./acquisitions.js?v=8218e214890d";
import { taxLiability } from "./tax.js?v=8218e214890d";
import { tradeLiabilities } from "./commerce.js?v=8218e214890d";
export function bondMarket(s) {
  return (s.bondMarket ??= {
    nextId: 1,
    bonds: [],
    reports: [],
    expense: 0,
    cooldown: 0,
    restructures: 0,
  });
}
export function bondDebt(s) {
  return bondMarket(s).bonds.reduce((n, b) => n + b.balance, 0);
}
export function bondRating(s, nw) {
  const m = bondMarket(s),
    debt =
      s.debt +
      tradeLiabilities(s) +
      bondDebt(s) +
      sellerDebt(s) +
      taxLiability(s),
    assets = Math.max(1, nw + debt),
    leverage = debt / assets,
    avg =
      s.history.slice(-6).reduce((n, h) => n + h.profit, 0) /
      Math.max(1, Math.min(6, s.history.length)),
    coverage = avg > 0 ? (avg * 12) / Math.max(1, debt * s.rate) : 0;
  let score =
    85 -
    leverage * 65 +
    (coverage >= 3 ? 10 : coverage >= 1 ? 0 : -20) -
    (m.cooldown > s.month ? 25 : 0);
  const tier =
    score >= 80
      ? "AA"
      : score >= 65
        ? "A"
        : score >= 50
          ? "BBB"
          : score >= 35
            ? "BB"
            : "B";
  const spread = { AA: 0.015, A: 0.025, BBB: 0.04, BB: 0.065, B: 0.09 }[tier];
  return {
    tier,
    spread,
    leverage,
    coverage,
    limit: Math.max(0, Math.min(50000000, Math.max(0, nw) * 1.5) - bondDebt(s)),
  };
}
export function quoteBond(s, nw, amount, term) {
  const r = bondRating(s, nw),
    m = bondMarket(s);
  if (
    !Number.isInteger(amount) ||
    amount < 50000 ||
    amount > r.limit ||
    ![24, 60, 120].includes(term) ||
    s.month < 24 ||
    (s.empire?.corporate.rounds || 0) < 1 ||
    nw < 250000 ||
    m.cooldown > s.month ||
    m.bonds.length >= 8 ||
    m.bonds.some((b) => b.status === "distressed")
  )
    return null;
  return {
    coupon: Math.min(
      0.25,
      s.rate + r.spread + (term === 120 ? 0.015 : term === 60 ? 0.0075 : 0),
    ),
    fee: amount * 0.02,
    reserve: amount * 0.02,
    term,
    amount,
    rating: r.tier,
  };
}
function report(s, text) {
  const m = bondMarket(s);
  m.reports.unshift({ month: s.month, text });
  s.news.unshift({ month: s.month, title: "Bondholder update", text });
  s.news = s.news.slice(0, 15);
  m.reports = m.reports.slice(0, 40);
}
export function issueBond(s, nw, amount, term) {
  const q = quoteBond(s, nw, amount, term);
  if (!q) return false;
  const m = bondMarket(s);
  s.cash += amount - q.fee;
  m.bonds.push({
    id: m.nextId++,
    principal: amount,
    balance: amount,
    coupon: q.coupon,
    issued: s.month,
    maturity: s.month + term,
    reserve: q.reserve,
    breaches: 0,
    missed: 0,
    stepped: false,
    status: "performing",
    rating: q.rating,
  });
  report(
    s,
    `Issued $${amount.toLocaleString()} of ${term}-month bonds at ${(q.coupon * 100).toFixed(2)}%; 2% underwriting fee deducted.`,
  );
  return true;
}
export function repayBond(s, id) {
  const m = bondMarket(s),
    b = m.bonds.find((b) => b.id === id);
  if (!b) return false;
  const premium = s.month < b.maturity ? b.balance * 0.01 : 0;
  if (s.cash < b.balance + premium) return false;
  s.cash -= b.balance + premium;
  m.bonds = m.bonds.filter((x) => x !== b);
  report(
    s,
    "Bond redeemed in full" +
      (premium ? " with a 1% early redemption premium." : "."),
  );
  return true;
}
export function restructureBond(s, id, nw) {
  const m = bondMarket(s),
    b = m.bonds.find((b) => b.id === id),
    corp = s.empire?.corporate;
  if (!b || b.status !== "distressed" || !corp || s.cash < b.balance * 0.2)
    return false;
  const total = corp.founderShares + corp.publicShares,
    price = Math.max(25000, nw + b.balance) / total,
    newShares = Math.ceil((b.balance * 0.8) / price);
  s.cash -= b.balance * 0.2;
  corp.publicShares += newShares;
  m.bonds = m.bonds.filter((x) => x !== b);
  m.cooldown = s.month + 24;
  m.restructures++;
  for (const firm of s.businesses)
    firm.reputation = Math.max(30, firm.reputation - 15);
  report(
    s,
    `Debt-for-equity restructuring: paid 20% in cash and issued ${newShares.toLocaleString()} outside shares for the other 80%. New bond issuance frozen for 24 months; business reputation −15.`,
  );
  return true;
}
export function beforeBondMonth(s, nw) {
  const m = bondMarket(s);
  m.expense = 0;
  for (const b of [...m.bonds]) {
    const previousStatus = b.status;
    const coupon = (b.balance * b.coupon) / 12;
    m.expense += coupon;
    if (s.cash >= coupon) {
      s.cash -= coupon;
      b.missed = 0;
    } else {
      b.balance += coupon;
      b.missed++;
      report(s, `Bond ${b.id}: coupon unpaid and added to principal.`);
    }
    const rating = bondRating(s, nw);
    if (s.cash < b.reserve || rating.leverage > 0.7) b.breaches++;
    else b.breaches = 0;
    if (b.breaches >= 3 && !b.stepped) {
      b.coupon = Math.min(0.3, b.coupon + 0.03);
      b.stepped = true;
      report(
        s,
        `Bond ${b.id}: three consecutive covenant breaches triggered a permanent 3 percentage-point coupon increase.`,
      );
    }
    if (s.month >= b.maturity) {
      if (s.cash >= b.balance) {
        s.cash -= b.balance;
        m.bonds = m.bonds.filter((x) => x !== b);
        report(s, `Bond ${b.id} repaid at maturity.`);
        continue;
      }
      b.status = "distressed";
    } else if (b.missed >= 2) b.status = "distressed";
    else if (b.status !== "distressed")
      b.status = b.breaches ? "watchlist" : "performing";
    if (b.status === "distressed" && previousStatus !== "distressed")
      report(
        s,
        `Bond ${b.id} is distressed. New bond issuance is blocked; redeem or negotiate a debt-for-equity restructuring.`,
      );
  }
}
