import { BaseBackendResponse } from './base.model';
export interface AuditTrail {
  id: number;
  uuid: string;
  logged_at: Date | number | bigint;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  client_ip: string;
  username: string;
  group: string;
  page: 'application' | 'data_visualization' | 'data_processing' | 'menu_builder';
  text: string;
  action: string;
  application?: string;
}

export interface AuditTrailResponse extends BaseBackendResponse {
  readonly response: AuditTrail[];
}
