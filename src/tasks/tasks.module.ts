import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module.js';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';
import { TasksRepositoryModule } from './tasks-repository.module.js';
import { PaginationOptionsPipe } from '../common/pipes/pagination-options.pipe.js';

@Module({
  imports: [ProjectsModule, TasksRepositoryModule],
  controllers: [TasksController],
  providers: [TasksService, PaginationOptionsPipe],
})
export class TasksModule {}
