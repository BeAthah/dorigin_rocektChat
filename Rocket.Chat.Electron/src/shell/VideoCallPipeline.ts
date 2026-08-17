import {
  cleanupVideoCallResources,
  openVideoCallWebviewDevTools,
  startVideoCallWindowHandler,
} from '../videoCallWindow/ipc';

/**
 * Global video call window pipeline — BrowserWindow lifecycle, IPC handshake,
 * Jitsi/provider webview, call-scoped cleanup.
 */
export const VideoCallPipeline = {
  setup(): void {
    startVideoCallWindowHandler();
  },

  cleanup(): void {
    cleanupVideoCallResources();
  },

  openDevTools: openVideoCallWebviewDevTools,
};
