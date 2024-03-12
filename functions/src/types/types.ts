import { Step } from '../utils/step';
export interface RpcRequest {
  jsonrpc: '2.0';
  method: string;
  params: { event: Event };
  id?: number | string;
}

export interface RpcResponse {
  result?: object;
  error?: Error | string;
  id: number | string;
}

export type EventFunction = (event: Event, step: Step) => Promise<any>;

export interface FunctionData {
  id: string;
  event: string;
  fn: EventFunction;
}

export interface Event {
  name: String;
  payload?: Object;
}

export interface Secret {
  username: string;
  password: string;
  host: string;
  port: number;
}
