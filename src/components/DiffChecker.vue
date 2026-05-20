<template>
  <div class="diff-checker">
    <div class="controls">
      <button class="btn-diff" @click="compare" :disabled="!left.trim() || !right.trim()">
        🔍 Compare
      </button>
      <button class="btn-clear" @click="clearAll">Clear All</button>
      <label class="option">
        <input type="checkbox" v-model="ignoreCase" /> Ignore Case
      </label>
      <label class="option">
        <input type="checkbox" v-model="ignoreWhitespace" /> Ignore Whitespace
      </label>
    </div>

    <div class="diff-panels">
      <div class="diff-panel">
        <div class="panel-header">
          <span class="panel-label">Original</span>
          <button class="btn-small" @click="clearLeft">Clear</button>
        </div>
        <textarea
          v-model="left"
          placeholder="Paste original text here..."
          spellcheck="false"
          @input="diffResult = null"
        ></textarea>
      </div>
      <div class="diff-panel">
        <div class="panel-header">
          <span class="panel-label">Modified</span>
          <button class="btn-small" @click="clearRight">Clear</button>
        </div>
        <textarea
          v-model="right"
          placeholder="Paste modified text here..."
          spellcheck="false"
          @input="diffResult = null"
        ></textarea>
      </div>
    </div>

    <div v-if="diffResult" class="result-area">
      <div class="result-header">
        <h3>🔍 Diff Result</h3>
        <span class="stats">
          <span class="stat added">{{ diffResult.added }} added</span>
          <span class="stat removed">{{ diffResult.removed }} removed</span>
          <span class="stat unchanged">{{ diffResult.unchanged }} unchanged</span>
        </span>
      </div>

      <div class="diff-view">
        <div
          v-for="(line, idx) in diffResult.lines"
          :key="idx"
          :class="['diff-line', line.type]"
        >
          <span class="line-num">{{ line.lineNum }}</span>
          <span class="line-sign">{{ line.sign }}</span>
          <pre class="line-content">{{ line.text }}</pre>
        </div>
      </div>

      <div v-if="diffResult.lines.length === 0" class="no-diff">
        ✅ The two texts are identical.
      </div>
    </div>

    <div v-if="!diffResult && (left || right)" class="hint">
      👆 Click <strong>Compare</strong> to see differences
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const left = ref('');
const right = ref('');
const ignoreCase = ref(false);
const ignoreWhitespace = ref(false);
const diffResult = ref(null);

function normalize(text) {
  let t = text;
  if (ignoreCase.value) t = t.toLowerCase();
  if (ignoreWhitespace.value) t = t.replace(/\s+/g, ' ').trim();
  return t;
}

function compare() {
  const leftLines = left.value.split('\n');
  const rightLines = right.value.split('\n');

  const leftNorm = leftLines.map(normalize);
  const rightNorm = rightLines.map(normalize);

  // Simple LCS-based diff
  const m = leftLines.length;
  const n = rightLines.length;

  // Build LCS table
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (leftNorm[i - 1] === rightNorm[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack
  const result = [];
  let added = 0, removed = 0, unchanged = 0;
  let i = m, j = n;
  const stack = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && leftNorm[i - 1] === rightNorm[j - 1]) {
      stack.push({ text: leftLines[i - 1], type: 'unchanged', leftNum: i, sign: ' ' });
      unchanged++;
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({ text: rightLines[j - 1], type: 'added', rightNum: j, sign: '+' });
      added++;
      j--;
    } else {
      stack.push({ text: leftLines[i - 1], type: 'removed', leftNum: i, sign: '-' });
      removed++;
      i--;
    }
  }

  // Number lines
  let leftNum = 1, rightNum = 1;
  const lines = [];
  while (stack.length > 0) {
    const item = stack.pop();
    if (item.type === 'unchanged') {
      lines.push({ ...item, lineNum: leftNum, text: item.text, sign: ' ' });
      leftNum++; rightNum++;
    } else if (item.type === 'removed') {
      lines.push({ ...item, lineNum: leftNum, text: item.text, sign: '-' });
      leftNum++;
    } else {
      lines.push({ ...item, lineNum: rightNum, text: item.text, sign: '+' });
      rightNum++;
    }
  }

  diffResult.value = { lines, added, removed, unchanged };
}

function clearAll() {
  left.value = '';
  right.value = '';
  diffResult.value = null;
}

function clearLeft() {
  left.value = '';
  diffResult.value = null;
}

function clearRight() {
  right.value = '';
  diffResult.value = null;
}
</script>

<style scoped>
.diff-checker {
  max-width: 100%;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.btn-diff {
  padding: 0.6rem 1.5rem;
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-diff:hover:not(:disabled) {
  background: var(--color-accent-hover);
}

.btn-diff:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-clear {
  padding: 0.5rem 1rem;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-clear:hover { background: var(--color-border); }

.option {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: var(--color-muted);
  cursor: pointer;
}

.diff-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .diff-panels {
    grid-template-columns: 1fr;
  }
}

.diff-panel {
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.panel-label {
  font-weight: 600;
  font-size: 0.9rem;
}

.btn-small {
  padding: 0.3rem 0.7rem;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}

.btn-small:hover { background: var(--color-border); }

textarea {
  width: 100%;
  min-height: 380px;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  resize: vertical;
  background: var(--color-card);
}

textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.result-area {
  margin-top: 1.5rem;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.result-header h3 {
  margin: 0;
}

.stats {
  display: flex;
  gap: 0.75rem;
  font-size: 0.85rem;
}

.stat {
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-weight: 600;
}

.stat.added { background: #dcfce7; color: #166534; }
.stat.removed { background: #fef2f2; color: #991b1b; }
.stat.unchanged { background: var(--color-card); color: var(--color-muted); }

.diff-view {
  border: 1px solid var(--color-border);
  border-radius: 6px;
  overflow: hidden;
  font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  line-height: 1.6;
}

.diff-line {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  min-height: 1.6rem;
}

.diff-line:last-child { border-bottom: none; }

.diff-line.added { background: #dcfce7; }
.diff-line.removed { background: #fef2f2; }

.line-num {
  width: 3rem;
  min-width: 3rem;
  padding: 0 0.5rem;
  text-align: right;
  color: var(--color-muted);
  font-size: 0.75rem;
  background: rgba(0,0,0,0.02);
  border-right: 1px solid #f0f0f0;
  user-select: none;
}

.line-sign {
  width: 1.5rem;
  min-width: 1.5rem;
  text-align: center;
  font-weight: 700;
  user-select: none;
}

.diff-line.added .line-sign { color: #166534; }
.diff-line.removed .line-sign { color: #991b1b; }

.line-content {
  flex: 1;
  padding: 0 0.5rem;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: inherit;
  font-size: inherit;
}

.no-diff {
  padding: 2rem;
  text-align: center;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  color: #166534;
  font-size: 1rem;
}

.hint {
  text-align: center;
  color: var(--color-muted);
  padding: 2rem 0;
  font-size: 0.95rem;
}
</style>
