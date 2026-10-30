import { deals, INTEGRATION_PLANS, settleSellerNote } from "./acquisitions.js?v=4ae5ac115653";
export function integrationContent(s, { money, esc, btn }) {
  const d = deals(s);
  return `<section class="card industry-card"><h2>Acquisition integration desk</h2><p>Buying a company starts a transition. Integration consumes cash and temporarily disrupts demand and workforce capacity. Unfunded or paused months make no progress and reduce morale by 2 points. Seller notes must be repaid even if the acquisition struggles.</p><div class="catalog">${
    s.businesses
      .filter((b) => b.integration)
      .map((b) => {
        const x = b.integration,
          p = INTEGRATION_PLANS[x.plan];
        return `<section class="product-row"><span class="tag">${x.status.toUpperCase()}</span><h3>${esc(b.name)}</h3><p>${p.name} · ${x.remaining} funded months remaining<br>Spent ${money(x.funded)} · Monthly integration budget ${money(x.price * p.cost)}<br>${x.stalled} months without progress</p><p>${p.desc}</p>${["active", "paused"].includes(x.status) ? `<div class="actions">${btn(x.status === "paused" ? "Resume integration" : "Pause integration", "deal:pause:" + b.id, "light")}${btn("Abandon integration", "deal:abandon:" + b.id, "light")}</div><p class="explain">Abandoning ends disruption but forfeits all future integration benefits and costs 8 reputation. Past spending is not refunded. Existing financing remains payable.</p>` : ""}</section>`;
      })
      .join("") || "<p>No acquired companies undergoing integration.</p>"
  }</div><h3>Seller financing</h3>${d.notes.map((n) => `<div class="product-row"><h3>${esc(s.businesses.find((b) => b.id === n.businessId)?.name || "Acquisition")}</h3><p>${money(n.balance)} principal remaining · 10% fixed annual interest<br>Next payment: ${money(Math.min(n.balance, n.payment) + (n.balance * n.rate) / 12)} · Approximately ${Math.ceil(n.balance / n.payment)} months left</p>${btn("Repay seller note", "deal:repay:" + n.id, "light", s.cash < n.balance)}</div>`).join("") || "<p>No seller notes outstanding.</p>"}<p class="explain">Acquisition notes are group liabilities separate from bank debt. Twelve equal principal installments plus interest start next month. Monthly cash shortfalls can trigger the game’s emergency credit. Companies cannot be sold while integration or seller financing remains outstanding.</p></section>`;
}
export function integrationAction(parts, s, h) {
  const [, action, id] = parts,
    b = s.businesses.find((b) => b.id === Number(id));
  if (action === "repay") {
    if (settleSellerNote(s, Number(id))) h.changed("Seller financing repaid.");
    else h.toast("Not enough cash to repay this note.");
    return;
  }
  const x = b?.integration;
  if (!x || !["active", "paused"].includes(x.status)) return;
  if (action === "pause") {
    x.status = x.status === "paused" ? "active" : "paused";
    h.changed("Integration plan updated.");
  }
  if (action === "abandon")
    h.modal(
      `<h2>Abandon integration?</h2><p>Past spending is lost, future integration benefits are forfeited, and reputation falls by 8. Seller financing remains payable.</p><div class="actions">${h.btn("Keep integrating", "close", "light")}${h.btn("Abandon plan", "deal:confirm:" + id, "danger")}</div>`,
    );
  if (action === "confirm") {
    x.status = "abandoned";
    b.reputation = Math.max(30, b.reputation - 8);
    h.close();
    h.changed("Integration abandoned. Financing remains outstanding.");
  }
}
