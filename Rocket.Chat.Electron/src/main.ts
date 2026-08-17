import { app } from 'electron';

import {
  performElectronStartup,
  setupApp,
  initializeScreenCaptureFallbackState,
  setupGpuCrashHandler,
  markMainWindowStable,
} from './app/main/app';
import {
  mergePersistableValues,
  watchAndPersistChanges,
} from './app/main/data';
import { setUserDataDirectory } from './app/main/dev';
import { startBrowserHandler } from './browser/ipc';
import { startDocumentViewerHandler } from './documentViewer/ipc';
import { setupMainErrorHandling } from './errors';
import i18n from './i18n/main';
import { handleJitsiDesktopCapturerGetSources } from './jitsi/ipc';
import { startLogViewerWindowHandler } from './logViewerWindow/ipc';
import {
  logger,
  setupWebContentsLogging,
  cleanupOldLogs,
  setupDebugLoggingWatch,
} from './logging';
import { setupNavigation } from './navigation/main';
import {
  startOutlookCalendarUrlHandler,
  stopOutlookCalendarSync,
} from './outlookCalendar/ipc';
import { setupOutlookLogger } from './outlookCalendar/logger';
import { handleClearCacheDialog } from './servers/cache';
import { setupServers } from './servers/main';
import { checkSupportedVersionServers } from './servers/supportedVersions/main';
import { ShellGlobals } from './shell';
import { setupSpellChecking } from './spellChecking/main';
import { createMainReduxStore } from './store';
import { applySystemCertificates } from './systemCertificates';
import { handleCertificatesManager } from './ui/components/CertificatesManager/main';
import dock from './ui/main/dock';
import menuBar from './ui/main/menuBar';
import {
  createRootWindow,
  showRootWindow,
  exportLocalStorage,
  watchMachineTheme,
} from './ui/main/rootWindow';
import { attachGuestWebContentsEvents } from './ui/main/serverView';
import touchBar from './ui/main/touchBar';
import trayIcon from './ui/main/trayIcon';
import { setupPowerMonitor } from './userPresence/main';

const start = async (): Promise<void> => {
  setUserDataDirectory();
  applySystemCertificates();

  logger.info('Starting Rocket.Chat Desktop application');

  setupWebContentsLogging();

  performElectronStartup();
  ShellGlobals.setupEarly();

  // Set up GPU crash handler BEFORE whenReady to catch early GPU failures
  setupGpuCrashHandler();

  await app.whenReady();

  cleanupOldLogs();

  createMainReduxStore();

  setupOutlookLogger();
  setupDebugLoggingWatch();

  // Initialize screen capture fallback state after store is available
  initializeScreenCaptureFallbackState();

  // Global downloads: electron-dl + path persistence (before guest views)
  ShellGlobals.setupDownloadsEarly();

  const localStorage = await exportLocalStorage();
  await mergePersistableValues(localStorage);
  await setupServers(localStorage);

  i18n.setUp();
  await i18n.wait();

  setupApp();

  setupMainErrorHandling();

  createRootWindow();
  startOutlookCalendarUrlHandler();
  attachGuestWebContentsEvents();
  await showRootWindow();

  // Mark main window as stable - GPU crashes after this won't trigger fallback
  markMainWindowStable();
  watchMachineTheme();

  // Global shell pipelines: notifications, screen share, video call, telephony, updates, downloads IPC
  await ShellGlobals.setupAfterWindow();
  startLogViewerWindowHandler();

  await setupSpellChecking();

  await setupNavigation();
  setupPowerMonitor();
  handleCertificatesManager();

  dock.setUp();
  menuBar.setUp();
  touchBar.setUp();
  trayIcon.setUp();

  app.addListener('before-quit', () => {
    dock.tearDown();
    menuBar.tearDown();
    touchBar.tearDown();
    trayIcon.tearDown();
    stopOutlookCalendarSync();
    ShellGlobals.onBeforeQuit();
  });

  watchAndPersistChanges();
  handleJitsiDesktopCapturerGetSources();
  ShellGlobals.setupCapturer();
  handleClearCacheDialog();
  startDocumentViewerHandler();
  startBrowserHandler();
  checkSupportedVersionServers();

  await ShellGlobals.processDeepLinks();

  console.info('Application initialization completed successfully');
};

start().catch((error) => {
  logger.error('Failed to start application', error);
  app.exit(1);
});
