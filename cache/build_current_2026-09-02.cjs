const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_JSON = path.join(__dirname, 'remaining_tasks_multimodel_analysis_2026-09-02.json');
const OUT_CSV = path.join(__dirname, 'remaining_tasks_multimodel_analysis_2026-09-02.csv');

function parseCsvLine(line) {
  const cells = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') { cell += '"'; i += 1; }
      else quoted = !quoted;
    } else if (ch === ',' && !quoted) {
      cells.push(cell); cell = '';
    } else cell += ch;
  }
  cells.push(cell);
  return cells;
}

function readCsv(file) {
  const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').trim();
  const lines = text.split(/\r?\n/);
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).filter(Boolean).map(line => {
    const cells = parseCsvLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? '']));
  });
}

function mean(values) { return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null; }
function pct(value) { return value == null ? null : value * 100; }
function pmf(probabilities) {
  let result = [1];
  for (const p of probabilities) {
    const next = Array(result.length + 1).fill(0);
    for (let k = 0; k < result.length; k += 1) {
      next[k] += result[k] * (1 - p);
      next[k + 1] += result[k] * p;
    }
    result = next;
  }
  return result;
}
function interval(probabilities, mass, fixed) {
  const p = pmf(probabilities);
  const alpha = (1 - mass) / 2;
  let cumulative = 0;
  let lo = 0;
  for (let k = 0; k < p.length; k += 1) { cumulative += p[k]; if (cumulative >= alpha) { lo = k; break; } }
  cumulative = 0;
  let hi = p.length - 1;
  for (let k = 0; k < p.length; k += 1) { cumulative += p[k]; if (cumulative >= 1 - alpha) { hi = k; break; } }
  return [fixed + lo, fixed + hi];
}

const ledger = readCsv(path.join(ROOT, 'artifacts', 'tasks.csv'));
const completed = ledger.filter(r => r['状态'] === '通过' || r['状态'] === '未通过');
const unrun = ledger.filter(r => r['状态'] === '未运行').map(r => r['任务ID']);
const completedPass = completed.filter(r => r['状态'] === '通过').length;

const sourceFiles = {
  'GPT-5.6 Sol@max': '_wipe_codex.json',
  'GPT-5.6 Sol@ultra': '_wipe_codex.json',
  'GPT-5.6 Terra@ultra': '_wipe_codex.json',
  'GPT-5.5@xhigh': '_wipe_codex.json',
  'GPT-5.6 Luna@max': '_wipe_codex.json',
  'Grok 4.6@xhigh': '_wipe_grok.json',
  'GLM-5.3@max': '_wipe_zcode.json',
  'DeepSeek V4 Flash@max': '_wipe_dsh.json',
  'DeepSeek V4 Pro@max': '_wipe_dsh.json',
};
const rawSources = {};
for (const file of new Set(Object.values(sourceFiles))) rawSources[file] = JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));

const profiles = {};
for (const [model, file] of Object.entries(sourceFiles)) {
  const records = {};
  for (const [task, entries] of Object.entries(rawSources[file])) {
    for (const [label, passed, runs] of entries) {
      if (label.endsWith(` · ${model}`)) records[task] = { passed, runs };
    }
  }
  const usable = unrun.map(task => ({ task, ...(records[task] || {}) })).filter(x => x.runs > 0);
  const rates = usable.map(x => x.passed / x.runs);
  profiles[model] = {
    model,
    coverage: usable.length,
    totalRemaining: unrun.length,
    missingTasks: unrun.filter(task => !records[task] || !(records[task].runs > 0)),
    taskEqualRate: mean(rates),
    expectedRemainingPasses: rates.reduce((a, b) => a + b, 0),
    pooledPassed: usable.reduce((a, x) => a + x.passed, 0),
    pooledRuns: usable.reduce((a, x) => a + x.runs, 0),
    taskRates: Object.fromEntries(usable.map(x => [x.task, x.passed / x.runs])),
  };
  profiles[model].pooledRate = profiles[model].pooledRuns ? profiles[model].pooledPassed / profiles[model].pooledRuns : null;
}

const comparison = readCsv(path.join(ROOT, 'deepswe_solmax_vs_dsh_promax.csv'));
const recent = {};
for (const [model, wrongField, recordField] of [
  ['GPT-5.6 Sol@max', 'Sol@max最近错', 'Sol通过/运行'],
  ['Pro0813@max', 'Pro@max最近错', 'Pro通过/运行'],
]) {
  const rows = comparison.filter(r => {
    if (!unrun.includes(r['题目'])) return false;
    const match = r[recordField].match(/^(\d+)\/(\d+)$/);
    return match && Number(match[2]) > 0;
  });
  recent[model] = { covered: rows.length, pass: rows.filter(r => r[wrongField] !== '是').length, rate: rows.length ? rows.filter(r => r[wrongField] !== '是').length / rows.length : null, missing: unrun.filter(t => !rows.some(r => r['题目'] === t)) };
}

const proKnown = Object.entries(profiles['DeepSeek V4 Pro@max'].taskRates);
const unrunPython = ledger.filter(r => r['状态'] === '未运行' && r['语言'] === 'python').map(r => r['任务ID']);
const pythonRates = unrunPython.map(task => profiles['DeepSeek V4 Pro@max'].taskRates[task]).filter(Number.isFinite);
const langchainImputation = mean(pythonRates);
const proProbabilities = unrun.map(task => Number.isFinite(profiles['DeepSeek V4 Pro@max'].taskRates[task]) ? profiles['DeepSeek V4 Pro@max'].taskRates[task] : (task === 'langchain-request-coalescing' ? langchainImputation : null)).filter(Number.isFinite);
const proPmf = pmf(proProbabilities);
const proExpected = proProbabilities.reduce((a, b) => a + b, 0);
const proVariance = proProbabilities.reduce((a, p) => a + p * (1 - p), 0);
const proForecast = {
  probabilityCount: proProbabilities.length,
  imputation: { task: 'langchain-request-coalescing', rate: langchainImputation, source: 'mean of known unrun Python task rates' },
  expectedRemainingPasses: proExpected,
  expectedFinalPasses: completedPass + proExpected,
  expectedFinalScore: (completedPass + proExpected) / 113,
  sdRemaining: Math.sqrt(proVariance),
  predictiveInterval90: interval(proProbabilities, 0.90, completedPass),
  predictiveInterval95: interval(proProbabilities, 0.95, completedPass),
  probabilityFinalAtLeast89: proPmf.slice(Math.max(0, 89 - completedPass)).reduce((a, b) => a + b, 0),
  probabilityFinalAtLeast90: proPmf.slice(Math.max(0, 90 - completedPass)).reduce((a, b) => a + b, 0),
};
const recentProPasses = recent['Pro0813@max'].pass;
const recentProExpected = recentProPasses + langchainImputation;
const recentProProbabilities = [
  ...Array(recentProPasses).fill(1),
  ...Array(recent['Pro0813@max'].covered - recentProPasses).fill(0),
  langchainImputation,
];
const solProbabilities = unrun.map(task => profiles['GPT-5.6 Sol@max'].taskRates[task]).filter(Number.isFinite);
const solPmf = pmf(solProbabilities);
const solExpected = solProbabilities.reduce((a, b) => a + b, 0);
const solForecast = {
  coverage: solProbabilities.length,
  expectedRemainingPasses: solExpected,
  expectedFinalPasses: completedPass + solExpected,
  expectedFinalScore: (completedPass + solExpected) / 113,
  predictiveInterval90: interval(solProbabilities, 0.90, completedPass),
  predictiveInterval95: interval(solProbabilities, 0.95, completedPass),
};

const result = {
  generatedAt: new Date().toISOString(),
  dataset: { totalTasks: 113, completed: completed.length, pass: completedPass, fail: completed.length - completedPass, unrun: unrun.length, completedOnlyRate: completedPass / completed.length, fullCatalogPassFraction: completedPass / 113 },
  unrunTasks: unrun,
  profiles,
  recent,
  grayScoreForecast: { coreProHistorical: proForecast, recentProState: { covered: recent['Pro0813@max'].covered, expectedRemainingPasses: recentProExpected, expectedFinalPasses: completedPass + recentProExpected, expectedFinalScore: (completedPass + recentProExpected) / 113, predictiveInterval90: interval(recentProProbabilities, 0.90, completedPass), predictiveInterval95: interval(recentProProbabilities, 0.95, completedPass) }, solMaxSensitivity: solForecast, strictBounds: { finalPasses: [completedPass, completedPass + unrun.length], score: [completedPass / 113, (completedPass + unrun.length) / 113] }, note: 'All forecast intervals are conditional predictive intervals under transfer assumptions, not confidence intervals.' },
  csvQuality: { expectedColumns: 14, observedWidths: Object.fromEntries([...new Set(fs.readFileSync(path.join(ROOT, 'artifacts', 'tasks.csv'), 'utf8').replace(/^\uFEFF/, '').trim().split(/\r?\n/).slice(1).map(x => parseCsvLine(x).length))].map(n => [n, 0])) },
};
const physical = fs.readFileSync(path.join(ROOT, 'artifacts', 'tasks.csv'), 'utf8').replace(/^\uFEFF/, '').trim().split(/\r?\n/).slice(1);
for (const line of physical) { const n = parseCsvLine(line).length; result.csvQuality.observedWidths[n] = (result.csvQuality.observedWidths[n] || 0) + 1; }
fs.writeFileSync(OUT_JSON, JSON.stringify(result, null, 2) + '\n');
const columns = ['model', 'coverage', 'missingTasks', 'taskEqualRate', 'expectedRemainingPasses', 'pooledPassed', 'pooledRuns', 'pooledRate'];
const lines = [columns.join(',')];
for (const item of Object.values(profiles)) lines.push(columns.map(k => k === 'missingTasks' ? JSON.stringify(item.missingTasks.join('|')) : JSON.stringify(item[k] ?? '')).join(','));
fs.writeFileSync(OUT_CSV, lines.join('\n') + '\n');
console.log(JSON.stringify({ dataset: result.dataset, profiles: Object.fromEntries(Object.entries(profiles).map(([k, v]) => [k, { coverage: v.coverage, missingTasks: v.missingTasks, taskEqualRate: v.taskEqualRate, expectedRemainingPasses: v.expectedRemainingPasses, pooledRate: v.pooledRate }])), recent, grayScoreForecast: result.grayScoreForecast, csvQuality: result.csvQuality }, null, 2));
