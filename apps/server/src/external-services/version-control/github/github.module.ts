import { Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { IVersionControl } from '../interfaces';

@Module({
  providers: [
    {
      provide: IVersionControl,
      useClass: GithubService,
    },
  ],
  exports: [IVersionControl],
})
export class GithubModule {}
