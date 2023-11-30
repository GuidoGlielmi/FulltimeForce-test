/**
 * @jest-environment jsdom
 */
import {renderHook} from '@testing-library/react';
import useFetch, {IUseFetchProps} from '@/src/hooks/useFetch';
import {ICommit, IResource} from 'monorepo-globals';
import {ErrorFeedbackContext} from '../context/ErrorFeedbackContext';
import {PropsWithChildren} from 'react';
import {act} from 'react-dom/test-utils';
import {CancelController, CancelError, genericErrorMessage} from '@/services/http';

const dummyCommitsData = {
  resource: [
    {title: 'some-tilte-1', body: 'some-1'},
    {title: 'some-tilte-2', body: 'some-2'},
    {title: 'some-tilte-3', body: 'some-3'},
  ],
  pageCount: 3,
} as IResource<any>;

const getSuccessfullFetchWith = (result?: any) =>
  jest.fn(() => {
    return Promise.resolve({
      json: () => Promise.resolve(result),
      ok: true,
      headers: {get: () => 'application/json'},
    });
  }) as any;

const mockValue = {setToastOptions: () => {}};
const ProviderWrapper = ({children}: PropsWithChildren) => (
  <ErrorFeedbackContext.Provider value={mockValue}>{children}</ErrorFeedbackContext.Provider>
);

describe('On successfull fetch', () => {
  test('makeRequest should be automatically executed on `isControlled === false`', async () => {
    global.fetch = getSuccessfullFetchWith(dummyCommitsData);
    const props = {
      endpoint: 'endpoint',
      isControlled: false,
    };
    const {result} = await act(() =>
      renderHook(() => useFetch<IResource<ICommit>>(props), {
        wrapper: ProviderWrapper,
      }),
    );
    expect(result.current.data).toBe(dummyCommitsData);
  });

  test('makeRequest should not be automatically executed on `isControlled === true`', async () => {
    const props = {
      endpoint: 'endpoint',
      isControlled: true,
    };
    const {
      result: {current},
    } = await act(() =>
      renderHook(() => useFetch<IResource<ICommit>>(props), {
        wrapper: ProviderWrapper,
      }),
    );
    const makeRequestSpy = jest.spyOn(current, 'makeRequest');
    expect(makeRequestSpy).toHaveBeenCalledTimes(0);
  });

  test("fetch should be re-made only on props's endpoint change", async () => {
    global.fetch = getSuccessfullFetchWith();
    const props = {
      endpoint: 'endpoint1',
      isControlled: false,
    };
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

  test("data shouldn't be reassigned when manually aborted", async () => {
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

    global.fetch = jest.fn(() => {
      return Promise.reject(new CancelError());
    }) as any;

    await act(() => result.current.makeRequest());

    expect(result.current.data).toBe(dummyCommitsData);
  });

  test('CancelController.cancel() should be called on endpoint change', async () => {
    const ProviderWrapper = ({children}: PropsWithChildren) => (
      <ErrorFeedbackContext.Provider value={mockValue}>{children}</ErrorFeedbackContext.Provider>
    );
    const cancelController = new CancelController();
    const abortController = cancelController.abortController;
    const props = {
      endpoint: 'endpoint1',
      isControlled: false,
      cancelController,
    } as IUseFetchProps<any>;
    const {rerender} = await act(() =>
      renderHook(props => useFetch<IResource<ICommit>>(props), {
        wrapper: ProviderWrapper,
        initialProps: props,
      }),
    );

    await act(async () => rerender({endpoint: 'endpoint2'}));

    expect(abortController).not.toBe(cancelController.abortController);
  });

  test('onResolve & onResolveSuccess should be called', async () => {
    const props = {
      endpoint: 'mock1',
      isControlled: false,
      onResolve: (message: any) => {},
      onResolveSuccess: (message: any) => {},
    };
    const spyOnResolve = jest.spyOn(props, 'onResolve');
    const spyOnResolveSuccess = jest.spyOn(props, 'onResolveSuccess');
    await act(() =>
      renderHook(() => useFetch<IResource<ICommit>>(props), {
        wrapper: ProviderWrapper,
      }),
    );
    expect(spyOnResolve).toHaveBeenCalledTimes(1);
    expect(spyOnResolveSuccess).toHaveBeenCalledTimes(1);
  });
});

describe("On Err'd fetch", () => {
  test('on unpredictable throw, error state should be true', async () => {
    global.fetch = jest.fn(() => Promise.reject()) as any;
    const props = {
      endpoint: 'endpoint',
      isControlled: false,
    };
    const {result} = await act(() =>
      renderHook(() => useFetch<IResource<ICommit>>(props), {
        wrapper: ProviderWrapper,
      }),
    );
    expect(result.current.error).toBe(true);
  });

  test('on response.ok === false, error state should be true', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ok: false})) as any;
    const props = {
      endpoint: 'endpoint',
      isControlled: false,
    };
    const {result} = await act(() =>
      renderHook(() => useFetch<IResource<ICommit>>(props), {
        wrapper: ProviderWrapper,
      }),
    );
    expect(result.current.error).toBe(true);
  });

  test('on timed out connection, error state should be true', async () => {
    class AbortError extends Error {
      name = 'AbortError';
    }
    global.fetch = jest.fn(() => Promise.reject(AbortError)) as any;
    const props = {
      endpoint: 'endpoint',
      isControlled: false,
    };
    const {result} = await act(() =>
      renderHook(() => useFetch<IResource<ICommit>>(props), {
        wrapper: ProviderWrapper,
      }),
    );
    expect(result.current.error).toBe(true);
  });

  test('onResolve & onResolveError should be called', async () => {
    global.fetch = jest.fn(() => Promise.reject()) as any;
    const props = {
      endpoint: 'endpoint',
      isControlled: false,
      onResolve: (message: any) => {},
      onResolveError: () => {},
    };
    const spyOnResolve = jest.spyOn(props, 'onResolve');
    const spyOnResolveError = jest.spyOn(props, 'onResolveError');
    await act(() =>
      renderHook(() => useFetch<IResource<ICommit>>(props), {
        wrapper: ProviderWrapper,
      }),
    );
    expect(spyOnResolve).toHaveBeenCalledTimes(1);
    expect(spyOnResolveError).toHaveBeenCalledTimes(1);
  });

  test("toast should render on err'd response with generic error message", async () => {
    global.fetch = jest.fn(() => Promise.resolve({ok: false})) as any;
    const spy = jest.spyOn(mockValue, 'setToastOptions');
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
    expect(spy).toHaveBeenLastCalledWith({
      message: genericErrorMessage,
      duration: toastDuration,
    });
  });

  test('toast message should be the general error message for toast options', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ok: false})) as any;
    const spy = jest.spyOn(mockValue, 'setToastOptions');
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
    global.fetch = jest.fn(() => Promise.resolve({status: 404, ok: false})) as any;
    const spy = jest.spyOn(mockValue, 'setToastOptions');
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
