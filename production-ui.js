import {
  BATCH_METHODS,
  production,
  quoteBatch,
  orderBatch,
  workInProgress,
  setProductionAllocation,
  cancelBatch,
  expediteBatch,
} from "./production.js?v=8218e214890d";
import { COMMODITIES } from "./world.js?v=8218e214890d";
export function productionContent(s, h) {
  const { heading, money, esc, btn, stat } = h,
    companies = s.businesses.filter(
      (b) => b.recipe?.installed || b.production?.jobs.length,
    );
  return (
    heading(
      "Build a production pipeline.",
      "Reserve components, allocate real capacity, and finance goods before they can be sold.",
    ) +
    `<div class="stats">${stat("Work in progress", money(workInProgress(s)), "Recorded input and conversion costs", "Accounts")}${stat(
      "Open batches",
      companies.reduce((n, b) => n + production(b).jobs.length, 0),
      "Up to five batches per company",
      "Supply",
    )}${stat(
      "Units awaiting completion",
      companies.reduce(
        (n, b) => n + production(b).jobs.reduce((v, j) => v + j.output, 0),
        0,
      ),
      "Expected output after normal yield losses",
      "Businesses",
    )}${stat(
      "Completed last month",
      companies.reduce((n, b) => n + production(b).lastCompleted, 0),
      "Transferred into usable business inventory",
      "Commerce",
    )}</div><section class="card"><h2>Time is working capital</h2><p>Batches reserve their full physical inputs immediately. Conversion fees are paid upfront and carried into work-in-progress value. Standard batches use 75% of normal recipe material lots, take at least two months and yield 98% of started units. Lean batches use 65%, take at least three months and yield 96%; conversion fees are 8% and 4% of replacement material value respectively.</p><p>Allocated capacity works through the queue in order before contracts, routes and retail sales use the remaining capacity. A batch must finish both its work and its minimum lead time. Finished stock can sell only within remaining operating capacity. Wage bills continue during delays. Automatic purchasing remains separate: switch it off in the business screen if you want to rely entirely on batches.</p></section><div class="catalog" style="margin-top:22px">${
      companies
        .map((b) => {
          const p = production(b);
          return `<section class="card"><h2>${esc(b.name)}</h2><p>Last month: ${p.lastWork} capacity units worked · ${p.lastCompleted} finished units received.</p><label class="field">Capacity reserved for batch work<select id="allocation-${b.id}">${[0, 0.25, 0.5, 0.75, 1].map((n) => `<option value="${n}" ${n === p.allocation ? "selected" : ""}>${n * 100}%${n === 0 ? " · pause production" : ""}</option>`).join("")}</select></label>${btn("Save capacity allocation", "production:allocation:" + b.id, "light")}<label class="field">Units to start<input id="batch-units-${b.id}" type="number" min="2" max="1000000" step="1" value="100"></label><label class="field">Batch process<select id="batch-method-${b.id}">${Object.entries(
            BATCH_METHODS,
          )
            .map(
              ([id, m]) =>
                `<option value="${id}">${m.name} · ${m.months} months minimum</option>`,
            )
            .join(
              "",
            )}</select></label>${btn("Review production order", "production:quote:" + b.id, "", p.jobs.length >= 5)}<h3 style="margin-top:24px">Production queue</h3>${p.jobs.map((j) => `<div class="product-row"><span class="tag">${j.remainingWork === 0 ? "AWAITING LEAD TIME" : "IN PROCESS"}</span><h3>Batch ${j.id} · ${BATCH_METHODS[j.method].name}</h3><p>${j.units} units started → ${j.output} expected output<br>${j.remainingWork} capacity units still required<br>Earliest completion: month ${j.due + 1}<br>Carrying value: ${money(j.cost)}</p><div class="actions">${btn("Expedite one month · " + money(j.cost * 0.1), "production:expedite:" + b.id + ":" + j.id, "light", j.expedited || j.due <= s.month + 1 || s.cash < j.cost * 0.1)}${btn("Cancel batch", "production:cancel:" + b.id + ":" + j.id, "light")}</div></div>`).join("") || "<p>No batches in progress.</p>"}<p class="explain">Expediting reduces minimum lead time once, but cannot replace missing work capacity. Cancellation liquidates reserved inputs for 50% of carrying value; the rest is lost. A company cannot be sold while batches remain open.</p></section>`;
        })
        .join("") ||
      '<section class="card"><h2>Install your first production recipe.</h2><p>Supply offers multi-input recipes for 13 industries. Once installation finishes, the business appears here.</p></section>'
    }</div>`
  );
}
export function productionAction(parts, s, h) {
  const [, action, businessId, jobId] = parts,
    b = s.businesses.find((b) => b.id === Number(businessId));
  if (!b) return;
  const { money, esc, btn, modal, close, changed, toast } = h;
  if (action === "allocation") {
    if (
      setProductionAllocation(
        b,
        Number(document.getElementById("allocation-" + b.id).value),
      )
    )
      changed("Batch capacity allocation updated.");
    return;
  }
  if (action === "quote") {
    const units = Number(document.getElementById("batch-units-" + b.id).value),
      method = document.getElementById("batch-method-" + b.id).value,
      q = quoteBatch(s, b, units, method);
    if (!q)
      return toast(
        "Use a whole batch size from 2 to 1,000,000 and an installed recipe.",
      );
    modal(
      `<h2>Start a batch at ${esc(b.name)}?</h2><p>${q.units} units started → ${q.output} expected output. Earliest completion: month ${q.due + 1}, provided enough capacity is allocated.</p>${q.lots.map((n, i) => (n ? `<div class="balance-line"><span>${COMMODITIES[i].name}</span><b>${n.toFixed(3)} lots</b></div>` : "")).join("")}<p>Conversion cash due now: ${money(q.conversion)}. All listed materials are reserved now.${q.output > q.storage ? " Warning: expected batch output exceeds current business storage (" + q.storage + " units). Expand storage before completion or overflow will be written off." : ""}${!q.available ? " Insufficient component stock: order materials in Supply." : ""}</p><div class="actions">${btn("Cancel", "close", "light")}${btn("Start batch", "production:start:" + b.id + ":" + units + ":" + method, "", !q.available || s.cash < q.conversion)}</div>`,
    );
    return;
  }
  if (action === "start") {
    if (orderBatch(s, b, Number(jobId), parts[4])) {
      close();
      changed("Batch started. Materials are now work in progress.");
    } else toast("Components, cash, or queue capacity are insufficient.");
    return;
  }
  if (action === "expedite") {
    if (expediteBatch(s, b, Number(jobId)))
      changed("Lead time shortened by one month; required work is unchanged.");
    else toast("This batch cannot be expedited.");
    return;
  }
  if (action === "cancel") {
    const j = production(b).jobs.find((j) => j.id === Number(jobId));
    if (j)
      modal(
        `<h2>Cancel batch ${j.id}?</h2><p>Recover ${money(j.cost * 0.5)} in cash and lose the other half of its carrying value. No finished goods will be delivered.</p><div class="actions">${btn("Keep producing", "close", "light")}${btn("Liquidate batch", "production:confirmcancel:" + b.id + ":" + j.id, "danger")}</div>`,
      );
    return;
  }
  if (action === "confirmcancel" && cancelBatch(s, b, Number(jobId))) {
    close();
    changed("Batch liquidated at 50% recovery.");
  }
}
