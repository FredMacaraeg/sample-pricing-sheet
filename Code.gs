const PRICING_MODEL = Object.freeze({
  quoteSheet: 'Quote Builder',
  logSheet: 'Quote Log',
  logStartColumn: 3,
  logHeaderRow: 6,
  cells: Object.freeze({
    customer: 'D8',
    segment: 'D9',
    packageName: 'D10',
    packageCheck: 'D11',
    termMonths: 'D12',
    paymentCadence: 'D13',
    discount: 'D16',
    listAcv: 'D38',
    netAcv: 'D40',
    grossMargin: 'D46',
    contractValue: 'D49',
    expectedContractValue: 'D50',
    approvalStatus: 'D54',
  }),
});

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Pricing Model')
    .addItem('Refresh calculations', 'refreshPricingModel')
    .addItem('Run guardrail check', 'runGuardrailCheck')
    .addSeparator()
    .addItem('Log current quote', 'logCurrentQuote')
    .addToUi();
}

function refreshPricingModel() {
  SpreadsheetApp.flush();
  SpreadsheetApp.getActive().toast(
    'Quote economics and portfolio metrics are current.',
    'Pricing Model',
    4
  );
}

function runGuardrailCheck() {
  const spreadsheet = SpreadsheetApp.getActive();
  const quote = spreadsheet.getSheetByName(PRICING_MODEL.quoteSheet);
  if (!quote) throw new Error(`Missing sheet: ${PRICING_MODEL.quoteSheet}`);

  SpreadsheetApp.flush();
  const packageCheck = quote.getRange(PRICING_MODEL.cells.packageCheck).getDisplayValue();
  const status = quote.getRange(PRICING_MODEL.cells.approvalStatus).getDisplayValue();

  if (packageCheck !== 'Valid') {
    spreadsheet.toast(packageCheck, 'Pricing Model', 7);
    return packageCheck;
  }

  spreadsheet.toast(status, 'Deal desk result', 7);
  return status;
}

function logCurrentQuote() {
  const spreadsheet = SpreadsheetApp.getActive();
  const quote = spreadsheet.getSheetByName(PRICING_MODEL.quoteSheet);
  const log = spreadsheet.getSheetByName(PRICING_MODEL.logSheet);
  if (!quote) throw new Error(`Missing sheet: ${PRICING_MODEL.quoteSheet}`);
  if (!log) throw new Error(`Missing sheet: ${PRICING_MODEL.logSheet}`);

  SpreadsheetApp.flush();
  const packageCheck = quote.getRange(PRICING_MODEL.cells.packageCheck).getDisplayValue();
  if (packageCheck !== 'Valid') {
    spreadsheet.toast(packageCheck, 'Quote not logged', 7);
    return;
  }

  const values = PRICING_MODEL.cells;
  const owner = Session.getActiveUser().getEmail() || 'Unknown user';
  const row = [[
    new Date(),
    owner,
    quote.getRange(values.customer).getValue(),
    quote.getRange(values.segment).getValue(),
    quote.getRange(values.packageName).getValue(),
    quote.getRange(values.termMonths).getValue(),
    quote.getRange(values.paymentCadence).getValue(),
    quote.getRange(values.listAcv).getValue(),
    quote.getRange(values.netAcv).getValue(),
    quote.getRange(values.discount).getValue(),
    quote.getRange(values.grossMargin).getValue(),
    quote.getRange(values.contractValue).getValue(),
    quote.getRange(values.expectedContractValue).getValue(),
    quote.getRange(values.approvalStatus).getDisplayValue(),
  ]];

  const nextRow = Math.max(log.getLastRow() + 1, PRICING_MODEL.logHeaderRow + 1);
  log.getRange(nextRow, PRICING_MODEL.logStartColumn, 1, row[0].length).setValues(row);
  log.getRange(nextRow, PRICING_MODEL.logStartColumn).setNumberFormat('mm/dd/yy hh:mm');
  log.getRange(nextRow, 10, 1, 2).setNumberFormat('$#,##0;[Red]($#,##0);-');
  log.getRange(nextRow, 12, 1, 2).setNumberFormat('0.0%');
  log.getRange(nextRow, 14, 1, 2).setNumberFormat('$#,##0;[Red]($#,##0);-');

  spreadsheet.toast(
    `Quote logged for ${row[0][2]}.`,
    'Pricing Model',
    5
  );
}

function onEdit(event) {
  if (!event || !event.range) return;
  const range = event.range;
  if (range.getSheet().getName() !== PRICING_MODEL.quoteSheet) return;

  const row = range.getRow();
  const column = range.getColumn();
  const changedDealInput = column === 4 && row >= 8 && row <= 22;
  const changedOverride = column === 5 && row >= 25 && row <= 30;
  if (!changedDealInput && !changedOverride) return;

  SpreadsheetApp.flush();
  const spreadsheet = event.source || SpreadsheetApp.getActive();
  const quote = spreadsheet.getSheetByName(PRICING_MODEL.quoteSheet);
  const packageCheck = quote.getRange(PRICING_MODEL.cells.packageCheck).getDisplayValue();
  const status = quote.getRange(PRICING_MODEL.cells.approvalStatus).getDisplayValue();

  if (packageCheck !== 'Valid') {
    spreadsheet.toast(packageCheck, 'Pricing Model', 5);
  } else if (status !== 'Within guardrails') {
    spreadsheet.toast(status, 'Deal desk review', 5);
  }
}
