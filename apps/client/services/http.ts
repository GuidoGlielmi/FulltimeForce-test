const contentTypes = {
  string: 'text/html',
  object: 'application/json',
};

export const httpService = async <T>({
  method = 'get',
  url,
  body,
  abortController,
}: THttpService<T>): Promise<FetchResponse<T | null>> => {
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
      abortController,
    );
    if (!rawRes) return unpredictableErrorResponse;

    if (!rawRes.ok) {
      return new FetchResponse(null, true, rawRes.status);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let res: any = null;
    if (rawRes.headers.get('content-type')?.includes?.('application/json')) {
      res = await rawRes.json();
    } else {
      res = await rawRes.text();
    }
    res = res === 'null' ? null : res;
    return new FetchResponse(res, !rawRes.ok, rawRes.status);
  } catch (err: any) {
    console.log(err);
    return err === 'canceled' || err.name === 'AbortError'
      ? canceledResponse
      : unpredictableErrorResponse;
  }
};

async function tryFetch(
  url: string,
  options?: RequestInit,
  abortController?: AbortController,
  retries = 3,
) {
  let remainingTries = retries;
  while (remainingTries > 0) {
    const controller = abortController || new AbortController();
    const timer = setTimeout(() => {
      remainingTries--;
      console.log(`aborting... Remaining tries: ${remainingTries} of ${retries}`);
      controller.abort();
    }, 20000);
    try {
      const result = await fetch(url, {...options, signal: controller.signal});
      clearTimeout(timer);
      return result;
    } catch (err: any) {
      console.log(err, err.name, err.status, err?.cause?.code);
      if (err === 'canceled' || err.name !== 'AbortError') throw err;
    }
  }
}

export type TFetchMessage = 'Ha ocurrido un error' | '';

class FetchResponse<T> {
  public message: TFetchMessage;
  constructor(
    public data: T,
    public error: boolean,
    public code?: number,
  ) {
    this.data = data;
    this.error = error;
    this.code = code;
    this.message = error ? 'Ha ocurrido un error' : '';
  }
}

const canceledResponse = new FetchResponse(null, false);

const unpredictableErrorResponse = new FetchResponse(null, true);

export type TFetchResponse<T> = FetchResponse<T>;
