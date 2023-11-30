/**
 * @jest-environment jsdom
 */
import {act, render} from '@testing-library/react';
import CommitsTable from '../CommitsTable';
import {PropsWithChildren, createContext} from 'react';
import {ErrorFeedbackContext} from '@/src/context/ErrorFeedbackContext';
import {IResource} from 'monorepo-globals';
const dummyCommitsData = {
  resource: [
    {
      author: {
        name: 'Guido Glielmi',
        email: 'guidoglielmi@gmail.com',
        date: '2023-11-29T16:04:17Z',
      },
      committer: {
        name: 'Guido Glielmi',
        email: 'guidoglielmi@gmail.com',
        date: '2023-11-29T16:04:27Z',
      },
      message: 'feat: data on useFetch is updated only when not cancelling',
      tree: {
        sha: '629b104f1d7aabcfb276af3421a7a650eacde4d2',
        url: 'https://api.github.com/repos/GuidoGlielmi/FulltimeForce-test/git/trees/629b104f1d7aabcfb276af3421a7a650eacde4d2',
      },
      url: 'https://api.github.com/repos/GuidoGlielmi/FulltimeForce-test/git/commits/d34968bb17dc3f8a117c9c5d3c21472f25928795',
      comment_count: 0,
      verification: {
        verified: false,
        reason: 'unsigned',
        signature: null,
        payload: null,
      },
      id: 'd34968bb17dc3f8a117c9c5d3c21472f25928795',
      htmlUrl:
        'https://github.com/GuidoGlielmi/FulltimeForce-test/commit/d34968bb17dc3f8a117c9c5d3c21472f25928795',
    },
    {
      author: {
        name: 'Guido Glielmi',
        email: 'guidoglielmi@gmail.com',
        date: '2023-11-29T16:04:17Z',
      },
      committer: {
        name: 'Guido Glielmi',
        email: 'guidoglielmi@gmail.com',
        date: '2023-11-29T16:04:27Z',
      },
      message: 'feat: data on useFetch is updated only when not cancelling',
      tree: {
        sha: '629b104f1d7aabcfb276af3421a7a650eacde4d2',
        url: 'https://api.github.com/repos/GuidoGlielmi/FulltimeForce-test/git/trees/629b104f1d7aabcfb276af3421a7a650eacde4d2',
      },
      url: 'https://api.github.com/repos/GuidoGlielmi/FulltimeForce-test/git/commits/d34968bb17dc3f8a117c9c5d3c21472f25928795',
      comment_count: 0,
      verification: {
        verified: false,
        reason: 'unsigned',
        signature: null,
        payload: null,
      },
      id: 'd34968bb17dc3f8a117c9c5d3c21472f25928795',
      htmlUrl:
        'https://github.com/GuidoGlielmi/FulltimeForce-test/commit/d34968bb17dc3f8a117c9c5d3c21472f25928795',
    },
    {
      author: {
        name: 'Guido Glielmi',
        email: 'guidoglielmi@gmail.com',
        date: '2023-11-29T16:04:17Z',
      },
      committer: {
        name: 'Guido Glielmi',
        email: 'guidoglielmi@gmail.com',
        date: '2023-11-29T16:04:27Z',
      },
      message: 'feat: data on useFetch is updated only when not cancelling',
      tree: {
        sha: '629b104f1d7aabcfb276af3421a7a650eacde4d2',
        url: 'https://api.github.com/repos/GuidoGlielmi/FulltimeForce-test/git/trees/629b104f1d7aabcfb276af3421a7a650eacde4d2',
      },
      url: 'https://api.github.com/repos/GuidoGlielmi/FulltimeForce-test/git/commits/d34968bb17dc3f8a117c9c5d3c21472f25928795',
      comment_count: 0,
      verification: {
        verified: false,
        reason: 'unsigned',
        signature: null,
        payload: null,
      },
      id: 'd34968bb17dc3f8a117c9c5d3c21472f25928795',
      htmlUrl:
        'https://github.com/GuidoGlielmi/FulltimeForce-test/commit/d34968bb17dc3f8a117c9c5d3c21472f25928795',
    },
    {
      author: {
        name: 'Guido Glielmi',
        email: 'guidoglielmi@gmail.com',
        date: '2023-11-29T16:04:17Z',
      },
      committer: {
        name: 'Guido Glielmi',
        email: 'guidoglielmi@gmail.com',
        date: '2023-11-29T16:04:27Z',
      },
      message: 'feat: data on useFetch is updated only when not cancelling',
      tree: {
        sha: '629b104f1d7aabcfb276af3421a7a650eacde4d2',
        url: 'https://api.github.com/repos/GuidoGlielmi/FulltimeForce-test/git/trees/629b104f1d7aabcfb276af3421a7a650eacde4d2',
      },
      url: 'https://api.github.com/repos/GuidoGlielmi/FulltimeForce-test/git/commits/d34968bb17dc3f8a117c9c5d3c21472f25928795',
      comment_count: 0,
      verification: {
        verified: false,
        reason: 'unsigned',
        signature: null,
        payload: null,
      },
      id: 'd34968bb17dc3f8a117c9c5d3c21472f25928795',
      htmlUrl:
        'https://github.com/GuidoGlielmi/FulltimeForce-test/commit/d34968bb17dc3f8a117c9c5d3c21472f25928795',
    },
    {
      author: {
        name: 'Guido Glielmi',
        email: 'guidoglielmi@gmail.com',
        date: '2023-11-29T16:04:17Z',
      },
      committer: {
        name: 'Guido Glielmi',
        email: 'guidoglielmi@gmail.com',
        date: '2023-11-29T16:04:27Z',
      },
      message: 'feat: data on useFetch is updated only when not cancelling',
      tree: {
        sha: '629b104f1d7aabcfb276af3421a7a650eacde4d2',
        url: 'https://api.github.com/repos/GuidoGlielmi/FulltimeForce-test/git/trees/629b104f1d7aabcfb276af3421a7a650eacde4d2',
      },
      url: 'https://api.github.com/repos/GuidoGlielmi/FulltimeForce-test/git/commits/d34968bb17dc3f8a117c9c5d3c21472f25928795',
      comment_count: 0,
      verification: {
        verified: false,
        reason: 'unsigned',
        signature: null,
        payload: null,
      },
      id: 'd34968bb17dc3f8a117c9c5d3c21472f25928795',
      htmlUrl:
        'https://github.com/GuidoGlielmi/FulltimeForce-test/commit/d34968bb17dc3f8a117c9c5d3c21472f25928795',
    },
  ],
  pageCount: 3,
} as IResource<any>;

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(dummyCommitsData),
    ok: true,
    headers: {get: () => 'application/json'},
  }),
) as any;

const mockValue = {setToastOptions: () => {}};
const ProviderWrapper = ({children}: PropsWithChildren) => (
  <ErrorFeedbackContext.Provider value={mockValue}>{children}</ErrorFeedbackContext.Provider>
);

it('CommitsTable populates with 5 elements', async () => {
  jest.mock('../../context/ErrorFeedbackContext', () => ({
    __esModule: true,
    default: createContext(mockValue),
  }));
  const commitsTableComponent = render(<CommitsTable />, {wrapper: ProviderWrapper});
  await act(() => commitsTableComponent);
  const rows = commitsTableComponent.getAllByTestId('Guido Glielmi');
  expect(rows.length).toBe(5);
});
