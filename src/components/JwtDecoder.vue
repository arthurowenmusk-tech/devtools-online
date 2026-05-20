<template>
  <div class="jwt">
    <textarea v-model="input" placeholder="Paste JWT token here... (eyJhbGciOi...)" spellcheck="false"></textarea>
    <button class="btn-act" @click="decode" :disabled="!input.trim()">🔍 Decode JWT</button>
    <div v-if="error" class="err">{{ error }}</div>
    <div v-if="parts" class="result">
      <div class="part">
        <h3>Header</h3>
        <pre>{{ parts.header }}</pre>
      </div>
      <div class="part">
        <h3>Payload</h3>
        <pre>{{ parts.payload }}</pre>
        <div v-if="claims" class="claims">
          <div v-if="claims.exp" :class="['claim-badge', claims.exp>Date.now()/1000?'ok':'warn']">
            {{ claims.exp>Date.now()/1000 ? '✅' : '⚠️' }} Expires: {{ new Date(claims.exp*1000).toLocaleString() }}
          </div>
          <div v-if="claims.iat" class="claim-badge ok">📅 Issued: {{ new Date(claims.iat*1000).toLocaleString() }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const input = ref('');
const parts = ref(null);
const claims = ref(null);
const error = ref('');

function decode() {
  error.value = ''; parts.value = null; claims.value = null;
  try {
    const segs = input.value.trim().split('.');
    if (segs.length !== 3) throw new Error('Invalid JWT: must have 3 parts separated by dots');
    const header = JSON.parse(atob(segs[0]));
    const payload = JSON.parse(atob(segs[1]));
    parts.value = {
      header: JSON.stringify(header, null, 2),
      payload: JSON.stringify(payload, null, 2),
    };
    if (payload.exp || payload.iat || payload.nbf) claims.value = payload;
  } catch(e) { error.value = 'Invalid JWT: ' + e.message; }
}
</script>

<style scoped>
.jwt { max-width: 800px; }
textarea { width: 100%; min-height: 100px; padding: 1rem; border: 1px solid var(--color-border); border-radius: 8px; font-family: 'Fira Code',monospace; font-size: 0.85rem; line-height: 1.6; resize: vertical; background: var(--color-card); margin-bottom: 1rem; }
textarea:focus { outline: none; border-color: var(--color-accent); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
.btn-act { padding: 0.6rem 1.5rem; background: var(--color-accent); color: white; border: none; border-radius: 6px; font-size: 0.95rem; font-weight: 600; cursor: pointer; }
.btn-act:hover:not(:disabled) { background: var(--color-accent-hover); }
.btn-act:disabled { opacity: 0.5; cursor: not-allowed; }
.err { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 0.75rem 1rem; border-radius: 6px; margin-top: 1rem; }
.result { margin-top: 1.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
@media (max-width: 600px) { .result { grid-template-columns: 1fr; } }
.part { background: var(--color-card); border: 1px solid var(--color-border); border-radius: 8px; padding: 1rem; }
.part h3 { margin: 0 0 0.75rem; font-size: 0.95rem; }
.part pre { white-space: pre-wrap; word-break: break-all; font-family: 'Fira Code',monospace; font-size: 0.8rem; line-height: 1.5; margin: 0; }
.claims { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; }
.claim-badge { padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.8rem; }
.claim-badge.ok { background: #f0fdf4; color: #166534; }
.claim-badge.warn { background: #fef2f2; color: #991b1b; }
</style>
