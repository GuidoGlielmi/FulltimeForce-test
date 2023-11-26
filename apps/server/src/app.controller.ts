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
  get(
    @Param() { repoName }: GetCommitParamsDTO,
    @Query()
    { per_page }: GetCommitQueryDTO,
  ) {
    return this.versionControlService.get(
      repoName, // FulltimeForce-test
      per_page,
    );
  }
}
