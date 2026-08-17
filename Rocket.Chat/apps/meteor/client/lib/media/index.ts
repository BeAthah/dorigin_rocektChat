/**
 * Global client media/upload entrypoint.
 * Import from here when wiring composers, drop targets, voice/video recorders, etc.
 *
 * Server counterpart: app/file-upload/server/lib/MediaPipeline.ts (+ Upload service)
 */

export { uploadFiles } from '../chats/flows/uploadFiles';
export { processMessageUploads } from '../chats/flows/processMessageUploads';
export { createUploadsAPI } from '../chats/uploads';
