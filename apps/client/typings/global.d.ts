import {CancelController} from '@/src/services/http';
import {genericErrorMessage} from '@/src/services/http';
/* eslint-disable @typescript-eslint/no-explicit-any */
export {};

declare global {
  // ------------
  // FETCH
  export type THttpServiceMethod = 'get' | 'post' | 'put' | 'delete';
  export type THttpServiceArgs<T> = {
    method?: THttpServiceMethod;
    url: string;
    body?: BodyInit<T> | null | undefined;
    cancelController?: CancelController;
  };
  export type Obj<T = any> = {[key: string]: T};
  export type TFetchMessage = typeof genericErrorMessage | '';

  export type THttpErrorStatusCode = 400 | 404 | 500;

  export type TFetchResponseSuccess<T> = FetchResponse<T, false, THttpErrorStatusCode>;
  export type TFetchResponseError = FetchResponse<null, true, undefined>;
  export type TFetchResponseErrorWithStatus = FetchResponse<null, true, THttpErrorStatusCode>;
  export type TFetchResponseCanceled = FetchResponse<null, false, undefined>;

  export type THttpService<T = any> = Promise<
    | TFetchResponseSuccess<T>
    | TFetchResponseCanceled
    | TFetchResponseError
    | TFetchResponseErrorWithStatus
  >;
  // ------------
}
