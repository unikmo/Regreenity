export type QueuedAction = {
  id: string
  type: string
  payload: Record<string, unknown>
  createdAt: string
  sailingId?: string
}

const QUEUE_KEY = 'regreenity:offline-queue:v1'

export function readOfflineQueue(): QueuedAction[] {
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY)
    return raw ? JSON.parse(raw) as QueuedAction[] : []
  } catch {
    return []
  }
}

export function queueOfflineAction(type: string, payload: Record<string, unknown>, sailingId?: string) {
  const action: QueuedAction = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    payload,
    createdAt: new Date().toISOString(),
    sailingId,
  }
  const next = [...readOfflineQueue(), action]
  try { window.localStorage.setItem(QUEUE_KEY, JSON.stringify(next)) } catch { /* storage unavailable */ }
  window.dispatchEvent(new CustomEvent('regreenity-queue-change', { detail: next.length }))
  return action
}

export function clearOfflineQueue() {
  try { window.localStorage.removeItem(QUEUE_KEY) } catch { /* storage unavailable */ }
  window.dispatchEvent(new CustomEvent('regreenity-queue-change', { detail: 0 }))
}

export function getQueuedActionCount() {
  return readOfflineQueue().length
}

export async function registerOfflineShell() {
  if (!('serviceWorker' in navigator)) return false

  // Never let an old offline shell hide fresh UI changes during local development.
  // Production/offboard preview environments still register the offline-first shell normally.
  const host = window.location.hostname
  if (host === 'localhost' || host === '127.0.0.1') {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map(registration => registration.unregister()))
      if ('caches' in window) {
        const keys = await caches.keys()
        await Promise.all(keys.filter(key => key.startsWith('regreenity-shell-') || key.startsWith('cruise-connection-shell-')).map(key => caches.delete(key)))
      }
    } catch { /* local cleanup is best-effort */ }
    return false
  }

  try {
    await navigator.serviceWorker.register('/sw.js', { scope: '/' })
    return true
  } catch {
    return false
  }
}
