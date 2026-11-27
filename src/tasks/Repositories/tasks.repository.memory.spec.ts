import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryTasksRepository } from './tasks.repository.memory.js';

describe('InMemoryTasksRepository', () => {
  const orgA = '11111111-1111-4111-8111-111111111111';
  const orgB = '22222222-2222-4222-8222-222222222222';
  const projectA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const projectB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  let repo: InMemoryTasksRepository;
  beforeEach(() => { repo = new InMemoryTasksRepository(); });

  it('creates a task with defaults and the supplied task number', () => {
    const task = repo.create(orgA, projectA, 4, { title: 'First task' });
    expect(task).toMatchObject({ organizationId: orgA, projectId: projectA, number: 4, title: 'First task', status: 'TODO', priority: 'MEDIUM', description: null, assigneeId: null, dueDate: null });
    expect(task.id).toBeTruthy();
    expect(task.createdAt).toBe(task.updatedAt);
  });

  it('stores optional values supplied during creation', () => {
    const task = repo.create(orgA, projectA, 1, { title: 'Task', description: 'Details', priority: 'URGENT', assigneeId: 'user-1', dueDate: '2026-12-01' });
    expect(task).toMatchObject({ description: 'Details', priority: 'URGENT', assigneeId: 'user-1', dueDate: '2026-12-01' });
  });

  it('finds a task by ID for its organization', () => {
    const task = repo.create(orgA, projectA, 1, { title: 'Task' });
    expect(repo.findById(orgA, task.id)).toEqual(task);
  });

  it('returns null for a missing task or another organization', () => {
    const task = repo.create(orgA, projectA, 1, { title: 'Task' });
    expect(repo.findById(orgA, 'missing')).toBeNull();
    expect(repo.findById(orgB, task.id)).toBeNull();
  });

  it('lists only tasks belonging to the specified project and organization', () => {
    repo.create(orgA, projectA, 1, { title: 'A1' });
    repo.create(orgA, projectB, 1, { title: 'B1' });
    repo.create(orgB, projectA, 2, { title: 'Other org' });
    expect(
      repo.findByProject(orgA, projectA, { page: 1, limit: 20 }).items.map((task) => task.title),
    ).toEqual(['A1']);
  });

  it('sorts project tasks by descending task number', () => {
    repo.create(orgA, projectA, 1, { title: 'One' });
    repo.create(orgA, projectA, 3, { title: 'Three' });
    repo.create(orgA, projectA, 2, { title: 'Two' });
    expect(
      repo.findByProject(orgA, projectA, { page: 1, limit: 20 }).items.map((task) => task.number),
    ).toEqual([3, 2, 1]);
  });

  it('filters tasks by status, priority, and assignee', () => {
    const first = repo.create(orgA, projectA, 1, { title: 'First', priority: 'HIGH', assigneeId: 'user-1' });
    repo.update(orgA, first.id, { status: 'IN_PROGRESS' });
    repo.create(orgA, projectA, 2, { title: 'Second', priority: 'LOW', assigneeId: 'user-2' });
    expect(
      repo.findByProject(orgA, projectA, {
        status: 'IN_PROGRESS',
        page: 1,
        limit: 20,
      }).items,
    ).toHaveLength(1);
    expect(
      repo.findByProject(orgA, projectA, { priority: 'LOW', page: 1, limit: 20 }).items.map((task) => task.title),
    ).toEqual(['Second']);
    expect(
      repo.findByProject(orgA, projectA, {
        assigneeId: 'user-1',
        page: 1,
        limit: 20,
      }).items.map((task) => task.title),
    ).toEqual(['First']);
    expect(
      repo.findByProject(orgA, projectA, {
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assigneeId: 'user-1',
        page: 1,
        limit: 20,
      }).items,
    ).toHaveLength(1);
  });

  it('returns page slices and the total matching task count', () => {
    for (let index = 1; index <= 57; index += 1) {
      repo.create(orgA, projectA, index, { title: `Task ${index}` });
    }

    const page1 = repo.findByProject(orgA, projectA, { page: 1, limit: 20 });
    const page2 = repo.findByProject(orgA, projectA, { page: 2, limit: 20 });
    const page3 = repo.findByProject(orgA, projectA, { page: 3, limit: 20 });
    const page4 = repo.findByProject(orgA, projectA, { page: 4, limit: 20 });
    const noResults = repo.findByProject(orgB, projectA, {
      page: 1,
      limit: 20,
    });

    expect(page1.items).toHaveLength(20);
    expect(page1.total).toBe(57);
    expect(page2.items).toHaveLength(20);
    expect(page2.total).toBe(57);
    expect(page3.items).toHaveLength(17);
    expect(page3.total).toBe(57);
    expect(page4).toEqual({ items: [], total: 57 });
    expect(noResults).toEqual({ items: [], total: 0 });
  });

  it('updates supplied fields and updatedAt', async () => {
    const task = repo.create(orgA, projectA, 1, { title: 'Original' });
    await new Promise((resolve) => setTimeout(resolve, 2));
    const updated = repo.update(orgA, task.id, { title: 'Changed', status: 'IN_PROGRESS' });
    expect(updated).toMatchObject({ title: 'Changed', status: 'IN_PROGRESS' });
    expect(updated?.updatedAt).not.toBe(task.updatedAt);
  });

  it('preserves fields not included in an update', () => {
    const task = repo.create(orgA, projectA, 1, { title: 'Original', description: 'Keep me' });
    const updated = repo.update(orgA, task.id, { title: 'Changed' });
    expect(updated?.description).toBe('Keep me');
    expect(updated?.priority).toBe('MEDIUM');
  });

  it('ignores undefined values in an update', () => {
    const task = repo.create(orgA, projectA, 1, {
      title: 'Original',
      description: 'Keep me',
      priority: 'HIGH',
      assigneeId: 'user-1',
      dueDate: '2026-12-31',
    });
    const updated = repo.update(orgA, task.id, {
      title: 'Changed',
      description: undefined,
      priority: undefined,
      assigneeId: undefined,
      dueDate: undefined,
    });
    expect(updated).toMatchObject({
      title: 'Changed',
      description: 'Keep me',
      priority: 'HIGH',
      assigneeId: 'user-1',
      dueDate: '2026-12-31',
    });
  });

  it('applies explicitly supplied null values', () => {
    const task = repo.create(orgA, projectA, 1, {
      title: 'Original',
      description: 'Keep me',
      assigneeId: 'user-1',
    });
    const updated = repo.update(orgA, task.id, {
      description: null,
      assigneeId: null,
    });
    expect(updated).toMatchObject({ description: null, assigneeId: null });
  });

  it('returns null when updating a missing or foreign task', () => {
    expect(repo.update(orgA, 'missing', { title: 'Changed' })).toBeNull();
    const task = repo.create(orgA, projectA, 1, { title: 'Task' });
    expect(repo.update(orgB, task.id, { title: 'Changed' })).toBeNull();
  });

  it('deletes a task belonging to the organization', () => {
    const task = repo.create(orgA, projectA, 1, { title: 'Task' });
    expect(repo.delete(orgA, task.id)).toBe(true);
    expect(repo.findById(orgA, task.id)).toBeNull();
  });

  it('does not delete a task belonging to another organization', () => {
    const task = repo.create(orgA, projectA, 1, { title: 'Task' });
    expect(repo.delete(orgB, task.id)).toBe(false);
    expect(repo.findById(orgA, task.id)).not.toBeNull();
  });

  it('deletes all tasks for one project and organization only', () => {
    const sameProject = repo.create(orgA, projectA, 1, { title: 'Delete me' });
    const otherProject = repo.create(orgA, projectB, 1, { title: 'Keep project' });
    const otherOrg = repo.create(orgB, projectA, 1, { title: 'Keep org' });
    repo.deleteByProject(orgA, projectA);
    expect(repo.findById(orgA, sameProject.id)).toBeNull();
    expect(repo.findById(orgA, otherProject.id)).not.toBeNull();
    expect(repo.findById(orgB, otherOrg.id)).not.toBeNull();
  });
});
