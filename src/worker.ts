// Worker entry: Astro's handler plus EmDash's cron handler, which runs
// scheduled publishing and maintenance.
import handler, {
  createScheduledHandler,
  PluginBridge,
} from '@emdash-cms/cloudflare/worker';

export { PluginBridge };

export default {
  ...handler,
  scheduled: createScheduledHandler(),
} satisfies ExportedHandler;
