export type IntelInstance = {
	id: string;
	passSalt: string;
	passHash: string;
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