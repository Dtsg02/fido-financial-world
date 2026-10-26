import {
  TYPES,
  ASSETS,
  PROPERTIES,
  forecast,
  worth,
  advance,
  resolve,
  log,
} from "./engine.js";
import { INDUSTRY } from "./catalog.js";
import {
  COMMODITIES,
  CITIES,
  city,
  productivity,
  materialFactor,
  demandFactor,
} from "./world.js";
import {
  ROLES,
  FX,
  RESEARCH,
  MISSIONS,
  ensureEmpire,
  bonus,
  has,
  quoteWarehouse,
  orderMaterials,
  hire,
  dismiss,
  fxTrade,
  placeOrder,
  openShort,
  shortEquity,
  closeShort,
  optionQuote,
  buyOption,
  equityRaise,
  buyback,
  valuation,
  corporateResearch,
  franchise,
  upgradeProperty,
  claim,
  customerMultiplier,
  deepMaterial,
  deepCapacity,
} from "./empire.js";
export const expansionPages = [
  "Supply",
  "Talent",
  "Exchange",
  "Trading",
  "Ownership",
  "Innovation",
  "Development",
  "Franchises",
  "Milestones",
  "Planner",
];
export function expansionContent(page, s, h) {
  let e = ensureEmpire(s);
  let { heading, btn, money, esc, stat, spark } = h;
  const section = (title, body) =>
    `<section class="card"><h2>${title}</h2>${body}</section>`;
  if (page === "Supply")
    return (
      heading(
        "The things your businesses run on.",
        "Buy raw materials ahead of time. Balance price, delivery time, and storage costs.",
      ) +
      `<div class="stats">${stat("Warehouse value", money(e.warehouse.reduce((n, v, i) => n + v * s.world.commodities[i], 0)), "Marked at current commodity prices", "Properties")}${stat("Inbound shipments", e.shipments.length, "Owned assets in transit", "Markets")}${stat("Connected businesses", s.businesses.filter((b) => b.warehouse).length, "Production draws from shared inventory", "Businesses")}${stat("Monthly storage", money(e.warehouse.reduce((n, v, i) => n + v * s.world.commodities[i] * 0.005, 0)), "0.5% of warehouse market value", "wallet")}</div><div class="detail-grid">${section("Procurement desk", `<label class="field">Commodity<select id="warehouseCommodity">${COMMODITIES.map((c, i) => `<option value="${i}">${c.name} · ${money(s.world.commodities[i])} / lot</option>`).join("")}</select></label><label class="field">Lots to order<input id="warehouseLots" type="number" min="1" max="100000" value="10"></label><label class="field">Shipping<select id="warehouseMode"><option value="standard">Standard · 2 months · 2.5% freight</option><option value="express">Express · 1 month · 8% freight</option></select></label>${btn("Review purchase", "x:warehousequote")}<p class="explain">Prices are locked when you order. Warehouse stock is shared. Each business draws material lots equal to its material cost divided by the commodity index. Food stock loses ${has(s, "coldchain") ? "0.5" : "2"}% per month. A logistics company and routing research reduce freight charges.</p>`)}${section("Inventory & arrivals", COMMODITIES.map((c, i) => `<div class="balance-line"><span>${c.name}</span><b>${e.warehouse[i].toFixed(2)} lots</b></div>`).join("") + `<h3 style="margin-top:22px">In transit</h3>${e.shipments.map((x) => `<div class="balance-line"><span>${COMMODITIES[x.index].name} · ${x.lots} lots</span><b>Month ${x.due + 1}</b></div>`).join("") || '<p class="explain">No inbound shipments.</p>'}`)}</div><section class="card" style="margin-top:22px"><h2>Connect your production network</h2>${s.businesses.map((b) => `<div class="network-row"><div><h3>${esc(b.name)}</h3><small>${COMMODITIES[INDUSTRY[b.type].commodity].name} · ${city(b).name}</small></div><label class="field">Procurement source<select id="source-${b.id}"><option value="supplier" ${!b.warehouse ? "selected" : ""}>Direct supplier</option><option value="hybrid" ${b.warehouse && b.warehouseFallback ? "selected" : ""}>Warehouse, then direct supplier</option><option value="only" ${b.warehouse && !b.warehouseFallback ? "selected" : ""}>Warehouse only · stop if empty</option></select></label>${btn("Update", "x:source:" + b.id, "small light")}</div>`).join("") || '<p class="explain">Start a company to connect it to your warehouse.</p>'}<p class="explain">Automatic purchasing must be enabled in the business screen for any production to replenish. Warehouse stock avoids direct supplier delivery failures, but you must order ahead. Buying bulk is a hedge against rising input prices, not a guaranteed discount.</p></section>`
    );
  if (page === "Talent")
    return (
      heading(
        "You can’t build an empire alone.",
        "Specialist leaders improve the entire group—but draw real monthly salaries.",
      ) +
      `<div class="stats">${stat("Executive team", e.executives.length + " / 6", "One leader per functional role", "Businesses")}${stat("Executive payroll", money(e.executives.reduce((n, c) => n + c.salary, 0)), "Paid each month, even during losses", "wallet")}${stat("Production bonus", Math.round(bonus(s, "coo") * 12) + "%", "From your operating chief", "Operations")}${stat("Demand bonus", Math.round(bonus(s, "cmo") * 18) + "%", "From your marketing chief", "Markets")}</div><section class="card"><h2>The leadership team</h2>${e.executives.map((c) => `<div class="network-row"><div class="avatar">${esc(c.name[0])}</div><div style="flex:1"><h3>${esc(c.name)}</h3><small>${ROLES.find((r) => r.id === c.role).name} · Skill ${c.skill}/100 · ${c.tenure} months in role</small></div><b>${money(c.salary)} / mo</b>${btn("Dismiss · " + money(c.salary * 2), "x:dismiss:" + c.id, "small danger")}</div>`).join("") || '<p class="explain">The founder currently wears every hat.</p>'}<p class="explain">Dismissal costs two months of salary. Salaries rise 4% after each year of service. Hiring is group-wide: one operating chief can benefit every company you own.</p></section><div class="card-head" style="margin-top:26px"><h2>Talent market</h2><span class="tag">NEW CANDIDATES EVERY QUARTER</span></div><div class="catalog">${e.candidates.map((c) => `<section class="card"><div class="split"><div class="avatar">${esc(c.name[0])}</div><span class="tag">SKILL ${c.skill}</span></div><h2>${esc(c.name)}</h2><p>${ROLES.find((r) => r.id === c.role).name}</p><p>${ROLES.find((r) => r.id === c.role).effect} Actual benefit scales with skill.</p><div class="balance-line"><span>Monthly salary</span><b>${money(c.salary)}</b></div><div class="balance-line"><span>Signing fee</span><b>${money(c.signing)}</b></div>${btn("Hire executive", "x:hire:" + c.id, "", s.cash < c.signing || e.executives.some((x) => x.role === c.role))}</section>`).join("")}</div>`
    );
  if (page === "Exchange")
    return (
      heading(
        "A treasury without borders.",
        "Hold foreign reserves and trade four fictional currencies against the dollar.",
      ) +
      `<div class="catalog">${FX.map((f, i) => `<section class="card"><div class="split"><span class="tag">${f.id} / USD</span><b>$${e.fx[i].toFixed(i === 2 ? 5 : 4)}</b></div><h2>${f.name}</h2>${spark(e.fxHistory[i], true)}<div class="balance-line"><span>Currency units held</span><b>${e.fxHoldings[i].toLocaleString(undefined, { maximumFractionDigits: 2 })}</b></div><div class="balance-line"><span>Dollar value</span><b>${money(e.fxHoldings[i] * e.fx[i])}</b></div><div class="actions">${btn("Buy", "x:fx:" + i + ":buy", "small")}${btn("Sell", "x:fx:" + i + ":sell", "small light", e.fxHoldings[i] <= 0)}</div></section>`).join("")}</div><p class="explain">Exchange rates update each month. Every conversion costs 0.2%. Currency reserves do not earn interest and are not automatically converted to cover operating costs. These are fictional rates and do not track live currencies.</p>`
    );
  if (page === "Trading")
    return (
      heading(
        "More instruments. More ways to be wrong.",
        "Limit orders, short positions, and cash-settled options for your fictional portfolio.",
      ) +
      `<div class="stats">${stat("Pending orders", e.orders.length, "Six-month validity · no cash reserved", "Contracts")}${stat("Short collateral", money(e.shorts.reduce((n, p) => n + p.collateral, 0)), "150% of opening notional", "Banking")}${stat("Short equity", money(e.shorts.reduce((n, p) => n + shortEquity(s, p), 0)), "Collateral plus unrealized P/L", "Markets")}${stat("Option positions", e.options.length, "10 underlying shares per contract", "Research")}</div><div class="catalog"><section class="card"><h2>Limit order</h2><p>Submit an instruction that executes only when the monthly closing price reaches your limit and funds or shares are available.</p>${btn("Create limit order", "x:orderform", "light")}</section><section class="card"><h2>Short sale</h2><p>Profit from a falling share price. Post 150% collateral, pay a 0.3% monthly borrow fee, and face automatic closure below 30% maintenance equity.</p>${btn("Open short position", "x:shortform", "light")}</section><section class="card"><h2>Options</h2><p>Buy calls or puts at the current strike for 1, 3, or 6 months. Pay the premium upfront. Cash settlement at expiry; your loss is limited to the premium.</p>${btn("Price an option", "x:optionform", "light")}</section></div><div class="stack" style="margin-top:22px">${section("Open limit orders", e.orders.map((o) => `<div class="balance-line"><span>${o.side.toUpperCase()} ${o.qty} ${ASSETS[o.asset].ticker} @ ${money(o.limit)} · expires month ${o.expires + 1}</span>${btn("Cancel", "x:cancelorder:" + o.id, "small light")}</div>`).join("") || '<p class="explain">No open orders. Orders are checked once at each month-end. No intramonth price paths are simulated.</p>')}${section("Short book", e.shorts.map((p) => `<div class="research"><div class="split"><h3>${p.qty} ${ASSETS[p.asset].ticker} short</h3><b class="${shortEquity(s, p) >= p.collateral ? "positive" : "negative"}">P/L ${money((p.entry - s.prices[p.asset]) * p.qty)}</b></div><p>Entry ${money(p.entry)} · Current ${money(s.prices[p.asset])} · Account equity ${money(shortEquity(s, p))}</p>${btn("Close position", "x:closeshort:" + p.id, "small light")}</div>`).join("") || '<p class="explain">No short exposure.</p>')}${section("Options book", e.options.map((p) => `<div class="balance-line"><span>${p.count} × ${ASSETS[p.asset].ticker} ${p.kind.toUpperCase()} · Strike ${money(p.strike)}<br><small>Premium paid ${money(p.total)} · Expires month ${p.expiry + 1}</small></span><b>Intrinsic ${money(Math.max(0, (s.prices[p.asset] - p.strike) * (p.kind === "call" ? 1 : -1)) * p.count * 10)}</b></div>`).join("") || '<p class="explain">No option positions. Options are held to expiry; headline net worth includes intrinsic value only, excluding time value.</p>')}</div>`
    );
  if (page === "Ownership") {
    let c = e.corporate,
      val = valuation(s, worth(s)),
      total = c.founderShares + c.publicShares;
    return (
      heading(
        "Growth is not always yours to keep.",
        "Raise equity, manage dilution, and take your holding company public.",
      ) +
      `<div class="stats">${stat("Indicative valuation", money(val), "Greater of asset value and earnings model", "Markets")}${stat("Founder ownership", ((100 * c.founderShares) / total).toFixed(2) + "%", "New shares dilute this percentage", "Achievements")}${stat("External shareholders", c.publicShares.toLocaleString(), "Founder owns 1,000,000 shares", "Businesses")}${stat("Founder distributions", money(c.founderDistributions), "Paid outside the group treasury", "wallet")}</div><div class="detail-grid"><section class="card"><div class="split"><h2>${esc(c.name)}</h2><span class="tag">${c.listed ? "PUBLIC COMPANY" : "PRIVATE HOLDING COMPANY"}</span></div><label class="field">Holding company name<input id="holdingName" maxlength="60" value="${esc(c.name)}"></label><label class="field">Dividend payout ratio<select id="dividendPolicy">${[0, 0.1, 0.25, 0.5].map((n) => `<option value="${n}" ${c.payout === n ? "selected" : ""}>${n * 100}% of positive monthly profit</option>`).join("")}</select></label>${btn("Save shareholder policy", "x:corporatepolicy", "light")}<p class="explain">Dividends leave group cash and go to shareholders in proportion to ownership. Founder distributions are tracked separately and cannot fund group operations. Group net worth remains the full consolidated asset value, not the founder’s personal stake.</p><div class="progress"><div style="width:${(100 * c.founderShares) / total}%"></div></div><div class="goal-row"><b>You: ${((100 * c.founderShares) / total).toFixed(1)}%</b><span>Outside owners: ${((100 * c.publicShares) / total).toFixed(1)}%</span></div></section><section class="card"><h2>Funding rounds</h2><p class="explain">Raise at least $10,000 and at most 40% of the current valuation per round. New shares are issued at the pre-money share price. Private funding costs 4%; an IPO costs 5% with a $5,000 minimum.</p><label class="field">Capital to raise<input id="raiseAmount" type="number" min="10000" step="10000" value="50000"></label><div class="actions">${btn("Private equity round", "x:raise")}${btn("Launch IPO", "x:ipo", "light", c.listed || s.month < 12 || s.businesses.length < 3 || worth(s) < 250000)}</div><p class="explain">IPO requirements: 12 completed months, three businesses, and $250,000 group net worth. Valuation uses the greater of asset value or 36× average positive monthly profit from up to twelve recorded months, adjusted for the economy. It is an indicative game valuation.</p></section><section class="card"><h2>Buy back ownership</h2><label class="field">Outside shares to retire<input id="buybackShares" type="number" min="1" max="${c.publicShares}" value="1000"></label><p class="explain">Current indicative share price: $${(val / total).toFixed(4)}. Buybacks cost a 1% transaction fee.</p><br>${btn("Repurchase shares", "x:buyback", "light", !c.publicShares)}</section><section class="card"><h2>Shareholder ledger</h2><div class="balance-line"><span>Funding rounds completed</span><b>${c.rounds}</b></div><div class="balance-line"><span>Total dividends paid</span><b>${money(c.dividendsPaid)}</b></div><div class="balance-line"><span>Founder’s indicative equity stake</span><b>${money((val * c.founderShares) / total)}</b></div><div class="balance-line"><span>External capital share</span><b>${money((val * c.publicShares) / total)}</b></div></section></div>`
    );
  }
  if (page === "Innovation")
    return (
      heading(
        "Build an advantage that compounds.",
        "Twelve corporate technologies, prerequisites, and two concurrent research programs.",
      ) +
      `<div class="banner-event"><span class="tag">LONG-TERM ADVANTAGE</span><h2>${e.researched.length} of ${RESEARCH.length} technologies developed</h2><p>${e.researchProjects.length} / 2 research slots occupied. Corporate technologies benefit all current and future businesses.</p></div><div class="catalog">${RESEARCH.map(
        (t) => {
          let project = e.researchProjects.find((p) => p.id === t.id),
            done = has(s, t.id),
            blocked = t.requires && !has(s, t.requires);
          return `<section class="card"><div class="split"><span class="tag">${done ? "COMPLETED" : project ? "IN DEVELOPMENT" : blocked ? "PREREQUISITE REQUIRED" : "AVAILABLE"}</span><small>${t.months} months</small></div><h2>${t.name}</h2><p>${t.desc}</p>${t.requires ? `<small>Requires ${RESEARCH.find((r) => r.id === t.requires).name}</small>` : ""}${project ? `<div class="progress"><div style="width:${(1 - project.remaining / t.months) * 100}%"></div></div><p>${project.remaining} months remaining</p>` : ""}${btn(done ? "Technology deployed" : project ? "Research in progress" : "Fund · " + money(t.cost), "x:research:" + t.id, "light", done || !!project || blocked || e.researchProjects.length >= 2 || s.cash < t.cost)}</section>`;
        },
      ).join("")}</div>`
    );
  if (page === "Development")
    return (
      heading(
        "Land is only the beginning.",
        "Develop buildings, maintain their condition, and choose tenant strategies.",
      ) +
      `<div class="catalog">${
        s.properties
          .map((p, i) => {
            let t = PROPERTIES[p.kind],
              cost =
                t.cost *
                0.18 *
                p.level *
                (s.businesses.some((b) => b.type === "construction") ? 0.8 : 1);
            return `<section class="card"><div class="split"><span class="tag">LEVEL ${p.level} / 5</span><small>${p.development ? "UNDER DEVELOPMENT" : "IN SERVICE"}</small></div><h2>${t.name} #${i + 1}</h2><div class="balance-line"><span>Condition</span><b>${Math.round(p.condition)}%</b></div><div class="progress"><div style="width:${p.condition}%"></div></div><label class="field">Tenant policy<select id="tenant-${i}"><option value="balanced" ${p.tenant === "balanced" ? "selected" : ""}>Market rate · 8% vacancy risk</option><option value="corporate" ${p.tenant === "corporate" ? "selected" : ""}>Corporate tenant · 88% rent · 3% vacancy</option><option value="budget" ${p.tenant === "budget" ? "selected" : ""}>Affordable lease · 80% rent · 4% vacancy</option></select></label><label class="field">Monthly maintenance reserve<input id="reserve-${i}" type="number" min="0" max="10000" value="${p.reserve}"></label>${btn("Save leasing plan", "x:propertyplan:" + i, "light")}${btn(p.development ? `${p.development} months to completion` : "Develop · " + money(cost), "x:develop:" + i, "", !!p.development || p.level >= 5 || s.cash < cost)}<p>Development takes 3 months with no rent during construction. Each level adds 24% to base rent and 15% to base resale value. Owning a construction company reduces development cost 20%.</p></section>`;
          })
          .join("") ||
        `<section class="card empty"><strong>Your development portfolio is empty.</strong>${btn("Explore properties", "x:properties")}</section>`
      }</div><p class="explain">Condition falls 1.5 points each month, reducing collectible rent. Each $120 in maintenance reserve restores one point. Upkeep rises with level and inflation. Selling a property under construction does not refund development spending.</p>`
    );
  if (page === "Franchises")
    return (
      heading(
        "Grow beyond the businesses you operate.",
        "License proven brands to independent operators and earn ongoing royalties.",
      ) +
      `<div class="stats">${stat("Franchise locations", e.franchises.length, "Independent operations", "Businesses")}${stat("Average network health", e.franchises.length ? Math.round(e.franchises.reduce((n, f) => n + f.health, 0) / e.franchises.length) + "%" : "—", "Affects royalty income", "Achievements")}${stat("Licensing asset value", money(e.franchises.length * 15000), "Conservative fixed carrying value", "Properties")}${stat("Corporate income", money(e.monthIncome), "Last month: royalties + patent income", "wallet")}</div><div class="detail-grid"><section class="card"><h2>License a proven brand</h2>${s.businesses.map((b) => `<div class="network-row"><div style="flex:1"><h3>${esc(b.name)}</h3><small>Level ${b.level} · Reputation ${Math.round(b.reputation)}</small></div>${btn("Add franchise · $25,000", "x:franchise:" + b.id, "small light", b.level < 3 || b.reputation < 80 || s.cash < 25000)}</div>`).join("") || '<p class="explain">Build a business first.</p>'}<p class="explain">Eligibility: level 3 and 80 reputation. Each location costs $25,000 to recruit and support. Royalties equal 0.8% of the sector’s base startup cost × economy × franchise health each month. Franchisees own their local operations; you do not hire their staff.</p></section><section class="card"><h2>Network performance</h2>${e.franchises.map((f) => `<div class="research"><div class="split"><h3>${esc(f.brand)} #${f.id}</h3><span class="tag">${f.age} MONTHS</span></div><div class="progress"><div style="width:${f.health}%"></div></div><div class="goal-row"><span>Health ${Math.round(f.health)} / 100</span><b>Est. ${money(((TYPES.find((t) => t.id === f.type).cost * 0.008 * s.economy * f.health) / 85) * (has(s, "brandhouse") ? 1.1 : 1))}/mo</b></div></div>`).join("") || '<p class="explain">Your first franchise starts with a brand worth copying.</p>'}</section></div>`
    );
  if (page === "Milestones")
    return (
      heading(
        "Pick a direction. Make it happen.",
        "Seventeen optional challenges reward different ways to build an empire.",
      ) +
      `<div class="catalog">${MISSIONS.map((m) => {
        let done = e.claimed.includes(m.id),
          ready = m.check(s);
        return `<section class="card"><div class="split"><div class="business-icon">${done ? "★" : ready ? "✦" : "☆"}</div><span class="tag">${done ? "CLAIMED" : ready ? "READY" : "IN PROGRESS"}</span></div><h2>${m.name}</h2><p>${m.desc}</p><b>${money(m.reward)} reward</b>${btn(done ? "Reward claimed" : ready ? "Claim reward" : "Keep building", "x:claim:" + m.id, "light", done || !ready)}</section>`;
      }).join("")}</div>`
    );
  if (page === "Planner") {
    let total =
      s.businesses.reduce((n, b) => n + forecast(s, b).profit, 0) -
      650 * s.inflation -
      e.executives.reduce((n, c) => n + c.salary, 0);
    return (
      heading(
        "Understand the consequences before you commit.",
        "Inspect demand drivers, test a business plan, and stress-test the whole group.",
      ) +
      `<div class="banner-event"><span class="tag">${e.macro.remaining} MONTHS REMAINING</span><h2>${esc(e.macro.name)}</h2><p>${esc(e.macro.desc)}</p></div><div class="detail-grid"><section class="card"><h2>Business what-if calculator</h2><label class="field">Company<select id="planBusiness">${s.businesses.map((b) => `<option value="${b.id}">${esc(b.name)}</option>`).join("")}</select></label><label class="field">Price multiplier<input id="planPrice" type="number" min="0.5" max="2" step="0.05" value="1.1"></label><label class="field">Additional employees<input id="planStaff" type="number" min="-10" max="20" value="1"></label>${btn("Compare forecast", "x:whatif", "", !s.businesses.length)}<p class="explain">Compares the operating plan against current conditions without changing your save. Excludes one-time hiring costs, tax, debt service, and timing of contract payments. The added staff must fit existing capacity.</p></section><section class="card"><h2>Twelve-month stress test</h2><p class="explain">Run 30 alternate seeded futures using your existing policies. Events are declined automatically. No new purchases, management changes, or funding rounds are made. Reports net-worth and cash ranges, and the frequency of emergency credit. Results are scenarios, not guarantees.</p><br>${btn("Run 30 simulated futures", "x:stress", "light")}<div class="balance-line"><span>Current operating forecast</span><b class="${total >= 0 ? "positive" : "negative"}">${money(total)}/mo</b></div><p class="explain">Operating forecast deducts business expenses, executive salaries, and living costs; excludes taxes, debt, portfolio income, and working-capital movements.</p></section><section class="card"><h2>Treasury automation</h2><label class="field">Minimum cash reserve<input id="autoReserve" type="number" min="0" max="100000000" value="${e.automation.reserve}"></label><label class="field">Liquidity policy<select id="autoEnabled"><option value="no" ${!e.automation.enabled ? "selected" : ""}>Manual treasury management</option><option value="yes" ${e.automation.enabled ? "selected" : ""}>Sell stocks if cash drops below reserve</option></select></label>${btn("Save automation", "x:automation", "light")}<p class="explain">Runs at month-end before emergency credit. Sells available long holdings in the asset-list order. Does not sell properties, close shorts, or convert currencies.</p></section><section class="card"><h2>Customer & compliance strategy</h2><label class="field">Company<select id="customerBusiness">${s.businesses.map((b) => `<option value="${b.id}">${esc(b.name)}</option>`).join("")}</select></label>${btn("Open strategic plan", "x:customerform", "light", !s.businesses.length)}<p class="explain">Set the customer segment, recurring brand investment, and compliance budget separately for each company. Regulated industries face greater audit risk.</p></section></div><section class="card" style="margin-top:22px"><h2>Business diagnostics</h2>${
        s.businesses
          .map((b) => {
            let f = forecast(s, b);
            return `<div class="diagnostic"><div><h3>${esc(b.name)}</h3><small>${city(b).name} · ${b.segment} segment · Loyalty ${Math.round(b.loyalty)}/100</small></div><div class="diagnostic-metrics"><span>Local demand <b>${demandFactor(s, b).toFixed(2)}×</b></span><span>Customers & cycle <b>${customerMultiplier(s, b).toFixed(2)}×</b></span><span>Input chain <b>${(materialFactor(s, b) * deepMaterial(s, b)).toFixed(2)}×</b></span><span>Team output <b>${(productivity(b) * deepCapacity(s)).toFixed(2)}×</b></span><span>Unit input cost <b>${money(f.unit)}</b></span><span>Operating forecast <b>${money(f.profit)}</b></span></div>${
              b.history.length > 1
                ? spark(
                    b.history.map((x) => x.profit),
                    true,
                  )
                : ""
            }</div>`;
          })
          .join("") ||
        '<p class="explain">Start a company to inspect its operating drivers.</p>'
      }</section>`
    );
  }
  return "";
}
const assets = () =>
  ASSETS.map(
    (a, i) => `<option value="${i}">${a.ticker} · ${a.name}</option>`,
  ).join("");
export function expansionAction(parts, s, h) {
  let e = ensureEmpire(s),
    { money, esc, btn, modal, close, changed, toast, navigate, spark } = h;
  let [, a, id, mode] = parts;
  let b = s.businesses.find((b) => String(b.id) === id);
  const v = (id) => document.getElementById(id)?.value;
  const n = (id) => Number(v(id));
  const finish = (t) => {
    close();
    changed(t);
  };
  const modalActions = (action) =>
    `<div class="actions">${btn("Cancel", "close", "light")}${btn("Confirm", action)}</div>`;
  switch (a) {
    case "warehousequote": {
      let q = quoteWarehouse(
        s,
        n("warehouseCommodity"),
        n("warehouseLots"),
        v("warehouseMode"),
      );
      if (!q) return toast("Use a whole number of lots from 1 to 100,000.");
      modal(
        `<h2>Confirm material purchase</h2><p>Materials ${money(q.material)} + freight ${money(q.freight)} = ${money(q.total)}. Shipment arrives in month ${q.eta + 1}. Cash remaining: ${money(s.cash - q.total)}.</p>${modalActions("x:warehousebuy:" + n("warehouseCommodity") + ":" + n("warehouseLots") + ":" + v("warehouseMode"))}`,
      );
      break;
    }
    case "warehousebuy":
      if (orderMaterials(s, Number(id), Number(mode), parts[4]))
        finish("Purchase placed. Track its arrival in Supply.");
      else toast("Insufficient cash or invalid order.");
      break;
    case "source": {
      let source = v("source-" + id);
      b.warehouse = source !== "supplier";
      b.warehouseFallback = source === "hybrid";
      changed("Procurement source updated.");
      break;
    }
    case "hire":
      if (hire(s, id))
        changed("Executive hired. Their salary begins next month.");
      else toast("Role occupied or insufficient cash for the signing fee.");
      break;
    case "dismiss":
      modal(
        `<h2>Dismiss this executive?</h2><p>The group loses their bonuses immediately and pays two months’ salary as severance.</p>${modalActions("x:confirmdismiss:" + id)}`,
      );
      break;
    case "confirmdismiss":
      if (dismiss(s, id)) finish("Executive dismissed.");
      else toast("Not enough cash for severance.");
      break;
    case "fx":
      modal(
        `<h2>${mode === "buy" ? "Buy" : "Sell"} ${FX[id].id}</h2><p>Rate $${e.fx[id].toFixed(5)} per unit. Conversion fee 0.2%. Units held: ${e.fxHoldings[id].toFixed(2)}.</p><label class="field">Currency units<input id="fxAmount" type="number" min="0.01" step="0.01" value="1000"></label>${modalActions("x:fxconfirm:" + id + ":" + mode)}`,
      );
      break;
    case "fxconfirm":
      if (fxTrade(s, Number(id), n("fxAmount"), mode === "buy"))
        finish("Currency trade settled.");
      else toast("Check the amount and available balance.");
      break;
    case "orderform":
      modal(
        `<h2>Place a limit order</h2><label class="field">Asset<select id="orderAsset">${assets()}</select></label><label class="field">Side<select id="orderSide"><option value="buy">Buy</option><option value="sell">Sell</option></select></label><label class="field">Shares<input id="orderQty" type="number" min="1" value="10"></label><label class="field">Limit price<input id="orderLimit" type="number" min="0.01" step="0.01" value="100"></label>${modalActions("x:orderconfirm")}`,
      );
      break;
    case "orderconfirm":
      if (
        placeOrder(
          s,
          n("orderAsset"),
          v("orderSide"),
          n("orderQty"),
          n("orderLimit"),
        )
      )
        finish("Limit order placed. Cash and shares are not reserved.");
      else toast("Enter a valid price and whole number of shares.");
      break;
    case "cancelorder":
      e.orders = e.orders.filter((o) => o.id !== Number(id));
      changed("Order cancelled.");
      break;
    case "shortform":
      modal(
        `<h2>Open a short position</h2><p>150% collateral is locked upfront. Losses can exceed collateral after a price gap; emergency borrowing covers a negative cash balance.</p><label class="field">Asset<select id="shortAsset">${assets()}</select></label><label class="field">Shares<input id="shortQty" type="number" min="1" value="10"></label>${modalActions("x:shortconfirm")}`,
      );
      break;
    case "shortconfirm":
      if (openShort(s, n("shortAsset"), n("shortQty")))
        finish("Short opened. Monitor margin and borrow fees.");
      else toast("Not enough collateral or invalid share quantity.");
      break;
    case "closeshort":
      if (closeShort(s, Number(id))) {
        if (s.cash < 0) {
          let bridge = -s.cash + 1000;
          s.debt += bridge;
          s.cash += bridge;
          log(s, "Margin-loss emergency credit", bridge);
        }
        changed("Short closed and collateral settled.");
      }
      break;
    case "optionform":
      modal(
        `<h2>Price a call or put</h2><label class="field">Underlying asset<select id="optionAsset">${assets()}</select></label><label class="field">Direction<select id="optionKind"><option value="call">Call · benefit from a rising price</option><option value="put">Put · benefit from a falling price</option></select></label><label class="field">Contracts (10 shares each)<input id="optionCount" type="number" min="1" max="1000" value="1"></label><label class="field">Expiry<select id="optionMonths"><option value="1">1 month</option><option value="3">3 months</option><option value="6">6 months</option></select></label><div class="actions">${btn("Cancel", "close", "light")}${btn("Get premium quote", "x:optionquote")}</div>`,
      );
      break;
    case "optionquote": {
      let asset = n("optionAsset"),
        kind = v("optionKind"),
        count = n("optionCount"),
        months = n("optionMonths"),
        q = optionQuote(s, asset, kind, count, months);
      if (!q) return toast("Enter valid option parameters.");
      modal(
        `<h2>${count} ${ASSETS[asset].ticker} ${kind} contract${count === 1 ? "" : "s"}</h2><p>Strike $${q.strike.toFixed(2)}. Total premium ${money(q.total)}. Expiry month ${q.expiry + 1}. Maximum loss is the premium. The pricing formula is a simplified game rule, not an options valuation model.</p>${modalActions("x:optionbuy:" + asset + ":" + kind + ":" + count + ":" + months)}`,
      );
      break;
    }
    case "optionbuy":
      if (buyOption(s, Number(id), mode, Number(parts[4]), Number(parts[5])))
        finish("Option premium paid. Position is held to expiry.");
      else toast("Insufficient cash for the option premium.");
      break;
    case "corporatepolicy": {
      let name = v("holdingName").trim(),
        payout = n("dividendPolicy");
      if (!name || ![0, 0.1, 0.25, 0.5].includes(payout))
        return toast("Choose a name and payout ratio.");
      e.corporate.name = name.slice(0, 60);
      e.corporate.payout = payout;
      changed("Shareholder policy saved.");
      break;
    }
    case "raise":
    case "ipo": {
      let amount = n("raiseAmount");
      if (
        !Number.isFinite(amount) ||
        amount < 10000 ||
        amount > valuation(s, worth(s)) * 0.4
      )
        return toast("Raise between $10,000 and 40% of the current valuation.");
      let c = e.corporate,
        val = valuation(s, worth(s)),
        shares = Math.ceil(amount / (val / (c.founderShares + c.publicShares)));
      modal(
        `<h2>${a === "ipo" ? "Go public" : "Raise outside capital"}?</h2><p>Raise ${money(amount)} before fees. Issue ${shares.toLocaleString()} shares. Founder ownership falls from ${((100 * c.founderShares) / (c.founderShares + c.publicShares)).toFixed(2)}% to ${((100 * c.founderShares) / (c.founderShares + c.publicShares + shares)).toFixed(2)}%.</p>${modalActions("x:raiseconfirm:" + amount + ":" + a)}`,
      );
      break;
    }
    case "raiseconfirm":
      if (equityRaise(s, Number(id), worth(s), mode === "ipo"))
        finish("Funding round completed. Your ownership table is updated.");
      else toast("Funding conditions are not met.");
      break;
    case "buyback":
      if (buyback(s, n("buybackShares"), worth(s)))
        changed("Shares repurchased and retired.");
      else toast("Check shares outstanding and available cash.");
      break;
    case "research":
      if (corporateResearch(s, id))
        changed("Research program funded. Track completion in Innovation.");
      else toast("Requirements, funds, or research slots are unavailable.");
      break;
    case "properties":
      navigate("Properties");
      break;
    case "propertyplan": {
      let p = s.properties[id],
        reserve = n("reserve-" + id),
        tenant = v("tenant-" + id);
      if (
        !Number.isFinite(reserve) ||
        reserve < 0 ||
        reserve > 10000 ||
        !["balanced", "corporate", "budget"].includes(tenant)
      )
        return toast("Enter a maintenance reserve from $0 to $10,000.");
      Object.assign(p, { reserve, tenant });
      changed("Leasing plan updated.");
      break;
    }
    case "develop":
      if (
        upgradeProperty(s, Number(id), PROPERTIES[s.properties[id].kind].cost)
      )
        changed("Development funded. Rent pauses until completion.");
      else toast("Development is unavailable or unaffordable.");
      break;
    case "franchise":
      if (franchise(s, b))
        changed("Franchise signed. Royalties begin next month.");
      else toast("Meet the brand requirements and keep $25,000 available.");
      break;
    case "claim":
      if (claim(s, id)) changed("Milestone reward added to treasury.");
      break;
    case "automation": {
      let reserve = n("autoReserve");
      if (!Number.isFinite(reserve) || reserve < 0 || reserve > 1e8)
        return toast("Enter a valid reserve.");
      Object.assign(e.automation, {
        reserve,
        enabled: v("autoEnabled") === "yes",
        sellStocks: true,
      });
      changed("Treasury automation saved.");
      break;
    }
    case "customerform": {
      let b = s.businesses.find((b) => b.id === n("customerBusiness"));
      if (!b) return;
      modal(
        `<h2>${esc(b.name)}: strategic plan</h2><label class="field">Target customer<select id="customerSegment">${["balanced", "budget", "premium", "enterprise"].map((x) => `<option value="${x}" ${b.segment === x ? "selected" : ""}>${x}</option>`).join("")}</select></label><label class="field">Monthly brand investment<input id="brandSpend" type="number" min="0" max="50000" value="${b.brandInvestment}"></label><label class="field">Monthly regulatory compliance<input id="complianceSpend" type="number" min="0" max="10000" value="${b.compliance}"></label><p>Budget: +18% demand if price is at or below baseline, otherwise −10%. Premium: +15% demand at quality 2+, otherwise −15%. Enterprise: −17% retail demand; helps you preserve production capacity for signed contracts. Compliance reduces random audit risk.</p>${modalActions("x:customersave:" + b.id)}`,
      );
      break;
    }
    case "customersave": {
      let segment = v("customerSegment"),
        brandInvestment = n("brandSpend"),
        compliance = n("complianceSpend");
      if (
        !["balanced", "budget", "premium", "enterprise"].includes(segment) ||
        !Number.isFinite(brandInvestment) ||
        brandInvestment < 0 ||
        brandInvestment > 50000 ||
        !Number.isFinite(compliance) ||
        compliance < 0 ||
        compliance > 10000
      )
        return toast("Use valid monthly budgets.");
      Object.assign(b, { segment, brandInvestment, compliance });
      finish("Customer and compliance strategy saved.");
      break;
    }
    case "whatif": {
      let b = s.businesses.find((b) => b.id === n("planBusiness")),
        mult = n("planPrice"),
        extra = n("planStaff");
      if (
        !b ||
        !Number.isFinite(mult) ||
        mult < 0.5 ||
        mult > 2 ||
        !Number.isInteger(extra) ||
        b.staff + extra < 1 ||
        b.staff + extra > b.level * 5
      )
        return toast(
          "Use a valid price multiplier and staff within the current level’s limits.",
        );
      let before = forecast(s, b),
        copy = JSON.parse(JSON.stringify(s)),
        afterB = copy.businesses.find((x) => x.id === b.id);
      afterB.price *= mult;
      afterB.staff += extra;
      let after = forecast(copy, afterB);
      modal(
        `<h2>A different operating plan</h2><p>${esc(b.name)} · No changes made to your save.</p><table><thead><tr><th>METRIC</th><th>CURRENT</th><th>PROPOSED</th></tr></thead><tbody>${[
          ["Price", money(b.price), money(afterB.price)],
          ["Team", b.staff, afterB.staff],
          ["Demand", before.demand, after.demand],
          ["Capacity", before.capacity, after.capacity],
          ["Revenue", money(before.revenue), money(after.revenue)],
          ["Operating profit", money(before.profit), money(after.profit)],
        ]
          .map(
            ([a, b, c]) => `<tr><td>${a}</td><td>${b}</td><td>${c}</td></tr>`,
          )
          .join(
            "",
          )}</tbody></table><div class="actions">${btn("Close", "close", "light")}</div>`,
      );
      break;
    }
    case "stress": {
      let results = [],
        emergencies = 0;
      for (let i = 0; i < 30; i++) {
        let copy = JSON.parse(JSON.stringify(s));
        copy.seed = ((copy.seed + i * 7919) % 2147483646) + 1;
        let oldDebt = copy.debt;
        for (let m = 0; m < 12; m++) {
          if (copy.event) resolve(copy, false);
          advance(copy);
        }
        results.push({ worth: worth(copy), cash: copy.cash });
        if (copy.debt > oldDebt) emergencies++;
      }
      let values = results.map((x) => x.worth).sort((a, b) => a - b);
      modal(
        `<h2>Thirty possible futures.</h2><p>Same operating policies. Twelve months. Different random outcomes. These are simulated scenarios, not predicted returns.</p><div class="balance-line"><span>10th percentile group net worth</span><b>${money(values[2])}</b></div><div class="balance-line"><span>Median group net worth</span><b>${money((values[14] + values[15]) / 2)}</b></div><div class="balance-line"><span>90th percentile group net worth</span><b>${money(values[26])}</b></div><div class="balance-line"><span>Ending cash range</span><b>${money(Math.min(...results.map((r) => r.cash)))} – ${money(Math.max(...results.map((r) => r.cash)))}</b></div><div class="balance-line"><span>Runs ending with more debt</span><b>${emergencies} / 30</b></div><p style="margin-top:18px">Debt can increase through emergency credit; existing term debt can also amortize, so this is a net-debt indicator, not a count of every cash shortfall.</p><div class="actions">${btn("Back to planning", "close", "light")}</div>`,
      );
      break;
    }
  }
}
