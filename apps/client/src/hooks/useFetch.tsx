import {useCallback, useContext, useEffect, useState} from 'react';
import {httpService, TFetchResponse} from '@/services/http';
import {ErrorFeedbackContext, ErrorFeedbackProps} from '@/src/context/ErrorFeedbackContext';

export type TToastOptions = {
  errorMessage?: string;
  duration?: number;
};

export interface IRequestOptions {
  url?: string;
  method?: THttpServiceMethod;
  endpoint?: string;
  body?: any;
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
  body: defaultBody,
  isControlled = true,
  toastOptions: {errorMessage: defaultErrorMessage, duration: defaultDuration = 5} = {},
  onResolveSuccess,
  onResolveError,
  onResolve,
}: IUseFetch<T> = {}) => {
  const {setToastOptions} = useContext(ErrorFeedbackContext) as ErrorFeedbackProps;

  const [data, setData] = useState<T | null>();
  const [loading, setLoading] = useState(false);

  const makeRequest = useCallback(
    async ({
      url = defaultUrl,
      method = defaultMethod,
      endpoint = defaultEndpoint,
      body = defaultBody,
      toastOptions: {errorMessage = defaultErrorMessage, duration = defaultDuration} = {},
      abortController,
    }: IRequestOptions = {}) => {
      setLoading(true);

      const response = await httpService<T>({
        method,
        url,
        body,
        abortController,
      });

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
      } else {
        onResolveSuccess?.(response.data as T);
      }

      if (response.error) {
        setToastOptions({message: responseMessage, duration: duration * 1000});
      }

      onResolve?.(response.data);
      return response;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (!isControlled) makeRequest();
  }, [makeRequest, isControlled]);

  return {makeRequest, data, setData, loading};
};

export default useFetch;
