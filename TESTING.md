# Testing and Accuracy Notes

## Automated project check

From `pricing-model/sample-pricing-sheet` run:

```bash
node scripts/validate-project.mjs
```

The check fails when a required file is missing, an internal Markdown link is broken, the Apps Script manifest is invalid, the Apps Script cannot be parsed, the workbook is not a valid XLSX ZIP, or company-specific terms leak into the reusable project files.

## Formula regression cases

Run these in `Quote Builder` after importing the workbook to Google Sheets.

| Test | Inputs | Expected result |
|---|---|---|
| Baseline | Enterprise / Core; 36 months; annual prepay; 18 seats; 55M usage; 15% discount | Net recurring ACV $351,900; Year 1 GM about 78.8%; status `Within guardrails` |
| Approval threshold | Set recurring discount to 25% | Status begins `VP approval` |
| Trade for term | Set discount to 15%, term to 12 months, annual prepay | Status `Trade discount for longer term` |
| Trade for prepay | Set discount to 15%, term to 36 months, monthly cadence | Status `Trade discount for annual prepay` |
| Invalid package pair | Public Sector / Core | Package check asks for a supported pair; economics display `n.a.` |
| Valid public-sector pair | Public Sector / Workflow | Package check `Valid`; economics recalculate |
| No usage | Set projected usage to 0 | Realized price per usage unit displays `n.a.` rather than a divide-by-zero error |
| Override guardrail | Enter a negative package override | Input validation rejects it |

## Metric definitions

| Metric | Definition used in the model |
|---|---|
| Weighted discount | List-ACV-weighted recurring discount across closed opportunities |
| Win rate | Won opportunities divided by won plus lost opportunities |
| Renewal rate | Renewed customers divided by renewed plus churned customers; upcoming renewals are excluded |
| NRR | Current cohort ARR divided by opening cohort ARR |
| Usage growth | Total current usage divided by total prior usage, less one |
| Gross margin | Total gross profit divided by total revenue |
| Expected contract value | Modeled contract value multiplied by entered win probability |
| Expected NRR proxy | Renewal probability multiplied by one plus expansion; not observed cohort NRR |
| Renewal value proxy | Simplified gross-profit continuation estimate; excludes CAC and discounting |

## Link review

- Keep research URLs on `Assumptions` as official, public sources.
- Mark a link `VERIFIED YYYY-MM-DD` only after opening it successfully.
- Treat public product pages as context for use cases and terminology, not evidence for synthetic prices, margins, discounts, or win probabilities.
- Recheck links before every interview because product and company pages can move.

## Google Sheets automation check

After installing `Code.gs` through **Extensions > Apps Script**:

1. Reload the workbook and confirm the `Pricing Model` menu appears.
2. Run **Run guardrail check** and confirm the toast matches `Quote Builder!D54`.
3. Run **Log current quote** and confirm one row is appended to `Quote Log` with correct date, percentages, and currency formatting.
4. Change a quote input and confirm exception toasts appear only when the package pair or guardrails require action.
