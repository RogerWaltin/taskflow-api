
import {
  BadRequestException,
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
} from '@nestjs/common';

import { OrgId } from '../common/decorators/org-id.decorator.js';
import { ProjectsService } from './projects.service.js';

import type {
  NewProject,
  ProjectPatch,
  ProjectStatus,
} from './projects.types.js';

const UPDATABLE_PROJECT_FIELDS = new Set<keyof ProjectPatch>([
  'name',
  'description',
  'status',
]);

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
  ) {}

  @Get()
  fetchProjects(
    @OrgId() orgId: string,
    @Query('status') status?: ProjectStatus,
  ) {
    return this.projectsService.fetchProjects(orgId, { status });
  }

  @Get(':id')
  fetchProject(
    @OrgId() orgId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
  ) {
    return this.projectsService.fetchOne(orgId, id);
  }

  @Post()
  createProject(
    @OrgId() orgId: string,
    @Body() payload: NewProject,
  ) {
    return this.projectsService.createProject(orgId, payload);
  }

  @Patch(':id')
  updateProject(
    @OrgId() orgId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
    @Body() payload: ProjectPatch,
  ) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new BadRequestException('Request body must be an object');
    }

    const invalidField = Object.keys(payload).find(
      (field) => !UPDATABLE_PROJECT_FIELDS.has(field as keyof ProjectPatch),
    );

    if (invalidField) {
      throw new BadRequestException(
        `${invalidField} is not an updatable project field`,
      );
    }

    return this.projectsService.updateProject(orgId, id, payload);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteProject(
    @OrgId() orgId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
  ) {
    return this.projectsService.deleteProject(orgId, id);
  }
}
