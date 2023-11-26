import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IVersionControl } from '../interfaces';
import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';

type TGithubCommit =
  RestEndpointMethodTypes['repos']['listCommits']['response']['data'][number];

@Injectable()
export class GithubService implements IVersionControl {
  private readonly octokit: Octokit;

  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
  }

  async get(repoName: string, page: number, perPage = 5) {
    try {
      const { data: commits, headers } =
        await this.octokit.rest.repos.listCommits({
          owner: 'GuidoGlielmi',
          repo: repoName,
          per_page: perPage,
          page,
        });

      const pageCount = this._responseLastPageExtractor(headers.link);
      return { resource: commits.map(this.mapCommit), pageCount };
    } catch (err) {
      throw new HttpException(HttpStatus[err.status], err.status);
    }
  }

  private _responseLastPageExtractor(linkHeader: string) {
    return +linkHeader.match(/.+page=(.+)>; rel="last"/)[1];
  }

  mapCommit(commit: TGithubCommit) {
    return commit.commit;
  }
}
