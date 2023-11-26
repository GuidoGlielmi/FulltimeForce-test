import { Controller, Get, Inject, Query } from '@nestjs/common';
import { IVersionControl } from './external-services/version-control/interfaces';

@Controller()
export class AppController {
  constructor(
    @Inject(IVersionControl)
    private readonly versionControlService: IVersionControl,
  ) {}

  @Get()
  get(@Query() query: { repo_name: string; per_page?: number }) {
    return this.versionControlService.get(
      query.repo_name, // FulltimeForce-test
      query.per_page,
    );
  }
}
