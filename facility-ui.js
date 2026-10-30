import {
  facility,
  facilityQuote,
  FACILITY_MODULES,
  buildFacility,
  cancelFacility,
  facilityOverhead,
} from "./facilities.js?v=8218e214890d";
import { forecast } from "./engine.js?v=8218e214890d";
export function facilityContent(s, h) {
  const { heading, btn, money, esc } = h;
  return (
    heading(
      "Build capacity where it matters.",
      "Equipment, people, utilities, storage, and cash must grow together.",
    ) +
    s.businesses
      .map((b) => {
        const f = facility(b),
          p = forecast(s, b).facilityPlan;
        return `<section class="card industry-card"><div class="split"><h2>${esc(b.name)}</h2><span class="tag">BOTTLENECK: ${p.bottleneck.toUpperCase()}</span></div><div class="industry-layout"><div><h3>Capacity waterfall</h3>${[
          ["Workforce & shifts", p.workforce],
          ["Equipment & condition", p.equipment],
          ["Utility connection", p.utilities],
          ["Effective production", p.capacity],
          ["Storage capacity", p.storage],
        ]
          .map(
            ([name, n]) =>
              `<div class="balance-line"><span>${name}</span><b>${Math.floor(n).toLocaleString()} units</b></div>`,
          )
          .join(
            "",
          )}<div class="balance-line"><span>Equipment condition</span><b>${f.condition.toFixed(1)}%</b></div><div class="balance-line"><span>Last-month utilization</span><b>${(f.lastUtilization * 100).toFixed(0)}%</b></div><div class="balance-line"><span>Facility & shift overhead</span><b>${money(facilityOverhead(s, b))}/month</b></div><p class="explain">${esc(f.report)} Baseline site capacity scales with business level. Research and additional shifts can push workforce output beyond equipment and utility capacity.</p><h3>Shift pattern</h3><div class="actions">${[1, 2, 3].map((n) => btn((f.shifts === n ? "✓ " : "") + n + " shift" + (n > 1 ? "s" : ""), `facility:shifts:${b.id}:${n}`, f.shifts === n ? "" : "light", f.shifts === n)).join("")}</div><p class="explain">Two shifts: +30% workforce output and a 35% base-payroll premium. Three shifts: +60% output and an 80% premium. Extra shifts increase wear and reduce morale. Equipment and utilities still cap production.</p><h3>Maintenance policy</h3><div class="actions">${["Defer", "Routine", "Preventive"].map((n, i) => btn((f.maintenance === i ? "✓ " : "") + n, `facility:maintenance:${b.id}:${i}`, f.maintenance === i ? "" : "light", f.maintenance === i)).join("")}</div><p class="explain">Monthly maintenance costs 0%, 0.1%, or 0.3% of founding cost; restores 0, 1.3, or 2.8 condition points before wear. Completed upgrades cost another 0.1% of investment per month.</p></div><div><h3>Construction pipeline · ${f.projects.length} / 2</h3>${f.projects.map((p) => `<div class="product-row"><span class="tag">${p.status.toUpperCase()}</span><h3>${FACILITY_MODULES.find((m) => m.id === p.key).name}</h3><p>${p.remaining} funded months until completion<br>${money(p.funded)} / ${money(p.cost)} paid<br>Next installment: ${money((p.cost - p.funded) / p.remaining)}</p>${btn("Cancel · recover " + money(p.funded * 0.4), `facility:cancel:${b.id}:${p.id}`, "light")}</div>`).join("") || "<p>No construction in progress.</p>"}<p class="explain">Pay 35% up front and the rest in monthly installments before purchasing materials. Construction pauses when cash cannot cover its installment. Upgrades begin contributing only after completion. Cancelling recovers 40% of funds paid.</p>${FACILITY_MODULES.map(
          (m) => {
            const q = facilityQuote(b, m.id);
            return `<div class="product-row"><h3>${m.name} · ${f.levels[m.id]} / 10</h3><p>${m.desc}${q ? `<br>${money(q.cost)} total · ${q.months} months` : ""}</p>${btn(q ? "Begin · " + money(q.cost * 0.35) : "Fully developed", `facility:build:${b.id}:${m.id}`, "light", !q || s.cash < q.cost * 0.35 || f.projects.length >= 2 || f.projects.some((p) => p.key === m.id))}</div>`;
          },
        ).join("")}</div></div></section>`;
      })
      .join("") +
    (!s.businesses.length
      ? '<section class="card"><h2>Your facilities begin with a business.</h2><p>Found a company to plan its equipment, utility connection, storage, and shifts.</p></section>'
      : "")
  );
}
export function facilityAction(parts, s, h) {
  const [, action, id, value] = parts,
    b = s.businesses.find((b) => b.id === Number(id));
  if (!b) return;
  const f = facility(b);
  if (action === "build") {
    if (buildFacility(s, b, value))
      h.changed("Construction funded; monthly installments begin next month.");
    else h.toast("Insufficient cash or construction slots.");
  } else if (action === "cancel") {
    if (cancelFacility(s, b, Number(value)))
      h.changed("Construction cancelled; 40% of paid funds recovered.");
  } else if (action === "shifts" && [1, 2, 3].includes(Number(value))) {
    f.shifts = Number(value);
    h.changed("Shift pattern updated.");
  } else if (action === "maintenance" && [0, 1, 2].includes(Number(value))) {
    f.maintenance = Number(value);
    h.changed("Maintenance policy updated.");
  }
}
