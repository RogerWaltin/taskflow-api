import type { TaskResponseDto } from './dto/task-response.dto.js';
import type { Task } from './tasks.types.js';

export function toTaskResponse(
  task: Task,
  projectKey: string,
): TaskResponseDto {
  return {
    id: task.id,
    projectId: task.projectId,
    number: task.number,
    key: `${projectKey}-${task.number}`,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assigneeId: task.assigneeId,
    dueDate: task.dueDate,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}
