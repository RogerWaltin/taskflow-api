import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';
import { ProjectsRepository } from './repositories/projects.repository.js';
import { InMemoryProjectsRepository } from './repositories/projects.repository.memory.js';
import { TasksRepositoryModule } from '../tasks/tasks-repository.module.js';

@Module({
  imports: [TasksRepositoryModule],
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    {
      provide: ProjectsRepository,
      useClass: InMemoryProjectsRepository,
    },
  ],
  exports: [ProjectsService],
})
export class ProjectsModule {}
