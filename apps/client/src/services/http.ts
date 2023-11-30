import {FetchResponse} from '@/src/helpers/FetchResponse';
import {CancelError} from '../helpers/CancelError';
import {tryFetch} from '../helpers/tryFetch';

const contentTypes = {
  string: 'text/html',
  object: 'application/json',
};

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

export const genericErrorMessage = 'Ha ocurrido un error' as const;
export const canceledResponse: TFetchResponseCanceled = new FetchResponse(null, false);
export const unpredictableErrorResponse: TFetchResponseError = new FetchResponse(null, true);
