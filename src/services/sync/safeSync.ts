/**
 * Fire-and-forget a remote write without ever blocking the UI on it — local
 * store state is already correct by the time this runs. One retry after a
 * short delay absorbs a brief network blip; anything longer is logged and
 * dropped rather than queued, which keeps the sync layer simple.
 */
export function safeSync(run: () => Promise<unknown>): void {
  run().catch(() => {
    setTimeout(() => {
      run().catch((err) => {
        console.warn('[sync] write failed, will reconcile on next pull:', err);
      });
    }, 1500);
  });
}
