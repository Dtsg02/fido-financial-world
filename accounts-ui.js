import { taxOffice, nextTaxMonth } from "./tax.js?v=6e353cd01f78";
import {
  workingCapital,
  purchasing,
  setPurchasing,
  liquidityDrill,
} from "./accounts.js?v=6e353cd01f78";
import { stockValue } from "./inventory.js?v=6e353cd01f78";
export function accountsContent(s, h) {
  const { heading, money, esc, btn, stat } = h,
    w = workingCapital(s);
  const tax = taxOffice(s),
    lastTax = tax.history.at(-1);
  const history = s.accounts?.history || [],
    last = history.at(-1);
  const row = (label, value) =>
    `<div class="balance-line"><span>${label}</span><b>${money(value)}</b></div>`;
  return (
    heading(
      "Know where the money went.",
      "Actual inventory costs, operating margins, cash movement, and working-capital decisions.",
    ) +
    `<div class="stats">${stat("Stock at acquisition cost", money(w.stock + w.raw), "Includes raw materials; excludes transit", "Supply")}${stat("Working capital tied up", money(w.tiedUp), "Stock + transit + invoices − trade payables", "Commerce")}${stat("Last cash movement", money(last?.cashChange || 0), "Measured between monthly closes", "Banking")}${stat("Past-due customers", money(w.aging.slice(1).reduce((a, b) => a + b, 0)), "Collections can lag recognized revenue", "Contracts")}</div>
  <div class="detail-grid"><section class="card"><h2>Monthly management statement</h2>${last ? row("Business revenue", last.revenue) + row("Cost of goods sold", -last.cogs) + row("Gross profit", last.gross) + row("Inventory write-offs", -last.writeoffs) + row("Business overhead", -last.overhead) + row("Group modeled net profit", last.profit) + row("Opening cash", last.openingCash) + row("Closing cash", last.closingCash) + row("Cash movement", last.cashChange) + row("Cash movement less modeled profit", last.cashChange - last.profit) : "<p>Advance one month to close your first statement.</p>"}<p class="explain">Management accounts, not audited financial statements. Group profit includes modeled portfolio income, taxes, interest and living costs. Cash differs because of credit, stock purchases, construction, investing and financing. The difference is an aggregate reconciliation, not a categorized cash-flow statement. Actions between turns are outside the monthly opening-to-closing cash window.</p></section>
  <section class="card"><h2>Collections and working capital</h2>${row("Current / not overdue invoices", w.aging[0]) + row("One month overdue", w.aging[1]) + row("Two months overdue", w.aging[2]) + row("Three or more months overdue", w.aging[3]) + row("Owned goods in transit", w.transit) + row("Work in progress", w.workInProgress) + row("Supplier payables", -w.payables)}<p class="explain">A sale on credit creates revenue before cash arrives. Supplier credit preserves cash but creates a payable. Internal deliveries create no group revenue; their acquisition cost and freight remain in stock until sold. Use Commerce to collect early through factoring or settle suppliers.</p></section></div>
  <section class="card industry-card"><h2>Company margins and purchasing mandates</h2><p>Choose the tradeoff between resilient inventory and cash tied up in stock. Buffers apply to automatic spot purchasing, including planned contract and internal-route production. Standing supply agreements remain binding and can spend below your spot-purchasing reserve.</p><div class="catalog">${
    s.businesses
      .map((b) => {
        const a = b.lastAccounts,
          p = purchasing(b);
        return `<section class="product-row"><h3>${esc(b.name)}</h3>${row("Stock carrying value", stockValue(b))}${row("Average acquisition cost / unit", b.inventory ? stockValue(b) / b.inventory : 0)}${a ? row("Revenue", a.revenue) + row("Cost of sales", -a.costOfSales) + row("Write-offs", -a.writeoffs) + row("Operating profit", a.profit) + `<p>Gross margin ${a.revenue ? ((100 * a.gross) / a.revenue).toFixed(1) : "0.0"}% · ${b.inventory.toLocaleString()} units on hand</p>` : "<p>No monthly close yet.</p>"}<label class="field">Extra months of target stock<input id="buffer-${b.id}" type="number" min="0" max="3" step="0.25" value="${p.buffer}"></label><label class="field">Minimum group cash after spot purchases<input id="reserve-${b.id}" type="number" min="0" step="100" value="${p.reserve}"></label><label class="field">Order batch size (units)<input id="batch-${b.id}" type="number" min="1" max="10000" step="1" value="${p.batch}"></label>${btn("Save purchasing mandate", "accounts:policy:" + b.id)}<p class="explain">Storage and cash limits can prevent a full batch. Larger buffers can spoil or become obsolete; reserves may cause missed sales. Manual buying and warehouse production are separate decisions.</p></section>`;
      })
      .join("") || "<p>Start a business to create purchasing mandates.</p>"
  }</div></section>
  <section class="card industry-card"><h2>Tax office</h2><p>Fictional group tax rules: losses carry forward for 120 months and can offset up to 80% of a profitable month's taxable income. Oldest losses are used first. No cash refund is created by a loss. Tax accrues monthly and is paid automatically every third simulation month; outstanding tax reduces net worth.</p><div class="detail-grid"><div>${row("Tax payable", tax.payable)}${row(
    "Losses available to carry forward",
    tax.losses.reduce((n, l) => n + l.amount, 0),
  )}${row("Cumulative cash tax paid", tax.totalPaid)}${row("Expired unused losses", tax.expired)}<p>Next settlement: month ${nextTaxMonth(s) + 1}. New accruals before that date will add to the bill. Emergency credit may fund a cash shortfall.</p></div><div>${lastTax ? row("Modeled taxable income before relief", lastTax.income) + row("Loss relief used", lastTax.offset) + row("Current provision", lastTax.provision) + row("Cash tax paid this month", lastTax.paid) : "<p>No tax period closed yet.</p>"}${
    tax.losses.length
      ? "<h3>Expiring loss vintages</h3>" +
        tax.losses
          .slice(0, 12)
          .map((l) => row("Expires month " + (l.expires + 1), l.amount))
          .join("")
      : "<p>No unused tax losses.</p>"
  }</div></div></section>
  <section class="card industry-card"><h2>Twelve-month liquidity drill</h2><p>Can today's cash cover signed commitments if fresh trading contributes no cash? Compare collection outcomes before funding more expansion. This drill includes supplier commitments, facility installments, integration budgets, seller notes, term-loan principal, current-rate credit interest, and corporate coupons and bullet maturities, and already-accrued taxes. It assumes debts are paid on schedule, no refinancing, and fixed current rates. It excludes future sales, payroll, rent, future tax accruals, new investments, collateral returns and interest discounts.</p><div class="catalog">${[
    [1, "Full invoice collection"],
    [0.7, "30% collection shortfall"],
    [0.4, "60% collection shortfall"],
  ]
    .map(([rate, label]) => {
      const d = liquidityDrill(s, rate);
      return `<section class="product-row"><h3>${label}</h3>${row("Lowest projected cash", d.minimum)}${row("Additional funding required", d.fundingGap)}<p>${d.firstGap === null ? "No contractual cash gap within 12 months." : "First contractual cash gap: month " + (d.firstGap + 1)}</p><details><summary>Inspect monthly obligations</summary>${d.rows.map((r) => row("Month " + (r.month + 1) + " · closing cash", r.cash)).join("")}</details></section>`;
    })
    .join("")}</div></section>
  <section class="card industry-card"><h2>Ten-year closing history</h2><p>Up to 120 monthly records, starting when this accounting system is first used.</p>${
    history
      .slice()
      .reverse()
      .map(
        (r) =>
          `<details><summary>Month ${r.month + 1} · Profit ${money(r.profit)} · Cash ${money(r.cashChange)}</summary>${row("Revenue", r.revenue) + row("Cost of sales", -r.cogs) + row("Stock losses", -r.writeoffs) + row("Working capital", r.workingCapital)}</details>`,
      )
      .join("") || "<p>No closes yet.</p>"
  }</section>`
  );
}
export function accountsAction(parts, s, h) {
  const b = s.businesses.find((b) => b.id === Number(parts[2]));
  if (!b) return;
  const read = (id) => Number(document.getElementById(`${id}-${b.id}`).value);
  if (setPurchasing(b, read("buffer"), read("reserve"), read("batch")))
    h.changed("Purchasing mandate saved.");
  else
    h.toast(
      "Choose buffer 0–3, nonnegative cash reserve, and a whole batch size 1–10,000.",
    );
}
