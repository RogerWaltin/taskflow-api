import { Module } from '@nestjs/common';
import { TasksRepository } from './Repositories/tasks.repository.js';
import { InMemoryTasksRepository } from './Repositories/tasks.repository.memory.js';

@Module({
  providers: [
    {
      provide: TasksRepository,
      useClass: InMemoryTasksRepository,
    },
  ],
  exports: [TasksRepository],
})
export class TasksRepositoryModule {}
