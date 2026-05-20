<template>
  <div class="lorem">
    <div class="controls">
      <div class="ctrl"><label>Paragraphs</label><input v-model.number="paras" type="number" min="1" max="20"></div>
      <div class="ctrl"><label>Sentences/para</label><input v-model.number="sents" type="number" min="1" max="20"></div>
      <button class="btn-act" @click="generate">Generate</button>
      <button class="btn-act secondary" @click="copyOut" :disabled="!output">Copy All</button>
    </div>
    <div v-if="output" class="output">
      <p v-for="(p,i) in output.split('\n\n')" :key="i">{{ p }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const paras = ref(3);
const sents = ref(5);
const output = ref('');

const words = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split(' ');

function sentence() {
  const n = 5 + Math.floor(Math.random() * 12);
  const ws = [];
  for (let i = 0; i < n; i++) ws.push(words[Math.floor(Math.random() * words.length)]);
  ws[0] = ws[0][0].toUpperCase() + ws[0].slice(1);
  return ws.join(' ') + '.';
}

function paragraph() {
  const ss = [];
  for (let i = 0; i < sents.value; i++) ss.push(sentence());
  return ss.join(' ');
}

function generate() {
  const ps = [];
  for (let i = 0; i < paras.value; i++) ps.push(paragraph());
  output.value = ps.join('\n\n');
}

async function copyOut() { try { await navigator.clipboard.writeText(output.value); } catch {} }
</script>

<style scoped>
.lorem { max-width: 800px; }
.controls { display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap; margin-bottom: 1.5rem; }
.ctrl { display: flex; flex-direction: column; gap: 0.3rem; }
.ctrl label { font-weight: 600; font-size: 0.8rem; color: var(--color-muted); }
.ctrl input { width: 70px; padding: 0.5rem; border: 1px solid var(--color-border); border-radius: 6px; font-size: 0.9rem; }
.btn-act { padding: 0.5rem 1.2rem; background: var(--color-accent); color: white; border: none; border-radius: 6px; font-size: 0.9rem; font-weight: 600; cursor: pointer; }
.btn-act:hover { background: var(--color-accent-hover); }
.btn-act.secondary { background: var(--color-card); color: var(--color-text); border: 1px solid var(--color-border); }
.btn-act.secondary:hover:not(:disabled) { background: var(--color-border); }
.btn-act:disabled { opacity: 0.4; cursor: not-allowed; }
.output { background: var(--color-card); border: 1px solid var(--color-border); border-radius: 8px; padding: 1.5rem; line-height: 1.8; }
.output p { margin: 0 0 1rem; }
.output p:last-child { margin-bottom: 0; }
</style>
