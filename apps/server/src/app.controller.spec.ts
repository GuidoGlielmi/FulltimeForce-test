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
    it('should return "Hello World!"', async () => {
      const response = await appController.get({
        repo_name: 'FulltimeForce-test',
      });
      expect(response).toBeGreaterThan(0);
    });
  });
});
