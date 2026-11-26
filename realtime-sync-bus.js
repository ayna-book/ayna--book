// AYNA BOOK — Real-Time Cross-Tab & Signal Sync Bus (realtime-sync-bus.js)
class AynaRealtimeBus {
  constructor(channelName = "ayna_book_live_bus_v1") {
    this.channelName = channelName;
    this.channel = "BroadcastChannel" in window ? new BroadcastChannel(channelName) : null;
    this.subscribers = new Map();
    this._bindTransport();
  }

  _bindTransport() {
    if (this.channel) {
      this.channel.onmessage = event => {
        const msg = event?.data;
        if (msg && msg.type) this._dispatch(msg.type, msg.payload, msg.sentAt);
      };
    }

    window.addEventListener("storage", event => {
      if (event.key !== this.channelName || !event.newValue) return;
      try {
        const msg = JSON.parse(event.newValue);
        if (msg && msg.type) this._dispatch(msg.type, msg.payload, msg.sentAt);
      } catch (_) {}
    });
  }

  _dispatch(type, payload, sentAt) {
    const fns = this.subscribers.get(type) || [];
    fns.forEach(fn => {
      try { fn(payload, sentAt); } catch (_) {}
    });
  }

  publish(type, payload = {}) {
    const packet = {
      type,
      payload,
      sentAt: new Date().toISOString()
    };

    // বর্তমান ট্যাবেও তাৎক্ষণিক জানানো
    this._dispatch(type, payload, packet.sentAt);

    if (this.channel) {
      try { this.channel.postMessage(packet); } catch (_) {}
    }

    try {
      localStorage.setItem(this.channelName, JSON.stringify(packet));
    } catch (_) {}

    return packet;
  }

  subscribe(type, handler) {
    if (!type || typeof handler !== "function") return () => {};
    if (!this.subscribers.has(type)) this.subscribers.set(type, []);
    this.subscribers.get(type).push(handler);

    return () => {
      const list = this.subscribers.get(type) || [];
      this.subscribers.set(type, list.filter(fn => fn !== handler));
    };
  }
}

window.aynaBus = new AynaRealtimeBus();