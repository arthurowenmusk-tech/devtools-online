<template>
  <div class="hash-gen">
    <div class="tabs">
      <button v-for="a in algos" :key="a" :class="{ active: algo === a }" @click="algo=a;hash()">{{ a }}</button>
    </div>
    <div class="tool-row">
      <div class="panel">
        <div class="panel-header"><label>Input</label><button class="btn-sm" @click="input='';output=''">Clear</button></div>
        <textarea v-model="input" placeholder="Enter text to hash..." spellcheck="false" @input="hash"></textarea>
      </div>
      <div class="panel">
        <div class="panel-header"><label>{{ algo }} Hash</label><button class="btn-sm" @click="copyOut" :disabled="!output">Copy</button></div>
        <textarea v-model="output" readonly placeholder="Hash output..." spellcheck="false"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const algos = ['MD5','SHA-1','SHA-256','SHA-384','SHA-512'];
const algo = ref('SHA-256');
const input = ref('');
const output = ref('');

async function hash() {
  if (!input.value) { output.value = ''; return; }
  const enc = new TextEncoder();
  const data = enc.encode(input.value);
  const buf = await crypto.subtle.digest(algo.value.replace('-','-').toUpperCase(), data);
  output.value = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}
async function copyOut() { try { await navigator.clipboard.writeText(output.value); } catch { const t=document.createElement('textarea');t.value=output.value;document.body.appendChild(t);t.select();document.execCommand('copy');document.body.removeChild(t); } }
</script>

<style scoped>
.hash-gen { max-width: 100%; }
.tabs { display: flex; gap: 0; margin-bottom: 1.5rem; border: 1px solid var(--color-border); border-radius: 6px; overflow: hidden; width: fit-content; flex-wrap: wrap; }
.tabs button { padding: 0.5rem 1rem; border: none; background: var(--color-card); cursor: pointer; font-size: 0.85rem; font-weight: 500; color: var(--color-muted); }
.tabs button.active { background: var(--color-accent); color: white; }
.tabs button:not(:last-child) { border-right: 1px solid var(--color-border); }
.tool-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
@media (max-width: 768px) { .tool-row { grid-template-columns: 1fr; } }
.panel { display: flex; flex-direction: column; }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.panel-header label { font-weight: 600; font-size: 0.9rem; }
textarea { width: 100%; min-height: 200px; padding: 1rem; border: 1px solid var(--color-border); border-radius: 8px; font-family: 'Fira Code',monospace; font-size: 0.9rem; line-height: 1.6; resize: vertical; background: var(--color-card); }
textarea:focus { outline: none; border-color: var(--color-accent); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
.btn-sm { padding: 0.3rem 0.7rem; background: var(--color-card); border: 1px solid var(--color-border); border-radius: 4px; font-size: 0.8rem; cursor: pointer; }
.btn-sm:hover:not(:disabled) { background: var(--color-border); }
.btn-sm:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
