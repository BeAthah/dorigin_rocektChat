import type { IMessage, IUpload } from '@rocket.chat/core-typings';
import { MeteorError } from '@rocket.chat/core-services';
import { Messages, Uploads } from '@rocket.chat/models';
import type { OptionalId } from 'mongodb';

import { omit } from '../../../../lib/utils/omit';
import { sendFileLivechatMessage } from '../../../livechat/server/methods/sendFileLivechatMessage';
import { FileUpload } from './FileUpload';
import { sendFileMessage } from '../methods/sendFileMessage';

/**
 * Global media/upload pipeline.
 * Single place to target chat, livechat, and avatar file storage/orchestration.
 * REST routes and UploadService should call into this — not FileUpload stores directly.
 */
export type MediaPipelinePurpose = 'chat' | 'livechat' | 'avatar' | 'userData';

export type MediaPipelineStoreName = 'Uploads' | 'Avatars' | 'UserDataFiles';

const PURPOSE_TO_STORE: Record<MediaPipelinePurpose, MediaPipelineStoreName> = {
	chat: 'Uploads',
	livechat: 'Uploads',
	avatar: 'Avatars',
	userData: 'UserDataFiles',
};

export type ReceiveTemporaryFileParams = {
	purpose: 'chat';
	roomId: string;
	userId: string;
	name: string;
	size: number;
	type: string;
	tempFilePath: string;
	content?: IUpload['content'];
	expiresAt?: Date;
};

export type ConfirmRoomMediaParams = {
	roomId: string;
	userId: string;
	fileId: string;
	description?: string;
	fileName?: string;
	fileContent?: IUpload['content'];
	msgData?: Partial<IMessage>;
};

export type LivechatMsgData = {
	avatar?: string;
	emoji?: string;
	alias?: string;
	groupable?: boolean;
	msg?: string;
};

export type UploadLivechatFileParams = {
	roomId: string;
	visitorToken: string;
	name: string;
	size: number;
	type: string;
	tempFilePath: string;
	description?: string;
	msgData?: LivechatMsgData;
};

type UploadInsertDetails = Omit<OptionalId<IUpload>, '_updatedAt'>;

export const MediaPipeline = {
	getStoreName(purpose: MediaPipelinePurpose): MediaPipelineStoreName {
		return PURPOSE_TO_STORE[purpose];
	},

	getStore(purpose: MediaPipelinePurpose) {
		return FileUpload.getStore(this.getStoreName(purpose));
	},

	getPublicPath(file: Pick<IUpload, '_id' | 'name'>): string {
		return FileUpload.getPath(`${file._id}/${encodeURI(file.name || '')}`);
	},

	/**
	 * Stage 1 (chat): accept multipart bytes into temporary Uploads store (24h expiry by default).
	 */
	async receiveTemporaryFile(params: ReceiveTemporaryFileParams): Promise<{ _id: string; url: string }> {
		const expiresAt =
			params.expiresAt ??
			(() => {
				const d = new Date();
				d.setHours(d.getHours() + 24);
				return d;
			})();

		const details: UploadInsertDetails = {
			name: params.name,
			size: params.size,
			type: params.type,
			rid: params.roomId,
			userId: params.userId,
			expiresAt,
			...(params.content !== undefined ? { content: params.content } : {}),
		};

		const fileStore = this.getStore('chat');
		const uploadedFile = await fileStore.insert(details, params.tempFilePath);

		uploadedFile.path = this.getPublicPath(uploadedFile);

		await Uploads.updateFileComplete(uploadedFile._id, params.userId, omit(uploadedFile, '_id'));

		return {
			_id: uploadedFile._id,
			url: uploadedFile.path as string,
		};
	},

	/**
	 * Stage 2 (chat): confirm temporary file, attach to message, clear expiry.
	 */
	async confirmRoomMedia(params: ConfirmRoomMediaParams): Promise<IMessage | null> {
		const file = await Uploads.findOneByIdAndUserIdAndRoomId(params.fileId, params.userId, params.roomId);

		if (!file) {
			throw new MeteorError('invalid-file');
		}

		if (params.description !== undefined) {
			file.description = params.description;
		}

		if (params.fileName) {
			file.name = params.fileName;
		}

		if (params.fileContent) {
			file.content = params.fileContent;
		}

		await sendFileMessage(params.userId, {
			roomId: params.roomId,
			file,
			msgData: params.msgData,
		});

		await Uploads.confirmTemporaryFile(params.fileId, params.userId);

		return Messages.getMessageByFileIdAndUsername(file._id, params.userId);
	},

	/**
	 * Livechat: one-shot insert + send (visitor token, no temporary expiry flow).
	 */
	async uploadAndSendLivechat(params: UploadLivechatFileParams): Promise<boolean> {
		const details: UploadInsertDetails = {
			name: params.name,
			size: params.size,
			type: params.type,
			rid: params.roomId,
			visitorToken: params.visitorToken,
		};

		const fileStore = this.getStore('livechat');
		const uploadedFile = await fileStore.insert(details, params.tempFilePath);

		if (!uploadedFile) {
			throw new MeteorError('error-invalid-file', 'Invalid file');
		}

		if (params.description !== undefined) {
			uploadedFile.description = params.description;
		}

		return sendFileLivechatMessage({
			roomId: params.roomId,
			visitorToken: params.visitorToken,
			file: uploadedFile,
			msgData: params.msgData,
		});
	},

	async setAvatarByName(name: string): Promise<void> {
		await this.getStore('avatar').deleteByName(name);
	},

	async getAvatarStore() {
		return this.getStore('avatar');
	},

	/** Low-level escape hatch — prefer purpose helpers above. */
	async insertToPurpose(purpose: MediaPipelinePurpose, details: UploadInsertDetails, bufferOrPath: Buffer | string): Promise<IUpload> {
		return this.getStore(purpose).insert(details, bufferOrPath);
	},
};
