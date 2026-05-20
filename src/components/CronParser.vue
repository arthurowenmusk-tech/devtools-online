<template>
  <div class="cron">
    <div class="field"><label>Cron Expression</label>
      <div class="input-row"><input v-model="expr" placeholder="e.g. */5 * * * *" @input="parse"><button class="btn-sm" v-for="p in presets" :key="p.v" @click="expr=p.v;parse()">{{ p.label }}</button></div>
    </div>
    <div v-if="parsed" class="result">
      <div class="desc">{{ parsed.description }}</div>
      <div class="field-detail"><span class="fl">Minute</span><code>{{ parsed.fields.minute }}</code></div>
      <div class="field-detail"><span class="fl">Hour</span><code>{{ parsed.fields.hour }}</code></div>
      <div class="field-detail"><span class="fl">Day</span><code>{{ parsed.fields.day }}</code></div>
      <div class="field-detail"><span class="fl">Month</span><code>{{ parsed.fields.month }}</code></div>
      <div class="field-detail"><span class="fl">Weekday</span><code>{{ parsed.fields.weekday }}</code></div>
      <h3>Next 5 runs</h3>
      <div v-for="(t,i) in parsed.nextRuns" :key="i" class="next">{{ t.toLocaleString() }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const expr = ref('*/15 * * * *');
const presets = [{label:'Every 5 min',v:'*/5 * * * *'},{label:'Every hour',v:'0 * * * *'},{label:'Daily midnight',v:'0 0 * * *'},{label:'Weekly Mon',v:'0 9 * * 1'}];
const parsed = ref(null);

const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function parseField(f, min, max, names) {
  if(f==='*') return { values:[], desc:'every' };
  const vals=[];
  let desc='';
  const parts = f.split(',');
  for(const p of parts) {
    if(p.includes('/')) { const [range,step]=p.split('/'); const [start,end]=range==='*'?[min,max]:range.split('-').map(Number); const stepNum=+step; for(let i=+start;i<=end;i+=stepNum) vals.push(i); desc=`every ${stepNum}`+(range==='*'?'':` from ${names?names[start]:start} to ${names?names[end]:end}`); }
    else if(p.includes('-')) { const [s,e]=p.split('-').map(Number); for(let i=s;i<=e;i++) vals.push(i); desc=`${names?names[s]:s} to ${names?names[e]:e}`; }
    else { const n=+p; vals.push(n); desc=(desc?desc+', ':'')+(names?names[n]:n); }
  }
  return { values: vals.slice(0,5), desc };
}

function parse() {
  const parts = expr.value.trim().split(/\s+/);
  if(parts.length < 5) { parsed.value = null; return; }
  parsed.value = {
    fields: {
      minute: parseField(parts[0],0,59),
      hour: parseField(parts[1],0,23),
      day: parseField(parts[2],1,31),
      month: parseField(parts[3],1,12,MONTHS),
      weekday: parseField(parts[4],0,6,DAYS),
    },
    description: `Runs ${buildDesc(parts)}`,
    nextRuns: calcNext(parts),
  };
}

function buildDesc(p) {
  const mm=p[0]==='*'?'every minute':`at minute ${p[0]}`;
  const hh=p[1]==='*'?'':p[0]==='*'?`past every hour`:`past hour ${p[1]}`;
  return [mm,hh].filter(Boolean).join(', ');
}

function calcNext(p, count=5) {
  const runs=[];
  let d=new Date(); d.setSeconds(0,0); d.setMinutes(d.getMinutes()+1);
  const limits = [[0,59],[0,23],[1,31],[1,12],[0,6]];
  for(let n=0;n<200&&runs.length<count;n++) {
    const parts=[d.getMinutes(),d.getHours(),d.getDate(),d.getMonth()+1,d.getDay()];
    let ok=true;
    for(let i=0;i<5;i++) { if(p[i]!=='*' && !matchesField(p[i],parts[i])) { ok=false; break; } }
    if(ok) runs.push(new Date(d));
    d.setMinutes(d.getMinutes()+1);
  }
  return runs;
}

function matchesField(field, val) {
  for(const part of field.split(',')) {
    if(part.includes('/')) { const [range,step]=part.split('/'); const [start,end]=range==='*'?[0,59]:range.split('-').map(Number); const s=+step; for(let i=+start;i<=end;i+=s) if(i===val) return true; }
    else if(part.includes('-')) { const [s,e]=part.split('-').map(Number); if(val>=s&&val<=e) return true; }
    else if(+part===val) return true;
  }
  return false;
}

parse();
</script>

<style scoped>
.cron { max-width: 700px; }
.field { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
.field label { font-weight: 600; font-size: 0.9rem; }
.input-row { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }
.input-row input { flex: 1; min-width: 200px; padding: 0.6rem 0.8rem; border: 1px solid var(--color-border); border-radius: 8px; font-family: 'Fira Code',monospace; font-size: 1rem; }
.input-row input:focus { outline: none; border-color: var(--color-accent); }
.btn-sm { padding: 0.3rem 0.7rem; background: var(--color-card); border: 1px solid var(--color-border); border-radius: 4px; font-size: 0.8rem; cursor: pointer; white-space: nowrap; }
.btn-sm:hover { background: var(--color-border); }
.result { background: var(--color-card); border: 1px solid var(--color-border); border-radius: 8px; padding: 1rem 1.2rem; }
.desc { font-weight: 600; font-size: 1rem; margin-bottom: 1rem; }
.field-detail { display: flex; justify-content: space-between; align-items: center; padding: 0.3rem 0; }
.fl { color: var(--color-muted); font-size: 0.85rem; min-width: 60px; }
.field-detail code { font-family: 'Fira Code',monospace; font-size: 0.85rem; }
.result h3 { font-size: 0.9rem; margin: 1rem 0 0.5rem; }
.next { font-family: 'Fira Code',monospace; font-size: 0.85rem; padding: 0.2rem 0; color: var(--color-muted); }
</style>
