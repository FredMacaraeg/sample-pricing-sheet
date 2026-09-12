import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requiredFiles = [
  "Sample_Pricing_Sheet.xlsx",
  "README.md",
  "TESTING.md",
  "Code.gs",
  "appsscript.json",
];

const failures = [];
const pass = message => process.stdout.write(`PASS ${message}\n`);
const fail = message => failures.push(message);

for (const relativePath of requiredFiles) {
  const absolutePath = path.join(projectRoot, relativePath);
  if (!fs.existsSync(absolutePath)) fail(`Missing required file: ${relativePath}`);
}
if (!failures.length) pass("required files are present");

const workbookPath = path.join(projectRoot, "Sample_Pricing_Sheet.xlsx");
if (fs.existsSync(workbookPath)) {
  const workbook = fs.readFileSync(workbookPath);
  const zipSignature = workbook.subarray(0, 4).toString("hex");
  if (zipSignature !== "504b0304") fail("Workbook does not have a valid XLSX ZIP signature");
  else if (workbook.length < 20000) fail("Workbook is unexpectedly small");
  else pass(`workbook ZIP integrity looks valid (${workbook.length} bytes)`);
}

const manifestPath = path.join(projectRoot, "appsscript.json");
if (fs.existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    if (manifest.runtimeVersion !== "V8") fail("Apps Script runtimeVersion must be V8");
    else pass("Apps Script manifest is valid JSON with V8 runtime");
  } catch (error) {
    fail(`Apps Script manifest is invalid JSON: ${error.message}`);
  }
}

const scriptPath = path.join(projectRoot, "Code.gs");
if (fs.existsSync(scriptPath)) {
  const script = fs.readFileSync(scriptPath, "utf8");
  try {
    new Function(script);
    pass("Apps Script parses successfully");
  } catch (error) {
    fail(`Apps Script syntax error: ${error.message}`);
  }
  for (const requiredToken of ["Quote Builder", "Quote Log", "D54", "logCurrentQuote", "runGuardrailCheck"]) {
    if (!script.includes(requiredToken)) fail(`Apps Script is missing expected token: ${requiredToken}`);
  }
}

for (const markdownName of ["README.md", "TESTING.md"]) {
  const markdownPath = path.join(projectRoot, markdownName);
  if (!fs.existsSync(markdownPath)) continue;
  const markdown = fs.readFileSync(markdownPath, "utf8");
  const links = [...markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map(match => match[1]);
  for (const link of links) {
    if (/^(https?:|mailto:|#)/i.test(link)) continue;
    const cleanLink = link.split("#")[0];
    if (!cleanLink) continue;
    const resolved = path.resolve(path.dirname(markdownPath), cleanLink);
    if (!resolved.startsWith(projectRoot + path.sep) && resolved !== projectRoot) {
      fail(`${markdownName} link escapes the project: ${link}`);
    } else if (!fs.existsSync(resolved)) {
      fail(`${markdownName} has a broken internal link: ${link}`);
    }
  }
}
if (!failures.some(item => item.includes("link"))) pass("internal Markdown links resolve");

const textFiles = ["README.md", "TESTING.md", "Code.gs", "appsscript.json"];
const forbiddenTerms = ["Chainalysis", "Northstar Bank", "Financial Institution", "Crypto Business", "Compliance Suite", "Investigations Suite", "Reactor", "KYT"];
for (const file of textFiles) {
  const fullPath = path.join(projectRoot, file);
  if (!fs.existsSync(fullPath)) continue;
  const text = fs.readFileSync(fullPath, "utf8");
  for (const term of forbiddenTerms) {
    if (text.includes(term)) fail(`${file} contains company-specific term: ${term}`);
  }
}
if (!failures.some(item => item.includes("company-specific"))) pass("no company-specific terms found in reusable text files");

if (failures.length) {
  for (const failure of failures) process.stderr.write(`FAIL ${failure}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write("All project checks passed.\n");
}
