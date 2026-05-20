<template>
  <div class="color">
    <div class="picker-row">
      <input type="color" v-model="hex" @input="fromHex" class="color-picker">
      <div class="inputs">
        <div class="field"><label>HEX</label><input v-model="hex" @input="fromHex" placeholder="#ff0000"></div>
        <div class="field"><label>RGB</label><input v-model="rgbStr" @input="fromRgb" placeholder="255, 0, 0"></div>
        <div class="field"><label>HSL</label><input v-model="hslStr" @input="fromHsl" placeholder="0, 100%, 50%"></div>
      </div>
    </div>
    <div class="preview" :style="{ background: hex }"></div>
    <div class="values">
      <div class="val-card" v-for="v in vals" :key="v.label">
        <span class="v-label">{{ v.label }}</span>
        <code>{{ v.value }}</code>
        <button class="btn-sm" @click="copyVal(v.value)">Copy</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const hex = ref('#2563eb');
const rgbStr = ref('37, 99, 235');
const hslStr = ref('221, 83%, 53%');
const vals = ref([]);

function updateVals() { vals.value = [{label:'HEX',value:hex.value},{label:'RGB',value:`rgb(${rgbStr.value})`},{label:'HSL',value:`hsl(${hslStr.value})`}]; }
function fromHex() { const h=hex.value.replace(/^#/,''); if(h.length!==6) return; const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16); rgbStr.value=`${r}, ${g}, ${b}`; const [hs,hl]=rgb2hsl(r,g,b); hslStr.value=`${hs}, ${hl}%, ${Math.round((r*0.299+g*0.587+b*0.114)/2.55)}%`; updateVals(); }
function fromRgb() { const m=rgbStr.value.match(/(\d+)[,\s]+(\d+)[,\s]+(\d+)/); if(!m) return; const r=+m[1],g=+m[2],b=+m[3]; hex.value='#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join(''); const [hs,hl]=rgb2hsl(r,g,b); hslStr.value=`${hs}, ${hl}%, ${Math.round((r*0.299+g*0.587+b*0.114)/2.55)}%`; updateVals(); }
function fromHsl() { const m=hslStr.value.match(/(\d+)[,\s]+(\d+)%?[,\s]+(\d+)%?/); if(!m) return; const h=+m[1],s=+m[2]/100,l=+m[3]/100; const [r,g,b]=hsl2rgb(h,s,l); hex.value='#'+[r,g,b].map(v=>Math.round(v).toString(16).padStart(2,'0')).join(''); rgbStr.value=`${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}`; updateVals(); }
function rgb2hsl(r,g,b) { r/=255;g/=255;b/=255; const mx=Math.max(r,g,b),mn=Math.min(r,g,b); let h=0,s=0; const l=(mx+mn)/2; if(mx!==mn){ const d=mx-mn; s=l>0.5?d/(2-mx-mn):d/(mx+mn); if(mx===r) h=((g-b)/d+(g<b?6:0))/6; else if(mx===g) h=((b-r)/d+2)/6; else h=((r-g)/d+4)/6; } return [Math.round(h*360),Math.round(s*100)]; }
function hsl2rgb(h,s,l) { h/=360; const hue2rgb=(p,q,t)=>{ if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p; }; if(s===0) return [l*255,l*255,l*255]; const q=l<0.5?l*(1+s):l+s-l*s, p=2*l-q; return [hue2rgb(p,q,h+1/3)*255,hue2rgb(p,q,h)*255,hue2rgb(p,q,h-1/3)*255]; }
async function copyVal(v) { try { await navigator.clipboard.writeText(v); } catch {} }
updateVals();
</script>

<style scoped>
.color { max-width: 700px; }
.picker-row { display: flex; gap: 1.5rem; align-items: flex-start; flex-wrap: wrap; margin-bottom: 1.5rem; }
.color-picker { width: 80px; height: 80px; border: none; border-radius: 8px; cursor: pointer; }
.inputs { flex: 1; display: flex; flex-direction: column; gap: 0.6rem; }
.field { display: flex; align-items: center; gap: 0.75rem; }
.field label { font-weight: 600; font-size: 0.85rem; min-width: 36px; color: var(--color-muted); }
.field input { flex: 1; padding: 0.5rem 0.75rem; border: 1px solid var(--color-border); border-radius: 6px; font-family: 'Fira Code',monospace; font-size: 0.9rem; }
.field input:focus { outline: none; border-color: var(--color-accent); }
.preview { height: 80px; border-radius: 8px; margin-bottom: 1.5rem; }
.values { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.75rem; }
.val-card { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 0.8rem; background: var(--color-card); border: 1px solid var(--color-border); border-radius: 6px; }
.v-label { font-weight: 600; font-size: 0.8rem; color: var(--color-muted); min-width: 30px; }
.val-card code { font-family: 'Fira Code',monospace; font-size: 0.85rem; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.btn-sm { padding: 0.2rem 0.6rem; background: var(--color-bg); border: 1px solid var(--color-border); border-radius: 4px; font-size: 0.75rem; cursor: pointer; }
.btn-sm:hover { background: var(--color-border); }
</style>
