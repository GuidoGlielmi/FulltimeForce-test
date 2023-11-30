export class CancelError extends Error {
  name = 'CancelError';
}

export class CancelController {
  public abortController = new AbortController();

  abort(reason?: any) {
    this.abortController.abort(reason);
    this.abortController = new AbortController();
  }
  cancel() {
    this.abort(new CancelError());
  }
}
const contentTypes = {
  string: 'text/html',
  object: 'application/json',
};

export type THttpService<T = any> = Promise<
  | TFetchResponseSuccess<T>
  | TFetchResponseCanceled
  | TFetchResponseError
  | TFetchResponseErrorWithStatus
>;

export const httpService = async <T>({
  method = 'get',
  url,
  body,
  cancelController,
}: THttpServiceArgs<T>): THttpService<T> => {
  const isFormData = typeof window !== 'undefined' && body instanceof FormData;
  const headers = {
    ...(!isFormData && {
      'Content-type': `${contentTypes[typeof body as 'object' | 'string']}; charset=UTF-8`,
    }),
  };

  try {
    const rawRes = await tryFetch(
      url,
      {
        method: method.toUpperCase(),
        body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
        headers,
      },
      cancelController,
    );
    if (!rawRes) return unpredictableErrorResponse;

    if (!rawRes.ok) {
      return new FetchResponse(null, true, rawRes.status as THttpErrorStatusCode);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let res: any = null;
    if (rawRes.headers.get('content-type')?.includes?.('application/json')) {
      res = await rawRes.json();
    } else {
      res = await rawRes.text();
    }
    res = res === 'null' ? null : res;
    return new FetchResponse(res, !rawRes.ok, rawRes.status as THttpErrorStatusCode);
  } catch (err: any) {
    return err instanceof CancelError ? canceledResponse : unpredictableErrorResponse;
  }
};

async function tryFetch(
  url: string,
  options?: RequestInit,
  cancelController?: CancelController,
  retries = 3,
) {
  let remainingTries = retries;
  const controller = cancelController || new CancelController();
  while (remainingTries > 0) {
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const result = await fetch(url, {...options, signal: controller.abortController.signal});
      return result;
    } catch (err: any) {
      console.log(err);
      if (err.name !== 'AbortError') throw err;
      remainingTries--;
    } finally {
      clearTimeout(timer);
    }
  }
}

export const genericErrorMessage = 'Ha ocurrido un error' as const;

export type TFetchMessage = typeof genericErrorMessage | '';

export class FetchResponse<
  TData,
  TError extends boolean,
  TCode extends number | undefined = undefined,
> {
  public message: TFetchMessage;
  constructor(
    public data: TData,
    public error: TError,
    public code?: TCode,
  ) {
    this.data = data;
    this.error = error;
    this.code = code;
    this.message = error ? 'Ha ocurrido un error' : '';
  }
}

export type THttpErrorStatusCode = 400 | 404 | 500;

export type TFetchResponseSuccess<T> = FetchResponse<T, false, THttpErrorStatusCode>;
export type TFetchResponseError = FetchResponse<null, true, undefined>;
export type TFetchResponseErrorWithStatus = FetchResponse<null, true, THttpErrorStatusCode>;
export type TFetchResponseCanceled = FetchResponse<null, false, undefined>;

export const canceledResponse: TFetchResponseCanceled = new FetchResponse(null, false);
export const unpredictableErrorResponse: TFetchResponseError = new FetchResponse(null, true);
