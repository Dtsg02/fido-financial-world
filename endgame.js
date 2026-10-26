import { fresh, start, worth, log, TYPES } from "./engine.js";
import { CITIES } from "./world.js";
import { RESEARCH, ensureEmpire } from "./empire.js";
import {
  REGIONS,
  CITY_REGION,
  MEGAPROJECTS,
  SCENARIOS,
  DYNASTY_UPGRADES,
  ensureLate,
  openRegion,
  tradeTreaty,
  canStartMega,
  megaStageCost,
  startMega,
  fundMega,
  investVenture,
  followVenture,
  sellVenture,
  bankEquity,
  charterBank,
  capitalizeBank,
  withdrawBank,
  setBankPolicy,
  prestigeEarned,
  dynastyUpgrade,
  upgradeHQ,
  adminMultiplier,
  completed,
} from "./late.js";
export const endgamePages = [
  "International",
  "Megaprojects",
  "Ventures",
  "Bank",
  "Headquarters",
  "Dynasty",
  "Scenarios",
];
export function endgameContent(page, s, h) {
  let l = ensureLate(s),
    { heading, btn, money, esc, stat, spark } = h;
  if (page === "International")
    return (
      heading(
        "The next frontier is a different economy.",
        "Open regional operations, manage currency exposure, and negotiate trade access.",
      ) +
      `<div class="stats">${stat("Regions accessible", l.regions.filter((r) => r.access).length + " / 5", "Entry licenses are permanent", "World")}${stat("Cities with operations", new Set(s.businesses.map((b) => b.city)).size + " / 13", "All cities have distinct cost structures", "Properties")}${stat("Active trade agreements", l.regions.filter((r) => r.treaty > 0).length, "Tariffs halved for 24 months", "Contracts")}${stat("Foreign businesses", s.businesses.filter((b) => CITY_REGION[b.city] !== "home").length, "Local wages and rent follow FX", "Exchange")}</div><div class="catalog">${l.regions
        .map(
          (r, i) =>
            `<section class="card"><div class="split"><span class="tag">${r.access ? "LICENSED" : "NEW FRONTIER"}</span><span>${r.currency < 0 ? "USD" : ["EUR", "GBP", "JPY", "EMC"][r.currency]}</span></div><h2>${esc(r.name)}</h2><p>${esc(r.desc)}</p><div class="balance-line"><span>Demand growth factor</span><b>${r.growth.toFixed(2)}×</b></div><div class="balance-line"><span>Political stability</span><b>${Math.round(r.stability)} / 100</b></div><div class="balance-line"><span>Effective import tariff</span><b>${(r.tariff * (r.treaty > 0 ? 0.5 : 1) * 100).toFixed(1)}%</b></div><p>${CITIES.filter(
              (c) => CITY_REGION[c.id] === r.id,
            )
              .map((c) => c.name)
              .join(
                " · ",
              )}</p>${!r.access ? btn("Open region · " + money(i * 25000 + 25000), "l:region:" + r.id, "", s.cash < i * 25000 + 25000) : btn(r.treaty > 0 ? "Treaty: " + r.treaty + " months left" : "Trade agreement · $50,000", "l:treaty:" + r.id, "light", r.treaty > 0 || s.cash < 50000)}</section>`,
        )
        .join(
          "",
        )}</div><p class="explain">Licensing unlocks relocation and acquisitions in the region. Wages and rent are multiplied by the local currency’s change from its opening exchange rate. Tariffs increase material costs. Political stability and regional growth affect customer demand. Trade agreements reduce tariffs; they do not remove currency exposure.</p>`
    );
  if (page === "Megaprojects")
    return (
      heading(
        "Build things that outlive a business cycle.",
        "Twelve staged investments. Infrastructure-scale costs. Group-wide advantages.",
      ) +
      `<div class="stats">${stat("Completed landmarks", l.projects.filter((p) => p.status === "complete").length + " / 12", "Permanent bonuses and monthly income", "Achievements")}${stat("Projects in development", l.projects.filter((p) => p.status !== "complete").length + " / 3", "Maximum three construction programs", "Properties")}${stat("Capital committed", money(l.projects.reduce((n, p) => n + p.invested, 0)), "Construction assets valued at 70% of funding", "wallet")}${stat("Infrastructure income", money(l.monthIncome), "Last month, net operating contribution", "Markets")}</div><div class="catalog">${MEGAPROJECTS.map(
        (p) => {
          let q = l.projects.find((x) => x.id === p.id),
            ready = canStartMega(s, p.id);
          return `<section class="card mega-card"><div class="split"><span class="tag">${q ? (q.status === "complete" ? "OPERATIONAL" : "STAGE " + (q.stage + 1) + " OF 4") : "MEGAPROJECT"}</span><small>${Math.ceil(p.months / 4) * 4} months construction</small></div><h2>${p.name}</h2><div class="amount">${money(p.cost)}</div><p>${p.effect}</p><div class="balance-line"><span>Base monthly income</span><b>${money(p.income)}</b></div><p><b>Research:</b> ${p.requires.map((id) => RESEARCH.find((r) => r.id === id).name).join(", ")}<br><b>Operating sectors:</b> ${p.industries.map((id) => TYPES.find((t) => t.id === id).name).join(", ") || "No sector requirement"}<br><b>Materials:</b> ${p.material.toLocaleString()} industrial lots over stages 2–4</p>${q ? `<div class="progress"><div style="width:${q.status === "complete" ? 100 : (q.stage + (q.status === "awaiting" ? 1 : 1 - q.remaining / Math.ceil(p.months / 4))) * 25}%"></div></div>` : ""}${q?.status === "awaiting" ? btn("Fund next stage · " + money(megaStageCost(p, q.stage + 1)), "l:megafund:" + p.id, "", s.cash < megaStageCost(p, q.stage + 1) || s.empire.warehouse[1] < p.material / 3) : q?.status === "building" ? btn(q.remaining + " months until stage complete", "noop", "light", true) : q?.status === "complete" ? btn("Strategic asset operational", "noop", "light", true) : btn("Start design · " + money(megaStageCost(p, 0)), "l:megastart:" + p.id, "", !ready || s.cash < megaStageCost(p, 0))}</section>`;
        },
      ).join(
        "",
      )}</div><p class="explain">Funding is split 15% / 25% / 35% / 25%. Each stage takes a quarter of the listed duration, rounded up. Stages 2–4 each consume one third of the industrial materials. Projects pause safely between stages until you fund them. The income shown scales with the economy after completion.</p>`
    );
  if (page === "Ventures")
    return (
      heading(
        "Back the next generation of companies.",
        "Illiquid private investments, funding rounds, dilution, failure, and eventual exits.",
      ) +
      `<div class="stats">${stat("Active venture stakes", l.ventures.filter((v) => v.status === "active").length, "Independent startups, not operating companies", "Businesses")}${stat("Secondary-market value", money(l.ventures.filter((v) => v.status === "active").reduce((n, v) => n + v.valuation * v.stake * 0.8, 0)), "20% liquidity discount to indicative valuation", "Markets")}${stat("Successful exits", l.exits, "Possible after month 18 of each investment", "Achievements")}${stat("Write-offs", l.bankruptcies, "Startup failure can lose the entire stake", "Banking")}</div><section class="card"><h2>Your private portfolio</h2>${l.ventures.map((v) => `<div class="research"><div class="split"><h3>${esc(v.name)}</h3><span class="tag">${v.status.toUpperCase()}</span></div><div class="diagnostic-metrics"><span>Stake <b>${(v.stake * 100).toFixed(2)}%</b></span><span>Indicative valuation <b>${money(v.valuation)}</b></span><span>Capital invested <b>${money(v.invested)}</b></span><span>Runway <b>${v.runway} months</b></span><span>Age <b>${v.age} months</b></span><span>Funding rounds <b>${v.round}</b></span></div>${v.status === "active" ? `<div class="actions">${btn("Follow-on · " + money(v.valuation * 0.08), "l:follow:" + v.id, "small", s.cash < v.valuation * 0.08)}${btn("Sell at 20% discount", "l:ventureexit:" + v.id, "small light")}</div>` : `<p>Realized proceeds: ${money(v.realized || 0)}</p>`}</div>`).join("") || '<p class="explain">No private investments yet.</p>'}</section><div class="card-head" style="margin-top:26px"><h2>Deal flow</h2><span class="tag">REFRESHES EVERY SIX MONTHS</span></div><div class="catalog">${l.ventureOffers.map((v) => `<section class="card"><span class="tag">${TYPES.find((t) => t.id === v.type).sector}</span><h2>${esc(v.name)}</h2><div class="balance-line"><span>Pre-money valuation</span><b>${money(v.valuation)}</b></div><p>Indicative monthly valuation growth ${Math.round(v.growth * 100)}% before randomness. Baseline monthly failure risk ${(v.risk * 0.5 * 100).toFixed(1)}%, rising when runway runs out or the economy weakens.</p>${btn("Review investment", "l:venture:" + v.id, "light", s.cash < 10000)}</section>`).join("")}</div><p class="explain">A startup begins with 12 months of runway. Follow-on investment adds eight months. Outside financing can dilute your stake. After 18 months, an active startup has a 10% monthly chance of an exit. Indicative growth does not guarantee investment returns.</p>`
    );
  if (page === "Bank") {
    let b = l.bank;
    if (!b)
      return (
        heading(
          "Become the institution others borrow from.",
          "A separately capitalized banking business with deposit liabilities and credit risk.",
        ) +
        `<section class="card"><h2>Apply for a banking charter</h2><p class="explain">Requirements: twelve completed months, at least one equity funding round, and $500,000 group cash. The initial capital moves into a separate bank balance sheet. Deposits are customer liabilities, not free money for the group.</p><div class="balance-line"><span>Operating history</span><b>${s.month} / 12 months</b></div><div class="balance-line"><span>Equity rounds</span><b>${s.empire.corporate.rounds} / 1</b></div><div class="balance-line"><span>Required capitalization</span><b>$500,000</b></div><br>${btn("Establish bank", "l:bankcharter", "", s.month < 12 || s.empire.corporate.rounds < 1 || s.cash < 500000)}</section>`
      );
    return (
      heading(
        "Deposits are a promise. Loans are a risk.",
        "Manage spread income, liquidity, underwriting, and capital adequacy.",
      ) +
      `<div class="stats">${stat("Bank equity", money(bankEquity(b)), "Cash + loans − deposit liabilities", "Banking")}${stat("Deposit liabilities", money(b.deposits), "Withdrawable customer balances", "wallet")}${stat("Loan book", money(b.loans), "Principal outstanding after credit losses", "Contracts")}${stat("Monthly bank profit", money(b.profit), "After interest, overhead, and defaults", "Markets")}</div><div class="detail-grid"><section class="card"><div class="split"><h2>Credit & deposit policy</h2><span class="tag">${b.frozen ? "REGULATORY FREEZE" : "OPERATING"}</span></div><label class="field">Annual deposit interest rate (%)<input id="bankDeposit" type="number" min="0" max="10" step="0.1" value="${b.depositRate * 100}"></label><label class="field">Annual loan interest rate (%)<input id="bankLoan" type="number" min="3" max="30" step="0.1" value="${b.loanRate * 100}"></label><label class="field">Minimum cash reserve (%)<input id="bankReserve" type="number" min="10" max="80" value="${b.reserve * 100}"></label><label class="field">Underwriting<select id="bankRisk">${["conservative", "balanced", "aggressive"].map((x) => `<option value="${x}" ${b.underwriting === x ? "selected" : ""}>${x}</option>`).join("")}</select></label>${btn("Save bank policy", "l:bankpolicy")}<p class="explain">Higher deposit rates attract funding but increase expense. Higher loan rates reduce borrower demand. Underwriting controls credit losses: conservative 0.15%, balanced 0.4%, aggressive 0.9% base monthly loss, adjusted by the economy and randomness. New lending requires 12% equity backing and your chosen liquidity reserve.</p></section><section class="card"><h2>Capital & liquidity</h2><div class="balance-line"><span>Available bank cash</span><b>${money(b.cash)}</b></div><div class="balance-line"><span>Capital / loan book</span><b>${b.loans ? ((100 * bankEquity(b)) / b.loans).toFixed(1) + "%" : "—"}</b></div><div class="balance-line"><span>Depositor confidence</span><b>${Math.round(b.confidence)} / 100</b></div><div class="balance-line"><span>Cumulative credit losses</span><b>${money(b.defaults)}</b></div><label class="field">Capital transfer amount<input id="bankTransfer" type="number" min="1" value="100000"></label><div class="actions">${btn("Inject capital", "l:bankinject", "light")}${btn("Withdraw excess capital", "l:bankwithdraw", "light")}</div><p class="explain">Withdrawals must leave at least $250,000 equity, 12% capital backing, and the liquidity reserve. A bank that cannot honor withdrawals or has negative equity stops new lending. A sufficient capital injection can release the freeze.</p>${
        b.history.length > 1
          ? spark(
              b.history.map((x) => x.equity),
              true,
            )
          : ""
      }</section></div>`
    );
  }
  if (page === "Headquarters") {
    let hq = l.headquarters;
    return (
      heading(
        "Complexity needs an operating system.",
        "A sprawling group can lose productivity without management capacity.",
      ) +
      `<div class="stats">${stat("Headquarters level", hq.level + " / 10", "Each level comfortably supports four businesses", "Properties")}${stat("Companies managed", s.businesses.length + " / " + hq.level * 4, "Excess complexity reduces production capacity", "Businesses")}${stat("Management multiplier", Math.round(adminMultiplier(s) * 100) + "%", "Applied to company production capacity", "Operations")}${stat("HQ monthly overhead", money((hq.level - 1) * 2500 + hq.budget), "Capacity upgrades carry ongoing cost", "wallet")}</div><div class="detail-grid"><section class="card"><h2>Build the group’s backbone</h2><p class="explain">Beyond management capacity, every additional business reduces group production capacity by 1.5 percentage points, down to a 60% floor. A headquarters upgrade adds capacity for four more companies.</p><br>${btn(hq.level >= 10 ? "Headquarters fully developed" : "Upgrade headquarters · " + money(hq.level * 100000), "l:hqupgrade", "", hq.level >= 10 || s.cash < hq.level * 100000)}<p class="explain">Each level above the first costs $2,500/month and adds $50,000 to the headquarters asset’s carrying value.</p></section><section class="card"><h2>Management philosophy</h2><label class="field">Operating model<select id="hqPolicy"><option value="balanced" ${hq.policy === "balanced" ? "selected" : ""}>Balanced · no extra modifier</option><option value="decentralized" ${hq.policy === "decentralized" ? "selected" : ""}>Decentralized · +5% production capacity</option><option value="people" ${hq.policy === "people" ? "selected" : ""}>People-first · +1.5 morale each month</option></select></label><label class="field">Monthly regional partnerships budget<input id="hqBudget" type="number" min="0" max="100000" value="${hq.budget}"></label>${btn("Save group policy", "l:hqpolicy", "light")}<p class="explain">Each $50,000 of monthly regional partnerships spending restores one stability point in each licensed region, up to 95. This reduces exposure to unstable demand but is a recurring cash cost.</p></section></div>`
    );
  }
  if (page === "Dynasty") {
    let d = l.dynasty,
      earned = prestigeEarned(s, worth(s));
    return (
      heading(
        "An empire can become a legacy.",
        "Finish a generation, earn prestige, and carry permanent advantages into a new run.",
      ) +
      `<div class="stats">${stat("Generation", d.generation, "Your current chapter", "Achievements")}${stat("Available prestige", d.prestige, "Spend on permanent dynasty advantages", "Research")}${stat("Prestige earned on succession", earned, "From growth, years, projects, and venture exits", "Markets")}${stat("Permanent advantages", d.upgrades.length + " / 6", "Persist across scenario restarts and generations", "Properties")}</div><section class="card"><h2>The next generation</h2><p class="explain">Succession becomes available after 60 completed months. It archives your current net worth and awards prestige, then starts a new founder scenario. Cash, businesses, investments, and ordinary technologies reset. Your dynasty upgrades and records persist. Export a save first if you want to keep playing the current empire.</p><br>${btn("Review succession", "l:succession", "", s.month < 60)}</section><div class="catalog" style="margin-top:22px">${DYNASTY_UPGRADES.map((u) => `<section class="card"><span class="tag">${d.upgrades.includes(u.id) ? "PERMANENT ADVANTAGE" : u.cost + " PRESTIGE"}</span><h2>${u.name}</h2><p>${u.desc}</p>${btn(d.upgrades.includes(u.id) ? "Unlocked" : "Unlock advantage", "l:dynastyupgrade:" + u.id, "light", d.upgrades.includes(u.id) || d.prestige < u.cost)}</section>`).join("")}</div><section class="card" style="margin-top:22px"><h2>The family archive</h2>${d.records.map((r) => `<div class="balance-line"><span>Generation ${r.generation} · ${r.months} months · ${r.projects} landmarks</span><b>${money(r.worth)} · +${r.prestige} prestige</b></div>`).join("") || '<p class="explain">Your first generation is still being written.</p>'}</section>`
    );
  }
  if (page === "Scenarios")
    return (
      heading(
        "A different beginning changes everything.",
        "Six starting conditions, reproducible seeds, and a late-game laboratory.",
      ) +
      `<section class="card" style="margin-bottom:22px"><div class="split"><div><h2>Start a new world</h2><p class="explain">Starting a scenario replaces the current game. Dynasty upgrades persist. Export your current save in Settings if you want to keep it.</p></div><span class="tag">CURRENT: ${SCENARIOS.find((x) => x.id === l.scenario)?.name || "Founder"}</span></div><label class="field">World seed (1–2,147,483,646)<input id="scenarioSeed" type="number" min="1" max="2147483646" value="${s.seed}"></label><p class="explain">A fixed starting seed produces the same random sequence when you take the same actions. The displayed seed is the current generator state; record your starting seed to replay a run.</p></section><div class="catalog">${SCENARIOS.map((c) => `<section class="card"><span class="tag">${c.id === "tycoon" ? "ADVANCED SANDBOX" : "STARTING SCENARIO"}</span><h2>${c.name}</h2><p>${c.desc}</p><div class="balance-line"><span>Starting cash</span><b>${money(c.cash)}</b></div><div class="balance-line"><span>Starting debt</span><b>${money(c.debt)}</b></div>${c.id === "tycoon" ? "<p>All corporate technologies researched. Calendar begins after 24 months. No businesses are preselected; build your own late-game strategy.</p>" : ""}${btn("Choose scenario", "l:scenario:" + c.id, "light")}</section>`).join("")}</div>`
    );
  return "";
}
export function createScenario(id, seed, dynasty) {
  let def = SCENARIOS.find((x) => x.id === id);
  if (!def || !Number.isInteger(seed) || seed < 1 || seed > 2147483646)
    return null;
  let next = fresh();
  next.seed = seed;
  next.cash = def.cash;
  next.debt = def.debt;
  ensureLate(next);
  next.late.scenario = id;
  if (dynasty) next.late.dynasty = JSON.parse(JSON.stringify(dynasty));
  let d = next.late.dynasty;
  if (d.upgrades.includes("capital")) next.cash += 50000;
  if (d.upgrades.includes("knowledge"))
    next.empire.researched = ["analytics", "routing"];
  if (d.upgrades.includes("legacy"))
    next.tech = { ops: 1, brand: 1, automation: 1 };
  if (id === "tycoon") {
    next.empire.researched = RESEARCH.map((r) => r.id);
    next.month = 24;
    next.empire.corporate.rounds = 1;
  }
  next.startCapital = next.cash - next.debt;
  next.news = [
    {
      title: def.name,
      text: def.desc + " Starting cash: $" + next.cash.toLocaleString() + ".",
      month: next.month,
    },
  ];
  next.history = [
    { month: next.month, worth: worth(next), cash: next.cash, profit: 0 },
  ];
  return next;
}
export function endgameAction(parts, s, h) {
  let l = ensureLate(s),
    { money, esc, btn, modal, close, changed, toast, replace } = h;
  let [, a, id] = parts;
  let v = (id) => document.getElementById(id)?.value,
    n = (id) => Number(v(id));
  let finish = (t) => {
    close();
    changed(t);
  };
  const confirm = (action) =>
    `<div class="actions">${btn("Cancel", "close", "light")}${btn("Confirm", action)}</div>`;
  switch (a) {
    case "region":
      if (openRegion(s, id))
        changed(
          "Regional license granted. Relocation and acquisitions are now available.",
        );
      else toast("Region unavailable or insufficient funds.");
      break;
    case "treaty":
      if (tradeTreaty(s, id)) changed("Trade agreement signed for 24 months.");
      else toast("Check access, cash, and existing agreements.");
      break;
    case "megastart":
      if (startMega(s, id))
        changed("Design phase funded. Construction has begun.");
      else
        toast(
          "Meet industry, technology, cash, and project-slot requirements.",
        );
      break;
    case "megafund":
      if (fundMega(s, id))
        changed("Next construction stage funded and materials allocated.");
      else toast("Cash or industrial warehouse stock is insufficient.");
      break;
    case "venture": {
      let o = l.ventureOffers.find((x) => x.id === id);
      modal(
        `<h2>Invest in ${esc(o.name)}</h2><p>Pre-money valuation ${money(o.valuation)}. Minimum $10,000; maximum ${money(o.valuation * 0.5)}. Your stake is investment / post-money valuation. This startup can fail and lose your entire investment.</p><label class="field">Investment amount<input id="ventureAmount" type="number" min="10000" max="${o.valuation * 0.5}" step="1000" value="10000"></label>${confirm("l:ventureconfirm:" + id)}`,
      );
      break;
    }
    case "ventureconfirm":
      if (investVenture(s, id, n("ventureAmount")))
        finish(
          "Private investment completed. Monitor runway and funding rounds.",
        );
      else toast("Amount is outside the investment limits or available cash.");
      break;
    case "follow":
      if (followVenture(s, id))
        changed("Follow-on invested. Runway and ownership have increased.");
      else toast("Venture is inactive or cash is insufficient.");
      break;
    case "ventureexit": {
      let o = l.ventures.find((x) => x.id === id);
      modal(
        `<h2>Sell this private stake?</h2><p>Receive ${money(o.valuation * o.stake * 0.8)} after a 20% liquidity discount. You give up all future exposure to this company.</p>${confirm("l:ventureexitconfirm:" + id)}`,
      );
      break;
    }
    case "ventureexitconfirm":
      if (sellVenture(s, id)) finish("Private stake sold.");
      break;
    case "bankcharter":
      if (charterBank(s))
        changed("Bank established with $500,000 of segregated capital.");
      else toast("Meet the charter requirements first.");
      break;
    case "bankpolicy":
      if (
        setBankPolicy(s, {
          depositRate: n("bankDeposit") / 100,
          loanRate: n("bankLoan") / 100,
          reserve: n("bankReserve") / 100,
          underwriting: v("bankRisk"),
        })
      )
        changed("Bank policy saved.");
      else toast("Rates and reserve ratios are outside the allowed ranges.");
      break;
    case "bankinject":
      if (capitalizeBank(s, n("bankTransfer")))
        changed("Capital transferred into the bank.");
      else toast("Enter a positive amount within group cash.");
      break;
    case "bankwithdraw":
      if (withdrawBank(s, n("bankTransfer")))
        changed("Excess capital transferred to group cash.");
      else
        toast(
          "This withdrawal would breach the bank’s equity or liquidity requirements.",
        );
      break;
    case "hqupgrade":
      if (upgradeHQ(s))
        changed("Headquarters expanded. Management capacity increased.");
      else toast("Maximum level reached or insufficient funds.");
      break;
    case "hqpolicy": {
      let policy = v("hqPolicy"),
        budget = n("hqBudget");
      if (
        !["balanced", "decentralized", "people"].includes(policy) ||
        !Number.isFinite(budget) ||
        budget < 0 ||
        budget > 100000
      )
        return toast("Enter a valid group policy and budget.");
      Object.assign(l.headquarters, { policy, budget });
      changed("Group management policy saved.");
      break;
    }
    case "dynastyupgrade":
      if (dynastyUpgrade(s, id))
        changed("Permanent dynasty advantage unlocked.");
      else toast("Not enough prestige or advantage already unlocked.");
      break;
    case "succession":
      modal(
        `<h2>Begin the next generation?</h2><p>This archives the current empire and resets operating assets. You earn ${prestigeEarned(s, worth(s))} prestige. Dynasty upgrades and previous records persist. Export your save if you want to preserve this world as playable.</p>${confirm("l:successionconfirm")}`,
      );
      break;
    case "successionconfirm": {
      if (s.month < 60) return;
      let d = JSON.parse(JSON.stringify(l.dynasty)),
        earned = prestigeEarned(s, worth(s));
      d.records.unshift({
        generation: d.generation,
        months: s.month,
        worth: worth(s),
        projects: l.projects.filter((p) => p.status === "complete").length,
        prestige: earned,
      });
      d.prestige += earned;
      d.totalPrestige += earned;
      d.generation++;
      close();
      replace(createScenario("founder", s.seed, d));
      break;
    }
    case "scenario": {
      let seed = n("scenarioSeed");
      if (!Number.isInteger(seed) || seed < 1 || seed > 2147483646)
        return toast("Enter a valid whole-number seed.");
      let c = SCENARIOS.find((x) => x.id === id);
      modal(
        `<h2>Start ${c.name}?</h2><p>This replaces your current game with ${money(c.cash)} cash and ${money(c.debt)} debt. Dynasty records and upgrades persist. Your current operating assets do not.</p>${confirm("l:scenarioconfirm:" + id + ":" + seed)}`,
      );
      break;
    }
    case "scenarioconfirm": {
      let next = createScenario(id, Number(parts[3]), l.dynasty);
      if (next) {
        close();
        replace(next);
      }
      break;
    }
  }
}
