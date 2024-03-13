export interface Event {
  name: string;
  payload?: unknown;
}

export interface FunctionPayload {
  name: string;
  event: Event;
  cache: { [key: string]: any };
}

export interface RpcResponse {
  result?: CompleteResult | StepResult | DelayResult | InvokeResult;
  error?: string;
  id: number | string;
}

export interface Secret {
  username: string;
  password: string;
  host: string;
  port: number;
}

export interface CompleteResult {
  type: 'complete';
  stepId: string;
  stepValue: any;
}

export interface StepResult {
  type: 'step';
  stepId: string;
  stepValue: any;
}

export interface DelayResult {
  type: 'delay';
  stepId: string;
  delayInMs: number;
}

export interface InvokeResult {
  type: 'invoke';
  stepId: string;
  invokedFnName: string;
  payload?: object;
}
