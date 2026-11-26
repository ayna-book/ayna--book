// AYNA BOOK — Persistent Local Vault Module (storage-vault.js)
class AynaStorageVault {
  constructor(namespace = "ayna_vault_v1") {
    this.namespace = namespace;
  }

  _readAll() {
    try {
      const raw = localStorage.getItem(this.namespace);
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  }

  _writeAll(obj) {
    try {
      localStorage.setItem(this.namespace, JSON.stringify(obj));
      return true;
    } catch (_) {
      return false;
    }
  }

  saveItem(bucket, item) {
    const store = this._readAll();
    if (!Array.isArray(store[bucket])) store[bucket] = [];
    store[bucket].unshift({
      ...item,
      savedAt: new Date().toISOString()
    });
    store[bucket] = store[bucket].slice(0, 100);
    return this._writeAll(store);
  }

  getItems(bucket) {
    const store = this._readAll();
    return Array.isArray(store[bucket]) ? store[bucket] : [];
  }

  clearBucket(bucket) {
    const store = this._readAll();
    delete store[bucket];
    return this._writeAll(store);
  }
}

window.aynaVault = new AynaStorageVault();