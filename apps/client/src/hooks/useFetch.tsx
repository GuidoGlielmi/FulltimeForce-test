import {useCallback, useContext, useEffect, useState} from 'react';
import {httpService} from '@/services/http';
import {ErrorFeedbackContext, ErrorFeedbackProps} from '@/src/context/ErrorFeedbackContext';

export type TToastOptions = {
  errorMessage?: string;
  duration?: number;
};

type TQuery = {[key: string]: string | number};

export interface IRequestOptions {
  url?: string;
  method?: THttpServiceMethod;
  endpoint?: string;
  body?: any;
  query?: TQuery;
  hideLoading?: boolean;
  toastOptions?: TToastOptions;
  abortController?: AbortController;
}

export interface IUseFetch<T> extends Omit<IRequestOptions, 'abortController'> {
  isControlled?: boolean;
  onResolveSuccess?: (data: T) => void;
  onResolveError?: () => void;
  onResolve?: (data: T | null) => void;
}

const useFetch = <T = any,>({
  url: defaultUrl = '',
  endpoint: defaultEndpoint = '',
  method: defaultMethod = 'get',
  query: defaultQuery = {},
  body: defaultBody,
  isControlled = true,
  toastOptions: {errorMessage: defaultErrorMessage, duration: defaultDuration = 5} = {},
  onResolveSuccess,
  onResolveError,
  onResolve,
}: IUseFetch<T> = {}) => {
  const {setToastOptions} = useContext(ErrorFeedbackContext) as ErrorFeedbackProps;

  const [data, setData] = useState<T | null>();
  const [loading, setLoading] = useState(!isControlled);
  const [error, setError] = useState(false);

  const makeRequest = useCallback(
    async ({
      url = defaultUrl,
      method = defaultMethod,
      endpoint = defaultEndpoint,
      query = defaultQuery,
      body = defaultBody,
      toastOptions: {errorMessage = defaultErrorMessage, duration = defaultDuration} = {},
      abortController,
    }: IRequestOptions = {}) => {
      setLoading(true);

      const fullUrl =
        url ||
        '/api' +
          (!endpoint || endpoint.startsWith('/') ? endpoint : `/${endpoint}`) +
          queryStringifier(query);
      const response = await httpService<T>({
        method,
        url: fullUrl,
        body,
        abortController,
      });

      setError(response.error);
      setData(response.data);

      setLoading(false);

      let responseMessage: string = response.message;

      // eslint-disable-next-line no-console
      console.log({...response, endpoint: endpoint || url});

      if (response.error) {
        onResolveError?.();
        if (typeof errorMessage === 'object') {
          if (errorMessage[response.code!]) responseMessage = errorMessage[response.code!]!;
        } else if (errorMessage) responseMessage = errorMessage;
        setToastOptions({message: responseMessage, duration: duration * 1000});
      } else {
        onResolveSuccess?.(response.data as T);
      }

      onResolve?.(response.data);
      return response;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [defaultEndpoint, queryStringifier(defaultQuery)],
  );

  useEffect(() => {
    if (!isControlled) makeRequest();
  }, [makeRequest, isControlled]);

  return {makeRequest, data, setData, loading, error};
};

const queryStringifier = (query?: TQuery) => {
  return query
    ? '?' + Object.entries(query).reduce<string>((p, [k, v]) => `${p}${k}=${v}`, '')
    : '';
};

export default useFetch;
