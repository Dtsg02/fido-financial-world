import { TYPES } from "./catalog.js?v=6e353cd01f78";
import { facility } from "./facilities.js?v=6e353cd01f78";
import { sectorState } from "./sectors.js?v=6e353cd01f78";
const choice = (label, cost, effects, desc, later) => ({
  label,
  cost,
  effects,
  desc,
  later,
});
export const DECISIONS = [
  {
    id: "retention",
    title: "Your best people have competing offers",
    text: "A rival is recruiting experienced staff. Your response changes morale and service continuity.",
    choices: [
      choice(
        "Fund a retention package",
        0.045,
        { morale: 12, capacity: 1.08 },
        "+12 morale; +8% capacity for 3 months.",
      ),
      choice(
        "Offer a development pathway",
        0.02,
        { morale: 5 },
        "+5 morale. In 3 months, 75% chance of +8 reputation.",
        { chance: 0.75, success: { rep: 8 }, failure: { morale: -4 } },
      ),
      choice(
        "Hold the compensation budget",
        0,
        { morale: -8, capacity: 0.95 },
        "−8 morale; −5% capacity for 3 months.",
      ),
    ],
  },
  {
    id: "pricewar",
    title: "A competitor opens a price war",
    text: "Deep discounts are pulling customers away. Choose whether to defend volume, differentiate, or preserve cash.",
    choices: [
      choice(
        "Fund a targeted campaign",
        0.04,
        { demand: 1.2 },
        "+20% demand for 3 months.",
      ),
      choice(
        "Invest in premium positioning",
        0.025,
        { rep: 4 },
        "+4 reputation; 65% chance of a further +8 reputation in 3 months.",
        { chance: 0.65, success: { rep: 8 }, failure: { rep: -2 } },
      ),
      choice(
        "Protect cash and wait",
        0,
        { demand: 0.88 },
        "−12% demand for 3 months.",
      ),
    ],
  },
  {
    id: "quality",
    title: "A quality complaint is spreading",
    text: "A product issue could become a lasting reputation problem. A fast fix costs money; a limited review carries uncertainty.",
    choices: [
      choice(
        "Replace affected products",
        0.035,
        { rep: 5, score: 5 },
        "+5 reputation and operating health.",
      ),
      choice(
        "Commission a targeted review",
        0.012,
        { demand: 0.96 },
        "−4% demand for 3 months. 70% chance of +3 reputation; otherwise −10.",
        { chance: 0.7, success: { rep: 3 }, failure: { rep: -10 } },
      ),
      choice(
        "Keep the current process",
        0,
        { rep: -8, score: -5 },
        "−8 reputation and −5 operating health.",
      ),
    ],
  },
  {
    id: "automationpilot",
    title: "An automation vendor proposes a pilot",
    text: "New tools could improve throughput, but implementation can disrupt the team.",
    choices: [
      choice(
        "Run a full pilot",
        0.06,
        { capacity: 0.95 },
        "−5% capacity for 3 months. Then 70% chance of +20% capacity for 6 months; otherwise −5 morale.",
        {
          chance: 0.7,
          success: { capacity: 1.2, duration: 6 },
          failure: { morale: -5 },
        },
      ),
      choice(
        "Train a small internal team",
        0.025,
        { capacity: 1.05, morale: 3 },
        "+5% capacity for 3 months and +3 morale.",
      ),
      choice("Decline the pilot", 0, {}, "No change."),
    ],
  },
  {
    id: "heatwave",
    title: "Extreme weather strains operations",
    text: "Your site faces higher load and service disruption. Prepare, reduce service, or absorb the damage.",
    types: ["farm", "energy", "water", "hotel", "factory", "datacenter"],
    choices: [
      choice(
        "Install temporary protection",
        0.04,
        { condition: 5 },
        "+5 condition; no demand disruption.",
      ),
      choice(
        "Reduce service temporarily",
        0,
        { capacity: 0.8, condition: 2 },
        "−20% capacity for 3 months; +2 condition.",
      ),
      choice(
        "Maintain full schedules",
        0,
        { condition: -12, score: -5 },
        "−12 condition and −5 operating health.",
      ),
    ],
  },
  {
    id: "distribution",
    title: "A distributor offers new market access",
    text: "A new channel promises customers but requires onboarding and service capacity.",
    choices: [
      choice(
        "Launch the distribution channel",
        0.07,
        { demand: 1.12 },
        "+12% demand for 3 months; 70% chance of +10 reputation afterward.",
        { chance: 0.7, success: { rep: 10 }, failure: { rep: -4 } },
      ),
      choice(
        "Run a regional trial",
        0.025,
        { demand: 1.07 },
        "+7% demand for 3 months.",
      ),
      choice("Stay with existing channels", 0, {}, "No change."),
    ],
  },
  {
    id: "cyber",
    title: "A security audit finds a weak point",
    text: "A vendor integration exposes your operations to disruption. Choose the scope of your response.",
    types: ["software", "telecom", "gaming", "datacenter", "security", "media"],
    choices: [
      choice(
        "Replace the integration",
        0.05,
        { score: 8, capacity: 0.95 },
        "+8 operating health; −5% capacity for 3 months.",
      ),
      choice(
        "Apply a temporary patch",
        0.015,
        {},
        "80% chance of +2 reputation; otherwise a 20% capacity hit for 6 months.",
        {
          chance: 0.8,
          success: { rep: 2 },
          failure: { capacity: 0.8, duration: 6 },
        },
      ),
      choice(
        "Accept the exposure",
        0,
        { rep: -3 },
        "−3 reputation; 50% chance of a 25% demand hit in 3 months.",
        { chance: 0.5, success: {}, failure: { demand: 0.75, duration: 6 } },
      ),
    ],
  },
  {
    id: "community",
    title: "Neighbors challenge your expansion plans",
    text: "Local stakeholders want a stronger commitment to jobs and service quality.",
    choices: [
      choice(
        "Fund a community partnership",
        0.035,
        { rep: 10, morale: 4 },
        "+10 reputation and +4 morale.",
      ),
      choice(
        "Negotiate a narrower commitment",
        0.012,
        { rep: 3 },
        "+3 reputation.",
      ),
      choice(
        "Proceed without concessions",
        0,
        { rep: -6, demand: 0.94 },
        "−6 reputation; −6% demand for 3 months.",
      ),
    ],
  },
  {
    id: "researchpartner",
    title: "A university offers a research partnership",
    text: "Shared research may improve your operating model, but a successful result is not guaranteed.",
    types: [
      "biotech",
      "semiconductor",
      "software",
      "energy",
      "water",
      "education",
    ],
    choices: [
      choice(
        "Sponsor the research program",
        0.08,
        {},
        "In 3 months: 65% chance of +15 operating health and +10 reputation; otherwise +2 health.",
        {
          chance: 0.65,
          success: { score: 15, rep: 10 },
          failure: { score: 2 },
        },
      ),
      choice(
        "Sponsor a small fellowship",
        0.025,
        { score: 4 },
        "+4 operating health.",
      ),
      choice("Decline the partnership", 0, {}, "No change."),
    ],
  },
  {
    id: "seasonalrush",
    title: "A seasonal demand spike is approaching",
    text: "The opportunity is temporary. Expensive preparation may help you capture it without harming service.",
    types: ["hotel", "restaurant", "coffee", "bakery", "shop", "farm"],
    choices: [
      choice(
        "Prepare a full seasonal campaign",
        0.035,
        { demand: 1.25, capacity: 1.12 },
        "+25% demand and +12% workforce capacity for 3 months; physical limits still apply.",
      ),
      choice(
        "Focus on loyal customers",
        0.012,
        { demand: 1.08, rep: 3 },
        "+8% demand for 3 months; +3 reputation.",
      ),
      choice("Keep normal operations", 0, {}, "No change."),
    ],
  },
  {
    id: "inspection",
    title: "An industry inspection is announced",
    text: "Prepare evidence and improve processes, or accept the risk of a poor result.",
    types: ["clinic", "biotech", "security", "water", "education", "factory"],
    choices: [
      choice(
        "Run a full readiness program",
        0.04,
        { score: 10, rep: 4 },
        "+10 operating health and +4 reputation.",
      ),
      choice(
        "Complete a focused review",
        0.015,
        {},
        "75% chance of +5 reputation; otherwise −8 health and −8 reputation.",
        { chance: 0.75, success: { rep: 5 }, failure: { score: -8, rep: -8 } },
      ),
      choice(
        "Rely on existing standards",
        0,
        {},
        "50% chance of no change; otherwise −12 reputation.",
        { chance: 0.5, success: {}, failure: { rep: -12 } },
      ),
    ],
  },
  {
    id: "supplieralliance",
    title: "Suppliers propose a joint resilience program",
    text: "The program improves operating knowledge and reliability at a cash cost.",
    choices: [
      choice(
        "Become a founding partner",
        0.05,
        { condition: 10, score: 8 },
        "+10 condition and +8 operating health.",
      ),
      choice(
        "Join as an observer",
        0.015,
        { score: 3 },
        "+3 operating health.",
      ),
      choice("Remain independent", 0, {}, "No change."),
    ],
  },
  {
    id: "burnout",
    title: "The team is showing signs of burnout",
    text: "Delivery pressure is starting to affect morale. Recovery now may prevent worse service later.",
    choices: [
      choice(
        "Fund extra cover and recovery",
        0.03,
        { morale: 15 },
        "+15 morale.",
      ),
      choice(
        "Reduce delivery targets",
        0,
        { morale: 8, capacity: 0.85 },
        "+8 morale; −15% capacity for 3 months.",
      ),
      choice(
        "Keep pushing for output",
        0,
        { morale: -10, score: -4 },
        "−10 morale and −4 operating health.",
      ),
    ],
  },
  {
    id: "exportpilot",
    title: "An overseas customer proposes a pilot",
    text: "A small export opportunity offers upside but requires adaptation to an unfamiliar market.",
    minLevel: 2,
    choices: [
      choice(
        "Develop the export offer",
        0.07,
        {},
        "In 3 months: 60% chance of a cash payment worth 12% of founding cost and +5 reputation; otherwise no payment.",
        { chance: 0.6, success: { cash: 0.12, rep: 5 }, failure: {} },
      ),
      choice(
        "Sell a smaller feasibility study",
        0.02,
        {},
        "In 3 months: 85% chance of a payment worth 3.5% of founding cost.",
        { chance: 0.85, success: { cash: 0.035 }, failure: {} },
      ),
      choice("Decline the opportunity", 0, {}, "No change."),
    ],
  },
  {
    id: "leadership",
    title: "A leadership transition tests the organization",
    text: "Growing operations need stronger management. An outside appointment may deliver more than an internal process, at greater risk.",
    minLevel: 3,
    choices: [
      choice(
        "Recruit an experienced leader",
        0.06,
        { morale: 4 },
        "+4 morale; 75% chance of +15% capacity for 6 months after onboarding.",
        {
          chance: 0.75,
          success: { capacity: 1.15, duration: 6 },
          failure: { morale: -6 },
        },
      ),
      choice(
        "Promote and train internally",
        0.025,
        { morale: 8, capacity: 1.04 },
        "+8 morale; +4% capacity for 3 months.",
      ),
      choice(
        "Defer the appointment",
        0,
        { capacity: 0.94 },
        "−6% capacity for 3 months.",
      ),
    ],
  },
];
export function decisions(s) {
  return (s.decisions ??= {
    pending: [],
    effects: [],
    history: [],
    recent: [],
  });
}
const t = (b) => TYPES.find((t) => t.id === b.type);
const bound = (x, min, max) => Math.max(min, Math.min(max, x));
export function decisionModifiers(s, b) {
  const list = decisions(s).effects.filter(
    (e) => e.businessId === b.id && e.until >= s.month,
  );
  return {
    demand: bound(
      list.reduce((n, e) => n * e.demand, 1),
      0.5,
      1.8,
    ),
    capacity: bound(
      list.reduce((n, e) => n * e.capacity, 1),
      0.5,
      1.8,
    ),
  };
}
function apply(s, b, e, current = false) {
  if (!b) return;
  if (e.rep) b.reputation = bound(b.reputation + e.rep, 30, 100);
  if (e.morale) b.morale = bound(b.morale + e.morale, 20, 100);
  if (e.condition)
    facility(b).condition = bound(facility(b).condition + e.condition, 20, 100);
  if (e.score)
    sectorState(b).score = bound(sectorState(b).score + e.score, 15, 100);
  if (e.cash) s.cash += t(b).cost * e.cash;
  if (e.demand || e.capacity)
    decisions(s).effects.push({
      businessId: b.id,
      until: s.month + (e.duration || 3) - (current ? 1 : 0),
      demand: e.demand || 1,
      capacity: e.capacity || 1,
    });
}
export function generateDecision(s, random) {
  if (!s.businesses.length) return null;
  const d = decisions(s),
    available = s.businesses.flatMap((b) =>
      DECISIONS.filter(
        (e) =>
          (!e.types || e.types.includes(b.type)) &&
          b.level >= (e.minLevel || 1) &&
          !d.recent.includes(e.id),
      ).map((e) => ({ b, e })),
    );
  if (!available.length) {
    d.recent = [];
    return generateDecision(s, random);
  }
  const { b, e } = available[Math.floor(random(s) * available.length)];
  d.recent.push(e.id);
  d.recent = d.recent.slice(-6);
  return {
    kind: "decision",
    decisionId: e.id,
    businessId: b.id,
    title: e.title,
    text: b.name + ": " + e.text,
    cost: 0,
  };
}
export function resolveDecision(s, index, random) {
  const ev = s.event;
  if (
    !ev ||
    ev.kind !== "decision" ||
    !Number.isInteger(index) ||
    index < 0 ||
    index > 2
  )
    return false;
  const e = DECISIONS.find((e) => e.id === ev.decisionId),
    b = s.businesses.find((b) => b.id === ev.businessId);
  if (!e || !b) return false;
  const c = e.choices[index],
    cost = t(b).cost * c.cost;
  if (s.cash < cost) return false;
  s.cash -= cost;
  apply(s, b, c.effects);
  if (c.later)
    decisions(s).pending.push({
      decisionId: e.id,
      choice: index,
      businessId: b.id,
      due: s.month + 3,
    });
  decisions(s).history.unshift({
    month: s.month,
    text: `${b.name}: ${e.title} — ${c.label}. Paid $${Math.round(cost)}.`,
  });
  decisions(s).history = decisions(s).history.slice(0, 60);
  s.event = null;
  return true;
}
export function beforeDecisionMonth(s, random) {
  const d = decisions(s);
  d.effects = d.effects.filter(
    (e) =>
      e.until >= s.month && s.businesses.some((b) => b.id === e.businessId),
  );
  for (const p of d.pending.filter((p) => p.due <= s.month)) {
    const def = DECISIONS.find((e) => e.id === p.decisionId),
      c = def.choices[p.choice],
      b = s.businesses.find((b) => b.id === p.businessId);
    if (!b) continue;
    const ok = random(s) < c.later.chance;
    apply(s, b, ok ? c.later.success : c.later.failure, true);
    const text = `${b.name}: ${def.title} — ${ok ? "the follow-up succeeded" : "the downside outcome occurred"}.`;
    d.history.unshift({ month: s.month, text });
    s.news.unshift({ month: s.month, title: "A decision comes due", text });
  }
  d.pending = d.pending.filter((p) => p.due > s.month);
  d.history = d.history.slice(0, 60);
}
export function decisionCard(s, h) {
  const e = DECISIONS.find((e) => e.id === s.event.decisionId),
    b = s.businesses.find((b) => b.id === s.event.businessId),
    { btn, esc, money } = h;
  if (!e || !b) return "";
  return `<div class="event"><h3>${esc(e.title)}</h3><p>${esc(s.event.text)}</p>${e.choices.map((c, i) => `<div class="product-row"><h3>${c.label}</h3><p>${c.desc}</p>${btn(c.cost ? c.label + " · " + money(t(b).cost * c.cost) : c.label, `decision:${i}`, "small", s.cash < t(b).cost * c.cost)}</div>`).join("")}</div>`;
}
export function decisionContent(s, h) {
  const d = decisions(s),
    { heading, esc } = h;
  return (
    heading(
      "Decisions have an afterlife.",
      "Review choices, temporary effects, and outcomes that have not arrived yet.",
    ) +
    (s.event?.kind === "decision"
      ? `<section class="card">${decisionCard(s, h)}</section>`
      : "") +
    `<div class="industry-layout"><section class="card"><h2>Pending outcomes</h2>${d.pending.map((p) => `<div class="product-row"><h3>${esc(DECISIONS.find((e) => e.id === p.decisionId).title)}</h3><p>${esc(s.businesses.find((b) => b.id === p.businessId)?.name || "Closed company")} · Due month ${p.due + 1}</p></div>`).join("") || "<p>No delayed outcomes pending.</p>"}<h2>Temporary effects</h2>${
      d.effects
        .filter((e) => e.until >= s.month)
        .map(
          (e) =>
            `<div class="product-row"><b>${esc(s.businesses.find((b) => b.id === e.businessId)?.name || "Closed company")}</b><p>Demand ${e.demand.toFixed(2)}× · Workforce capacity ${e.capacity.toFixed(2)}×<br>Through month ${e.until + 1}</p></div>`,
        )
        .join("") || "<p>No temporary decision effects.</p>"
    }</section><section class="card"><h2>Decision history</h2>${d.history.map((e) => `<div class="product-row"><small>Month ${e.month + 1}</small><p>${esc(e.text)}</p></div>`).join("") || "<p>Company-specific situations arrive at quarter-end. Choices are tied to your industries and business maturity. Six recently seen situations are excluded from the next draw.</p>"}</section></div>`
  );
}
