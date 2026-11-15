<!DOCTYPE html>
<html lang="en">
<head><style data-metaai-safe-area>:root { scroll-padding-top: var(--safe-area-scroll-padding-top, 0px); }
[data-safe-area-inset-root]::before {
  background: inherit;
  content: "";
  height: var(--safe-area-inset-top, 0px);
  inset: 0 0 auto;
  pointer-events: none;
  position: fixed;
  z-index: 2147483647;
}
</style><script data-metaai-safe-area-runtime>// (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.

(() => {
  const params = new URLSearchParams(window.location.search);
  const rawInset = params.get('top_inset_px');
  const parsedInset = rawInset !== null && /^\d+$/.test(rawInset)
    ? Number(rawInset)
    : 0;
  const topInset = params.get('has_top_banner') === '1'
    ? Math.min(parsedInset, 256)
    : 0;
  document.documentElement.style.setProperty('--safe-area-inset-top', `${topInset}px`);
  document.documentElement.style.setProperty('--safe-area-scroll-padding-top', `${topInset}px`);

  function observeNavigation() {
    const root = document.getElementById('root');
    if (root === null) return;
    const observed = new Set();
    let scheduled = false;

    function syncScrollPadding() {
      const elements = new Set(root.querySelectorAll('[data-safe-area-sticky-top]'));
      for (const element of observed) {
        if (!elements.has(element)) {
          resizeObserver.unobserve(element);
          observed.delete(element);
        }
      }
      for (const element of elements) {
        if (!observed.has(element)) {
          resizeObserver.observe(element);
          observed.add(element);
        }
      }
      let padding = topInset;
      for (const element of elements) {
        const style = window.getComputedStyle(element);
        if (style.position !== 'sticky' && style.position !== 'fixed') continue;
        const top = Number.parseFloat(style.top);
        if (Number.isFinite(top)) {
          padding = Math.max(padding, top + element.getBoundingClientRect().height);
        }
      }
      document.documentElement.style.setProperty(
        '--safe-area-scroll-padding-top', `${Math.ceil(padding)}px`,
      );
    }

    function scheduleUpdate() {
      if (scheduled) return;
      scheduled = true;
      queueMicrotask(() => {
        scheduled = false;
        syncScrollPadding();
      });
    }

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    const mutationObserver = new MutationObserver(scheduleUpdate);
    mutationObserver.observe(root, {
      attributeFilter: ['class', 'data-safe-area-sticky-top', 'hidden', 'style'],
      attributes: true,
      childList: true,
      subtree: true,
    });
    window.addEventListener('resize', scheduleUpdate);
    scheduleUpdate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeNavigation, {once: true});
  } else {
    observeNavigation();
  }
})();
</script><script data-metaai-records-guard>// (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.

// When the records API rejects a write because the app is at its record
// limit, this page answers the next writes itself with the same rejection.
// The answers come after a delay, under an exponential backoff, and one probe
// write goes to the network per backoff window. A new record that the API
// accepts, or a delete that removes a record, ends the backoff. The backoff
// also ends when a write comes 60 s or more after the last window, and no probe
// from the last 60 s is in flight. The state is in memory only.
//
// The compiled-HTML contract checks (`stateful_crud_contract.rs` and
// `stateful_hosted_release.rs`) read this file as part of the app. So it must
// not contain a quoted records action, a browser storage API, the JSON request
// header or encoder, a quoted POST method, a collection argument, or a name
// bound to a quoted word. It must also not call a network function with a
// quoted URL.
(() => {
  const nativeFetch = window.fetch;
  if (typeof nativeFetch !== 'function') return;
  const NativeRequest = window.Request;
  const NativeResponse = window.Response;
  const NativeURL = window.URL;
  const NativePromise = window.Promise;
  const parseJson = JSON.parse;
  const reflectApply = Reflect.apply;
  const startTimer = window.setTimeout.bind(window);
  const stopTimer = window.clearTimeout.bind(window);
  const monotonicNow = window.performance.now.bind(window.performance);

  const CAPACITY_STATUS = 409;
  const CAPACITY_BODY = '{"error":"artifact record limit reached"}';
  const FIRST_WINDOW_MS = 1000;
  const MAX_WINDOW_MS = 60000;
  const LOCAL_ANSWER_DELAY_MS = 500;
  const MAX_TRACKED_RECORDS = 2048;
  const actionName = operation => ['records', operation].join('.');
  const CREATE = actionName('create');
  const PUT = actionName('put');
  const GET = actionName('get');
  const LIST = actionName('list');
  const DELETE = actionName('delete');
  const OBSERVED_ACTIONS = [CREATE, PUT, GET, LIST, DELETE];
  const POST_METHOD = ['PO', 'ST'].join('');
  const LOCAL_HEADERS = [
    [['content', 'type'].join('-'), ['application', 'json'].join('/') + '; charset=utf-8'],
    ['cache-control', 'no-store'],
    ['x-metaai-records-guard', 'capacity'],
  ];

  // `epoch` changes when a window opens or closes. A rejected or accepted write
  // that was sent in an earlier epoch does not change the window, so the writes
  // that were in flight when the limit was reached count as one rejection.
  let streak = 0;
  let windowEndsAt = 0;
  let epoch = 0;
  let activeProbe = null;
  const knownIds = new Set();
  const knownKeys = new Map();

  function recordKey(collection, value) {
    return `${collection}\n${value}`;
  }

  function rememberId(collection, id) {
    if (typeof id !== 'string') return;
    const key = recordKey(collection, id);
    knownIds.delete(key);
    knownIds.add(key);
    if (knownIds.size > MAX_TRACKED_RECORDS) knownIds.delete(knownIds.values().next().value);
  }

  // `savedId` is null when the outcome of the write is unknown. Then the key
  // keeps the id that an earlier answer saved.
  function rememberIdempotencyKey(collection, idempotencyKey, savedId) {
    if (typeof idempotencyKey !== 'string') return;
    const key = recordKey(collection, idempotencyKey);
    const id = savedId ?? knownKeys.get(key) ?? null;
    knownKeys.delete(key);
    knownKeys.set(key, id);
    if (knownKeys.size > MAX_TRACKED_RECORDS) knownKeys.delete(knownKeys.keys().next().value);
  }

  function forgetRecord(savedId) {
    knownIds.delete(savedId);
    for (const [idempotencyKey, keySavedId] of knownKeys) {
      if (keySavedId === savedId) knownKeys.delete(idempotencyKey);
    }
  }

  function forgetId(collection, id) {
    if (typeof id === 'string') forgetRecord(recordKey(collection, id));
  }

  function targetsActions(input, init) {
    const isRequest = input instanceof NativeRequest;
    const method = init?.method ?? (isRequest ? input.method : 'GET');
    if (String(method).toUpperCase() !== POST_METHOD) return false;
    const base = window.location.href;
    const url = isRequest ? input.url : String(input);
    return new NativeURL(url, base).href === new NativeURL('actions', base).href;
  }

  // Returns the body text, a promise of it for a Request body, or null when
  // the body cannot be JSON text.
  function requestBody(input, init) {
    const body = init?.body;
    if (body !== undefined && body !== null) return typeof body === 'string' ? body : null;
    return input instanceof NativeRequest ? input.clone().text() : null;
  }

  function requestSignal(input, init) {
    if (init !== undefined && init !== null && init.signal !== undefined) return init.signal;
    return input instanceof NativeRequest ? input.signal : null;
  }

  function parseAction(text) {
    let payload;
    try {
      payload = parseJson(text);
    } catch {
      return null;
    }
    if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) return null;
    const name = payload.action;
    if (!OBSERVED_ACTIONS.includes(name)) return null;
    const args = payload.args ?? {};
    if (typeof args !== 'object' || Array.isArray(args)) return null;
    const collection = args.collection ?? 'items';
    if (typeof collection !== 'string') return null;
    return {name, args, collection};
  }

  function isWrite(action) {
    return action.name === CREATE || action.name === PUT;
  }

  // The records API accepts these writes at the limit when their record
  // exists: a create that replays a known idempotency key, and a put to a known
  // record. A key or id is known when this page saw its record saved, or sent
  // it in a write whose outcome is unknown.
  function mayStillSucceed(action) {
    if (action.name === CREATE) {
      const idempotencyKey = action.args.idempotency_key;
      return typeof idempotencyKey === 'string'
        && knownKeys.has(recordKey(action.collection, idempotencyKey));
    }
    const id = action.args.id;
    return typeof id === 'string' && knownIds.has(recordKey(action.collection, id));
  }

  function rememberUnknownOutcome(action) {
    if (action.name === CREATE) {
      rememberIdempotencyKey(action.collection, action.args.idempotency_key, null);
    } else {
      rememberId(action.collection, action.args.id);
    }
  }

  // The API rejects a known key or id for capacity only when its record does
  // not exist.
  function revokeExemption(action) {
    if (action.name === PUT) {
      forgetId(action.collection, action.args.id);
      return;
    }
    const key = recordKey(action.collection, action.args.idempotency_key);
    const savedId = knownKeys.get(key);
    knownKeys.delete(key);
    if (typeof savedId === 'string') forgetRecord(savedId);
  }

  // A probe that never settles stops holding writes back after the longest
  // window.
  function windowIsOpen(time) {
    if (time < windowEndsAt) return true;
    return activeProbe !== null && time - activeProbe.startedAt < MAX_WINDOW_MS;
  }

  function openWindow(sentEpoch) {
    if (sentEpoch !== epoch) return;
    streak += 1;
    windowEndsAt = monotonicNow() + Math.min(MAX_WINDOW_MS, FIRST_WINDOW_MS * 2 ** (streak - 1));
    epoch += 1;
  }

  function closeWindow() {
    if (streak === 0) return;
    streak = 0;
    windowEndsAt = 0;
    activeProbe = null;
    epoch += 1;
  }

  // The delay keeps an awaited retry loop from running on every microtask.
  function answerLocally(signal) {
    return new NativePromise((resolve, reject) => {
      if (signal?.aborted) {
        reject(signal.reason);
        return;
      }
      let timer = 0;
      const abort = () => {
        stopTimer(timer);
        reject(signal.reason);
      };
      timer = startTimer(() => {
        signal?.removeEventListener('abort', abort);
        resolve(new NativeResponse(CAPACITY_BODY, {status: CAPACITY_STATUS, headers: LOCAL_HEADERS}));
      }, LOCAL_ANSWER_DELAY_MS);
      signal?.addEventListener('abort', abort, {once: true});
    });
  }

  function responseData(text) {
    try {
      const payload = parseJson(text);
      return payload !== null && typeof payload === 'object' ? payload.data : undefined;
    } catch {
      return undefined;
    }
  }

  function track(action, data) {
    const collection = action.collection;
    switch (action.name) {
      case LIST:
        if (Array.isArray(data?.records)) {
          for (const record of data.records) rememberId(collection, record?.id);
        }
        return;
      case DELETE:
        if (data === true) {
          forgetId(collection, action.args.id);
          closeWindow();
        }
        return;
      case CREATE:
        if (typeof data?.id === 'string') {
          rememberIdempotencyKey(collection, action.args.idempotency_key, recordKey(collection, data.id));
        }
        rememberId(collection, data?.id);
        return;
      default:
        rememberId(collection, data?.id);
    }
  }

  async function observe(action, response, sent) {
    try {
      const status = response.status;
      const succeeded = status >= 200 && status < 300;
      // A write that the API accepts only below the limit proves free space.
      if (succeeded && isWrite(action) && !sent.mayStillSucceed && sent.epoch === epoch) {
        closeWindow();
      }
      const capacityCandidate = status === CAPACITY_STATUS && isWrite(action);
      if (!succeeded && !capacityCandidate) return;
      const text = await response.clone().text();
      if (succeeded) {
        track(action, responseData(text));
      } else if (text === CAPACITY_BODY) {
        if (sent.mayStillSucceed) revokeExemption(action);
        openWindow(sent.epoch);
      }
    } finally {
      if (sent.probe !== null && activeProbe === sent.probe) activeProbe = null;
    }
  }

  function handle(action, send, signal) {
    if (action === null) return send();
    const sent = {epoch, mayStillSucceed: false, probe: null};
    if (isWrite(action)) {
      sent.mayStillSucceed = mayStillSucceed(action);
      if (streak > 0 && !sent.mayStillSucceed) {
        const time = monotonicNow();
        if (windowIsOpen(time)) return answerLocally(signal);
        if (time - windowEndsAt < MAX_WINDOW_MS) {
          activeProbe = {startedAt: time};
          sent.probe = activeProbe;
        } else {
          // Another client or the agent can free space where this page cannot
          // see it. So after a quiet period the write goes out as a normal write.
          closeWindow();
          sent.epoch = epoch;
        }
      }
    }
    return send().then(
      response => observe(action, response, sent).then(() => response, () => response),
      error => {
        if (sent.probe !== null && activeProbe === sent.probe) activeProbe = null;
        // A write that fails or is aborted after it is sent can still save its
        // record.
        if (isWrite(action)) rememberUnknownOutcome(action);
        throw error;
      },
    );
  }

  function guardedFetch(input, init) {
    const self = this;
    const args = arguments;
    const send = () => reflectApply(nativeFetch, self, args);
    let body;
    let signal;
    try {
      if (!targetsActions(input, init)) return send();
      body = requestBody(input, init);
      signal = requestSignal(input, init);
    } catch {
      return send();
    }
    if (body === null) return send();
    if (typeof body === 'string') return handle(parseAction(body), send, signal);
    return body.then(text => handle(parseAction(text), send, signal), () => send());
  }

  try {
    window.fetch = guardedFetch;
  } catch {
    // A page that made the network function read-only keeps its own function.
  }
})();
</script><script data-metaai-app-links>(()=>{var W=Object.defineProperty;var o=(t,n)=>W(t,"name",{value:n,configurable:!0});(()=>{const t=window.open,n=window.fetch,r=HTMLAnchorElement.prototype.click,i=Event.prototype.preventDefault,c=Event.prototype.stopPropagation,f=Event.prototype.stopImmediatePropagation,a=Object.getOwnPropertyDescriptor(Event.prototype,"defaultPrevented").get,u=Object.getOwnPropertyDescriptor(Event.prototype,"cancelBubble"),h="/__metaai/blobs/",x=4e3,g=new WeakMap,E=new WeakSet,s=[];let l=null,b=null,m=null,d=null;function p(t){if(typeof t!="string"||t.trim()==="")return null;let e;try{e=new URL(t,document.baseURI)}catch{return null}return(e.protocol==="http:"||e.protocol==="https:")&&e.origin===window.location.origin?e:null}o(p,"sameAppUrl");function k(t){const e=t.trim(),n=e.toLowerCase();return n===""||n==="_self"||n==="_parent"||n==="_top"?!1:![...document.getElementsByName(e)].some(t=>/^(IFRAME|OBJECT|EMBED)$/.test(t.tagName))}o(k,"opensNewContext");function T(t){return/^\/(__metaai|api|assets)\//.test(t.pathname)}o(T,"isFileRoute");function M(t){const e=new URL(window.location.href);return t.hash!==""&&!/^#!?\//.test(t.hash)&&t.pathname===e.pathname&&t.search===e.search}o(M,"samePage");function R(t){return(t.querySelector("img[alt]")?.getAttribute("alt")||t.getAttribute("aria-label")||t.textContent||"").trim().slice(0,200)}o(R,"labelFor");function y(t,e){const n=document.createElement(t);return n.style.cssText=e,n}o(y,"styled");function P(t){const e=Uint8Array.from(atob(t.replace(/-/g,"+").replace(/_/g,"/")),t=>t.charCodeAt(0));return new TextDecoder("utf-8",{fatal:!0}).decode(e)}o(P,"textOf");function S(t){let e={disposition:t.searchParams.get("disposition")};try{const n=t.searchParams.get("token");n&&t.pathname.startsWith(h)&&(e=JSON.parse(P(n.split(".")[0]))||e)}catch{}return e.disposition==="attachment"}o(S,"isAttachment");function D(){try{const t=document.querySelectorAll(":modal");return t[t.length-1]||document.body}catch{return document.body}}o(D,"layerHost");function H(t,e){d===null&&(d=y("div","position:fixed;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;"),d.setAttribute("role","status"),d.setAttribute("data-metaai-link-status","")),d.parentNode!==e&&e.append(d);const n=d;n.textContent="",window.setTimeout(()=>{n.textContent=t},100)}o(H,"announce");function N(){b?.remove();const t=D();m?.isConnected||(m=document.createElement("style"),m.textContent="[data-metaai-link-note]::backdrop{display:none!important;background:none!important;backdrop-filter:none!important}",(document.head||document.documentElement).append(m));const e="This app cannot open its pages in a new tab.",n=y("div","position:fixed;inset:auto 16px calc(var(--safe-area-inset-bottom, 0px) + 24px);z-index:2147483647;box-sizing:border-box;width:auto;height:auto;max-width:360px;margin:0 auto;padding:12px 16px;border:0;border-radius:10px;background:rgba(17,17,17,0.92);color:#fff;font:400 14px/1.4 system-ui,sans-serif;text-align:center;overflow:visible;pointer-events:none;");n.setAttribute("data-metaai-link-note",""),n.setAttribute("aria-hidden","true"),n.textContent=e;const r=typeof n.showPopover=="function";r&&n.setAttribute("popover","manual"),t.append(n),r&&n.showPopover(),b=n,H(e,t),window.setTimeout(()=>{n.remove(),b===n&&(b=null)},x)}o(N,"showNote");function O(t){for(const e of t)if(!(!(e instanceof Element)||e===document.body||!e.isConnected||typeof e.focus!="function")&&(e.focus({preventScroll:!0}),document.activeElement===e))return}o(O,"focusBack");function w(){if(l===null)return;const{root:t,opener:e,before:n}=l;l=null,t.open&&t.close(),t.remove(),O([e,n,...s.slice().reverse()])}o(w,"closeViewer");function A(t,e,n){const r=document.activeElement;w();const c=typeof HTMLDialogElement=="function"&&typeof HTMLDialogElement.prototype.showModal=="function",f="var(--safe-area-inset-top, 0px)",a=y(c?"dialog":"div",`position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;box-sizing:border-box;width:100%;height:100%;max-width:none;max-height:none;margin:0;border:0;padding:calc(${f} + 68px) 16px 24px;background:rgba(0,0,0,0.88);color:#fff;overflow:hidden;overscroll-behavior:contain;pointer-events:auto;`);a.setAttribute("data-metaai-file-viewer",""),a.setAttribute("aria-label",e||"File"),c||(a.setAttribute("role","dialog"),a.setAttribute("aria-modal","true"));const u=y("button",`position:absolute;top:calc(${f} + 12px);right:12px;width:44px;height:44px;padding:0;border:0;border-radius:22px;background:rgba(255,255,255,0.18);color:#fff;font:400 28px/44px system-ui,sans-serif;cursor:pointer;pointer-events:auto;`);u.type="button",u.textContent="\xD7",u.setAttribute("aria-label","Close"),u.setAttribute("data-metaai-file-viewer-close","");const h=y("img","display:block;flex:0 1 auto;min-height:0;max-width:100%;max-height:100%;object-fit:contain;border-radius:4px;");h.alt=e,h.addEventListener("error",()=>{const t=y("p","margin:0;font:400 15px/1.4 system-ui,sans-serif;text-align:center;");t.textContent="This file cannot be shown here.",h.replaceWith(t)},{once:!0}),h.src=t,a.append(u,h),a.addEventListener("cancel",t=>{Reflect.apply(i,t,[]),l?.root===a&&w()}),a.addEventListener("close",()=>{l?.root===a&&w()}),l={root:a,opener:n,before:r},document.body.append(a),c&&a.showModal(),u.focus({preventScroll:!0})}o(A,"showViewer");function F(t,e,r){const i=new AbortController;Reflect.apply(n,window,[t.href,{signal:i.signal}]).then(n=>{i.abort(),n.ok?window.location.assign(t.href):A(t.href,e,r)},()=>A(t.href,e,r))}o(F,"download");function C(t,e,n){T(t)?S(t)?F(t,e,n):A(t.href,e,n):M(t)?window.location.hash=t.hash:N()}o(C,"openOutside");function _(n,r){let i=null,c=0,f=n.href;const a=o(e=>{try{const n=p(String(e));if(n===null){i!==null&&l===i&&w(),i=null,c=0,Reflect.apply(t,window,[String(e)]);return}const a=l;C(n,"",r),i=l!==a?l:null,c=i===null?Date.now()+x:0,f=n.href}catch{}},"go"),u={get href(){return f},set href(t){a(t)},assign:a,replace:a,reload(){},toString:o(()=>f,"toString")};return a(n.href),{opener:null,get closed(){return i!==null?l!==i:Date.now()>=c},get location(){return u},set location(t){a(t)},focus(){},blur(){},close(){i!==null&&l===i&&w(),i=null,c=0},postMessage(){},addEventListener(){},removeEventListener(){}}}o(_,"standIn");function B(t){if(l===null)return!1;const e=t.relatedTarget;return t.composedPath().includes(l.root)||e instanceof Node&&l.root.contains(e)}o(B,"insideViewer");function I(t){const e=[...l.root.querySelectorAll("button, a[href]")],n=e.indexOf(document.activeElement);(t.shiftKey?e[n<=0?e.length-1:n-1]:e[n<0||n===e.length-1?0:n+1])?.focus()}o(I,"moveFocus");function U(t){try{if(l!==null&&!l.root.isConnected&&(l=null),l===null){t.type==="focusin"&&t.target instanceof Element&&s[s.length-1]!==t.target&&(s.push(t.target),s.length>5&&s.shift());return}if(t.type==="keydown"&&(t.key==="Escape"||t.key==="Tab")){Reflect.apply(i,t,[]),Reflect.apply(f,t,[]),t.key==="Escape"?w():I(t);return}if(!B(t)||(Reflect.apply(f,t,[]),t.type!=="click"))return;if(t.detail>1){Reflect.apply(i,t,[]);return}const e=t.target;(e===l.root||e instanceof Element&&e.closest("[data-metaai-file-viewer-close]"))&&w()}catch{}}o(U,"shield");function $(t,e){return t instanceof HTMLInputElement?/^(checkbox|radio|file|color)$/.test(t.type)||/^(submit|reset|image)$/.test(t.type)&&t.form!==null:t instanceof HTMLButtonElement?t.type!=="button"&&t.form!==null:t instanceof HTMLLabelElement?t.control!==null&&!t.control.contains(e):t instanceof HTMLMediaElement?t.controls:t instanceof HTMLElement&&t.tagName==="SUMMARY"&&t.parentElement?.tagName==="DETAILS"}o($,"ownClickAction");function j(t){for(const e of t){if(e instanceof Element&&e.matches("a[href], area[href]"))return e;if($(e,t[0]))return null}return null}o(j,"anchorFor");function V(t){const e=g.get(t);if(!(e===void 0||e.held)){g.delete(t);try{if(e.host.removeEventListener(t.type,e.last),Reflect.apply(a,t,[]))return;e.done=!0,Reflect.apply(i,t,[]),C(e.url,e.label,e.opener)}catch{}}}o(V,"decide");function z(t){const e=g.get(t);if(e!==void 0){g.delete(t);try{e.host.removeEventListener(t.type,e.last),e.held&&!e.appCancelled&&C(e.url,e.label,e.opener)}catch{}}}o(z,"settle");function K(t,n){const r=[];for(const i of t)try{const t=i[n];if(typeof t!="function"||E.has(t))continue;const c=o(function(...e){const n=Reflect.apply(t,this,e),r=n===!1?g.get(e[0]):void 0;return r&&(r.appCancelled=!0),n},"wrapper");E.add(c),i[n]=c,r.push(()=>{i[n]===c&&(i[n]=t)})}catch{}return()=>r.forEach(t=>t())}o(K,"watchHandlers");function L(t,n,r,h,x,E){const s={url:n,label:r,opener:h,host:x,held:!1,done:!1,appCancelled:!1,last:null};s.last=e=>{e===t&&V(t)},g.set(t,s),x.addEventListener(t.type,s.last);const l=K(E,`on${t.type}`),b=o(()=>{l(),z(t)},"end");window.setTimeout(b,0);const m=o(()=>{s.held||s.done||g.get(t)!==s||(s.held=!0,Reflect.apply(a,t,[])?s.appCancelled=!0:Reflect.apply(i,t,[]))},"hold"),d=o(t=>s.held||s.done?s.appCancelled:Reflect.apply(a,t,[]),"appView"),p=o((e,n)=>Object.defineProperty(t,e,{configurable:!0,...n}),"define");return p("stopPropagation",{writable:!0,value(){return m(),Reflect.apply(c,this,arguments)}}),p("stopImmediatePropagation",{writable:!0,value(){return m(),Reflect.apply(f,this,arguments)}}),p("preventDefault",{writable:!0,value(){return s.appCancelled=!0,Reflect.apply(i,this,arguments)}}),p("defaultPrevented",{get(){return d(this)}}),p("returnValue",{get(){return!d(this)},set(t){t||(s.appCancelled=!0,Reflect.apply(i,this,[]))}}),u?.get&&u.set&&p("cancelBubble",{get(){return Reflect.apply(u.get,this,[])},set(t){t&&m(),Reflect.apply(u.set,this,[t])}}),b}o(L,"track");function v(t){try{if(!t.cancelable||t.button!==(t.type==="auxclick"?1:0))return;const e=t.composedPath(),n=j(e);if(!n||n.hasAttribute("download")||n.isContentEditable||!t.bubbles&&e[0]!==n)return;const r=p(n.getAttribute("href"));if(r===null)return;(t.type==="auxclick"||t.ctrlKey||t.metaKey||t.shiftKey||k(n.getAttribute("target")||""))&&L(t,r,R(n),n,t.bubbles?window:n,e)}catch{}}o(v,"remember");try{for(const t of["pointerdown","pointerup","mousedown","mouseup","touchstart","touchend","click","auxclick","dblclick","focusin","focusout","keydown","keyup"])window.addEventListener(t,U,!0);window.addEventListener("click",v,!0),window.addEventListener("auxclick",v,!0),window.open=o(function(n,r){try{const t=r==null?"":String(r);if(t.trim()===""||k(t)){const t=p(n==null?"":String(n));if(t!==null)return _(t,document.activeElement)}}catch{}return Reflect.apply(t,this,arguments)},"open"),HTMLAnchorElement.prototype.click=o(function(){try{if(!this.isConnected&&!this.hasAttribute("download")){const t=p(this.getAttribute("href"));if(t!==null&&k(this.getAttribute("target")||"")){const e=new MouseEvent("click",{bubbles:!0,cancelable:!0,composed:!0,view:window}),n=[];for(let t=this;t!==null;t=t.parentNode)n.push(t);const r=L(e,t,R(this),document.activeElement,this.getRootNode(),n);this.dispatchEvent(e),r();return}}}catch{}return Reflect.apply(r,this,arguments)},"click")}catch{}})();})();
</script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>React Artifact</title>
  <script>(function installDevicePermissionRuntime() {
  if (window.parent === window)
    return;
  let parentOrigin;
  try {
    const embeddingOrigin = window.location.ancestorOrigins?.[0] || document.referrer, { hostname, origin, port, protocol } = new URL(embeddingOrigin), supportedHost = hostname === "meta.ai" || hostname === "ecto1.ai" || [".meta.ai", ".ecto1.ai", ".internalfb.com", ".hatch.club"].some((suffix) => hostname.endsWith(suffix));
    if (hostname === "localhost" && (protocol === "http:" || protocol === "https:") || protocol === "https:" && port === "" && supportedHost)
      parentOrigin = origin;
  } catch {
    return;
  }
  if (!parentOrigin)
    return;
  function request(capability) {
    try {
      const policy = document.permissionsPolicy || document.featurePolicy;
      if (navigator.userActivation?.isActive === !0 && policy?.allowsFeature(capability) === !1)
        window.parent.postMessage({ type: "ecto:artifact-device-permission-request", version: 1, capability }, parentOrigin);
    } catch {}
  }
  function hasAudio(constraints) {
    for (let value = constraints;value != null; value = Object.getPrototypeOf(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, "audio");
      if (descriptor)
        return Boolean(descriptor.value);
    }
    return !1;
  }
  function wrap(receiver, name, capability, enabled) {
    try {
      if ((document.permissionsPolicy || document.featurePolicy)?.allowsFeature(capability) !== !1)
        return;
      const native = receiver?.[name];
      if (typeof native !== "function")
        return;
      receiver[name] = function() {
        try {
          if (this === receiver && enabled(arguments))
            request(capability);
        } catch {}
        return Reflect.apply(native, this, arguments);
      };
    } catch {}
  }
  wrap(navigator.mediaDevices, "getUserMedia", "microphone", (args) => hasAudio(args[0]));
  const hasPositionCallback = (args) => typeof args[0] === "function";
  wrap(navigator.geolocation, "getCurrentPosition", "geolocation", hasPositionCallback);
  wrap(navigator.geolocation, "watchPosition", "geolocation", hasPositionCallback);
})();</script>
  <style>@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap');

*, ::before, ::after{
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

::backdrop{
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x:  ;
  --tw-pan-y:  ;
  --tw-pinch-zoom:  ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position:  ;
  --tw-gradient-via-position:  ;
  --tw-gradient-to-position:  ;
  --tw-ordinal:  ;
  --tw-slashed-zero:  ;
  --tw-numeric-figure:  ;
  --tw-numeric-spacing:  ;
  --tw-numeric-fraction:  ;
  --tw-ring-inset:  ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgb(59 130 246 / 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur:  ;
  --tw-brightness:  ;
  --tw-contrast:  ;
  --tw-grayscale:  ;
  --tw-hue-rotate:  ;
  --tw-invert:  ;
  --tw-saturate:  ;
  --tw-sepia:  ;
  --tw-drop-shadow:  ;
  --tw-backdrop-blur:  ;
  --tw-backdrop-brightness:  ;
  --tw-backdrop-contrast:  ;
  --tw-backdrop-grayscale:  ;
  --tw-backdrop-hue-rotate:  ;
  --tw-backdrop-invert:  ;
  --tw-backdrop-opacity:  ;
  --tw-backdrop-saturate:  ;
  --tw-backdrop-sepia:  ;
  --tw-contain-size:  ;
  --tw-contain-layout:  ;
  --tw-contain-paint:  ;
  --tw-contain-style:  ;
}

/*
! tailwindcss v3.4.18 | MIT License | https://tailwindcss.com
*/

/*
1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)
2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)
*/

*,
::before,
::after {
  box-sizing: border-box;
  /* 1 */
  border-width: 0;
  /* 2 */
  border-style: solid;
  /* 2 */
  border-color: #e5e7eb;
  /* 2 */
}

::before,
::after {
  --tw-content: '';
}

/*
1. Use a consistent sensible line-height in all browsers.
2. Prevent adjustments of font size after orientation changes in iOS.
3. Use a more readable tab size.
4. Use the user's configured `sans` font-family by default.
5. Use the user's configured `sans` font-feature-settings by default.
6. Use the user's configured `sans` font-variation-settings by default.
7. Disable tap highlights on iOS
*/

html,
:host {
  line-height: 1.5;
  /* 1 */
  -webkit-text-size-adjust: 100%;
  /* 2 */
  -moz-tab-size: 4;
  /* 3 */
  -o-tab-size: 4;
     tab-size: 4;
  /* 3 */
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  /* 4 */
  font-feature-settings: normal;
  /* 5 */
  font-variation-settings: normal;
  /* 6 */
  -webkit-tap-highlight-color: transparent;
  /* 7 */
}

/*
1. Remove the margin in all browsers.
2. Inherit line-height from `html` so users can set them as a class directly on the `html` element.
*/

body {
  margin: 0;
  /* 1 */
  line-height: inherit;
  /* 2 */
}

/*
1. Add the correct height in Firefox.
2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)
3. Ensure horizontal rules are visible by default.
*/

hr {
  height: 0;
  /* 1 */
  color: inherit;
  /* 2 */
  border-top-width: 1px;
  /* 3 */
}

/*
Add the correct text decoration in Chrome, Edge, and Safari.
*/

abbr:where([title]) {
  -webkit-text-decoration: underline dotted;
          text-decoration: underline dotted;
}

/*
Remove the default font size and weight for headings.
*/

h1,
h2,
h3,
h4,
h5,
h6 {
  font-size: inherit;
  font-weight: inherit;
}

/*
Reset links to optimize for opt-in styling instead of opt-out.
*/

a {
  color: inherit;
  text-decoration: inherit;
}

/*
Add the correct font weight in Edge and Safari.
*/

b,
strong {
  font-weight: bolder;
}

/*
1. Use the user's configured `mono` font-family by default.
2. Use the user's configured `mono` font-feature-settings by default.
3. Use the user's configured `mono` font-variation-settings by default.
4. Correct the odd `em` font sizing in all browsers.
*/

code,
kbd,
samp,
pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  /* 1 */
  font-feature-settings: normal;
  /* 2 */
  font-variation-settings: normal;
  /* 3 */
  font-size: 1em;
  /* 4 */
}

/*
Add the correct font size in all browsers.
*/

small {
  font-size: 80%;
}

/*
Prevent `sub` and `sup` elements from affecting the line height in all browsers.
*/

sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

/*
1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)
2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)
3. Remove gaps between table borders by default.
*/

table {
  text-indent: 0;
  /* 1 */
  border-color: inherit;
  /* 2 */
  border-collapse: collapse;
  /* 3 */
}

/*
1. Change the font styles in all browsers.
2. Remove the margin in Firefox and Safari.
3. Remove default padding in all browsers.
*/

button,
input,
optgroup,
select,
textarea {
  font-family: inherit;
  /* 1 */
  font-feature-settings: inherit;
  /* 1 */
  font-variation-settings: inherit;
  /* 1 */
  font-size: 100%;
  /* 1 */
  font-weight: inherit;
  /* 1 */
  line-height: inherit;
  /* 1 */
  letter-spacing: inherit;
  /* 1 */
  color: inherit;
  /* 1 */
  margin: 0;
  /* 2 */
  padding: 0;
  /* 3 */
}

/*
Remove the inheritance of text transform in Edge and Firefox.
*/

button,
select {
  text-transform: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Remove default button styles.
*/

button,
input:where([type='button']),
input:where([type='reset']),
input:where([type='submit']) {
  -webkit-appearance: button;
  /* 1 */
  background-color: transparent;
  /* 2 */
  background-image: none;
  /* 2 */
}

/*
Use the modern Firefox focus style for all focusable elements.
*/

:-moz-focusring {
  outline: auto;
}

/*
Remove the additional `:invalid` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)
*/

:-moz-ui-invalid {
  box-shadow: none;
}

/*
Add the correct vertical alignment in Chrome and Firefox.
*/

progress {
  vertical-align: baseline;
}

/*
Correct the cursor style of increment and decrement buttons in Safari.
*/

::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}

/*
1. Correct the odd appearance in Chrome and Safari.
2. Correct the outline style in Safari.
*/

[type='search'] {
  -webkit-appearance: textfield;
  /* 1 */
  outline-offset: -2px;
  /* 2 */
}

/*
Remove the inner padding in Chrome and Safari on macOS.
*/

::-webkit-search-decoration {
  -webkit-appearance: none;
}

/*
1. Correct the inability to style clickable types in iOS and Safari.
2. Change font properties to `inherit` in Safari.
*/

::-webkit-file-upload-button {
  -webkit-appearance: button;
  /* 1 */
  font: inherit;
  /* 2 */
}

/*
Add the correct display in Chrome and Safari.
*/

summary {
  display: list-item;
}

/*
Removes the default spacing and border for appropriate elements.
*/

blockquote,
dl,
dd,
h1,
h2,
h3,
h4,
h5,
h6,
hr,
figure,
p,
pre {
  margin: 0;
}

fieldset {
  margin: 0;
  padding: 0;
}

legend {
  padding: 0;
}

ol,
ul,
menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

/*
Reset default styling for dialogs.
*/

dialog {
  padding: 0;
}

/*
Prevent resizing textareas horizontally by default.
*/

textarea {
  resize: vertical;
}

/*
1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)
2. Set the default placeholder color to the user's configured gray 400 color.
*/

input::-moz-placeholder, textarea::-moz-placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

input::placeholder,
textarea::placeholder {
  opacity: 1;
  /* 1 */
  color: #9ca3af;
  /* 2 */
}

/*
Set the default cursor for buttons.
*/

button,
[role="button"] {
  cursor: pointer;
}

/*
Make sure disabled buttons don't get the pointer cursor.
*/

:disabled {
  cursor: default;
}

/*
1. Make replaced elements `display: block` by default. (https://github.com/mozdevs/cssremedy/issues/14)
2. Add `vertical-align: middle` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)
   This can trigger a poorly considered lint error in some tools but is included by design.
*/

img,
svg,
video,
canvas,
audio,
iframe,
embed,
object {
  display: block;
  /* 1 */
  vertical-align: middle;
  /* 2 */
}

/*
Constrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)
*/

img,
video {
  max-width: 100%;
  height: auto;
}

/* Make elements with the HTML hidden attribute stay hidden by default */

[hidden]:where(:not([hidden="until-found"])) {
  display: none;
}

.visible{
  visibility: visible;
}

.fixed{
  position: fixed;
}

.absolute{
  position: absolute;
}

.relative{
  position: relative;
}

.sticky{
  position: sticky;
}

.inset-0{
  inset: 0px;
}

.bottom-0{
  bottom: 0px;
}

.bottom-3{
  bottom: 0.75rem;
}

.bottom-4{
  bottom: 1rem;
}

.bottom-\[96px\]{
  bottom: 96px;
}

.left-1\/2{
  left: 50%;
}

.left-3{
  left: 0.75rem;
}

.left-4{
  left: 1rem;
}

.right-2{
  right: 0.5rem;
}

.right-3{
  right: 0.75rem;
}

.right-4{
  right: 1rem;
}

.top-1{
  top: 0.25rem;
}

.top-2{
  top: 0.5rem;
}

.top-3{
  top: 0.75rem;
}

.z-30{
  z-index: 30;
}

.z-40{
  z-index: 40;
}

.z-50{
  z-index: 50;
}

.mx-auto{
  margin-left: auto;
  margin-right: auto;
}

.mb-1\.5{
  margin-bottom: 0.375rem;
}

.mb-2{
  margin-bottom: 0.5rem;
}

.mb-3{
  margin-bottom: 0.75rem;
}

.ml-auto{
  margin-left: auto;
}

.mt-0\.5{
  margin-top: 0.125rem;
}

.mt-1{
  margin-top: 0.25rem;
}

.mt-1\.5{
  margin-top: 0.375rem;
}

.mt-2{
  margin-top: 0.5rem;
}

.mt-3{
  margin-top: 0.75rem;
}

.mt-4{
  margin-top: 1rem;
}

.mt-5{
  margin-top: 1.25rem;
}

.mt-6{
  margin-top: 1.5rem;
}

.line-clamp-2{
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.block{
  display: block;
}

.inline-block{
  display: inline-block;
}

.flex{
  display: flex;
}

.inline-flex{
  display: inline-flex;
}

.hidden{
  display: none;
}

.size-7{
  width: 1.75rem;
  height: 1.75rem;
}

.h-1\.5{
  height: 0.375rem;
}

.h-11{
  height: 2.75rem;
}

.h-12{
  height: 3rem;
}

.h-14{
  height: 3.5rem;
}

.h-16{
  height: 4rem;
}

.h-2{
  height: 0.5rem;
}

.h-3{
  height: 0.75rem;
}

.h-5{
  height: 1.25rem;
}

.h-7{
  height: 1.75rem;
}

.h-9{
  height: 2.25rem;
}

.h-\[118px\]{
  height: 118px;
}

.h-\[180px\]{
  height: 180px;
}

.h-\[220px\]{
  height: 220px;
}

.h-full{
  height: 100%;
}

.min-h-\[100vh\]{
  min-height: 100vh;
}

.w-1\.5{
  width: 0.375rem;
}

.w-11{
  width: 2.75rem;
}

.w-12{
  width: 3rem;
}

.w-14{
  width: 3.5rem;
}

.w-16{
  width: 4rem;
}

.w-2{
  width: 0.5rem;
}

.w-3{
  width: 0.75rem;
}

.w-5{
  width: 1.25rem;
}

.w-9{
  width: 2.25rem;
}

.w-\[220px\]{
  width: 220px;
}

.w-full{
  width: 100%;
}

.min-w-0{
  min-width: 0px;
}

.max-w-\[520px\]{
  max-width: 520px;
}

.max-w-\[92vw\]{
  max-width: 92vw;
}

.max-w-full{
  max-width: 100%;
}

.flex-1{
  flex: 1 1 0%;
}

.shrink-0{
  flex-shrink: 0;
}

.-translate-x-1\/2{
  --tw-translate-x: -50%;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

@keyframes ping{
  75%, 100%{
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping{
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes pulse{
  50%{
    opacity: .5;
  }
}

.animate-pulse{
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.cursor-pointer{
  cursor: pointer;
}

.resize-none{
  resize: none;
}

.flex-col{
  flex-direction: column;
}

.flex-wrap{
  flex-wrap: wrap;
}

.items-start{
  align-items: flex-start;
}

.items-center{
  align-items: center;
}

.justify-center{
  justify-content: center;
}

.justify-between{
  justify-content: space-between;
}

.gap-0\.5{
  gap: 0.125rem;
}

.gap-1{
  gap: 0.25rem;
}

.gap-1\.5{
  gap: 0.375rem;
}

.gap-2{
  gap: 0.5rem;
}

.gap-2\.5{
  gap: 0.625rem;
}

.gap-3{
  gap: 0.75rem;
}

.gap-4{
  gap: 1rem;
}

.overflow-hidden{
  overflow: hidden;
}

.overflow-x-auto{
  overflow-x: auto;
}

.overflow-x-clip{
  overflow-x: clip;
}

.truncate{
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-ellipsis{
  text-overflow: ellipsis;
}

.whitespace-nowrap{
  white-space: nowrap;
}

.break-all{
  word-break: break-all;
}

.rounded-2xl{
  border-radius: 1rem;
}

.rounded-\[20px\]{
  border-radius: 20px;
}

.rounded-\[22px\]{
  border-radius: 22px;
}

.rounded-\[24px\]{
  border-radius: 24px;
}

.rounded-\[26px\]{
  border-radius: 26px;
}

.rounded-full{
  border-radius: 9999px;
}

.rounded-xl{
  border-radius: 0.75rem;
}

.border{
  border-width: 1px;
}

.border-2{
  border-width: 2px;
}

.border-dashed{
  border-style: dashed;
}

.border-red-400\/40{
  border-color: rgb(248 113 113 / 0.4);
}

.border-transparent{
  border-color: transparent;
}

.border-white\/10{
  border-color: rgb(255 255 255 / 0.1);
}

.border-white\/15{
  border-color: rgb(255 255 255 / 0.15);
}

.border-white\/20{
  border-color: rgb(255 255 255 / 0.2);
}

.bg-amber-500{
  --tw-bg-opacity: 1;
  background-color: rgb(245 158 11 / var(--tw-bg-opacity, 1));
}

.bg-black\/40{
  background-color: rgb(0 0 0 / 0.4);
}

.bg-black\/50{
  background-color: rgb(0 0 0 / 0.5);
}

.bg-black\/55{
  background-color: rgb(0 0 0 / 0.55);
}

.bg-emerald-400{
  --tw-bg-opacity: 1;
  background-color: rgb(52 211 153 / var(--tw-bg-opacity, 1));
}

.bg-emerald-500{
  --tw-bg-opacity: 1;
  background-color: rgb(16 185 129 / var(--tw-bg-opacity, 1));
}

.bg-pink-500{
  --tw-bg-opacity: 1;
  background-color: rgb(236 72 153 / var(--tw-bg-opacity, 1));
}

.bg-red-500{
  --tw-bg-opacity: 1;
  background-color: rgb(239 68 68 / var(--tw-bg-opacity, 1));
}

.bg-red-500\/15{
  background-color: rgb(239 68 68 / 0.15);
}

.bg-red-600{
  --tw-bg-opacity: 1;
  background-color: rgb(220 38 38 / var(--tw-bg-opacity, 1));
}

.bg-transparent{
  background-color: transparent;
}

.bg-white{
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity, 1));
}

.bg-white\/10{
  background-color: rgb(255 255 255 / 0.1);
}

.bg-white\/15{
  background-color: rgb(255 255 255 / 0.15);
}

.bg-white\/5{
  background-color: rgb(255 255 255 / 0.05);
}

.p-3\.5{
  padding: 0.875rem;
}

.p-4{
  padding: 1rem;
}

.p-5{
  padding: 1.25rem;
}

.p-6{
  padding: 1.5rem;
}

.p-8{
  padding: 2rem;
}

.px-1{
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}

.px-2{
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.px-2\.5{
  padding-left: 0.625rem;
  padding-right: 0.625rem;
}

.px-3{
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.px-3\.5{
  padding-left: 0.875rem;
  padding-right: 0.875rem;
}

.px-4{
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-0\.5{
  padding-top: 0.125rem;
  padding-bottom: 0.125rem;
}

.py-1{
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

.py-2{
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.py-2\.5{
  padding-top: 0.625rem;
  padding-bottom: 0.625rem;
}

.py-3{
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.py-3\.5{
  padding-top: 0.875rem;
  padding-bottom: 0.875rem;
}

.pb-1{
  padding-bottom: 0.25rem;
}

.pb-3{
  padding-bottom: 0.75rem;
}

.pb-3\.5{
  padding-bottom: 0.875rem;
}

.pb-\[92px\]{
  padding-bottom: 92px;
}

.pt-2{
  padding-top: 0.5rem;
}

.pt-3{
  padding-top: 0.75rem;
}

.text-left{
  text-align: left;
}

.text-center{
  text-align: center;
}

.text-2xl{
  font-size: 1.5rem;
  line-height: 2rem;
}

.text-\[10px\]{
  font-size: 10px;
}

.text-\[11px\]{
  font-size: 11px;
}

.text-\[12px\]{
  font-size: 12px;
}

.text-\[13px\]{
  font-size: 13px;
}

.text-\[14px\]{
  font-size: 14px;
}

.text-\[15px\]{
  font-size: 15px;
}

.text-\[16px\]{
  font-size: 16px;
}

.text-\[20px\]{
  font-size: 20px;
}

.text-\[22px\]{
  font-size: 22px;
}

.text-\[clamp\(24px\2c 7vw\2c 32px\)\]{
  font-size: clamp(24px,7vw,32px);
}

.font-black{
  font-weight: 900;
}

.font-bold{
  font-weight: 700;
}

.font-extrabold{
  font-weight: 800;
}

.font-semibold{
  font-weight: 600;
}

.leading-\[1\.1\]{
  line-height: 1.1;
}

.leading-\[1\.85\]{
  line-height: 1.85;
}

.leading-\[1\.8\]{
  line-height: 1.8;
}

.leading-none{
  line-height: 1;
}

.leading-relaxed{
  line-height: 1.625;
}

.leading-snug{
  line-height: 1.375;
}

.leading-tight{
  line-height: 1.25;
}

.tracking-tight{
  letter-spacing: -0.025em;
}

.tracking-widest{
  letter-spacing: 0.1em;
}

.text-amber-300{
  --tw-text-opacity: 1;
  color: rgb(252 211 77 / var(--tw-text-opacity, 1));
}

.text-black{
  --tw-text-opacity: 1;
  color: rgb(0 0 0 / var(--tw-text-opacity, 1));
}

.text-blue-100\/80{
  color: rgb(219 234 254 / 0.8);
}

.text-blue-200{
  --tw-text-opacity: 1;
  color: rgb(191 219 254 / var(--tw-text-opacity, 1));
}

.text-blue-200\/80{
  color: rgb(191 219 254 / 0.8);
}

.text-emerald-300{
  --tw-text-opacity: 1;
  color: rgb(110 231 183 / var(--tw-text-opacity, 1));
}

.text-emerald-400{
  --tw-text-opacity: 1;
  color: rgb(52 211 153 / var(--tw-text-opacity, 1));
}

.text-pink-300{
  --tw-text-opacity: 1;
  color: rgb(249 168 212 / var(--tw-text-opacity, 1));
}

.text-pink-400{
  --tw-text-opacity: 1;
  color: rgb(244 114 182 / var(--tw-text-opacity, 1));
}

.text-red-200{
  --tw-text-opacity: 1;
  color: rgb(254 202 202 / var(--tw-text-opacity, 1));
}

.text-white{
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity, 1));
}

.text-zinc-300{
  --tw-text-opacity: 1;
  color: rgb(212 212 216 / var(--tw-text-opacity, 1));
}

.text-zinc-400{
  --tw-text-opacity: 1;
  color: rgb(161 161 170 / var(--tw-text-opacity, 1));
}

.text-zinc-500{
  --tw-text-opacity: 1;
  color: rgb(113 113 122 / var(--tw-text-opacity, 1));
}

.text-zinc-600{
  --tw-text-opacity: 1;
  color: rgb(82 82 91 / var(--tw-text-opacity, 1));
}

.accent-pink-500{
  accent-color: #ec4899;
}

.opacity-25{
  opacity: 0.25;
}

.opacity-75{
  opacity: 0.75;
}

.shadow-xl{
  --tw-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color), 0 8px 10px -6px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

.outline-none{
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.filter{
  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);
}

.backdrop-blur{
  --tw-backdrop-blur: blur(8px);
  backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
}

.transition{
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-all{
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

:root{
  --bg:#0a0614;
  --surface:#171026;
  --surface-2:#221739;
  --line:#3b2a5e;
  --pink:#ff2e7e;
  --pink-soft:#ff5c9e;
  --blue:#0f1b3d;
  --blue-2:#16285c;
  --text:#fff7fb;
  --muted:#c9b8dc;
  --muted-2:#9b8bb2;
  --green:#2ee6a8;
  --amber:#ffbe3c;
  --grey:#8b8b9e;
  --safe-area-inset-top: env(safe-area-inset-top, 0px);
}

@media (prefers-color-scheme: dark){
  :root{
    --bg:#0a0614;
    --surface:#171026;
  }
}

*{
  -webkit-tap-highlight-color: transparent;
}

html,body,#root{
  margin:0;
  min-height:100%;
  background:var(--bg);
}

body{
  font-family:'Hind Siliguri','Outfit',system-ui,sans-serif;
  color:var(--text);
}

.font-en{
  font-family:'Outfit','Hind Siliguri',system-ui,sans-serif;
}

.no-scrollbar::-webkit-scrollbar{
  display:none;
}

.no-scrollbar{
  scrollbar-width:none;
}

input,textarea,select{
  font-family:inherit;
}

input[type=range]{
  accent-color:var(--pink);
}

@keyframes pop{
  from{
    transform:translateY(8px);
    opacity:0
  }

  to{
    transform:translateY(0);
    opacity:1
  }
}

.animate-pop{
  animation:pop .22s ease both;
}

@keyframes toastIn{
  from{
    transform:translate(-50%,12px);
    opacity:0
  }

  to{
    transform:translate(-50%,0);
    opacity:1
  }
}

.toast-in{
  animation:toastIn .25s ease both;
}

@keyframes logoStarGlow{
  0%,100%{
    text-shadow:0 0 4px rgba(255,215,0,.9), 0 0 8px rgba(255,190,0,.65);
    box-shadow:0 0 4px rgba(255,215,0,.55);
    transform:scale(1);
    opacity:.9;
  }

  50%{
    text-shadow:0 0 6px rgba(255,235,120,1), 0 0 14px rgba(255,215,0,1), 0 0 22px rgba(255,180,0,.9);
    box-shadow:0 0 10px rgba(255,215,0,.95), 0 0 16px rgba(255,190,0,.65);
    transform:scale(1.18);
    opacity:1;
  }
}

.logo-star{
  animation:logoStarGlow 1.6s ease-in-out infinite;
  border-radius:50%;
}

.placeholder\:text-blue-200\/50::-moz-placeholder{
  color: rgb(191 219 254 / 0.5);
}

.placeholder\:text-blue-200\/50::placeholder{
  color: rgb(191 219 254 / 0.5);
}

.placeholder\:text-zinc-500::-moz-placeholder{
  --tw-text-opacity: 1;
  color: rgb(113 113 122 / var(--tw-text-opacity, 1));
}

.placeholder\:text-zinc-500::placeholder{
  --tw-text-opacity: 1;
  color: rgb(113 113 122 / var(--tw-text-opacity, 1));
}

.focus\:outline-none:focus{
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.disabled\:opacity-60:disabled{
  opacity: 0.6;
}
</style>
</head>
<body>
  <div id="root"></div>
  
  <script type="module">var Dd=Object.create;var{getPrototypeOf:Od,defineProperty:Iu,getOwnPropertyNames:Rd}=Object;var Md=Object.prototype.hasOwnProperty;var Ye=(e,n,t)=>{t=e!=null?Dd(Od(e)):{};let r=n||!e||!e.__esModule?Iu(t,"default",{value:e,enumerable:!0}):t;for(let l of Rd(e))if(!Md.call(r,l))Iu(r,l,{get:()=>e[l],enumerable:!0});return r};var ll=(e,n)=>()=>(n||e((n={exports:{}}).exports,n),n.exports);var Fd=(e,n)=>{for(var t in n)Iu(e,t,{get:n[t],enumerable:!0,configurable:!0,set:(r)=>n[t]=()=>r})};var Ld=(e,n)=>()=>(e&&(n=e(e=0)),n);var Ln=ll((Jd)=>{var Bt=Symbol.for("react.element"),Id=Symbol.for("react.portal"),Ud=Symbol.for("react.fragment"),$d=Symbol.for("react.strict_mode"),Hd=Symbol.for("react.profiler"),Ad=Symbol.for("react.provider"),Wd=Symbol.for("react.context"),Vd=Symbol.for("react.forward_ref"),Qd=Symbol.for("react.suspense"),Bd=Symbol.for("react.memo"),xd=Symbol.for("react.lazy"),ka=Symbol.iterator;function Yd(e){if(e===null||typeof e!=="object")return null;return e=ka&&e[ka]||e["@@iterator"],typeof e==="function"?e:null}var Na={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Pa=Object.assign,Ta={};function rt(e,n,t){this.props=e,this.context=n,this.refs=Ta,this.updater=t||Na}rt.prototype.isReactComponent={};rt.prototype.setState=function(e,n){if(typeof e!=="object"&&typeof e!=="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,n,"setState")};rt.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function za(){}za.prototype=rt.prototype;function $u(e,n,t){this.props=e,this.context=n,this.refs=Ta,this.updater=t||Na}var Hu=$u.prototype=new za;Hu.constructor=$u;Pa(Hu,rt.prototype);Hu.isPureReactComponent=!0;var _a=Array.isArray,Da=Object.prototype.hasOwnProperty,Au={current:null},Oa={key:!0,ref:!0,__self:!0,__source:!0};function Ra(e,n,t){var r,l={},u=null,o=null;if(n!=null)for(r in n.ref!==void 0&&(o=n.ref),n.key!==void 0&&(u=""+n.key),n)Da.call(n,r)&&!Oa.hasOwnProperty(r)&&(l[r]=n[r]);var i=arguments.length-2;if(i===1)l.children=t;else if(1<i){for(var a=Array(i),c=0;c<i;c++)a[c]=arguments[c+2];l.children=a}if(e&&e.defaultProps)for(r in i=e.defaultProps,i)l[r]===void 0&&(l[r]=i[r]);return{$$typeof:Bt,type:e,key:u,ref:o,props:l,_owner:Au.current}}function Kd(e,n){return{$$typeof:Bt,type:e.type,key:n,ref:e.ref,props:e.props,_owner:e._owner}}function Wu(e){return typeof e==="object"&&e!==null&&e.$$typeof===Bt}function Xd(e){var n={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(t){return n[t]})}var Ca=/\/+/g;function Uu(e,n){return typeof e==="object"&&e!==null&&e.key!=null?Xd(""+e.key):n.toString(36)}function ol(e,n,t,r,l){var u=typeof e;if(u==="undefined"||u==="boolean")e=null;var o=!1;if(e===null)o=!0;else switch(u){case"string":case"number":o=!0;break;case"object":switch(e.$$typeof){case Bt:case Id:o=!0}}if(o)return o=e,l=l(o),e=r===""?"."+Uu(o,0):r,_a(l)?(t="",e!=null&&(t=e.replace(Ca,"$&/")+"/"),ol(l,n,t,"",function(c){return c})):l!=null&&(Wu(l)&&(l=Kd(l,t+(!l.key||o&&o.key===l.key?"":(""+l.key).replace(Ca,"$&/")+"/")+e)),n.push(l)),1;if(o=0,r=r===""?".":r+":",_a(e))for(var i=0;i<e.length;i++){u=e[i];var a=r+Uu(u,i);o+=ol(u,n,t,a,l)}else if(a=Yd(e),typeof a==="function")for(e=a.call(e),i=0;!(u=e.next()).done;)u=u.value,a=r+Uu(u,i++),o+=ol(u,n,t,a,l);else if(u==="object")throw n=String(e),Error("Objects are not valid as a React child (found: "+(n==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":n)+"). If you meant to render a collection of children, use an array instead.");return o}function ul(e,n,t){if(e==null)return e;var r=[],l=0;return ol(e,r,"","",function(u){return n.call(t,u,l++)}),r}function Gd(e){if(e._status===-1){var n=e._result;n=n(),n.then(function(t){if(e._status===0||e._status===-1)e._status=1,e._result=t},function(t){if(e._status===0||e._status===-1)e._status=2,e._result=t}),e._status===-1&&(e._status=0,e._result=n)}if(e._status===1)return e._result.default;throw e._result}var fe={current:null},il={transition:null},Zd={ReactCurrentDispatcher:fe,ReactCurrentBatchConfig:il,ReactCurrentOwner:Au};function Ma(){throw Error("act(...) is not supported in production builds of React.")}Jd.Children={map:ul,forEach:function(e,n,t){ul(e,function(){n.apply(this,arguments)},t)},count:function(e){var n=0;return ul(e,function(){n++}),n},toArray:function(e){return ul(e,function(n){return n})||[]},only:function(e){if(!Wu(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};Jd.Component=rt;Jd.Fragment=Ud;Jd.Profiler=Hd;Jd.PureComponent=$u;Jd.StrictMode=$d;Jd.Suspense=Qd;Jd.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Zd;Jd.act=Ma;Jd.cloneElement=function(e,n,t){if(e===null||e===void 0)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var r=Pa({},e.props),l=e.key,u=e.ref,o=e._owner;if(n!=null){if(n.ref!==void 0&&(u=n.ref,o=Au.current),n.key!==void 0&&(l=""+n.key),e.type&&e.type.defaultProps)var i=e.type.defaultProps;for(a in n)Da.call(n,a)&&!Oa.hasOwnProperty(a)&&(r[a]=n[a]===void 0&&i!==void 0?i[a]:n[a])}var a=arguments.length-2;if(a===1)r.children=t;else if(1<a){i=Array(a);for(var c=0;c<a;c++)i[c]=arguments[c+2];r.children=i}return{$$typeof:Bt,type:e.type,key:l,ref:u,props:r,_owner:o}};Jd.createContext=function(e){return e={$$typeof:Wd,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:Ad,_context:e},e.Consumer=e};Jd.createElement=Ra;Jd.createFactory=function(e){var n=Ra.bind(null,e);return n.type=e,n};Jd.createRef=function(){return{current:null}};Jd.forwardRef=function(e){return{$$typeof:Vd,render:e}};Jd.isValidElement=Wu;Jd.lazy=function(e){return{$$typeof:xd,_payload:{_status:-1,_result:e},_init:Gd}};Jd.memo=function(e,n){return{$$typeof:Bd,type:e,compare:n===void 0?null:n}};Jd.startTransition=function(e){var n=il.transition;il.transition={};try{e()}finally{il.transition=n}};Jd.unstable_act=Ma;Jd.useCallback=function(e,n){return fe.current.useCallback(e,n)};Jd.useContext=function(e){return fe.current.useContext(e)};Jd.useDebugValue=function(){};Jd.useDeferredValue=function(e){return fe.current.useDeferredValue(e)};Jd.useEffect=function(e,n){return fe.current.useEffect(e,n)};Jd.useId=function(){return fe.current.useId()};Jd.useImperativeHandle=function(e,n,t){return fe.current.useImperativeHandle(e,n,t)};Jd.useInsertionEffect=function(e,n){return fe.current.useInsertionEffect(e,n)};Jd.useLayoutEffect=function(e,n){return fe.current.useLayoutEffect(e,n)};Jd.useMemo=function(e,n){return fe.current.useMemo(e,n)};Jd.useReducer=function(e,n,t){return fe.current.useReducer(e,n,t)};Jd.useRef=function(e){return fe.current.useRef(e)};Jd.useState=function(e){return fe.current.useState(e)};Jd.useSyncExternalStore=function(e,n,t){return fe.current.useSyncExternalStore(e,n,t)};Jd.useTransition=function(){return fe.current.useTransition()};Jd.version="18.3.1"});var Aa=ll((Lp)=>{function Qu(e,n){var t=e.length;e.push(n);e:for(;0<t;){var r=t-1>>>1,l=e[r];if(0<al(l,n))e[r]=n,e[t]=l,t=r;else break e}}function Oe(e){return e.length===0?null:e[0]}function dl(e){if(e.length===0)return null;var n=e[0],t=e.pop();if(t!==n){e[0]=t;e:for(var r=0,l=e.length,u=l>>>1;r<u;){var o=2*(r+1)-1,i=e[o],a=o+1,c=e[a];if(0>al(i,t))a<l&&0>al(c,i)?(e[r]=c,e[a]=t,r=a):(e[r]=i,e[o]=t,r=o);else if(a<l&&0>al(c,t))e[r]=c,e[a]=t,r=a;else break e}}return n}function al(e,n){var t=e.sortIndex-n.sortIndex;return t!==0?t:e.id-n.id}if(typeof performance==="object"&&typeof performance.now==="function")Bu=performance,Lp.unstable_now=function(){return Bu.now()};else fl=Date,xu=fl.now(),Lp.unstable_now=function(){return fl.now()-xu};var Bu,fl,xu,Ae=[],un=[],Fp=1,_e=null,le=3,pl=!1,In=!1,Yt=!1,La=typeof setTimeout==="function"?setTimeout:null,Ia=typeof clearTimeout==="function"?clearTimeout:null,Fa=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function Yu(e){for(var n=Oe(un);n!==null;){if(n.callback===null)dl(un);else if(n.startTime<=e)dl(un),n.sortIndex=n.expirationTime,Qu(Ae,n);else break;n=Oe(un)}}function Xu(e){if(Yt=!1,Yu(e),!In)if(Oe(Ae)!==null)In=!0,Zu(Gu);else{var n=Oe(un);n!==null&&Ju(Xu,n.startTime-e)}}function Gu(e,n){In=!1,Yt&&(Yt=!1,Ia(Kt),Kt=-1),pl=!0;var t=le;try{Yu(n);for(_e=Oe(Ae);_e!==null&&(!(_e.expirationTime>n)||e&&!Ha());){var r=_e.callback;if(typeof r==="function"){_e.callback=null,le=_e.priorityLevel;var l=r(_e.expirationTime<=n);n=Lp.unstable_now(),typeof l==="function"?_e.callback=l:_e===Oe(Ae)&&dl(Ae),Yu(n)}else dl(Ae);_e=Oe(Ae)}if(_e!==null)var u=!0;else{var o=Oe(un);o!==null&&Ju(Xu,o.startTime-n),u=!1}return u}finally{_e=null,le=t,pl=!1}}var hl=!1,sl=null,Kt=-1,Ua=5,$a=-1;function Ha(){return Lp.unstable_now()-$a<Ua?!1:!0}function Vu(){if(sl!==null){var e=Lp.unstable_now();$a=e;var n=!0;try{n=sl(!0,e)}finally{n?xt():(hl=!1,sl=null)}}else hl=!1}var xt;if(typeof Fa==="function")xt=function(){Fa(Vu)};else if(typeof MessageChannel<"u")cl=new MessageChannel,Ku=cl.port2,cl.port1.onmessage=Vu,xt=function(){Ku.postMessage(null)};else xt=function(){La(Vu,0)};var cl,Ku;function Zu(e){sl=e,hl||(hl=!0,xt())}function Ju(e,n){Kt=La(function(){e(Lp.unstable_now())},n)}Lp.unstable_IdlePriority=5;Lp.unstable_ImmediatePriority=1;Lp.unstable_LowPriority=4;Lp.unstable_NormalPriority=3;Lp.unstable_Profiling=null;Lp.unstable_UserBlockingPriority=2;Lp.unstable_cancelCallback=function(e){e.callback=null};Lp.unstable_continueExecution=function(){In||pl||(In=!0,Zu(Gu))};Lp.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):Ua=0<e?Math.floor(1000/e):5};Lp.unstable_getCurrentPriorityLevel=function(){return le};Lp.unstable_getFirstCallbackNode=function(){return Oe(Ae)};Lp.unstable_next=function(e){switch(le){case 1:case 2:case 3:var n=3;break;default:n=le}var t=le;le=n;try{return e()}finally{le=t}};Lp.unstable_pauseExecution=function(){};Lp.unstable_requestPaint=function(){};Lp.unstable_runWithPriority=function(e,n){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var t=le;le=e;try{return n()}finally{le=t}};Lp.unstable_scheduleCallback=function(e,n,t){var r=Lp.unstable_now();switch(typeof t==="object"&&t!==null?(t=t.delay,t=typeof t==="number"&&0<t?r+t:r):t=r,e){case 1:var l=-1;break;case 2:l=250;break;case 5:l=1073741823;break;case 4:l=1e4;break;default:l=5000}return l=t+l,e={id:Fp++,callback:n,priorityLevel:e,startTime:t,expirationTime:l,sortIndex:-1},t>r?(e.sortIndex=t,Qu(un,e),Oe(Ae)===null&&e===Oe(un)&&(Yt?(Ia(Kt),Kt=-1):Yt=!0,Ju(Xu,t-r))):(e.sortIndex=l,Qu(Ae,e),In||pl||(In=!0,Zu(Gu))),e};Lp.unstable_shouldYield=Ha;Lp.unstable_wrapCallback=function(e){var n=le;return function(){var t=le;le=n;try{return e.apply(this,arguments)}finally{le=t}}}});var ra={};Fd(ra,{version:()=>ed,unstable_renderSubtreeIntoContainer:()=>bc,unstable_batchedUpdates:()=>jc,unmountComponentAtNode:()=>qc,render:()=>Jc,hydrateRoot:()=>Zc,hydrate:()=>Gc,flushSync:()=>Xc,findDOMNode:()=>Kc,createRoot:()=>Yc,createPortal:()=>xc,__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:()=>Bc});function E(e){for(var n="https://reactjs.org/docs/error-decoder.html?invariant="+e,t=1;t<arguments.length;t++)n+="&args[]="+encodeURIComponent(arguments[t]);return"Minified React error #"+e+"; visit "+n+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Zn(e,n){Nt(e,n),Nt(e+"Capture",n)}function Nt(e,n){vr[e]=n;for(e=0;e<n.length;e++)Kf.add(n[e])}function e0(e){if(wo.call(Va,e))return!0;if(wo.call(Wa,e))return!1;if(bp.test(e))return Va[e]=!0;return Wa[e]=!0,!1}function n0(e,n,t,r){if(t!==null&&t.type===0)return!1;switch(typeof n){case"function":case"symbol":return!0;case"boolean":if(r)return!1;if(t!==null)return!t.acceptsBooleans;return e=e.toLowerCase().slice(0,5),e!=="data-"&&e!=="aria-";default:return!1}}function t0(e,n,t,r){if(n===null||typeof n>"u"||n0(e,n,t,r))return!0;if(r)return!1;if(t!==null)switch(t.type){case 3:return!n;case 4:return n===!1;case 5:return isNaN(n);case 6:return isNaN(n)||1>n}return!1}function de(e,n,t,r,l,u,o){this.acceptsBooleans=n===2||n===3||n===4,this.attributeName=r,this.attributeNamespace=l,this.mustUseProperty=t,this.propertyName=e,this.type=n,this.sanitizeURL=u,this.removeEmptyString=o}function hi(e){return e[1].toUpperCase()}function mi(e,n,t,r){var l=re.hasOwnProperty(n)?re[n]:null;if(l!==null?l.type!==0:r||!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")t0(n,t,l,r)&&(t=null),r||l===null?e0(n)&&(t===null?e.removeAttribute(n):e.setAttribute(n,""+t)):l.mustUseProperty?e[l.propertyName]=t===null?l.type===3?!1:"":t:(n=l.attributeName,r=l.attributeNamespace,t===null?e.removeAttribute(n):(l=l.type,t=l===3||l===4&&t===!0?"":""+t,r?e.setAttributeNS(r,n,t):e.setAttribute(n,t)))}function Xt(e){if(e===null||typeof e!=="object")return null;return e=Qa&&e[Qa]||e["@@iterator"],typeof e==="function"?e:null}function er(e){if(qu===void 0)try{throw Error()}catch(t){var n=t.stack.trim().match(/\n( *(at )?)/);qu=n&&n[1]||""}return`
`+qu+e}function bu(e,n){if(!e||ju)return"";ju=!0;var t=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(n)if(n=function(){throw Error()},Object.defineProperty(n.prototype,"props",{set:function(){throw Error()}}),typeof Reflect==="object"&&Reflect.construct){try{Reflect.construct(n,[])}catch(c){var r=c}Reflect.construct(e,[],n)}else{try{n.call()}catch(c){r=c}e.call(n.prototype)}else{try{throw Error()}catch(c){r=c}e()}}catch(c){if(c&&r&&typeof c.stack==="string"){for(var l=c.stack.split(`
`),u=r.stack.split(`
`),o=l.length-1,i=u.length-1;1<=o&&0<=i&&l[o]!==u[i];)i--;for(;1<=o&&0<=i;o--,i--)if(l[o]!==u[i]){if(o!==1||i!==1)do if(o--,i--,0>i||l[o]!==u[i]){var a=`
`+l[o].replace(" at new "," at ");return e.displayName&&a.includes("<anonymous>")&&(a=a.replace("<anonymous>",e.displayName)),a}while(1<=o&&0<=i);break}}}finally{ju=!1,Error.prepareStackTrace=t}return(e=e?e.displayName||e.name:"")?er(e):""}function r0(e){switch(e.tag){case 5:return er(e.type);case 16:return er("Lazy");case 13:return er("Suspense");case 19:return er("SuspenseList");case 0:case 2:case 15:return e=bu(e.type,!1),e;case 11:return e=bu(e.type.render,!1),e;case 1:return e=bu(e.type,!0),e;default:return""}}function _o(e){if(e==null)return null;if(typeof e==="function")return e.displayName||e.name||null;if(typeof e==="string")return e;switch(e){case at:return"Fragment";case it:return"Portal";case So:return"Profiler";case yi:return"StrictMode";case Eo:return"Suspense";case ko:return"SuspenseList"}if(typeof e==="object")switch(e.$$typeof){case Gf:return(e.displayName||"Context")+".Consumer";case Xf:return(e._context.displayName||"Context")+".Provider";case vi:var n=e.render;return e=e.displayName,e||(e=n.displayName||n.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case gi:return n=e.displayName||null,n!==null?n:_o(e.type)||"Memo";case an:n=e._payload,e=e._init;try{return _o(e(n))}catch(t){}}return null}function l0(e){var n=e.type;switch(e.tag){case 24:return"Cache";case 9:return(n.displayName||"Context")+".Consumer";case 10:return(n._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return e=n.render,e=e.displayName||e.name||"",n.displayName||(e!==""?"ForwardRef("+e+")":"ForwardRef");case 7:return"Fragment";case 5:return n;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return _o(n);case 8:return n===yi?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof n==="function")return n.displayName||n.name||null;if(typeof n==="string")return n}return null}function kn(e){switch(typeof e){case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Jf(e){var n=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(n==="checkbox"||n==="radio")}function u0(e){var n=Jf(e)?"checked":"value",t=Object.getOwnPropertyDescriptor(e.constructor.prototype,n),r=""+e[n];if(!e.hasOwnProperty(n)&&typeof t<"u"&&typeof t.get==="function"&&typeof t.set==="function"){var{get:l,set:u}=t;return Object.defineProperty(e,n,{configurable:!0,get:function(){return l.call(this)},set:function(o){r=""+o,u.call(this,o)}}),Object.defineProperty(e,n,{enumerable:t.enumerable}),{getValue:function(){return r},setValue:function(o){r=""+o},stopTracking:function(){e._valueTracker=null,delete e[n]}}}}function yl(e){e._valueTracker||(e._valueTracker=u0(e))}function qf(e){if(!e)return!1;var n=e._valueTracker;if(!n)return!0;var t=n.getValue(),r="";return e&&(r=Jf(e)?e.checked?"true":"false":e.value),e=r,e!==t?(n.setValue(e),!0):!1}function Vl(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch(n){return e.body}}function Co(e,n){var t=n.checked;return X({},n,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:t!=null?t:e._wrapperState.initialChecked})}function Ba(e,n){var t=n.defaultValue==null?"":n.defaultValue,r=n.checked!=null?n.checked:n.defaultChecked;t=kn(n.value!=null?n.value:t),e._wrapperState={initialChecked:r,initialValue:t,controlled:n.type==="checkbox"||n.type==="radio"?n.checked!=null:n.value!=null}}function jf(e,n){n=n.checked,n!=null&&mi(e,"checked",n,!1)}function No(e,n){jf(e,n);var t=kn(n.value),r=n.type;if(t!=null)if(r==="number"){if(t===0&&e.value===""||e.value!=t)e.value=""+t}else e.value!==""+t&&(e.value=""+t);else if(r==="submit"||r==="reset"){e.removeAttribute("value");return}n.hasOwnProperty("value")?Po(e,n.type,t):n.hasOwnProperty("defaultValue")&&Po(e,n.type,kn(n.defaultValue)),n.checked==null&&n.defaultChecked!=null&&(e.defaultChecked=!!n.defaultChecked)}function xa(e,n,t){if(n.hasOwnProperty("value")||n.hasOwnProperty("defaultValue")){var r=n.type;if(!(r!=="submit"&&r!=="reset"||n.value!==void 0&&n.value!==null))return;n=""+e._wrapperState.initialValue,t||n===e.value||(e.value=n),e.defaultValue=n}t=e.name,t!==""&&(e.name=""),e.defaultChecked=!!e._wrapperState.initialChecked,t!==""&&(e.name=t)}function Po(e,n,t){if(n!=="number"||Vl(e.ownerDocument)!==e)t==null?e.defaultValue=""+e._wrapperState.initialValue:e.defaultValue!==""+t&&(e.defaultValue=""+t)}function wt(e,n,t,r){if(e=e.options,n){n={};for(var l=0;l<t.length;l++)n["$"+t[l]]=!0;for(t=0;t<e.length;t++)l=n.hasOwnProperty("$"+e[t].value),e[t].selected!==l&&(e[t].selected=l),l&&r&&(e[t].defaultSelected=!0)}else{t=""+kn(t),n=null;for(l=0;l<e.length;l++){if(e[l].value===t){e[l].selected=!0,r&&(e[l].defaultSelected=!0);return}n!==null||e[l].disabled||(n=e[l])}n!==null&&(n.selected=!0)}}function To(e,n){if(n.dangerouslySetInnerHTML!=null)throw Error(E(91));return X({},n,{value:void 0,defaultValue:void 0,children:""+e._wrapperState.initialValue})}function Ya(e,n){var t=n.value;if(t==null){if(t=n.children,n=n.defaultValue,t!=null){if(n!=null)throw Error(E(92));if(nr(t)){if(1<t.length)throw Error(E(93));t=t[0]}n=t}n==null&&(n=""),t=n}e._wrapperState={initialValue:kn(t)}}function bf(e,n){var t=kn(n.value),r=kn(n.defaultValue);t!=null&&(t=""+t,t!==e.value&&(e.value=t),n.defaultValue==null&&e.defaultValue!==t&&(e.defaultValue=t)),r!=null&&(e.defaultValue=""+r)}function Ka(e){var n=e.textContent;n===e._wrapperState.initialValue&&n!==""&&n!==null&&(e.value=n)}function es(e){switch(e){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function zo(e,n){return e==null||e==="http://www.w3.org/1999/xhtml"?es(n):e==="http://www.w3.org/2000/svg"&&n==="foreignObject"?"http://www.w3.org/1999/xhtml":e}function gr(e,n){if(n){var t=e.firstChild;if(t&&t===e.lastChild&&t.nodeType===3){t.nodeValue=n;return}}e.textContent=n}function ts(e,n,t){return n==null||typeof n==="boolean"||n===""?"":t||typeof n!=="number"||n===0||ar.hasOwnProperty(e)&&ar[e]?(""+n).trim():n+"px"}function rs(e,n){e=e.style;for(var t in n)if(n.hasOwnProperty(t)){var r=t.indexOf("--")===0,l=ts(t,n[t],r);t==="float"&&(t="cssFloat"),r?e.setProperty(t,l):e[t]=l}}function Do(e,n){if(n){if(i0[e]&&(n.children!=null||n.dangerouslySetInnerHTML!=null))throw Error(E(137,e));if(n.dangerouslySetInnerHTML!=null){if(n.children!=null)throw Error(E(60));if(typeof n.dangerouslySetInnerHTML!=="object"||!("__html"in n.dangerouslySetInnerHTML))throw Error(E(61))}if(n.style!=null&&typeof n.style!=="object")throw Error(E(62))}}function Oo(e,n){if(e.indexOf("-")===-1)return typeof n.is==="string";switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}function wi(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}function Xa(e){if(e=Ur(e)){if(typeof Mo!=="function")throw Error(E(280));var n=e.stateNode;n&&(n=mu(n),Mo(e.stateNode,e.type,n))}}function ls(e){St?Et?Et.push(e):Et=[e]:St=e}function us(){if(St){var e=St,n=Et;if(Et=St=null,Xa(e),n)for(e=0;e<n.length;e++)Xa(n[e])}}function os(e,n){return e(n)}function is(){}function as(e,n,t){if(eo)return e(n,t);eo=!0;try{return os(e,n,t)}finally{if(eo=!1,St!==null||Et!==null)is(),us()}}function wr(e,n){var t=e.stateNode;if(t===null)return null;var r=mu(t);if(r===null)return null;t=r[n];e:switch(n){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(e=e.type,r=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!r;break e;default:e=!1}if(e)return null;if(t&&typeof t!=="function")throw Error(E(231,n,typeof t));return t}function a0(e,n,t,r,l,u,o,i,a){var c=Array.prototype.slice.call(arguments,3);try{n.apply(t,c)}catch(v){this.onError(v)}}function s0(e,n,t,r,l,u,o,i,a){fr=!1,Ql=null,a0.apply(f0,arguments)}function c0(e,n,t,r,l,u,o,i,a){if(s0.apply(this,arguments),fr){if(fr){var c=Ql;fr=!1,Ql=null}else throw Error(E(198));Bl||(Bl=!0,Lo=c)}}function Jn(e){var n=e,t=e;if(e.alternate)for(;n.return;)n=n.return;else{e=n;do n=e,(n.flags&4098)!==0&&(t=n.return),e=n.return;while(e)}return n.tag===3?t:null}function fs(e){if(e.tag===13){var n=e.memoizedState;if(n===null&&(e=e.alternate,e!==null&&(n=e.memoizedState)),n!==null)return n.dehydrated}return null}function Ga(e){if(Jn(e)!==e)throw Error(E(188))}function d0(e){var n=e.alternate;if(!n){if(n=Jn(e),n===null)throw Error(E(188));return n!==e?null:e}for(var t=e,r=n;;){var l=t.return;if(l===null)break;var u=l.alternate;if(u===null){if(r=l.return,r!==null){t=r;continue}break}if(l.child===u.child){for(u=l.child;u;){if(u===t)return Ga(l),e;if(u===r)return Ga(l),n;u=u.sibling}throw Error(E(188))}if(t.return!==r.return)t=l,r=u;else{for(var o=!1,i=l.child;i;){if(i===t){o=!0,t=l,r=u;break}if(i===r){o=!0,r=l,t=u;break}i=i.sibling}if(!o){for(i=u.child;i;){if(i===t){o=!0,t=u,r=l;break}if(i===r){o=!0,r=u,t=l;break}i=i.sibling}if(!o)throw Error(E(189))}}if(t.alternate!==r)throw Error(E(190))}if(t.tag!==3)throw Error(E(188));return t.stateNode.current===t?e:n}function ss(e){return e=d0(e),e!==null?cs(e):null}function cs(e){if(e.tag===5||e.tag===6)return e;for(e=e.child;e!==null;){var n=cs(e);if(n!==null)return n;e=e.sibling}return null}function v0(e){if(Be&&typeof Be.onCommitFiberRoot==="function")try{Be.onCommitFiberRoot(cu,e,void 0,(e.current.flags&128)===128)}catch(n){}}function S0(e){return e>>>=0,e===0?32:31-(g0(e)/w0|0)|0}function tr(e){switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return e&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return e}}function Yl(e,n){var t=e.pendingLanes;if(t===0)return 0;var r=0,l=e.suspendedLanes,u=e.pingedLanes,o=t&268435455;if(o!==0){var i=o&~l;i!==0?r=tr(i):(u&=o,u!==0&&(r=tr(u)))}else o=t&~l,o!==0?r=tr(o):u!==0&&(r=tr(u));if(r===0)return 0;if(n!==0&&n!==r&&(n&l)===0&&(l=r&-r,u=n&-n,l>=u||l===16&&(u&4194240)!==0))return n;if((r&4)!==0&&(r|=t&16),n=e.entangledLanes,n!==0)for(e=e.entanglements,n&=r;0<n;)t=31-Ie(n),l=1<<t,r|=e[t],n&=~l;return r}function E0(e,n){switch(e){case 1:case 2:case 4:return n+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return n+5000;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function k0(e,n){for(var{suspendedLanes:t,pingedLanes:r,expirationTimes:l,pendingLanes:u}=e;0<u;){var o=31-Ie(u),i=1<<o,a=l[o];if(a===-1){if((i&t)===0||(i&r)!==0)l[o]=E0(i,n)}else a<=n&&(e.expiredLanes|=i);u&=~i}}function Io(e){return e=e.pendingLanes&-1073741825,e!==0?e:e&1073741824?1073741824:0}function ms(){var e=gl;return gl<<=1,(gl&4194240)===0&&(gl=64),e}function no(e){for(var n=[],t=0;31>t;t++)n.push(e);return n}function Lr(e,n,t){e.pendingLanes|=n,n!==536870912&&(e.suspendedLanes=0,e.pingedLanes=0),e=e.eventTimes,n=31-Ie(n),e[n]=t}function _0(e,n){var t=e.pendingLanes&~n;e.pendingLanes=n,e.suspendedLanes=0,e.pingedLanes=0,e.expiredLanes&=n,e.mutableReadLanes&=n,e.entangledLanes&=n,n=e.entanglements;var r=e.eventTimes;for(e=e.expirationTimes;0<t;){var l=31-Ie(t),u=1<<l;n[l]=0,r[l]=-1,e[l]=-1,t&=~u}}function Ei(e,n){var t=e.entangledLanes|=n;for(e=e.entanglements;t;){var r=31-Ie(t),l=1<<r;l&n|e[r]&n&&(e[r]|=n),t&=~l}}function ys(e){return e&=-e,1<e?4<e?(e&268435455)!==0?16:536870912:4:1}function Ja(e,n){switch(e){case"focusin":case"focusout":hn=null;break;case"dragenter":case"dragleave":mn=null;break;case"mouseover":case"mouseout":yn=null;break;case"pointerover":case"pointerout":Sr.delete(n.pointerId);break;case"gotpointercapture":case"lostpointercapture":Er.delete(n.pointerId)}}function Gt(e,n,t,r,l,u){if(e===null||e.nativeEvent!==u)return e={blockedOn:n,domEventName:t,eventSystemFlags:r,nativeEvent:u,targetContainers:[l]},n!==null&&(n=Ur(n),n!==null&&ki(n)),e;return e.eventSystemFlags|=r,n=e.targetContainers,l!==null&&n.indexOf(l)===-1&&n.push(l),e}function N0(e,n,t,r,l){switch(n){case"focusin":return hn=Gt(hn,e,n,t,r,l),!0;case"dragenter":return mn=Gt(mn,e,n,t,r,l),!0;case"mouseover":return yn=Gt(yn,e,n,t,r,l),!0;case"pointerover":var u=l.pointerId;return Sr.set(u,Gt(Sr.get(u)||null,e,n,t,r,l)),!0;case"gotpointercapture":return u=l.pointerId,Er.set(u,Gt(Er.get(u)||null,e,n,t,r,l)),!0}return!1}function Es(e){var n=An(e.target);if(n!==null){var t=Jn(n);if(t!==null){if(n=t.tag,n===13){if(n=fs(t),n!==null){e.blockedOn=n,Ss(e.priority,function(){gs(t)});return}}else if(n===3&&t.stateNode.current.memoizedState.isDehydrated){e.blockedOn=t.tag===3?t.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Ol(e){if(e.blockedOn!==null)return!1;for(var n=e.targetContainers;0<n.length;){var t=$o(e.domEventName,e.eventSystemFlags,n[0],e.nativeEvent);if(t===null){t=e.nativeEvent;var r=new t.constructor(t.type,t);Ro=r,t.target.dispatchEvent(r),Ro=null}else return n=Ur(t),n!==null&&ki(n),e.blockedOn=t,!1;n.shift()}return!0}function qa(e,n,t){Ol(e)&&t.delete(n)}function P0(){Uo=!1,hn!==null&&Ol(hn)&&(hn=null),mn!==null&&Ol(mn)&&(mn=null),yn!==null&&Ol(yn)&&(yn=null),Sr.forEach(qa),Er.forEach(qa)}function Zt(e,n){e.blockedOn===n&&(e.blockedOn=null,Uo||(Uo=!0,x.unstable_scheduleCallback(x.unstable_NormalPriority,P0)))}function kr(e){function n(l){return Zt(l,e)}if(0<Sl.length){Zt(Sl[0],e);for(var t=1;t<Sl.length;t++){var r=Sl[t];r.blockedOn===e&&(r.blockedOn=null)}}hn!==null&&Zt(hn,e),mn!==null&&Zt(mn,e),yn!==null&&Zt(yn,e),Sr.forEach(n),Er.forEach(n);for(t=0;t<sn.length;t++)r=sn[t],r.blockedOn===e&&(r.blockedOn=null);for(;0<sn.length&&(t=sn[0],t.blockedOn===null);)Es(t),t.blockedOn===null&&sn.shift()}function T0(e,n,t,r){var l=H,u=kt.transition;kt.transition=null;try{H=1,_i(e,n,t,r)}finally{H=l,kt.transition=u}}function z0(e,n,t,r){var l=H,u=kt.transition;kt.transition=null;try{H=4,_i(e,n,t,r)}finally{H=l,kt.transition=u}}function _i(e,n,t,r){if(Kl){var l=$o(e,n,t,r);if(l===null)io(e,n,r,Xl,t),Ja(e,r);else if(N0(l,e,n,t,r))r.stopPropagation();else if(Ja(e,r),n&4&&-1<C0.indexOf(e)){for(;l!==null;){var u=Ur(l);if(u!==null&&vs(u),u=$o(e,n,t,r),u===null&&io(e,n,r,Xl,t),u===l)break;l=u}l!==null&&r.stopPropagation()}else io(e,n,r,null,t)}}function $o(e,n,t,r){if(Xl=null,e=wi(r),e=An(e),e!==null)if(n=Jn(e),n===null)e=null;else if(t=n.tag,t===13){if(e=fs(n),e!==null)return e;e=null}else if(t===3){if(n.stateNode.current.memoizedState.isDehydrated)return n.tag===3?n.stateNode.containerInfo:null;e=null}else n!==e&&(e=null);return Xl=e,null}function ks(e){switch(e){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(m0()){case Si:return 1;case ps:return 4;case xl:case y0:return 16;case hs:return 536870912;default:return 16}default:return 16}}function _s(){if(Rl)return Rl;var e,n=Ci,t=n.length,r,l="value"in dn?dn.value:dn.textContent,u=l.length;for(e=0;e<t&&n[e]===l[e];e++);var o=t-e;for(r=1;r<=o&&n[t-r]===l[u-r];r++);return Rl=l.slice(e,1<r?1-r:void 0)}function Ml(e){var n=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&n===13&&(e=13)):e=n,e===10&&(e=13),32<=e||e===13?e:0}function El(){return!0}function ja(){return!1}function ke(e){function n(t,r,l,u,o){this._reactName=t,this._targetInst=l,this.type=r,this.nativeEvent=u,this.target=o,this.currentTarget=null;for(var i in e)e.hasOwnProperty(i)&&(t=e[i],this[i]=t?t(u):u[i]);return this.isDefaultPrevented=(u.defaultPrevented!=null?u.defaultPrevented:u.returnValue===!1)?El:ja,this.isPropagationStopped=ja,this}return X(n.prototype,{preventDefault:function(){this.defaultPrevented=!0;var t=this.nativeEvent;t&&(t.preventDefault?t.preventDefault():typeof t.returnValue!=="unknown"&&(t.returnValue=!1),this.isDefaultPrevented=El)},stopPropagation:function(){var t=this.nativeEvent;t&&(t.stopPropagation?t.stopPropagation():typeof t.cancelBubble!=="unknown"&&(t.cancelBubble=!0),this.isPropagationStopped=El)},persist:function(){},isPersistent:El}),n}function V0(e){var n=this.nativeEvent;return n.getModifierState?n.getModifierState(e):(e=W0[e])?!!n[e]:!1}function Pi(){return V0}function Ns(e,n){switch(e){case"keyup":return q0.indexOf(n.keyCode)!==-1;case"keydown":return n.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Ps(e){return e=e.detail,typeof e==="object"&&"data"in e?e.data:null}function b0(e,n){switch(e){case"compositionend":return Ps(n);case"keypress":if(n.which!==32)return null;return rf=!0,tf;case"textInput":return e=n.data,e===tf&&rf?null:e;default:return null}}function e1(e,n){if(ft)return e==="compositionend"||!Ti&&Ns(e,n)?(e=_s(),Rl=Ci=dn=null,ft=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(n.ctrlKey||n.altKey||n.metaKey)||n.ctrlKey&&n.altKey){if(n.char&&1<n.char.length)return n.char;if(n.which)return String.fromCharCode(n.which)}return null;case"compositionend":return Cs&&n.locale!=="ko"?null:n.data;default:return null}}function lf(e){var n=e&&e.nodeName&&e.nodeName.toLowerCase();return n==="input"?!!n1[e.type]:n==="textarea"?!0:!1}function Ts(e,n,t,r){ls(r),n=Gl(n,"onChange"),0<n.length&&(t=new Ni("onChange","change",null,t,r),e.push({event:t,listeners:n}))}function t1(e){Hs(e,0)}function pu(e){var n=dt(e);if(qf(n))return e}function r1(e,n){if(e==="change")return n}function uf(){cr&&(cr.detachEvent("onpropertychange",Ds),_r=cr=null)}function Ds(e){if(e.propertyName==="value"&&pu(_r)){var n=[];Ts(n,_r,e,wi(e)),as(t1,n)}}function l1(e,n,t){e==="focusin"?(uf(),cr=n,_r=t,cr.attachEvent("onpropertychange",Ds)):e==="focusout"&&uf()}function u1(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return pu(_r)}function o1(e,n){if(e==="click")return pu(n)}function i1(e,n){if(e==="input"||e==="change")return pu(n)}function a1(e,n){return e===n&&(e!==0||1/e===1/n)||e!==e&&n!==n}function Cr(e,n){if($e(e,n))return!0;if(typeof e!=="object"||e===null||typeof n!=="object"||n===null)return!1;var t=Object.keys(e),r=Object.keys(n);if(t.length!==r.length)return!1;for(r=0;r<t.length;r++){var l=t[r];if(!wo.call(n,l)||!$e(e[l],n[l]))return!1}return!0}function of(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function af(e,n){var t=of(e);e=0;for(var r;t;){if(t.nodeType===3){if(r=e+t.textContent.length,e<=n&&r>=n)return{node:t,offset:n-e};e=r}e:{for(;t;){if(t.nextSibling){t=t.nextSibling;break e}t=t.parentNode}t=void 0}t=of(t)}}function Os(e,n){return e&&n?e===n?!0:e&&e.nodeType===3?!1:n&&n.nodeType===3?Os(e,n.parentNode):("contains"in e)?e.contains(n):e.compareDocumentPosition?!!(e.compareDocumentPosition(n)&16):!1:!1}function Rs(){for(var e=window,n=Vl();n instanceof e.HTMLIFrameElement;){try{var t=typeof n.contentWindow.location.href==="string"}catch(r){t=!1}if(t)e=n.contentWindow;else break;n=Vl(e.document)}return n}function zi(e){var n=e&&e.nodeName&&e.nodeName.toLowerCase();return n&&(n==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||n==="textarea"||e.contentEditable==="true")}function f1(e){var n=Rs(),t=e.focusedElem,r=e.selectionRange;if(n!==t&&t&&t.ownerDocument&&Os(t.ownerDocument.documentElement,t)){if(r!==null&&zi(t)){if(n=r.start,e=r.end,e===void 0&&(e=n),"selectionStart"in t)t.selectionStart=n,t.selectionEnd=Math.min(e,t.value.length);else if(e=(n=t.ownerDocument||document)&&n.defaultView||window,e.getSelection){e=e.getSelection();var l=t.textContent.length,u=Math.min(r.start,l);r=r.end===void 0?u:Math.min(r.end,l),!e.extend&&u>r&&(l=r,r=u,u=l),l=af(t,u);var o=af(t,r);l&&o&&(e.rangeCount!==1||e.anchorNode!==l.node||e.anchorOffset!==l.offset||e.focusNode!==o.node||e.focusOffset!==o.offset)&&(n=n.createRange(),n.setStart(l.node,l.offset),e.removeAllRanges(),u>r?(e.addRange(n),e.extend(o.node,o.offset)):(n.setEnd(o.node,o.offset),e.addRange(n)))}}n=[];for(e=t;e=e.parentNode;)e.nodeType===1&&n.push({element:e,left:e.scrollLeft,top:e.scrollTop});typeof t.focus==="function"&&t.focus();for(t=0;t<n.length;t++)e=n[t],e.element.scrollLeft=e.left,e.element.scrollTop=e.top}}function ff(e,n,t){var r=t.window===t?t.document:t.nodeType===9?t:t.ownerDocument;Ao||st==null||st!==Vl(r)||(r=st,("selectionStart"in r)&&zi(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),dr&&Cr(dr,r)||(dr=r,r=Gl(Ho,"onSelect"),0<r.length&&(n=new Ni("onSelect","select",null,n,t),e.push({event:n,listeners:r}),n.target=st)))}function kl(e,n){var t={};return t[e.toLowerCase()]=n.toLowerCase(),t["Webkit"+e]="webkit"+n,t["Moz"+e]="moz"+n,t}function hu(e){if(uo[e])return uo[e];if(!ct[e])return e;var n=ct[e],t;for(t in n)if(n.hasOwnProperty(t)&&t in Ms)return uo[e]=n[t];return e}function Cn(e,n){$s.set(e,n),Zn(n,[e])}function cf(e,n,t){var r=e.type||"unknown-event";e.currentTarget=t,c0(r,n,void 0,e),e.currentTarget=null}function Hs(e,n){n=(n&4)!==0;for(var t=0;t<e.length;t++){var r=e[t],l=r.event;r=r.listeners;e:{var u=void 0;if(n)for(var o=r.length-1;0<=o;o--){var i=r[o],a=i.instance,c=i.currentTarget;if(i=i.listener,a!==u&&l.isPropagationStopped())break e;cf(l,i,c),u=a}else for(o=0;o<r.length;o++){if(i=r[o],a=i.instance,c=i.currentTarget,i=i.listener,a!==u&&l.isPropagationStopped())break e;cf(l,i,c),u=a}}}if(Bl)throw e=Lo,Bl=!1,Lo=null,e}function V(e,n){var t=n[Ko];t===void 0&&(t=n[Ko]=new Set);var r=e+"__bubble";t.has(r)||(As(n,e,2,!1),t.add(r))}function oo(e,n,t){var r=0;n&&(r|=4),As(t,e,r,n)}function Nr(e){if(!e[_l]){e[_l]=!0,Kf.forEach(function(t){t!=="selectionchange"&&(c1.has(t)||oo(t,!1,e),oo(t,!0,e))});var n=e.nodeType===9?e:e.ownerDocument;n===null||n[_l]||(n[_l]=!0,oo("selectionchange",!1,n))}}function As(e,n,t,r){switch(ks(n)){case 1:var l=T0;break;case 4:l=z0;break;default:l=_i}t=l.bind(null,n,t,e),l=void 0,!Fo||n!=="touchstart"&&n!=="touchmove"&&n!=="wheel"||(l=!0),r?l!==void 0?e.addEventListener(n,t,{capture:!0,passive:l}):e.addEventListener(n,t,!0):l!==void 0?e.addEventListener(n,t,{passive:l}):e.addEventListener(n,t,!1)}function io(e,n,t,r,l){var u=r;if((n&1)===0&&(n&2)===0&&r!==null)e:for(;;){if(r===null)return;var o=r.tag;if(o===3||o===4){var i=r.stateNode.containerInfo;if(i===l||i.nodeType===8&&i.parentNode===l)break;if(o===4)for(o=r.return;o!==null;){var a=o.tag;if(a===3||a===4){if(a=o.stateNode.containerInfo,a===l||a.nodeType===8&&a.parentNode===l)return}o=o.return}for(;i!==null;){if(o=An(i),o===null)return;if(a=o.tag,a===5||a===6){r=u=o;continue e}i=i.parentNode}}r=r.return}as(function(){var c=u,v=wi(t),g=[];e:{var y=$s.get(e);if(y!==void 0){var k=Ni,N=e;switch(e){case"keypress":if(Ml(t)===0)break e;case"keydown":case"keyup":k=B0;break;case"focusin":N="focus",k=lo;break;case"focusout":N="blur",k=lo;break;case"beforeblur":case"afterblur":k=lo;break;case"click":if(t.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":k=ba;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":k=R0;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":k=K0;break;case Fs:case Ls:case Is:k=L0;break;case Us:k=G0;break;case"scroll":k=D0;break;case"wheel":k=J0;break;case"copy":case"cut":case"paste":k=U0;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":k=nf}var h=(n&4)!==0,T=!h&&e==="scroll",s=h?y!==null?y+"Capture":null:y;h=[];for(var f=c,d;f!==null;){d=f;var w=d.stateNode;if(d.tag===5&&w!==null&&(d=w,s!==null&&(w=wr(f,s),w!=null&&h.push(Pr(f,w,d)))),T)break;f=f.return}0<h.length&&(y=new k(y,N,null,t,v),g.push({event:y,listeners:h}))}}if((n&7)===0){e:{if(y=e==="mouseover"||e==="pointerover",k=e==="mouseout"||e==="pointerout",y&&t!==Ro&&(N=t.relatedTarget||t.fromElement)&&(An(N)||N[je]))break e;if(k||y){if(y=v.window===v?v:(y=v.ownerDocument)?y.defaultView||y.parentWindow:window,k){if(N=t.relatedTarget||t.toElement,k=c,N=N?An(N):null,N!==null&&(T=Jn(N),N!==T||N.tag!==5&&N.tag!==6))N=null}else k=null,N=c;if(k!==N){if(h=ba,w="onMouseLeave",s="onMouseEnter",f="mouse",e==="pointerout"||e==="pointerover")h=nf,w="onPointerLeave",s="onPointerEnter",f="pointer";if(T=k==null?y:dt(k),d=N==null?y:dt(N),y=new h(w,f+"leave",k,t,v),y.target=T,y.relatedTarget=d,w=null,An(v)===c&&(h=new h(s,f+"enter",N,t,v),h.target=d,h.relatedTarget=T,w=h),T=w,k&&N)n:{h=k,s=N,f=0;for(d=h;d;d=ut(d))f++;d=0;for(w=s;w;w=ut(w))d++;for(;0<f-d;)h=ut(h),f--;for(;0<d-f;)s=ut(s),d--;for(;f--;){if(h===s||s!==null&&h===s.alternate)break n;h=ut(h),s=ut(s)}h=null}else h=null;k!==null&&df(g,y,k,h,!1),N!==null&&T!==null&&df(g,T,N,h,!0)}}}e:{if(y=c?dt(c):window,k=y.nodeName&&y.nodeName.toLowerCase(),k==="select"||k==="input"&&y.type==="file")var C=r1;else if(lf(y))if(zs)C=i1;else{C=u1;var R=l1}else(k=y.nodeName)&&k.toLowerCase()==="input"&&(y.type==="checkbox"||y.type==="radio")&&(C=o1);if(C&&(C=C(e,c))){Ts(g,C,t,v);break e}R&&R(e,y,c),e==="focusout"&&(R=y._wrapperState)&&R.controlled&&y.type==="number"&&Po(y,"number",y.value)}switch(R=c?dt(c):window,e){case"focusin":if(lf(R)||R.contentEditable==="true")st=R,Ho=c,dr=null;break;case"focusout":dr=Ho=st=null;break;case"mousedown":Ao=!0;break;case"contextmenu":case"mouseup":case"dragend":Ao=!1,ff(g,t,v);break;case"selectionchange":if(s1)break;case"keydown":case"keyup":ff(g,t,v)}var D;if(Ti)e:{switch(e){case"compositionstart":var M="onCompositionStart";break e;case"compositionend":M="onCompositionEnd";break e;case"compositionupdate":M="onCompositionUpdate";break e}M=void 0}else ft?Ns(e,t)&&(M="onCompositionEnd"):e==="keydown"&&t.keyCode===229&&(M="onCompositionStart");if(M&&(Cs&&t.locale!=="ko"&&(ft||M!=="onCompositionStart"?M==="onCompositionEnd"&&ft&&(D=_s()):(dn=v,Ci=("value"in dn)?dn.value:dn.textContent,ft=!0)),R=Gl(c,M),0<R.length&&(M=new ef(M,e,null,t,v),g.push({event:M,listeners:R}),D?M.data=D:(D=Ps(t),D!==null&&(M.data=D)))),D=j0?b0(e,t):e1(e,t))c=Gl(c,"onBeforeInput"),0<c.length&&(v=new ef("onBeforeInput","beforeinput",null,t,v),g.push({event:v,listeners:c}),v.data=D)}Hs(g,n)})}function Pr(e,n,t){return{instance:e,listener:n,currentTarget:t}}function Gl(e,n){for(var t=n+"Capture",r=[];e!==null;){var l=e,u=l.stateNode;l.tag===5&&u!==null&&(l=u,u=wr(e,t),u!=null&&r.unshift(Pr(e,u,l)),u=wr(e,n),u!=null&&r.push(Pr(e,u,l))),e=e.return}return r}function ut(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5);return e?e:null}function df(e,n,t,r,l){for(var u=n._reactName,o=[];t!==null&&t!==r;){var i=t,a=i.alternate,c=i.stateNode;if(a!==null&&a===r)break;i.tag===5&&c!==null&&(i=c,l?(a=wr(t,u),a!=null&&o.unshift(Pr(t,a,i))):l||(a=wr(t,u),a!=null&&o.push(Pr(t,a,i)))),t=t.return}o.length!==0&&e.push({event:n,listeners:o})}function pf(e){return(typeof e==="string"?e:""+e).replace(d1,`
`).replace(p1,"")}function Cl(e,n,t){if(n=pf(n),pf(e)!==n&&t)throw Error(E(425))}function Zl(){}function xo(e,n){return e==="textarea"||e==="noscript"||typeof n.children==="string"||typeof n.children==="number"||typeof n.dangerouslySetInnerHTML==="object"&&n.dangerouslySetInnerHTML!==null&&n.dangerouslySetInnerHTML.__html!=null}function y1(e){setTimeout(function(){throw e})}function ao(e,n){var t=n,r=0;do{var l=t.nextSibling;if(e.removeChild(t),l&&l.nodeType===8)if(t=l.data,t==="/$"){if(r===0){e.removeChild(l),kr(n);return}r--}else t!=="$"&&t!=="$?"&&t!=="$!"||r++;t=l}while(t);kr(n)}function vn(e){for(;e!=null;e=e.nextSibling){var n=e.nodeType;if(n===1||n===3)break;if(n===8){if(n=e.data,n==="$"||n==="$!"||n==="$?")break;if(n==="/$")return null}}return e}function mf(e){e=e.previousSibling;for(var n=0;e;){if(e.nodeType===8){var t=e.data;if(t==="$"||t==="$!"||t==="$?"){if(n===0)return e;n--}else t==="/$"&&n++}e=e.previousSibling}return null}function An(e){var n=e[Qe];if(n)return n;for(var t=e.parentNode;t;){if(n=t[je]||t[Qe]){if(t=n.alternate,n.child!==null||t!==null&&t.child!==null)for(e=mf(e);e!==null;){if(t=e[Qe])return t;e=mf(e)}return n}e=t,t=e.parentNode}return null}function Ur(e){return e=e[Qe]||e[je],!e||e.tag!==5&&e.tag!==6&&e.tag!==13&&e.tag!==3?null:e}function dt(e){if(e.tag===5||e.tag===6)return e.stateNode;throw Error(E(33))}function mu(e){return e[Tr]||null}function Nn(e){return{current:e}}function Q(e){0>pt||(e.current=Xo[pt],Xo[pt]=null,pt--)}function A(e,n){pt++,Xo[pt]=e.current,e.current=n}function Pt(e,n){var t=e.type.contextTypes;if(!t)return _n;var r=e.stateNode;if(r&&r.__reactInternalMemoizedUnmaskedChildContext===n)return r.__reactInternalMemoizedMaskedChildContext;var l={},u;for(u in t)l[u]=n[u];return r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=n,e.__reactInternalMemoizedMaskedChildContext=l),l}function ye(e){return e=e.childContextTypes,e!==null&&e!==void 0}function Jl(){Q(me),Q(ae)}function yf(e,n,t){if(ae.current!==_n)throw Error(E(168));A(ae,n),A(me,t)}function Ws(e,n,t){var r=e.stateNode;if(n=n.childContextTypes,typeof r.getChildContext!=="function")return t;r=r.getChildContext();for(var l in r)if(!(l in n))throw Error(E(108,l0(e)||"Unknown",l));return X({},t,r)}function ql(e){return e=(e=e.stateNode)&&e.__reactInternalMemoizedMergedChildContext||_n,xn=ae.current,A(ae,e),A(me,me.current),!0}function vf(e,n,t){var r=e.stateNode;if(!r)throw Error(E(169));t?(e=Ws(e,n,xn),r.__reactInternalMemoizedMergedChildContext=e,Q(me),Q(ae),A(ae,e)):Q(me),A(me,t)}function Vs(e){Xe===null?Xe=[e]:Xe.push(e)}function w1(e){yu=!0,Vs(e)}function Pn(){if(!fo&&Xe!==null){fo=!0;var e=0,n=H;try{var t=Xe;for(H=1;e<t.length;e++){var r=t[e];do r=r(!0);while(r!==null)}Xe=null,yu=!1}catch(l){throw Xe!==null&&(Xe=Xe.slice(e+1)),ds(Si,Pn),l}finally{H=n,fo=!1}}return null}function $n(e,n){ht[mt++]=bl,ht[mt++]=jl,jl=e,bl=n}function Qs(e,n,t){Ce[Ne++]=Ge,Ce[Ne++]=Ze,Ce[Ne++]=Yn,Yn=e;var r=Ge;e=Ze;var l=32-Ie(r)-1;r&=~(1<<l),t+=1;var u=32-Ie(n)+l;if(30<u){var o=l-l%5;u=(r&(1<<o)-1).toString(32),r>>=o,l-=o,Ge=1<<32-Ie(n)+l|t<<l|r,Ze=u+e}else Ge=1<<u|t<<l|r,Ze=e}function Di(e){e.return!==null&&($n(e,1),Qs(e,1,0))}function Oi(e){for(;e===jl;)jl=ht[--mt],ht[mt]=null,bl=ht[--mt],ht[mt]=null;for(;e===Yn;)Yn=Ce[--Ne],Ce[Ne]=null,Ze=Ce[--Ne],Ce[Ne]=null,Ge=Ce[--Ne],Ce[Ne]=null}function Bs(e,n){var t=Pe(5,null,null,0);t.elementType="DELETED",t.stateNode=n,t.return=e,n=e.deletions,n===null?(e.deletions=[t],e.flags|=16):n.push(t)}function gf(e,n){switch(e.tag){case 5:var t=e.type;return n=n.nodeType!==1||t.toLowerCase()!==n.nodeName.toLowerCase()?null:n,n!==null?(e.stateNode=n,Ee=e,Se=vn(n.firstChild),!0):!1;case 6:return n=e.pendingProps===""||n.nodeType!==3?null:n,n!==null?(e.stateNode=n,Ee=e,Se=null,!0):!1;case 13:return n=n.nodeType!==8?null:n,n!==null?(t=Yn!==null?{id:Ge,overflow:Ze}:null,e.memoizedState={dehydrated:n,treeContext:t,retryLane:1073741824},t=Pe(18,null,null,0),t.stateNode=n,t.return=e,e.child=t,Ee=e,Se=null,!0):!1;default:return!1}}function Go(e){return(e.mode&1)!==0&&(e.flags&128)===0}function Zo(e){if(B){var n=Se;if(n){var t=n;if(!gf(e,n)){if(Go(e))throw Error(E(418));n=vn(t.nextSibling);var r=Ee;n&&gf(e,n)?Bs(r,t):(e.flags=e.flags&-4097|2,B=!1,Ee=e)}}else{if(Go(e))throw Error(E(418));e.flags=e.flags&-4097|2,B=!1,Ee=e}}}function wf(e){for(e=e.return;e!==null&&e.tag!==5&&e.tag!==3&&e.tag!==13;)e=e.return;Ee=e}function Nl(e){if(e!==Ee)return!1;if(!B)return wf(e),B=!0,!1;var n;if((n=e.tag!==3)&&!(n=e.tag!==5)&&(n=e.type,n=n!=="head"&&n!=="body"&&!xo(e.type,e.memoizedProps)),n&&(n=Se)){if(Go(e))throw xs(),Error(E(418));for(;n;)Bs(e,n),n=vn(n.nextSibling)}if(wf(e),e.tag===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(E(317));e:{e=e.nextSibling;for(n=0;e;){if(e.nodeType===8){var t=e.data;if(t==="/$"){if(n===0){Se=vn(e.nextSibling);break e}n--}else t!=="$"&&t!=="$!"&&t!=="$?"||n++}e=e.nextSibling}Se=null}}else Se=Ee?vn(e.stateNode.nextSibling):null;return!0}function xs(){for(var e=Se;e;)e=vn(e.nextSibling)}function Tt(){Se=Ee=null,B=!1}function Ri(e){Le===null?Le=[e]:Le.push(e)}function qt(e,n,t){if(e=t.ref,e!==null&&typeof e!=="function"&&typeof e!=="object"){if(t._owner){if(t=t._owner,t){if(t.tag!==1)throw Error(E(309));var r=t.stateNode}if(!r)throw Error(E(147,e));var l=r,u=""+e;if(n!==null&&n.ref!==null&&typeof n.ref==="function"&&n.ref._stringRef===u)return n.ref;return n=function(o){var i=l.refs;o===null?delete i[u]:i[u]=o},n._stringRef=u,n}if(typeof e!=="string")throw Error(E(284));if(!t._owner)throw Error(E(290,e))}return e}function Pl(e,n){throw e=Object.prototype.toString.call(n),Error(E(31,e==="[object Object]"?"object with keys {"+Object.keys(n).join(", ")+"}":e))}function Sf(e){var n=e._init;return n(e._payload)}function Ys(e){function n(s,f){if(e){var d=s.deletions;d===null?(s.deletions=[f],s.flags|=16):d.push(f)}}function t(s,f){if(!e)return null;for(;f!==null;)n(s,f),f=f.sibling;return null}function r(s,f){for(s=new Map;f!==null;)f.key!==null?s.set(f.key,f):s.set(f.index,f),f=f.sibling;return s}function l(s,f){return s=En(s,f),s.index=0,s.sibling=null,s}function u(s,f,d){if(s.index=d,!e)return s.flags|=1048576,f;if(d=s.alternate,d!==null)return d=d.index,d<f?(s.flags|=2,f):d;return s.flags|=2,f}function o(s){return e&&s.alternate===null&&(s.flags|=2),s}function i(s,f,d,w){if(f===null||f.tag!==6)return f=vo(d,s.mode,w),f.return=s,f;return f=l(f,d),f.return=s,f}function a(s,f,d,w){var C=d.type;if(C===at)return v(s,f,d.props.children,w,d.key);if(f!==null&&(f.elementType===C||typeof C==="object"&&C!==null&&C.$$typeof===an&&Sf(C)===f.type))return w=l(f,d.props),w.ref=qt(s,f,d),w.return=s,w;return w=Wl(d.type,d.key,d.props,null,s.mode,w),w.ref=qt(s,f,d),w.return=s,w}function c(s,f,d,w){if(f===null||f.tag!==4||f.stateNode.containerInfo!==d.containerInfo||f.stateNode.implementation!==d.implementation)return f=go(d,s.mode,w),f.return=s,f;return f=l(f,d.children||[]),f.return=s,f}function v(s,f,d,w,C){if(f===null||f.tag!==7)return f=Bn(d,s.mode,w,C),f.return=s,f;return f=l(f,d),f.return=s,f}function g(s,f,d){if(typeof f==="string"&&f!==""||typeof f==="number")return f=vo(""+f,s.mode,d),f.return=s,f;if(typeof f==="object"&&f!==null){switch(f.$$typeof){case ml:return d=Wl(f.type,f.key,f.props,null,s.mode,d),d.ref=qt(s,null,f),d.return=s,d;case it:return f=go(f,s.mode,d),f.return=s,f;case an:var w=f._init;return g(s,w(f._payload),d)}if(nr(f)||Xt(f))return f=Bn(f,s.mode,d,null),f.return=s,f;Pl(s,f)}return null}function y(s,f,d,w){var C=f!==null?f.key:null;if(typeof d==="string"&&d!==""||typeof d==="number")return C!==null?null:i(s,f,""+d,w);if(typeof d==="object"&&d!==null){switch(d.$$typeof){case ml:return d.key===C?a(s,f,d,w):null;case it:return d.key===C?c(s,f,d,w):null;case an:return C=d._init,y(s,f,C(d._payload),w)}if(nr(d)||Xt(d))return C!==null?null:v(s,f,d,w,null);Pl(s,d)}return null}function k(s,f,d,w,C){if(typeof w==="string"&&w!==""||typeof w==="number")return s=s.get(d)||null,i(f,s,""+w,C);if(typeof w==="object"&&w!==null){switch(w.$$typeof){case ml:return s=s.get(w.key===null?d:w.key)||null,a(f,s,w,C);case it:return s=s.get(w.key===null?d:w.key)||null,c(f,s,w,C);case an:var R=w._init;return k(s,f,d,R(w._payload),C)}if(nr(w)||Xt(w))return s=s.get(d)||null,v(f,s,w,C,null);Pl(f,w)}return null}function N(s,f,d,w){for(var C=null,R=null,D=f,M=f=0,z=null;D!==null&&M<d.length;M++){D.index>M?(z=D,D=null):z=D.sibling;var O=y(s,D,d[M],w);if(O===null){D===null&&(D=z);break}e&&D&&O.alternate===null&&n(s,D),f=u(O,f,M),R===null?C=O:R.sibling=O,R=O,D=z}if(M===d.length)return t(s,D),B&&$n(s,M),C;if(D===null){for(;M<d.length;M++)D=g(s,d[M],w),D!==null&&(f=u(D,f,M),R===null?C=D:R.sibling=D,R=D);return B&&$n(s,M),C}for(D=r(s,D);M<d.length;M++)z=k(D,s,M,d[M],w),z!==null&&(e&&z.alternate!==null&&D.delete(z.key===null?M:z.key),f=u(z,f,M),R===null?C=z:R.sibling=z,R=z);return e&&D.forEach(function(W){return n(s,W)}),B&&$n(s,M),C}function h(s,f,d,w){var C=Xt(d);if(typeof C!=="function")throw Error(E(150));if(d=C.call(d),d==null)throw Error(E(151));for(var R=C=null,D=f,M=f=0,z=null,O=d.next();D!==null&&!O.done;M++,O=d.next()){D.index>M?(z=D,D=null):z=D.sibling;var W=y(s,D,O.value,w);if(W===null){D===null&&(D=z);break}e&&D&&W.alternate===null&&n(s,D),f=u(W,f,M),R===null?C=W:R.sibling=W,R=W,D=z}if(O.done)return t(s,D),B&&$n(s,M),C;if(D===null){for(;!O.done;M++,O=d.next())O=g(s,O.value,w),O!==null&&(f=u(O,f,M),R===null?C=O:R.sibling=O,R=O);return B&&$n(s,M),C}for(D=r(s,D);!O.done;M++,O=d.next())O=k(D,s,M,O.value,w),O!==null&&(e&&O.alternate!==null&&D.delete(O.key===null?M:O.key),f=u(O,f,M),R===null?C=O:R.sibling=O,R=O);return e&&D.forEach(function(et){return n(s,et)}),B&&$n(s,M),C}function T(s,f,d,w){if(typeof d==="object"&&d!==null&&d.type===at&&d.key===null&&(d=d.props.children),typeof d==="object"&&d!==null){switch(d.$$typeof){case ml:e:{for(var C=d.key,R=f;R!==null;){if(R.key===C){if(C=d.type,C===at){if(R.tag===7){t(s,R.sibling),f=l(R,d.props.children),f.return=s,s=f;break e}}else if(R.elementType===C||typeof C==="object"&&C!==null&&C.$$typeof===an&&Sf(C)===R.type){t(s,R.sibling),f=l(R,d.props),f.ref=qt(s,R,d),f.return=s,s=f;break e}t(s,R);break}else n(s,R);R=R.sibling}d.type===at?(f=Bn(d.props.children,s.mode,w,d.key),f.return=s,s=f):(w=Wl(d.type,d.key,d.props,null,s.mode,w),w.ref=qt(s,f,d),w.return=s,s=w)}return o(s);case it:e:{for(R=d.key;f!==null;){if(f.key===R)if(f.tag===4&&f.stateNode.containerInfo===d.containerInfo&&f.stateNode.implementation===d.implementation){t(s,f.sibling),f=l(f,d.children||[]),f.return=s,s=f;break e}else{t(s,f);break}else n(s,f);f=f.sibling}f=go(d,s.mode,w),f.return=s,s=f}return o(s);case an:return R=d._init,T(s,f,R(d._payload),w)}if(nr(d))return N(s,f,d,w);if(Xt(d))return h(s,f,d,w);Pl(s,d)}return typeof d==="string"&&d!==""||typeof d==="number"?(d=""+d,f!==null&&f.tag===6?(t(s,f.sibling),f=l(f,d),f.return=s,s=f):(t(s,f),f=vo(d,s.mode,w),f.return=s,s=f),o(s)):t(s,f)}return T}function Fi(){Mi=yt=nu=null}function Li(e){var n=eu.current;Q(eu),e._currentValue=n}function Jo(e,n,t){for(;e!==null;){var r=e.alternate;if((e.childLanes&n)!==n?(e.childLanes|=n,r!==null&&(r.childLanes|=n)):r!==null&&(r.childLanes&n)!==n&&(r.childLanes|=n),e===t)break;e=e.return}}function _t(e,n){nu=e,Mi=yt=null,e=e.dependencies,e!==null&&e.firstContext!==null&&((e.lanes&n)!==0&&(he=!0),e.firstContext=null)}function ze(e){var n=e._currentValue;if(Mi!==e)if(e={context:e,memoizedValue:n,next:null},yt===null){if(nu===null)throw Error(E(308));yt=e,nu.dependencies={lanes:0,firstContext:e}}else yt=yt.next=e;return n}function Ii(e){Wn===null?Wn=[e]:Wn.push(e)}function Xs(e,n,t,r){var l=n.interleaved;return l===null?(t.next=t,Ii(n)):(t.next=l.next,l.next=t),n.interleaved=t,be(e,r)}function be(e,n){e.lanes|=n;var t=e.alternate;t!==null&&(t.lanes|=n),t=e;for(e=e.return;e!==null;)e.childLanes|=n,t=e.alternate,t!==null&&(t.childLanes|=n),t=e,e=e.return;return t.tag===3?t.stateNode:null}function Ui(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function Gs(e,n){e=e.updateQueue,n.updateQueue===e&&(n.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,effects:e.effects})}function Je(e,n){return{eventTime:e,lane:n,tag:0,payload:null,callback:null,next:null}}function gn(e,n,t){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,($&2)!==0){var l=r.pending;return l===null?n.next=n:(n.next=l.next,l.next=n),r.pending=n,be(e,t)}return l=r.interleaved,l===null?(n.next=n,Ii(r)):(n.next=l.next,l.next=n),r.interleaved=n,be(e,t)}function Ll(e,n,t){if(n=n.updateQueue,n!==null&&(n=n.shared,(t&4194240)!==0)){var r=n.lanes;r&=e.pendingLanes,t|=r,n.lanes=t,Ei(e,t)}}function Ef(e,n){var{updateQueue:t,alternate:r}=e;if(r!==null&&(r=r.updateQueue,t===r)){var l=null,u=null;if(t=t.firstBaseUpdate,t!==null){do{var o={eventTime:t.eventTime,lane:t.lane,tag:t.tag,payload:t.payload,callback:t.callback,next:null};u===null?l=u=o:u=u.next=o,t=t.next}while(t!==null);u===null?l=u=n:u=u.next=n}else l=u=n;t={baseState:r.baseState,firstBaseUpdate:l,lastBaseUpdate:u,shared:r.shared,effects:r.effects},e.updateQueue=t;return}e=t.lastBaseUpdate,e===null?t.firstBaseUpdate=n:e.next=n,t.lastBaseUpdate=n}function tu(e,n,t,r){var l=e.updateQueue;fn=!1;var{firstBaseUpdate:u,lastBaseUpdate:o}=l,i=l.shared.pending;if(i!==null){l.shared.pending=null;var a=i,c=a.next;a.next=null,o===null?u=c:o.next=c,o=a;var v=e.alternate;v!==null&&(v=v.updateQueue,i=v.lastBaseUpdate,i!==o&&(i===null?v.firstBaseUpdate=c:i.next=c,v.lastBaseUpdate=a))}if(u!==null){var g=l.baseState;o=0,v=c=a=null,i=u;do{var{lane:y,eventTime:k}=i;if((r&y)===y){v!==null&&(v=v.next={eventTime:k,lane:0,tag:i.tag,payload:i.payload,callback:i.callback,next:null});e:{var N=e,h=i;switch(y=n,k=t,h.tag){case 1:if(N=h.payload,typeof N==="function"){g=N.call(k,g,y);break e}g=N;break e;case 3:N.flags=N.flags&-65537|128;case 0:if(N=h.payload,y=typeof N==="function"?N.call(k,g,y):N,y===null||y===void 0)break e;g=X({},g,y);break e;case 2:fn=!0}}i.callback!==null&&i.lane!==0&&(e.flags|=64,y=l.effects,y===null?l.effects=[i]:y.push(i))}else k={eventTime:k,lane:y,tag:i.tag,payload:i.payload,callback:i.callback,next:null},v===null?(c=v=k,a=g):v=v.next=k,o|=y;if(i=i.next,i===null)if(i=l.shared.pending,i===null)break;else y=i,i=y.next,y.next=null,l.lastBaseUpdate=y,l.shared.pending=null}while(1);if(v===null&&(a=g),l.baseState=a,l.firstBaseUpdate=c,l.lastBaseUpdate=v,n=l.shared.interleaved,n!==null){l=n;do o|=l.lane,l=l.next;while(l!==n)}else u===null&&(l.shared.lanes=0);Xn|=o,e.lanes=o,e.memoizedState=g}}function kf(e,n,t){if(e=n.effects,n.effects=null,e!==null)for(n=0;n<e.length;n++){var r=e[n],l=r.callback;if(l!==null){if(r.callback=null,r=t,typeof l!=="function")throw Error(E(191,l));l.call(r)}}}function Vn(e){if(e===$r)throw Error(E(174));return e}function $i(e,n){switch(A(Dr,n),A(zr,e),A(xe,$r),e=n.nodeType,e){case 9:case 11:n=(n=n.documentElement)?n.namespaceURI:zo(null,"");break;default:e=e===8?n.parentNode:n,n=e.namespaceURI||null,e=e.tagName,n=zo(n,e)}Q(xe),A(xe,n)}function Dt(){Q(xe),Q(zr),Q(Dr)}function Zs(e){Vn(Dr.current);var n=Vn(xe.current),t=zo(n,e.type);n!==t&&(A(zr,e),A(xe,t))}function Hi(e){zr.current===e&&(Q(xe),Q(zr))}function ru(e){for(var n=e;n!==null;){if(n.tag===13){var t=n.memoizedState;if(t!==null&&(t=t.dehydrated,t===null||t.data==="$?"||t.data==="$!"))return n}else if(n.tag===19&&n.memoizedProps.revealOrder!==void 0){if((n.flags&128)!==0)return n}else if(n.child!==null){n.child.return=n,n=n.child;continue}if(n===e)break;for(;n.sibling===null;){if(n.return===null||n.return===e)return null;n=n.return}n.sibling.return=n.return,n=n.sibling}return null}function Ai(){for(var e=0;e<so.length;e++)so[e]._workInProgressVersionPrimary=null;so.length=0}function ue(){throw Error(E(321))}function Wi(e,n){if(n===null)return!1;for(var t=0;t<n.length&&t<e.length;t++)if(!$e(e[t],n[t]))return!1;return!0}function Vi(e,n,t,r,l,u){if(Kn=u,K=n,n.memoizedState=null,n.updateQueue=null,n.lanes=0,Il.current=e===null||e.memoizedState===null?N1:P1,e=t(r,l),pr){u=0;do{if(pr=!1,Or=0,25<=u)throw Error(E(301));u+=1,b=q=null,n.updateQueue=null,Il.current=T1,e=t(r,l)}while(pr)}if(Il.current=uu,n=q!==null&&q.next!==null,Kn=0,b=q=K=null,lu=!1,n)throw Error(E(300));return e}function Qi(){var e=Or!==0;return Or=0,e}function Ve(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return b===null?K.memoizedState=b=e:b=b.next=e,b}function De(){if(q===null){var e=K.alternate;e=e!==null?e.memoizedState:null}else e=q.next;var n=b===null?K.memoizedState:b.next;if(n!==null)b=n,q=e;else{if(e===null)throw Error(E(310));q=e,e={memoizedState:q.memoizedState,baseState:q.baseState,baseQueue:q.baseQueue,queue:q.queue,next:null},b===null?K.memoizedState=b=e:b=b.next=e}return b}function Rr(e,n){return typeof n==="function"?n(e):n}function po(e){var n=De(),t=n.queue;if(t===null)throw Error(E(311));t.lastRenderedReducer=e;var r=q,l=r.baseQueue,u=t.pending;if(u!==null){if(l!==null){var o=l.next;l.next=u.next,u.next=o}r.baseQueue=l=u,t.pending=null}if(l!==null){u=l.next,r=r.baseState;var i=o=null,a=null,c=u;do{var v=c.lane;if((Kn&v)===v)a!==null&&(a=a.next={lane:0,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),r=c.hasEagerState?c.eagerState:e(r,c.action);else{var g={lane:v,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null};a===null?(i=a=g,o=r):a=a.next=g,K.lanes|=v,Xn|=v}c=c.next}while(c!==null&&c!==u);a===null?o=r:a.next=i,$e(r,n.memoizedState)||(he=!0),n.memoizedState=r,n.baseState=o,n.baseQueue=a,t.lastRenderedState=r}if(e=t.interleaved,e!==null){l=e;do u=l.lane,K.lanes|=u,Xn|=u,l=l.next;while(l!==e)}else l===null&&(t.lanes=0);return[n.memoizedState,t.dispatch]}function ho(e){var n=De(),t=n.queue;if(t===null)throw Error(E(311));t.lastRenderedReducer=e;var{dispatch:r,pending:l}=t,u=n.memoizedState;if(l!==null){t.pending=null;var o=l=l.next;do u=e(u,o.action),o=o.next;while(o!==l);$e(u,n.memoizedState)||(he=!0),n.memoizedState=u,n.baseQueue===null&&(n.baseState=u),t.lastRenderedState=u}return[u,r]}function Js(){}function qs(e,n){var t=K,r=De(),l=n(),u=!$e(r.memoizedState,l);if(u&&(r.memoizedState=l,he=!0),r=r.queue,Bi(ec.bind(null,t,r,e),[e]),r.getSnapshot!==n||u||b!==null&&b.memoizedState.tag&1){if(t.flags|=2048,Mr(9,bs.bind(null,t,r,l,n),void 0,null),ee===null)throw Error(E(349));(Kn&30)!==0||js(t,n,l)}return l}function js(e,n,t){e.flags|=16384,e={getSnapshot:n,value:t},n=K.updateQueue,n===null?(n={lastEffect:null,stores:null},K.updateQueue=n,n.stores=[e]):(t=n.stores,t===null?n.stores=[e]:t.push(e))}function bs(e,n,t,r){n.value=t,n.getSnapshot=r,nc(n)&&tc(e)}function ec(e,n,t){return t(function(){nc(n)&&tc(e)})}function nc(e){var n=e.getSnapshot;e=e.value;try{var t=n();return!$e(e,t)}catch(r){return!0}}function tc(e){var n=be(e,1);n!==null&&Ue(n,e,1,-1)}function _f(e){var n=Ve();return typeof e==="function"&&(e=e()),n.memoizedState=n.baseState=e,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Rr,lastRenderedState:e},n.queue=e,e=e.dispatch=C1.bind(null,K,e),[n.memoizedState,e]}function Mr(e,n,t,r){return e={tag:e,create:n,destroy:t,deps:r,next:null},n=K.updateQueue,n===null?(n={lastEffect:null,stores:null},K.updateQueue=n,n.lastEffect=e.next=e):(t=n.lastEffect,t===null?n.lastEffect=e.next=e:(r=t.next,t.next=e,e.next=r,n.lastEffect=e)),e}function rc(){return De().memoizedState}function Ul(e,n,t,r){var l=Ve();K.flags|=e,l.memoizedState=Mr(1|n,t,void 0,r===void 0?null:r)}function vu(e,n,t,r){var l=De();r=r===void 0?null:r;var u=void 0;if(q!==null){var o=q.memoizedState;if(u=o.destroy,r!==null&&Wi(r,o.deps)){l.memoizedState=Mr(n,t,u,r);return}}K.flags|=e,l.memoizedState=Mr(1|n,t,u,r)}function Cf(e,n){return Ul(8390656,8,e,n)}function Bi(e,n){return vu(2048,8,e,n)}function lc(e,n){return vu(4,2,e,n)}function uc(e,n){return vu(4,4,e,n)}function oc(e,n){if(typeof n==="function")return e=e(),n(e),function(){n(null)};if(n!==null&&n!==void 0)return e=e(),n.current=e,function(){n.current=null}}function ic(e,n,t){return t=t!==null&&t!==void 0?t.concat([e]):null,vu(4,4,oc.bind(null,n,e),t)}function xi(){}function ac(e,n){var t=De();n=n===void 0?null:n;var r=t.memoizedState;if(r!==null&&n!==null&&Wi(n,r[1]))return r[0];return t.memoizedState=[e,n],e}function fc(e,n){var t=De();n=n===void 0?null:n;var r=t.memoizedState;if(r!==null&&n!==null&&Wi(n,r[1]))return r[0];return e=e(),t.memoizedState=[e,n],e}function sc(e,n,t){if((Kn&21)===0)return e.baseState&&(e.baseState=!1,he=!0),e.memoizedState=t;return $e(t,n)||(t=ms(),K.lanes|=t,Xn|=t,e.baseState=!0),n}function k1(e,n){var t=H;H=t!==0&&4>t?t:4,e(!0);var r=co.transition;co.transition={};try{e(!1),n()}finally{H=t,co.transition=r}}function cc(){return De().memoizedState}function _1(e,n,t){var r=Sn(e);if(t={lane:r,action:t,hasEagerState:!1,eagerState:null,next:null},dc(e))pc(n,t);else if(t=Xs(e,n,t,r),t!==null){var l=ce();Ue(t,e,r,l),hc(t,n,r)}}function C1(e,n,t){var r=Sn(e),l={lane:r,action:t,hasEagerState:!1,eagerState:null,next:null};if(dc(e))pc(n,l);else{var u=e.alternate;if(e.lanes===0&&(u===null||u.lanes===0)&&(u=n.lastRenderedReducer,u!==null))try{var o=n.lastRenderedState,i=u(o,t);if(l.hasEagerState=!0,l.eagerState=i,$e(i,o)){var a=n.interleaved;a===null?(l.next=l,Ii(n)):(l.next=a.next,a.next=l),n.interleaved=l;return}}catch(c){}finally{}t=Xs(e,n,l,r),t!==null&&(l=ce(),Ue(t,e,r,l),hc(t,n,r))}}function dc(e){var n=e.alternate;return e===K||n!==null&&n===K}function pc(e,n){pr=lu=!0;var t=e.pending;t===null?n.next=n:(n.next=t.next,t.next=n),e.pending=n}function hc(e,n,t){if((t&4194240)!==0){var r=n.lanes;r&=e.pendingLanes,t|=r,n.lanes=t,Ei(e,t)}}function Me(e,n){if(e&&e.defaultProps){n=X({},n),e=e.defaultProps;for(var t in e)n[t]===void 0&&(n[t]=e[t]);return n}return n}function qo(e,n,t,r){n=e.memoizedState,t=t(r,n),t=t===null||t===void 0?n:X({},n,t),e.memoizedState=t,e.lanes===0&&(e.updateQueue.baseState=t)}function Nf(e,n,t,r,l,u,o){return e=e.stateNode,typeof e.shouldComponentUpdate==="function"?e.shouldComponentUpdate(r,u,o):n.prototype&&n.prototype.isPureReactComponent?!Cr(t,r)||!Cr(l,u):!0}function mc(e,n,t){var r=!1,l=_n,u=n.contextType;return typeof u==="object"&&u!==null?u=ze(u):(l=ye(n)?xn:ae.current,r=n.contextTypes,u=(r=r!==null&&r!==void 0)?Pt(e,l):_n),n=new n(t,u),e.memoizedState=n.state!==null&&n.state!==void 0?n.state:null,n.updater=gu,e.stateNode=n,n._reactInternals=e,r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=l,e.__reactInternalMemoizedMaskedChildContext=u),n}function Pf(e,n,t,r){e=n.state,typeof n.componentWillReceiveProps==="function"&&n.componentWillReceiveProps(t,r),typeof n.UNSAFE_componentWillReceiveProps==="function"&&n.UNSAFE_componentWillReceiveProps(t,r),n.state!==e&&gu.enqueueReplaceState(n,n.state,null)}function jo(e,n,t,r){var l=e.stateNode;l.props=t,l.state=e.memoizedState,l.refs={},Ui(e);var u=n.contextType;typeof u==="object"&&u!==null?l.context=ze(u):(u=ye(n)?xn:ae.current,l.context=Pt(e,u)),l.state=e.memoizedState,u=n.getDerivedStateFromProps,typeof u==="function"&&(qo(e,n,u,t),l.state=e.memoizedState),typeof n.getDerivedStateFromProps==="function"||typeof l.getSnapshotBeforeUpdate==="function"||typeof l.UNSAFE_componentWillMount!=="function"&&typeof l.componentWillMount!=="function"||(n=l.state,typeof l.componentWillMount==="function"&&l.componentWillMount(),typeof l.UNSAFE_componentWillMount==="function"&&l.UNSAFE_componentWillMount(),n!==l.state&&gu.enqueueReplaceState(l,l.state,null),tu(e,t,l,r),l.state=e.memoizedState),typeof l.componentDidMount==="function"&&(e.flags|=4194308)}function Ot(e,n){try{var t="",r=n;do t+=r0(r),r=r.return;while(r);var l=t}catch(u){l=`
Error generating stack: `+u.message+`
`+u.stack}return{value:e,source:n,stack:l,digest:null}}function mo(e,n,t){return{value:e,source:null,stack:t!=null?t:null,digest:n!=null?n:null}}function bo(e,n){try{console.error(n.value)}catch(t){setTimeout(function(){throw t})}}function yc(e,n,t){t=Je(-1,t),t.tag=3,t.payload={element:null};var r=n.value;return t.callback=function(){iu||(iu=!0,fi=r),bo(e,n)},t}function vc(e,n,t){t=Je(-1,t),t.tag=3;var r=e.type.getDerivedStateFromError;if(typeof r==="function"){var l=n.value;t.payload=function(){return r(l)},t.callback=function(){bo(e,n)}}var u=e.stateNode;return u!==null&&typeof u.componentDidCatch==="function"&&(t.callback=function(){bo(e,n),typeof r!=="function"&&(wn===null?wn=new Set([this]):wn.add(this));var o=n.stack;this.componentDidCatch(n.value,{componentStack:o!==null?o:""})}),t}function Tf(e,n,t){var r=e.pingCache;if(r===null){r=e.pingCache=new z1;var l=new Set;r.set(n,l)}else l=r.get(n),l===void 0&&(l=new Set,r.set(n,l));l.has(t)||(l.add(t),e=Q1.bind(null,e,n,t),n.then(e,e))}function zf(e){do{var n;if(n=e.tag===13)n=e.memoizedState,n=n!==null?n.dehydrated!==null?!0:!1:!0;if(n)return e;e=e.return}while(e!==null);return null}function Df(e,n,t,r,l){if((e.mode&1)===0)return e===n?e.flags|=65536:(e.flags|=128,t.flags|=131072,t.flags&=-52805,t.tag===1&&(t.alternate===null?t.tag=17:(n=Je(-1,1),n.tag=2,gn(t,n,1))),t.lanes|=1),e;return e.flags|=65536,e.lanes=l,e}function se(e,n,t,r){n.child=e===null?Ks(n,null,t,r):zt(n,e.child,t,r)}function Of(e,n,t,r,l){t=t.render;var u=n.ref;if(_t(n,l),r=Vi(e,n,t,r,u,l),t=Qi(),e!==null&&!he)return n.updateQueue=e.updateQueue,n.flags&=-2053,e.lanes&=~l,en(e,n,l);return B&&t&&Di(n),n.flags|=1,se(e,n,r,l),n.child}function Rf(e,n,t,r,l){if(e===null){var u=t.type;if(typeof u==="function"&&!ji(u)&&u.defaultProps===void 0&&t.compare===null&&t.defaultProps===void 0)return n.tag=15,n.type=u,gc(e,n,u,r,l);return e=Wl(t.type,null,r,n,n.mode,l),e.ref=n.ref,e.return=n,n.child=e}if(u=e.child,(e.lanes&l)===0){var o=u.memoizedProps;if(t=t.compare,t=t!==null?t:Cr,t(o,r)&&e.ref===n.ref)return en(e,n,l)}return n.flags|=1,e=En(u,r),e.ref=n.ref,e.return=n,n.child=e}function gc(e,n,t,r,l){if(e!==null){var u=e.memoizedProps;if(Cr(u,r)&&e.ref===n.ref)if(he=!1,n.pendingProps=r=u,(e.lanes&l)!==0)(e.flags&131072)!==0&&(he=!0);else return n.lanes=e.lanes,en(e,n,l)}return ei(e,n,t,r,l)}function wc(e,n,t){var r=n.pendingProps,l=r.children,u=e!==null?e.memoizedState:null;if(r.mode==="hidden")if((n.mode&1)===0)n.memoizedState={baseLanes:0,cachePool:null,transitions:null},A(gt,we),we|=t;else{if((t&1073741824)===0)return e=u!==null?u.baseLanes|t:t,n.lanes=n.childLanes=1073741824,n.memoizedState={baseLanes:e,cachePool:null,transitions:null},n.updateQueue=null,A(gt,we),we|=e,null;n.memoizedState={baseLanes:0,cachePool:null,transitions:null},r=u!==null?u.baseLanes:t,A(gt,we),we|=r}else u!==null?(r=u.baseLanes|t,n.memoizedState=null):r=t,A(gt,we),we|=r;return se(e,n,l,t),n.child}function Sc(e,n){var t=n.ref;if(e===null&&t!==null||e!==null&&e.ref!==t)n.flags|=512,n.flags|=2097152}function ei(e,n,t,r,l){var u=ye(t)?xn:ae.current;if(u=Pt(n,u),_t(n,l),t=Vi(e,n,t,r,u,l),r=Qi(),e!==null&&!he)return n.updateQueue=e.updateQueue,n.flags&=-2053,e.lanes&=~l,en(e,n,l);return B&&r&&Di(n),n.flags|=1,se(e,n,t,l),n.child}function Mf(e,n,t,r,l){if(ye(t)){var u=!0;ql(n)}else u=!1;if(_t(n,l),n.stateNode===null)$l(e,n),mc(n,t,r),jo(n,t,r,l),r=!0;else if(e===null){var{stateNode:o,memoizedProps:i}=n;o.props=i;var a=o.context,c=t.contextType;typeof c==="object"&&c!==null?c=ze(c):(c=ye(t)?xn:ae.current,c=Pt(n,c));var v=t.getDerivedStateFromProps,g=typeof v==="function"||typeof o.getSnapshotBeforeUpdate==="function";g||typeof o.UNSAFE_componentWillReceiveProps!=="function"&&typeof o.componentWillReceiveProps!=="function"||(i!==r||a!==c)&&Pf(n,o,r,c),fn=!1;var y=n.memoizedState;o.state=y,tu(n,r,o,l),a=n.memoizedState,i!==r||y!==a||me.current||fn?(typeof v==="function"&&(qo(n,t,v,r),a=n.memoizedState),(i=fn||Nf(n,t,i,r,y,a,c))?(g||typeof o.UNSAFE_componentWillMount!=="function"&&typeof o.componentWillMount!=="function"||(typeof o.componentWillMount==="function"&&o.componentWillMount(),typeof o.UNSAFE_componentWillMount==="function"&&o.UNSAFE_componentWillMount()),typeof o.componentDidMount==="function"&&(n.flags|=4194308)):(typeof o.componentDidMount==="function"&&(n.flags|=4194308),n.memoizedProps=r,n.memoizedState=a),o.props=r,o.state=a,o.context=c,r=i):(typeof o.componentDidMount==="function"&&(n.flags|=4194308),r=!1)}else{o=n.stateNode,Gs(e,n),i=n.memoizedProps,c=n.type===n.elementType?i:Me(n.type,i),o.props=c,g=n.pendingProps,y=o.context,a=t.contextType,typeof a==="object"&&a!==null?a=ze(a):(a=ye(t)?xn:ae.current,a=Pt(n,a));var k=t.getDerivedStateFromProps;(v=typeof k==="function"||typeof o.getSnapshotBeforeUpdate==="function")||typeof o.UNSAFE_componentWillReceiveProps!=="function"&&typeof o.componentWillReceiveProps!=="function"||(i!==g||y!==a)&&Pf(n,o,r,a),fn=!1,y=n.memoizedState,o.state=y,tu(n,r,o,l);var N=n.memoizedState;i!==g||y!==N||me.current||fn?(typeof k==="function"&&(qo(n,t,k,r),N=n.memoizedState),(c=fn||Nf(n,t,c,r,y,N,a)||!1)?(v||typeof o.UNSAFE_componentWillUpdate!=="function"&&typeof o.componentWillUpdate!=="function"||(typeof o.componentWillUpdate==="function"&&o.componentWillUpdate(r,N,a),typeof o.UNSAFE_componentWillUpdate==="function"&&o.UNSAFE_componentWillUpdate(r,N,a)),typeof o.componentDidUpdate==="function"&&(n.flags|=4),typeof o.getSnapshotBeforeUpdate==="function"&&(n.flags|=1024)):(typeof o.componentDidUpdate!=="function"||i===e.memoizedProps&&y===e.memoizedState||(n.flags|=4),typeof o.getSnapshotBeforeUpdate!=="function"||i===e.memoizedProps&&y===e.memoizedState||(n.flags|=1024),n.memoizedProps=r,n.memoizedState=N),o.props=r,o.state=N,o.context=a,r=c):(typeof o.componentDidUpdate!=="function"||i===e.memoizedProps&&y===e.memoizedState||(n.flags|=4),typeof o.getSnapshotBeforeUpdate!=="function"||i===e.memoizedProps&&y===e.memoizedState||(n.flags|=1024),r=!1)}return ni(e,n,t,r,u,l)}function ni(e,n,t,r,l,u){Sc(e,n);var o=(n.flags&128)!==0;if(!r&&!o)return l&&vf(n,t,!1),en(e,n,u);r=n.stateNode,D1.current=n;var i=o&&typeof t.getDerivedStateFromError!=="function"?null:r.render();return n.flags|=1,e!==null&&o?(n.child=zt(n,e.child,null,u),n.child=zt(n,null,i,u)):se(e,n,i,u),n.memoizedState=r.state,l&&vf(n,t,!0),n.child}function Ec(e){var n=e.stateNode;n.pendingContext?yf(e,n.pendingContext,n.pendingContext!==n.context):n.context&&yf(e,n.context,!1),$i(e,n.containerInfo)}function Ff(e,n,t,r,l){return Tt(),Ri(l),n.flags|=256,se(e,n,t,r),n.child}function ri(e){return{baseLanes:e,cachePool:null,transitions:null}}function kc(e,n,t){var r=n.pendingProps,l=Y.current,u=!1,o=(n.flags&128)!==0,i;if((i=o)||(i=e!==null&&e.memoizedState===null?!1:(l&2)!==0),i)u=!0,n.flags&=-129;else if(e===null||e.memoizedState!==null)l|=1;if(A(Y,l&1),e===null){if(Zo(n),e=n.memoizedState,e!==null&&(e=e.dehydrated,e!==null))return(n.mode&1)===0?n.lanes=1:e.data==="$!"?n.lanes=8:n.lanes=1073741824,null;return o=r.children,e=r.fallback,u?(r=n.mode,u=n.child,o={mode:"hidden",children:o},(r&1)===0&&u!==null?(u.childLanes=0,u.pendingProps=o):u=Eu(o,r,0,null),e=Bn(e,r,t,null),u.return=n,e.return=n,u.sibling=e,n.child=u,n.child.memoizedState=ri(t),n.memoizedState=ti,e):Yi(n,o)}if(l=e.memoizedState,l!==null&&(i=l.dehydrated,i!==null))return O1(e,n,o,r,i,l,t);if(u){u=r.fallback,o=n.mode,l=e.child,i=l.sibling;var a={mode:"hidden",children:r.children};return(o&1)===0&&n.child!==l?(r=n.child,r.childLanes=0,r.pendingProps=a,n.deletions=null):(r=En(l,a),r.subtreeFlags=l.subtreeFlags&14680064),i!==null?u=En(i,u):(u=Bn(u,o,t,null),u.flags|=2),u.return=n,r.return=n,r.sibling=u,n.child=r,r=u,u=n.child,o=e.child.memoizedState,o=o===null?ri(t):{baseLanes:o.baseLanes|t,cachePool:null,transitions:o.transitions},u.memoizedState=o,u.childLanes=e.childLanes&~t,n.memoizedState=ti,r}return u=e.child,e=u.sibling,r=En(u,{mode:"visible",children:r.children}),(n.mode&1)===0&&(r.lanes=t),r.return=n,r.sibling=null,e!==null&&(t=n.deletions,t===null?(n.deletions=[e],n.flags|=16):t.push(e)),n.child=r,n.memoizedState=null,r}function Yi(e,n){return n=Eu({mode:"visible",children:n},e.mode,0,null),n.return=e,e.child=n}function Tl(e,n,t,r){return r!==null&&Ri(r),zt(n,e.child,null,t),e=Yi(n,n.pendingProps.children),e.flags|=2,n.memoizedState=null,e}function O1(e,n,t,r,l,u,o){if(t){if(n.flags&256)return n.flags&=-257,r=mo(Error(E(422))),Tl(e,n,o,r);if(n.memoizedState!==null)return n.child=e.child,n.flags|=128,null;return u=r.fallback,l=n.mode,r=Eu({mode:"visible",children:r.children},l,0,null),u=Bn(u,l,o,null),u.flags|=2,r.return=n,u.return=n,r.sibling=u,n.child=r,(n.mode&1)!==0&&zt(n,e.child,null,o),n.child.memoizedState=ri(o),n.memoizedState=ti,u}if((n.mode&1)===0)return Tl(e,n,o,null);if(l.data==="$!"){if(r=l.nextSibling&&l.nextSibling.dataset,r)var i=r.dgst;return r=i,u=Error(E(419)),r=mo(u,r,void 0),Tl(e,n,o,r)}if(i=(o&e.childLanes)!==0,he||i){if(r=ee,r!==null){switch(o&-o){case 4:l=2;break;case 16:l=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:l=32;break;case 536870912:l=268435456;break;default:l=0}l=(l&(r.suspendedLanes|o))!==0?0:l,l!==0&&l!==u.retryLane&&(u.retryLane=l,be(e,l),Ue(r,e,l,-1))}return qi(),r=mo(Error(E(421))),Tl(e,n,o,r)}if(l.data==="$?")return n.flags|=128,n.child=e.child,n=B1.bind(null,e),l._reactRetry=n,null;return e=u.treeContext,Se=vn(l.nextSibling),Ee=n,B=!0,Le=null,e!==null&&(Ce[Ne++]=Ge,Ce[Ne++]=Ze,Ce[Ne++]=Yn,Ge=e.id,Ze=e.overflow,Yn=n),n=Yi(n,r.children),n.flags|=4096,n}function Lf(e,n,t){e.lanes|=n;var r=e.alternate;r!==null&&(r.lanes|=n),Jo(e.return,n,t)}function yo(e,n,t,r,l){var u=e.memoizedState;u===null?e.memoizedState={isBackwards:n,rendering:null,renderingStartTime:0,last:r,tail:t,tailMode:l}:(u.isBackwards=n,u.rendering=null,u.renderingStartTime=0,u.last=r,u.tail=t,u.tailMode=l)}function _c(e,n,t){var r=n.pendingProps,l=r.revealOrder,u=r.tail;if(se(e,n,r.children,t),r=Y.current,(r&2)!==0)r=r&1|2,n.flags|=128;else{if(e!==null&&(e.flags&128)!==0)e:for(e=n.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Lf(e,t,n);else if(e.tag===19)Lf(e,t,n);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===n)break e;for(;e.sibling===null;){if(e.return===null||e.return===n)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}r&=1}if(A(Y,r),(n.mode&1)===0)n.memoizedState=null;else switch(l){case"forwards":t=n.child;for(l=null;t!==null;)e=t.alternate,e!==null&&ru(e)===null&&(l=t),t=t.sibling;t=l,t===null?(l=n.child,n.child=null):(l=t.sibling,t.sibling=null),yo(n,!1,l,t,u);break;case"backwards":t=null,l=n.child;for(n.child=null;l!==null;){if(e=l.alternate,e!==null&&ru(e)===null){n.child=l;break}e=l.sibling,l.sibling=t,t=l,l=e}yo(n,!0,t,null,u);break;case"together":yo(n,!1,null,null,void 0);break;default:n.memoizedState=null}return n.child}function $l(e,n){(n.mode&1)===0&&e!==null&&(e.alternate=null,n.alternate=null,n.flags|=2)}function en(e,n,t){if(e!==null&&(n.dependencies=e.dependencies),Xn|=n.lanes,(t&n.childLanes)===0)return null;if(e!==null&&n.child!==e.child)throw Error(E(153));if(n.child!==null){e=n.child,t=En(e,e.pendingProps),n.child=t;for(t.return=n;e.sibling!==null;)e=e.sibling,t=t.sibling=En(e,e.pendingProps),t.return=n;t.sibling=null}return n.child}function R1(e,n,t){switch(n.tag){case 3:Ec(n),Tt();break;case 5:Zs(n);break;case 1:ye(n.type)&&ql(n);break;case 4:$i(n,n.stateNode.containerInfo);break;case 10:var r=n.type._context,l=n.memoizedProps.value;A(eu,r._currentValue),r._currentValue=l;break;case 13:if(r=n.memoizedState,r!==null){if(r.dehydrated!==null)return A(Y,Y.current&1),n.flags|=128,null;if((t&n.child.childLanes)!==0)return kc(e,n,t);return A(Y,Y.current&1),e=en(e,n,t),e!==null?e.sibling:null}A(Y,Y.current&1);break;case 19:if(r=(t&n.childLanes)!==0,(e.flags&128)!==0){if(r)return _c(e,n,t);n.flags|=128}if(l=n.memoizedState,l!==null&&(l.rendering=null,l.tail=null,l.lastEffect=null),A(Y,Y.current),r)break;else return null;case 22:case 23:return n.lanes=0,wc(e,n,t)}return en(e,n,t)}function jt(e,n){if(!B)switch(e.tailMode){case"hidden":n=e.tail;for(var t=null;n!==null;)n.alternate!==null&&(t=n),n=n.sibling;t===null?e.tail=null:t.sibling=null;break;case"collapsed":t=e.tail;for(var r=null;t!==null;)t.alternate!==null&&(r=t),t=t.sibling;r===null?n||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null}}function oe(e){var n=e.alternate!==null&&e.alternate.child===e.child,t=0,r=0;if(n)for(var l=e.child;l!==null;)t|=l.lanes|l.childLanes,r|=l.subtreeFlags&14680064,r|=l.flags&14680064,l.return=e,l=l.sibling;else for(l=e.child;l!==null;)t|=l.lanes|l.childLanes,r|=l.subtreeFlags,r|=l.flags,l.return=e,l=l.sibling;return e.subtreeFlags|=r,e.childLanes=t,n}function M1(e,n,t){var r=n.pendingProps;switch(Oi(n),n.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return oe(n),null;case 1:return ye(n.type)&&Jl(),oe(n),null;case 3:if(r=n.stateNode,Dt(),Q(me),Q(ae),Ai(),r.pendingContext&&(r.context=r.pendingContext,r.pendingContext=null),e===null||e.child===null)Nl(n)?n.flags|=4:e===null||e.memoizedState.isDehydrated&&(n.flags&256)===0||(n.flags|=1024,Le!==null&&(di(Le),Le=null));return li(e,n),oe(n),null;case 5:Hi(n);var l=Vn(Dr.current);if(t=n.type,e!==null&&n.stateNode!=null)Nc(e,n,t,r,l),e.ref!==n.ref&&(n.flags|=512,n.flags|=2097152);else{if(!r){if(n.stateNode===null)throw Error(E(166));return oe(n),null}if(e=Vn(xe.current),Nl(n)){r=n.stateNode,t=n.type;var u=n.memoizedProps;switch(r[Qe]=n,r[Tr]=u,e=(n.mode&1)!==0,t){case"dialog":V("cancel",r),V("close",r);break;case"iframe":case"object":case"embed":V("load",r);break;case"video":case"audio":for(l=0;l<ir.length;l++)V(ir[l],r);break;case"source":V("error",r);break;case"img":case"image":case"link":V("error",r),V("load",r);break;case"details":V("toggle",r);break;case"input":Ba(r,u),V("invalid",r);break;case"select":r._wrapperState={wasMultiple:!!u.multiple},V("invalid",r);break;case"textarea":Ya(r,u),V("invalid",r)}Do(t,u),l=null;for(var o in u)if(u.hasOwnProperty(o)){var i=u[o];o==="children"?typeof i==="string"?r.textContent!==i&&(u.suppressHydrationWarning!==!0&&Cl(r.textContent,i,e),l=["children",i]):typeof i==="number"&&r.textContent!==""+i&&(u.suppressHydrationWarning!==!0&&Cl(r.textContent,i,e),l=["children",""+i]):vr.hasOwnProperty(o)&&i!=null&&o==="onScroll"&&V("scroll",r)}switch(t){case"input":yl(r),xa(r,u,!0);break;case"textarea":yl(r),Ka(r);break;case"select":case"option":break;default:typeof u.onClick==="function"&&(r.onclick=Zl)}r=l,n.updateQueue=r,r!==null&&(n.flags|=4)}else{o=l.nodeType===9?l:l.ownerDocument,e==="http://www.w3.org/1999/xhtml"&&(e=es(t)),e==="http://www.w3.org/1999/xhtml"?t==="script"?(e=o.createElement("div"),e.innerHTML="<script><\/script>",e=e.removeChild(e.firstChild)):typeof r.is==="string"?e=o.createElement(t,{is:r.is}):(e=o.createElement(t),t==="select"&&(o=e,r.multiple?o.multiple=!0:r.size&&(o.size=r.size))):e=o.createElementNS(e,t),e[Qe]=n,e[Tr]=r,Cc(e,n,!1,!1),n.stateNode=e;e:{switch(o=Oo(t,r),t){case"dialog":V("cancel",e),V("close",e),l=r;break;case"iframe":case"object":case"embed":V("load",e),l=r;break;case"video":case"audio":for(l=0;l<ir.length;l++)V(ir[l],e);l=r;break;case"source":V("error",e),l=r;break;case"img":case"image":case"link":V("error",e),V("load",e),l=r;break;case"details":V("toggle",e),l=r;break;case"input":Ba(e,r),l=Co(e,r),V("invalid",e);break;case"option":l=r;break;case"select":e._wrapperState={wasMultiple:!!r.multiple},l=X({},r,{value:void 0}),V("invalid",e);break;case"textarea":Ya(e,r),l=To(e,r),V("invalid",e);break;default:l=r}Do(t,l),i=l;for(u in i)if(i.hasOwnProperty(u)){var a=i[u];u==="style"?rs(e,a):u==="dangerouslySetInnerHTML"?(a=a?a.__html:void 0,a!=null&&ns(e,a)):u==="children"?typeof a==="string"?(t!=="textarea"||a!=="")&&gr(e,a):typeof a==="number"&&gr(e,""+a):u!=="suppressContentEditableWarning"&&u!=="suppressHydrationWarning"&&u!=="autoFocus"&&(vr.hasOwnProperty(u)?a!=null&&u==="onScroll"&&V("scroll",e):a!=null&&mi(e,u,a,o))}switch(t){case"input":yl(e),xa(e,r,!1);break;case"textarea":yl(e),Ka(e);break;case"option":r.value!=null&&e.setAttribute("value",""+kn(r.value));break;case"select":e.multiple=!!r.multiple,u=r.value,u!=null?wt(e,!!r.multiple,u,!1):r.defaultValue!=null&&wt(e,!!r.multiple,r.defaultValue,!0);break;default:typeof l.onClick==="function"&&(e.onclick=Zl)}switch(t){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break e;case"img":r=!0;break e;default:r=!1}}r&&(n.flags|=4)}n.ref!==null&&(n.flags|=512,n.flags|=2097152)}return oe(n),null;case 6:if(e&&n.stateNode!=null)Pc(e,n,e.memoizedProps,r);else{if(typeof r!=="string"&&n.stateNode===null)throw Error(E(166));if(t=Vn(Dr.current),Vn(xe.current),Nl(n)){if(r=n.stateNode,t=n.memoizedProps,r[Qe]=n,u=r.nodeValue!==t){if(e=Ee,e!==null)switch(e.tag){case 3:Cl(r.nodeValue,t,(e.mode&1)!==0);break;case 5:e.memoizedProps.suppressHydrationWarning!==!0&&Cl(r.nodeValue,t,(e.mode&1)!==0)}}u&&(n.flags|=4)}else r=(t.nodeType===9?t:t.ownerDocument).createTextNode(r),r[Qe]=n,n.stateNode=r}return oe(n),null;case 13:if(Q(Y),r=n.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(B&&Se!==null&&(n.mode&1)!==0&&(n.flags&128)===0)xs(),Tt(),n.flags|=98560,u=!1;else if(u=Nl(n),r!==null&&r.dehydrated!==null){if(e===null){if(!u)throw Error(E(318));if(u=n.memoizedState,u=u!==null?u.dehydrated:null,!u)throw Error(E(317));u[Qe]=n}else Tt(),(n.flags&128)===0&&(n.memoizedState=null),n.flags|=4;oe(n),u=!1}else Le!==null&&(di(Le),Le=null),u=!0;if(!u)return n.flags&65536?n:null}if((n.flags&128)!==0)return n.lanes=t,n;return r=r!==null,r!==(e!==null&&e.memoizedState!==null)&&r&&(n.child.flags|=8192,(n.mode&1)!==0&&(e===null||(Y.current&1)!==0?j===0&&(j=3):qi())),n.updateQueue!==null&&(n.flags|=4),oe(n),null;case 4:return Dt(),li(e,n),e===null&&Nr(n.stateNode.containerInfo),oe(n),null;case 10:return Li(n.type._context),oe(n),null;case 17:return ye(n.type)&&Jl(),oe(n),null;case 19:if(Q(Y),u=n.memoizedState,u===null)return oe(n),null;if(r=(n.flags&128)!==0,o=u.rendering,o===null)if(r)jt(u,!1);else{if(j!==0||e!==null&&(e.flags&128)!==0)for(e=n.child;e!==null;){if(o=ru(e),o!==null){n.flags|=128,jt(u,!1),r=o.updateQueue,r!==null&&(n.updateQueue=r,n.flags|=4),n.subtreeFlags=0,r=t;for(t=n.child;t!==null;)u=t,e=r,u.flags&=14680066,o=u.alternate,o===null?(u.childLanes=0,u.lanes=e,u.child=null,u.subtreeFlags=0,u.memoizedProps=null,u.memoizedState=null,u.updateQueue=null,u.dependencies=null,u.stateNode=null):(u.childLanes=o.childLanes,u.lanes=o.lanes,u.child=o.child,u.subtreeFlags=0,u.deletions=null,u.memoizedProps=o.memoizedProps,u.memoizedState=o.memoizedState,u.updateQueue=o.updateQueue,u.type=o.type,e=o.dependencies,u.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),t=t.sibling;return A(Y,Y.current&1|2),n.child}e=e.sibling}u.tail!==null&&Z()>Rt&&(n.flags|=128,r=!0,jt(u,!1),n.lanes=4194304)}else{if(!r)if(e=ru(o),e!==null){if(n.flags|=128,r=!0,t=e.updateQueue,t!==null&&(n.updateQueue=t,n.flags|=4),jt(u,!0),u.tail===null&&u.tailMode==="hidden"&&!o.alternate&&!B)return oe(n),null}else 2*Z()-u.renderingStartTime>Rt&&t!==1073741824&&(n.flags|=128,r=!0,jt(u,!1),n.lanes=4194304);u.isBackwards?(o.sibling=n.child,n.child=o):(t=u.last,t!==null?t.sibling=o:n.child=o,u.last=o)}if(u.tail!==null)return n=u.tail,u.rendering=n,u.tail=n.sibling,u.renderingStartTime=Z(),n.sibling=null,t=Y.current,A(Y,r?t&1|2:t&1),n;return oe(n),null;case 22:case 23:return Ji(),r=n.memoizedState!==null,e!==null&&e.memoizedState!==null!==r&&(n.flags|=8192),r&&(n.mode&1)!==0?(we&1073741824)!==0&&(oe(n),n.subtreeFlags&6&&(n.flags|=8192)):oe(n),null;case 24:return null;case 25:return null}throw Error(E(156,n.tag))}function F1(e,n){switch(Oi(n),n.tag){case 1:return ye(n.type)&&Jl(),e=n.flags,e&65536?(n.flags=e&-65537|128,n):null;case 3:return Dt(),Q(me),Q(ae),Ai(),e=n.flags,(e&65536)!==0&&(e&128)===0?(n.flags=e&-65537|128,n):null;case 5:return Hi(n),null;case 13:if(Q(Y),e=n.memoizedState,e!==null&&e.dehydrated!==null){if(n.alternate===null)throw Error(E(340));Tt()}return e=n.flags,e&65536?(n.flags=e&-65537|128,n):null;case 19:return Q(Y),null;case 4:return Dt(),null;case 10:return Li(n.type._context),null;case 22:case 23:return Ji(),null;case 24:return null;default:return null}}function vt(e,n){var t=e.ref;if(t!==null)if(typeof t==="function")try{t(null)}catch(r){G(e,n,r)}else t.current=null}function ui(e,n,t){try{t()}catch(r){G(e,n,r)}}function I1(e,n){if(Qo=Kl,e=Rs(),zi(e)){if("selectionStart"in e)var t={start:e.selectionStart,end:e.selectionEnd};else e:{t=(t=e.ownerDocument)&&t.defaultView||window;var r=t.getSelection&&t.getSelection();if(r&&r.rangeCount!==0){t=r.anchorNode;var{anchorOffset:l,focusNode:u}=r;r=r.focusOffset;try{t.nodeType,u.nodeType}catch(w){t=null;break e}var o=0,i=-1,a=-1,c=0,v=0,g=e,y=null;n:for(;;){for(var k;;){if(g!==t||l!==0&&g.nodeType!==3||(i=o+l),g!==u||r!==0&&g.nodeType!==3||(a=o+r),g.nodeType===3&&(o+=g.nodeValue.length),(k=g.firstChild)===null)break;y=g,g=k}for(;;){if(g===e)break n;if(y===t&&++c===l&&(i=o),y===u&&++v===r&&(a=o),(k=g.nextSibling)!==null)break;g=y,y=g.parentNode}g=k}t=i===-1||a===-1?null:{start:i,end:a}}else t=null}t=t||{start:0,end:0}}else t=null;Bo={focusedElem:e,selectionRange:t},Kl=!1;for(P=n;P!==null;)if(n=P,e=n.child,(n.subtreeFlags&1028)!==0&&e!==null)e.return=n,P=e;else for(;P!==null;){n=P;try{var N=n.alternate;if((n.flags&1024)!==0)switch(n.tag){case 0:case 11:case 15:break;case 1:if(N!==null){var{memoizedProps:h,memoizedState:T}=N,s=n.stateNode,f=s.getSnapshotBeforeUpdate(n.elementType===n.type?h:Me(n.type,h),T);s.__reactInternalSnapshotBeforeUpdate=f}break;case 3:var d=n.stateNode.containerInfo;d.nodeType===1?d.textContent="":d.nodeType===9&&d.documentElement&&d.removeChild(d.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(E(163))}}catch(w){G(n,n.return,w)}if(e=n.sibling,e!==null){e.return=n.return,P=e;break}P=n.return}return N=If,If=!1,N}function hr(e,n,t){var r=n.updateQueue;if(r=r!==null?r.lastEffect:null,r!==null){var l=r=r.next;do{if((l.tag&e)===e){var u=l.destroy;l.destroy=void 0,u!==void 0&&ui(n,t,u)}l=l.next}while(l!==r)}}function wu(e,n){if(n=n.updateQueue,n=n!==null?n.lastEffect:null,n!==null){var t=n=n.next;do{if((t.tag&e)===e){var r=t.create;t.destroy=r()}t=t.next}while(t!==n)}}function oi(e){var n=e.ref;if(n!==null){var t=e.stateNode;switch(e.tag){case 5:e=t;break;default:e=t}typeof n==="function"?n(e):n.current=e}}function Tc(e){var n=e.alternate;n!==null&&(e.alternate=null,Tc(n)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(n=e.stateNode,n!==null&&(delete n[Qe],delete n[Tr],delete n[Ko],delete n[v1],delete n[g1])),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}function zc(e){return e.tag===5||e.tag===3||e.tag===4}function Uf(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||zc(e.return))return null;e=e.return}e.sibling.return=e.return;for(e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.flags&2)continue e;if(e.child===null||e.tag===4)continue e;else e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function ii(e,n,t){var r=e.tag;if(r===5||r===6)e=e.stateNode,n?t.nodeType===8?t.parentNode.insertBefore(e,n):t.insertBefore(e,n):(t.nodeType===8?(n=t.parentNode,n.insertBefore(e,t)):(n=t,n.appendChild(e)),t=t._reactRootContainer,t!==null&&t!==void 0||n.onclick!==null||(n.onclick=Zl));else if(r!==4&&(e=e.child,e!==null))for(ii(e,n,t),e=e.sibling;e!==null;)ii(e,n,t),e=e.sibling}function ai(e,n,t){var r=e.tag;if(r===5||r===6)e=e.stateNode,n?t.insertBefore(e,n):t.appendChild(e);else if(r!==4&&(e=e.child,e!==null))for(ai(e,n,t),e=e.sibling;e!==null;)ai(e,n,t),e=e.sibling}function on(e,n,t){for(t=t.child;t!==null;)Dc(e,n,t),t=t.sibling}function Dc(e,n,t){if(Be&&typeof Be.onCommitFiberUnmount==="function")try{Be.onCommitFiberUnmount(cu,t)}catch(i){}switch(t.tag){case 5:ie||vt(t,n);case 6:var r=ne,l=Fe;ne=null,on(e,n,t),ne=r,Fe=l,ne!==null&&(Fe?(e=ne,t=t.stateNode,e.nodeType===8?e.parentNode.removeChild(t):e.removeChild(t)):ne.removeChild(t.stateNode));break;case 18:ne!==null&&(Fe?(e=ne,t=t.stateNode,e.nodeType===8?ao(e.parentNode,t):e.nodeType===1&&ao(e,t),kr(e)):ao(ne,t.stateNode));break;case 4:r=ne,l=Fe,ne=t.stateNode.containerInfo,Fe=!0,on(e,n,t),ne=r,Fe=l;break;case 0:case 11:case 14:case 15:if(!ie&&(r=t.updateQueue,r!==null&&(r=r.lastEffect,r!==null))){l=r=r.next;do{var u=l,o=u.destroy;u=u.tag,o!==void 0&&((u&2)!==0?ui(t,n,o):(u&4)!==0&&ui(t,n,o)),l=l.next}while(l!==r)}on(e,n,t);break;case 1:if(!ie&&(vt(t,n),r=t.stateNode,typeof r.componentWillUnmount==="function"))try{r.props=t.memoizedProps,r.state=t.memoizedState,r.componentWillUnmount()}catch(i){G(t,n,i)}on(e,n,t);break;case 21:on(e,n,t);break;case 22:t.mode&1?(ie=(r=ie)||t.memoizedState!==null,on(e,n,t),ie=r):on(e,n,t);break;default:on(e,n,t)}}function $f(e){var n=e.updateQueue;if(n!==null){e.updateQueue=null;var t=e.stateNode;t===null&&(t=e.stateNode=new L1),n.forEach(function(r){var l=x1.bind(null,e,r);t.has(r)||(t.add(r),r.then(l,l))})}}function Re(e,n){var t=n.deletions;if(t!==null)for(var r=0;r<t.length;r++){var l=t[r];try{var u=e,o=n,i=o;e:for(;i!==null;){switch(i.tag){case 5:ne=i.stateNode,Fe=!1;break e;case 3:ne=i.stateNode.containerInfo,Fe=!0;break e;case 4:ne=i.stateNode.containerInfo,Fe=!0;break e}i=i.return}if(ne===null)throw Error(E(160));Dc(u,o,l),ne=null,Fe=!1;var a=l.alternate;a!==null&&(a.return=null),l.return=null}catch(c){G(l,n,c)}}if(n.subtreeFlags&12854)for(n=n.child;n!==null;)Oc(n,e),n=n.sibling}function Oc(e,n){var{alternate:t,flags:r}=e;switch(e.tag){case 0:case 11:case 14:case 15:if(Re(n,e),We(e),r&4){try{hr(3,e,e.return),wu(3,e)}catch(h){G(e,e.return,h)}try{hr(5,e,e.return)}catch(h){G(e,e.return,h)}}break;case 1:Re(n,e),We(e),r&512&&t!==null&&vt(t,t.return);break;case 5:if(Re(n,e),We(e),r&512&&t!==null&&vt(t,t.return),e.flags&32){var l=e.stateNode;try{gr(l,"")}catch(h){G(e,e.return,h)}}if(r&4&&(l=e.stateNode,l!=null)){var u=e.memoizedProps,o=t!==null?t.memoizedProps:u,i=e.type,a=e.updateQueue;if(e.updateQueue=null,a!==null)try{i==="input"&&u.type==="radio"&&u.name!=null&&jf(l,u),Oo(i,o);var c=Oo(i,u);for(o=0;o<a.length;o+=2){var v=a[o],g=a[o+1];v==="style"?rs(l,g):v==="dangerouslySetInnerHTML"?ns(l,g):v==="children"?gr(l,g):mi(l,v,g,c)}switch(i){case"input":No(l,u);break;case"textarea":bf(l,u);break;case"select":var y=l._wrapperState.wasMultiple;l._wrapperState.wasMultiple=!!u.multiple;var k=u.value;k!=null?wt(l,!!u.multiple,k,!1):y!==!!u.multiple&&(u.defaultValue!=null?wt(l,!!u.multiple,u.defaultValue,!0):wt(l,!!u.multiple,u.multiple?[]:"",!1))}l[Tr]=u}catch(h){G(e,e.return,h)}}break;case 6:if(Re(n,e),We(e),r&4){if(e.stateNode===null)throw Error(E(162));l=e.stateNode,u=e.memoizedProps;try{l.nodeValue=u}catch(h){G(e,e.return,h)}}break;case 3:if(Re(n,e),We(e),r&4&&t!==null&&t.memoizedState.isDehydrated)try{kr(n.containerInfo)}catch(h){G(e,e.return,h)}break;case 4:Re(n,e),We(e);break;case 13:Re(n,e),We(e),l=e.child,l.flags&8192&&(u=l.memoizedState!==null,l.stateNode.isHidden=u,!u||l.alternate!==null&&l.alternate.memoizedState!==null||(Gi=Z())),r&4&&$f(e);break;case 22:if(v=t!==null&&t.memoizedState!==null,e.mode&1?(ie=(c=ie)||v,Re(n,e),ie=c):Re(n,e),We(e),r&8192){if(c=e.memoizedState!==null,(e.stateNode.isHidden=c)&&!v&&(e.mode&1)!==0)for(P=e,v=e.child;v!==null;){for(g=P=v;P!==null;){switch(y=P,k=y.child,y.tag){case 0:case 11:case 14:case 15:hr(4,y,y.return);break;case 1:vt(y,y.return);var N=y.stateNode;if(typeof N.componentWillUnmount==="function"){r=y,t=y.return;try{n=r,N.props=n.memoizedProps,N.state=n.memoizedState,N.componentWillUnmount()}catch(h){G(r,t,h)}}break;case 5:vt(y,y.return);break;case 22:if(y.memoizedState!==null){Af(g);continue}}k!==null?(k.return=y,P=k):Af(g)}v=v.sibling}e:for(v=null,g=e;;){if(g.tag===5){if(v===null){v=g;try{l=g.stateNode,c?(u=l.style,typeof u.setProperty==="function"?u.setProperty("display","none","important"):u.display="none"):(i=g.stateNode,a=g.memoizedProps.style,o=a!==void 0&&a!==null&&a.hasOwnProperty("display")?a.display:null,i.style.display=ts("display",o))}catch(h){G(e,e.return,h)}}}else if(g.tag===6){if(v===null)try{g.stateNode.nodeValue=c?"":g.memoizedProps}catch(h){G(e,e.return,h)}}else if((g.tag!==22&&g.tag!==23||g.memoizedState===null||g===e)&&g.child!==null){g.child.return=g,g=g.child;continue}if(g===e)break e;for(;g.sibling===null;){if(g.return===null||g.return===e)break e;v===g&&(v=null),g=g.return}v===g&&(v=null),g.sibling.return=g.return,g=g.sibling}}break;case 19:Re(n,e),We(e),r&4&&$f(e);break;case 21:break;default:Re(n,e),We(e)}}function We(e){var n=e.flags;if(n&2){try{e:{for(var t=e.return;t!==null;){if(zc(t)){var r=t;break e}t=t.return}throw Error(E(160))}switch(r.tag){case 5:var l=r.stateNode;r.flags&32&&(gr(l,""),r.flags&=-33);var u=Uf(e);ai(e,u,l);break;case 3:case 4:var o=r.stateNode.containerInfo,i=Uf(e);ii(e,i,o);break;default:throw Error(E(161))}}catch(a){G(e,e.return,a)}e.flags&=-3}n&4096&&(e.flags&=-4097)}function U1(e,n,t){P=e,Rc(e,n,t)}function Rc(e,n,t){for(var r=(e.mode&1)!==0;P!==null;){var l=P,u=l.child;if(l.tag===22&&r){var o=l.memoizedState!==null||zl;if(!o){var i=l.alternate,a=i!==null&&i.memoizedState!==null||ie;i=zl;var c=ie;if(zl=o,(ie=a)&&!c)for(P=l;P!==null;)o=P,a=o.child,o.tag===22&&o.memoizedState!==null?Wf(l):a!==null?(a.return=o,P=a):Wf(l);for(;u!==null;)P=u,Rc(u,n,t),u=u.sibling;P=l,zl=i,ie=c}Hf(e,n,t)}else(l.subtreeFlags&8772)!==0&&u!==null?(u.return=l,P=u):Hf(e,n,t)}}function Hf(e){for(;P!==null;){var n=P;if((n.flags&8772)!==0){var t=n.alternate;try{if((n.flags&8772)!==0)switch(n.tag){case 0:case 11:case 15:ie||wu(5,n);break;case 1:var r=n.stateNode;if(n.flags&4&&!ie)if(t===null)r.componentDidMount();else{var l=n.elementType===n.type?t.memoizedProps:Me(n.type,t.memoizedProps);r.componentDidUpdate(l,t.memoizedState,r.__reactInternalSnapshotBeforeUpdate)}var u=n.updateQueue;u!==null&&kf(n,u,r);break;case 3:var o=n.updateQueue;if(o!==null){if(t=null,n.child!==null)switch(n.child.tag){case 5:t=n.child.stateNode;break;case 1:t=n.child.stateNode}kf(n,o,t)}break;case 5:var i=n.stateNode;if(t===null&&n.flags&4){t=i;var a=n.memoizedProps;switch(n.type){case"button":case"input":case"select":case"textarea":a.autoFocus&&t.focus();break;case"img":a.src&&(t.src=a.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(n.memoizedState===null){var c=n.alternate;if(c!==null){var v=c.memoizedState;if(v!==null){var g=v.dehydrated;g!==null&&kr(g)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(E(163))}ie||n.flags&512&&oi(n)}catch(y){G(n,n.return,y)}}if(n===e){P=null;break}if(t=n.sibling,t!==null){t.return=n.return,P=t;break}P=n.return}}function Af(e){for(;P!==null;){var n=P;if(n===e){P=null;break}var t=n.sibling;if(t!==null){t.return=n.return,P=t;break}P=n.return}}function Wf(e){for(;P!==null;){var n=P;try{switch(n.tag){case 0:case 11:case 15:var t=n.return;try{wu(4,n)}catch(a){G(n,t,a)}break;case 1:var r=n.stateNode;if(typeof r.componentDidMount==="function"){var l=n.return;try{r.componentDidMount()}catch(a){G(n,l,a)}}var u=n.return;try{oi(n)}catch(a){G(n,u,a)}break;case 5:var o=n.return;try{oi(n)}catch(a){G(n,o,a)}}}catch(a){G(n,n.return,a)}if(n===e){P=null;break}var i=n.sibling;if(i!==null){i.return=n.return,P=i;break}P=n.return}}function ce(){return($&6)!==0?Z():Hl!==-1?Hl:Hl=Z()}function Sn(e){if((e.mode&1)===0)return 1;if(($&2)!==0&&te!==0)return te&-te;if(S1.transition!==null)return Al===0&&(Al=ms()),Al;if(e=H,e!==0)return e;return e=window.event,e=e===void 0?16:ks(e.type),e}function Ue(e,n,t,r){if(50<yr)throw yr=0,si=null,Error(E(185));if(Lr(e,t,r),($&2)===0||e!==ee)e===ee&&(($&2)===0&&(Su|=t),j===4&&cn(e,te)),ve(e,r),t===1&&$===0&&(n.mode&1)===0&&(Rt=Z()+500,yu&&Pn())}function ve(e,n){var t=e.callbackNode;k0(e,n);var r=Yl(e,e===ee?te:0);if(r===0)t!==null&&Za(t),e.callbackNode=null,e.callbackPriority=0;else if(n=r&-r,e.callbackPriority!==n){if(t!=null&&Za(t),n===1)e.tag===0?w1(Vf.bind(null,e)):Vs(Vf.bind(null,e)),m1(function(){($&6)===0&&Pn()}),t=null;else{switch(ys(r)){case 1:t=Si;break;case 4:t=ps;break;case 16:t=xl;break;case 536870912:t=hs;break;default:t=xl}t=Ac(t,Mc.bind(null,e))}e.callbackPriority=n,e.callbackNode=t}}function Mc(e,n){if(Hl=-1,Al=0,($&6)!==0)throw Error(E(327));var t=e.callbackNode;if(Ct()&&e.callbackNode!==t)return null;var r=Yl(e,e===ee?te:0);if(r===0)return null;if((r&30)!==0||(r&e.expiredLanes)!==0||n)n=fu(e,r);else{n=r;var l=$;$|=2;var u=Lc();if(ee!==e||te!==n)Ke=null,Rt=Z()+500,Qn(e,n);do try{W1();break}catch(i){Fc(e,i)}while(1);Fi(),ou.current=u,$=l,J!==null?n=0:(ee=null,te=0,n=j)}if(n!==0){if(n===2&&(l=Io(e),l!==0&&(r=l,n=ci(e,l))),n===1)throw t=Fr,Qn(e,0),cn(e,r),ve(e,Z()),t;if(n===6)cn(e,r);else{if(l=e.current.alternate,(r&30)===0&&!H1(l)&&(n=fu(e,r),n===2&&(u=Io(e),u!==0&&(r=u,n=ci(e,u))),n===1))throw t=Fr,Qn(e,0),cn(e,r),ve(e,Z()),t;switch(e.finishedWork=l,e.finishedLanes=r,n){case 0:case 1:throw Error(E(345));case 2:Hn(e,pe,Ke);break;case 3:if(cn(e,r),(r&130023424)===r&&(n=Gi+500-Z(),10<n)){if(Yl(e,0)!==0)break;if(l=e.suspendedLanes,(l&r)!==r){ce(),e.pingedLanes|=e.suspendedLanes&l;break}e.timeoutHandle=Yo(Hn.bind(null,e,pe,Ke),n);break}Hn(e,pe,Ke);break;case 4:if(cn(e,r),(r&4194240)===r)break;n=e.eventTimes;for(l=-1;0<r;){var o=31-Ie(r);u=1<<o,o=n[o],o>l&&(l=o),r&=~u}if(r=l,r=Z()-r,r=(120>r?120:480>r?480:1080>r?1080:1920>r?1920:3000>r?3000:4320>r?4320:1960*$1(r/1960))-r,10<r){e.timeoutHandle=Yo(Hn.bind(null,e,pe,Ke),r);break}Hn(e,pe,Ke);break;case 5:Hn(e,pe,Ke);break;default:throw Error(E(329))}}}return ve(e,Z()),e.callbackNode===t?Mc.bind(null,e):null}function ci(e,n){var t=mr;return e.current.memoizedState.isDehydrated&&(Qn(e,n).flags|=256),e=fu(e,n),e!==2&&(n=pe,pe=t,n!==null&&di(n)),e}function di(e){pe===null?pe=e:pe.push.apply(pe,e)}function H1(e){for(var n=e;;){if(n.flags&16384){var t=n.updateQueue;if(t!==null&&(t=t.stores,t!==null))for(var r=0;r<t.length;r++){var l=t[r],u=l.getSnapshot;l=l.value;try{if(!$e(u(),l))return!1}catch(o){return!1}}}if(t=n.child,n.subtreeFlags&16384&&t!==null)t.return=n,n=t;else{if(n===e)break;for(;n.sibling===null;){if(n.return===null||n.return===e)return!0;n=n.return}n.sibling.return=n.return,n=n.sibling}}return!0}function cn(e,n){n&=~Xi,n&=~Su,e.suspendedLanes|=n,e.pingedLanes&=~n;for(e=e.expirationTimes;0<n;){var t=31-Ie(n),r=1<<t;e[t]=-1,n&=~r}}function Vf(e){if(($&6)!==0)throw Error(E(327));Ct();var n=Yl(e,0);if((n&1)===0)return ve(e,Z()),null;var t=fu(e,n);if(e.tag!==0&&t===2){var r=Io(e);r!==0&&(n=r,t=ci(e,r))}if(t===1)throw t=Fr,Qn(e,0),cn(e,n),ve(e,Z()),t;if(t===6)throw Error(E(345));return e.finishedWork=e.current.alternate,e.finishedLanes=n,Hn(e,pe,Ke),ve(e,Z()),null}function Zi(e,n){var t=$;$|=1;try{return e(n)}finally{$=t,$===0&&(Rt=Z()+500,yu&&Pn())}}function Gn(e){pn!==null&&pn.tag===0&&($&6)===0&&Ct();var n=$;$|=1;var t=Te.transition,r=H;try{if(Te.transition=null,H=1,e)return e()}finally{H=r,Te.transition=t,$=n,($&6)===0&&Pn()}}function Ji(){we=gt.current,Q(gt)}function Qn(e,n){e.finishedWork=null,e.finishedLanes=0;var t=e.timeoutHandle;if(t!==-1&&(e.timeoutHandle=-1,h1(t)),J!==null)for(t=J.return;t!==null;){var r=t;switch(Oi(r),r.tag){case 1:r=r.type.childContextTypes,r!==null&&r!==void 0&&Jl();break;case 3:Dt(),Q(me),Q(ae),Ai();break;case 5:Hi(r);break;case 4:Dt();break;case 13:Q(Y);break;case 19:Q(Y);break;case 10:Li(r.type._context);break;case 22:case 23:Ji()}t=t.return}if(ee=e,J=e=En(e.current,null),te=we=n,j=0,Fr=null,Xi=Su=Xn=0,pe=mr=null,Wn!==null){for(n=0;n<Wn.length;n++)if(t=Wn[n],r=t.interleaved,r!==null){t.interleaved=null;var l=r.next,u=t.pending;if(u!==null){var o=u.next;u.next=l,r.next=o}t.pending=r}Wn=null}return e}function Fc(e,n){do{var t=J;try{if(Fi(),Il.current=uu,lu){for(var r=K.memoizedState;r!==null;){var l=r.queue;l!==null&&(l.pending=null),r=r.next}lu=!1}if(Kn=0,b=q=K=null,pr=!1,Or=0,Ki.current=null,t===null||t.return===null){j=1,Fr=n,J=null;break}e:{var u=e,o=t.return,i=t,a=n;if(n=te,i.flags|=32768,a!==null&&typeof a==="object"&&typeof a.then==="function"){var c=a,v=i,g=v.tag;if((v.mode&1)===0&&(g===0||g===11||g===15)){var y=v.alternate;y?(v.updateQueue=y.updateQueue,v.memoizedState=y.memoizedState,v.lanes=y.lanes):(v.updateQueue=null,v.memoizedState=null)}var k=zf(o);if(k!==null){k.flags&=-257,Df(k,o,i,u,n),k.mode&1&&Tf(u,c,n),n=k,a=c;var N=n.updateQueue;if(N===null){var h=new Set;h.add(a),n.updateQueue=h}else N.add(a);break e}else{if((n&1)===0){Tf(u,c,n),qi();break e}a=Error(E(426))}}else if(B&&i.mode&1){var T=zf(o);if(T!==null){(T.flags&65536)===0&&(T.flags|=256),Df(T,o,i,u,n),Ri(Ot(a,i));break e}}u=a=Ot(a,i),j!==4&&(j=2),mr===null?mr=[u]:mr.push(u),u=o;do{switch(u.tag){case 3:u.flags|=65536,n&=-n,u.lanes|=n;var s=yc(u,a,n);Ef(u,s);break e;case 1:i=a;var{type:f,stateNode:d}=u;if((u.flags&128)===0&&(typeof f.getDerivedStateFromError==="function"||d!==null&&typeof d.componentDidCatch==="function"&&(wn===null||!wn.has(d)))){u.flags|=65536,n&=-n,u.lanes|=n;var w=vc(u,i,n);Ef(u,w);break e}}u=u.return}while(u!==null)}Uc(t)}catch(C){n=C,J===t&&t!==null&&(J=t=t.return);continue}break}while(1)}function Lc(){var e=ou.current;return ou.current=uu,e===null?uu:e}function qi(){if(j===0||j===3||j===2)j=4;ee===null||(Xn&268435455)===0&&(Su&268435455)===0||cn(ee,te)}function fu(e,n){var t=$;$|=2;var r=Lc();if(ee!==e||te!==n)Ke=null,Qn(e,n);do try{A1();break}catch(l){Fc(e,l)}while(1);if(Fi(),$=t,ou.current=r,J!==null)throw Error(E(261));return ee=null,te=0,j}function A1(){for(;J!==null;)Ic(J)}function W1(){for(;J!==null&&!p0();)Ic(J)}function Ic(e){var n=Hc(e.alternate,e,we);e.memoizedProps=e.pendingProps,n===null?Uc(e):J=n,Ki.current=null}function Uc(e){var n=e;do{var t=n.alternate;if(e=n.return,(n.flags&32768)===0){if(t=M1(t,n,we),t!==null){J=t;return}}else{if(t=F1(t,n),t!==null){t.flags&=32767,J=t;return}if(e!==null)e.flags|=32768,e.subtreeFlags=0,e.deletions=null;else{j=6,J=null;return}}if(n=n.sibling,n!==null){J=n;return}J=n=e}while(n!==null);j===0&&(j=5)}function Hn(e,n,t){var r=H,l=Te.transition;try{Te.transition=null,H=1,V1(e,n,t,r)}finally{Te.transition=l,H=r}return null}function V1(e,n,t,r){do Ct();while(pn!==null);if(($&6)!==0)throw Error(E(327));t=e.finishedWork;var l=e.finishedLanes;if(t===null)return null;if(e.finishedWork=null,e.finishedLanes=0,t===e.current)throw Error(E(177));e.callbackNode=null,e.callbackPriority=0;var u=t.lanes|t.childLanes;if(_0(e,u),e===ee&&(J=ee=null,te=0),(t.subtreeFlags&2064)===0&&(t.flags&2064)===0||Dl||(Dl=!0,Ac(xl,function(){return Ct(),null})),u=(t.flags&15990)!==0,(t.subtreeFlags&15990)!==0||u){u=Te.transition,Te.transition=null;var o=H;H=1;var i=$;$|=4,Ki.current=null,I1(e,t),Oc(t,e),f1(Bo),Kl=!!Qo,Bo=Qo=null,e.current=t,U1(t,e,l),h0(),$=i,H=o,Te.transition=u}else e.current=t;if(Dl&&(Dl=!1,pn=e,au=l),u=e.pendingLanes,u===0&&(wn=null),v0(t.stateNode,r),ve(e,Z()),n!==null)for(r=e.onRecoverableError,t=0;t<n.length;t++)l=n[t],r(l.value,{componentStack:l.stack,digest:l.digest});if(iu)throw iu=!1,e=fi,fi=null,e;return(au&1)!==0&&e.tag!==0&&Ct(),u=e.pendingLanes,(u&1)!==0?e===si?yr++:(yr=0,si=e):yr=0,Pn(),null}function Ct(){if(pn!==null){var e=ys(au),n=Te.transition,t=H;try{if(Te.transition=null,H=16>e?16:e,pn===null)var r=!1;else{if(e=pn,pn=null,au=0,($&6)!==0)throw Error(E(331));var l=$;$|=4;for(P=e.current;P!==null;){var u=P,o=u.child;if((P.flags&16)!==0){var i=u.deletions;if(i!==null){for(var a=0;a<i.length;a++){var c=i[a];for(P=c;P!==null;){var v=P;switch(v.tag){case 0:case 11:case 15:hr(8,v,u)}var g=v.child;if(g!==null)g.return=v,P=g;else for(;P!==null;){v=P;var{sibling:y,return:k}=v;if(Tc(v),v===c){P=null;break}if(y!==null){y.return=k,P=y;break}P=k}}}var N=u.alternate;if(N!==null){var h=N.child;if(h!==null){N.child=null;do{var T=h.sibling;h.sibling=null,h=T}while(h!==null)}}P=u}}if((u.subtreeFlags&2064)!==0&&o!==null)o.return=u,P=o;else e:for(;P!==null;){if(u=P,(u.flags&2048)!==0)switch(u.tag){case 0:case 11:case 15:hr(9,u,u.return)}var s=u.sibling;if(s!==null){s.return=u.return,P=s;break e}P=u.return}}var f=e.current;for(P=f;P!==null;){o=P;var d=o.child;if((o.subtreeFlags&2064)!==0&&d!==null)d.return=o,P=d;else e:for(o=f;P!==null;){if(i=P,(i.flags&2048)!==0)try{switch(i.tag){case 0:case 11:case 15:wu(9,i)}}catch(C){G(i,i.return,C)}if(i===o){P=null;break e}var w=i.sibling;if(w!==null){w.return=i.return,P=w;break e}P=i.return}}if($=l,Pn(),Be&&typeof Be.onPostCommitFiberRoot==="function")try{Be.onPostCommitFiberRoot(cu,e)}catch(C){}r=!0}return r}finally{H=t,Te.transition=n}}return!1}function Qf(e,n,t){n=Ot(t,n),n=yc(e,n,1),e=gn(e,n,1),n=ce(),e!==null&&(Lr(e,1,n),ve(e,n))}function G(e,n,t){if(e.tag===3)Qf(e,e,t);else for(;n!==null;){if(n.tag===3){Qf(n,e,t);break}else if(n.tag===1){var r=n.stateNode;if(typeof n.type.getDerivedStateFromError==="function"||typeof r.componentDidCatch==="function"&&(wn===null||!wn.has(r))){e=Ot(t,e),e=vc(n,e,1),n=gn(n,e,1),e=ce(),n!==null&&(Lr(n,1,e),ve(n,e));break}}n=n.return}}function Q1(e,n,t){var r=e.pingCache;r!==null&&r.delete(n),n=ce(),e.pingedLanes|=e.suspendedLanes&t,ee===e&&(te&t)===t&&(j===4||j===3&&(te&130023424)===te&&500>Z()-Gi?Qn(e,0):Xi|=t),ve(e,n)}function $c(e,n){n===0&&((e.mode&1)===0?n=1:(n=wl,wl<<=1,(wl&130023424)===0&&(wl=4194304)));var t=ce();e=be(e,n),e!==null&&(Lr(e,n,t),ve(e,t))}function B1(e){var n=e.memoizedState,t=0;n!==null&&(t=n.retryLane),$c(e,t)}function x1(e,n){var t=0;switch(e.tag){case 13:var{stateNode:r,memoizedState:l}=e;l!==null&&(t=l.retryLane);break;case 19:r=e.stateNode;break;default:throw Error(E(314))}r!==null&&r.delete(n),$c(e,t)}function Ac(e,n){return ds(e,n)}function Y1(e,n,t,r){this.tag=e,this.key=t,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=n,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Pe(e,n,t,r){return new Y1(e,n,t,r)}function ji(e){return e=e.prototype,!(!e||!e.isReactComponent)}function K1(e){if(typeof e==="function")return ji(e)?1:0;if(e!==void 0&&e!==null){if(e=e.$$typeof,e===vi)return 11;if(e===gi)return 14}return 2}function En(e,n){var t=e.alternate;return t===null?(t=Pe(e.tag,n,e.key,e.mode),t.elementType=e.elementType,t.type=e.type,t.stateNode=e.stateNode,t.alternate=e,e.alternate=t):(t.pendingProps=n,t.type=e.type,t.flags=0,t.subtreeFlags=0,t.deletions=null),t.flags=e.flags&14680064,t.childLanes=e.childLanes,t.lanes=e.lanes,t.child=e.child,t.memoizedProps=e.memoizedProps,t.memoizedState=e.memoizedState,t.updateQueue=e.updateQueue,n=e.dependencies,t.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext},t.sibling=e.sibling,t.index=e.index,t.ref=e.ref,t}function Wl(e,n,t,r,l,u){var o=2;if(r=e,typeof e==="function")ji(e)&&(o=1);else if(typeof e==="string")o=5;else e:switch(e){case at:return Bn(t.children,l,u,n);case yi:o=8,l|=8;break;case So:return e=Pe(12,t,n,l|2),e.elementType=So,e.lanes=u,e;case Eo:return e=Pe(13,t,n,l),e.elementType=Eo,e.lanes=u,e;case ko:return e=Pe(19,t,n,l),e.elementType=ko,e.lanes=u,e;case Zf:return Eu(t,l,u,n);default:if(typeof e==="object"&&e!==null)switch(e.$$typeof){case Xf:o=10;break e;case Gf:o=9;break e;case vi:o=11;break e;case gi:o=14;break e;case an:o=16,r=null;break e}throw Error(E(130,e==null?e:typeof e,""))}return n=Pe(o,t,n,l),n.elementType=e,n.type=r,n.lanes=u,n}function Bn(e,n,t,r){return e=Pe(7,e,r,n),e.lanes=t,e}function Eu(e,n,t,r){return e=Pe(22,e,r,n),e.elementType=Zf,e.lanes=t,e.stateNode={isHidden:!1},e}function vo(e,n,t){return e=Pe(6,e,null,n),e.lanes=t,e}function go(e,n,t){return n=Pe(4,e.children!==null?e.children:[],e.key,n),n.lanes=t,n.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},n}function X1(e,n,t,r,l){this.tag=n,this.containerInfo=e,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=no(0),this.expirationTimes=no(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=no(0),this.identifierPrefix=r,this.onRecoverableError=l,this.mutableSourceEagerHydrationData=null}function bi(e,n,t,r,l,u,o,i,a){return e=new X1(e,n,t,i,a),n===1?(n=1,u===!0&&(n|=8)):n=0,u=Pe(3,null,null,n),e.current=u,u.stateNode=e,u.memoizedState={element:r,isDehydrated:t,cache:null,transitions:null,pendingSuspenseBoundaries:null},Ui(u),e}function G1(e,n,t){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:it,key:r==null?null:""+r,children:e,containerInfo:n,implementation:t}}function Wc(e){if(!e)return _n;e=e._reactInternals;e:{if(Jn(e)!==e||e.tag!==1)throw Error(E(170));var n=e;do{switch(n.tag){case 3:n=n.stateNode.context;break e;case 1:if(ye(n.type)){n=n.stateNode.__reactInternalMemoizedMergedChildContext;break e}}n=n.return}while(n!==null);throw Error(E(171))}if(e.tag===1){var t=e.type;if(ye(t))return Ws(e,t,n)}return n}function Vc(e,n,t,r,l,u,o,i,a){return e=bi(t,r,!0,e,l,u,o,i,a),e.context=Wc(null),t=e.current,r=ce(),l=Sn(t),u=Je(r,l),u.callback=n!==void 0&&n!==null?n:null,gn(t,u,l),e.current.lanes=l,Lr(e,l,r),ve(e,r),e}function ku(e,n,t,r){var l=n.current,u=ce(),o=Sn(l);return t=Wc(t),n.context===null?n.context=t:n.pendingContext=t,n=Je(u,o),n.payload={element:e},r=r===void 0?null:r,r!==null&&(n.callback=r),e=gn(l,n,o),e!==null&&(Ue(e,l,o,u),Ll(e,l,o)),o}function su(e){if(e=e.current,!e.child)return null;switch(e.child.tag){case 5:return e.child.stateNode;default:return e.child.stateNode}}function Bf(e,n){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var t=e.retryLane;e.retryLane=t!==0&&t<n?t:n}}function ea(e,n){Bf(e,n),(e=e.alternate)&&Bf(e,n)}function Z1(){return null}function na(e){this._internalRoot=e}function _u(e){this._internalRoot=e}function ta(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Cu(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11&&(e.nodeType!==8||e.nodeValue!==" react-mount-point-unstable "))}function xf(){}function J1(e,n,t,r,l){if(l){if(typeof r==="function"){var u=r;r=function(){var c=su(o);u.call(c)}}var o=Vc(n,r,e,0,null,!1,!1,"",xf);return e._reactRootContainer=o,e[je]=o.current,Nr(e.nodeType===8?e.parentNode:e),Gn(),o}for(;l=e.lastChild;)e.removeChild(l);if(typeof r==="function"){var i=r;r=function(){var c=su(a);i.call(c)}}var a=bi(e,0,!1,null,null,!1,!1,"",xf);return e._reactRootContainer=a,e[je]=a.current,Nr(e.nodeType===8?e.parentNode:e),Gn(function(){ku(n,a,t,r)}),a}function Nu(e,n,t,r,l){var u=t._reactRootContainer;if(u){var o=u;if(typeof l==="function"){var i=l;l=function(){var a=su(o);i.call(a)}}ku(n,o,e,l)}else o=J1(t,n,e,l,r);return su(o)}var Yf,x,Kf,vr,qe,wo,bp,Wa,Va,re,pi,nn,ml,it,at,yi,So,Xf,Gf,vi,Eo,ko,gi,an,Zf,Qa,X,qu,ju=!1,nr,vl,ns,ar,o0,i0,Ro=null,Mo=null,St=null,Et=null,eo=!1,Fo=!1,Un,fr=!1,Ql=null,Bl=!1,Lo=null,f0,ds,Za,p0,h0,Z,m0,Si,ps,xl,y0,hs,cu=null,Be=null,Ie,g0,w0,gl=64,wl=4194304,H=0,vs,ki,gs,ws,Ss,Uo=!1,Sl,hn=null,mn=null,yn=null,Sr,Er,sn,C0,kt,Kl=!0,Xl=null,dn=null,Ci=null,Rl=null,Mt,Ni,Ir,D0,to,ro,Jt,du,ba,O0,R0,M0,lo,F0,L0,I0,U0,$0,ef,H0,A0,W0,Q0,B0,x0,nf,Y0,K0,X0,G0,Z0,J0,q0,Ti,sr=null,j0,Cs,tf,rf=!1,ft=!1,n1,cr=null,_r=null,zs=!1,rr,lr,Fl,$e,s1,st=null,Ho=null,dr=null,Ao=!1,ct,uo,Ms,Fs,Ls,Is,Us,$s,sf,or,Wo,Vo,ur,ir,c1,_l,d1,p1,Qo=null,Bo=null,Yo,h1,hf,m1,Ft,Qe,Tr,je,Ko,v1,g1,Xo,pt=-1,_n,ae,me,xn,Xe=null,yu=!1,fo=!1,ht,mt=0,jl=null,bl=0,Ce,Ne=0,Yn=null,Ge=1,Ze="",Ee=null,Se=null,B=!1,Le=null,S1,zt,Ks,eu,nu=null,yt=null,Mi=null,Wn=null,fn=!1,$r,xe,zr,Dr,Y,so,Il,co,Kn=0,K=null,q=null,b=null,lu=!1,pr=!1,Or=0,E1=0,uu,N1,P1,T1,gu,z1,D1,he=!1,ti,Cc,li,Nc,Pc,zl=!1,ie=!1,L1,P=null,If=!1,ne=null,Fe=!1,$1,ou,Ki,Te,$=0,ee=null,J=null,te=0,we=0,gt,j=0,Fr=null,Xn=0,Su=0,Xi=0,mr=null,pe=null,Gi=0,Rt=1/0,Ke=null,iu=!1,fi=null,wn=null,Dl=!1,pn=null,au=0,yr=0,si=null,Hl=-1,Al=0,Hc,Qc,q1,bt,j1,ot,Bc,xc=function(e,n){var t=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!ta(n))throw Error(E(200));return G1(e,n,null,t)},Yc=function(e,n){if(!ta(e))throw Error(E(299));var t=!1,r="",l=Qc;return n!==null&&n!==void 0&&(n.unstable_strictMode===!0&&(t=!0),n.identifierPrefix!==void 0&&(r=n.identifierPrefix),n.onRecoverableError!==void 0&&(l=n.onRecoverableError)),n=bi(e,1,!1,null,null,t,!1,r,l),e[je]=n.current,Nr(e.nodeType===8?e.parentNode:e),new na(n)},Kc=function(e){if(e==null)return null;if(e.nodeType===1)return e;var n=e._reactInternals;if(n===void 0){if(typeof e.render==="function")throw Error(E(188));throw e=Object.keys(e).join(","),Error(E(268,e))}return e=ss(n),e=e===null?null:e.stateNode,e},Xc=function(e){return Gn(e)},Gc=function(e,n,t){if(!Cu(n))throw Error(E(200));return Nu(null,e,n,!0,t)},Zc=function(e,n,t){if(!ta(e))throw Error(E(405));var r=t!=null&&t.hydratedSources||null,l=!1,u="",o=Qc;if(t!==null&&t!==void 0&&(t.unstable_strictMode===!0&&(l=!0),t.identifierPrefix!==void 0&&(u=t.identifierPrefix),t.onRecoverableError!==void 0&&(o=t.onRecoverableError)),n=Vc(n,null,e,1,t!=null?t:null,l,!1,u,o),e[je]=n.current,Nr(e),r)for(e=0;e<r.length;e++)t=r[e],l=t._getVersion,l=l(t._source),n.mutableSourceEagerHydrationData==null?n.mutableSourceEagerHydrationData=[t,l]:n.mutableSourceEagerHydrationData.push(t,l);return new _u(n)},Jc=function(e,n,t){if(!Cu(n))throw Error(E(200));return Nu(null,e,n,!1,t)},qc=function(e){if(!Cu(e))throw Error(E(40));return e._reactRootContainer?(Gn(function(){Nu(null,null,e,!1,function(){e._reactRootContainer=null,e[je]=null})}),!0):!1},jc,bc=function(e,n,t,r){if(!Cu(t))throw Error(E(200));if(e==null||e._reactInternals===void 0)throw Error(E(38));return Nu(e,n,t,!1,r)},ed="18.3.1-next-f1338f8080-20240426";var nd=Ld(()=>{Yf=Ye(Ln(),1),x=Ye(Aa(),1);Kf=new Set,vr={};qe=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),wo=Object.prototype.hasOwnProperty,bp=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,Wa={},Va={};re={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e){re[e]=new de(e,0,!1,e,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(e){var n=e[0];re[n]=new de(n,1,!1,e[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(e){re[e]=new de(e,2,!1,e.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(e){re[e]=new de(e,2,!1,e,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e){re[e]=new de(e,3,!1,e.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(e){re[e]=new de(e,3,!0,e,null,!1,!1)});["capture","download"].forEach(function(e){re[e]=new de(e,4,!1,e,null,!1,!1)});["cols","rows","size","span"].forEach(function(e){re[e]=new de(e,6,!1,e,null,!1,!1)});["rowSpan","start"].forEach(function(e){re[e]=new de(e,5,!1,e.toLowerCase(),null,!1,!1)});pi=/[\-:]([a-z])/g;"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e){var n=e.replace(pi,hi);re[n]=new de(n,1,!1,e,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e){var n=e.replace(pi,hi);re[n]=new de(n,1,!1,e,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(e){var n=e.replace(pi,hi);re[n]=new de(n,1,!1,e,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(e){re[e]=new de(e,1,!1,e.toLowerCase(),null,!1,!1)});re.xlinkHref=new de("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(e){re[e]=new de(e,1,!1,e.toLowerCase(),null,!0,!0)});nn=Yf.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,ml=Symbol.for("react.element"),it=Symbol.for("react.portal"),at=Symbol.for("react.fragment"),yi=Symbol.for("react.strict_mode"),So=Symbol.for("react.profiler"),Xf=Symbol.for("react.provider"),Gf=Symbol.for("react.context"),vi=Symbol.for("react.forward_ref"),Eo=Symbol.for("react.suspense"),ko=Symbol.for("react.suspense_list"),gi=Symbol.for("react.memo"),an=Symbol.for("react.lazy"),Zf=Symbol.for("react.offscreen"),Qa=Symbol.iterator;X=Object.assign;nr=Array.isArray;ns=function(e){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(n,t,r,l){MSApp.execUnsafeLocalFunction(function(){return e(n,t,r,l)})}:e}(function(e,n){if(e.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in e)e.innerHTML=n;else{vl=vl||document.createElement("div"),vl.innerHTML="<svg>"+n.valueOf().toString()+"</svg>";for(n=vl.firstChild;e.firstChild;)e.removeChild(e.firstChild);for(;n.firstChild;)e.appendChild(n.firstChild)}});ar={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},o0=["Webkit","ms","Moz","O"];Object.keys(ar).forEach(function(e){o0.forEach(function(n){n=n+e.charAt(0).toUpperCase()+e.substring(1),ar[n]=ar[e]})});i0=X({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});if(qe)try{Un={},Object.defineProperty(Un,"passive",{get:function(){Fo=!0}}),window.addEventListener("test",Un,Un),window.removeEventListener("test",Un,Un)}catch(e){Fo=!1}f0={onError:function(e){fr=!0,Ql=e}};ds=x.unstable_scheduleCallback,Za=x.unstable_cancelCallback,p0=x.unstable_shouldYield,h0=x.unstable_requestPaint,Z=x.unstable_now,m0=x.unstable_getCurrentPriorityLevel,Si=x.unstable_ImmediatePriority,ps=x.unstable_UserBlockingPriority,xl=x.unstable_NormalPriority,y0=x.unstable_LowPriority,hs=x.unstable_IdlePriority;Ie=Math.clz32?Math.clz32:S0,g0=Math.log,w0=Math.LN2;Sl=[],Sr=new Map,Er=new Map,sn=[],C0="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");kt=nn.ReactCurrentBatchConfig;Mt={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Ni=ke(Mt),Ir=X({},Mt,{view:0,detail:0}),D0=ke(Ir),du=X({},Ir,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Pi,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){if("movementX"in e)return e.movementX;return e!==Jt&&(Jt&&e.type==="mousemove"?(to=e.screenX-Jt.screenX,ro=e.screenY-Jt.screenY):ro=to=0,Jt=e),to},movementY:function(e){return"movementY"in e?e.movementY:ro}}),ba=ke(du),O0=X({},du,{dataTransfer:0}),R0=ke(O0),M0=X({},Ir,{relatedTarget:0}),lo=ke(M0),F0=X({},Mt,{animationName:0,elapsedTime:0,pseudoElement:0}),L0=ke(F0),I0=X({},Mt,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),U0=ke(I0),$0=X({},Mt,{data:0}),ef=ke($0),H0={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},A0={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},W0={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};Q0=X({},Ir,{key:function(e){if(e.key){var n=H0[e.key]||e.key;if(n!=="Unidentified")return n}return e.type==="keypress"?(e=Ml(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?A0[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Pi,charCode:function(e){return e.type==="keypress"?Ml(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?Ml(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),B0=ke(Q0),x0=X({},du,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),nf=ke(x0),Y0=X({},Ir,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Pi}),K0=ke(Y0),X0=X({},Mt,{propertyName:0,elapsedTime:0,pseudoElement:0}),G0=ke(X0),Z0=X({},du,{deltaX:function(e){return"deltaX"in e?e.deltaX:("wheelDeltaX"in e)?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:("wheelDeltaY"in e)?-e.wheelDeltaY:("wheelDelta"in e)?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),J0=ke(Z0),q0=[9,13,27,32],Ti=qe&&"CompositionEvent"in window;qe&&"documentMode"in document&&(sr=document.documentMode);j0=qe&&"TextEvent"in window&&!sr,Cs=qe&&(!Ti||sr&&8<sr&&11>=sr),tf=String.fromCharCode(32);n1={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};if(qe){if(qe){if(lr="oninput"in document,!lr)Fl=document.createElement("div"),Fl.setAttribute("oninput","return;"),lr=typeof Fl.oninput==="function";rr=lr}else rr=!1;zs=rr&&(!document.documentMode||9<document.documentMode)}$e=typeof Object.is==="function"?Object.is:a1;s1=qe&&"documentMode"in document&&11>=document.documentMode;ct={animationend:kl("Animation","AnimationEnd"),animationiteration:kl("Animation","AnimationIteration"),animationstart:kl("Animation","AnimationStart"),transitionend:kl("Transition","TransitionEnd")},uo={},Ms={};qe&&(Ms=document.createElement("div").style,("AnimationEvent"in window)||(delete ct.animationend.animation,delete ct.animationiteration.animation,delete ct.animationstart.animation),("TransitionEvent"in window)||delete ct.transitionend.transition);Fs=hu("animationend"),Ls=hu("animationiteration"),Is=hu("animationstart"),Us=hu("transitionend"),$s=new Map,sf="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");for(ur=0;ur<sf.length;ur++)or=sf[ur],Wo=or.toLowerCase(),Vo=or[0].toUpperCase()+or.slice(1),Cn(Wo,"on"+Vo);Cn(Fs,"onAnimationEnd");Cn(Ls,"onAnimationIteration");Cn(Is,"onAnimationStart");Cn("dblclick","onDoubleClick");Cn("focusin","onFocus");Cn("focusout","onBlur");Cn(Us,"onTransitionEnd");Nt("onMouseEnter",["mouseout","mouseover"]);Nt("onMouseLeave",["mouseout","mouseover"]);Nt("onPointerEnter",["pointerout","pointerover"]);Nt("onPointerLeave",["pointerout","pointerover"]);Zn("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Zn("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Zn("onBeforeInput",["compositionend","keypress","textInput","paste"]);Zn("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Zn("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Zn("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));ir="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),c1=new Set("cancel close invalid load scroll toggle".split(" ").concat(ir));_l="_reactListening"+Math.random().toString(36).slice(2);d1=/\r\n?/g,p1=/\u0000|\uFFFD/g;Yo=typeof setTimeout==="function"?setTimeout:void 0,h1=typeof clearTimeout==="function"?clearTimeout:void 0,hf=typeof Promise==="function"?Promise:void 0,m1=typeof queueMicrotask==="function"?queueMicrotask:typeof hf<"u"?function(e){return hf.resolve(null).then(e).catch(y1)}:Yo;Ft=Math.random().toString(36).slice(2),Qe="__reactFiber$"+Ft,Tr="__reactProps$"+Ft,je="__reactContainer$"+Ft,Ko="__reactEvents$"+Ft,v1="__reactListeners$"+Ft,g1="__reactHandles$"+Ft;Xo=[];_n={},ae=Nn(_n),me=Nn(!1),xn=_n;ht=[],Ce=[];S1=nn.ReactCurrentBatchConfig;zt=Ys(!0),Ks=Ys(!1),eu=Nn(null);$r={},xe=Nn($r),zr=Nn($r),Dr=Nn($r);Y=Nn(0);so=[];Il=nn.ReactCurrentDispatcher,co=nn.ReactCurrentBatchConfig;uu={readContext:ze,useCallback:ue,useContext:ue,useEffect:ue,useImperativeHandle:ue,useInsertionEffect:ue,useLayoutEffect:ue,useMemo:ue,useReducer:ue,useRef:ue,useState:ue,useDebugValue:ue,useDeferredValue:ue,useTransition:ue,useMutableSource:ue,useSyncExternalStore:ue,useId:ue,unstable_isNewReconciler:!1},N1={readContext:ze,useCallback:function(e,n){return Ve().memoizedState=[e,n===void 0?null:n],e},useContext:ze,useEffect:Cf,useImperativeHandle:function(e,n,t){return t=t!==null&&t!==void 0?t.concat([e]):null,Ul(4194308,4,oc.bind(null,n,e),t)},useLayoutEffect:function(e,n){return Ul(4194308,4,e,n)},useInsertionEffect:function(e,n){return Ul(4,2,e,n)},useMemo:function(e,n){var t=Ve();return n=n===void 0?null:n,e=e(),t.memoizedState=[e,n],e},useReducer:function(e,n,t){var r=Ve();return n=t!==void 0?t(n):n,r.memoizedState=r.baseState=n,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:n},r.queue=e,e=e.dispatch=_1.bind(null,K,e),[r.memoizedState,e]},useRef:function(e){var n=Ve();return e={current:e},n.memoizedState=e},useState:_f,useDebugValue:xi,useDeferredValue:function(e){return Ve().memoizedState=e},useTransition:function(){var e=_f(!1),n=e[0];return e=k1.bind(null,e[1]),Ve().memoizedState=e,[n,e]},useMutableSource:function(){},useSyncExternalStore:function(e,n,t){var r=K,l=Ve();if(B){if(t===void 0)throw Error(E(407));t=t()}else{if(t=n(),ee===null)throw Error(E(349));(Kn&30)!==0||js(r,n,t)}l.memoizedState=t;var u={value:t,getSnapshot:n};return l.queue=u,Cf(ec.bind(null,r,u,e),[e]),r.flags|=2048,Mr(9,bs.bind(null,r,u,t,n),void 0,null),t},useId:function(){var e=Ve(),n=ee.identifierPrefix;if(B){var t=Ze,r=Ge;t=(r&~(1<<32-Ie(r)-1)).toString(32)+t,n=":"+n+"R"+t,t=Or++,0<t&&(n+="H"+t.toString(32)),n+=":"}else t=E1++,n=":"+n+"r"+t.toString(32)+":";return e.memoizedState=n},unstable_isNewReconciler:!1},P1={readContext:ze,useCallback:ac,useContext:ze,useEffect:Bi,useImperativeHandle:ic,useInsertionEffect:lc,useLayoutEffect:uc,useMemo:fc,useReducer:po,useRef:rc,useState:function(){return po(Rr)},useDebugValue:xi,useDeferredValue:function(e){var n=De();return sc(n,q.memoizedState,e)},useTransition:function(){var e=po(Rr)[0],n=De().memoizedState;return[e,n]},useMutableSource:Js,useSyncExternalStore:qs,useId:cc,unstable_isNewReconciler:!1},T1={readContext:ze,useCallback:ac,useContext:ze,useEffect:Bi,useImperativeHandle:ic,useInsertionEffect:lc,useLayoutEffect:uc,useMemo:fc,useReducer:ho,useRef:rc,useState:function(){return ho(Rr)},useDebugValue:xi,useDeferredValue:function(e){var n=De();return q===null?n.memoizedState=e:sc(n,q.memoizedState,e)},useTransition:function(){var e=ho(Rr)[0],n=De().memoizedState;return[e,n]},useMutableSource:Js,useSyncExternalStore:qs,useId:cc,unstable_isNewReconciler:!1};gu={isMounted:function(e){return(e=e._reactInternals)?Jn(e)===e:!1},enqueueSetState:function(e,n,t){e=e._reactInternals;var r=ce(),l=Sn(e),u=Je(r,l);u.payload=n,t!==void 0&&t!==null&&(u.callback=t),n=gn(e,u,l),n!==null&&(Ue(n,e,l,r),Ll(n,e,l))},enqueueReplaceState:function(e,n,t){e=e._reactInternals;var r=ce(),l=Sn(e),u=Je(r,l);u.tag=1,u.payload=n,t!==void 0&&t!==null&&(u.callback=t),n=gn(e,u,l),n!==null&&(Ue(n,e,l,r),Ll(n,e,l))},enqueueForceUpdate:function(e,n){e=e._reactInternals;var t=ce(),r=Sn(e),l=Je(t,r);l.tag=2,n!==void 0&&n!==null&&(l.callback=n),n=gn(e,l,r),n!==null&&(Ue(n,e,r,t),Ll(n,e,r))}};z1=typeof WeakMap==="function"?WeakMap:Map;D1=nn.ReactCurrentOwner;ti={dehydrated:null,treeContext:null,retryLane:0};Cc=function(e,n){for(var t=n.child;t!==null;){if(t.tag===5||t.tag===6)e.appendChild(t.stateNode);else if(t.tag!==4&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===n)break;for(;t.sibling===null;){if(t.return===null||t.return===n)return;t=t.return}t.sibling.return=t.return,t=t.sibling}};li=function(){};Nc=function(e,n,t,r){var l=e.memoizedProps;if(l!==r){e=n.stateNode,Vn(xe.current);var u=null;switch(t){case"input":l=Co(e,l),r=Co(e,r),u=[];break;case"select":l=X({},l,{value:void 0}),r=X({},r,{value:void 0}),u=[];break;case"textarea":l=To(e,l),r=To(e,r),u=[];break;default:typeof l.onClick!=="function"&&typeof r.onClick==="function"&&(e.onclick=Zl)}Do(t,r);var o;t=null;for(c in l)if(!r.hasOwnProperty(c)&&l.hasOwnProperty(c)&&l[c]!=null)if(c==="style"){var i=l[c];for(o in i)i.hasOwnProperty(o)&&(t||(t={}),t[o]="")}else c!=="dangerouslySetInnerHTML"&&c!=="children"&&c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&c!=="autoFocus"&&(vr.hasOwnProperty(c)?u||(u=[]):(u=u||[]).push(c,null));for(c in r){var a=r[c];if(i=l!=null?l[c]:void 0,r.hasOwnProperty(c)&&a!==i&&(a!=null||i!=null))if(c==="style")if(i){for(o in i)!i.hasOwnProperty(o)||a&&a.hasOwnProperty(o)||(t||(t={}),t[o]="");for(o in a)a.hasOwnProperty(o)&&i[o]!==a[o]&&(t||(t={}),t[o]=a[o])}else t||(u||(u=[]),u.push(c,t)),t=a;else c==="dangerouslySetInnerHTML"?(a=a?a.__html:void 0,i=i?i.__html:void 0,a!=null&&i!==a&&(u=u||[]).push(c,a)):c==="children"?typeof a!=="string"&&typeof a!=="number"||(u=u||[]).push(c,""+a):c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&(vr.hasOwnProperty(c)?(a!=null&&c==="onScroll"&&V("scroll",e),u||i===a||(u=[])):(u=u||[]).push(c,a))}t&&(u=u||[]).push("style",t);var c=u;if(n.updateQueue=c)n.flags|=4}};Pc=function(e,n,t,r){t!==r&&(n.flags|=4)};L1=typeof WeakSet==="function"?WeakSet:Set;$1=Math.ceil,ou=nn.ReactCurrentDispatcher,Ki=nn.ReactCurrentOwner,Te=nn.ReactCurrentBatchConfig,gt=Nn(0);Hc=function(e,n,t){if(e!==null)if(e.memoizedProps!==n.pendingProps||me.current)he=!0;else{if((e.lanes&t)===0&&(n.flags&128)===0)return he=!1,R1(e,n,t);he=(e.flags&131072)!==0?!0:!1}else he=!1,B&&(n.flags&1048576)!==0&&Qs(n,bl,n.index);switch(n.lanes=0,n.tag){case 2:var r=n.type;$l(e,n),e=n.pendingProps;var l=Pt(n,ae.current);_t(n,t),l=Vi(null,n,r,e,l,t);var u=Qi();return n.flags|=1,typeof l==="object"&&l!==null&&typeof l.render==="function"&&l.$$typeof===void 0?(n.tag=1,n.memoizedState=null,n.updateQueue=null,ye(r)?(u=!0,ql(n)):u=!1,n.memoizedState=l.state!==null&&l.state!==void 0?l.state:null,Ui(n),l.updater=gu,n.stateNode=l,l._reactInternals=n,jo(n,r,e,t),n=ni(null,n,r,!0,u,t)):(n.tag=0,B&&u&&Di(n),se(null,n,l,t),n=n.child),n;case 16:r=n.elementType;e:{switch($l(e,n),e=n.pendingProps,l=r._init,r=l(r._payload),n.type=r,l=n.tag=K1(r),e=Me(r,e),l){case 0:n=ei(null,n,r,e,t);break e;case 1:n=Mf(null,n,r,e,t);break e;case 11:n=Of(null,n,r,e,t);break e;case 14:n=Rf(null,n,r,Me(r.type,e),t);break e}throw Error(E(306,r,""))}return n;case 0:return r=n.type,l=n.pendingProps,l=n.elementType===r?l:Me(r,l),ei(e,n,r,l,t);case 1:return r=n.type,l=n.pendingProps,l=n.elementType===r?l:Me(r,l),Mf(e,n,r,l,t);case 3:e:{if(Ec(n),e===null)throw Error(E(387));r=n.pendingProps,u=n.memoizedState,l=u.element,Gs(e,n),tu(n,r,null,t);var o=n.memoizedState;if(r=o.element,u.isDehydrated)if(u={element:r,isDehydrated:!1,cache:o.cache,pendingSuspenseBoundaries:o.pendingSuspenseBoundaries,transitions:o.transitions},n.updateQueue.baseState=u,n.memoizedState=u,n.flags&256){l=Ot(Error(E(423)),n),n=Ff(e,n,r,t,l);break e}else if(r!==l){l=Ot(Error(E(424)),n),n=Ff(e,n,r,t,l);break e}else for(Se=vn(n.stateNode.containerInfo.firstChild),Ee=n,B=!0,Le=null,t=Ks(n,null,r,t),n.child=t;t;)t.flags=t.flags&-3|4096,t=t.sibling;else{if(Tt(),r===l){n=en(e,n,t);break e}se(e,n,r,t)}n=n.child}return n;case 5:return Zs(n),e===null&&Zo(n),r=n.type,l=n.pendingProps,u=e!==null?e.memoizedProps:null,o=l.children,xo(r,l)?o=null:u!==null&&xo(r,u)&&(n.flags|=32),Sc(e,n),se(e,n,o,t),n.child;case 6:return e===null&&Zo(n),null;case 13:return kc(e,n,t);case 4:return $i(n,n.stateNode.containerInfo),r=n.pendingProps,e===null?n.child=zt(n,null,r,t):se(e,n,r,t),n.child;case 11:return r=n.type,l=n.pendingProps,l=n.elementType===r?l:Me(r,l),Of(e,n,r,l,t);case 7:return se(e,n,n.pendingProps,t),n.child;case 8:return se(e,n,n.pendingProps.children,t),n.child;case 12:return se(e,n,n.pendingProps.children,t),n.child;case 10:e:{if(r=n.type._context,l=n.pendingProps,u=n.memoizedProps,o=l.value,A(eu,r._currentValue),r._currentValue=o,u!==null)if($e(u.value,o)){if(u.children===l.children&&!me.current){n=en(e,n,t);break e}}else for(u=n.child,u!==null&&(u.return=n);u!==null;){var i=u.dependencies;if(i!==null){o=u.child;for(var a=i.firstContext;a!==null;){if(a.context===r){if(u.tag===1){a=Je(-1,t&-t),a.tag=2;var c=u.updateQueue;if(c!==null){c=c.shared;var v=c.pending;v===null?a.next=a:(a.next=v.next,v.next=a),c.pending=a}}u.lanes|=t,a=u.alternate,a!==null&&(a.lanes|=t),Jo(u.return,t,n),i.lanes|=t;break}a=a.next}}else if(u.tag===10)o=u.type===n.type?null:u.child;else if(u.tag===18){if(o=u.return,o===null)throw Error(E(341));o.lanes|=t,i=o.alternate,i!==null&&(i.lanes|=t),Jo(o,t,n),o=u.sibling}else o=u.child;if(o!==null)o.return=u;else for(o=u;o!==null;){if(o===n){o=null;break}if(u=o.sibling,u!==null){u.return=o.return,o=u;break}o=o.return}u=o}se(e,n,l.children,t),n=n.child}return n;case 9:return l=n.type,r=n.pendingProps.children,_t(n,t),l=ze(l),r=r(l),n.flags|=1,se(e,n,r,t),n.child;case 14:return r=n.type,l=Me(r,n.pendingProps),l=Me(r.type,l),Rf(e,n,r,l,t);case 15:return gc(e,n,n.type,n.pendingProps,t);case 17:return r=n.type,l=n.pendingProps,l=n.elementType===r?l:Me(r,l),$l(e,n),n.tag=1,ye(r)?(e=!0,ql(n)):e=!1,_t(n,t),mc(n,r,l),jo(n,r,l,t),ni(null,n,r,!0,e,t);case 19:return _c(e,n,t);case 22:return wc(e,n,t)}throw Error(E(156,n.tag))};Qc=typeof reportError==="function"?reportError:function(e){console.error(e)};_u.prototype.render=na.prototype.render=function(e){var n=this._internalRoot;if(n===null)throw Error(E(409));ku(e,n,null,null)};_u.prototype.unmount=na.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var n=e.containerInfo;Gn(function(){ku(null,e,null,null)}),n[je]=null}};_u.prototype.unstable_scheduleHydration=function(e){if(e){var n=ws();e={blockedOn:null,target:e,priority:n};for(var t=0;t<sn.length&&n!==0&&n<sn[t].priority;t++);sn.splice(t,0,e),t===0&&Es(e)}};vs=function(e){switch(e.tag){case 3:var n=e.stateNode;if(n.current.memoizedState.isDehydrated){var t=tr(n.pendingLanes);t!==0&&(Ei(n,t|1),ve(n,Z()),($&6)===0&&(Rt=Z()+500,Pn()))}break;case 13:Gn(function(){var r=be(e,1);if(r!==null){var l=ce();Ue(r,e,1,l)}}),ea(e,1)}};ki=function(e){if(e.tag===13){var n=be(e,134217728);if(n!==null){var t=ce();Ue(n,e,134217728,t)}ea(e,134217728)}};gs=function(e){if(e.tag===13){var n=Sn(e),t=be(e,n);if(t!==null){var r=ce();Ue(t,e,n,r)}ea(e,n)}};ws=function(){return H};Ss=function(e,n){var t=H;try{return H=e,n()}finally{H=t}};Mo=function(e,n,t){switch(n){case"input":if(No(e,t),n=t.name,t.type==="radio"&&n!=null){for(t=e;t.parentNode;)t=t.parentNode;t=t.querySelectorAll("input[name="+JSON.stringify(""+n)+'][type="radio"]');for(n=0;n<t.length;n++){var r=t[n];if(r!==e&&r.form===e.form){var l=mu(r);if(!l)throw Error(E(90));qf(r),No(r,l)}}}break;case"textarea":bf(e,t);break;case"select":n=t.value,n!=null&&wt(e,!!t.multiple,n,!1)}};os=Zi;is=Gn;q1={usingClientEntryPoint:!1,Events:[Ur,dt,mu,ls,us,Zi]},bt={findFiberByHostInstance:An,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},j1={bundleType:bt.bundleType,version:bt.version,rendererPackageName:bt.rendererPackageName,rendererConfig:bt.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:nn.ReactCurrentDispatcher,findHostInstanceByFiber:function(e){return e=ss(e),e===null?null:e.stateNode},findFiberByHostInstance:bt.findFiberByHostInstance||Z1,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){if(ot=__REACT_DEVTOOLS_GLOBAL_HOOK__,!ot.isDisabled&&ot.supportsFiber)try{cu=ot.inject(j1),Be=ot}catch(e){}}Bc=q1,jc=Zi});var ld=ll((Eh,rd)=>{nd();function td(){if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!=="function")return;try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(td)}catch(e){console.error(e)}}td(),rd.exports=ra});var ud=ll((eh)=>{var Hr=Ye(ld(),1);eh.createRoot=Hr.createRoot,eh.hydrateRoot=Hr.hydrateRoot;var b1});var hd=Ye(Ln(),1),md=Ye(ud(),1);var I=Ye(Ln(),1);var Tu=Ye(Ln(),1);var od=(e)=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),Pu=(...e)=>e.filter((n,t,r)=>{return Boolean(n)&&n.trim()!==""&&r.indexOf(n)===t}).join(" ").trim();var Ar=Ye(Ln(),1);var id={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};var ad=Ar.forwardRef(({color:e="currentColor",size:n=24,strokeWidth:t=2,absoluteStrokeWidth:r,className:l="",children:u,iconNode:o,...i},a)=>{return Ar.createElement("svg",{ref:a,...id,width:n,height:n,stroke:e,strokeWidth:r?Number(t)*24/Number(n):t,className:Pu("lucide",l),...i},[...o.map(([c,v])=>Ar.createElement(c,v)),...Array.isArray(u)?u:[u]])});var F=(e,n)=>{let t=Tu.forwardRef(({className:r,...l},u)=>Tu.createElement(ad,{ref:u,iconNode:n,className:Pu(`lucide-${od(e)}`,r),...l}));return t.displayName=`${e}`,t};var Lt=F("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);var He=F("BadgeCheck",[["path",{d:"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z",key:"3c2336"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);var Wr=F("Bell",[["path",{d:"M10.268 21a2 2 0 0 0 3.464 0",key:"vwvbt9"}],["path",{d:"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",key:"11g9vi"}]]);var Vr=F("Bookmark",[["path",{d:"m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z",key:"1fy3hk"}]]);var Qr=F("CalendarDays",[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"M8 14h.01",key:"6423bh"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M16 14h.01",key:"1gbofw"}],["path",{d:"M8 18h.01",key:"lrp35t"}],["path",{d:"M12 18h.01",key:"mhygvu"}],["path",{d:"M16 18h.01",key:"kzsmim"}]]);var Br=F("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);var It=F("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);var Tn=F("Clock3",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16.5 12",key:"1aq6pp"}]]);var xr=F("Download",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]]);var Ut=F("Flag",[["path",{d:"M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z",key:"i9b6wo"}],["line",{x1:"4",x2:"4",y1:"22",y2:"15",key:"1cm3nv"}]]);var Yr=F("Globe",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",key:"13o1zl"}],["path",{d:"M2 12h20",key:"9i4pu4"}]]);var Kr=F("KeyRound",[["path",{d:"M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z",key:"1s6t7t"}],["circle",{cx:"16.5",cy:"7.5",r:".5",fill:"currentColor",key:"w0ekpg"}]]);var Xr=F("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]);var $t=F("MapPin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);var Ht=F("Newspaper",[["path",{d:"M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2",key:"7pis2x"}],["path",{d:"M18 14h-8",key:"sponae"}],["path",{d:"M15 18h-5",key:"95g1m2"}],["path",{d:"M10 6h8v4h-8V6Z",key:"smlsk5"}]]);var qn=F("QrCode",[["rect",{width:"5",height:"5",x:"3",y:"3",rx:"1",key:"1tu5fj"}],["rect",{width:"5",height:"5",x:"16",y:"3",rx:"1",key:"1v8r4q"}],["rect",{width:"5",height:"5",x:"3",y:"16",rx:"1",key:"1x03jg"}],["path",{d:"M21 16h-3a2 2 0 0 0-2 2v3",key:"177gqh"}],["path",{d:"M21 21v.01",key:"ents32"}],["path",{d:"M12 7v3a2 2 0 0 1-2 2H7",key:"8crl2c"}],["path",{d:"M3 12h.01",key:"nlz23k"}],["path",{d:"M12 3h.01",key:"n36tog"}],["path",{d:"M12 16v.01",key:"133mhm"}],["path",{d:"M16 12h1",key:"1slzba"}],["path",{d:"M21 12v.01",key:"1lwtk9"}],["path",{d:"M12 21v-1",key:"1880an"}]]);var Gr=F("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]]);var Zr=F("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);var At=F("ShieldCheck",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);var tn=F("Sparkles",[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]]);var zn=F("TriangleAlert",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);var Jr=F("Tv",[["rect",{width:"20",height:"15",x:"2",y:"7",rx:"2",ry:"2",key:"10ag99"}],["polyline",{points:"17 2 12 7 7 2",key:"11pgbg"}]]);var Dn=F("UserRound",[["circle",{cx:"12",cy:"8",r:"5",key:"1hypcn"}],["path",{d:"M20 21a8 8 0 0 0-16 0",key:"rfgkzh"}]]);var Wt=F("Volume2",[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["path",{d:"M16 9a5 5 0 0 1 0 6",key:"1q6k2b"}],["path",{d:"M19.364 18.364a9 9 0 0 0 0-12.728",key:"ijwkga"}]]);var qr=F("VolumeX",[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["line",{x1:"22",x2:"16",y1:"9",y2:"15",key:"1ewh16"}],["line",{x1:"16",x2:"22",y1:"9",y2:"15",key:"5ykzw1"}]]);var fd=Ye(Ln(),1),nh=Symbol.for("react.element"),th=Symbol.for("react.fragment"),rh=Object.prototype.hasOwnProperty,lh=fd.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,uh={key:!0,ref:!0,__self:!0,__source:!0};function sd(e,n,t){var r,l={},u=null,o=null;t!==void 0&&(u=""+t),n.key!==void 0&&(u=""+n.key),n.ref!==void 0&&(o=n.ref);for(r in n)rh.call(n,r)&&!uh.hasOwnProperty(r)&&(l[r]=n[r]);if(e&&e.defaultProps)for(r in n=e.defaultProps,n)l[r]===void 0&&(l[r]=n[r]);return{$$typeof:nh,type:e,key:u,ref:o,props:l,_owner:lh.current}}var jn=th,m=sd,S=sd;var cd=[10,16,26,18,24,16,18,22,22,26],dd=[1,1,1,2,2,4,2,2,3,4],pd=[26,44,70,100,134,172,196,242,292,346],oh=[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50]];function ih(e){let n=[1];for(let r=0;r<e-1;r++)n.push(0);n.push(1);let t=1;for(let r=0;r<e;r++){for(let l=0;l<n.length-1;l++)if(n[l]=br(n[l],t),n[l+1]!==0)n[l]^=br(n[l+1],1);n[n.length-1]=br(n[n.length-1],t),t=br(t,2)}return n}function br(e,n){let t=0;for(let r=7;r>=0;r--)if(t=t<<1^(t>>7)*285,(n>>r&1)!==0)t^=e;return t}function ah(e,n){let t=e.slice();for(let r=0;r<e.length;r++){let l=t[r];if(l!==0)for(let u=1;u<n.length;u++)t[r+u]^=br(n[u],l)}return t.slice(e.length)}function On(e,n){return(e>>>n&1)!==0}function fh(e,n,t){let r=e*4+17,l=Array.from({length:r},()=>Array(r).fill(null)),u=Array.from({length:r},()=>Array(r).fill(!1));function o(h,T,s){l[T][h]=s,u[T][h]=!0}for(let h=0;h<7;h++)for(let T=0;T<7;T++){let s=h===0||h===6||T===0||T===6||h>=2&&h<=4&&T>=2&&T<=4;o(h,T,s),o(r-1-h,T,s),o(h,r-1-T,s)}for(let h=0;h<8;h++)o(7,h,h!==6),o(r-8+h,7,h!==6),o(7,r-8+h,h!==6),o(h,7,h!==6);for(let h=0;h<9;h++)o(8,h,h!==6),o(r-9+h,8,h!==6),o(8,r-9+h,h!==6),o(h,8,h!==6);for(let h=0;h<8;h++)o(8,r-8+h,!1);for(let h=0;h<r;h++){let T=h%2===0;o(6,h,T),o(h,6,T)}let i=oh[e-1]||[];for(let h of i)for(let T of i)if(!(h===6&&T===6||h===6&&T===r-7||h===r-7&&T===6))for(let s=-2;s<=2;s++)for(let f=-2;f<=2;f++)o(h+f,T+s,Math.max(Math.abs(f),Math.abs(s))!==1);let c=0|t,v=c;for(let h=0;h<10;h++)v=v<<1^(v>>9&1)*1335;let g=(c<<10|v)^21522;for(let h=0;h<=5;h++)o(8,h,On(g,h));o(8,7,On(g,6)),o(8,8,On(g,7)),o(7,8,On(g,8));for(let h=9;h<15;h++)o(14-h,8,On(g,h));for(let h=0;h<8;h++)o(r-1-h,8,On(g,h));for(let h=8;h<15;h++)o(8,r-15+h,On(g,h));if(o(r-8,8,!0),e>=7){let h=e;for(let s=0;s<12;s++)h=h<<1^(h>>11&1)*7973;let T=e<<12|h;for(let s=0;s<18;s++){let f=On(T,s),d=Math.floor(s/3),w=s%3;o(d,r-11+w,f),o(r-11+w,d,f)}}let y=[];for(let h of n)for(let T=7;T>=0;T--)y.push(h>>>T&1);let k=0,N=!0;for(let h=r-1;h>=1;h-=2){if(h===6)h=5;for(let T=0;T<r;T++){let s=N?r-1-T:T;for(let f=0;f<2;f++){let d=h-f;if(!u[s][d]){let w=k<y.length?y[k]:0,C=!1;if(t===0)C=(d+s)%2===0;else if(t===1)C=s%2===0;else if(t===2)C=d%3===0;else if(t===3)C=(d+s)%3===0;else if(t===4)C=(Math.floor(d/3)+Math.floor(s/2))%2===0;else if(t===5)C=d*s%2+d*s%3===0;else if(t===6)C=(d*s%2+d*s%3)%2===0;else C=((d+s)%2+d*s%3)%2===0;if(C)w^=1;l[s][d]=w===1,k++}}}N=!N}return l}function sh(e){let n=0,t=e.length;for(let o=0;o<t;o++){let i=1,a=e[o][0];for(let c=1;c<t;c++)if(e[o][c]===a)i++;else{if(i>=5)n+=3+(i-5);i=1,a=e[o][c]}if(i>=5)n+=3+(i-5)}for(let o=0;o<t;o++){let i=1,a=e[0][o];for(let c=1;c<t;c++)if(e[c][o]===a)i++;else{if(i>=5)n+=3+(i-5);i=1,a=e[c][o]}if(i>=5)n+=3+(i-5)}for(let o=0;o<t-1;o++)for(let i=0;i<t-1;i++){let a=e[o][i];if(a===e[o][i+1]&&a===e[o+1][i]&&a===e[o+1][i+1])n+=3}for(let o=0;o<t;o++)for(let i=0;i<t-11;i++){let a=[1,0,1,1,1,0,1,0,0,0,0],c=[0,0,0,0,1,0,1,1,1,0,1],v=!0,g=!0;for(let y=0;y<11;y++){let k=e[o][i+y]?1:0;if(k!==a[y])v=!1;if(k!==c[y])g=!1}if(v||g)n+=40}for(let o=0;o<t;o++)for(let i=0;i<t-11;i++){let a=[1,0,1,1,1,0,1,0,0,0,0],c=[0,0,0,0,1,0,1,1,1,0,1],v=!0,g=!0;for(let y=0;y<11;y++){let k=e[i+y][o]?1:0;if(k!==a[y])v=!1;if(k!==c[y])g=!1}if(v||g)n+=40}let r=0;for(let o of e)for(let i of o)if(i)r++;let l=t*t,u=Math.floor(Math.abs(r*20-l*10)+l-1)/l-1;return n+=u*10,n}function ch(e){let n=new TextEncoder().encode(e),t=1,r=-1;for(let z=1;z<=10;z++){let O=cd[z-1],W=dd[z-1],et=pd[z-1]-O*W;if(4+(z<=9?8:16)+n.length*8<=et*8){r=z;break}}if(r===-1)throw Error("too_long");t=r;let l=cd[t-1],u=dd[t-1],o=pd[t-1]-l*u,i=t<=9?8:16,a=[],c=(z,O)=>{for(let W=O-1;W>=0;W--)a.push(z>>>W&1)};c(4,4),c(n.length,i);for(let z of n)c(z,8);let v=o*8,g=Math.min(4,v-a.length);for(let z=0;z<g;z++)a.push(0);while(a.length%8!==0)a.push(0);let y=[];for(let z=0;z<a.length;z+=8){let O=0;for(let W=0;W<8;W++)O=O<<1|a[z+W];y.push(O)}let k=[236,17],N=0;while(y.length<o)y.push(k[N%2]),N++;let h=ih(l),T=u-o%u,s=Math.floor(o/u),f=[],d=0;for(let z=0;z<u;z++){let O=s+(z>=T?1:0);f.push(y.slice(d,d+O)),d+=O}let w=f.map((z)=>ah(z,h)),C=[],R=Math.max(...f.map((z)=>z.length));for(let z=0;z<R;z++)for(let O=0;O<u;O++)if(z<f[O].length)C.push(f[O][z]);for(let z=0;z<l;z++)for(let O=0;O<u;O++)C.push(w[O][z]);let D=null,M=1/0;for(let z=0;z<8;z++){let O=fh(t,C,z),W=sh(O);if(W<M)M=W,D=O}return D}var zu=new Date("2026-11-15T12:00:00+06:00"),la="https://ayna-book.github.io",dh=[{id:1,cat:"কক্সবাজার",catEn:"Cox's Bazar",titleBn:"কক্সবাজার সমুদ্রসৈকতে সকাল থেকে পরিচ্ছন্নতা অভিযান",titleEn:"Morning clean-up drive begins on Cox's Bazar beach",bodyBn:"আজ সকালে কক্সবাজার সমুদ্রসৈকতের লাবণী পয়েন্টে স্থানীয় স্বেচ্ছাসেবক, দোকানি ও পর্যটকদের নিয়ে পরিচ্ছন্নতা অভিযান শুরু হয়েছে। আয়োজকেরা জানিয়েছেন, প্লাস্টিক বর্জ্য আলাদা করে সংগ্রহ করে নির্ধারিত জায়গায় রাখা হচ্ছে। দুপুর পর্যন্ত অভিযান চলবে।",bodyEn:"This morning, volunteers, shopkeepers and visitors joined a clean-up drive at Laboni Point on Cox's Bazar beach. Organisers said plastic waste is being collected separately and kept at designated points. The drive will continue until noon.",source:"Prothom Alo",place:"লাবণী পয়েন্ট, কক্সবাজার",placeEn:"Laboni Point, Cox's Bazar",published:"2026-11-15T10:12:00+06:00",minutesAgo:108,imgHue:"#ff2e7e",icon:"beach",verified:!0,sourceUrl:"https://www.prothomalo.com/"},{id:2,cat:"উখিয়া",catEn:"Ukhiya",titleBn:"উখিয়ায় নতুন পানির লাইন চালু, সুফল পাচ্ছেন ৪০০ পরিবার",titleEn:"New water line opens in Ukhiya, helping 400 families",bodyBn:"উখিয়ার একটি এলাকায় নতুন পানির সরবরাহ লাইন চালু হয়েছে। স্থানীয় বাসিন্দারা বলছেন, আগে দূর থেকে পানি আনতে হতো। এখন কাছাকাছি পয়েন্ট থেকে নিরাপদ পানি পাওয়া যাচ্ছে। কর্তৃপক্ষ নিয়মিত মান পরীক্ষার কথা জানিয়েছে।",bodyEn:"A new water supply line has opened in an area of Ukhiya. Residents said they previously had to fetch water from far away. Safe water is now available from nearby points, and authorities said quality will be checked regularly.",source:"BSS",place:"উখিয়া",placeEn:"Ukhiya",published:"2026-11-15T09:05:00+06:00",minutesAgo:175,imgHue:"#2ee6a8",icon:"water",verified:!0,sourceUrl:"https://www.bssnews.net/"},{id:3,cat:"কক্সবাজার",catEn:"Cox's Bazar",titleBn:"সৈকত সড়কে যানজট কমাতে নতুন নির্দেশনা",titleEn:"New guidance to ease traffic on beach road",bodyBn:"সৈকত সড়কে সকালের ভিড় সামলাতে ট্রাফিক ব্যবস্থায় কিছু পরিবর্তন আনা হয়েছে। ব্যস্ত সময়ে ভারী যান চলাচলে নিয়ন্ত্রণ থাকবে। পর্যটকদের নির্ধারিত পার্কিং ব্যবহারের অনুরোধ জানানো হয়েছে।",bodyEn:"Traffic arrangements have been adjusted to manage morning crowds on the beach road. Heavy vehicles will be restricted during busy hours. Visitors have been asked to use designated parking areas.",source:"Daily Star",place:"সৈকত সড়ক, কক্সবাজার",placeEn:"Beach Road, Cox's Bazar",published:"2026-11-15T07:40:00+06:00",minutesAgo:260,imgHue:"#ffbe3c",icon:"traffic",verified:!0,sourceUrl:"https://www.thedailystar.net/"}],ph=[{id:101,titleBn:"মুহূর্তের খবর: সৈকতে পরিচ্ছন্নতা অভিযানে শতাধিক স্বেচ্ছাসেবক",titleEn:"Viral now: Over a hundred volunteers join beach clean-up",bodyBn:"আজ সকালে লাবণী পয়েন্টে পরিচ্ছন্নতা অভিযানের ছবি ও ভিডিও ছড়িয়ে পড়েছে। আয়োজকেরা জানিয়েছেন, সংগৃহীত বর্জ্য আলাদা করে রাখা হচ্ছে।",bodyEn:"Photos and videos from this morning’s clean-up at Laboni Point are spreading. Organisers said collected waste is being kept separately.",source:"Prothom Alo",sourceUrl:"https://www.prothomalo.com/",published:"2026-11-15T10:12:00+06:00",verified:!0,whyBn:"মূল সূত্রে ছবি ও সময় মিলেছে"},{id:102,titleBn:"মুহূর্তের খবর: উখিয়ায় নতুন পানির লাইন চালু",titleEn:"Viral now: New water line opens in Ukhiya",bodyBn:"উখিয়ায় নতুন পানির লাইন চালুর খবরটি আজ সকালে ছড়িয়ে পড়েছে। স্থানীয়রা কাছের পয়েন্ট থেকে পানি পাচ্ছেন বলে জানিয়েছেন।",bodyEn:"News of the new water line in Ukhiya spread this morning. Residents said they can now collect water from nearby points.",source:"BSS",sourceUrl:"https://www.bssnews.net/",published:"2026-11-15T09:05:00+06:00",verified:!0,whyBn:"সরকারি সংবাদ সংস্থার মূল প্রতিবেদন আছে"},{id:103,titleBn:"মুহূর্তের খবর: সৈকত সড়কে নতুন ট্রাফিক নির্দেশনা",titleEn:"Viral now: New traffic guidance on beach road",bodyBn:"সৈকত সড়কে ব্যস্ত সময়ে ভারী যান নিয়ন্ত্রণের নির্দেশনাটি আজ ছড়িয়ে পড়েছে। পর্যটকদের নির্ধারিত পার্কিং ব্যবহার করতে বলা হয়েছে।",bodyEn:"The new guidance restricting heavy vehicles on the beach road during busy hours spread today. Visitors were asked to use designated parking.",source:"Daily Star",sourceUrl:"https://www.thedailystar.net/",published:"2026-11-15T07:40:00+06:00",verified:!0,whyBn:"মূল সূত্রে সময় ও নির্দেশনা মিলেছে"},{id:104,titleBn:"যাচাই ছাড়া ছড়িয়ে পড়া দাবি: সৈকত বন্ধের গুজব",titleEn:"Unverified claim spreading: rumour about beach closure",bodyBn:"এই দাবিটির কোনো নির্ভরযোগ্য মূল সূত্র পাওয়া যায়নি। যাচাই না হওয়া পর্যন্ত এটি দেখানো হচ্ছে না।",bodyEn:"No reliable original source was found for this claim. It is not shown until verified.",source:"অজানা ফেসবুক পোস্ট",sourceUrl:"https://www.prothomalo.com/",published:"2026-11-15T08:00:00+06:00",verified:!1,whyBn:"মূল সূত্র পাওয়া যায়নি"}],hh=[{id:1,kind:"TV",nameBn:"যমুনা টিভি",nameEn:"Jamuna TV",descBn:"সরাসরি সংবাদ ও টকশো",url:"https://www.jamuna.tv/",color:"#ef4444",emoji:"\uD83D\uDCFA"},{id:2,kind:"TV",nameBn:"সময় টিভি",nameEn:"Somoy TV",descBn:"সরাসরি সংবাদ",url:"https://www.somoynews.tv/",color:"#f97316",emoji:"\uD83D\uDCFA"},{id:3,kind:"TV",nameBn:"চ্যানেল ২৪",nameEn:"Channel 24",descBn:"সরাসরি সংবাদ",url:"https://www.channel24bd.tv/",color:"#22c55e",emoji:"\uD83D\uDCFA"},{id:4,kind:"TV",nameBn:"এনটিভি",nameEn:"NTV",descBn:"সরাসরি সংবাদ ও অনুষ্ঠান",url:"https://www.ntvbd.com/",color:"#3b82f6",emoji:"\uD83D\uDCFA"},{id:5,kind:"TV",nameBn:"একাত্তর টিভি",nameEn:"Ekattor TV",descBn:"সরাসরি সংবাদ",url:"https://www.ekattor.tv/",color:"#a855f7",emoji:"\uD83D\uDCFA"},{id:6,kind:"Radio",nameBn:"বাংলাদেশ বেতার",nameEn:"Bangladesh Betar",descBn:"সরাসরি রেডিও সম্প্রচার",url:"https://betar.gov.bd/",color:"#14b8a6",emoji:"\uD83D\uDCFB"},{id:7,kind:"Radio",nameBn:"রেডিও ফূর্তি",nameEn:"Radio Foorti",descBn:"সরাসরি এফএম",url:"https://www.radiofoorti.fm/",color:"#ec4899",emoji:"\uD83D\uDCFB"},{id:8,kind:"Radio",nameBn:"রেডিও টুডে",nameEn:"Radio Today",descBn:"সরাসরি এফএম",url:"https://radiotoday.fm/",color:"#eab308",emoji:"\uD83D\uDCFB"}],bn=(e)=>e.replace(/[0-9]/g,(n)=>"০১২৩৪৫৬৭৮৯"[Number(n)]);function mh(e,n){if(n==="en")return e<12?"AM":"PM";if(e<5)return"রাত";if(e<7)return"ভোর";if(e<12)return"সকাল";if(e<15)return"দুপুর";if(e<18)return"বিকেল";if(e<20)return"সন্ধ্যা";return"রাত"}function ua(e,n){let t=new Date(e),r=t.toDateString()===zu.toDateString(),l=new Date(zu);l.setDate(zu.getDate()-1);let u=t.toDateString()===l.toDateString(),o=t.getHours(),i=String(t.getMinutes()).padStart(2,"0"),a=["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"],c=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];if(n==="bn"){let k=o%12===0?12:o%12,N=`${mh(o,"bn")} ${bn(String(k))}:${bn(i)}`;if(r)return`আজ, ${N}`;if(u)return`গতকাল, ${N}`;return`${bn(String(t.getDate()))} ${a[t.getMonth()]}, ${N}`}let v=o%12===0?12:o%12,g=o<12?"AM":"PM",y=`${v}:${i} ${g}`;if(r)return`Today, ${y}`;if(u)return`Yesterday, ${y}`;return`${t.getDate()} ${c[t.getMonth()]}, ${y}`}var yh={bn:{app:"আয়না বুক",tag:"কক্সবাজার • উখিয়া",news:"খবর",live:"লাইভ",viral:"মুহূর্তের খবর",qr:"QR",settings:"সেটিংস",dashboard:"ড্যাশবোর্ড",searchPh:"খবর খুঁজুন…",today:"আজকের",last24:"গত ২৪ ঘণ্টা",all:"সব",old:"পুরনো খবর",fresh:"তাজা",source:"সূত্র",read:"বিস্তারিত পড়ুন",back:"ফিরে যান",profile:"প্রোফাইল সেটিংস",account:"অ্যাকাউন্ট সেটিংস",privacy:"প্রাইভেসি সেটিংস",sound:"সাউন্ড সেটিংস",language:"ভাষা",name:"নাম",phone:"ফোন নম্বর",photo:"ছবির লিংক",save:"সেভ করুন",saved:"সেভ হয়েছে ✓",saveFail:"সেভ করা যায়নি। আবার চেষ্টা করুন।",currentPass:"বর্তমান পাসওয়ার্ড",newPass:"নতুন পাসওয়ার্ড",confirmPass:"নতুন পাসওয়ার্ড আবার লিখুন",updatePass:"পাসওয়ার্ড আপডেট করুন",passSaved:"পাসওয়ার্ড আপডেট হয়েছে",passMismatch:"দুটি নতুন পাসওয়ার্ড মিলছে না",passShort:"নতুন পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে",visible:"প্রোফাইল সবার জন্য দৃশ্যমান",showPhone:"ফোন নম্বর দেখান",soundOn:"সাউন্ড চালু",volume:"ভলিউম",chooseLang:"ভাষা বেছে নিন",qrTitle:"QR কোড বানান",qrHint:"যেকোনো লেখা বা লিংক লিখুন",generate:"QR বানান",download:"ডাউনলোড",myQR:"আমার প্রোফাইল QR",qrEmpty:"আগে লেখা / লিংক লিখুন",qrLong:"লেখাটি অনেক বড় — একটু ছোট করুন",qrReady:"QR তৈরি — স্ক্যান করে দেখুন",scanHint:"ক্যামেরা দিয়ে স্ক্যান করুন",settingsDesc:"আপনার অ্যাকাউন্ট ও অ্যাপ সাজান",version:"ভার্সন ২.১ • ফিক্সড",newsCount:"টি খবর",noNews:"এই ফিল্টারে কোনো খবর নেই",settingsSaved:"সেটিংস সেভ হয়েছে",toggleOn:"চালু",toggleOff:"বন্ধ",typeHere:"এখানে লিখুন…",verified:"যাচাই করা ✓",report:"ভুল তথ্য রিপোর্ট করো",reported:"রিপোর্ট করা হয়েছে, যাচাই চলছে",watch:"দেখুন",listen:"শুনুন",liveNow:"এখন চলছে",verifiedOnly:"শুধু যাচাই করা খবর দেখাও",unverified:"যাচাই হয়নি - দেখাবেন না",rule:"AYNA BOOK - কোনো মিথ্যা / গুজব খবর দেওয়া হবে না। প্রতিটা খবরের সোর্স ও সময় দেওয়া থাকবে।"},en:{app:"Ayna Book",tag:"Cox's Bazar • Ukhiya",news:"News",live:"Live",viral:"Viral",qr:"QR",settings:"Settings",dashboard:"Dashboard",searchPh:"Search news…",today:"Today",last24:"Last 24h",all:"All",old:"Old news",fresh:"Fresh",source:"Source",read:"Read details",back:"Back",profile:"Profile Settings",account:"Account Settings",privacy:"Privacy Settings",sound:"Sound Settings",language:"Language",name:"Name",phone:"Phone number",photo:"Photo link",save:"Save",saved:"Saved ✓",saveFail:"Could not save. Please try again.",currentPass:"Current password",newPass:"New password",confirmPass:"Confirm new password",updatePass:"Update password",passSaved:"Password updated",passMismatch:"New passwords do not match",passShort:"New password must be at least 6 characters",visible:"Profile visible to everyone",showPhone:"Show phone number",soundOn:"Sound on",volume:"Volume",chooseLang:"Choose language",qrTitle:"Make a QR code",qrHint:"Type any text or link",generate:"Generate QR",download:"Download",myQR:"My Profile QR",qrEmpty:"Type text / link first",qrLong:"Text is too long — please shorten it",qrReady:"QR ready — try scanning it",scanHint:"Scan with your camera",settingsDesc:"Manage your account & app",version:"Version 2.1 • Fixed",newsCount:"news items",noNews:"No news in this filter",settingsSaved:"Settings saved",toggleOn:"On",toggleOff:"Off",typeHere:"Type here…",verified:"Verified ✓",report:"Report wrong info",reported:"Reported — verification in progress",watch:"Watch",listen:"Listen",liveNow:"Now live",verifiedOnly:"Show only verified news",unverified:"Not verified — do not show",rule:"AYNA BOOK — No false / rumour news. Every story shows its source and time.",watchLabel:"Watch / Listen"}};async function jr(e,n){let t=await fetch("actions",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:e,args:n})}),r=await t.json();if(!t.ok||r.error)throw Error(r.error||"Request failed");return r.data}function oa(){let[e,n]=I.useState("bn"),[t,r]=I.useState("news"),[l,u]=I.useState("today"),[o,i]=I.useState(""),[a,c]=I.useState(null),[v,g]=I.useState(null),[y,k]=I.useState(""),[N,h]=I.useState(""),[T,s]=I.useState(""),[f,d]=I.useState(""),w=I.useRef(null),[C,R]=I.useState("আয়না আক্তার"),[D,M]=I.useState("01800-000000"),[z,O]=I.useState(""),[W,et]=I.useState(!0),[el,Du]=I.useState(!1),[Rn,ia]=I.useState(!0),[nt,aa]=I.useState(70),[yd,fa]=I.useState(""),[Ou,sa]=I.useState(""),[ca,da]=I.useState(""),[pa,Ru]=I.useState(""),[ha,ma]=I.useState(null),[ya,va]=I.useState(!1),[Mu,vd]=I.useState(new Date("2026-11-15T10:45:00+06:00")),[tt,gd]=I.useState(!0),[rn,ga]=I.useState([]),[wa,Sa]=I.useState(null),[Vt,wd]=I.useState("all"),_=yh[e],Mn=(p)=>{k(p),setTimeout(()=>k(""),2600)};I.useEffect(()=>{let p=setInterval(()=>{vd((L)=>new Date(L.getTime()+60000))},60000);return()=>clearInterval(p)},[]);let Sd=I.useMemo(()=>{let p=Mu.getHours(),L=p%12===0?12:p%12,U=String(Mu.getMinutes()).padStart(2,"0"),ge=p<12?"AM":"PM";return e==="bn"?`আপডেট: আজ, ১৫ নভেম্বর ২০২৬, ${bn(String(L))}:${bn(U)} ${ge}`:`Updated: Today, 15 Nov 2026, ${L}:${U} ${ge}`},[Mu,e]);I.useEffect(()=>{(async()=>{try{let L=(await jr("records.list",{collection:"ayna_settings"}))?.records?.[0];if(L?.value){let U=L.value;if(ma(L.id),U.lang)n(U.lang);if(U.name)R(U.name);if(U.phone)M(U.phone);if(U.photo)O(U.photo);if(typeof U.profileVisible==="boolean")et(U.profileVisible);if(typeof U.showPhone==="boolean")Du(U.showPhone);if(typeof U.soundOn==="boolean")ia(U.soundOn);if(typeof U.volume==="number")aa(U.volume)}}catch{}try{let L=((await jr("records.list",{collection:"ayna_reports"}))?.records||[]).map((U)=>U?.value?.newsId).filter((U)=>typeof U==="number");if(L.length)ga(L)}catch{}})()},[]);let ln=async(p)=>{let L={lang:e,name:C,phone:D,photo:z,profileVisible:W,showPhone:el,soundOn:Rn,volume:nt,...p};va(!0);try{if(ha)await jr("records.replace",{collection:"ayna_settings",id:ha,value:L});else{let U=await jr("records.create",{collection:"ayna_settings",value:L,idempotency_key:`ayna-settings-${Date.now()}`});if(U?.id)ma(U.id)}Mn(_.saved)}catch{Mn(_.saveFail)}va(!1)},Ed=(p)=>{n(p),ln({lang:p})},kd=()=>{if(Ou.length<6){Ru(_.passShort);return}if(Ou!==ca){Ru(_.passMismatch);return}Ru(_.passSaved),fa(""),sa(""),da(""),Mn(_.passSaved)},_d=async(p)=>{if(rn.includes(p))return;Sa(p);try{await jr("records.create",{collection:"ayna_reports",value:{newsId:p,reportedAt:new Date().toISOString()},idempotency_key:`ayna-report-${p}`})}catch(L){Mn(_.saveFail)}if(ga((L)=>L.includes(p)?L:[...L,p]),a?.id===p)c(null);Mn(_.reported),Sa(null)},Fu=I.useMemo(()=>dh.filter((p)=>!rn.includes(p.id)).filter((p)=>{if(l==="today")return new Date(p.published).toDateString()===zu.toDateString();if(l==="24h")return p.minutesAgo<=1440;return!0}).filter((p)=>(e==="bn"?p.titleBn+p.bodyBn:p.titleEn+p.bodyEn).toLowerCase().includes(o.toLowerCase())),[l,o,e,rn]),nl=I.useMemo(()=>ph.filter((p)=>!rn.includes(p.id)).filter((p)=>tt?p.verified:!0),[tt,rn]),Cd=I.useMemo(()=>hh.filter((p)=>Vt==="all"?!0:p.kind===Vt),[Vt]);I.useEffect(()=>{if(!T||!w.current)return;try{let p=ch(T),L=4,U=p.length+8,ge=w.current,Fn=8;ge.width=U*8,ge.height=U*8;let Qt=ge.getContext("2d");if(!Qt)return;Qt.fillStyle="#ffffff",Qt.fillRect(0,0,ge.width,ge.height),Qt.fillStyle="#111111";for(let tl=0;tl<p.length;tl++)for(let rl=0;rl<p.length;rl++)if(p[tl][rl])Qt.fillRect((rl+4)*8,(tl+4)*8,8,8);d("")}catch{d(_.qrLong)}},[T,_.qrLong]);let Nd=()=>{if(!N.trim()){d(_.qrEmpty);return}s(N.trim())},Pd=()=>{h(la),s(la)},Td=()=>{let p=w.current;if(!p||!T)return;let L=document.createElement("a");L.href=p.toDataURL("image/png"),L.download="ayna-qr.png",L.click()},vh=(p)=>p.minutesAgo>1440,Ea=[["news",_.news,Ht],["live",_.live,Jr],["viral",_.viral,tn],["qr",_.qr,qn],["settings",_.settings,Zr]],Lu=(p)=>S("button",{onClick:(L)=>{L.stopPropagation(),_d(p)},disabled:wa===p,className:"mt-3 w-full py-2.5 rounded-xl bg-red-500/15 border border-red-400/40 text-red-200 text-[13px] font-bold flex items-center justify-center gap-2 disabled:opacity-60",children:[m(Ut,{size:14}),wa===p?e==="bn"?"রিপোর্ট হচ্ছে…":"Reporting…":_.report]}),zd=(p)=>S("article",{className:"w-full text-left rounded-[22px] border-2 overflow-hidden animate-pop",style:{borderColor:"var(--pink)",background:"var(--surface)"},children:[S("button",{onClick:()=>c(p),className:"w-full text-left focus:outline-none",children:[S("div",{className:"h-[118px] relative overflow-hidden",style:{background:`linear-gradient(135deg, ${p.imgHue}55, #2a1748 60%, #120a26)`},children:[m("div",{className:"absolute inset-0 opacity-25",style:{backgroundImage:"radial-gradient(circle at 20% 20%, white 1px, transparent 1px)",backgroundSize:"18px 18px"}}),S("div",{className:"absolute left-3 top-3 flex flex-wrap gap-2",children:[m("span",{className:"text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/55 backdrop-blur",children:e==="bn"?p.cat:p.catEn}),S("span",{className:"text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-black flex items-center gap-1",children:[m(He,{size:12}),_.verified]})]}),m("div",{className:"absolute right-3 bottom-3 w-11 h-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-2xl",children:p.icon==="beach"?"\uD83C\uDFD6️":p.icon==="water"?"\uD83D\uDCA7":"\uD83D\uDEA6"}),S("div",{className:"absolute left-3 bottom-3 text-[11px] font-semibold bg-black/50 px-2 py-1 rounded-full flex items-center gap-1",children:[m(Tn,{size:12}),ua(p.published,e)]})]}),S("div",{className:"p-3.5",children:[m("h3",{className:"font-bold leading-snug text-[16px]",children:e==="bn"?p.titleBn:p.titleEn}),m("p",{className:"text-[13px] leading-relaxed mt-1.5 line-clamp-2",style:{color:"var(--muted)"},children:e==="bn"?p.bodyBn:p.bodyEn}),S("div",{className:"flex items-center justify-between mt-3 gap-2",children:[S("span",{className:"text-[12px] font-bold text-pink-300",children:[_.source,": ",p.source]}),S("span",{className:"text-[12px] font-semibold flex items-center gap-1 shrink-0",style:{color:"var(--muted-2)"},children:[m($t,{size:12}),e==="bn"?p.place:p.placeEn," ",m(It,{size:14})]})]})]})]}),S("div",{className:"px-3.5 pb-3.5",children:[m("a",{href:p.sourceUrl,target:"_blank",rel:"noopener",onClick:(L)=>L.stopPropagation(),className:"block text-center py-2.5 rounded-xl bg-white/10 text-[13px] font-bold",children:e==="bn"?"মূল সূত্র দেখুন ↗":"View original source ↗"}),Lu(p.id)]})]},p.id);return m("div",{"data-safe-area-inset-root":!0,style:{boxSizing:"border-box",paddingTop:"var(--safe-area-inset-top)",minHeight:"100vh",background:"var(--bg)"},className:"overflow-x-clip",children:S("div",{className:"max-w-[520px] mx-auto min-h-[100vh] relative pb-[92px]",style:{background:"var(--bg)"},children:[S("header",{"data-safe-area-sticky-top":!0,style:{top:"var(--safe-area-inset-top)"},className:"sticky z-30 backdrop-blur px-4 pt-3 pb-3 flex items-start justify-between gap-3",children:[S("div",{className:"min-w-0 flex-1",children:[S("div",{className:"font-en font-extrabold leading-none tracking-tight text-[clamp(24px,7vw,32px)]",style:{color:"#FFD700",textShadow:"0 0 14px rgba(255,215,0,.55), 0 2px 0 rgba(0,0,0,.35)",position:"relative",display:"inline-block",paddingRight:"14px"},"aria-label":"AYNA BOOK star",children:["AYNA BOOK",m("span",{"aria-hidden":"true",className:"logo-star",style:{position:"absolute",top:"-3px",right:"0px",width:"10px",height:"10px",fontSize:"10px",lineHeight:"10px",display:"inline-flex",alignItems:"center",justifyContent:"center",color:"#FFD700"},children:"★"})]}),m("p",{className:"text-[12px] leading-snug font-semibold mt-1.5",style:{color:"var(--muted)"},children:"মুহূর্তের খবর • লাইভ টিভি • লাইভ রেডিও • ভাইরাল খবর • কোনো মিথ্যা খবর নয়"})]}),S("div",{className:"flex gap-2",children:[S("button",{"aria-label":"Notifications",onClick:()=>Mn(e==="bn"?"নতুন খবর ৩টি আছে":"You have 3 new stories"),className:"w-9 h-9 rounded-full bg-white/10 flex items-center justify-center relative",children:[m(Wr,{size:18}),m("span",{className:"absolute top-2 right-2 w-2 h-2 rounded-full bg-pink-500"})]}),m("button",{"aria-label":"Profile",onClick:()=>{r("settings"),g("profile")},className:"w-9 h-9 rounded-full overflow-hidden flex items-center justify-center font-bold",style:{background:"#2a1748"},children:C.slice(0,1)})]})]}),S("nav",{"aria-label":"Top tabs",className:"px-4 mt-1",children:[m("div",{className:"flex gap-2 overflow-x-auto no-scrollbar pb-1",role:"tablist",children:Ea.map(([p,L,U])=>S("button",{role:"tab","aria-selected":t===p,onClick:()=>{if(r(p),c(null),p!=="settings")g(null)},className:`shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-[13px] font-bold border whitespace-nowrap ${t===p?"text-white border-transparent":"border-white/15 text-zinc-300"}`,style:t===p?{background:"var(--pink)"}:{background:"var(--surface)"},children:[m(U,{size:15}),L]},p))}),S("div",{className:"mt-2 rounded-2xl px-3.5 py-3 flex gap-2.5 items-start",style:{background:"#3b121f",border:"1px solid #ff2e7e66"},children:[m(At,{size:20,className:"text-pink-400 shrink-0 mt-0.5"}),m("p",{className:"text-[13px] font-bold leading-snug",children:_.rule})]}),rn.length>0&&S("p",{className:"mt-2 text-[12px] font-semibold text-amber-300 flex items-center gap-1.5",children:[m(Ut,{size:13}),e==="bn"?`${bn(String(rn.length))}টি খবর রিপোর্ট করা হয়েছে, যাচাই চলছে`:`${rn.length} reported — verification in progress`]})]}),t==="news"&&!a&&S("main",{className:"px-4",children:[S("div",{className:"mt-3",children:[m("h1",{className:"text-[clamp(24px,7vw,32px)] font-extrabold leading-[1.1]",children:e==="bn"?"আজকের তাজা খবর":"Fresh news, today"}),m("p",{className:"text-[13px] mt-1",style:{color:"var(--muted)"},children:e==="bn"?"শুধু আজকের, যাচাই করা খবর। পুরনো খবর আর দেখানো হয় না। প্রতিটা খবরে সোর্স ও সময় দেওয়া আছে।":"Only today’s verified stories. Old news is no longer shown. Every story shows source and time."})]}),S("div",{className:"mt-3 flex items-center gap-2 rounded-2xl px-3 py-2.5",style:{background:"var(--surface)"},children:[m(Gr,{size:18,className:"shrink-0 text-zinc-400"}),m("input",{value:o,onChange:(p)=>i(p.target.value),placeholder:_.searchPh,className:"bg-transparent outline-none w-full text-[14px] placeholder:text-zinc-500"})]}),m("div",{className:"mt-3 flex gap-2",children:[["today",_.today],["24h",_.last24],["all",_.all]].map(([p,L])=>m("button",{onClick:()=>u(p),className:`flex-1 py-2.5 rounded-full text-[13px] font-bold border transition ${l===p?"text-white border-transparent":"border-white/15 text-zinc-300"}`,style:l===p?{background:"var(--pink)"}:{background:"var(--surface)"},children:L},p))}),S("div",{className:"flex items-center gap-2 mt-4 mb-3 text-[12px] font-semibold",style:{color:"var(--muted)"},children:[m(Qr,{size:14}),Fu.length," ",_.newsCount," • ",l==="today"?_.today:l==="24h"?_.last24:_.all," ",S("span",{className:"ml-auto flex items-center gap-1",children:[m("span",{className:"w-2 h-2 rounded-full bg-emerald-400"})," ",_.fresh]})]}),S("div",{className:"flex flex-col gap-4",children:[Fu.map(zd),Fu.length===0&&S("div",{className:"rounded-2xl p-8 text-center border border-dashed border-white/20",children:[m(Ht,{className:"mx-auto mb-2 text-zinc-500"}),m("p",{className:"font-bold",children:_.noNews}),m("button",{onClick:()=>u("all"),className:"mt-3 px-4 py-2 rounded-full bg-white/10 text-[13px] font-bold",children:_.all})]})]}),m("p",{className:"text-center text-[11px] mt-6",style:{color:"var(--muted-2)"},children:e==="bn"?"সূত্র: Prothom Alo • BSS • Daily Star":"Sources: Prothom Alo • BSS • Daily Star"})]}),t==="news"&&a&&S("main",{className:"px-4 animate-pop",children:[S("button",{onClick:()=>c(null),className:"flex items-center gap-1.5 text-[13px] font-bold py-2",children:[m(Lt,{size:16})," ",_.back]}),S("article",{className:"rounded-[24px] overflow-hidden border-2",style:{borderColor:"var(--pink)",background:"var(--surface)"},children:[S("div",{className:"h-[180px] relative",style:{background:`linear-gradient(135deg, ${a.imgHue}66, #2a1748)`},children:[S("div",{className:"absolute left-3 top-3 flex flex-wrap gap-2",children:[m("span",{className:"text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/55",children:e==="bn"?a.cat:a.catEn}),S("span",{className:"text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-black flex items-center gap-1",children:[m(He,{size:12}),_.verified]})]}),S("div",{className:"absolute left-4 bottom-4 right-4",children:[S("div",{className:"flex items-center gap-1.5 text-[12px] font-semibold",children:[m(Tn,{size:13}),ua(a.published,e)]}),m("h2",{className:"text-[22px] font-extrabold leading-tight mt-1",children:e==="bn"?a.titleBn:a.titleEn})]})]}),S("div",{className:"p-4",children:[S("div",{className:"flex flex-wrap gap-2 text-[12px]",children:[S("span",{className:"px-2.5 py-1 rounded-full bg-white/10 font-bold",children:[_.source,": ",a.source]}),S("span",{className:"px-2.5 py-1 rounded-full bg-white/10 flex items-center gap-1",children:[m($t,{size:12}),e==="bn"?a.place:a.placeEn]})]}),m("p",{className:"leading-[1.85] text-[15px] mt-4",style:{color:"#e9dff5"},children:e==="bn"?a.bodyBn:a.bodyEn}),m("p",{className:"leading-[1.8] text-[14px] mt-3",style:{color:"var(--muted)"},children:e==="bn"?"এই খবরটি সংশ্লিষ্ট সূত্র থেকে সংগ্রহ করা হয়েছে। নতুন তথ্য পেলে আপডেট দেওয়া হবে।":"This story was gathered from the listed source. It will be updated if new information arrives."}),m("a",{href:a.sourceUrl,target:"_blank",rel:"noopener",className:"block text-center mt-4 py-3 rounded-2xl bg-white/10 font-bold text-[14px]",children:e==="bn"?"মূল সূত্র দেখুন ↗":"View original source ↗"}),S("div",{className:"flex gap-2 mt-3",children:[S("button",{onClick:()=>Mn(_.saved),className:"flex-1 py-3 rounded-2xl bg-white/10 font-bold flex items-center justify-center gap-2 text-[14px]",children:[m(Vr,{size:16}),e==="bn"?"পরে পড়ুন":"Save for later"]}),m("button",{onClick:()=>c(null),className:"flex-1 py-3 rounded-2xl font-bold text-[14px]",style:{background:"var(--pink)"},children:_.back})]}),Lu(a.id)]})]})]}),t==="live"&&S("main",{className:"px-4",children:[S("div",{className:"rounded-[24px] p-4 mt-3",style:{background:"linear-gradient(135deg,#3b0f1e,#151033)",border:"1px solid #ff2e7e55"},children:[S("div",{className:"flex items-center gap-2",children:[S("span",{className:"relative flex h-3 w-3",children:[m("span",{className:"animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"}),m("span",{className:"relative inline-flex rounded-full h-3 w-3 bg-red-500"})]}),m("h1",{className:"text-[22px] font-extrabold",children:e==="bn"?"লাইভ টিভি ও রেডিও":"LIVE TV & Radio"})]}),m("p",{className:"text-[13px] mt-1",style:{color:"var(--muted)"},children:e==="bn"?"সরাসরি সম্প্রচার — চ্যানেলের অফিসিয়াল সাইটে দেখুন / শুনুন।":"Live broadcasts — watch / listen on the channel’s official site."}),S("p",{className:"text-[13px] font-bold mt-2 text-red-200 flex items-center gap-1.5",children:[m(Tn,{size:14}),Sd]}),m("p",{className:"text-[11px] mt-1",style:{color:"var(--muted)"},children:e==="bn"?"সময় প্রতি মিনিটে আপডেট হয়।":"Time updates every minute."})]}),m("div",{className:"mt-3 flex gap-2",children:[["all",e==="bn"?"সব":"All"],["TV",e==="bn"?"টিভি":"TV"],["Radio",e==="bn"?"রেডিও":"Radio"]].map(([p,L])=>m("button",{onClick:()=>wd(p),className:`flex-1 py-2.5 rounded-full text-[13px] font-bold border ${Vt===p?"text-white border-transparent":"border-white/15 text-zinc-300"}`,style:Vt===p?{background:"var(--pink)"}:{background:"var(--surface)"},children:L},p))}),m("div",{className:"mt-4 flex flex-col gap-3",children:Cd.map((p)=>S("article",{className:"rounded-[20px] p-4 flex gap-3 items-center",style:{background:"var(--surface)",border:"1px solid var(--line)"},children:[m("span",{className:"w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0",style:{background:`${p.color}22`},children:p.emoji}),S("div",{className:"flex-1 min-w-0",children:[S("div",{className:"flex items-center gap-2 flex-wrap",children:[m("h3",{className:"font-extrabold text-[16px]",children:e==="bn"?p.nameBn:p.nameEn}),S("span",{className:"text-[10px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white flex items-center gap-1",children:[m("span",{className:"w-1.5 h-1.5 rounded-full bg-white animate-pulse"}),"LIVE"]})]}),S("p",{className:"text-[12px] mt-0.5",style:{color:"var(--muted)"},children:[p.descBn," • ",_.liveNow]}),m("p",{className:"text-[11px] font-semibold text-zinc-400",children:p.kind==="TV"?e==="bn"?"টিভি • অফিসিয়াল সাইট":"TV • Official site":e==="bn"?"রেডিও • অফিসিয়াল সাইট":"Radio • Official site"})]}),m("a",{href:p.url,target:"_blank",rel:"noopener",className:"shrink-0 px-4 py-2.5 rounded-full font-extrabold text-[13px] text-white text-center",style:{background:"var(--pink)"},children:p.kind==="TV"?_.watch:_.listen})]},p.id))}),m("p",{className:"text-[12px] mt-4 leading-relaxed",style:{color:"var(--muted)"},children:e==="bn"?"লাইভ দেখতে / শুনতে বাটনে চাপ দিলে চ্যানেলের অফিসিয়াল সাইট নতুন ট্যাবে খুলবে।":"Pressing Watch / Listen opens the channel’s official site in a new tab."})]}),t==="viral"&&S("main",{className:"px-4",children:[S("div",{className:"mt-3",children:[m("h1",{className:"text-[clamp(24px,7vw,32px)] font-extrabold leading-[1.1]",children:e==="bn"?"মুহূর্তের খবর / ভাইরাল":"Muhurter Khobor / Viral"}),m("p",{className:"text-[13px] mt-1",style:{color:"var(--muted)"},children:e==="bn"?"শুধু আজকের, যাচাই করা ভাইরাল খবর। যাচাই হয়নি এমন খবর দেখানো হয় না।":"Only today’s verified viral news. Unverified stories are not shown."})]}),S("div",{className:"mt-3 rounded-2xl p-4 flex items-center justify-between gap-3",style:{background:"var(--surface)",border:"1px solid var(--line)"},children:[S("span",{className:"font-bold text-[14px] flex items-center gap-2",children:[m(He,{size:18,className:"text-emerald-400 shrink-0"}),_.verifiedOnly]}),m("button",{role:"switch","aria-checked":tt,onClick:()=>gd((p)=>!p),className:"w-12 h-7 rounded-full relative shrink-0 transition",style:{background:tt?"var(--pink)":"#475569"},children:m("span",{className:"absolute top-1 w-5 h-5 rounded-full bg-white transition-all",style:{left:tt?"24px":"4px"}})})]}),m("p",{className:"text-[12px] mt-2 font-semibold",style:{color:"var(--muted)"},children:tt?e==="bn"?`দেখানো হচ্ছে: ${bn(String(nl.length))}টি যাচাই করা খবর`:`Showing: ${nl.length} verified stories`:e==="bn"?"ফিল্টার বন্ধ — নিচে যাচাই হয়নি এমন খবর সতর্কতাসহ দেখানো হচ্ছে":"Filter off — unverified story shown below with a warning"}),S("div",{className:"mt-3 flex flex-col gap-4",children:[nl.map((p)=>S("article",{className:"rounded-[22px] border-2 overflow-hidden p-4",style:{borderColor:p.verified?"var(--pink)":"#f59e0b",background:"var(--surface)"},children:[S("div",{className:"flex flex-wrap gap-2",children:[p.verified?S("span",{className:"text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-black flex items-center gap-1",children:[m(He,{size:12}),_.verified]}):S("span",{className:"text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500 text-black flex items-center gap-1",children:[m(zn,{size:12}),_.unverified]}),S("span",{className:"text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/40 flex items-center gap-1",children:[m(Tn,{size:12}),ua(p.published,e)]}),S("span",{className:"text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/10",children:[_.source,": ",p.source]})]}),m("h3",{className:"font-bold text-[16px] leading-snug mt-3",children:e==="bn"?p.titleBn:p.titleEn}),m("p",{className:"text-[13px] leading-relaxed mt-1.5",style:{color:"var(--muted)"},children:e==="bn"?p.bodyBn:p.bodyEn}),p.verified&&m("p",{className:"text-[12px] mt-2 text-emerald-300 font-semibold",children:e==="bn"?`কেন যাচাই করা: ${p.whyBn}`:`Why verified: ${p.whyBn}`}),!p.verified&&m("p",{className:"text-[12px] mt-2 text-amber-300 font-semibold",children:e==="bn"?"এই খবরটি ফিডে দেখাবেন না — মূল সূত্র নেই।":"Do not show this in the feed — no original source."}),p.verified&&m("a",{href:p.sourceUrl,target:"_blank",rel:"noopener",className:"block text-center mt-3 py-2.5 rounded-xl bg-white/10 text-[13px] font-bold",children:e==="bn"?"মূল সূত্র দেখুন ↗":"View original source ↗"}),Lu(p.id)]},p.id)),nl.length===0&&m("div",{className:"rounded-2xl p-8 text-center border border-dashed border-white/20",children:m("p",{className:"font-bold",children:_.noNews})})]})]}),t==="qr"&&S("main",{className:"px-4",children:[S("div",{className:"rounded-[24px] p-4 mt-3",style:{background:"linear-gradient(135deg,#2a1748,#151033)",border:"1px solid var(--line)"},children:[S("div",{className:"flex items-center gap-2",children:[m(qn,{className:"text-pink-400"}),m("h1",{className:"text-[22px] font-extrabold",children:_.qrTitle})]}),m("p",{className:"text-[13px] mt-1",style:{color:"var(--muted)"},children:_.qrHint})]}),m("label",{className:"block text-[13px] font-bold mt-4 mb-2",children:e==="bn"?"লেখা / লিংক":"Text / Link"}),m("textarea",{value:N,onChange:(p)=>h(p.target.value),rows:3,placeholder:"https://…",className:"w-full rounded-2xl p-3.5 text-[14px] outline-none resize-none",style:{background:"var(--surface)",border:"1px solid var(--line)"}}),S("div",{className:"flex gap-2 mt-3",children:[m("button",{onClick:Nd,className:"flex-1 py-3.5 rounded-2xl font-extrabold text-[15px]",style:{background:"var(--pink)"},children:_.generate}),m("button",{onClick:Pd,className:"flex-1 py-3.5 rounded-2xl font-bold text-[14px] bg-white/10 border border-white/15",children:_.myQR})]}),f&&m("p",{className:"mt-3 text-[13px] font-semibold text-amber-300",children:f}),T&&!f&&S("div",{className:"mt-4 rounded-[24px] p-5 text-center animate-pop",style:{background:"#fff",color:"#111"},children:[m("canvas",{ref:w,className:"mx-auto w-[220px] h-[220px] max-w-full"}),m("p",{className:"text-[13px] font-bold mt-3 break-all",children:T}),m("p",{className:"text-[12px] text-zinc-500 mt-1",children:_.scanHint}),S("button",{onClick:Td,className:"mt-4 w-full py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2",style:{background:"var(--pink)"},children:[m(xr,{size:17}),_.download]})]}),!T&&S("div",{className:"mt-4 rounded-[24px] border-2 border-dashed border-white/20 p-6 text-center",children:[m(qn,{size:44,className:"mx-auto text-zinc-600"}),m("p",{className:"font-bold mt-2",children:_.qrReady}),m("p",{className:"text-[13px] mt-1",style:{color:"var(--muted)"},children:la})]})]}),t==="settings"&&!v&&S("main",{className:"px-4",children:[S("div",{className:"rounded-[26px] p-4 mt-3",style:{background:"linear-gradient(160deg,#1a2f6b,#0f1b3d 65%)",border:"1px solid #2b4a9a"},children:[m("p",{className:"text-[12px] font-bold tracking-widest text-blue-200",children:_.dashboard}),S("div",{className:"flex items-center gap-3 mt-3",children:[m("div",{className:"w-14 h-14 rounded-full bg-white/15 flex items-center justify-center text-2xl font-extrabold",children:C.slice(0,1)}),S("div",{children:[m("h1",{className:"text-[20px] font-extrabold leading-tight",children:C}),S("p",{className:"text-[13px] text-blue-200",children:[D," • ",e==="bn"?"বাংলা":"English"]})]})]}),m("p",{className:"text-[12px] mt-3 text-blue-100/80",children:_.settingsDesc})]}),m("div",{className:"mt-4 flex flex-col gap-3",children:[["profile",_.profile,e==="bn"?"নাম, ছবি ও ফোন":"Name, photo & phone",Dn,"#ff2e7e"],["account",_.account,e==="bn"?"পাসওয়ার্ড বদলান":"Change password",Kr,"#ffbe3c"],["privacy",_.privacy,e==="bn"?"কে কী দেখবে":"Who can see what",At,"#2ee6a8"],["sound",_.sound,e==="bn"?"সাউন্ড ও ভলিউম":"Sound & volume",Wt,"#38bdf8"],["language",_.language,e==="bn"?"English / বাংলা":"English / বাংলা",Yr,"#a78bfa"]].map(([p,L,U,ge,Fn])=>S("button",{onClick:()=>g(p),className:"flex items-center gap-3 p-4 rounded-[20px] text-left",style:{background:"var(--blue)",border:"1px solid #263f7d"},children:[m("span",{className:"w-11 h-11 rounded-2xl flex items-center justify-center shrink-0",style:{background:`${Fn}22`,color:Fn},children:m(ge,{size:20})}),S("span",{className:"flex-1 min-w-0",children:[m("span",{className:"block font-bold text-[15px]",children:L}),m("span",{className:"block text-[12px] text-blue-200/80 truncate",children:U})]}),m(It,{size:18,className:"text-blue-200"})]},p))}),S("div",{className:"mt-4 rounded-2xl p-3.5 flex items-center gap-2 text-[12px]",style:{background:"var(--surface)",color:"var(--muted)"},children:[m(tn,{size:15,className:"text-pink-400 shrink-0"}),_.version]})]}),t==="settings"&&v&&S("main",{className:"px-4 animate-pop",children:[S("button",{onClick:()=>g(null),className:"flex items-center gap-1.5 text-[13px] font-bold py-2",children:[m(Lt,{size:16})," ",_.back]}),S("div",{className:"rounded-[24px] p-4",style:{background:"var(--blue)",border:"1px solid #263f7d"},children:[v==="profile"&&S(jn,{children:[m("h2",{className:"text-[20px] font-extrabold",children:_.profile}),S("div",{className:"flex items-center gap-3 mt-4",children:[m("div",{className:"w-16 h-16 rounded-full flex items-center justify-center text-2xl font-extrabold",style:{background:"var(--pink)"},children:C.slice(0,1)||"আ"}),S("div",{children:[m("p",{className:"font-bold",children:C}),m("p",{className:"text-[12px] text-blue-200",children:e==="bn"?"প্রোফাইল ছবি":"Profile photo"})]})]}),m("label",{className:"block text-[13px] font-bold mt-4 mb-1.5",children:_.name}),m("input",{value:C,onChange:(p)=>R(p.target.value),className:"w-full rounded-xl px-3.5 py-3 bg-white/10 outline-none border border-white/10"}),m("label",{className:"block text-[13px] font-bold mt-3 mb-1.5",children:_.phone}),m("input",{value:D,onChange:(p)=>M(p.target.value),inputMode:"tel",className:"w-full rounded-xl px-3.5 py-3 bg-white/10 outline-none border border-white/10"}),m("label",{className:"block text-[13px] font-bold mt-3 mb-1.5",children:_.photo}),m("input",{value:z,onChange:(p)=>O(p.target.value),placeholder:"https://…",className:"w-full rounded-xl px-3.5 py-3 bg-white/10 outline-none border border-white/10 placeholder:text-blue-200/50"}),m("button",{disabled:ya,onClick:()=>ln({name:C,phone:D,photo:z}),className:"w-full mt-5 py-3.5 rounded-2xl font-extrabold disabled:opacity-60",style:{background:"var(--pink)"},children:ya?"…":_.save})]}),v==="account"&&S(jn,{children:[m("h2",{className:"text-[20px] font-extrabold",children:_.account}),m("label",{className:"block text-[13px] font-bold mt-4 mb-1.5",children:_.currentPass}),m("input",{type:"password",value:yd,onChange:(p)=>fa(p.target.value),className:"w-full rounded-xl px-3.5 py-3 bg-white/10 outline-none border border-white/10"}),m("label",{className:"block text-[13px] font-bold mt-3 mb-1.5",children:_.newPass}),m("input",{type:"password",value:Ou,onChange:(p)=>sa(p.target.value),className:"w-full rounded-xl px-3.5 py-3 bg-white/10 outline-none border border-white/10"}),m("label",{className:"block text-[13px] font-bold mt-3 mb-1.5",children:_.confirmPass}),m("input",{type:"password",value:ca,onChange:(p)=>da(p.target.value),className:"w-full rounded-xl px-3.5 py-3 bg-white/10 outline-none border border-white/10"}),pa&&m("p",{className:"mt-3 text-[13px] font-bold text-emerald-300",children:pa}),S("button",{onClick:kd,className:"w-full mt-5 py-3.5 rounded-2xl font-extrabold flex items-center justify-center gap-2",style:{background:"var(--pink)"},children:[m(Xr,{size:16}),_.updatePass]})]}),v==="privacy"&&S(jn,{children:[m("h2",{className:"text-[20px] font-extrabold",children:_.privacy}),[[W,et,_.visible],[el,Du,_.showPhone]].map(([p,L,U],ge)=>S("div",{className:"flex items-center justify-between gap-3 mt-4 bg-white/5 rounded-2xl p-4",children:[m("span",{className:"font-bold text-[14px] flex-1",children:U}),m("button",{role:"switch","aria-checked":p,onClick:()=>{let Fn=!p;L(Fn),ln(ge===0?{profileVisible:Fn}:{showPhone:Fn})},className:"w-12 h-7 rounded-full relative shrink-0 transition",style:{background:p?"var(--pink)":"#475569"},children:m("span",{className:"absolute top-1 w-5 h-5 rounded-full bg-white transition-all",style:{left:p?"24px":"4px"}})})]},ge)),S("p",{className:"text-[12px] mt-3 text-blue-200",children:[W?_.toggleOn:_.toggleOff," • ",el?_.toggleOn:_.toggleOff]}),m("button",{onClick:()=>ln({}),className:"w-full mt-4 py-3 rounded-2xl bg-white/10 font-bold",children:_.save})]}),v==="sound"&&S(jn,{children:[m("h2",{className:"text-[20px] font-extrabold",children:_.sound}),S("div",{className:"flex items-center justify-between mt-4 bg-white/5 rounded-2xl p-4",children:[S("span",{className:"font-bold flex items-center gap-2",children:[Rn?m(Wt,{size:18}):m(qr,{size:18}),_.soundOn]}),m("button",{role:"switch","aria-checked":Rn,onClick:()=>{let p=!Rn;ia(p),ln({soundOn:p})},className:"w-12 h-7 rounded-full relative",style:{background:Rn?"var(--pink)":"#475569"},children:m("span",{className:"absolute top-1 w-5 h-5 rounded-full bg-white",style:{left:Rn?"24px":"4px"}})})]}),S("label",{className:"block text-[13px] font-bold mt-5",children:[_.volume,": ",nt,"%"]}),m("input",{type:"range",min:0,max:100,value:nt,onChange:(p)=>aa(Number(p.target.value)),onMouseUp:()=>ln({volume:nt}),onTouchEnd:()=>ln({volume:nt}),className:"w-full mt-2"}),S("div",{className:"flex justify-between text-[11px] text-blue-200",children:[m("span",{children:"0"}),m("span",{children:"50"}),m("span",{children:"100"})]}),m("button",{onClick:()=>ln({soundOn:Rn,volume:nt}),className:"w-full mt-4 py-3 rounded-2xl font-bold",style:{background:"var(--pink)"},children:_.save})]}),v==="language"&&S(jn,{children:[m("h2",{className:"text-[20px] font-extrabold",children:_.language}),m("p",{className:"text-[13px] mt-1 text-blue-200",children:_.chooseLang}),[["bn","বাংলা — বাংলা"],["en","English — English"]].map(([p,L])=>S("label",{className:"flex items-center gap-3 mt-3 bg-white/5 rounded-2xl p-4 cursor-pointer",children:[m("input",{type:"radio",name:"lang",checked:e===p,onChange:()=>Ed(p),className:"w-5 h-5 accent-pink-500"}),m("span",{className:"font-bold",children:L}),e===p&&m(Br,{className:"ml-auto text-emerald-400"})]},p)),m("p",{className:"text-[12px] mt-4 text-blue-200",children:e==="bn"?"ভাষা বদলালে পুরো অ্যাপের লেখা বদলে যাবে।":"Changing language updates all labels in the app."})]})]})]}),m("nav",{className:"fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[520px] z-40 px-4 pb-3 pt-2",style:{background:"linear-gradient(transparent, rgba(5,2,12,.92) 30%)"},children:m("div",{className:"rounded-[26px] px-1 py-2 flex",style:{background:"#1a1230",border:"1px solid var(--line)",boxShadow:"0 12px 30px rgba(0,0,0,.45)"},children:Ea.map(([p,L,U])=>S("button",{onClick:()=>{if(r(p),c(null),p!=="settings")g(null)},className:`flex-1 py-2 rounded-[20px] flex flex-col items-center gap-0.5 text-[11px] font-bold ${t===p?"text-white":"text-zinc-400"}`,style:t===p?{background:"var(--pink)"}:{},children:[m(U,{size:19}),L]},p))})}),y&&m("div",{className:"toast-in fixed left-1/2 -translate-x-1/2 bottom-[96px] z-50 px-4 py-2.5 rounded-full text-[13px] font-bold shadow-xl whitespace-nowrap max-w-[92vw] overflow-hidden text-ellipsis",style:{background:"#fff",color:"#111"},children:y})]})})}md.createRoot(document.getElementById("root")).render(m(hd.default.StrictMode,{children:m(oa,{})}));
</script>
  <script>(function(){function m(a){var h=a.getAttribute("href");if(!h)return;try{var u=new URL(h,document.baseURI);if(((u.protocol==="http:"||u.protocol==="https:")&&u.host!==location.host)||u.protocol==="mailto:"||u.protocol==="tel:"||u.protocol==="sms:"){a.target="_blank";a.rel="noopener noreferrer";}}catch(e){}}function s(){document.querySelectorAll("a[href]").forEach(m);}if(document.readyState!=="loading"){s();}else{document.addEventListener("DOMContentLoaded",s);}document.addEventListener("click",function(e){var a=e.target&&e.target.closest&&e.target.closest("a[href]");if(a){m(a);}},true);})();</script>
  <script type="application/json" data-clippy-inline-media-manifest="1">{"version":1,"slots":[]}</script>
</body>
</html>