import { Injectable } from '@nestjs/common';
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

  async get(repoName: string, perPage = 5) {
    const { data: commits } = await this.octokit.rest.repos.listCommits({
      owner: 'GuidoGlielmi',
      repo: repoName,
      per_page: perPage,
    });
    return commits.map(this.mapCommit);
  }

  mapCommit(commit: TGithubCommit) {
    return commit.commit;
  }
}