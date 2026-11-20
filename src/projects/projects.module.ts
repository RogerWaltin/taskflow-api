import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';
import { ProjectsRepository } from './projects.repository.js';
import { ProjectsRepositoryStub } from './projects.repository.stub.js';

@Module({
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    {
      provide: ProjectsRepository,
      useClass: ProjectsRepositoryStub,
    },
  ],
})
export class ProjectsModule {}