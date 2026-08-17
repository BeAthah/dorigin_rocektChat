import {
  handleWillDownloadEvent,
  setupDownloads,
} from '../downloads/main';
import { setupElectronDlWithTracking } from '../downloads/main/setup';

/**
 * Global downloads pipeline — electron-dl prefs, will-download tracking,
 * pause/resume/cancel IPC, Downloads Manager UI state.
 */
export const DownloadsPipeline = {
  /** Install electron-dl + download path persistence (call early, before guest views). */
  setupElectronDl(): void {
    setupElectronDlWithTracking();
  },

  /** Register downloads IPC handlers for the Downloads Manager. */
  setupIpc(): void {
    setupDownloads();
  },

  /** Hook used by guest webContents `will-download` / markdown viewer. */
  handleWillDownload: handleWillDownloadEvent,
};
