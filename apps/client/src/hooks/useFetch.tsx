import {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {CancelController, httpService} from '@/services/http';
import {ErrorFeedbackContext, ErrorFeedbackProps} from '@/src/context/ErrorFeedbackContext';
import {TQuery} from '../helpers/query';

export type TToastOptions = {
  errorMessage?: string;
  duration?: number;
};

export interface IRequestOptions {
  url?: string;
  method?: THttpServiceMethod;
  endpoint?: string;
  body?: any;
  query?: TQuery;
  hideLoading?: boolean;
  toastOptions?: TToastOptions;
  cancelController?: CancelController;
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
  const [loading, setLoading] = useState(!isControlled);
  const [error, setError] = useState(false);
  const cancellerRef = useRef<CancelController>();

  const makeRequest = useCallback(
    async ({
      url = defaultUrl,
      method = defaultMethod,
      endpoint = defaultEndpoint,
      body = defaultBody,
      toastOptions: {errorMessage = defaultErrorMessage, duration = defaultDuration} = {},
      cancelController,
    }: IRequestOptions = {}) => {
      console.log({defaultEndpoint});
      cancellerRef.current = cancelController ?? new CancelController();
      setLoading(true);

      const fullUrl =
        url || '/api' + (!endpoint || endpoint.startsWith('/') ? endpoint : `/${endpoint}`);
      const response = await httpService<T>({
        method,
        url: fullUrl,
        body,
        cancelController: cancellerRef.current,
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
    [defaultEndpoint],
  );

  useEffect(() => {
    if (!isControlled) makeRequest();
    return () => {
      cancellerRef.current?.cancel();
    };
  }, [makeRequest, isControlled]);

  return {makeRequest, data, setData, loading, error};
};

export default useFetch;
