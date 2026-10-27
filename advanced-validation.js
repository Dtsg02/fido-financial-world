import { DECISIONS } from "./decisions.js?v=5183cae63dc0";
import { FACILITY_MODULES } from "./facilities.js?v=5183cae63dc0";
import { SUPPLY_HOUSES, routeAllowed } from "./commerce.js?v=5183cae63dc0";
import { TYPES } from "./catalog.js?v=5183cae63dc0";
import { ROLES, RESEARCH, MACRO_EVENTS } from "./empire.js?v=5183cae63dc0";
import { REGIONS, MEGAPROJECTS, DYNASTY_UPGRADES, SCENARIOS } from "./late.js?v=5183cae63dc0";
const obj = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const n = (x, min = 0, max = 1e100) =>
  Number.isFinite(x) && x >= min && x <= max;
const i = (x, min = 0, max = 1e12) =>
  Number.isInteger(x) && x >= min && x <= max;
const txt = (x) => typeof x === "string" && x.length <= 10000;
const id = (x) => typeof x === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(x);
const arr = (x, f, max = 10000) =>
  Array.isArray(x) && x.length <= max && x.every(f);
const four = (x) => arr(x, (y) => n(y), 4) && x.length === 4;
const sector = (x) => TYPES.some((t) => t.id === x);
const role = (x) => ROLES.some((r) => r.id === x);
const research = (x) => RESEARCH.some((r) => r.id === x);
const talent = (c) =>
  obj(c) &&
  id(c.id) &&
  txt(c.name) &&
  role(c.role) &&
  n(c.skill, 0, 100) &&
  n(c.salary) &&
  n(c.signing);
const position = (p) => obj(p) && i(p.id) && i(p.asset, 0, 4);
function safeTree(x, depth = 0) {
  if (depth > 24) return false;
  if (x === null || typeof x === "boolean" || typeof x === "string")
    return true;
  if (typeof x === "number") return Number.isFinite(x) && Math.abs(x) < 1e100;
  if (Array.isArray(x))
    return x.length <= 20000 && x.every((y) => safeTree(y, depth + 1));
  if (obj(x))
    return (
      Object.keys(x).length < 1000 &&
      Object.entries(x).every(
        ([k, v]) =>
          !["__proto__", "constructor", "prototype"].includes(k) &&
          safeTree(v, depth + 1),
      )
    );
  return false;
}
export function validateAdvanced(s) {
  try {
    if (!safeTree(s)) return false;
    if (s.bondMarket) {
      const m = s.bondMarket;
      if (
        !obj(m) ||
        !i(m.nextId, 1) ||
        !n(m.expense) ||
        !i(m.cooldown) ||
        !i(m.restructures) ||
        !arr(m.reports, (r) => obj(r) && i(r.month) && txt(r.text), 40) ||
        !arr(
          m.bonds,
          (b) =>
            obj(b) &&
            i(b.id, 1) &&
            n(b.principal, 50000, 50000000) &&
            n(b.balance, b.principal) &&
            n(b.coupon, 0, 0.3) &&
            i(b.issued) &&
            i(b.maturity, b.issued + 24, b.issued + 120) &&
            n(b.reserve) &&
            i(b.breaches) &&
            i(b.missed) &&
            typeof b.stepped === "boolean" &&
            ["performing", "watchlist", "distressed"].includes(b.status) &&
            ["AA", "A", "BBB", "BB", "B"].includes(b.rating),
          8,
        )
      )
        return false;
      if (
        new Set(m.bonds.map((b) => b.id)).size !== m.bonds.length ||
        m.bonds.some(
          (b) =>
            b.id >= m.nextId ||
            ![24, 60, 120].includes(b.maturity - b.issued) ||
            Math.abs(b.reserve - b.principal * 0.02) > 0.000001,
        )
      )
        return false;
    }

    if (
      s.event?.kind === "decision" &&
      (!DECISIONS.some((e) => e.id === s.event.decisionId) ||
        !s.businesses.some((b) => b.id === s.event.businessId))
    )
      return false;
    if (s.decisions) {
      const d = s.decisions;
      if (
        !obj(d) ||
        !arr(d.recent, (x) => DECISIONS.some((e) => e.id === x), 6) ||
        !arr(d.history, (e) => obj(e) && i(e.month) && txt(e.text), 60) ||
        !arr(
          d.effects,
          (e) =>
            obj(e) &&
            i(e.businessId, 0, Number.MAX_SAFE_INTEGER) &&
            i(e.until) &&
            n(e.demand, 0.5, 1.8) &&
            n(e.capacity, 0.5, 1.8),
          1000,
        ) ||
        !arr(
          d.pending,
          (p) =>
            obj(p) &&
            i(p.businessId, 0, Number.MAX_SAFE_INTEGER) &&
            i(p.due) &&
            i(p.choice, 0, 2) &&
            DECISIONS.some(
              (e) => e.id === p.decisionId && !!e.choices[p.choice].later,
            ),
          1000,
        )
      )
        return false;
    }

    if (s.commerce) {
      const c = s.commerce,
        business = (id) => s.businesses.some((b) => b.id === id);
      if (
        !obj(c) ||
        !i(c.nextId, 1) ||
        !n(c.expense, -1e100) ||
        !n(c.badDebt) ||
        !n(c.factoring) ||
        !n(c.collections) ||
        !["strict", "standard", "growth"].includes(c.customerPolicy)
      )
        return false;
      if (
        !arr(
          c.agreements,
          (a) =>
            obj(a) &&
            i(a.id, 1) &&
            business(a.businessId) &&
            SUPPLY_HOUSES.some(
              (v) => v.id === a.supplier && v.terms.includes(a.terms),
            ) &&
            i(a.units, 1) &&
            [6, 12, 24].includes(a.months) &&
            i(a.remaining, 0, a.months) &&
            i(a.start) &&
            n(a.price, 0.000001) &&
            n(a.deposit) &&
            ["active", "suspended"].includes(a.status) &&
            typeof a.fallback === "boolean" &&
            i(a.delivered, 0, a.units) &&
            i(a.missed),
          10000,
        )
      )
        return false;
      if (
        new Set(c.agreements.map((a) => a.businessId)).size !==
        c.agreements.length
      )
        return false;
      if (
        !arr(
          c.payables,
          (p) =>
            obj(p) &&
            i(p.id, 1) &&
            business(p.businessId) &&
            c.agreements.some(
              (a) => a.id === p.agreementId && a.businessId === p.businessId,
            ) &&
            n(p.amount, 0.000001) &&
            i(p.due),
          10000,
        )
      )
        return false;
      if (
        !arr(
          c.routes,
          (r) =>
            obj(r) &&
            i(r.id, 1) &&
            business(r.from) &&
            business(r.to) &&
            routeAllowed(
              s.businesses.find((b) => b.id === r.from),
              s.businesses.find((b) => b.id === r.to),
            ) &&
            i(r.units, 1) &&
            typeof r.enabled === "boolean" &&
            i(r.lastSent) &&
            i(r.lastReceived),
          100,
        )
      )
        return false;
      if (new Set(c.routes.map((r) => r.from)).size !== c.routes.length)
        return false;
      if (
        !arr(
          c.shipments,
          (x) =>
            obj(x) &&
            i(x.id, 1) &&
            business(x.from) &&
            business(x.to) &&
            i(x.units, 1) &&
            n(x.value) &&
            i(x.due),
          10000,
        ) ||
        !arr(c.reports, (r) => obj(r) && i(r.month) && txt(r.text), 60)
      )
        return false;
      const ids = [
        ...c.agreements,
        ...c.payables,
        ...c.routes,
        ...c.shipments,
      ].map((x) => x.id);
      if (new Set(ids).size !== ids.length || ids.some((id) => id >= c.nextId))
        return false;
    }
    for (const invoice of s.world?.receivables || [])
      if (
        (invoice.risk !== undefined && !n(invoice.risk, 0, 0.18)) ||
        (invoice.late !== undefined && !i(invoice.late, 0, 2))
      )
        return false;
    for (const contract of s.world?.contracts || [])
      if (contract.creditRisk !== undefined && !n(contract.creditRisk, 0, 0.18))
        return false;

    for (const b of s.businesses || []) {
      if (b.facility) {
        const f = b.facility;
        if (
          !obj(f) ||
          !obj(f.levels) ||
          !FACILITY_MODULES.every((m) => i(f.levels[m.id], 0, 10)) ||
          !n(f.condition, 20, 100) ||
          !i(f.shifts, 1, 3) ||
          !i(f.maintenance, 0, 2) ||
          !n(f.invested) ||
          !i(f.nextId, 1) ||
          !n(f.outage, 0.6, 1) ||
          !i(f.overflow) ||
          !n(f.lastUtilization, 0, 1) ||
          !txt(f.report) ||
          !arr(
            f.projects,
            (p) =>
              obj(p) &&
              i(p.id, 1) &&
              FACILITY_MODULES.some((m) => m.id === p.key) &&
              n(p.cost, 0.000001) &&
              n(p.funded, 0, p.cost + 0.000001) &&
              i(p.months, 2, 7) &&
              i(p.remaining, 1, p.months) &&
              ["building", "funding paused"].includes(p.status),
            2,
          )
        )
          return false;
        if (
          new Set(f.projects.map((p) => p.key)).size !== f.projects.length ||
          new Set(f.projects.map((p) => p.id)).size !== f.projects.length ||
          f.projects.some((p) => p.id >= f.nextId || f.levels[p.key] >= 10)
        )
          return false;
      }
      if (!b.sectorState) continue;
      const q = b.sectorState;
      if (
        !obj(q) ||
        !i(q.policy, 0, 2) ||
        !n(q.score, 15, 100) ||
        !i(q.customers) ||
        !n(q.churn, 0, 0.5) ||
        !i(q.nextId, 1) ||
        !txt(q.incident) ||
        !i(q.spoiled) ||
        !n(q.pricePressure, 0.65, 1.12) ||
        !obj(q.upgrades) ||
        !["process", "service", "resilience"].every((k) =>
          i(q.upgrades[k], 0, 5),
        ) ||
        !arr(
          q.history,
          (x) =>
            obj(x) &&
            i(x.month) &&
            n(x.score, 15, 100) &&
            i(x.customers) &&
            n(x.churn, 0, 0.5) &&
            i(x.sold),
          24,
        ) ||
        !arr(
          q.development,
          (p) =>
            obj(p) &&
            i(p.id, 1) &&
            txt(p.name) &&
            i(p.tier, 0, 2) &&
            i(p.segment, 0, 2) &&
            ["development", "active"].includes(p.status) &&
            i(p.remaining, 0, 7) &&
            i(p.age) &&
            n(p.appeal, 0.18, 1) &&
            n(p.invested),
          8,
        )
      )
        return false;
      if (
        new Set(q.development.map((p) => p.id)).size !== q.development.length ||
        q.development.some((p) => p.id >= q.nextId) ||
        q.development.filter((p) => p.status === "development").length > 2
      )
        return false;
    }

    if (s.empire) {
      let e = s.empire,
        c = e.corporate;
      if (
        !obj(e) ||
        e.version !== 1 ||
        !four(e.warehouse) ||
        !arr(
          e.shipments,
          (x) =>
            obj(x) &&
            i(x.index, 0, 3) &&
            i(x.lots, 1) &&
            i(x.due) &&
            n(x.cost) &&
            n(x.freight),
        ) ||
        !i(e.shipmentsReceived) ||
        !arr(e.executives, (x) => talent(x) && i(x.tenure), 6) ||
        new Set(e.executives.map((x) => x.role)).size !== e.executives.length ||
        !arr(e.candidates, talent, 6) ||
        !four(e.fx) ||
        e.fx.some((x) => x <= 0) ||
        !four(e.fxHoldings) ||
        !arr(e.fxHistory, (x) => arr(x, (y) => n(y), 24), 4) ||
        e.fxHistory.length !== 4 ||
        !arr(
          e.orders,
          (o) =>
            position(o) &&
            ["buy", "sell"].includes(o.side) &&
            i(o.qty, 1) &&
            n(o.limit, 0.00001) &&
            i(o.expires),
        ) ||
        !arr(
          e.shorts,
          (p) =>
            position(p) &&
            i(p.qty, 1) &&
            n(p.entry, 0.00001) &&
            n(p.collateral),
        ) ||
        !arr(
          e.options,
          (p) =>
            position(p) &&
            ["call", "put"].includes(p.kind) &&
            i(p.count, 1, 1000) &&
            n(p.strike, 0.00001) &&
            n(p.premium) &&
            n(p.total) &&
            i(p.expiry),
        )
      )
        return false;
      if (
        !obj(c) ||
        !txt(c.name) ||
        !i(c.founderShares, 1) ||
        !i(c.publicShares) ||
        typeof c.listed !== "boolean" ||
        ![0, 0.1, 0.25, 0.5].includes(c.payout) ||
        !n(c.dividendsPaid) ||
        !n(c.founderDistributions) ||
        !i(c.rounds) ||
        !arr(e.researched, research, 12) ||
        !arr(
          e.researchProjects,
          (p) => obj(p) && research(p.id) && i(p.remaining, 1, 8),
          2,
        ) ||
        !arr(
          e.franchises,
          (f) =>
            obj(f) &&
            i(f.id) &&
            sector(f.type) &&
            txt(f.brand) &&
            n(f.health, 0, 100) &&
            i(f.age),
        ) ||
        !arr(e.claimed, id, 100) ||
        !obj(e.macro) ||
        !MACRO_EVENTS.some((m) => m.id === e.macro.id) ||
        !i(e.macro.remaining, 0, 6) ||
        !n(e.macro.demand, 0.1, 3) ||
        (e.macro.mult !== undefined && !n(e.macro.mult, 0.1, 3)) ||
        !obj(e.automation) ||
        typeof e.automation.enabled !== "boolean" ||
        typeof e.automation.sellStocks !== "boolean" ||
        !n(e.automation.reserve) ||
        !n(e.monthExpense) ||
        !n(e.monthIncome) ||
        !i(e.tradeSequence)
      )
        return false;
      if (
        !s.businesses.every(
          (b) =>
            ["balanced", "budget", "premium", "enterprise"].includes(
              b.segment,
            ) &&
            n(b.loyalty, 0, 100) &&
            n(b.compliance, 0, 10000) &&
            n(b.brandInvestment, 0, 50000) &&
            typeof b.warehouse === "boolean" &&
            typeof b.warehouseFallback === "boolean" &&
            arr(
              b.history,
              (h) =>
                obj(h) &&
                i(h.month) &&
                n(h.revenue) &&
                n(h.profit, -1e100) &&
                n(h.loyalty, 0, 100),
              24,
            ),
        )
      )
        return false;
      if (
        !s.properties.every(
          (p) =>
            i(p.level, 1, 5) &&
            n(p.condition, 0, 100) &&
            ["balanced", "corporate", "budget"].includes(p.tenant) &&
            n(p.reserve, 0, 10000) &&
            i(p.development, 0, 3),
        )
      )
        return false;
    }
    if (s.late) {
      let l = s.late,
        d = l.dynasty;
      if (
        !s.empire ||
        !obj(l) ||
        l.version !== 1 ||
        !arr(
          l.regions,
          (r) =>
            obj(r) &&
            REGIONS.some((x) => x.id === r.id) &&
            txt(r.name) &&
            txt(r.desc) &&
            i(r.currency, -1, 3) &&
            n(r.tariff, 0, 1) &&
            n(r.growth, 0.1, 3) &&
            n(r.stability, 0, 100) &&
            typeof r.access === "boolean" &&
            i(r.treaty, 0, 24),
          5,
        ) ||
        l.regions.length !== 5 ||
        !arr(
          l.projects,
          (p) =>
            obj(p) &&
            MEGAPROJECTS.some((x) => x.id === p.id) &&
            i(p.stage, 0, 3) &&
            i(p.remaining, 0, 12) &&
            ["building", "awaiting", "complete"].includes(p.status) &&
            n(p.invested),
          12,
        )
      )
        return false;
      const venture = (v) =>
        obj(v) &&
        id(v.id) &&
        txt(v.name) &&
        sector(v.type) &&
        n(v.risk, 0, 1) &&
        n(v.growth, 0, 1) &&
        n(v.valuation) &&
        n(v.minimum) &&
        i(v.window);
      if (
        !arr(l.ventureOffers, venture, 8) ||
        !arr(
          l.ventures,
          (v) =>
            venture(v) &&
            n(v.stake, 0, 1) &&
            n(v.invested) &&
            i(v.age) &&
            ["active", "failed", "exited", "sold"].includes(v.status) &&
            i(v.runway, -10000, 10000) &&
            i(v.round),
        )
      )
        return false;
      if (l.bank) {
        let b = l.bank;
        if (
          !obj(b) ||
          !n(b.cash) ||
          !n(b.loans) ||
          !n(b.deposits) ||
          !n(b.depositRate, 0, 0.1) ||
          !n(b.loanRate, 0.03, 0.3) ||
          !n(b.reserve, 0.1, 0.8) ||
          !["conservative", "balanced", "aggressive"].includes(
            b.underwriting,
          ) ||
          !n(b.confidence, 0, 100) ||
          !n(b.profit, -1e100) ||
          !n(b.defaults) ||
          typeof b.frozen !== "boolean" ||
          !arr(
            b.history,
            (h) =>
              obj(h) &&
              i(h.month) &&
              n(h.equity, -1e100) &&
              n(h.loans) &&
              n(h.deposits) &&
              n(h.profit, -1e100),
            36,
          )
        )
          return false;
      }
      if (
        !obj(l.headquarters) ||
        !i(l.headquarters.level, 1, 10) ||
        !["balanced", "decentralized", "people"].includes(
          l.headquarters.policy,
        ) ||
        !n(l.headquarters.budget, 0, 100000) ||
        !obj(d) ||
        !i(d.generation, 1) ||
        !i(d.prestige) ||
        !i(d.totalPrestige) ||
        !arr(
          d.upgrades,
          (id) => DYNASTY_UPGRADES.some((u) => u.id === id),
          6,
        ) ||
        !arr(
          d.records,
          (r) =>
            obj(r) &&
            i(r.generation) &&
            i(r.months) &&
            n(r.worth, -1e100) &&
            i(r.projects, 0, 12) &&
            i(r.prestige),
        ) ||
        !SCENARIOS.some((x) => x.id === l.scenario) ||
        !arr(
          l.archive,
          (r) =>
            obj(r) &&
            i(r.month) &&
            i(r.activeCompanies) &&
            i(r.employees) &&
            i(r.projects),
          120,
        ) ||
        !n(l.monthIncome) ||
        !n(l.monthExpense) ||
        !i(l.exits) ||
        !i(l.bankruptcies)
      )
        return false;
    }
    return true;
  } catch {
    return false;
  }
}
