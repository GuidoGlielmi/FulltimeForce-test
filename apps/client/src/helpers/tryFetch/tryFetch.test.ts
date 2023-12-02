import {tryFetch} from '.';
import {CancelController} from '../CancelController';
import {CancelError} from '../CancelError';

it('should throw CancelError when manually aborted', async () => {
  const cancelController = new CancelController();
  const response = tryFetch('http://google.com', undefined, cancelController);
  cancelController.cancel();
  return expect(response).rejects.toThrow(CancelError);
});

it('should throw on unpredictable error', async () => {
  const cancelController = new CancelController();
  const response = tryFetch('http://localhost:3000', undefined, cancelController);
  cancelController.abort('crash');
  return expect(response).rejects.toThrow();
});

it('should throw after time-out', async () => {
  class AbortError extends Error {
    name = 'AbortError';
  }
  const retries = 5;
  const cancelController = new CancelController();
  global.fetch = jest.fn(() => Promise.reject(new AbortError())) as any;
  const fetchSpy = jest.spyOn(global, 'fetch');
  const response = tryFetch('http://google.com', undefined, cancelController, retries);
  await expect(response).rejects.toThrow('timed out');
  expect(fetchSpy).toHaveBeenCalledTimes(retries);
}, 10000);
