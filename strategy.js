import {
  INTEGRATION_PLANS,
  acquisitionQuote,
  recordAcquisition,
} from "./acquisitions.js?v=830bc158a7cf";
import { integrationContent } from "./acquisition-ui.js?v=830bc158a7cf";
import { invoicePolicy } from "./commerce.js?v=830bc158a7cf";
import { ensureLate, regionFor } from "./late.js?v=830bc158a7cf";
import { TYPES, type, start, worth, forecast, log } from "./engine.js?v=830bc158a7cf";
import {
  CITIES,
  SUPPLIERS,
  COMMODITIES,
  PROJECTS,
  ensureWorld,
  city,
  supplier,
  productivity,
  acceptContract,
  launchProject,
  canSell,
  financeLoan,
} from "./world.js?v=830bc158a7cf";
export const strategyPages = [
  "World",
  "Operations",
  "Contracts",
  "Competitors",
  "Treasury",
];
export function strategyContent(page, s, h) {
  ensureWorld(s);
  const { heading, btn, money, esc, stat, spark } = h,
    w = s.world;
  if (page === "World")
    return (
      heading(
        "A world of different opportunities.",
        "Cities, commodities, policy, and economic cycles shape your next move.",
      ) +
      `<div class="stats">${stat("Consumer sentiment", w.sentiment + "/100", "Changes with the economic cycle", "Markets")}${stat("Unemployment", w.unemployment.toFixed(1) + "%", "A fictional labor-market indicator", "Businesses")}${stat("Income tax", (w.policy.tax * 100).toFixed(1) + "%", "Policy can change every six months", "Banking")}${stat("Carbon levy", money(w.policy.carbon), "Per level × supplier emissions", "Properties")}</div><section class="card world-map"><div class="card-head"><div><h2>Choose where you compete</h2><small>One world. Thirteen very different markets.</small></div><span class="tag">ECONOMIC ATLAS</span></div><div class="city-grid">${CITIES.map((c, i) => `<article class="city-card"><div class="city-number">0${i + 1} <span>${["◈", "▥", "≈", "⌘", "☀"][i]}</span></div><div class="eyebrow">${c.region}</div><h2>${c.name}</h2><p>${c.desc}</p><div class="city-metrics"><span>Demand <b>${c.demand.toFixed(2)}×</b></span><span>Wages <b>${c.wages.toFixed(2)}×</b></span><span>Rent <b>${c.rent.toFixed(2)}×</b></span></div><div class="split"><small>${s.businesses.filter((b) => b.city === c.id).length} of your businesses</small><span class="tag">${w.rivals.filter((r) => r.city === c.id).length} rivals</span></div></article>`).join("")}</div><p class="explain">Move companies from Operations. Newford boosts studios, Silicon Bay boosts software, Sunvale boosts solar demand, and Port Azure cuts material prices 8%. Multiple businesses of your own in the same sector and city cannibalize demand.</p></section><div class="detail-grid" style="margin-top:22px"><section class="card"><h2>Commodity exchange</h2>${COMMODITIES.map((c, i) => `<div class="market-row"><div><b>${c.name}</b><small>Base index 100 · affects input costs</small></div>${spark(w.commodityHistory[i])}<span class="${w.commodities[i] > 100 ? "negative" : "positive"}">${w.commodities[i].toFixed(1)}</span></div>`).join("")}<p class="explain">Cafés use food; stores and factories use industrial materials; studios and software use compute; solar uses energy components. Owning a factory reduces store inputs 8%. Owning solar reduces other companies’ inputs 8% (discounts do not stack).</p></section><section class="card"><h2>Intelligence briefing</h2>${
        w.reports
          .slice(0, 6)
          .map(
            (r) =>
              `<div class="news-item"><div class="news-icon">◈</div><div><p>${esc(r.text)}</p><small>Month ${r.month + 1}</small></div></div>`,
          )
          .join("") ||
        '<p class="explain">Reports will arrive as your companies operate.</p>'
      }<div class="balance-line"><span>Clean energy subsidy</span><b>${money(w.policy.subsidy)} / level / month</b></div></section></div>`
    );
  if (page === "Operations")
    return (
      heading(
        "The decisions behind the numbers.",
        "People, supply chains, product development, and business resilience.",
      ) +
      (!s.businesses.length
        ? `<section class="card empty"><strong>Your operating desk is waiting.</strong>Start a business to manage your people and production.<br>${btn("Start a business", "catalog")}</section>`
        : `<div class="stack">${s.businesses
            .map((b) => {
              let c = city(b),
                p = supplier(b),
                f = forecast(s, b);
              return `<section class="card"><div class="card-head"><div><div class="eyebrow">${type(b).sector} · ${c.name}</div><h2>${esc(b.name)}</h2></div>${btn("Pricing & inventory →", "manage:" + b.id, "light small")}</div><div class="operations-summary"><div><small>Team morale</small><b class="${b.morale < 40 ? "negative" : "positive"}">${Math.round(b.morale)} / 100</b></div><div><small>Skill level</small><b>${b.skill.toFixed(2)} / 3</b></div><div><small>Productivity</small><b>${Math.round(productivity(b) * 100)}%</b></div><div><small>Last delivery</small><b>${b.lastSupply}%</b></div><div><small>Products launched</small><b>${b.products} / 4</b></div><div><small>Process savings</small><b>${b.efficiency * 8}%</b></div></div><div class="detail-grid"><div><h3>People & risk</h3><label class="field">Salary versus local market<select id="salary-${b.id}">${[0.8, 1, 1.15, 1.3].map((n) => `<option value="${n}" ${b.salary === n ? "selected" : ""}>${Math.round(n * 100)}% · ${money(type(b).wage * s.inflation * c.wages * n)} / employee</option>`).join("")}</select></label><label class="field">Monthly training budget<input id="training-${b.id}" type="number" min="0" max="20000" step="100" value="${b.training}"></label><label class="field">Monthly preventive maintenance<input id="maintenance-${b.id}" type="number" min="0" max="2000" step="100" value="${b.maintenance}"></label><label class="field">Insurance coverage<select id="insurance-${b.id}"><option value="no" ${!b.insured ? "selected" : ""}>Self-insured · pay full incident cost</option><option value="yes" ${b.insured ? "selected" : ""}>Covered · ${money(250 * b.level)}/month · 15% deductible</option></select></label><p class="explain">Below-market wages erode morale. Training builds skill and morale. Low morale reduces capacity and can trigger resignations. Maintenance reduces breakdown odds; insurance covers damage but does not prevent lost output.</p></div><div><h3>Supply & location</h3><label class="field">Supplier<select id="supplier-${b.id}">${SUPPLIERS.map((p) => `<option value="${p.id}" ${b.supplier === p.id ? "selected" : ""}>${p.name} · ${Math.round(p.cost * 100)}% cost · ${Math.round(p.reliability * 100)}% reliability</option>`).join("")}</select></label><p class="explain">${p.desc} Current materials cost: ${money(f.unit)}/unit. Carbon intensity ${p.carbon}×.</p><label class="field">Operating city<select id="city-${b.id}">${CITIES.map((c) => `<option value="${c.id}" ${b.city === c.id ? "selected" : ""}>${c.name} · relocation ${money(c.setup + 3000)}</option>`).join("")}</select></label><p class="explain">Changing city costs its entry fee plus $3,000, and lowers reputation by 8. Future wages, rent, competition, and demand all change. Saving the current city is free.</p><div class="balance-line"><span>Last operational incident</span><b>${esc(b.lastIncident)}</b></div><br>${btn("Save operations plan", "s:operations:" + b.id)}</div></div><div class="project-strip"><div><h3>Product & process lab</h3><p class="explain">${b.project ? `${PROJECTS.find((p) => p.id === b.project.kind).name}: ${b.project.remaining} months until completion.` : "One project at a time. Pay upfront; benefits arrive on completion."}</p></div><div class="project-grid">${PROJECTS.map((p) => `<div class="research"><h3>${p.name}</h3><p>${p.desc}</p>${btn(`${money(p.cost)} · ${p.months} months`, "s:project:" + b.id + ":" + p.id, "small light", !!b.project || s.cash < p.cost || (p.id === "product" && b.products >= 4) || (p.id === "efficiency" && b.efficiency >= 4) || (p.id === "resilience" && b.resilient))}</div>`).join("")}</div></div></section>`;
            })
            .join("")}</div>`)
    );
  if (page === "Contracts")
    return (
      heading(
        "Bigger orders. Bigger commitments.",
        "Win business contracts, deliver on time, and manage the cash gap.",
      ) +
      `<div class="stats">${stat("Open contracts", w.contracts.filter((c) => c.status === "active").length, "Maximum two per business", "Businesses")}${stat("Accounts receivable", money(w.receivables.reduce((n, r) => n + r.amount, 0)), "Invoiced, not yet paid", "wallet")}${stat("Contracts delivered", w.delivered, "Completed orders earn reputation", "Achievements")}${stat("Contracts failed", w.failed, "Forfeited deposits plus penalties", "Banking")}</div><section class="card"><div class="card-head"><h2>The opportunity board</h2><span class="tag">REFRESHES EVERY 2 MONTHS</span></div><div class="contract-grid">${w.offers
        .map((o) => {
          let qualified = s.businesses.filter(
            (b) => b.type === o.type && b.reputation >= o.minRep,
          );
          return `<article class="research"><div class="split"><span class="tag">${TYPES.find((t) => t.id === o.type).sector}</span><small>Due month ${o.deadline + 1}</small></div><h3 style="margin-top:14px">${esc(o.client)}</h3><div class="amount">${money(o.units * o.price * invoicePolicy(s).price)}</div><p>${o.units} units at ${money(o.price * invoicePolicy(s).price)} each. Underwriting payment risk ${(invoicePolicy(s).risk * 100).toFixed(0)}% per due attempt. Requires reputation ${o.minRep}. Payment ${o.terms} months after each delivery.</p><p>Deposit ${money(o.deposit)} · Missed deadline penalty ${money(o.penalty)} plus lost deposit.</p>${qualified.length ? `<label class="field">Assign business<select id="contract-${o.id}">${qualified.map((b) => `<option value="${b.id}">${esc(b.name)}</option>`).join("")}</select></label>` : '<p class="negative">No qualifying business in this sector.</p>'}${btn("Sign contract", "s:contract:" + o.id, "small", !qualified.length || s.cash < o.deposit)}</article>`;
        })
        .join(
          "",
        )}</div><p class="explain">Contracts get first claim on inventory and capacity, before regular customers. Invoices count as revenue immediately, but the money arrives later and new customers can pay late or default. Prices above include the underwriting policy selected in Commerce. Keep working capital to fund production and wages. A completed contract returns its deposit. Companies with active contracts cannot be sold.</p></section><section class="card" style="margin-top:22px"><h2>Your order book</h2>${w.contracts.map((c) => `<div class="research"><div class="split"><h3>${esc(c.client)} · ${esc(s.businesses.find((b) => b.id === c.businessId)?.name || "Former business")}</h3><span class="tag">${c.status.toUpperCase()}</span></div><div class="progress"><div style="width:${(c.delivered / c.units) * 100}%"></div></div><div class="goal-row"><span>${c.delivered} / ${c.units} units delivered</span><span>Due month ${c.deadline + 1}</span></div></div>`).join("") || '<p class="explain">Your signed contracts will appear here.</p>'}<h3 style="margin-top:22px">Invoice schedule</h3>${w.receivables.map((r) => `<div class="balance-line"><span>${esc(r.client)} · due month ${r.due + 1}</span><b>${money(r.amount)}</b></div>`).join("") || '<p class="explain">No unpaid invoices.</p>'}</section>`
    );
  if (page === "Competitors")
    return (
      heading(
        "You’re not the only one with ambition.",
        "Local rivals compete for demand. Acquire them to consolidate your market.",
      ) +
      `<div class="catalog">${w.rivals.map((r) => `<section class="card"><div class="split"><div class="business-icon">${TYPES.find((t) => t.id === r.type).icon}</div><span class="tag">${CITIES.find((c) => c.id === r.city).name}</span></div><h2>${esc(r.name)}</h2><p>${TYPES.find((t) => t.id === r.type).sector}</p><div class="balance-line"><span>Competitive strength</span><b>${r.power.toFixed(2)}×</b></div><div class="balance-line"><span>Reputation</span><b>${Math.round(r.reputation)} / 100</b></div><div class="balance-line"><span>Indicative price</span><b>${money(r.price)}</b></div><div class="balance-line"><span>Acquisition price</span><b>${money(r.value)}</b></div>${btn("Review acquisition", "s:acquisition:" + r.id, "light", s.cash < r.value * 0.6)}</section>`).join("")}</div><p class="explain">Rival strength reduces your demand in the same sector and city. Prices, strength, reputation, and valuations evolve monthly. An acquisition adds a level 2 company with 3 employees and removes that rival. The acquired business may still compete with your other companies; integrate its operating plan carefully. Buying above asset resale value creates an immediate net-worth reduction.</p>` +
      integrationContent(s, h)
    );
  if (page === "Treasury") {
    let termDebt = w.bonds.reduce((n, b) => n + b.balance, 0);
    return (
      heading(
        "Capital has a cost. Timing matters.",
        "Match long-term investments with financing you can sustain.",
      ) +
      `<div class="stats">${stat("Credit score", w.creditScore, "Contracts and leverage affect rating", "Achievements")}${stat("Term debt", money(termDebt), "Fixed rates · monthly amortization", "Banking")}${stat("Revolving debt", money(s.debt - termDebt), "Variable interest · repay in Banking", "wallet")}${stat("Receivables", money(w.receivables.reduce((n, r) => n + r.amount, 0)), "Future cash from signed orders", "Markets")}</div><div class="detail-grid"><section class="card"><h2>Finance an expansion</h2><p class="explain">Borrow a term loan at a fixed rate based on today’s base rate and your credit score. Principal is repaid in equal monthly installments, plus interest on the remaining balance. This is separate from your variable-rate credit line.</p><label class="field">Loan amount<input id="termAmount" type="number" min="1000" value="10000" step="1000"></label><label class="field">Repayment term<select id="termMonths"><option value="12">12 months</option><option value="24">24 months</option><option value="36">36 months</option></select></label><div class="balance-line"><span>Fixed annual rate if borrowed now</span><b>${(Math.max(0.04, s.rate + (700 - w.creditScore) / 10000 + 0.01) * 100).toFixed(2)}%</b></div><p class="explain">Available term facility: ${money(Math.max(0, Math.max(25000, s.cash * 0.7) - s.debt))}. Loan repayments reduce cash even when your business is unprofitable.</p><br>${btn("Take term loan", "s:term")}</section><section class="card"><h2>Repayment calendar</h2>${w.bonds.map((b, i) => `<div class="research"><div class="split"><h3>Term facility ${i + 1}</h3><span class="tag">${(b.rate * 100).toFixed(2)}% FIXED</span></div><div class="balance-line"><span>Remaining principal</span><b>${money(b.balance)}</b></div><div class="balance-line"><span>Next principal + interest</span><b>${money(Math.min(b.payment, b.balance) + (b.balance * b.rate) / 12)}</b></div><small>Approximately ${Math.ceil(b.balance / b.payment)} payments remaining</small></div>`).join("") || '<p class="explain">No term loans. Your balance sheet has room to breathe.</p>'}<p class="explain">Unpaid invoices, refundable active deposits, and inventory at recorded acquisition cost are included in net worth. Debt appears in full. Cash can still run out while your net worth is positive.</p></section></div>`
    );
  }
  return "";
}
export function strategyAction(parts, s, h) {
  const { money, esc, btn, modal, close, changed, toast } = h;
  let [, action, id, extra] = parts;
  ensureWorld(s);
  let b = s.businesses.find((b) => String(b.id) === id);
  switch (action) {
    case "operations": {
      let salary = Number(document.querySelector("#salary-" + id).value),
        training = Number(document.querySelector("#training-" + id).value),
        maintenance = Number(
          document.querySelector("#maintenance-" + id).value,
        ),
        supplierId = document.querySelector("#supplier-" + id).value,
        cityId = document.querySelector("#city-" + id).value,
        insured = document.querySelector("#insurance-" + id).value === "yes";
      if (
        ![0.8, 1, 1.15, 1.3].includes(salary) ||
        !Number.isFinite(training) ||
        training < 0 ||
        training > 20000 ||
        !Number.isFinite(maintenance) ||
        maintenance < 0 ||
        maintenance > 2000
      )
        return toast("Use valid training and maintenance budgets.");
      let c = CITIES.find((c) => c.id === cityId);
      ensureLate(s);
      if (!regionFor(s, { city: cityId }).access)
        return toast("Open this region in International before relocating.");
      let cost = cityId === b.city ? 0 : c.setup + 3000;
      if (s.cash < cost) return toast("Not enough cash to relocate.");
      s.cash -= cost;
      if (cost) {
        b.reputation = Math.max(20, b.reputation - 8);
        log(s, "Relocated " + b.name + " to " + c.name, -cost);
      }
      Object.assign(b, {
        salary,
        training,
        maintenance,
        supplier: supplierId,
        city: cityId,
        insured,
      });
      changed("Operations plan updated.");
      break;
    }
    case "project":
      if (launchProject(s, b, extra)) {
        log(
          s,
          "Started " + extra + " project at " + b.name,
          -PROJECTS.find((p) => p.id === extra).cost,
        );
        changed("Project funded. Work begins this month.");
      } else
        toast("Project cannot be started with the current funds or limits.");
      break;
    case "contract": {
      let businessId = Number(document.querySelector("#contract-" + id)?.value);
      if (acceptContract(s, id, businessId)) {
        log(
          s,
          "Contract signed; security deposit paid",
          -s.world.contracts.at(-1).deposit,
        );
        changed("Contract signed. Production will prioritize this order.");
      } else toast("Check cash, reputation, and the two-contract limit.");
      break;
    }
    case "acquisition": {
      let r = s.world.rivals.find((r) => r.id === id);
      if (!r) return;
      modal(
        `<h2>Acquire ${esc(r.name)}?</h2><p>Purchase price ${money(r.value)} for a level 2 ${TYPES.find((t) => t.id === r.type).name} in ${CITIES.find((c) => c.id === r.city).name}. It comes with three employees, its current reputation, and no inventory. Be ready to fund payroll and materials.</p><label class="field">Integration approach<select id="deal-plan">${Object.entries(
          INTEGRATION_PLANS,
        )
          .map(
            ([id, p]) =>
              `<option value="${id}">${p.name} · ${p.months} months · ${money(r.value * p.cost)}/month</option>`,
          )
          .join("")}</select></label>${Object.values(INTEGRATION_PLANS)
          .map((p) => `<p><b>${p.name}:</b> ${p.desc}</p>`)
          .join(
            "",
          )}<label class="field">Payment structure<select id="deal-financing"><option value="cash">All cash · ${money(r.value)} upfront</option><option value="seller">Seller financing · ${money(r.value * 0.6)} upfront, ${money(r.value * 0.4)} over 12 months at 10% annual interest</option></select></label><div class="actions">${btn("Cancel", "close", "light")}${btn("Complete acquisition", "s:buyrival:" + id)}</div>`,
      );
      break;
    }
    case "buyrival": {
      let r = s.world.rivals.find((r) => r.id === id);
      const plan = document.querySelector("#deal-plan")?.value,
        financing = document.querySelector("#deal-financing")?.value;
      const quote = acquisitionQuote(r, plan, financing);
      if (!quote || s.cash < quote.upfront)
        return toast("Not enough cash for this payment structure.");
      ensureLate(s);
      if (!regionFor(s, { city: r.city }).access)
        return toast("Open this region in International first.");
      let base = TYPES.find((t) => t.id === r.type).cost;
      let originalCash = s.cash;
      s.cash += base;
      if (!start(s, r.type, r.name)) {
        s.cash = originalCash;
        return toast("Acquisition could not be completed.");
      }
      s.cash = originalCash - quote.upfront;
      let acquired = s.businesses.at(-1);
      Object.assign(acquired, {
        city: r.city,
        level: 2,
        staff: 3,
        reputation: r.reputation,
        price: r.price,
      });
      recordAcquisition(s, acquired, r.value, plan, financing);
      s.world.rivals = s.world.rivals.filter((x) => x !== r);
      log(s, "Acquisition consideration: " + r.name, -r.value);
      close();
      changed(
        "Acquisition completed. Integration and any seller financing start next month.",
      );
      break;
    }
    case "term": {
      let amount = Number(document.querySelector("#termAmount").value),
        term = Number(document.querySelector("#termMonths").value);
      if (financeLoan(s, amount, term)) {
        log(s, "Term loan originated", amount);
        changed("Loan funded. Monthly repayments begin next month.");
      } else toast("Amount exceeds your facility or is below $1,000.");
      break;
    }
  }
}
