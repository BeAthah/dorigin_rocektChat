/**
 * Global Electron shell pipelines.
 * One place to target Downloads Manager, Video Call Window, Screen Share,
 * Notifications, Telephony, Updates, and Deep Links.
 *
 * Domain implementations stay in their folders; this layer owns bootstrap order
 * and is the single import surface for main-process wiring.
 */

export { DownloadsPipeline } from './DownloadsPipeline';
export { VideoCallPipeline } from './VideoCallPipeline';
export { ScreenSharePipeline } from './ScreenSharePipeline';
export { NotificationsPipeline } from './NotificationsPipeline';
export { TelephonyPipeline } from './TelephonyPipeline';
export { UpdatesPipeline } from './UpdatesPipeline';
export { DeepLinksPipeline } from './DeepLinksPipeline';
export { ShellGlobals } from './ShellGlobals';
