export interface IVersionControl {
  get(repoName: string, perPage?: number): Promise<ICommit[]>;
  mapCommit(commit: any): ICommit;
}

export const IVersionControl = Symbol('IVersionControl');

export interface ICommit {
  url: string;
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

/*
  {
      "url":string,
      "author": {
        "name":string,
        "email":string,
        "date":string"
      },
      "committer": {
        "name":string,
        "email":string,
        "date":string"
      },
      "message":string,
      "tree": {
        "url":string,
        "sha":string
      },
      "comment_count": number,
      "verification": {
        "verified": boolean,
        "reason":string,
        "signature": null,
        "payload": null
      }
  }
 */
