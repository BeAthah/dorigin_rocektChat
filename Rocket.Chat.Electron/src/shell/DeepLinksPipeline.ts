import * as deepLinks from '../deepLinks/main';

/**
 * Global deep-links pipeline — rocketchat:// protocol, server focus/add,
 * telephony handoff from URLs.
 *
 * Uses namespace import so `export let processDeepLinksInArgs` live-binding
 * (reassigned inside setupDeepLinks) is always the current implementation.
 */
export const DeepLinksPipeline = {
  setupEarly(): void {
    deepLinks.setupDeepLinks();
  },

  async processStartupArgs(): Promise<void> {
    await deepLinks.processDeepLinksInArgs();
  },
};
