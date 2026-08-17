import type Stream from 'node:stream';

import type { IUploadDetails } from '@rocket.chat/apps-engine/definition/uploads/IUploadDetails';
import type { IMessage, IUpload, IUser, FilesAndAttachments, AtLeast } from '@rocket.chat/core-typings';

export interface IUploadFileParams {
	userId: string;
	buffer: Buffer;
	details: IUploadDetails;
}
export interface ISendFileMessageParams {
	roomId: string;
	userId: string;
	file: IUpload;
	message?: Partial<IMessage>;
}

export interface ISendFileLivechatMessageParams {
	roomId: string;
	visitorToken: string;
	file: IUpload;
	message?: Partial<IMessage>;
}

export interface IUploadService {
	uploadFile(params: IUploadFileParams): Promise<IUpload>;
	sendFileMessage(params: ISendFileMessageParams): Promise<boolean | undefined>;
	sendFileLivechatMessage(params: ISendFileLivechatMessageParams): Promise<boolean | undefined>;
	getFileBuffer({ file }: { file: IUpload }): Promise<Buffer>;
	extractMetadata(file: IUpload): Promise<{ height?: number; width?: number; format?: string }>;
	parseFileIntoMessageAttachments(file: Partial<IUpload>, roomId: string, user: IUser): Promise<FilesAndAttachments>;
	canDeleteFile(user: IUser, file: IUpload, msg: IMessage | null): Promise<boolean>;
	deleteFile(user: IUser, fileId: IUpload['_id'], msg: IMessage | null): Promise<{ deletedFiles: IUpload['_id'][] }>;
	streamUploadedFile({
		file,
		imageResizeOpts,
	}: {
		file: IUpload;
		imageResizeOpts?: { width: number; height: number };
	}): Promise<Stream.Readable>;
	uploadFileFromStream({ streamParam, details }: { streamParam: Stream.Readable; details: Omit<IUploadDetails, 'size'> }): Promise<IUpload>;
	setUserAvatar(user: Pick<IUser, '_id' | 'username'>, buffer: Buffer, contentType: string, service: 'rest'): Promise<void>;
	resetUserAvatar(user: AtLeast<IUser, '_id' | 'username'>): Promise<void>;

	/** Global pipeline: temporary chat media receive (rooms.media). */
	receiveRoomMedia(params: {
		roomId: string;
		userId: string;
		name: string;
		size: number;
		type: string;
		tempFilePath: string;
		content?: IUpload['content'];
	}): Promise<{ _id: string; url: string }>;

	/** Global pipeline: confirm temporary chat media and attach message (rooms.mediaConfirm). */
	confirmRoomMedia(params: {
		roomId: string;
		userId: string;
		fileId: string;
		description?: string;
		fileName?: string;
		fileContent?: IUpload['content'];
		msgData?: Partial<IMessage>;
	}): Promise<IMessage | null>;

	/** Global pipeline: livechat visitor upload + send (livechat/upload). */
	uploadLivechatFile(params: {
		roomId: string;
		visitorToken: string;
		name: string;
		size: number;
		type: string;
		tempFilePath: string;
		description?: string;
		msgData?: {
			avatar?: string;
			emoji?: string;
			alias?: string;
			groupable?: boolean;
			msg?: string;
		};
	}): Promise<boolean>;
}
