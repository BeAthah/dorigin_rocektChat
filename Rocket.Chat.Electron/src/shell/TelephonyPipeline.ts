import { setupTelephonyIpc } from '../telephony/ipc';
import {
  setupTelephonyDefaultHandlerPrompt,
  setupTelephonyGlobalShortcut,
  setupTelephonyProtocolHandlers,
} from '../telephony/main';

/**
 * Global telephony pipeline — tel:/callto: protocols, global shortcut,
 * dialpad, default OS handler prompt.
 */
export const TelephonyPipeline = {
  setup(): void {
    setupTelephonyGlobalShortcut();
    setupTelephonyProtocolHandlers();
    setupTelephonyDefaultHandlerPrompt();
    setupTelephonyIpc();
  },
};
