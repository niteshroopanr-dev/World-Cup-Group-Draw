// src/storage-shim.js — localStorage-backed stand-in for the artifact storage API.
// Same async signatures; the `shared` flag is ignored (single device for now).
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    async get(key)        { const v = localStorage.getItem(key); return v === null ? null : { key, value: v }; },
    async set(key, value) { localStorage.setItem(key, String(value)); return { key, value: String(value) }; },
    async delete(key)     { localStorage.removeItem(key); return { key, deleted: true }; },
    async list(prefix="")  { const keys=[]; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k && k.startsWith(prefix)) keys.push(k);} return { keys, prefix }; },
  };
}
