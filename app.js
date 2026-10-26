import { industryContent, industryAction } from "./industry-ui.js?v=20261026-industry";
import { endgamePages, endgameContent, endgameAction } from "./endgame.js?v=20261026-industry";
import { ensureLate, lateAssets } from "./late.js?v=20261026-industry";
import {
  expansionPages,
  expansionContent,
  expansionAction,
} from "./expansion.js?v=20261026-industry";
import { ensureEmpire, additionalAssets } from "./empire.js?v=20261026-industry";
import { ensureWorld, canSell, city } from "./world.js?v=20261026-industry";
import { strategyPages, strategyContent, strategyAction } from "./strategy.js?v=20261026-industry";
import {
  TYPES,
  ASSETS,
  PROPERTIES,
  TECH,
  fresh,
  type,
  worth,
  start,
  transact,
  forecast,
  advance,
  resolve,
  log,
  valid,
} from "./engine.js?v=20261026-industry";
const $ = (s) => document.querySelector(s),
  money = (n) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n),
  esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
let s = fresh(),
  page = "Overview",
  selected = null,
  toastTimer;
try {
  let saved = JSON.parse(localStorage.getItem("fido-save"));
  if (valid(saved)) s = saved;
} catch {}
const paths = {
  Overview: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  Businesses: "M3 21V8h18v13 M8 8V3h8v5 M1 21h22 M8 12v5 M16 12v5",
  Markets: "M3 18l6-6 4 3 8-11 M15 4h6v6",
  Properties: "M3 10l9-7 9 7v11H3z M9 21v-8h6v8",
  Banking: "M2 8l10-5 10 5H2z M5 10v8 M12 10v8 M19 10v8 M2 21h20",
  Research: "M9 3h6 M10 3v7L4 20h16l-6-10V3 M8 15h8",
  Achievements:
    "M8 3h8v7a4 4 0 01-8 0V3 M8 5H3v3a5 5 0 005 5 M16 5h5v3a5 5 0 01-5 5 M12 14v5 M7 21h10",
  Ledger: "M5 3h14v18H5z M8 7h8 M8 11h8 M8 15h5",
  Settings:
    "M12 8a4 4 0 100 8 4 4 0 000-8 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2",
  arrow: "M4 12h16 M14 6l6 6-6 6",
  plus: "M12 4v16 M4 12h16",
  wallet: "M3 5h16v15H3z M15 11h6v5h-6z",
  help: "M9 8a3 3 0 116 0c0 2-3 2-3 5 M12 17h.01 M12 2a10 10 0 100 20 10 10 0 000-20",
};
Object.assign(paths, {
  World:
    "M12 2a10 10 0 100 20 10 10 0 000-20 M2 12h20 M12 2c-5 5-5 15 0 20 M12 2c5 5 5 15 0 20",
  Operations: "M14 5a5 5 0 00-6 6L2 17l5 5 6-6a5 5 0 006-6l-4 3-4-4z",
  Contracts: "M6 3h12v18H6z M9 7h6 M9 11h6 M9 15h3",
  Competitors:
    "M9 8a3 3 0 100-6 3 3 0 000 6 M17 9a3 3 0 100-6 M2 21v-5a7 7 0 0114 0v5 M17 12a6 6 0 015 6v3",
  Treasury:
    "M3 6c0-4 18-4 18 0s-18 4-18 0 M3 6v6c0 4 18 4 18 0V6 M3 12v6c0 4 18 4 18 0v-6",
});
Object.assign(paths, {
  Industries: "M3 21V9l6 4V7l6 4V3h6v18H3z M7 17h2 M13 17h2",
  Supply: "M3 7l9-5 9 5v13H3z M3 7l9 5 9-5 M12 12v10",
  Talent: paths.Competitors,
  Exchange: "M3 7h17l-4-4 M21 17H4l4 4",
  Trading: paths.Markets,
  Ownership: "M12 2v10h10 M9 3a9 9 0 1012 12",
  Innovation: "M8 17h8 M9 21h6 M8 14a7 7 0 118 0v3H8z",
  Development: "M3 21h18 M6 21V4h12 M6 8h15 M18 8v8 M16 16h4",
  Franchises: "M12 3v8 M5 11h14 M5 11v8 M19 11v8 M2 19h6v3H2z M16 19h6v3h-6z",
  Milestones: "M5 22V3h14l-4 5 4 5H5",
  Planner: "M5 3v18 M12 3v18 M19 3v18 M2 7h6 M9 15h6 M16 9h6",
  International: paths.World,
  Megaprojects:
    "M2 22h20 M5 22V10h5V3h5v7h4v12 M8 14h2 M14 14h2 M8 18h2 M14 18h2",
  Ventures: "M6 16l-3 5 5-3 M8 16l-3-3 5-4 3-5 8-2-2 8-5 3-4 5z M14 7h3v3h-3z",
  Bank: paths.Banking,
  Headquarters: paths.Businesses,
  Dynasty: "M3 7l5 5 4-8 4 8 5-5-3 13H6z M6 22h12",
  Scenarios: "M4 3h16v18H4z M8 7h.01 M16 7h.01 M12 12h.01 M8 17h.01 M16 17h.01",
});
const icon = (n) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[n] || paths.Overview}"/></svg>`;
const btn = (label, act, cls = "", disabled = false) =>
  `<button class="btn ${cls}" data-action="${act}" ${disabled ? "disabled" : ""}>${label}</button>`;
const date = () =>
  new Date(2026, s.month, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
function save() {
  try {
    localStorage.setItem("fido-save", JSON.stringify(s));
  } catch {
    toast("Browser storage is unavailable. Export your save to keep progress.");
  }
}
function toast(t) {
  $("#toast").textContent = t;
  $("#toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 4000);
}
function modal(html) {
  $("#dialog").innerHTML = html;
  $("#dialog").showModal();
}
const close = () => $("#dialog").close();
const heading = (title, sub, actions = "") =>
  `<div class="page-heading"><div><div class="eyebrow">YOUR EMPIRE, YOUR RULES</div><h1>${title}</h1><p class="subtitle">${sub}</p></div><div class="actions">${actions}</div></div>`;
const stat = (label, value, foot, ic) =>
  `<div class="card stat"><div class="stat-label">${label}${icon(ic)}</div><div class="amount">${value}</div><div class="stat-foot">${foot}</div></div>`;
function spark(values, large = false) {
  let v = values.length === 1 ? [values[0], values[0]] : values;
  let lo = Math.min(...v) * 0.97,
    hi = Math.max(...v) * 1.03;
  if (hi - lo < 1) {
    lo -= 1;
    hi += 1;
  }
  let w = large ? 620 : 80,
    h = large ? 160 : 30;
  let p = v.map(
    (n, i) => `${(i * w) / (v.length - 1)},${h - ((n - lo) / (hi - lo)) * h}`,
  );
  return `<svg class="${large ? "chart" : ""}" viewBox="0 0 ${w} ${h + 8}" preserveAspectRatio="none" aria-label="${large ? "Net worth history" : "Price history"}" role="img">${large ? `<defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b0cb7c" stop-opacity=".3"/><stop offset="1" stop-color="#b0cb7c" stop-opacity="0"/></linearGradient></defs>${[0, 1, 2, 3].map((i) => `<line x1="0" x2="${w}" y1="${(i * h) / 3}" y2="${(i * h) / 3}" stroke="#edf0e8" stroke-dasharray="3 5"/>`).join("")}<polygon points="0,${h} ${p.join(" ")} ${w},${h}" fill="url(#fade)"/>` : ""}<polyline points="${p.join(" ")}" fill="none" stroke="#7a9d52" stroke-width="${large ? 2.5 : 1.7}" vector-effect="non-scaling-stroke"/></svg>`;
}
function render() {
  ensureLate(s);
  let nav = [
    "Overview",
    "Businesses",
    "Operations",
    "Supply",
    "Talent",
    "Contracts",
    "World",
    "Competitors",
    "Franchises",
    "Properties",
    "Development",
    "Markets",
    "Trading",
    "Exchange",
    "Banking",
    "Treasury",
    "Ownership",
    "Research",
    "Innovation",
    "Planner",
    "Milestones",
    "Ledger",
    "Achievements",
  ];
  $("#app").innerHTML =
    `<aside><div class="brand">fi<span>do.</span></div><div class="brand-sub">FINANCIAL WORLD DOMINATION</div><div class="nav-label">BUILD YOUR EMPIRE</div>${navigation()}<div class="aside-bottom"><button class="nav" data-action="help" title="How to play">${icon("help")}<span>Field guide</span></button><button class="nav ${page === "Settings" ? "active" : ""}" data-page="Settings" title="Settings">${icon("Settings")}<span>Settings & saves</span></button><div class="founder"><div class="avatar">Y</div><div>You, the founder<br><small>${worth(s) >= 1e6 ? "Empire builder" : worth(s) >= 100000 ? "Entrepreneur" : "Aspiring entrepreneur"}</small></div></div></div></aside><div class="shell"><header><div class="breadcrumb">Your workspace &nbsp; / &nbsp; <b>${page}</b></div><div class="top-right"><span class="pill"><span class="dot"></span>Sandbox mode</span><span class="date">◷ &nbsp; ${date()} <span class="muted">· Month ${s.month + 1}</span></span>${btn("Run quarter", "quarter", "light")} ${btn("Next month " + icon("arrow"), "advance")}</div></header><main>${content()}<div class="footer"><span>Small beginnings. Unlimited possibilities.</span><span>Single-player sandbox &nbsp; · &nbsp; Auto-saved locally &nbsp; ●</span></div></main></div>`;
}
function content() {
  if (page === "Industries")
    return industryContent(s, { heading, btn, money, esc, stat });
  if (endgamePages.includes(page))
    return endgameContent(page, s, { heading, btn, money, esc, stat, spark });
  if (expansionPages.includes(page))
    return expansionContent(page, s, { heading, btn, money, esc, stat, spark });
  if (strategyPages.includes(page))
    return strategyContent(page, s, { heading, btn, money, esc, stat, spark });
  switch (page) {
    case "Overview":
      return overview();
    case "Businesses":
      return businesses();
    case "Markets":
      return markets();
    case "Properties":
      return properties();
    case "Banking":
      return banking();
    case "Research":
      return research();
    case "Ledger":
      return ledger();
    case "Achievements":
      return achievements();
    case "Settings":
      return settings();
  }
}
function overview() {
  let nw = worth(s),
    growth = (nw / Math.max(1, s.startCapital || 25000) - 1) * 100;
  return (
    heading(
      "Big ideas. Small beginnings.",
      s.month === 0
        ? "Your first " +
            money(s.startCapital || 25000) +
            " is ready. What will you build with it?"
        : "Every decision writes the next chapter of your empire.",
      btn(icon("plus") + " Start a business", "catalog"),
    ) +
    `<div class="stats">${stat("Net worth", money(nw), `<span class="${growth >= 0 ? "positive" : "negative"}">${growth >= 0 ? "↗" : "↘"} ${growth.toFixed(1)}%</span> &nbsp; since day one`, "Markets")}${stat("Available cash", money(s.cash), "Ready for your next move", "wallet")}${stat("Monthly net profit", money(s.profit), s.month ? '<span class="' + (s.profit >= 0 ? "positive" : "negative") + '">Last month, after taxes & costs</span>' : "Your story starts this month", "Businesses")}${stat("Active businesses", s.businesses.length, `${s.businesses.reduce((n, b) => n + b.staff, 0)} employees · ${s.properties.length} properties`, "Properties")}</div><div class="grid"><div class="stack"><section class="card"><div class="card-head"><div><h2>Your empire, over time</h2><small>Good things are built one decision at a time.</small></div><span class="tag">${s.history.length < 60 ? "ALL TIME" : "LAST 60 MONTHS"}</span></div><div class="split"><div><span style="font:700 26px Manrope">${money(nw)}</span> <small>net worth</small></div><span class="chart-key"><i></i> Total net worth</span></div>${spark(
      s.history.map((h) => h.worth),
      true,
    )}<div class="chart-labels"><span>${new Date(2026, s.history[0]?.month || 0, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase()}</span><span>${s.month === 0 ? "YOUR JOURNEY BEGINS HERE" : date().toUpperCase()}</span><span>${s.month === 0 ? "THE FUTURE IS YOURS" : "MONTH " + (s.month + 1)}</span></div></section><section class="card"><div class="card-head"><div><h2>Your businesses <small style="display:inline;margin-left:7px">${s.businesses.length}</small></h2><small>The engines of your growing empire.</small></div><button class="text-btn" data-page="Businesses">Manage businesses ↗</button></div>${
      s.businesses.length
        ? s.businesses
            .slice(0, 4)
            .map(
              (b) =>
                `<div class="business-row"><div class="business-icon">${type(b).icon}</div><div class="business-info"><h3>${esc(b.name)}</h3><small>${type(b).sector} &nbsp; · &nbsp; Level ${b.level}</small></div><div class="business-value ${b.lastProfit >= 0 ? "positive" : "negative"}">${money(b.lastProfit)}<small>monthly operating profit</small></div><button class="text-btn" data-action="manage:${b.id}">↗</button></div>`,
            )
            .join("")
        : `<div class="empty"><strong>Your empire starts with one good idea.</strong>Open a café, launch a store, or build something bigger.<br><button class="text-btn" data-action="catalog">Explore business opportunities →</button></div>`
    }</section><section class="card"><div class="card-head"><h2>The world keeps moving</h2><span class="tag">WORLD NEWS</span></div>${s.event ? eventCard() : ""}${s.news
      .slice(0, 3)
      .map(
        (n, i) =>
          `<div class="news-item"><div class="news-icon">${i ? "↗" : "◈"}</div><div><p><b>${esc(n.title)}</b></p><p class="muted">${esc(n.text)}</p><small>ECONOMY &nbsp; · &nbsp; Month ${n.month + 1}</small></div></div>`,
      )
      .join(
        "",
      )}</section></div><div class="stack"><section class="card welcome"><div class="eyebrow">THE NEXT CHAPTER</div><h2>${s.businesses.length ? "Think bigger.<br>Build something lasting." : "Every empire starts<br>with a first step."}</h2><p>${s.businesses.length ? "A new venture. A smarter process. Your next move is yours to make." : "Turn your starting capital into something that grows."}</p>${btn(s.businesses.length ? "Find your next opportunity →" : "Start your first business →", "catalog", "light")}<svg class="plant" viewBox="0 0 170 170" fill="none" aria-hidden="true"><ellipse cx="89" cy="155" rx="65" ry="9" fill="#cbd6b5"/><path d="M55 109h62l-8 44H64z" fill="#b3c18c"/><path d="M55 109h62v11H55z" fill="#c5d19f"/><path d="M85 110V30" stroke="#637d4c" stroke-width="4"/><path d="M85 83C45 85 34 57 38 46c32-2 48 13 47 37z" fill="#8da566"/><path d="M85 66c-4-35 12-52 36-54 3 30-10 46-36 54z" fill="#718e54"/><path d="M86 103c0-34 27-46 49-38-4 26-23 37-49 38z" fill="#a2b77b"/><path d="M46 57l39 27m3 11 35-21m-35-16 23-31" stroke="#c1d3a4" stroke-width="1.5"/></svg></section><section class="card"><div class="card-head"><h2>Market watch</h2><button class="text-btn" data-page="Markets">Explore ↗</button></div>${ASSETS.slice(
      0,
      4,
    )
      .map(
        (a, i) =>
          `<div class="market-row"><div><span class="ticker">${a.ticker}</span><small>${a.name}</small></div>${spark(s.marketHistory[i])}<div style="text-align:right">${money(s.prices[i])}<small class="${s.prices[i] >= a.price ? "positive" : "negative"}">${(100 * (s.prices[i] / a.price - 1)).toFixed(2)}%</small></div></div>`,
      )
      .join(
        "",
      )}<p class="explain" style="font-size:10px">Fictional markets. Real tradeoffs.</p></section><section class="card"><div class="card-head"><h2>Your first big milestone</h2><span style="color:#94a665">⚑</span></div><p class="muted" style="font-size:12px">${nw >= 100000 ? "On the road to a million." : "Build a net worth of $100,000."}</p><div class="progress"><div style="width:${Math.max(0, Math.min(100, (nw / (nw >= 100000 ? 1000000 : 100000)) * 100))}%"></div></div><div class="goal-row"><b>${money(nw)}</b><span class="muted">${nw >= 100000 ? "$1,000,000" : "$100,000"}</span></div></section><div class="split" style="padding:0 4px"><small>Economic outlook</small><span class="positive" style="font-size:11px">${s.economy > 1.07 ? "↗ Expansion" : s.economy < 0.94 ? "↘ Slowdown" : "● Steady growth"}</span></div></div></div>`
  );
}
function eventCard() {
  return `<div class="event"><h3>${esc(s.event.title)}</h3><p>${esc(s.event.text)}</p><div class="actions">${btn("Accept · " + money(s.event.cost), "event:yes", "small", s.cash < s.event.cost)}${btn("Pass", "event:no", "small light")}</div></div>`;
}
function businesses() {
  let b = s.businesses.find((b) => b.id === selected);
  if (b) return manage(b);
  return (
    heading(
      "Build something of your own.",
      "From your first customer to a portfolio of companies.",
      btn(icon("plus") + " New business", "catalog"),
    ) +
    `<div class="catalog">${s.businesses.map((b) => `<section class="card"><div class="split"><div class="business-icon">${type(b).icon}</div><span class="tag">LEVEL ${b.level}</span></div><h2>${esc(b.name)}</h2><p>${type(b).sector} · ${b.staff} employees<br>Reputation ${Math.round(b.reputation)}/100</p><div class="balance-line"><span>Last month’s profit</span><b class="${b.lastProfit >= 0 ? "positive" : "negative"}">${money(b.lastProfit)}</b></div><div class="balance-line"><span>Forecast operating profit</span><b>${money(forecast(s, b).profit)}</b></div>${btn("Manage business →", "manage:" + b.id, "light")}</section>`).join("")}${!s.businesses.length ? '<div class="card"><h2>Your first venture awaits.</h2><p>You have $25,000. A café, online store, or creative studio can put it to work. Leave cash for your first month of operations.</p>' + btn("Explore opportunities", "catalog") + "</div>" : ""}</div>`
  );
}
function manage(b) {
  let t = type(b),
    f = forecast(s, b),
    exp = t.cost * 0.65 * b.level;
  return (
    heading(
      esc(b.name),
      "Adjust the details. Build a better business.",
      btn("← All businesses", "allbusiness", "light"),
    ) +
    `<div class="stats">${stat("Revenue / last month", money(b.lastRevenue), b.sold + " units sold", "Markets")}${stat("Operating profit", money(b.lastProfit), "Before personal taxes & interest", "wallet")}${stat("Reputation", Math.round(b.reputation) + "/100", "Fulfill demand to earn loyalty", "Achievements")}${stat("Demand / capacity", f.demand + " / " + f.capacity, "Estimated units this month", "Businesses")}</div><div class="detail-grid"><section class="card"><h2>The operating desk</h2><label class="field">Price per unit · baseline ${money(t.price)}<input id="price" type="number" min="${t.price * 0.25}" max="${t.price * 4}" step="0.01" value="${b.price}"></label><label class="field">Team size · ${money(t.wage * s.inflation * city(b).wages * b.salary)} per employee / month<input id="staff" type="number" min="1" max="${b.level * 5}" value="${b.staff}"></label><label class="field">Monthly marketing budget<input id="marketing" type="number" min="0" max="100000" step="100" value="${b.marketing}"></label><label class="field">Product quality<select id="quality">${[1, 2, 3].map((n) => `<option value="${n}" ${b.quality === n ? "selected" : ""}>${["Standard", "Premium (+15% material costs)", "Exceptional (+30% material costs)"][n - 1]}</option>`).join("")}</select></label>${btn("Save operating plan", "plan:" + b.id)}<p class="explain">Demand responds to price, reputation, marketing, the economy, and research. Premium quality raises demand and reputation but costs more to produce. Hiring or firing costs 35% of a local base monthly wage per employee. Rent: ${money(t.rent * b.level * s.inflation * city(b).rent)}/month. Manage morale, suppliers, and projects in Operations.</p></section><div class="stack"><section class="card"><h2>Next month’s outlook</h2><div class="balance-line"><span>Estimated sales</span><b>${money(f.revenue)}</b></div><div class="balance-line"><span>Materials, wages, rent & marketing</span><b>−${money(f.expense)}</b></div><div class="balance-line total"><span>Operating profit</span><b class="${f.profit >= 0 ? "positive" : "negative"}">${money(f.profit)}</b></div><p class="explain">An estimate, not a guarantee. Demand varies ±15%. ${b.lost ? b.lost + " customers were unserved last month." : ""} Cash is needed to buy materials before sales arrive.</p></section><section class="card"><h2>Inventory & growth</h2><div class="balance-line"><span>Materials in stock</span><b>${b.inventory} units</b></div><label class="field">Purchasing policy<select id="auto" data-business="${b.id}"><option value="yes" ${b.auto ? "selected" : ""}>Automatic · buy for monthly demand</option><option value="no" ${!b.auto ? "selected" : ""}>Manual · use existing inventory only</option></select></label><div class="actions">${btn("Buy 100 units · " + money(f.unit * 100), "stock:" + b.id, "light", s.cash < f.unit * 100)}${btn("Expand · " + money(exp), "expand:" + b.id, "", s.cash < exp || b.level >= 10)}</div><p class="explain">Expansion unlocks 5 more employee slots. It also raises rent; hire staff to use the new capacity. Maximum level 10.</p></section><section class="card"><h2>Exit strategy</h2><p class="explain">Sell the company for ${money(t.cost * b.level * 0.75)} plus inventory at current material cost. This ends its income and expenses.</p><br>${btn("Sell business", "sellbusiness:" + b.id, "danger")}</section></div></div>`
  );
}
function catalog() {
  modal(
    `<h2>Your next big idea.</h2><p>24 industries. Different economics. Choose your next venture and keep cash for operations.</p><label class="field">Search industries<input id="businessSearch" placeholder="Try food, technology, or logistics" autocomplete="off"></label><div style="max-height:50vh;overflow:auto" id="businessCatalog">${TYPES.map((t) => `<article class="catalog-entry" data-search="${esc((t.name + " " + t.sector + " " + t.desc).toLowerCase())}"><div class="business-row"><div class="business-icon">${t.icon}</div><div class="business-info"><h3>${t.name}</h3><small>${t.sector} · Startup ${money(t.cost)}</small></div>${btn("Start", "found:" + t.id, "small", s.cash < t.cost)}</div><p style="font-size:11px;margin:0 0 12px 58px">${t.desc}</p></article>`).join("")}</div><div class="actions">${btn("Close", "close", "light")}</div>`,
  );
}
function markets() {
  return (
    heading(
      "Put your capital to work.",
      "Five fictional assets. Different risks. One growing portfolio.",
    ) +
    `<section class="card"><div class="table-scroll"><table><thead><tr><th>ASSET</th><th>PRICE</th><th>HISTORY</th><th>HOLDINGS</th><th>MONTHLY DIVIDEND</th><th>TRADE</th></tr></thead><tbody>${ASSETS.map((a, i) => `<tr><td><b>${a.ticker}</b><br><small>${a.name}</small></td><td>${money(s.prices[i])}</td><td style="width:110px">${spark(s.marketHistory[i])}</td><td>${s.holdings[i] || 0} shares<br><small>${money((s.holdings[i] || 0) * s.prices[i])}</small></td><td>${(a.div * 100).toFixed(1)}%</td><td>${btn("Buy", "trade:" + i + ":buy", "small", s.cash < s.prices[i])} ${btn("Sell", "trade:" + i + ":sell", "small light", !s.holdings[i])}</td></tr>`).join("")}</tbody></table></div><p class="explain">Prices change each month with economic conditions and random volatility. Dividends arrive automatically. There are no trading fees or real-money transactions. NOVA is the most volatile; BOND is the least.</p></section>`
  );
}
function properties() {
  return (
    heading(
      "Own a little more of the world.",
      "Collect rent, cover upkeep, and build long-term assets.",
    ) +
    `<div class="catalog">${PROPERTIES.map((p, i) => `<section class="card"><div class="business-icon">${["⌂", "▤", "▥"][i]}</div><h2>${p.name}</h2><p>Property ${i === 0 ? "residential" : i === 1 ? "commercial" : "industrial"} · ${s.properties.filter((x) => x.kind === i).length} owned</p><div class="amount">${money(p.cost)}</div><div class="balance-line"><span>Monthly rent</span><b>${money(p.rent)}</b></div><div class="balance-line"><span>Monthly upkeep</span><b>${money(p.upkeep * s.inflation)}</b></div>${btn("Buy property", "property:" + i, "", s.cash < p.cost)}</section>`).join("")}</div><p class="explain">Each property has an 8% monthly vacancy chance. Upkeep is paid even when vacant. Property values fluctuate and rent is taxable.</p>${s.properties.length ? '<section class="card" style="margin-top:22px"><h2>Your property portfolio</h2>' + s.properties.map((p, i) => `<div class="balance-line"><span>${PROPERTIES[p.kind].name} #${i + 1}</span><span>${money(PROPERTIES[p.kind].cost * p.factor * (1 + ((p.level || 1) - 1) * 0.15))} &nbsp; ${btn("Sell (3% fee)", "sellproperty:" + i, "small light")}</span></div>`).join("") + "</section>" : ""}`
  );
}
function banking() {
  let limit = Math.max(25000, worth(s) * 0.5),
    available = Math.max(0, limit - s.debt);
  return (
    heading(
      "Give your ambitions some runway.",
      "Debt can accelerate growth. Interest can slow it down.",
    ) +
    `<div class="stats">${stat("Cash", money(s.cash), "Your liquid capital", "wallet")}${stat("Outstanding debt", money(s.debt), "Interest charged monthly", "Banking")}${stat("Annual interest rate", (s.rate * 100).toFixed(1) + "%", "Variable, follows the economy", "Markets")}${stat("Available credit", money(available), "Based on current net worth", "Properties")}</div><div class="detail-grid"><section class="card"><h2>Your credit line</h2><p class="explain">Borrow up to the greater of $25,000 or 50% of your net worth, minus existing debt. No fixed repayment schedule. Emergency credit may exceed this limit if cash runs out.</p><label class="field">Amount in dollars<input id="loanAmount" type="number" min="1" step="100" value="5000"></label><div class="actions">${btn("Borrow funds", "borrow", "", available < 1)}${btn("Repay debt", "repay", "light", s.debt <= 0)}</div><p class="explain">Current interest payment: ${money((s.debt * s.rate) / 12)} per month. Unused cash earns no interest.</p></section><section class="card"><h2>Your balance sheet</h2><div class="balance-line"><span>Cash</span><b>${money(s.cash)}</b></div><div class="balance-line"><span>Businesses (resale value)</span><b>${money(s.businesses.reduce((n, b) => n + type(b).cost * b.level * 0.75, 0))}</b></div><div class="balance-line"><span>Stock portfolio</span><b>${money(s.prices.reduce((n, p, i) => n + p * (s.holdings[i] || 0), 0))}</b></div><div class="balance-line"><span>Real estate</span><b>${money(s.properties.reduce((n, p) => n + PROPERTIES[p.kind].cost * p.factor * (1 + ((p.level || 1) - 1) * 0.15), 0))}</b></div><div class="balance-line"><span>Inventory (base cost), deposits & invoices</span><b>${money(s.businesses.reduce((n, b) => n + b.inventory * type(b).unit, 0) + s.world.receivables.reduce((n, r) => n + r.amount, 0) + s.world.contracts.filter((c) => c.status === "active").reduce((n, c) => n + c.deposit, 0))}</b></div><div class="balance-line"><span>Warehouse, shipments, FX & advanced assets</span><b>${money(additionalAssets(s))}</b></div><div class="balance-line"><span>Private ventures, bank equity & infrastructure</span><b>${money(lateAssets(s))}</b></div><div class="balance-line"><span>Debt</span><b>−${money(s.debt)}</b></div><div class="balance-line total"><span>Net worth</span><b>${money(worth(s))}</b></div></section></div>`
  );
}
function research() {
  return (
    heading(
      "Work smarter. Grow stronger.",
      "Permanent improvements across every company in your empire.",
    ) +
    `<div class="catalog">${TECH.map((t) => `<section class="card"><div class="business-icon">${{ ops: "⚙", brand: "✧", automation: "⌘" }[t.id]}</div><h2>${t.name}</h2><p>${t.desc}</p><div class="progress"><div style="width:${s.tech[t.id] * 20}%"></div></div><div class="split"><small>LEVEL ${s.tech[t.id]} / 5</small><b>${s.tech[t.id] === 5 ? "Fully researched" : money(t.base * (s.tech[t.id] + 1))}</b></div>${btn(s.tech[t.id] === 5 ? "Research complete" : "Invest in research", "research:" + t.id, "", s.tech[t.id] === 5 || s.cash < t.base * (s.tech[t.id] + 1))}</section>`).join("")}</div><p class="explain">Research benefits apply immediately to all current and future businesses. Each level costs more than the last. Research spending reduces cash and is not a resalable asset.</p>`
  );
}
function ledger() {
  let c = s.lastCosts;
  return (
    heading(
      "Know where every dollar goes.",
      "The numbers behind your decisions.",
    ) +
    `${
      c
        ? `<section class="card" style="margin-bottom:20px"><h2>Last month’s income statement</h2>${[
            ["Business revenue", c.revenue],
            ["Business operating profit", c.operating],
            ["Corporate royalties and licensing", c.corporate || 0],
            ["Dividends", c.dividend],
            ["Net property income", c.rent],
            ["Finance, executives, storage, fines & incidents", -c.interest],
            ["Tax on positive taxable profit", -c.tax],
            ["Living costs", -c.living],
            ["Net monthly profit", s.profit],
          ]
            .map(
              ([k, v]) =>
                `<div class="balance-line"><span>${k}</span><b class="${v < 0 ? "negative" : ""}">${money(v)}</b></div>`,
            )
            .join("")}</section>`
        : ""
    }<section class="card"><h2>Transaction journal</h2><div class="table-scroll"><table><thead><tr><th>MONTH</th><th>ACTIVITY</th><th>AMOUNT</th></tr></thead><tbody>${s.ledger.map((l) => `<tr><td>${l.month + 1}</td><td>${esc(l.text)}</td><td class="${l.amount < 0 ? "negative" : "positive"}">${money(l.amount)}</td></tr>`).join("")}</tbody></table></div>${!s.ledger.length ? '<p class="explain">A clean slate. Start a business to write your first entry.</p>' : ""}<p class="explain">Operating entries report profit, including materials consumed. Inventory purchases can create a difference between profit and cash flow. Most recent 160 entries retained.</p></section>`
  );
}
const goals = [
  ["founder", "Open for business", "Start your first company."],
  [
    "diversified",
    "A portfolio of possibilities",
    "Own three businesses at once.",
  ],
  ["investor", "Skin in the game", "Hold your first stock investment."],
  ["landlord", "Keys to the city", "Own a property."],
  ["sixfigures", "Six figures", "Reach $100,000 net worth."],
  [
    "millionaire",
    "The million-dollar milestone",
    "Reach $1,000,000 net worth.",
  ],
  ["year", "A year in the making", "Complete twelve months."],
  ["profit", "A well-oiled machine", "Earn $10,000 net profit in a month."],
  ["researcher", "Ahead of the curve", "Reach level 3 in any research."],
];
function achievements() {
  return (
    heading(
      "Every empire has a story.",
      "Milestones unlock at the end of each month. Keep building.",
    ) +
    `<section class="card">${goals.map(([id, title, desc]) => `<div class="achievement ${s.achievements.includes(id) ? "" : "locked"}"><div class="business-icon">${s.achievements.includes(id) ? "★" : "☆"}</div><div style="flex:1"><h3>${title}</h3><p>${desc}</p></div><span class="tag">${s.achievements.includes(id) ? "UNLOCKED" : "IN PROGRESS"}</span></div>`).join("")}</section>`
  );
}
function settings() {
  return (
    heading(
      "Your sandbox. Your pace.",
      "Keep your progress safe, or start a new story.",
    ) +
    `<div class="detail-grid"><section class="card"><h2>Save & restore</h2><p class="explain">Your game auto-saves in this browser after every action. Export a file to move to another device or keep a backup. Clearing browser data removes the local save.</p><br><div class="actions">${btn("Export save", "export")}${btn("Import save", "import", "light")}</div><input type="file" id="saveFile" accept="application/json,.json" hidden><p class="explain">No accounts. No subscriptions. No real money.</p></section><section class="card"><h2>A fresh start</h2><p class="explain">Reset to $25,000 in January 2026. Your current game will be replaced. Export a backup first if you want to keep it.</p><br>${btn("Start a new game", "reset", "danger")}</section></div>`
  );
}
function changed(message) {
  save();
  render();
  if (message) toast(message);
}
document.addEventListener("click", (e) => {
  let nav = e.target.closest("[data-page]");
  if (nav) {
    page = nav.dataset.page;
    selected = null;
    render();
    return;
  }
  let el = e.target.closest("[data-action]");
  if (!el) return;
  let [a, id, mode] = el.dataset.action.split(":");
  let b = s.businesses.find((b) => String(b.id) === id);
  if (a === "sector") {
    industryAction(el.dataset.action.split(":"), s, {
      btn,
      money,
      esc,
      modal,
      close,
      changed,
      toast,
    });
    return;
  }
  if (a === "l") {
    endgameAction(el.dataset.action.split(":"), s, {
      money,
      esc,
      btn,
      modal,
      close,
      changed,
      toast,
      replace: (next) => {
        s = next;
        page = "Overview";
        selected = null;
        changed("A new chapter begins.");
      },
    });
    return;
  }
  if (a === "x") {
    expansionAction(el.dataset.action.split(":"), s, {
      money,
      esc,
      btn,
      modal,
      close,
      changed,
      toast,
      spark,
      navigate: (n) => {
        page = n;
        selected = null;
        render();
      },
    });
    return;
  }
  if (a === "s") {
    strategyAction(el.dataset.action.split(":"), s, {
      money,
      esc,
      btn,
      modal,
      close,
      changed,
      toast,
    });
    return;
  }
  switch (a) {
    case "close":
      close();
      break;
    case "catalog":
      catalog();
      break;
    case "allbusiness":
      selected = null;
      render();
      break;
    case "manage":
      page = "Businesses";
      selected = Number(id);
      render();
      break;
    case "found": {
      let t = TYPES.find((t) => t.id === id);
      modal(
        `<h2>Make it yours.</h2><p>${t.desc} Startup cost: ${money(t.cost)}. You’ll have ${money(s.cash - t.cost)} left for operations.</p><label class="field">Business name<input id="businessName" maxlength="48" value="${t.name}"></label><div class="actions">${btn("Back", "catalog", "light")}${btn("Open for business", "confirmfound:" + id)}</div>`,
      );
      break;
    }
    case "confirmfound": {
      let name = $("#businessName").value.trim().slice(0, 48);
      if (start(s, id, name)) {
        close();
        page = "Businesses";
        selected = s.businesses.at(-1).id;
        changed("The doors are open. Your story starts here.");
      }
      break;
    }
    case "plan": {
      let price = Number($("#price").value),
        staff = Number($("#staff").value),
        marketing = Number($("#marketing").value),
        quality = Number($("#quality").value);
      let t = type(b);
      if (
        !Number.isFinite(price) ||
        price < t.price * 0.25 ||
        price > t.price * 4 ||
        !Number.isInteger(staff) ||
        staff < 1 ||
        staff > b.level * 5 ||
        !Number.isFinite(marketing) ||
        marketing < 0 ||
        marketing > 100000
      )
        return toast("Check the price, staffing limits, and marketing budget.");
      let staffingCost =
        Math.abs(staff - b.staff) * type(b).wage * 0.35 * city(b).wages;
      if (s.cash < staffingCost)
        return toast("Insufficient cash for hiring or severance costs.");
      if (staffingCost) {
        s.cash -= staffingCost;
        log(s, "Hiring / severance: " + b.name, -staffingCost);
      }
      Object.assign(b, { price, staff, marketing, quality });
      changed("Operating plan saved.");
      break;
    }
    case "stock": {
      let cost = forecast(s, b).unit * 100;
      if (s.cash >= cost) {
        s.cash -= cost;
        b.inventory += 100;
        log(s, "Inventory: " + b.name, -cost);
        changed("100 units added to inventory.");
      }
      break;
    }
    case "expand": {
      let cost = type(b).cost * 0.65 * b.level;
      if (s.cash >= cost && b.level < 10) {
        s.cash -= cost;
        b.level++;
        log(s, "Expanded " + b.name, -cost);
        changed("Expansion complete. You can now hire more staff.");
      }
      break;
    }
    case "sellbusiness":
      if (!canSell(s, b))
        return toast("Complete active contracts before selling this company.");
      modal(
        `<h2>Sell ${esc(b.name)}?</h2><p>This closes the company and ends all its income and expenses. Its staff and operating plan will be removed.</p><div class="actions">${btn("Keep building", "close", "light")}${btn("Sell company", "confirmsell:" + id, "danger")}</div>`,
      );
      break;
    case "confirmsell": {
      if (!canSell(s, b)) return toast("Complete active contracts first.");
      let value =
        type(b).cost * b.level * 0.75 + b.inventory * forecast(s, b).unit;
      s.cash += value;
      s.businesses = s.businesses.filter((x) => x !== b);
      log(s, "Sold " + b.name, value);
      selected = null;
      close();
      changed("Business sold.");
      break;
    }
    case "quarter": {
      let steps = 0;
      while (steps < 3 && !s.event) {
        advance(s);
        steps++;
      }
      changed(steps + " months simulated. Review results before continuing.");
      if (s.event)
        modal(
          `<h2>A decision is waiting.</h2>${eventCard()}<div class="actions">${btn("Decide later", "close", "light")}</div>`,
        );
      break;
    }
    case "advance":
      if (s.event) {
        modal(
          `<h2>A decision is waiting.</h2>${eventCard()}<div class="actions">${btn("Close", "close", "light")}</div>`,
        );
        break;
      }
      advance(s);
      changed("Month closed. Review your results and plan the next move.");
      if (s.event)
        modal(
          `<h2>An opportunity at your door.</h2>${eventCard()}<div class="actions">${btn("Decide later", "close", "light")}</div>`,
        );
      break;
    case "event":
      if (resolve(s, id === "yes")) {
        close();
        changed("Decision recorded.");
      }
      break;
    case "trade": {
      let i = Number(id);
      modal(
        `<h2>${mode === "buy" ? "Buy" : "Sell"} ${ASSETS[i].ticker}</h2><p>Current price: ${money(s.prices[i])} per share. ${mode === "buy" ? "Available cash: " + money(s.cash) : "Shares owned: " + (s.holdings[i] || 0)}.</p><label class="field">Whole shares<input id="tradeQty" type="number" min="1" max="${mode === "buy" ? Math.floor(s.cash / s.prices[i]) : s.holdings[i]}" value="1"></label><div class="actions">${btn("Cancel", "close", "light")}${btn("Confirm " + mode, "confirmtrade:" + i + ":" + mode)}</div>`,
      );
      break;
    }
    case "confirmtrade": {
      let qty = Number($("#tradeQty").value);
      if (qty < 1 || !transact(s, Number(id), mode === "buy" ? qty : -qty))
        return toast("Enter whole shares within your available balance.");
      close();
      changed("Trade completed.");
      break;
    }
    case "property": {
      let p = PROPERTIES[id];
      if (s.cash >= p.cost) {
        s.cash -= p.cost;
        s.properties.push({ kind: Number(id), factor: 1 });
        log(s, "Purchased " + p.name, -p.cost);
        changed("The keys are yours. Rent begins next month.");
      }
      break;
    }
    case "sellproperty": {
      let p = s.properties[id];
      modal(
        `<h2>Sell this property?</h2><p>You will receive ${money(PROPERTIES[p.kind].cost * p.factor * (1 + ((p.level || 1) - 1) * 0.15) * 0.97)} after the 3% selling fee.</p><div class="actions">${btn("Cancel", "close", "light")}${btn("Sell property", "confirmsellproperty:" + id, "danger")}</div>`,
      );
      break;
    }
    case "confirmsellproperty": {
      let p = s.properties[id],
        value =
          PROPERTIES[p.kind].cost *
          p.factor *
          (1 + ((p.level || 1) - 1) * 0.15) *
          0.97;
      s.cash += value;
      s.properties.splice(Number(id), 1);
      log(s, "Property sale", value);
      close();
      changed("Property sold.");
      break;
    }
    case "borrow":
    case "repay": {
      let n = Number($("#loanAmount").value);
      if (!Number.isFinite(n) || n <= 0)
        return toast("Enter a positive amount.");
      if (a === "borrow") {
        let available = Math.max(25000, worth(s) * 0.5) - s.debt;
        if (n > available)
          return toast("This amount exceeds your credit limit.");
        s.cash += n;
        s.debt += n;
        log(s, "Credit line draw", n);
      } else {
        let revolving = Math.max(
          0,
          s.debt - s.world.bonds.reduce((v, l) => v + l.balance, 0),
        );
        if (n > revolving || n > s.cash)
          return toast(
            "Repayment cannot exceed cash or revolving debt. Term loans amortize separately.",
          );
        s.cash -= n;
        s.debt -= n;
        log(s, "Debt repayment", -n);
      }
      changed("Credit line updated.");
      break;
    }
    case "research": {
      let t = TECH.find((t) => t.id === id),
        cost = t.base * (s.tech[id] + 1);
      if (s.tech[id] < 5 && s.cash >= cost) {
        s.cash -= cost;
        s.tech[id]++;
        log(s, "Research: " + t.name, -cost);
        changed("Research complete. All your businesses benefit.");
      }
      break;
    }
    case "export": {
      let blob = new Blob([JSON.stringify(s, null, 2)], {
          type: "application/json",
        }),
        url = URL.createObjectURL(blob),
        link = document.createElement("a");
      link.href = url;
      link.download = "fido-month-" + (s.month + 1) + ".json";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast("Save exported.");
      break;
    }
    case "import":
      $("#saveFile").click();
      break;
    case "reset":
      modal(
        `<h2>Begin again?</h2><p>This replaces your current game. Export your save first if you want to return to this empire.</p><div class="actions">${btn("Keep my game", "close", "light")}${btn("Reset everything", "confirmreset", "danger")}</div>`,
      );
      break;
    case "confirmreset":
      s = fresh();
      page = "Overview";
      selected = null;
      close();
      changed("A new beginning. Make it count.");
      break;
    case "help":
      modal(
        `<h2>A founder’s field guide.</h2><p><b>1. Open your first business.</b> Start with the café ($12,000) and keep a cash buffer. A new business starts with one employee and automatic materials purchasing.</p><p><b>2. Find your margins.</b> Set prices, hire staff, and watch forecast demand versus capacity. Higher prices improve margins but reduce demand. Expansion increases staff slots and rent. Hiring or firing costs 35% of a local monthly base wage per employee.</p><p><b>3. Advance a month.</b> Businesses trade, staff get paid, investments move, and events unfold. Personal living costs start at $650/month. Tax starts at 20% and changes with government policy.</p><p><b>4. Grow your empire.</b> Research improves all businesses. Buy stocks for dividends, properties for rent, or borrow to expand. Cash shortages trigger emergency debt. There is no forced game over.</p><p><b>5. Build a real operation.</b> Operations controls wages, training, suppliers, maintenance, insurance, city, and multi-month product projects. Contracts reserve capacity and pay invoices later. World shows commodity costs and policy. Competitors can be acquired. Treasury offers fixed-rate amortizing loans.</p><p><b>6. Build the group.</b> Supply manages raw-material shipments and shared warehouses. Talent hires executives. Ownership handles funding rounds, IPOs, dividends, and buybacks. Innovation unlocks technologies. Trading adds limit orders, shorts, and options. Exchange manages foreign reserves. Development upgrades properties.</p><p><b>7. Plan ahead.</b> Planner explains demand drivers, tests operating changes, and simulates 30 possible twelve-month futures without changing your save. Milestones reward different playstyles.</p><p><b>8. Build a legacy.</b> International unlocks 13 cities across five regions. Megaprojects create lasting infrastructure through four funded stages. Ventures backs independent startups. Bank lets you operate a separately capitalized lender. Headquarters manages organizational scale. Dynasty carries prestige advantages across generations.</p><p><b>9. Play your way.</b> Chase $1 million, build a chain of cafés, or become a property investor. Save backups in Settings. All markets and money are fictional.</p><div class="actions">${btn("Let’s build", "close")}</div>`,
      );
      break;
  }
});
document.addEventListener("change", async (e) => {
  if (e.target.id === "auto") {
    let b = s.businesses.find(
      (b) => String(b.id) === e.target.dataset.business,
    );
    b.auto = e.target.value === "yes";
    changed("Purchasing policy saved.");
  }
  if (e.target.id === "saveFile") {
    try {
      let file = e.target.files[0];
      if (!file) return;
      if (file.size > 2000000) throw Error();
      let next = JSON.parse(await file.text());
      if (!valid(next)) throw Error();
      s = next;
      selected = null;
      changed("Save restored.");
    } catch {
      toast("That file is not a valid FiDo save. Your game is unchanged.");
    }
  }
});
render();

document.addEventListener("input", (e) => {
  if (e.target.id === "businessSearch") {
    let query = e.target.value.toLowerCase();
    document.querySelectorAll(".catalog-entry").forEach((el) => {
      el.hidden = !el.dataset.search.includes(query);
    });
  }
});

function navigation() {
  let groups = [
    [
      "OPERATE",
      [
        "Businesses",
        "Industries",
        "Operations",
        "Supply",
        "Talent",
        "Contracts",
      ],
    ],
    [
      "EXPAND",
      [
        "World",
        "International",
        "Competitors",
        "Franchises",
        "Properties",
        "Development",
      ],
    ],
    [
      "CAPITAL",
      ["Markets", "Trading", "Exchange", "Banking", "Treasury", "Ownership"],
    ],
    [
      "STRATEGY",
      [
        "Research",
        "Innovation",
        "Planner",
        "Milestones",
        "Ledger",
        "Achievements",
        "Scenarios",
      ],
    ],
    [
      "ENDGAME",
      ["Megaprojects", "Ventures", "Bank", "Headquarters", "Dynasty"],
    ],
  ];
  let navButton = (n) =>
    `<button class="nav ${page === n ? "active" : ""}" data-page="${n}" title="${n}">${icon(n)}<span>${n}</span></button>`;
  return `<nav class="nav-scroll" aria-label="Game navigation">${navButton("Overview")}${groups.map(([label, names]) => `<details class="nav-group" ${names.includes(page) || (page === "Overview" && label === "OPERATE") ? "open" : ""}><summary>${label}<span>⌄</span></summary>${names.map(navButton).join("")}</details>`).join("")}</nav>`;
}
