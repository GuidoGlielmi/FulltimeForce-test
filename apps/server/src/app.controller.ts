import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { IVersionControl } from './external-services/version-control/interfaces';
import { GetCommitQueryDTO } from './dto/query/GetCommit';
import { GetCommitParamsDTO } from './dto/params/GetCommit';

@Controller()
export class AppController {
  constructor(
    @Inject(IVersionControl)
    private readonly versionControlService: IVersionControl,
  ) {}

  @Get('/:repoName')
  async get(
    @Param() { repoName }: GetCommitParamsDTO,
    @Query()
    { per_page, page }: GetCommitQueryDTO,
  ) {
    return this.versionControlService.get(repoName, page, per_page);
  }
}
