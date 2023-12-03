/**
 * @jest-environment jsdom
 */
import {renderHook, waitFor} from '@testing-library/react';
import useFetch, {IUseFetchProps} from '@/src/hooks/useFetch';
import {ICommit, IResource} from 'monorepo-globals';
import {ErrorFeedbackContext} from '../context/ErrorFeedbackContext';
import {PropsWithChildren} from 'react';
import {act} from 'react-dom/test-utils';
import {CancelError} from '../helpers/CancelError';
import {CancelController} from '../helpers/CancelController';
import {canceledResponse, genericErrorMessage} from '../services/http';

const dummyCommitsData = {
  resource: [
    {title: 'some-tilte-1', body: 'some-1'},
    {title: 'some-tilte-2', body: 'some-2'},
    {title: 'some-tilte-3', body: 'some-3'},
  ],
  pageCount: 3,
} as IResource<any>;

const getSuccessfullTimedFetchWith = (
  result?: any,
  {ok = true, code}: {ok?: boolean; code?: number} = {},
) =>
  jest.fn((url: string, {signal}: {signal?: AbortSignal}) => {
    return new Promise((res, rej) => {
      if (signal) {
        signal.onabort = () => rej(new CancelError());
      }
      setTimeout(() => {
        res({
          json: () => Promise.resolve(result),
          ok,
          code,
          headers: {get: () => 'application/json'},
        });
      }, 100);
    });
  }) as any;

const getCancellingFetch = () => jest.fn(() => Promise.reject(new CancelError())) as any;

const getSuccessfullFetchWith = (result?: any) =>
  jest.fn(() => {
    return Promise.resolve({
      json: () => Promise.resolve(result),
      ok: true,
      headers: {get: () => 'application/json'},
    });
  }) as any;

const getFailedTimedFetchWith = (result?: any) =>
  jest.fn(() => {
    return new Promise((_res, rej) => {
      setTimeout(() => {
        rej(new Error());
      }, 100);
    });
  }) as any;

const errorFeedbackContextMockValue = {setToastOptions: () => {}};
const ProviderWrapper = ({children}: PropsWithChildren) => (
  <ErrorFeedbackContext.Provider value={errorFeedbackContextMockValue}>
    {children}
  </ErrorFeedbackContext.Provider>
);

describe('On successfull fetch', () => {
  test('makeRequest should be automatically executed when uncontrolled', async () => {
    global.fetch = getSuccessfullFetchWith(dummyCommitsData);
    const fetchSpy = jest.spyOn(global, 'fetch');
    const props = {
      endpoint: 'endpoint',
      isControlled: false,
    };
    const {result} = await act(() =>
      renderHook(() => useFetch<IResource<ICommit>>(props), {
        wrapper: ProviderWrapper,
      }),
    );
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result.current.data).toBe(dummyCommitsData);
  });

  test('makeRequest should not be automatically executed when controlled', async () => {
    global.fetch = getSuccessfullFetchWith(dummyCommitsData);
    const fetchSpy = jest.spyOn(global, 'fetch');
    const props = {
      endpoint: 'endpoint',
      isControlled: true,
    };
    const {result} = await act(() =>
      renderHook(() => useFetch<IResource<ICommit>>(props), {
        wrapper: ProviderWrapper,
      }),
    );
    expect(fetchSpy).toHaveBeenCalledTimes(0);
    expect(result.current.data).toBe(null);
  });

  test("fetch should be re-made only on props's endpoint change", async () => {
    global.fetch = getSuccessfullFetchWith();
    const props = {
      endpoint: 'endpoint1',
      isControlled: false,
      toastOptions: {},
    } as IUseFetchProps<any>;
    const {rerender} = await act(() =>
      renderHook(props => useFetch<IResource<ICommit>>(props), {
        initialProps: props,
        wrapper: ProviderWrapper,
      }),
    );

    const newProps = {...props, endpoint: 'endpoint2'};
    await act(async () => rerender(newProps));

    expect(global.fetch).toHaveBeenCalledTimes(2);

    await act(async () => rerender(newProps));

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test("data shouldn't be reassigned when cancelling fetch", async () => {
    global.fetch = getSuccessfullFetchWith(dummyCommitsData);
    const {result} = await act(() =>
      renderHook(
        () =>
          useFetch<IResource<ICommit>>({
            endpoint: 'endpoint',
            isControlled: false,
          }),
        {wrapper: ProviderWrapper},
      ),
    );
    expect(result.current.data).toBe(dummyCommitsData);

    global.fetch = getCancellingFetch();
    await act(() => result.current.makeRequest());

    expect(result.current.data).toBe(dummyCommitsData);
  });

  test('cancel should be called on endpoint change or unmounting', async () => {
    const cancelController = new CancelController();
    global.fetch = getSuccessfullTimedFetchWith(dummyCommitsData);
    const cancelSpy = jest.spyOn(cancelController, 'cancel');
    const fetchSpy = jest.spyOn(global, 'fetch');
    const props = {
      endpoint: 'endpoint1',
      isControlled: false,
      cancelController,
    } as IUseFetchProps<any>;
    const {result, rerender, unmount} = renderHook(props => useFetch<IResource<ICommit>>(props), {
      wrapper: ProviderWrapper,
      initialProps: props,
    });
    rerender({...props, endpoint: 'endpoint2'});
    expect(cancelSpy).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(result.current.data).toBe(dummyCommitsData));

    expect(fetchSpy).toHaveBeenCalledTimes(2);

    unmount();

    expect(cancelSpy).toHaveBeenCalledTimes(2);
  });

  test('fetch should be cancellable from component props', async () => {
    const cancelController = new CancelController();
    const cancelSpy = jest.spyOn(cancelController, 'cancel');

    global.fetch = getSuccessfullTimedFetchWith(dummyCommitsData);
    const fetchSpy = jest.spyOn(global, 'fetch');

    const {result} = renderHook(
      () =>
        useFetch<IResource<ICommit>>({
          endpoint: 'endpoint',
          isControlled: false,
          cancelController,
        }),
      {wrapper: ProviderWrapper},
    );
    cancelController.cancel();
    await waitFor(() => expect(result.current.data).toBe(null));
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(cancelSpy).toHaveBeenCalledTimes(1);
  });

  test('fetch should be cancellable from makeRequest props', async () => {
    const cancelController = new CancelController();
    const cancelSpy = jest.spyOn(cancelController, 'cancel');

    global.fetch = getSuccessfullTimedFetchWith(dummyCommitsData);
    const fetchSpy = jest.spyOn(global, 'fetch');

    const {result} = renderHook(
      () =>
        useFetch<IResource<ICommit>>({
          endpoint: 'endpoint',
          isControlled: true,
        }),
      {wrapper: ProviderWrapper},
    );
    await act(async () => {
      const response = result.current.makeRequest({cancelController});
      cancelController.cancel();
      return expect(response).resolves.toBe(canceledResponse);
    });
    await waitFor(() => expect(result.current.data).toBe(null));
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(cancelSpy).toHaveBeenCalledTimes(1);
  });

  test('onResolve & onResolveSuccess should be called', async () => {
    global.fetch = getSuccessfullFetchWith(dummyCommitsData);
    const props = {
      endpoint: 'endpoint',
      isControlled: false,
      onResolve: (message: any) => {},
      onResolveSuccess: (asd: any) => {},
    };
    const spyOnResolve = jest.spyOn(props, 'onResolve');
    const spyOnResolveSuccess = jest.spyOn(props, 'onResolveSuccess');
    await act(() =>
      renderHook(props => useFetch<IResource<ICommit>>(props), {
        initialProps: props,
        wrapper: ProviderWrapper,
      }),
    );
    expect(spyOnResolve).toHaveBeenCalledTimes(1);
    expect(spyOnResolveSuccess).toHaveBeenCalledTimes(1);
  });
});

describe("On Err'd fetch", () => {
  test('on unpredictable throw, error state should be true', async () => {
    global.fetch = getFailedTimedFetchWith();
    const {result} = renderHook(
      () =>
        useFetch<IResource<ICommit>>({
          endpoint: 'endpoint',
          isControlled: false,
        }),
      {wrapper: ProviderWrapper},
    );
    await waitFor(() => expect(result.current.error).toBe(true));
  });

  test('on http error status, error state should be true', async () => {
    global.fetch = getSuccessfullTimedFetchWith(undefined, {ok: false});
    const {result} = renderHook(
      () =>
        useFetch<IResource<ICommit>>({
          endpoint: 'endpoint',
          isControlled: false,
        }),
      {wrapper: ProviderWrapper},
    );
    await waitFor(() => expect(result.current.error).toBe(true));
  });

  test('on timed out connection, error state should be true', async () => {
    class AbortError extends Error {
      name = 'AbortError';
    }
    global.fetch = jest.fn(() => Promise.reject(new AbortError())) as any;
    const {result} = renderHook(
      () =>
        useFetch<IResource<ICommit>>({
          endpoint: 'endpoint',
          isControlled: false,
        }),
      {wrapper: ProviderWrapper},
    );
    await waitFor(() => expect(result.current.error).toBe(true));
  });

  test('onResolve & onResolveError should be called', async () => {
    global.fetch = jest.fn((): any => Promise.reject()) as any;
    const props = {
      endpoint: 'endpoint',
      isControlled: false,
      onResolve: (message: any) => {},
      onResolveError: () => {},
    };
    const spyOnResolve = jest.spyOn(props, 'onResolve');
    const spyOnResolveError = jest.spyOn(props, 'onResolveError');
    await act(() =>
      renderHook(props => useFetch<IResource<ICommit>>(props), {
        initialProps: props,
        wrapper: ProviderWrapper,
      }),
    );
    expect(spyOnResolve).toHaveBeenCalledTimes(1);
    expect(spyOnResolveError).toHaveBeenCalledTimes(1);
  });

  test("toast should render on err'd response with generic error message", async () => {
    global.fetch = jest.fn((): any => Promise.resolve({status: 404, ok: false})) as any;
    const erroFeedbackContextMockValuePsy = jest.spyOn(
      errorFeedbackContextMockValue,
      'setToastOptions',
    );
    const toastDuration = 10000;
    const props = {
      endpoint: 'endpoint',
      isControlled: false,
      toastOptions: {duration: toastDuration},
    } as IUseFetchProps<any>;
    await act(() =>
      renderHook(() => useFetch<IResource<ICommit>>(props), {
        wrapper: ProviderWrapper,
      }),
    );
    expect(erroFeedbackContextMockValuePsy).toHaveBeenLastCalledWith({
      message: genericErrorMessage,
      duration: toastDuration,
    });
  });

  test('toast message should be the general error message for toast options', async () => {
    global.fetch = jest.fn((): any => Promise.resolve({status: 404, ok: false})) as any;
    const spy = jest.spyOn(errorFeedbackContextMockValue, 'setToastOptions');
    const errorMessage = 'hello';
    const props = {
      endpoint: 'endpoint',
      isControlled: false,
      toastOptions: {errorMessage},
    } as IUseFetchProps<any>;
    await act(() =>
      renderHook(() => useFetch<IResource<ICommit>>(props), {
        wrapper: ProviderWrapper,
      }),
    );
    expect(spy).toHaveBeenLastCalledWith({message: errorMessage, duration: 5000});
  });

  test('toast message should be the message for specific error status code', async () => {
    global.fetch = jest.fn((): any => Promise.resolve({status: 404, ok: false})) as any;
    const spy = jest.spyOn(errorFeedbackContextMockValue, 'setToastOptions');
    const errorMessage404 = 'hello';
    const props = {
      endpoint: 'endpoint',
      isControlled: false,
      toastOptions: {errorMessage: {[404]: errorMessage404}},
    } as IUseFetchProps<any>;

    const {rerender} = await act(() =>
      renderHook(props => useFetch<IResource<ICommit>>(props), {
        initialProps: props,
        wrapper: ProviderWrapper,
      }),
    );
    expect(spy).toHaveBeenLastCalledWith({message: errorMessage404, duration: 5000});

    const errorMessage400 = 'hello';

    await act(async () =>
      rerender({
        endpoint: 'endpoint2',
        isControlled: false,
        toastOptions: {errorMessage: {[400]: errorMessage400}},
      }),
    );

    expect(spy).not.toHaveBeenLastCalledWith({message: errorMessage400, duration: 5000});
  });
});
