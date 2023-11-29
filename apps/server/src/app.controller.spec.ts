import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { GithubModule } from './external-services/version-control/github/github.module';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      imports: [GithubModule],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return a filled array', async () => {
      const response = await appController.get(
        { repoName: 'FulltimeForce-test' },
        { per_page: 5, page: 1 },
      );
      expect(response.resource.length).toBeGreaterThan(0);
    });
  });
});
