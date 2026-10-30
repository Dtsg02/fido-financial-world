import { commitmentCalendar } from "./commerce.js?v=830bc158a7cf";
import {
  commerce,
  SUPPLY_HOUSES,
  tradeLiabilities,
  creditLimit,
  quoteSupply,
  signSupply,
  terminationFee,
  cancelSupply,
  payInvoice,
  routeAllowed,
  addRoute,
  factorInvoice,
} from "./commerce.js?v=830bc158a7cf";
import { forecast } from "./engine.js?v=830bc158a7cf";
export function commerceContent(s, h) {
  const c = commerce(s),
    { heading, btn, money, esc, stat } = h;
  const name = (id) =>
    esc(s.businesses.find((b) => b.id === id)?.name || "Closed business");
  return (
    heading(
      "Growth has a working-capital cost.",
      "Lock supply prices, connect your businesses, and manage who gets paid when.",
    ) +
    `<div class="stats">${stat("Trade payables", money(tradeLiabilities(s)), "Separate from bank debt", "Banking")}${stat("Supplier collateral", money(c.agreements.reduce((n, a) => n + a.deposit, 0)), "Released after expiry and settlement", "Treasury")}${stat("Customer invoices", money(s.world.receivables.reduce((n, a) => n + a.amount, 0)), "Revenue is not cash in the bank", "Contracts")}${stat("Goods in transit", money(c.shipments.reduce((n, x) => n + x.value, 0)), "Internal deliveries arrive next month", "Supply")}</div>
<section class="card industry-card"><div class="split"><div><span class="tag">PROCUREMENT</span><h2>Supply agreements</h2></div>${btn("Negotiate supply", "commerce:new", "", !s.businesses.length)}</div><p>Fixed monthly orders arrive before production, even with automatic purchasing switched off. Extra stock stays in inventory. Choose low prices, continuity, or longer credit; maintain cash for collateral and invoices.</p><div class="catalog">${
      c.agreements
        .map((a) => {
          const v = SUPPLY_HOUSES.find((v) => v.id === a.supplier);
          return `<div class="product-row"><span class="tag">${a.status.toUpperCase()}</span><h3>${name(a.businessId)}</h3><p>${v.name} · ${a.remaining} / ${a.months} months remaining<br>${a.units} units/month at $${a.price.toFixed(2)} each<br>${a.terms ? "Pay " + a.terms + " months after delivery" : "Cash on delivery"} · Collateral ${money(a.deposit)}</p><div class="balance-line"><span>Last delivery</span><b>${a.delivered} / ${a.units}</b></div><p>${a.missed} short-delivery months</p><div class="actions">${btn(a.fallback ? "Spot fallback: on" : "Spot fallback: off", "commerce:fallback:" + a.id, "light")}${btn("End agreement · " + money(terminationFee(a)), "commerce:cancel:" + a.id, "light", c.payables.some((p) => p.agreementId === a.id) || s.cash + a.deposit < terminationFee(a))}</div></div>`;
        })
        .join("") ||
      "<p>No committed orders. Existing spot purchasing remains available.</p>"
    }</div><p class="explain">Credit limits depend on business value and reputation. Deliveries can be partial when credit is exhausted. Late payment adds 2% to the unpaid balance per month and suspends the agreement until arrears are settled. Early termination costs 8% of remaining committed purchases. Collateral remains yours until released.</p></section>
<section class="card industry-card"><div class="split"><div><span class="tag">VERTICAL INTEGRATION</span><h2>Production routes</h2></div>${btn("Connect businesses", "commerce:route", "", s.businesses.length < 2)}</div><p>Reserve upstream production for your own downstream business. B2B contracts receive capacity first, then internal routes, then retail customers. Internal transfers generate no sales revenue.</p>${c.routes.map((r) => `<div class="product-row"><div class="split"><h3>${name(r.from)} → ${name(r.to)}</h3><span class="tag">${r.enabled ? "ENABLED" : "PAUSED"}</span></div><p>Target ${r.units} upstream units/month · Last sent ${r.lastSent} → ${r.lastReceived} downstream input units</p><div class="actions">${btn(r.enabled ? "Pause" : "Resume", "commerce:routepause:" + r.id, "light")}${btn("Remove route", "commerce:routeremove:" + r.id, "light")}</div></div>`).join("") || "<p>Build complementary companies to start an internal supply network.</p>"}<p class="explain">One outgoing route per source. Conversion uses current material prices at 90% physical efficiency, plus 2.5% freight paid immediately. Actual acquisition cost and freight are carried into the resulting inventory; lower yield raises its cost per unit. Deliveries arrive next month, so chains need working capital and buffer stock. Routes consume real inventory and production capacity; they cannot create free output. Removing a route does not cancel goods already in transit.</p>${c.shipments.map((x) => `<div class="balance-line"><span>${name(x.from)} → ${name(x.to)} · ${x.units} units</span><b>Month ${x.due + 1}</b></div>`).join("")}</section>
<section class="card industry-card"><span class="tag">CREDIT CONTROL</span><h2>Customer underwriting</h2><p>Set terms for newly accepted B2B contracts. Existing contracts keep their signed risk and price. Probability below is the chance a due invoice misses a payment attempt; recessions multiply it by 1.6. A third missed attempt defaults with 30% recovery.</p><div class="actions">${[
      ["strict", "Strict · 2% risk · −3% price"],
      ["standard", "Standard · 7% risk · quoted price"],
      ["growth", "Growth · 18% risk · +6% price"],
    ]
      .map(([id, label]) =>
        btn(
          (c.customerPolicy === id ? "✓ " : "") + label,
          "commerce:policy:" + id,
          c.customerPolicy === id ? "" : "light",
          c.customerPolicy === id,
        ),
      )
      .join(
        "",
      )}</div><div class="balance-line"><span>Lifetime write-offs</span><b>${money(c.badDebt)}</b></div><div class="balance-line"><span>Lifetime factoring fees</span><b>${money(c.factoring)}</b></div><h3>Outstanding customer invoices</h3>${s.world.receivables.map((r, i) => `<div class="product-row"><div class="split"><h3>${esc(r.client)}</h3><b>${money(r.amount)}</b></div><p>Due month ${r.due + 1} · ${r.late ? "Late: " + r.late + " missed attempts" : r.risk ? Math.round(r.risk * 100) + "% payment risk" : "Legacy guaranteed invoice"}</p>${btn("Sell invoice · " + money(r.amount * (1 - Math.min(0.2, 0.025 + 0.015 * (r.due - s.month)))), "commerce:factor:" + i, "light", r.due <= s.month || !!r.late)}</div>`).join("") || "<p>No customer invoices outstanding.</p>"}<p class="explain">Factoring sells a not-yet-due invoice without recourse: instant cash, no future collection. Fee: 2.5% plus 1.5% per month until due, capped at 20%. Late invoices cannot be factored.</p></section>
<section class="card industry-card"><h2>Six-month commitment calendar</h2><p>Scheduled collections versus committed supply, construction and debt payments. Assumes full delivery and construction funding; excludes new sales, payroll, rent, future tax accruals, interest discounts, and potential defaults. This is a commitments schedule, not a cash-runway forecast.</p><div class="catalog">${commitmentCalendar(
      s,
    )
      .map(
        (r) =>
          `<div class="product-row"><h3>Month ${r.month + 1}</h3><div class="balance-line"><span>Customer invoices due</span><b>${money(r.receivables)}</b></div><div class="balance-line"><span>Supplier invoices & orders</span><b>−${money(r.supplier)}</b></div><div class="balance-line"><span>Construction installments</span><b>−${money(r.construction)}</b></div><div class="balance-line"><span>Debt principal & interest</span><b>−${money(r.debtService)}</b></div><div class="balance-line"><span>Accrued taxes due</span><b>−${money(r.tax)}</b></div><div class="balance-line"><span>Integration budgets</span><b>−${money(r.integration)}</b></div><div class="balance-line"><span>Scheduled net</span><b class="${r.net < 0 ? "negative" : "positive"}">${money(r.net)}</b></div></div>`,
      )
      .join(
        "",
      )}</div></section><section class="card industry-card"><h2>Accounts payable</h2>${c.payables.map((p) => `<div class="balance-line"><span>${name(p.businessId)} · Due month ${p.due + 1}${p.due <= s.month ? " · DUE / OVERDUE" : ""}<br>${money(p.amount)}</span>${btn("Settle invoice", "commerce:pay:" + p.id, "light", s.cash < p.amount)}</div>`).join("") || "<p>No trade credit outstanding.</p>"}<p class="explain">Available cash settles due invoices automatically, oldest first. These liabilities reduce net worth. Paying principal does not create another operating expense.</p></section><section class="card"><h2>Commercial activity</h2>${
      c.reports
        .slice(0, 15)
        .map(
          (r) =>
            `<div class="balance-line"><span>${esc(r.text)}</span><small>Month ${r.month + 1}</small></div>`,
        )
        .join("") ||
      "<p>Your first agreements and deliveries will appear here.</p>"
    }</section>`
  );
}
export function commerceAction(parts, s, h) {
  const [, action, id] = parts,
    c = commerce(s),
    { btn, money, esc, modal, close, changed, toast } = h;
  let a = c.agreements.find((a) => a.id === Number(id)),
    r = c.routes.find((r) => r.id === Number(id));
  if (action === "new") {
    modal(
      `<h2>Negotiate committed supply</h2><label class="field">Business<select id="supply-business">${s.businesses
        .filter((b) => !c.agreements.some((a) => a.businessId === b.id))
        .map((b) => `<option value="${b.id}">${esc(b.name)}</option>`)
        .join(
          "",
        )}</select></label><label class="field">Supply house<select id="supply-house">${SUPPLY_HOUSES.map((v) => `<option value="${v.id}">${v.name} · ${(v.price * 100).toFixed(0)}% spot · ${(v.reliability * 100).toFixed(1)}% full-delivery chance</option>`).join("")}</select></label><label class="field">Units per month<input id="supply-units" type="number" min="1" value="100"></label><label class="field">Duration<select id="supply-duration"><option value="6">6 months</option><option value="12">12 months · 3% discount</option><option value="24">24 months · 7% discount</option></select></label><label class="field">Payment delay<select id="supply-terms"><option value="0">Cash on delivery</option><option value="1">1 month · +2.5% price</option><option value="2">2 months · +5% price (Global / Industrial)</option><option value="3">3 months · +7.5% price (Industrial only)</option></select></label><div class="actions">${btn("Review quote", "commerce:quote")}${btn("Cancel", "close", "light")}</div>`,
    );
    return;
  }
  if (action === "quote") {
    const b = s.businesses.find(
      (b) => b.id === Number(document.querySelector("#supply-business").value),
    );
    if (!b) return toast("Every business already has an agreement.");
    const supplier = document.querySelector("#supply-house").value,
      units = Number(document.querySelector("#supply-units").value),
      months = Number(document.querySelector("#supply-duration").value),
      terms = Number(document.querySelector("#supply-terms").value),
      base = forecast(s, b).unit,
      q = quoteSupply(s, b, supplier, units, months, terms, base);
    if (!q)
      return toast(
        "Check quantity and the supplier’s supported payment terms.",
      );
    modal(
      `<h2>Review supply commitment</h2><p>${esc(b.name)} · ${units} units/month for ${months} months.<br>Fixed unit price $${q.price.toFixed(2)}<br>Monthly invoice ${money(q.commitment)}<br>Refundable collateral ${money(q.deposit)}<br>Trade credit limit ${money(creditLimit(s, b))}<br>Payment ${terms ? "in " + terms + " months" : "on delivery"}.</p><p>Orders continue even when stock is not needed. Late payments suspend deliveries. Ending early costs 8% of remaining orders.</p><div class="actions">${btn("Sign agreement", `commerce:sign:${b.id}:${supplier}:${units}:${months}:${terms}:${base}`, "", s.cash < q.deposit || (terms > 0 && q.commitment > creditLimit(s, b)))}${btn("Cancel", "close", "light")}</div>`,
    );
    return;
  }
  if (action === "sign") {
    const b = s.businesses.find((b) => b.id === Number(id));
    if (
      b &&
      signSupply(
        s,
        b,
        parts[3],
        Number(parts[4]),
        Number(parts[5]),
        Number(parts[6]),
        Number(parts[7]),
      )
    ) {
      close();
      changed("Supply agreement signed.");
    } else toast("Agreement could not be funded.");
    return;
  }
  if (action === "fallback" && a) {
    a.fallback = !a.fallback;
    changed("Spot purchasing fallback updated.");
    return;
  }
  if (action === "cancel") {
    if (cancelSupply(s, Number(id))) changed("Supply agreement ended.");
    else toast("Settle invoices and fund the termination fee first.");
    return;
  }
  if (action === "pay") {
    if (payInvoice(s, Number(id))) changed("Supplier invoice settled.");
    return;
  }
  if (action === "policy" && ["strict", "standard", "growth"].includes(id)) {
    c.customerPolicy = id;
    changed("Underwriting applies to new contracts.");
    return;
  }
  if (action === "factor") {
    if (factorInvoice(s, Number(id)))
      changed("Invoice sold; proceeds received.");
    return;
  }
  if (action === "routepause" && r) {
    r.enabled = !r.enabled;
    changed("Route updated.");
    return;
  }
  if (action === "routeremove") {
    c.routes = c.routes.filter((r) => r.id !== Number(id));
    changed("Route removed; existing shipments remain in transit.");
    return;
  }
  if (action === "route") {
    const pairs = s.businesses.flatMap((from) =>
      s.businesses
        .filter(
          (to) =>
            routeAllowed(from, to) && !c.routes.some((r) => r.from === from.id),
        )
        .map((to) => ({ from, to })),
    );
    modal(
      `<h2>Connect production</h2>${pairs.length ? `<label class="field">Compatible companies<select id="route-pair">${pairs.map(({ from, to }) => `<option value="${from.id}:${to.id}">${esc(from.name)} → ${esc(to.name)}</option>`).join("")}</select></label><label class="field">Upstream units per month<input id="route-units" type="number" min="1" value="100"></label><p>Consumes production capacity after B2B commitments. Conversion retains 90% of material value, charges 2.5% freight, and takes one month.</p>${btn("Create route", "commerce:connect")}` : "<p>No available compatible pair. Examples: farm → bakery, recycling → factory, chip foundry → data center, data center → software. Each source supports one outgoing route.</p>"}${btn("Close", "close", "light")}`,
    );
    return;
  }
  if (action === "connect") {
    const [from, to] = document
        .querySelector("#route-pair")
        .value.split(":")
        .map(Number),
      source = s.businesses.find((b) => b.id === from),
      target = s.businesses.find((b) => b.id === to),
      units = Number(document.querySelector("#route-units").value);
    if (source && target && addRoute(s, source, target, units)) {
      close();
      changed("Production route created.");
    } else toast("Check capacity and route availability.");
  }
}
