# FiDo — Financial World Domination

A free, single-player financial sandbox for the browser. Start with a small business, build a diversified holding company, and progress into international finance, infrastructure, and a multi-generation dynasty.

## Play

Play at **https://dtsg02.github.io/fido-financial-world/**. The public static release is published using GitHub Pages. No login, subscription, real-money transactions, paid API, or backend is required. Everything runs in the browser.

The game automatically saves locally after each action. Each browser/device has its own save. Use **Settings & saves → Export save / Import save** to move progress. Do not clear browser data without a backup.

## Run locally

For the public release repository (static files at its root), run `python3 -m http.server 4173` and open http://localhost:4173. The following commands apply to the full source workspace.

```sh
npm start
```

Open http://localhost:4173. The local server requires Python 3. There are no runtime package dependencies. Use `npm test` with Node.js to run the full test suite.

## Game systems

### Build and operate

- **24 industries:** cafés, creative services, e-commerce, software, manufacturing, solar, bakeries, restaurants, farming, logistics, hotels, clinics, education, publishing, construction, semiconductors, data centers, recycling, biotech, consulting, telecom, games, cybersecurity, and water utilities.
- **Eight operating models:** subscriptions and churn, hospitality service quality, industrial yield and wear, crop cycles and soil fertility, client trust, accreditation, infrastructure reliability, and retail loyalty. Each has three operating policies and three five-level specialist capabilities.
- **Product portfolios:** up to eight products per company, two concurrent development projects, three investment tiers, three audience segments, timed launches, support costs, cannibalization, aging, refreshes, and retirement. Rival pricing responds to undercutting and profitable expansion.
- Pricing elasticity, industry seasonality, macroeconomic exposure, staffing, wages, product quality, marketing, reputation, loyalty, customer segments, and compliance.
- Employee morale, skill development, resignations, hiring/severance costs, and six specialist executive roles.
- Direct suppliers or a shared raw-material warehouse; spot and guaranteed supply policies, shipping delays, freight, storage, spoilage, and cross-industry cost savings.
- Equipment breakdowns, maintenance, insurance, deductibles, continuity programs, and regulatory audits.
- Business-level product/process projects, three basic research tracks, and twelve corporate technologies with prerequisites.
- B2B contracts, qualification requirements, deposits, capacity priority, deadlines, penalties, invoicing, and deferred payments.

### Commercial operations and facilities

- Four supply houses with different fixed prices, reliability, collateral requirements, and credit terms. Agreements run 6/12/24 months with monthly standing orders, credit limits, delivery suspensions, arrears fees, expiry, and early termination.
- Internal production routes connect complementary businesses. B2B contracts take capacity first, then internal shipments, then retail sales. Routes consume inventory, charge freight, and arrive next month.
- Customer underwriting sets the price and payment risk of new B2B contracts. Late invoices enter collection; third missed attempts default with partial recovery. Factoring exchanges future collections for immediate cash at a fee.
- Six-month commitment calendars separate existing supplier liabilities from future orders and construction installments.
- Facility equipment, utilities, workforce, and storage create distinct bottlenecks. Four ten-level upgrade tracks have construction periods, staged funding, funding pauses, and salvage values. Shift patterns trade output against payroll, morale, and wear.
- Fifteen contextual quarterly situations provide 45 choices, with temporary effects and delayed outcomes. Pending decisions are preserved until resolved; recent situations are excluded from the next selection.

### Expand

- Thirteen cities across five fictional economic regions, regional licenses, import tariffs, trade agreements, political stability, growth, and exchange-rate exposure.
- Named competitors in each industry, evolving valuations, acquisitions, local demand competition, and new market entrants.
- Franchise brands, group headquarters, organizational complexity penalties, and corporate management policies.
- Properties with condition, tenant strategies, vacancy, upkeep, maintenance reserves, and multi-month development.

### Finance

- Five fictional market assets, dividends, limit orders, collateralized short positions, margin checks, and bought cash-settled calls/puts.
- Four foreign currencies, conversion fees, and reserve holdings.
- Corporate bonds with 24/60/120-month bullet maturities, credit ratings, issuance limits, cash and leverage covenants, coupon step-ups, capitalized missed interest, distress, early redemption, and debt-for-equity restructuring.
- Revolving credit, fixed-rate amortizing term loans, credit scores, and automatic emergency credit.
- Equity rounds, share issuance, founder dilution, IPO eligibility, dividends, and buybacks.
- Independent startup investments, follow-on funding, runway, dilution, failures, secondary sales, and possible exits.
- A separately capitalized bank with deposits, lending, interest spreads, liquidity reserves, credit defaults, confidence, capital adequacy, and freezes.

### Late game and variation

- Twelve megaprojects from a logistics hub to a century endowment, priced from $1.5 million to $100 million. Four separately funded stages, warehouse materials, research/industry prerequisites, construction pauses, recurring income, and permanent bonuses.
- Six scenarios, including a $25 million late-game laboratory with completed corporate research.
- Seeded randomness, eleven economic shock regimes, government policy changes, sector cycles, and variable market conditions.
- Seventeen milestone challenges, achievements, succession after five years, prestige, and six permanent dynasty advantages.
- Business what-if calculations, driver diagnostics, thirty-run twelve-month stress tests, cash-reserve automation, and quarterly advancement that pauses for decisions.

## Scope and accounting rules

This is a fictional single-player simulation, not a model of real financial markets or a professional accounting system. No multiplayer, server-side save synchronization, real-time prices, or paid AI is used.

- Months advance only when requested. A pending quarterly decision stops automatic quarterly advancement.
- Group cash and consolidated net worth are distinct from founder distributions. Issuing shares dilutes founder ownership, but group net worth continues to show the full consolidated group.
- Net worth uses business resale values, inventory at base material cost, active refundable contract deposits, invoices, property resale values, warehouse market values, shipments at material cost, currency reserves, short equity, option intrinsic value, franchise carrying value, discounted venture stakes, bank equity, and infrastructure/HQ carrying values, minus debt.
- Option premium is expensed from cash when purchased; headline net worth excludes option time value. Options are held to expiry. Limit orders execute at monthly closing prices only. Short losses may exceed opening collateral after a price gap.
- Procurement cash is paid before sales. Contract invoices can create taxable profit before the cash arrives. Taxes start at 20% of positive modeled taxable income and change with policy; there are no loss carryforwards or comprehensive capital-gains taxes.
- Bank customer deposits are liabilities on the bank’s segregated balance sheet, not spendable group capital. Bank earnings enter the group result; transferring equity between bank and group does not create wealth.
- Supply collateral, internal shipments, facility salvage, supplier payables, and corporate bonds enter modeled net worth. Supplier purchase-price differences from modeled material cost are recognized as current-period operating adjustments. Trade-credit principal payments are cash movements, not a second operating expense.
- Facility construction is carried at 40% of funds paid and completed upgrades at 50% of investment. Internal transfers use 90% of material value plus a 2.5% freight cost, not a physical bill of materials. Factoring fees, cancellation fees, equity swaps, and issuance costs affect cash/net worth when actioned; they are not a comprehensive accrual ledger.
- Corporate coupons reduce monthly group profit whether paid or capitalized. Bond maturity failures remain corporate liabilities rather than silently turning into bank loans. Restructuring exchanges debt for 20% cash and 80% outside equity, with no claim of a professional valuation model.
- Some journals summarize profit rather than logging every cash movement. Cash flow can differ from reported net profit.
- Emergency credit prevents a forced game over. This is an open-ended sandbox; sustained losses increase debt rather than deleting your world.
- Product development and specialist upgrades are immediate cash investments with no separate resale carrying value or depreciation schedule. Subscription demand includes retained customers plus new acquisitions; only served customers are billed. Crop cycles alter available monthly output. Product bonuses apply to retail sales, not previously agreed contract prices.
- Startup growth, megaproject returns, currency behavior, and pricing formulas are deliberately fictional game rules.

## Validation

The suite contains 90 tests covering financial boundaries, contracts, warehouses, trading, financing, research, property development, regional access, venture exits, bank capitalization, megaproject staging, scenarios, invalid saves, and a twenty-year diversified simulation with all 24 industries.

## Hosting for free

`dist/` is the complete public website. No build step is needed. The dedicated public GitHub repository contains only these static assets and public documentation—not browser saves or local tooling credentials. GitHub Pages supports public repositories on GitHub Free:

https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

Other static hosts can also serve the same folder. Google Fonts is optional; fallback fonts keep the interface usable when fonts cannot load.

## Source structure

- `dist/catalog.js`: industry definitions and sector characteristics.
- `dist/commerce.js`, `commerce-ui.js`: supply agreements, trade credit, internal production routes, customer risk, factoring, and commitments.
- `dist/facilities.js`, `facility-ui.js`: physical bottlenecks, construction, shifts, maintenance, and storage.
- `dist/decisions.js`: contextual choices, temporary effects, and delayed outcomes.
- `dist/bonds.js`, `bond-ui.js`: corporate debt, covenants, distress, and restructuring.
- `dist/engine.js`: base monthly simulation and accounting.
- `dist/world.js`: cities, suppliers, contracts, workforce, and credit.
- `dist/empire.js`: shared supply, talent, advanced markets, corporate ownership, research, and properties.
- `dist/sectors.js`, `industry-ui.js`: industry operating models, recurring customers, product lifecycle, policies, and specialist upgrades.
- `dist/late.js`: international economics, megaprojects, ventures, bank, headquarters, and dynasty.
- `dist/app.js`, `strategy.js`, `expansion.js`, `endgame.js`: interface and game actions.
- `dist/validation.js`, `advanced-validation.js`: imported-save validation.
- `tests/`: deterministic simulation and integration tests.

Keep private save exports outside the public deployment folder.

Prepare cache-safe static assets with `python3 scripts/prepare-release.py`, then review and push the dedicated `public-release` repository. This preparation command does not publish automatically.
