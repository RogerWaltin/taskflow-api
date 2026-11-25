import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';

import { TasksService } from './tasks.service.js';

import type {
  NewTask,
  TaskFilters,
  TaskPatch,
} from './tasks.types.js';
import { OrgId } from '../common/decorators/org-id.decorator.js';

@Controller()
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
  ) {}

  @Post('projects/:projectId/tasks')
  async createTask(
    @OrgId() orgId: string,
    @Param('projectId', new ParseUUIDPipe({ version: '4' }))
    projectId: string,
    @Body() payload: NewTask,
    @Res({ passthrough: true }) response: Response,
  ) {
    const task = await this.tasksService.createTask(
      orgId,
      projectId,
      payload,
    );

    response.setHeader('Location', `/api/v1/tasks/${task.id}`);
    return task;
  }

  @Get('projects/:projectId/tasks')
  getProjectTasks(
    @OrgId() orgId: string,
    @Param('projectId', new ParseUUIDPipe({ version: '4' }))
    projectId: string,
    @Query() filters: TaskFilters,
  ) {
    // Forward the whole query object so the service can reject unsupported keys.
    return this.tasksService.getProjectTasks(
      orgId,
      projectId,
      filters,
    );
  }

  @Get('tasks/:taskId')
  getTask(
    @OrgId() orgId: string,
    @Param('taskId', new ParseUUIDPipe({ version: '4' }))
    taskId: string,
  ) {
    return this.tasksService.getTask(orgId, taskId);
  }

  @Patch('tasks/:taskId')
  updateTask(
    @OrgId() orgId: string,
    @Param('taskId', new ParseUUIDPipe({ version: '4' }))
    taskId: string,
    @Body() payload: TaskPatch,
  ) {
    return this.tasksService.updateTask(
      orgId,
      taskId,
      payload,
    );
  }

  @Delete('tasks/:taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTask(
    @OrgId() orgId: string,
    @Param('taskId', new ParseUUIDPipe({ version: '4' }))
    taskId: string,
  ): Promise<void> {
    return this.tasksService.deleteTask(orgId, taskId);
  }
}