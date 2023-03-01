export class BaseModel {
	// Edit
	_isEditMode = false;
	// Log
	_userId = 0; // Admin
	_createdDate: string;
	_updatedDate: string;
}

enum BACKEND_RESPONSE_STATUS {
	SUCCESS = 'success'
}

export interface BaseBackendResponse {
	readonly status: BACKEND_RESPONSE_STATUS;
	readonly message: string;
	readonly code: number;
}

export interface APIResponse extends BaseBackendResponse {
	readonly response: any;
}
