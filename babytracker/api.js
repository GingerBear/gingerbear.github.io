/**
 * pwa/api.js
 * 
 * Secure REST client & Offline Outbox Sync for BabyTracker PWA.
 * Connects directly to Google Apps Script Web App JSON backend.
 */

const BabyTrackerAPI = (function () {
  const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbyP4m_Hgk60oP0F8xpqwSjp3qHyE6wKKJLYcSLKuEhXZ3BVFA3VyYtG_hpq61rgpeLv/exec';
  const DEFAULT_API_KEY = 'gingerbear-baby-2026';
  const STORAGE_KEY_URL = 'babytracker_api_url';
  const STORAGE_KEY_KEY = 'babytracker_api_key';
  const STORAGE_KEY_OUTBOX = 'babytracker_outbox_queue';
  const STORAGE_KEY_CACHE = 'babytracker_initial_cache';

  function getUrl() {
    return localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_API_URL;
  }

  function setUrl(url) {
    if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
  }

  function getKey() {
    return localStorage.getItem(STORAGE_KEY_KEY) || DEFAULT_API_KEY;
  }

  function setKey(key) {
    if (key) {
      localStorage.setItem(STORAGE_KEY_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_KEY);
    }
  }

  function hasConfiguredKey() {
    return !!localStorage.getItem(STORAGE_KEY_KEY);
  }

  function getDefaultKey() {
    return DEFAULT_API_KEY;
  }

  function getDefaultUrl() {
    return DEFAULT_API_URL;
  }

  // --- OUTBOX QUEUE MANAGEMENT (OFFLINE SYNC) ---
  function getOutbox() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_OUTBOX) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveOutbox(queue) {
    localStorage.setItem(STORAGE_KEY_OUTBOX, JSON.stringify(queue));
    updateSyncBadge();
  }

  function queueMutation(action, payload) {
    const queue = getOutbox();
    queue.push({
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      action,
      payload,
      createdAt: Date.now()
    });
    saveOutbox(queue);
    console.log(`[API Outbox] Queued offline action: ${action} (${queue.length} pending)`);
  }

  function updateSyncBadge() {
    const count = getOutbox().length;
    const banner = document.getElementById('pendingSyncBanner');
    const countText = document.getElementById('pendingSyncCountText');
    const badge = document.getElementById('syncBadge');
    
    if (banner) {
      if (count > 0) {
        if (countText) countText.textContent = `${count} Pending Sync`;
        banner.classList.remove('hidden');
      } else {
        banner.classList.add('hidden');
      }
    }

    if (badge) {
      if (count > 0) {
        badge.textContent = `${count} Pending`;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  }

  let isFlushing = false;

  async function flushOutbox() {
    if (isFlushing) return;
    const queue = getOutbox();
    if (queue.length === 0 || !navigator.onLine) return;

    isFlushing = true;
    console.log(`[API Outbox] Background syncing ${queue.length} pending mutation(s)...`);
    const remaining = [];
    let anySuccess = false;

    for (const item of queue) {
      try {
        await executePost(item.action, item.payload);
        console.log(`[API Outbox] ✓ Successfully synced: ${item.action}`);
        anySuccess = true;
      } catch (err) {
        console.warn(`[API Outbox] Failed to sync ${item.action}, will retry:`, err.message);
        remaining.push(item);
      }
    }

    saveOutbox(remaining);
    isFlushing = false;

    if (anySuccess && remaining.length === 0) {
      console.log('[API Outbox] All pending actions successfully synced to Google Sheets! Auto-refreshing app data...');
      if (typeof window.checkGlobalAppStatus === 'function') {
        window.checkGlobalAppStatus();
      }
    }
  }

  // Auto-flush when device comes back online
  window.addEventListener('online', () => {
    console.log('[API] Device online. Triggering outbox flush...');
    flushOutbox();
  });

  // --- CORE HTTP POST DISPATCHER ---
  async function executePost(action, payload = {}) {
    const url = getUrl();
    const apiKey = getKey();

    if (!url) {
      throw new Error('Missing Google Apps Script Web App URL');
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        action,
        apiKey,
        ...payload
      })
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('401 Unauthorized: Invalid API Key');
      }
      throw new Error(`HTTP Error ${res.status}`);
    }

    const data = await res.json();
    if (data.success === false) {
      throw new Error(data.error || 'Server error');
    }

    return data;
  }

  // --- PUBLIC API METHODS ---
  async function call(action, payload = {}) {
    // 1. If fetching initial app data (read-only query)
    if (action === 'getInitialData' || action === 'getInitialAppInitializationData') {
      try {
        const data = await executePost('getInitialData', payload);
        localStorage.setItem(STORAGE_KEY_CACHE, JSON.stringify(data));
        return data;
      } catch (err) {
        // If offline / network error, return cached data if available
        const cached = localStorage.getItem(STORAGE_KEY_CACHE);
        if (cached) {
          console.warn('[API] Using cached offline data due to fetch failure:', err);
          return JSON.parse(cached);
        }
        throw err;
      }
    }

    // 2. Optimistic Mutations (addLogEntry, closeSession, etc.)
    // Queue immediately for 0ms instant UI response
    console.log(`[API Optimistic] Fast-submitting mutation: ${action}`, payload);
    queueMutation(action, payload);

    // Trigger background sync immediately without blocking UI
    setTimeout(() => {
      flushOutbox();
    }, 50);

    return { success: true, optimistic: true };
  }

  function getCachedInitialData() {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_CACHE);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  }

  return {
    call,
    getUrl,
    setUrl,
    getKey,
    setKey,
    hasConfiguredKey,
    getDefaultKey,
    getDefaultUrl,
    flushOutbox,
    updateSyncBadge,
    getCachedInitialData
  };
})();

// --- DROP-IN GOOGLE APPS SCRIPT ADAPTER ---
// Enables Index.html to run 100% untouched without modifying its source code
if (typeof google === 'undefined' || !google.script) {
  window.google = window.google || {};
  window.google.script = {
    run: {
      withSuccessHandler(successCb) {
        const runner = Object.create(this);
        runner._success = successCb;
        return runner;
      },
      withFailureHandler(failureCb) {
        const runner = Object.create(this);
        runner._failure = failureCb;
        return runner;
      },
      getInitialAppInitializationData() {
        BabyTrackerAPI.call('getInitialData')
          .then(res => this._success && this._success(res))
          .catch(err => {
            if (err.message && (err.message.includes('401') || err.message.includes('Unauthorized'))) {
              if (typeof openPwaSettingsModal === 'function') openPwaSettingsModal(true);
            }
            if (this._failure) this._failure(err);
          });
      },
      closeActiveRowSession(rowNum, targetTimestamp, isMinutesUnit, note) {
        BabyTrackerAPI.call('closeSession', { rowNum, endTimestamp: targetTimestamp, isMinutesUnit, note })
          .then(res => this._success && this._success(res))
          .catch(err => this._failure && this._failure(err));
      },
      addLogEntry(event, value, note, targetTimestamp) {
        BabyTrackerAPI.call('addLogEntry', { event, value, note, passedTimestamp: targetTimestamp })
          .then(res => this._success && this._success(res))
          .catch(err => this._failure && this._failure(err));
      }
    }
  };
}

