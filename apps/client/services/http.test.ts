import {ICommit, IResource} from 'monorepo-globals';
import {
  CancelController,
  FetchResponse,
  canceledResponse,
  httpService,
  unpredictableErrorResponse,
} from './http';

const url = 'http://localhost:3000/api/FulltimeForce-test?page=1';

it('should be populated', async () => {
  const data = await httpService<IResource<ICommit>>({url});
  expect(data).toBeInstanceOf(FetchResponse);
  expect(data.data?.resource?.length).toBeGreaterThan(0);
});

it('should be canceledErrorResponse', async () => {
  const cancelController = new CancelController();
  setTimeout(() => cancelController.cancel());
  return httpService<null>({url, cancelController}).then((data: FetchResponse<null>) => {
    expect(data).toBe(canceledResponse);
  });
});

it('should be unpredictableErrorResponse 1', async () => {
  const cancelController = new CancelController();
  setTimeout(() => cancelController.abort('crash'));
  return httpService<null>({url, cancelController}).then((data: FetchResponse<null>) => {
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
  return httpService<null>({url, cancelController}).then((data: FetchResponse<null>) => {
    expect(data).toBe(unpredictableErrorResponse);
  });
});
