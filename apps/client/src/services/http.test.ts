import {ICommit, IResource} from 'monorepo-globals';
import {canceledResponse, httpService, unpredictableErrorResponse} from './http';
import {FetchResponse} from '../helpers/FetchResponse';
import {CancelController} from '../helpers/CancelController';

const url = 'http://localhost:3000/api/FulltimeForce-test?page=1';

it('should be populated when succeeding', async () => {
  const data = await httpService<IResource<ICommit>>({url});
  expect(data).toBeInstanceOf(FetchResponse);
  expect(data.data?.resource?.length).toBeGreaterThan(0);
});

it('should return canceledErrorResponse when manually aborted', async () => {
  const cancelController = new CancelController();
  const response = httpService({url, cancelController}) as Promise<TFetchResponseCanceled>;
  cancelController.cancel();
  const result = await response;
  expect(result).toBe(canceledResponse);
});

it('should return unpredictableErrorResponse 1', async () => {
  const cancelController = new CancelController();
  const response = httpService({url, cancelController}) as Promise<TFetchResponseCanceled>;
  cancelController.abort('crash');
  const result = await response;
  expect(result).toBe(unpredictableErrorResponse);
});

it('should return unpredictableErrorResponse after timed-out', async () => {
  class AbortError extends Error {
    name = 'AbortError';
  }
  global.fetch = jest.fn(() => Promise.reject(new AbortError())) as any;
  const response = httpService({url: 'https://google.com'});

  return expect(response).resolves.toBe(unpredictableErrorResponse);
});
