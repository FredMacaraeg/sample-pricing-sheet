# Sample Pricing Sheet

> Reusable interview portfolio project using entirely synthetic data and illustrative assumptions. It is not affiliated with any employer or interview company and contains no confidential information or actual price points.

This Google Sheets-ready model demonstrates how a finance leader can connect deal-level pricing decisions to portfolio pricing performance. The default company, segments, packages, customers, and economics are placeholders designed to be replaced before each interview.

## What the model covers

- Hybrid pricing: annual platform fee, seats, committed usage, and overages
- Segment packaging: different structures for enterprise, public-sector, and digital-native buyers
- Discount governance: expected value, gross margin, term, commitment, and payment-cadence trade-offs
- Renewal repricing: staged increases for underpriced legacy cohorts
- Portfolio metrics: ARR, ACV, realized price, weighted discount, win rate, sales cycle, renewal rate, NRR, usage growth, gross margin, expansion ARR, churn by price cohort, and multi-product penetration

## Workbook flow

1. `Pricing Summary` presents the active quote, portfolio KPIs, and case outcomes.
2. `Quote Builder` converts editable deal inputs into recurring ACV, contract value, expected value, gross margin, realized price, retention proxies, and a deal-desk status.
3. `Pricing Cases` evaluates five examples across four reusable pricing situations.
4. `Portfolio Metrics` calculates the dashboard from synthetic customer and closed-opportunity data.
5. `Assumptions` owns package defaults, guardrails, and the interview research checklist.
6. `Quote Log` stores quote snapshots created by Apps Script.

## Reuse for a new interview

1. Duplicate `Sample_Pricing_Sheet.xlsx` or make a copy of your Google Sheet.
2. Replace the package table, segment names, value metric, and deal-desk guardrails on `Assumptions`.
3. Add only public company and product links to the research checklist; mark unresolved items `UNSOURCED`.
4. Replace every synthetic customer, opportunity, probability, margin, and price point.
5. Run the regression checks in [`TESTING.md`](TESTING.md).
6. Keep the disclaimer visible when sharing the model.

## Automation

The model recalculates with native formulas and data validation. [`Code.gs`](Code.gs) adds a `Pricing Model` menu with three actions:

- Refresh calculations
- Run guardrail check
- Log current quote

It also uses `onEdit` to surface package or deal-desk exceptions when quote inputs change.

### Install in Google Sheets

1. Import `Sample_Pricing_Sheet.xlsx` into Google Sheets.
2. Open **Extensions > Apps Script**.
3. Replace the default script with [`Code.gs`](Code.gs).
4. Add [`appsscript.json`](appsscript.json) if you manage the project with `clasp`; otherwise the default manifest is sufficient.
5. Save and reload the spreadsheet.
6. Use the new **Pricing Model** menu.

The first menu action that writes to the sheet will request Google authorization.

## Suggested interview demo

1. Start on `Pricing Summary`: diagnose realized price and usage, match the value metric to the segment, test expected value and margin, then apply guardrails.
2. In `Quote Builder`, change the segment, package, usage, discount, term, and payment cadence.
3. Show how ACV, contract value, expected value, gross margin, and approval status change immediately.
4. Run the guardrail check and log the quote.
5. Move to `Portfolio Metrics` to connect one deal decision to portfolio pricing performance and renewal outcomes.

## Modeling boundaries

- Usage units are intentionally generic because the right value metric varies by product and segment.
- The expected NRR proxy is `renewal probability × (1 + expansion)`; it is not observed cohort NRR.
- The renewal value proxy is a simplified gross-profit continuation estimate and excludes CAC and discounting.
- Expected contract value is modeled contract value multiplied by the entered win probability; it is a decision aid, not revenue-recognition guidance.
- All price points, probabilities, margins, customer records, and case outcomes are synthetic.

## Quality checks

Run `node scripts/validate-project.mjs` from this directory. The validator checks required files, internal documentation links, the Apps Script manifest and syntax, workbook ZIP integrity, and company-specific leakage.
