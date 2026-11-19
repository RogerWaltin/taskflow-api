import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ProjectsService } from './projects.service.js';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  fetchProjects() {
    return this.projectsService.fetchProjects();
  }

  @Get(':id')
  fetchProject(@Param('id') id: string) {
    return this.projectsService.fetchOne(id);
  }

  @Post()
  createProject(@Body() payload: Record<string, unknown>) {
    return this.projectsService.createProject(payload);
  }

  @Patch(':id')
  updateProject(
    @Body() payload: Record<string, unknown>,
    @Param('id') id: string,
  ) {
    return this.projectsService.updateProject(id, payload);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteProject(@Param('id') id: string) {
    return this.projectsService.deleteProject(id);
  }
}
