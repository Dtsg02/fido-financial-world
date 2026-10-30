import {
  model,
  sectorState,
  sectorEffects,
  MODELS,
  PRODUCT_TIERS,
  SEGMENTS,
  launchProduct,
  refreshProduct,
  retireProduct,
  upgradeSector,
} from "./sectors.js?v=6e353cd01f78";
import { TYPES, forecast } from "./engine.js?v=6e353cd01f78";
export function industryContent(s, h) {
  const { heading, btn, money, esc, stat } = h;
  return (
    heading(
      "A different business in every industry.",
      "Design the operating model, build a portfolio, and earn customers who come back.",
    ) +
    `<div class="stats">${stat("Operating models", "8", "Across 24 industries", "Industries")}${stat(
      "Live products",
      s.businesses.reduce(
        (n, b) =>
          n +
          sectorState(b).development.filter((p) => p.status === "active")
            .length,
        0,
      ),
      "Products mature and lose novelty",
      "Innovation",
    )}${stat(
      "In development",
      s.businesses.reduce(
        (n, b) =>
          n +
          sectorState(b).development.filter((p) => p.status === "development")
            .length,
        0,
      ),
      "Two concurrent launches per company",
      "Research",
    )}${stat("Subscribers", s.businesses.reduce((n, b) => n + sectorState(b).customers, 0).toLocaleString(), "Served recurring customers", "Talent")}</div>` +
    (s.businesses.length
      ? s.businesses
          .map((b) => {
            const q = sectorState(b),
              m = model(b),
              t = TYPES.find((t) => t.id === b.type),
              f = forecast(s, b),
              e = sectorEffects(s, b);
            return `<section class="card industry-card"><div class="split"><div><span class="tag">${esc(m.name)}</span><h2>${esc(b.name)}</h2></div><span class="tag">${esc(t.name)} · LV ${b.level}</span></div><p>${m.desc}</p><div class="industry-layout"><div><div class="balance-line"><span>${m === MODELS.subscription ? "Service health" : m.metric}</span><b>${q.score.toFixed(0)} / 100</b></div><div class="progress"><span style="width:${q.score}%"></span></div>${m === MODELS.subscription ? `<div class="balance-line"><span>Subscribers · next renewal churn</span><b>${q.customers} · ${(q.churn * 100).toFixed(1)}%</b></div>` : ""}<div class="balance-line"><span>Forecast demand / capacity</span><b>${f.demand} / ${f.capacity}</b></div><div class="balance-line"><span>Portfolio realized unit price</span><b>${money(f.salePrice)}</b></div><div class="balance-line"><span>Rival demand multiplier</span><b>${q.pricePressure.toFixed(2)}×</b></div><div class="balance-line"><span>Product support & sector overhead</span><b>${money(e.overhead)} / month</b></div><p class="explain">${esc(q.incident)} ${q.spoiled ? `${q.spoiled} perishable units spoiled.` : ""} ${m === MODELS.agriculture ? `Next month: ${(s.month + 1) % 3 === 0 ? "harvest (2.2× capacity)" : "growing season (0.55× capacity)"}.` : ""}</p><h3>Operating policy</h3><div class="actions">${m.policies.map((p, i) => btn((q.policy === i ? "✓ " : "") + p, `sector:policy:${b.id}:${i}`, q.policy === i ? "" : "light", q.policy === i)).join("")}</div><h3>Specialist capabilities</h3>${Object.entries(
              q.upgrades,
            )
              .map(([key, level]) => {
                let cost = t.cost * 0.18 * (level + 1) ** 1.65;
                return `<div class="balance-line"><span>${{ process: "Process engineering · +4.5% capacity/level", service: "Customer success · improves health & retention", resilience: "Resilience · fewer outages & less spoilage" }[key]}<br><small>Level ${level} / 5</small></span>${btn(level === 5 ? "Fully developed" : money(cost), `sector:upgrade:${b.id}:${key}`, "light", level === 5 || s.cash < cost)}</div>`;
              })
              .join(
                "",
              )}</div><div><div class="split"><h3>Product portfolio · ${q.development.length} / 8</h3>${btn("Develop product", `sector:new:${b.id}`, "", q.development.length >= 8 || q.development.filter((p) => p.status === "development").length >= 2)}</div>${q.development.length ? q.development.map((p) => `<div class="product-row"><div class="split"><h3>${esc(p.name)}</h3><span class="tag">${p.status === "development" ? p.remaining + " MONTHS TO LAUNCH" : p.age < 12 ? "GROWTH" : p.appeal > 0.5 ? "MATURE" : "DECLINING"}</span></div><p>${PRODUCT_TIERS[p.tier].name} · ${SEGMENTS[p.segment]}<br>${p.status === "active" ? `Appeal ${(p.appeal * 100).toFixed(0)}% · ${p.age} months on market` : "Development is paid up front; launches automatically."}</p><div class="actions">${btn("Refresh · " + money(p.invested * 0.35), `sector:refresh:${b.id}:${p.id}`, "light", p.status !== "active" || p.age < 6 || s.cash < p.invested * 0.35)}${btn("Retire", `sector:retire:${b.id}:${p.id}`, "light")}</div></div>`).join("") : '<div class="product-row"><h3>Your next growth engine</h3><p>Create everyday, signature, or flagship products for three customer segments. Products aimed at the same segment compete for attention.</p></div>'}<p class="explain">Active products add demand and pricing power, with monthly support costs. Novelty begins fading after 12 months, down to 18% appeal. Refresh after month 6 for 35% of original development cost. Retirement cancels costs and benefits with no refund. Flagships require business level 3. Products do not change agreed B2B contract prices.</p></div></div></section>`;
          })
          .join("")
      : '<section class="card"><h2>Build your first business</h2><p>Open Businesses to found a company. Its industry desk will appear here automatically.</p></section>')
  );
}
export function industryAction(parts, s, h) {
  const [, action, id, value] = parts,
    b = s.businesses.find((b) => String(b.id) === id);
  if (!b) return;
  const { btn, money, modal, close, changed, toast } = h,
    q = sectorState(b),
    t = TYPES.find((t) => t.id === b.type);
  if (action === "policy") {
    let n = Number(value);
    if (Number.isInteger(n) && n >= 0 && n <= 2) {
      q.policy = n;
      changed("Operating policy updated.");
    }
    return;
  }
  if (action === "upgrade") {
    if (upgradeSector(s, b, value)) changed("Specialist capability upgraded.");
    else toast("Upgrade unavailable.");
    return;
  }
  if (action === "refresh") {
    if (refreshProduct(s, b, Number(value))) changed("Product refreshed.");
    else toast("Refresh unavailable.");
    return;
  }
  if (action === "retire") {
    retireProduct(b, Number(value));
    changed("Product retired.");
    return;
  }
  if (action === "new") {
    modal(
      `<h2>Develop a new product</h2><p>Two concurrent development projects; eight products per company.</p><label class="field">Product name<input id="product-name" maxlength="60" placeholder="Name your next big idea"></label><label class="field">Positioning<select id="product-tier">${PRODUCT_TIERS.map((p, i) => `<option value="${i}" ${i === 2 && b.level < 3 ? "disabled" : ""}>${p.name} · ${money(t.cost * p.cost * (1 + q.development.length * 0.1))} · ${p.months} months${i === 2 && b.level < 3 ? " · requires level 3" : ""}</option>`).join("")}</select></label><label class="field">Target audience<select id="product-segment">${SEGMENTS.map((n, i) => `<option value="${i}">${n}</option>`).join("")}</select></label><p class="explain">Everyday: +13% demand, +1.5% pricing power. Signature: +19%, +4.5%. Flagship: +24%, +9%. These bonuses decline with age and overlap. Monthly support costs are 0.1%, 0.2%, or 0.4% of the base founding cost.</p><div class="actions">${btn("Fund development", `sector:fund:${b.id}`)}${btn("Cancel", "close", "light")}</div>`,
    );
    return;
  }
  if (action === "fund") {
    const name = document.querySelector("#product-name").value,
      tier = Number(document.querySelector("#product-tier").value),
      segment = Number(document.querySelector("#product-segment").value);
    if (launchProduct(s, b, name, tier, segment)) {
      close();
      changed("Product development funded.");
    } else toast("Insufficient cash or development slots.");
  }
}
