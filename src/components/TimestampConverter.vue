<template>
  <div class="ts-conv">
    <div class="tabs">
      <button :class="{ active: tab==='toDate' }" @click="tab='toDate'">Timestamp → Date</button>
      <button :class="{ active: tab==='toTs' }" @click="tab='toTs'">Date → Timestamp</button>
    </div>
    <div class="convert-area">
      <div v-if="tab==='toDate'" class="panel">
        <label>Unix Timestamp</label>
        <input v-model="ts" type="number" placeholder="e.g. 1700000000" @input="convTs">
        <div v-if="result" class="result">{{ result }}</div>
      </div>
      <div v-else class="panel">
        <label>Date &amp; Time</label>
        <input v-model="dt" type="datetime-local" @input="convDt">
        <div v-if="result" class="result">{{ result }}</div>
        <div class="now">Current: {{ Date.now() }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const tab = ref('toDate');
const ts = ref('');
const dt = ref('');
const result = ref('');

function convTs() {
  if (!ts.value) { result.value=''; return; }
  const d = new Date(Number(ts.value) * 1000);
  if (isNaN(d.getTime())) { result.value = 'Invalid timestamp'; return; }
  result.value = `${d.toLocaleString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',timeZoneName:'short'})}
UTC: ${d.toISOString()}`;
}
function convDt() {
  if (!dt.value) { result.value=''; return; }
  const d = new Date(dt.value);
  const ms = d.getTime();
  result.value = `Seconds: ${Math.floor(ms/1000)}
Milliseconds: ${ms}
ISO 8601: ${d.toISOString()}`;
}
</script>

<style scoped>
.ts-conv { max-width: 600px; }
.tabs { display: flex; gap: 0; margin-bottom: 1.5rem; border: 1px solid var(--color-border); border-radius: 6px; overflow: hidden; width: fit-content; }
.tabs button { padding: 0.5rem 1.2rem; border: none; background: var(--color-card); cursor: pointer; font-size: 0.9rem; font-weight: 500; color: var(--color-muted); }
.tabs button.active { background: var(--color-accent); color: white; }
.panel { display: flex; flex-direction: column; gap: 0.75rem; }
.panel label { font-weight: 600; font-size: 0.9rem; }
input { padding: 0.75rem 1rem; border: 1px solid var(--color-border); border-radius: 8px; font-family: 'Fira Code',monospace; font-size: 1rem; width: 100%; }
input:focus { outline: none; border-color: var(--color-accent); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
.result { padding: 1rem; background: var(--color-card); border: 1px solid var(--color-border); border-radius: 8px; font-family: 'Fira Code',monospace; font-size: 0.9rem; line-height: 1.8; white-space: pre-wrap; }
.now { color: var(--color-muted); font-size: 0.8rem; font-family: 'Fira Code',monospace; margin-top: 0.5rem; }
</style>
