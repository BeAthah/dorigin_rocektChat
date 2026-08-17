import attentionDrawing from '../notifications/attentionDrawing';
import { setupNotifications } from '../notifications/main';

/**
 * Global notifications pipeline — OS notifications + attention drawing
 * (flash frame / bounce).
 */
export const NotificationsPipeline = {
  setup(): void {
    setupNotifications();
    attentionDrawing.setUp();
  },

  tearDown(): void {
    attentionDrawing.tearDown();
  },
};
