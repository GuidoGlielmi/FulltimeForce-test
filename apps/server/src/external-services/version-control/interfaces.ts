import { ICommit } from 'monorepo-globals';

export interface IResource<T> {
  resource: T[];
  pageCount: number;
}

export interface IVersionControl {
  get(
    repoName: string,
    page: number,
    perPage?: number,
  ): Promise<IResource<ICommit>>;
  mapCommit(commit: any): ICommit;
}

export const IVersionControl = Symbol('IVersionControl');

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
