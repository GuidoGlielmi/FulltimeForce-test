import {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {canceledResponse, httpService} from '@/src/services/http';
import {ErrorFeedbackContext, ErrorFeedbackProps} from '@/src/context/ErrorFeedbackContext';
import {TQuery} from '../helpers/query';
import {CancelController} from '../helpers/CancelController';

export type TToastOptions = {
  errorMessage?:
    | string
    | Partial<{
        [K in THttpErrorStatusCode]: string;
      }>;
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

export interface IUseFetchProps<T> extends Omit<IRequestOptions, 'abortController'> {
  isControlled?: boolean;
  onResolveSuccess?: (data: T) => void;
  onResolveError?: () => void;
  onResolve?: (data: T | null) => void;
}

export interface IUseFetch<T> {
  data: T | null;
  error: boolean;
  loading: boolean;
  setData: Dispatch<SetStateAction<T | null>>;
  makeRequest: (arg?: IRequestOptions) => THttpService<T>;
}

const useFetch = <T = any,>({
  url: defaultUrl = '',
  endpoint: defaultEndpoint = '',
  method: defaultMethod = 'get',
  body: defaultBody,
  isControlled = true,
  toastOptions: {errorMessage: defaultErrorMessage, duration: defaultDuration = 5000} = {},
  onResolveSuccess,
  onResolveError,
  onResolve,
  cancelController,
}: IUseFetchProps<T> = {}): IUseFetch<T> => {
  const {setToastOptions} = useContext(ErrorFeedbackContext) as ErrorFeedbackProps;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!isControlled);
  const [error, setError] = useState(false);
  const cancelControllerRef = useRef(cancelController ?? new CancelController());

  const makeRequest = useCallback(
    async ({
      url = defaultUrl,
      method = defaultMethod,
      endpoint = defaultEndpoint,
      body = defaultBody,
      toastOptions: {errorMessage = defaultErrorMessage, duration = defaultDuration} = {},
      cancelController,
    }: IRequestOptions = {}) => {
      if (cancelController) cancelControllerRef.current = cancelController;
      setLoading(true);

      const fullUrl =
        url || '/api' + (!endpoint || endpoint.startsWith('/') ? endpoint : `/${endpoint}`);
      const response = await httpService<T>({
        method,
        url: fullUrl,
        body,
        cancelController: cancelControllerRef.current,
      });

      setError(response.error);
      if (response !== canceledResponse) setData(response.data);

      setLoading(false);

      let responseMessage: string = response.message;

      // eslint-disable-next-line no-console
      console.log({...response, endpoint: endpoint || url});

      if (response.error) {
        onResolveError?.();
        if (typeof errorMessage === 'object') {
          if (errorMessage[response.code as THttpErrorStatusCode])
            responseMessage = errorMessage[response.code as THttpErrorStatusCode]!;
        } else if (errorMessage) responseMessage = errorMessage;
        setToastOptions({message: responseMessage, duration});
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
      cancelControllerRef.current?.cancel();
    };
  }, [makeRequest, isControlled]);

  return {makeRequest, data, setData, loading, error};
};

export default useFetch;
