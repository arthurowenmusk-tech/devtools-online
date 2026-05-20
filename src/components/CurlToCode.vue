<template>
  <div class="curl">
    <textarea v-model="input" placeholder="Paste cURL command here... e.g.&#10;curl -X POST https://api.example.com/data -H 'Content-Type: application/json' -d '{&quot;key&quot;:&quot;value&quot;}'" spellcheck="false"></textarea>
    <div class="langs">
      <button v-for="l in langs" :key="l" :class="{ active: lang===l }" @click="lang=l">{{ l }}</button>
    </div>
    <div v-if="output" class="output-wrap">
      <pre><code>{{ output }}</code></pre>
      <button class="btn-act" @click="copyOut" :disabled="!output">Copy</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
const input = ref('');
const langs = ['Python','JavaScript','Go','Java','PHP','Ruby','Rust'];
const lang = ref('Python');
const output = ref('');

watch([input, lang], () => {
  if (!input.value.trim()) { output.value = ''; return; }
  const cmd = input.value.trim();
  let method='GET', url='', headers={}, body='';
  let inData=false, dataStr='';
  
  // Simple parser
  const tokens = cmd.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
  for (let i=0; i<tokens.length; i++) {
    const t = tokens[i].replace(/^["']|["']$/g,'');
    if (t === 'curl') continue;
    if (t === '-X' || t === '--request') { method = tokens[++i]?.replace(/^["']|["']$/g,'') || method; continue; }
    if (t === '-H' || t === '--header') { const h = tokens[++i]?.replace(/^["']|["']$/g,'') || ''; const [k,v] = h.split(/:\s*/); if(k&&v) headers[k]=v; continue; }
    if (t === '-d' || t === '--data' || t === '--data-raw') { inData=true; continue; }
    if (inData) { dataStr = t; body = dataStr; method = method==='GET' ? 'POST' : method; inData=false; continue; }
    if (t.startsWith('http')) { url = t; continue; }
  }

  const hdrStr = Object.entries(headers).map(([k,v])=>`"${k}": "${v}"`).join(',\n    ');

  let code='';
  if (lang.value==='Python') {
    code=`import requests\n\nresponse = requests.${method.toLowerCase()}("${url}"${hdrStr?',\n    headers={\n    '+hdrStr+'\n}':''}${body?',\n    data='+"'''"+body+"'''":''})\nprint(response.status_code)\nprint(response.text)`;
  } else if (lang.value==='JavaScript') {
    code=`fetch("${url}", {\n  method: "${method}"${hdrStr?',\n  headers: {\n    '+hdrStr+'\n  }':''}${body?',\n  body: '+JSON.stringify(body):''}\n}).then(r => r.json()).then(console.log);`;
  } else if (lang.value==='Go') {
    code=`package main\n\nimport (\n\t"fmt"\n\t"io"\n\t"net/http"\n\t"strings"\n)\n\nfunc main() {\n\treq, _ := http.NewRequest("${method}", "${url}"${body?', strings.NewReader(`'+body+'`)':', nil'})\n${Object.entries(headers).map(([k,v])=>'\treq.Header.Set("'+k+'", "'+v+'")').join('\n')}\n\tresp, _ := http.DefaultClient.Do(req)\n\tbody, _ := io.ReadAll(resp.Body)\n\tfmt.Println(string(body))\n}`;
  } else {
    code = `// ${lang.value} — coming soon. Try Python, JavaScript, or Go.`;
  }
  output.value = code;
});

async function copyOut() { try { await navigator.clipboard.writeText(output.value); } catch {} }
</script>

<style scoped>
.curl { max-width: 800px; }
textarea { width: 100%; min-height: 100px; padding: 1rem; border: 1px solid var(--color-border); border-radius: 8px; font-family: 'Fira Code',monospace; font-size: 0.85rem; line-height: 1.6; resize: vertical; background: var(--color-card); margin-bottom: 1rem; }
textarea:focus { outline: none; border-color: var(--color-accent); }
.langs { display: flex; gap: 0; margin-bottom: 1rem; border: 1px solid var(--color-border); border-radius: 6px; overflow: hidden; width: fit-content; flex-wrap: wrap; }
.langs button { padding: 0.4rem 0.9rem; border: none; background: var(--color-card); cursor: pointer; font-size: 0.85rem; font-weight: 500; color: var(--color-muted); }
.langs button.active { background: var(--color-accent); color: white; }
.langs button:not(:last-child) { border-right: 1px solid var(--color-border); }
.output-wrap { position: relative; }
.output-wrap pre { background: #1e1e2e; color: #cdd6f4; padding: 1.2rem; border-radius: 8px; overflow-x: auto; }
.output-wrap code { font-family: 'Fira Code',monospace; font-size: 0.85rem; line-height: 1.6; white-space: pre; }
.btn-act { position: absolute; top: 0.5rem; right: 0.5rem; padding: 0.4rem 0.9rem; background: var(--color-accent); color: white; border: none; border-radius: 4px; font-size: 0.8rem; cursor: pointer; }
.btn-act:hover:not(:disabled) { background: var(--color-accent-hover); }
.btn-act:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
