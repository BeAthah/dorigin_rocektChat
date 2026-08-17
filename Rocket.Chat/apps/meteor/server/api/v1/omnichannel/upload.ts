import { Upload, isMeteorError } from '@rocket.chat/core-services';
import { LivechatVisitors, LivechatRooms } from '@rocket.chat/models';

import { API } from '../..';
import { settings } from '../../../../app/settings/server';
import { fileUploadIsValidContentType } from '../../../../app/utils/server/restrictions';
import { MultipartUploadHandler } from '../../lib/MultipartUploadHandler';

function pickLivechatMsgData(fields: Record<string, string>): {
	avatar?: string;
	emoji?: string;
	alias?: string;
	groupable?: boolean;
	msg?: string;
} {
	const msgData: {
		avatar?: string;
		emoji?: string;
		alias?: string;
		groupable?: boolean;
		msg?: string;
	} = {};

	if (fields.avatar) {
		msgData.avatar = fields.avatar;
	}
	if (fields.emoji) {
		msgData.emoji = fields.emoji;
	}
	if (fields.alias) {
		msgData.alias = fields.alias;
	}
	if (fields.msg) {
		msgData.msg = fields.msg;
	}
	if (fields.groupable !== undefined) {
		msgData.groupable = fields.groupable === 'true' || fields.groupable === '1';
	}

	return msgData;
}

API.v1.addRoute('livechat/upload/:rid', {
	async post() {
		if (!this.request.headers.get('x-visitor-token')) {
			return API.v1.forbidden();
		}

		const canUpload = settings.get<boolean>('Livechat_fileupload_enabled') && settings.get<boolean>('FileUpload_Enabled');

		if (!canUpload) {
			return API.v1.failure({
				reason: 'error-file-upload-disabled',
			});
		}

		const visitorToken = this.request.headers.get('x-visitor-token');
		const visitor = await LivechatVisitors.getVisitorByToken(visitorToken as string, {});

		if (!visitor) {
			return API.v1.forbidden();
		}

		const room = await LivechatRooms.findOneOpenByRoomIdAndVisitorToken(this.urlParams.rid, visitorToken as string);
		if (!room) {
			return API.v1.forbidden();
		}

		const maxFileSize = settings.get<number>('FileUpload_MaxFileSize') || 104857600;

		const { file, fields } = await MultipartUploadHandler.parseRequest(this.request, {
			field: 'file',
			maxSize: maxFileSize > -1 ? maxFileSize : undefined,
		});

		if (!file) {
			return API.v1.failure({
				reason: 'error-no-file-uploaded',
			});
		}

		if (!fileUploadIsValidContentType(file.mimetype)) {
			return API.v1.failure({
				reason: 'error-type-not-allowed',
			});
		}

		const { description } = fields;
		const msgData = pickLivechatMsgData(fields);

		try {
			const result = await Upload.uploadLivechatFile({
				roomId: this.urlParams.rid,
				visitorToken: visitorToken as string,
				name: file.filename,
				size: file.size,
				type: file.mimetype,
				tempFilePath: file.tempFilePath,
				description,
				msgData,
			});

			return API.v1.success(result);
		} catch (error) {
			if (isMeteorError(error)) {
				throw error;
			}
			return API.v1.failure('Invalid file');
		}
	},
});
