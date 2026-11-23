import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';
import { ProjectsRepository } from './repositories/projects.repository.js';
import { InMemoryProjectsRepository } from './repositories/projects.repository.memory.js';

@Module({
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    {
      provide: ProjectsRepository,
      useClass: InMemoryProjectsRepository,
    },
  ],
})
export class ProjectsModule {}
