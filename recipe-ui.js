import {
  RECIPES,
  recipeState,
  recipePlan,
  recipeActive,
  configureRecipe,
} from "./recipes.js?v=8218e214890d";
import { TYPES } from "./catalog.js?v=8218e214890d";
import { COMMODITIES } from "./world.js?v=8218e214890d";
export function recipeContent(s, { money, esc, btn }) {
  return `<section class="card industry-card"><h2>Multi-input production lines</h2><p>Install a physical bill of materials for supported industries. Production consumes all required commodities together; the scarcest component limits output. Quantities are fixed by the recipe, quality and operations research rather than changing with commodity prices. At equal commodity prices the recipe uses 10% fewer material lots than its catalog baseline, but coordination costs $75 per business level each active month. Relative prices can make it more expensive.</p><div class="catalog">${
    s.businesses
      .filter((b) => RECIPES[b.type])
      .map((b) => {
        const r = recipeState(b),
          p = recipePlan(s, b),
          t = TYPES.find((t) => t.id === b.type);
        return `<section class="product-row"><span class="tag">${r.remaining ? "INSTALLING" : recipeActive(b) ? "RECIPE ACTIVE" : r.installed ? "INSTALLED / INACTIVE" : "NOT INSTALLED"}</span><h3>${esc(b.name)}</h3><p>${r.remaining ? r.remaining + " months until ready" : "Two-month installation; " + money(t.cost * 0.015) + " one-time setup."}</p>${p.lots.map((n, i) => (n ? `<div class="balance-line"><span>${COMMODITIES[i].name} / 100 units</span><b>${(n * 100).toFixed(3)} lots</b></div>` : "")).join("")}<p>Current warehouse supports <b>${p.capacity.toLocaleString()} whole units</b>, limited by ${COMMODITIES[p.bottleneck].name}.<br>Replacement materials: $${p.replacementCost.toFixed(2)} / unit.<br>Last month: ${r.lastProduced.toLocaleString()} recipe units at ${money(r.lastCost)} actual acquisition cost.</p>${btn(r.remaining ? "Installation underway" : r.installed ? (r.enabled ? "Use standard process" : "Enable recipe") : "Install production recipe", "recipe:configure:" + b.id, "light", !!r.remaining || (!r.installed && s.cash < t.cost * 0.015))}<p class="explain">Connect this business to Warehouse or Hybrid procurement above and leave automatic purchasing enabled. Hybrid buys generic inputs from direct suppliers when a recipe component runs out. Existing generic inventory is consumed before replenishment. Setup spending has no resale value; installation blocks sale until finished.</p></section>`;
      })
      .join("") ||
    "<p>Open a food, manufacturing, infrastructure or software business to configure a production line.</p>"
  }</div></section>`;
}
export function recipeAction(parts, s, h) {
  const b = s.businesses.find((b) => b.id === Number(parts[2]));
  if (!b) return;
  if (configureRecipe(s, b))
    h.changed(
      "Production configuration updated. Check commodity availability in Supply.",
    );
  else h.toast("Installation is already underway or funds are insufficient.");
}
