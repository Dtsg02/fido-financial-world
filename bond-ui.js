import {
  bondMarket,
  bondDebt,
  bondRating,
  quoteBond,
  issueBond,
  repayBond,
  restructureBond,
} from "./bonds.js?v=4ae5ac115653";
import { worth } from "./engine.js?v=4ae5ac115653";
export function bondContent(s, h) {
  const m = bondMarket(s),
    nw = worth(s),
    r = bondRating(s, nw),
    { heading, btn, money, stat, esc } = h;
  return (
    heading(
      "Borrow long. Plan the repayment.",
      "Corporate bonds bring scale, covenants, maturity risk, and outside creditors.",
    ) +
    `<div class="stats">${stat("Indicative rating", r.tier, "Driven by leverage and earnings coverage", "Achievements")}${stat("Bond liabilities", money(bondDebt(s)), "Includes capitalized unpaid coupons", "Banking")}${stat("Group leverage", (r.leverage * 100).toFixed(1) + "%", "Debt / modeled gross assets", "Treasury")}${stat("Additional issuance limit", money(r.limit), "Eligibility and distress rules also apply", "Ownership")}</div><section class="card industry-card"><h2>Raise long-term capital</h2><p>Available after month 24, one equity round, and $250,000 net worth. Maximum eight outstanding issues. Maturity choices: 24, 60, or 120 months. Underwriting costs 2%; coupons are monthly; principal is due in one payment at maturity.</p><div class="industry-layout"><div><label class="field">Face value<input id="bond-amount" type="number" min="50000" step="10000" value="100000"></label><label class="field">Maturity<select id="bond-term"><option value="24">24 months</option><option value="60">60 months</option><option value="120">120 months</option></select></label>${btn("Review bond terms", "bond:quote", "", s.month < 24 || !s.empire.corporate.rounds || nw < 250000 || m.cooldown > s.month || m.bonds.some((b) => b.status === "distressed"))}</div><div><h3>Lender covenants</h3><p>Maintain cash equal to 2% of each issue’s original principal and group leverage at or below 70%. Three consecutive breaches increase that issue’s annual coupon by 3 percentage points permanently.</p><p>Two consecutive missed coupons, or unpaid principal at maturity, puts an issue in distress. New bond issuance stops until distressed issues are resolved. Unpaid coupons become debt, not free financing.</p>${m.cooldown > s.month ? `<span class="tag">ISSUANCE FROZEN FOR ${m.cooldown - s.month} MONTHS</span>` : ""}</div></div></section>${m.bonds.map((b) => `<section class="card industry-card"><div class="split"><h2>Bond ${b.id} · ${(b.coupon * 100).toFixed(2)}%</h2><span class="tag">${b.status.toUpperCase()}</span></div><div class="industry-layout"><div><div class="balance-line"><span>Outstanding balance</span><b>${money(b.balance)}</b></div><div class="balance-line"><span>Next monthly coupon</span><b>${money((b.balance * b.coupon) / 12)}</b></div><div class="balance-line"><span>Principal due</span><b>Month ${b.maturity + 1} · ${Math.max(0, b.maturity - s.month)} months away</b></div><div class="balance-line"><span>Cash covenant</span><b>${money(b.reserve)}</b></div></div><div><p>${b.breaches} consecutive covenant breaches · ${b.missed} consecutive missed coupons<br>${b.stepped ? "Penalty coupon step-up is active." : "No coupon step-up."}</p><div class="actions">${btn("Redeem · " + money(b.balance * (s.month < b.maturity ? 1.01 : 1)), "bond:redeem:" + b.id, "light", s.cash < b.balance * (s.month < b.maturity ? 1.01 : 1))}${b.status === "distressed" ? btn("Review restructuring", "bond:restructure:" + b.id, "", s.cash < b.balance * 0.2) : ""}</div><p class="explain">Early redemption costs 1%. Distress restructuring requires 20% cash; the other 80% becomes outside equity, diluting your ownership. It freezes new bond issuance for 24 months and reduces every business’s reputation by 15.</p></div></div></section>`).join("")}<section class="card"><h2>Bondholder activity</h2>${m.reports.map((r) => `<div class="product-row"><small>Month ${r.month + 1}</small><p>${esc(r.text)}</p></div>`).join("") || "<p>No corporate bonds issued yet.</p>"}</section>`
  );
}
export function bondAction(parts, s, h) {
  const [, action, id] = parts,
    { modal, btn, money, close, changed, toast } = h,
    nw = worth(s),
    m = bondMarket(s);
  if (action === "quote") {
    const amount = Number(document.querySelector("#bond-amount").value),
      term = Number(document.querySelector("#bond-term").value),
      q = quoteBond(s, nw, amount, term);
    if (!q)
      return toast("Issue is outside current eligibility or credit limits.");
    modal(
      `<h2>Review bond issue</h2><p>Face value ${money(amount)} · ${term} months<br>Fixed annual coupon ${(q.coupon * 100).toFixed(2)}%<br>Monthly interest ${money((amount * q.coupon) / 12)}<br>Net cash raised ${money(amount - q.fee)}<br>Cash covenant ${money(q.reserve)}<br>Principal repayment ${money(amount)} at maturity.</p><p>Three consecutive covenant breaches add 3 percentage points to the coupon. Distress can require asset sales or ownership dilution.</p><div class="actions">${btn("Issue bonds", `bond:issue:${amount}:${term}`)}${btn("Cancel", "close", "light")}</div>`,
    );
    return;
  }
  if (action === "issue") {
    if (issueBond(s, nw, Number(id), Number(parts[3]))) {
      close();
      changed("Bonds issued; net proceeds received.");
    } else toast("Credit terms changed or issue unavailable.");
    return;
  }
  if (action === "redeem") {
    if (repayBond(s, Number(id))) changed("Bond redeemed.");
    return;
  }
  if (action === "restructure") {
    const b = m.bonds.find((b) => b.id === Number(id));
    if (!b) return;
    const shares =
        s.empire.corporate.founderShares + s.empire.corporate.publicShares,
      issued = Math.ceil(
        (b.balance * 0.8) / (Math.max(25000, nw + b.balance) / shares),
      );
    modal(
      `<h2>Debt-for-equity restructuring</h2><p>Pay ${money(b.balance * 0.2)} now and issue ${issued.toLocaleString()} new outside shares.<br>Your ownership will fall to ${((100 * s.empire.corporate.founderShares) / (shares + issued)).toFixed(2)}%.<br>Bond issuance freezes for 24 months and every business loses 15 reputation.</p><div class="actions">${btn("Accept restructuring", "bond:swap:" + id)}${btn("Cancel", "close", "light")}</div>`,
    );
    return;
  }
  if (action === "swap") {
    if (restructureBond(s, Number(id), nw)) {
      close();
      changed("Debt exchanged for cash and outside equity.");
    } else toast("Restructuring unavailable.");
  }
}
