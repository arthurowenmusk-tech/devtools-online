<template>
  <div class="regex">
    <div class="row">
      <div class="field"><label>Pattern</label><input v-model="pattern" placeholder="e.g. \\d{4}-\\d{2}-\\d{2}" @input="test"><span class="delim">/</span></div>
      <div class="flags"><label v-for="f in flags" :key="f"><input type="checkbox" :value="f" v-model="activeFlags" @change="test">{{ f }}</label></div>
    </div>
    <div class="field"><label>Test String</label><textarea v-model="text" placeholder="Enter text to test against..." spellcheck="false" @input="test"></textarea></div>
    <div v-if="matchResult" class="matches">
      <template v-if="matchResult.length">
        <h3>{{ matchResult.length }} match(es)</h3>
        <div v-for="(m,i) in matchResult" :key="i" class="match-row">
          <span class="idx">[{{ i }}]</span>
          <code class="match-text">{{ m[0] }}</code>
          <span v-if="m.index !== undefined" class="pos">at {{ m.index }}</span>
        </div>
      </template>
      <div v-else class="no-match">No matches</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const pattern = ref('');
const text = ref('');
const flags = ['g','i','m','s','u'];
const activeFlags = ref(['g']);
const matchResult = ref(null);

function test() {
  if (!pattern.value || !text.value) { matchResult.value = null; return; }
  try {
    const f = activeFlags.value.join('');
    const re = new RegExp(pattern.value, f);
    const all = [...text.value.matchAll(re)];
    matchResult.value = all;
  } catch(e) { matchResult.value = null; }
}
</script>

<style scoped>
.regex { max-width: 100%; }
.row { display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap; margin-bottom: 1rem; }
.field { display: flex; flex-direction: column; gap: 0.3rem; flex: 1; min-width: 200px; }
.field label { font-weight: 600; font-size: 0.85rem; color: var(--color-muted); }
.field input, .field textarea { padding: 0.6rem 0.8rem; border: 1px solid var(--color-border); border-radius: 8px; font-family: 'Fira Code',monospace; font-size: 0.9rem; width: 100%; }
.field textarea { min-height: 150px; resize: vertical; background: var(--color-card); }
.field input:focus, .field textarea:focus { outline: none; border-color: var(--color-accent); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
.delim { font-family: 'Fira Code',monospace; font-size: 1.2rem; color: var(--color-muted); padding: 0 0.5rem; align-self: center; margin-top: 0.3rem; }
.flags { display: flex; gap: 0.5rem; padding-bottom: 0.6rem; }
.flags label { font-size: 0.85rem; font-family: 'Fira Code',monospace; color: var(--color-muted); cursor: pointer; display: flex; align-items: center; gap: 0.2rem; }
.matches { margin-top: 1rem; }
.matches h3 { font-size: 0.95rem; margin-bottom: 0.75rem; }
.match-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.4rem 0.8rem; background: var(--color-card); border: 1px solid var(--color-border); border-radius: 4px; margin-bottom: 0.3rem; }
.idx { color: var(--color-muted); font-size: 0.8rem; font-family: 'Fira Code',monospace; }
.match-text { font-family: 'Fira Code',monospace; font-size: 0.85rem; background: #dbeafe; padding: 0.1rem 0.4rem; border-radius: 3px; }
.pos { color: var(--color-muted); font-size: 0.75rem; margin-left: auto; }
.no-match { text-align: center; color: var(--color-muted); padding: 2rem; }
</style>
