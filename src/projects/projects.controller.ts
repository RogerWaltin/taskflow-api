import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { ProjectsService } from './projects.service.js';
import type {
  NewProject,
  ProjectPatch,
  ProjectStatus,
} from './projects.types.js';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
  ) {}

  @Get()
  fetchProjects(
    @Headers('x-org-id') orgId: string,
    @Query('status') status?: ProjectStatus,
  ) {
    return this.projectsService.fetchProjects(orgId, { status });
  }

  @Get(':id')
  fetchProject(
    @Headers('x-org-id') orgId: string,
    @Param('id') id: string,
  ) {
    return this.projectsService.fetchOne(orgId, id);
  }

  @Post()
  createProject(
    @Headers('x-org-id') orgId: string,
    @Body() payload: NewProject,
  ) {
    return this.projectsService.createProject(orgId, payload);
  }

  @Patch(':id')
  updateProject(
    @Headers('x-org-id') orgId: string,
    @Param('id') id: string,
    @Body() payload: ProjectPatch,
  ) {
    return this.projectsService.updateProject(orgId, id, payload);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteProject(
    @Headers('x-org-id') orgId: string,
    @Param('id') id: string,
  ) {
    return this.projectsService.deleteProject(orgId, id);
  }
}