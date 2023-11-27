export const meaningOfLife = 42;
export interface ICommit {
  id: string;
  url: string;
  htmlUrl: string;
  author: {
    name?: string;
    email?: string;
    date?: string;
  };
  committer: {
    name?: string;
    email?: string;
    date?: string;
  };
  message: string;
  tree: {
    url: string;
    sha: string;
  };
  comment_count: number;
  verification?: {
    verified: boolean;
    reason: string;
    signature: string;
    payload: string;
  };
}
export interface IResource<T> {
  resource: T[];
  pageCount: number;
}
