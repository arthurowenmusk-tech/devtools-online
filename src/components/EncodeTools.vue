<template>
  <div class="encode-tools">
    <div class="tabs">
      <button :class="{ active: tab === 'base64' }" @click="tab='base64'">Base64</button>
      <button :class="{ active: tab === 'url' }" @click="tab='url'">URL Encode</button>
    </div>
    <div class="tool-row">
      <div class="panel">
        <div class="panel-header"><label>{{ tab==='base64' ? 'Text / Base64' : 'Text / URL' }}</label><button class="btn-sm" @click="input='';output=''">Clear</button></div>
        <textarea v-model="input" :placeholder="tab==='base64' ? 'Enter text or Base64 string...' : 'Enter text or URL-encoded string...'" spellcheck="false"></textarea>
      </div>
      <div class="btn-col">
        <button class="btn-act" @click="tab==='base64' ? encode64() : encodeUrl()">{{ tab==='base64' ? 'Encode →' : 'Encode →' }}</button>
        <button class="btn-act secondary" @click="tab==='base64' ? decode64() : decodeUrl()">{{ tab==='base64' ? '← Decode' : '← Decode' }}</button>
      </div>
      <div class="panel">
        <div class="panel-header"><label>Output</label><button class="btn-sm" @click="copyOut" :disabled="!output">Copy</button></div>
        <textarea v-model="output" readonly placeholder="Result..." spellcheck="false"></textarea>
      </div>
    </div>
    <div v-if="error" class="err">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const tab = ref('base64');
const input = ref('');
const output = ref('');
const error = ref('');

function encode64() { try { error.value=''; output.value = btoa(unescape(encodeURIComponent(input.value))); } catch(e) { error.value = 'Encoding failed: '+e.message; } }
function decode64() { try { error.value=''; output.value = decodeURIComponent(escape(atob(input.value.trim()))); } catch(e) { error.value = 'Invalid Base64 string'; } }
function encodeUrl() { error.value=''; output.value = encodeURIComponent(input.value); }
function decodeUrl() { try { error.value=''; output.value = decodeURIComponent(input.value); } catch(e) { error.value='Invalid URL encoding'; } }
async function copyOut() { try { await navigator.clipboard.writeText(output.value); } catch { const t=document.createElement('textarea');t.value=output.value;document.body.appendChild(t);t.select();document.execCommand('copy');document.body.removeChild(t); } }
</script>

<style scoped>
.encode-tools { max-width: 100%; }
.tabs { display: flex; gap: 0; margin-bottom: 1.5rem; border: 1px solid var(--color-border); border-radius: 6px; overflow: hidden; width: fit-content; }
.tabs button { padding: 0.5rem 1.2rem; border: none; background: var(--color-card); cursor: pointer; font-size: 0.9rem; font-weight: 500; color: var(--color-muted); }
.tabs button.active { background: var(--color-accent); color: white; }
.tabs button:not(:last-child) { border-right: 1px solid var(--color-border); }
.tool-row { display: grid; grid-template-columns: 1fr auto 1fr; gap: 1rem; align-items: start; }
@media (max-width: 768px) { .tool-row { grid-template-columns: 1fr; } }
.panel { display: flex; flex-direction: column; }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.panel-header label { font-weight: 600; font-size: 0.9rem; }
textarea { width: 100%; min-height: 250px; padding: 1rem; border: 1px solid var(--color-border); border-radius: 8px; font-family: 'Fira Code',monospace; font-size: 0.9rem; line-height: 1.6; resize: vertical; background: var(--color-card); }
textarea:focus { outline: none; border-color: var(--color-accent); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
.btn-col { display: flex; flex-direction: column; gap: 0.5rem; align-items: center; padding-top: 1.8rem; }
.btn-act { padding: 0.6rem 1.8rem; background: var(--color-accent); color: white; border: none; border-radius: 6px; font-size: 0.95rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
.btn-act:hover { background: var(--color-accent-hover); }
.btn-act.secondary { background: var(--color-card); color: var(--color-text); border: 1px solid var(--color-border); }
.btn-act.secondary:hover { background: var(--color-border); }
.btn-sm { padding: 0.3rem 0.7rem; background: var(--color-card); border: 1px solid var(--color-border); border-radius: 4px; font-size: 0.8rem; cursor: pointer; }
.btn-sm:hover:not(:disabled) { background: var(--color-border); }
.btn-sm:disabled { opacity: 0.4; cursor: not-allowed; }
.err { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 0.75rem 1rem; border-radius: 6px; margin-top: 1rem; font-size: 0.9rem; }
</style>
