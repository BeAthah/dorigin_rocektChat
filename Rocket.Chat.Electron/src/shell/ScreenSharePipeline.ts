import { handleDesktopCapturerGetSources } from '../screenSharing/desktopCapturerCache';
import { setupScreenSharing } from '../screenSharing/main';
import { startServerViewScreenSharingHandler } from '../screenSharing/serverViewScreenSharing';

/**
 * Global screen-share pipeline — display-media / source picker for server
 * webviews and the video call window.
 */
export const ScreenSharePipeline = {
  setup(): void {
    setupScreenSharing();
    startServerViewScreenSharingHandler();
  },

  /** Register desktopCapturer IPC (call after window is up). */
  setupCapturerCache(): void {
    handleDesktopCapturerGetSources();
  },
};
