import { DeepLinksPipeline } from './DeepLinksPipeline';
import { DownloadsPipeline } from './DownloadsPipeline';
import { NotificationsPipeline } from './NotificationsPipeline';
import { ScreenSharePipeline } from './ScreenSharePipeline';
import { TelephonyPipeline } from './TelephonyPipeline';
import { UpdatesPipeline } from './UpdatesPipeline';
import { VideoCallPipeline } from './VideoCallPipeline';

/**
 * ShellGlobals — single bootstrap surface for Electron shell subsystems.
 *
 * Bootstrap order (matches prior main.ts semantics):
 * 1. Early: deep links protocol registration
 * 2. Pre-window: electron-dl tracking
 * 3. Post-window: notifications → screen share → video call → telephony → updates → downloads IPC
 */
export const ShellGlobals = {
  /** Protocol / URL handlers that must register before app ready finishes. */
  setupEarly(): void {
    DeepLinksPipeline.setupEarly();
  },

  /** electron-dl must attach before guest webContents start downloading. */
  setupDownloadsEarly(): void {
    DownloadsPipeline.setupElectronDl();
  },

  /** Main shell globals after root window is visible. */
  async setupAfterWindow(): Promise<void> {
    NotificationsPipeline.setup();
    ScreenSharePipeline.setup();
    VideoCallPipeline.setup();
    TelephonyPipeline.setup();
    await UpdatesPipeline.setup();
    DownloadsPipeline.setupIpc();
  },

  /** Desktop capturer IPC used by screen share + Jitsi. */
  setupCapturer(): void {
    ScreenSharePipeline.setupCapturerCache();
  },

  async processDeepLinks(): Promise<void> {
    await DeepLinksPipeline.processStartupArgs();
  },

  onBeforeQuit(): void {
    NotificationsPipeline.tearDown();
    VideoCallPipeline.cleanup();
  },
};
