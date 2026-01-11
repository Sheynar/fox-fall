import type { Shard } from '@packages/foxhole-api';

export type IntelInstance = {
	id: string;
	discord_guild_id: string;
	shard: Shard;
};

export type IntelInstanceDiscordPermissions = {
	instance_id: string;
	access_type: 'read' | 'write' | 'admin';
	role_id: string;
};

export type IntelMarkerRegion = {
	id: number;
	instance_id: string;
	region_x: number;
	region_y: number;
	timestamp: number;
	mime_type: string;
	region_data: Buffer;
};

export type IntelMarkerRegionFrontend = Omit<IntelMarkerRegion, 'region_data'> & {
	region_data: string;
};

export type BasicIntelDocument = {
	id: number;
	instance_id: string;
	document_x: number;
	document_y: number;
	ui_size: number;
	document_name: string;
	timestamp: number;
	deleted: boolean;
};

export type IntelDocument = BasicIntelDocument & {
	document_content: string;
};

export type IntelTag = {
	instance_id: string;
	tag: string;
};

export type IntelDocumentTag = {
	id: number;
	instance_id: string;
	document_id: number;
	tag: string;
	timestamp: number;
	deleted: boolean;
};

export type BasicIntelDocumentAttachment = {
	id: number;
	instance_id: string;
	document_id: number;
	mime_type: string;
};

export type IntelDocumentAttachment = BasicIntelDocumentAttachment & {
	attachment_content: Buffer;
};

export type IntelDocumentAttachmentFrontend = Omit<IntelDocumentAttachment, 'attachment_content'> & {
	attachment_content: string;
};