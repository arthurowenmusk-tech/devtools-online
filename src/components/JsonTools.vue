<template>
  <div class="json-tools">
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.emoji }} {{ tab.label }}
      </button>
    </div>

    <!-- FORMATTER -->
    <div v-if="activeTab === 'format'" class="tool-layout">
      <div class="editor-area two-col">
        <div class="panel">
          <div class="panel-header">
            <label>Input</label>
            <div class="panel-actions">
              <select v-model="indent" class="indent-select">
                <option :value="2">2 spaces</option>
                <option :value="4">4 spaces</option>
                <option value="tab">Tab</option>
              </select>
              <button class="btn-small" @click="clearIO">Clear</button>
            </div>
          </div>
          <textarea v-model="input" placeholder="Paste minified/ugly JSON here..." spellcheck="false"></textarea>
        </div>
        <div class="actions-col">
          <button class="btn-primary" @click="formatJson">Format</button>
        </div>
        <div class="panel">
          <div class="panel-header">
            <label>Formatted</label>
            <div class="panel-actions">
              <button class="btn-small" @click="copyOutput" :disabled="!output">Copy</button>
              <button class="btn-small" @click="downloadOutput" :disabled="!output">Download</button>
            </div>
          </div>
          <textarea v-model="output" readonly placeholder="Formatted JSON will appear here..." spellcheck="false"></textarea>
        </div>
      </div>
      <div v-if="error" class="error">{{ error }}</div>
    </div>

    <!-- VALIDATOR -->
    <div v-if="activeTab === 'validate'" class="tool-layout">
      <div class="panel">
        <div class="panel-header">
          <label>Paste JSON to validate</label>
          <button class="btn-small" @click="input='';validateResult=null">Clear</button>
        </div>
        <textarea v-model="input" placeholder="Paste JSON to validate..." spellcheck="false" @input="validateResult=null"></textarea>
      </div>
      <button class="btn-primary full-width" @click="validateJson" :disabled="!input.trim()">
        ✅ Validate JSON
      </button>
      <div v-if="validateResult" :class="['validation-result', validateResult.valid ? 'valid' : 'invalid']">
        <template v-if="validateResult.valid">
          ✅ <strong>Valid JSON</strong>
          <span v-if="validateResult.stats">
            — {{ validateResult.stats.type }},
            {{ validateResult.stats.keys ?? validateResult.stats.items ?? 0 }}
            {{ validateResult.stats.keys !== undefined ? 'keys' : 'items' }},
            {{ validateResult.stats.size }}
          </span>
        </template>
        <template v-else>
          ❌ <strong>Invalid JSON</strong>
          <p class="error-msg">{{ validateResult.error }}</p>
        </template>
      </div>
    </div>

    <!-- MINIFIER -->
    <div v-if="activeTab === 'minify'" class="tool-layout">
      <div class="editor-area two-col">
        <div class="panel">
          <div class="panel-header">
            <label>Input</label>
            <button class="btn-small" @click="clearIO">Clear</button>
          </div>
          <textarea v-model="input" placeholder="Paste formatted JSON here..." spellcheck="false"></textarea>
        </div>
        <div class="actions-col">
          <button class="btn-primary" @click="minifyJson">Minify</button>
        </div>
        <div class="panel">
          <div class="panel-header">
            <label>Minified</label>
            <div class="panel-actions">
              <button class="btn-small" @click="copyOutput" :disabled="!output">Copy</button>
              <span v-if="stats" class="size-stat">
                {{ stats.original }} → {{ stats.minified }}
                ({{ stats.saved }}%)
              </span>
            </div>
          </div>
          <textarea v-model="output" readonly placeholder="Minified JSON will appear here..." spellcheck="false"></textarea>
        </div>
      </div>
      <div v-if="error" class="error">{{ error }}</div>
    </div>

    <!-- CONVERTER: JSON ↔ CSV -->
    <div v-if="activeTab === 'convert'" class="tool-layout">
      <div class="tabs sub-tabs">
        <button :class="{ active: convMode === 'json2csv' }" @click="convMode='json2csv'">JSON → CSV</button>
        <button :class="{ active: convMode === 'csv2json' }" @click="convMode='csv2json'">CSV → JSON</button>
      </div>

      <div class="editor-area two-col">
        <div class="panel">
          <div class="panel-header">
            <label>Input</label>
            <button class="btn-small" @click="clearIO">Clear</button>
          </div>
          <textarea
            v-model="input"
            :placeholder="convMode === 'json2csv' ? 'Paste JSON array here...' : 'Paste CSV here (header row required)...'"
            spellcheck="false"
          ></textarea>
        </div>
        <div class="actions-col">
          <button class="btn-primary" @click="convertJsonCsv" :disabled="!input.trim()">
            Convert →
          </button>
        </div>
        <div class="panel">
          <div class="panel-header">
            <label>Output</label>
            <div class="panel-actions">
              <button class="btn-small" @click="copyOutput" :disabled="!output">Copy</button>
              <button class="btn-small" @click="downloadOutput" :disabled="!output">Download</button>
            </div>
          </div>
          <textarea v-model="output" readonly placeholder="Converted output..." spellcheck="false"></textarea>
        </div>
      </div>

      <div v-if="error" class="error">{{ error }}</div>

      <div v-if="csvTable.length > 0 && convMode === 'json2csv'" class="preview">
        <h3>📊 Table Preview</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th v-for="col in csvCols" :key="col">{{ col }}</th></tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in csvTable" :key="i">
                <td v-for="col in csvCols" :key="col">{{ row[col] ?? '' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const tabs = [
  { id: 'format',   label: 'Formatter', emoji: '✨' },
  { id: 'validate', label: 'Validator', emoji: '✅' },
  { id: 'minify',   label: 'Minifier',  emoji: '📦' },
  { id: 'convert',  label: 'JSON ↔ CSV', emoji: '🔄' },
];
const activeTab = ref('format');

// Shared state
const input = ref('');
const output = ref('');
const error = ref('');
const indent = ref(2);

// Validator state
const validateResult = ref(null);

// Minifier state
const stats = ref(null);

// Converter state
const convMode = ref('json2csv');
const csvTable = ref([]);
const csvCols = ref([]);

function clearIO() {
  input.value = '';
  output.value = '';
  error.value = '';
  stats.value = null;
  validateResult.value = null;
  csvTable.value = [];
  csvCols.value = [];
}

// --- FORMATTER ---
function formatJson() {
  error.value = '';
  output.value = '';
  try {
    const obj = JSON.parse(input.value);
    const space = indent.value === 'tab' ? '\t' : indent.value;
    output.value = JSON.stringify(obj, null, space);
  } catch (e) {
    error.value = `Invalid JSON: ${e.message}`;
  }
}

// --- VALIDATOR ---
function validateJson() {
  error.value = '';
  try {
    const obj = JSON.parse(input.value);
    const type = Array.isArray(obj) ? 'Array' : typeof obj;
    let details = { type };
    if (Array.isArray(obj)) {
      details.items = obj.length;
    } else if (typeof obj === 'object' && obj !== null) {
      details.keys = Object.keys(obj).length;
    }
    details.size = new Blob([input.value]).size;
    details.size = details.size < 1024
      ? `${details.size} B`
      : `${(details.size / 1024).toFixed(1)} KB`;
    validateResult.value = { valid: true, stats: details };
  } catch (e) {
    validateResult.value = { valid: false, error: e.message };
  }
}

// --- MINIFIER ---
function minifyJson() {
  error.value = '';
  output.value = '';
  stats.value = null;
  try {
    const obj = JSON.parse(input.value);
    output.value = JSON.stringify(obj);
    const orig = input.value.length;
    const mini = output.value.length;
    stats.value = {
      original: orig < 1024 ? `${orig} B` : `${(orig/1024).toFixed(1)} KB`,
      minified: mini < 1024 ? `${mini} B` : `${(mini/1024).toFixed(1)} KB`,
      saved: orig > 0 ? ((1 - mini / orig) * 100).toFixed(1) : 0,
    };
  } catch (e) {
    error.value = `Invalid JSON: ${e.message}`;
  }
}

// --- FLATTEN ---
function flattenObject(obj, prefix = '') {
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(result, flattenObject(val, fullKey));
    } else if (Array.isArray(val)) {
      result[fullKey] = JSON.stringify(val);
    } else {
      result[fullKey] = val;
    }
  }
  return result;
}

// --- CONVERTER ---
function convertJsonCsv() {
  error.value = '';
  output.value = '';
  csvTable.value = [];
  csvCols.value = [];
  try {
    if (convMode.value === 'json2csv') {
      const raw = JSON.parse(input.value);
      let rows;

      // Case 1: Array of objects → standard
      if (Array.isArray(raw)) {
        rows = raw.map(item => {
          if (typeof item === 'object' && item !== null) return flattenObject(item);
          return { _value: item };
        });
      }
      // Case 2: Object of objects (like config map) → key column + flattened values
      else if (typeof raw === 'object' && raw !== null) {
        const keys = Object.keys(raw);
        const firstVal = raw[keys[0]];
        const isObjectOfObjects = typeof firstVal === 'object' && firstVal !== null && !Array.isArray(firstVal);
        if (isObjectOfObjects) {
          rows = keys.map(k => ({
            _key: k,
            ...flattenObject(raw[k]),
          }));
        } else {
          // Single object → one row, flatten
          rows = [flattenObject(raw)];
        }
      } else {
        rows = [{ _value: raw }];
      }

      if (rows.length === 0) throw new Error('No data to convert');

      const cols = Object.keys(rows[0]);
      csvCols.value = cols;
      csvTable.value = rows.slice(0, 50);
      const header = cols.join(',');
      const csvRows = rows.map(row => cols.map(c => {
        const v = row[c];
        if (v === null || v === undefined) return '';
        const s = String(v);
        return (s.includes(',') || s.includes('"') || s.includes('\n'))
          ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(','));
      output.value = [header, ...csvRows].join('\n');
    } else {
      const lines = input.value.trim().split('\n');
      if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row');
      const parse = (line) => {
        const r = []; let cur = '', q = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (q) {
            if (ch === '"') { if (line[i+1]==='"') { cur+='"'; i++; } else q=false; }
            else cur += ch;
          } else {
            if (ch === '"') q = true;
            else if (ch === ',') { r.push(cur.trim()); cur = ''; }
            else cur += ch;
          }
        }
        r.push(cur.trim());
        return r;
      };
      const headers = parse(lines[0]);
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        const vals = parse(lines[i]);
        if (vals.length === 0 || (vals.length === 1 && vals[0] === '')) continue;
        const row = {};
        headers.forEach((h, j) => { const v = vals[j] || ''; const n = Number(v); row[h] = isNaN(n) || v === '' ? v : n; });
        data.push(row);
      }
      output.value = JSON.stringify(data, null, 2);
    }
  } catch (e) {
    error.value = e.message;
  }
}

// --- Shared actions ---
async function copyOutput() {
  try { await navigator.clipboard.writeText(output.value); }
  catch {
    const ta = document.createElement('textarea'); ta.value = output.value;
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
  }
}

function downloadOutput() {
  const ext = activeTab.value === 'convert' && convMode.value === 'json2csv' ? 'csv' : 'json';
  const blob = new Blob([output.value], { type: ext === 'csv' ? 'text/csv' : 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `output.${ext}`;
  a.click();
  URL.revokeObjectURL(a.href);
}
</script>

<style scoped>
.json-tools { max-width: 100%; }

.tabs {
  display: flex; gap: 0; margin-bottom: 1.5rem;
  border: 1px solid var(--color-border); border-radius: 6px;
  overflow: hidden; width: fit-content; flex-wrap: wrap;
}
.tabs button {
  padding: 0.5rem 1rem; border: none; background: var(--color-card);
  cursor: pointer; font-size: 0.88rem; font-weight: 500;
  color: var(--color-muted); transition: all 0.2s;
}
.tabs button.active { background: var(--color-accent); color: white; }
.tabs button:not(:last-child) { border-right: 1px solid var(--color-border); }

.sub-tabs { margin-bottom: 1rem; }
.sub-tabs button { font-size: 0.82rem; padding: 0.4rem 0.9rem; }

.tool-layout { margin-top: 0.5rem; }

.editor-area { display: grid; gap: 1rem; align-items: start; }
.editor-area.two-col { grid-template-columns: 1fr auto 1fr; }

@media (max-width: 768px) {
  .editor-area.two-col { grid-template-columns: 1fr; }
  .actions-col { justify-content: center; }
}

.panel { display: flex; flex-direction: column; }

.panel-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;
}
.panel-header label { font-weight: 600; font-size: 0.9rem; }
.panel-actions { display: flex; gap: 0.5rem; align-items: center; }

.indent-select {
  padding: 0.2rem 0.4rem; border: 1px solid var(--color-border);
  border-radius: 4px; font-size: 0.8rem; background: var(--color-bg);
}

textarea {
  width: 100%; min-height: 420px; padding: 1rem;
  border: 1px solid var(--color-border); border-radius: 8px;
  font-family: 'Fira Code','Cascadia Code','JetBrains Mono',monospace;
  font-size: 0.9rem; line-height: 1.6; resize: vertical;
  background: var(--color-card);
}
textarea:focus {
  outline: none; border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
}

.actions-col { display: flex; align-items: flex-start; padding-top: 2rem; }
.actions-col .btn-primary { padding: 0.7rem 2rem; font-size: 1rem; }

.btn-primary {
  padding: 0.6rem 1.5rem; background: var(--color-accent); color: white;
  border: none; border-radius: 6px; font-size: 0.95rem; font-weight: 600;
  cursor: pointer; white-space: nowrap; transition: background 0.2s;
}
.btn-primary:hover:not(:disabled) { background: var(--color-accent-hover); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary.full-width { width: 100%; margin-top: 1rem; }

.btn-small {
  padding: 0.3rem 0.7rem; background: var(--color-card);
  border: 1px solid var(--color-border); border-radius: 4px;
  font-size: 0.8rem; cursor: pointer; white-space: nowrap;
}
.btn-small:hover:not(:disabled) { background: var(--color-border); }
.btn-small:disabled { opacity: 0.4; cursor: not-allowed; }

.error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 0.75rem 1rem; border-radius: 6px; margin-top: 1rem; font-size: 0.9rem; }

.validation-result { padding: 1rem 1.2rem; border-radius: 6px; margin-top: 1rem; font-size: 0.95rem; }
.validation-result.valid { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
.validation-result.invalid { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
.error-msg { margin: 0.5rem 0 0; font-size: 0.85rem; opacity: 0.85; }

.size-stat { color: var(--color-muted); font-size: 0.78rem; white-space: nowrap; }

.preview { margin-top: 1.5rem; }
.preview h3 { margin-bottom: 0.75rem; }
.table-wrap { overflow-x: auto; border: 1px solid var(--color-border); border-radius: 6px; }
.table-wrap table { margin: 0; font-size: 0.83rem; }
.table-wrap th { white-space: nowrap; background: var(--color-card); }
</style>
