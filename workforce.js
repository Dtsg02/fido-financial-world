import { TYPES } from "./catalog.js?v=6e353cd01f78";
export const RECRUITMENT = {
  standard: {
    name: "Open recruitment",
    months: 2,
    fee: 0.35,
    skill: 1.15,
    acceptance: 0,
  },
  recruiter: {
    name: "Specialist recruiter",
    months: 1,
    fee: 1,
    skill: 1.4,
    acceptance: 0.15,
  },
  graduate: {
    name: "Graduate pipeline",
    months: 3,
    fee: 0.15,
    skill: 1,
    acceptance: 0.05,
  },
};
export function workforce(b) {
  return (b.workforce ??= {
    method: "standard",
    vacancies: [],
    onboarding: [],
    lastHired: 0,
    lastReport: "No recruitment activity yet.",
  });
}
export function plannedStaff(b) {
  return b.staff + workforce(b).vacancies.reduce((n, v) => n + v.count, 0);
}
export function staffingQuote(b, target, method, wageFactor = 1) {
  const p = RECRUITMENT[method];
  if (
    !Object.hasOwn(RECRUITMENT, method) ||
    !Number.isFinite(wageFactor) ||
    wageFactor <= 0 ||
    !Number.isInteger(target) ||
    target < 1 ||
    target > b.level * 5
  )
    return null;
  const pending = plannedStaff(b) - b.staff,
    added = Math.max(0, target - b.staff - pending),
    laidOff = Math.max(0, b.staff - target);
  const wage = TYPES.find((t) => t.id === b.type).wage * wageFactor;
  return { added, laidOff, cost: added * wage * p.fee + laidOff * wage * 0.35 };
}
export function setStaffing(s, b, target, method, wageFactor = 1) {
  const q = staffingQuote(b, target, method, wageFactor);
  if (!q || s.cash < q.cost) return false;
  const w = workforce(b);
  s.cash -= q.cost;
  w.method = method;
  let cancelled = Math.max(0, plannedStaff(b) - target);
  for (const v of [...w.vacancies].reverse()) {
    const n = Math.min(cancelled, v.count);
    v.count -= n;
    cancelled -= n;
  }
  w.vacancies = w.vacancies.filter((v) => v.count > 0);
  if (q.laidOff) {
    b.staff -= q.laidOff;
    b.morale = Math.max(20, b.morale - Math.min(15, q.laidOff * 2));
  }
  if (q.added)
    w.vacancies.push({
      count: q.added,
      remaining: RECRUITMENT[method].months,
      method,
      delays: 0,
    });
  w.lastReport = q.added
    ? `${q.added} positions opened; earliest start in ${RECRUITMENT[method].months} months.`
    : q.laidOff
      ? `${q.laidOff} employees released; severance paid.`
      : "Staffing target updated. Cancelled search fees are not refunded.";
  return true;
}
export function onboardingCapacity(b) {
  const w = workforce(b);
  return Math.max(
    0.7,
    1 -
      w.onboarding.reduce((n, c) => n + c.count * c.remaining * 0.15, 0) /
        Math.max(1, b.staff),
  );
}
export function beforeWorkforceMonth(s, random) {
  for (const b of s.businesses) {
    const w = workforce(b);
    w.lastHired = 0;
    for (const c of w.onboarding) c.remaining--;
    w.onboarding = w.onboarding.filter((c) => c.remaining > 0);
    for (const v of w.vacancies) {
      v.remaining--;
      if (v.remaining > 0) continue;
      const p = RECRUITMENT[v.method],
        chance = Math.max(
          0.35,
          Math.min(
            0.98,
            0.65 +
              s.world.unemployment * 0.025 +
              (b.salary - 1) * 0.6 +
              p.acceptance,
          ),
        );
      let hired = 0;
      for (let i = 0; i < v.count; i++)
        if (b.staff + hired < b.level * 5 && random(s) < chance) hired++;
      if (hired) {
        b.skill = (b.skill * b.staff + p.skill * hired) / (b.staff + hired);
        b.staff += hired;
        w.lastHired += hired;
        w.onboarding.push({ count: hired, remaining: 2 });
        v.count -= hired;
      }
      if (v.count) {
        v.remaining = 1;
        v.delays++;
      }
    }
    w.vacancies = w.vacancies.filter((v) => v.count > 0);
    let excess = Math.max(
      0,
      w.onboarding.reduce((n, c) => n + c.count, 0) - b.staff,
    );
    for (const c of w.onboarding) {
      const n = Math.min(excess, c.count);
      c.count -= n;
      excess -= n;
    }
    w.onboarding = w.onboarding.filter((c) => c.count > 0);
    if (w.lastHired)
      w.lastReport = `${w.lastHired} new employees joined. Full wages begin now; onboarding reduces initial productive capacity.`;
    else if (w.vacancies.some((v) => v.delays))
      w.lastReport =
        "Some candidates declined. Higher salary offers and specialist recruiters improve acceptance; unfilled positions retry next month.";
  }
}
export function hiringControls(b, esc) {
  const w = workforce(b);
  return `<label class="field">Recruitment channel<select id="recruitment">${Object.entries(
    RECRUITMENT,
  )
    .map(
      ([id, p]) =>
        `<option value="${id}" ${id === w.method ? "selected" : ""}>${p.name} · ${p.months} months · ${(p.fee * 100).toFixed(0)}% of base monthly wage / hire</option>`,
    )
    .join(
      "",
    )}</select></label><p class="explain">${b.staff} employees on payroll · ${plannedStaff(b) - b.staff} open positions · ${w.onboarding.reduce((n, c) => n + c.count, 0)} onboarding. ${esc(w.lastReport)}</p><p class="explain">New hires initially contribute 70% of their normal capacity, then 85%, then 100%. Their skill blends into the team average. Recruitment fees are paid upfront; cancel by lowering the staffing target. Fees are nonrefundable. Salary competitiveness and unemployment affect acceptance. Existing vacancies keep their original channel.</p>`;
}
