import {CancelController} from '@/services/http';

/* eslint-disable @typescript-eslint/no-explicit-any */
export {};

declare global {
  export type THttpServiceMethod = 'get' | 'post' | 'put' | 'delete';
  export type THttpService<T> = {
    method?: THttpServiceMethod;
    url: string;
    body?: FormData | T;
    cancelController?: CancelController;
  };
  export type Obj<T = any> = {[key: string]: T};
}
