import { setupUpdates } from '../updates/main';

/**
 * Global updates pipeline — electron-updater checks, channels, install prompts.
 */
export const UpdatesPipeline = {
  async setup(): Promise<void> {
    await setupUpdates();
  },
};
