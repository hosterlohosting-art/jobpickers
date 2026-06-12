import { prisma } from './prisma';
import { handleImport } from './sync-engine';

const globalForScheduler = globalThis as any;

export function startSyncScheduler() {
  if (globalForScheduler.syncSchedulerStarted) {
    return;
  }

  globalForScheduler.syncSchedulerStarted = true;
  console.log('[Sync Scheduler] Background sync daemon initialized.');

  // Run initial check after 15 seconds to not block startup
  setTimeout(runScheduledSyncCheck, 15 * 1000);

  // Repeat checks every 1 hour (3600000 ms)
  setInterval(runScheduledSyncCheck, 60 * 60 * 1000);
}

async function runScheduledSyncCheck() {
  console.log('[Sync Scheduler] Checking database sync status...');
  try {
    const activeSources = await prisma.jobSource.findMany({
      where: { isActive: true }
    });

    const now = new Date();
    
    for (const source of activeSources) {
      // Sync frequency check: e.g. "daily" -> 20 hours, others -> 12 hours
      const syncIntervalHours = source.syncFrequency === 'hourly' ? 1 : 12;
      const syncIntervalMs = syncIntervalHours * 60 * 60 * 1000;
      
      const lastSynced = source.lastSyncedAt ? new Date(source.lastSyncedAt) : null;
      const needsSync = !lastSynced || (now.getTime() - lastSynced.getTime() >= syncIntervalMs);

      if (needsSync) {
        console.log(`[Sync Scheduler] Auto-triggering background sync for: ${source.name}`);
        // Run asynchronously, do not await, so we do not block checks for other sources
        handleImport(source.id)
          .then(res => {
            console.log(`[Sync Scheduler] Auto-sync success for ${source.name}:`, JSON.stringify(res));
          })
          .catch(err => {
            console.error(`[Sync Scheduler] Auto-sync failed for ${source.name}:`, err);
          });
      } else {
        const hoursLeft = ((syncIntervalMs - (now.getTime() - lastSynced.getTime())) / (1000 * 60 * 60)).toFixed(1);
        console.log(`[Sync Scheduler] Source ${source.name} is up-to-date. Next sync in ${hoursLeft} hours.`);
      }
    }
  } catch (error) {
    console.error('[Sync Scheduler] Background check loop error:', error);
  }
}
