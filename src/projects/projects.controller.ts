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
} from '@nestjs/common';

import { OrgId } from '../common/decorators/org-id.decorator.js';
import type { PaginatedResponseDto } from '../common/pagination.js';
import { PaginationOptionsPipe } from '../common/pipes/pagination-options.pipe.js';
import { ProjectsService } from './projects.service.js';

import { CreateProjectDto } from './dto/create-project.dto.js';
import { ProjectFiltersDto } from './dto/project-filters.dto.js';
import type { ProjectResponseDto } from './dto/project-response.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  fetchProjects(
    @OrgId() orgId: string,
    @Query(PaginationOptionsPipe) filters: ProjectFiltersDto,
  ): Promise<PaginatedResponseDto<ProjectResponseDto>> {
    return this.projectsService.fetchProjects(orgId, filters);
  }

  @Get(':id')
  fetchProject(
    @OrgId() orgId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.fetchOne(orgId, id);
  }

  @Post()
  createProject(
    @OrgId() orgId: string,
    @Body() payload: CreateProjectDto,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.createProject(orgId, payload);
  }

  @Patch(':id')
  updateProject(
    @OrgId() orgId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
    @Body() payload: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
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
