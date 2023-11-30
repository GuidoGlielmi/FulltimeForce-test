import {ICommit, IResource} from 'monorepo-globals';
import {canceledResponse, httpService, unpredictableErrorResponse} from './http';
import {FetchResponse} from '../helpers/FetchResponse';
import {CancelController} from '../helpers/CancelController';

const url = 'http://localhost:3000/api/FulltimeForce-test?page=1';

it('should be populated', async () => {
  const data = await httpService<IResource<ICommit>>({url});
  expect(data).toBeInstanceOf(FetchResponse);
  expect(data.data?.resource?.length).toBeGreaterThan(0);
});

it('should be canceledErrorResponse', async () => {
  const cancelController = new CancelController();
  setTimeout(() => cancelController.cancel());
  return (httpService({url, cancelController}) as Promise<TFetchResponseCanceled>).then(
    (data: TFetchResponseCanceled) => {
      expect(data).toBe(canceledResponse);
    },
  );
});

it('should be unpredictableErrorResponse 1', async () => {
  const cancelController = new CancelController();
  setTimeout(() => cancelController.abort('crash'));
  return (httpService({url, cancelController}) as Promise<TFetchResponseError>).then(data => {
    expect(data).toBe(unpredictableErrorResponse);
  });
});

it('should be unpredictableErrorResponse 2', async () => {
  const cancelController = new CancelController();
  setTimeout(() => {
    cancelController.abort();
  });
  setTimeout(() => {
    cancelController.abort();
  });
  setTimeout(() => {
    cancelController.abort();
  });
  return (httpService({url, cancelController}) as Promise<TFetchResponseError>).then(data => {
    expect(data).toBe(unpredictableErrorResponse);
  });
});
