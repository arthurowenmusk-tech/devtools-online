<template>
  <div class="uuid">
    <div class="controls">
      <button class="btn-act" @click="generate">🎲 Generate UUID</button>
      <button class="btn-act secondary" @click="bulk">Generate 10</button>
      <label class="opt"><input type="checkbox" v-model="uppercase"> Uppercase</label>
    </div>
    <div v-if="uuids.length" class="results">
      <div v-for="(u,i) in uuids" :key="i" class="uuid-row">
        <code>{{ u }}</code>
        <button class="btn-sm" @click="copyOne(u)">Copy</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const uppercase = ref(false);
const uuids = ref([]);

function gen() { let s='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return (c=='x'?r:(r&0x3|0x8)).toString(16);}); return uppercase.value ? s.toUpperCase() : s; }
function generate() { uuids.value = [gen()]; }
function bulk() { uuids.value = Array.from({length:10},gen); }
async function copyOne(u) { try { await navigator.clipboard.writeText(u); } catch {} }
</script>

<style scoped>
.uuid { max-width: 100%; }
.controls { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; margin-bottom: 1.5rem; }
.btn-act { padding: 0.6rem 1.5rem; background: var(--color-accent); color: white; border: none; border-radius: 6px; font-size: 0.95rem; font-weight: 600; cursor: pointer; }
.btn-act:hover { background: var(--color-accent-hover); }
.btn-act.secondary { background: var(--color-card); color: var(--color-text); border: 1px solid var(--color-border); }
.btn-act.secondary:hover { background: var(--color-border); }
.opt { display: flex; align-items: center; gap: 0.3rem; font-size: 0.85rem; color: var(--color-muted); cursor: pointer; }
.results { display: flex; flex-direction: column; gap: 0.5rem; }
.uuid-row { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 1rem; background: var(--color-card); border: 1px solid var(--color-border); border-radius: 6px; }
.uuid-row code { font-family: 'Fira Code',monospace; font-size: 0.9rem; word-break: break-all; }
.btn-sm { padding: 0.3rem 0.7rem; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 4px; font-size: 0.8rem; cursor: pointer; white-space: nowrap; margin-left: 1rem; }
.btn-sm:hover { background: var(--color-border); }
</style>
