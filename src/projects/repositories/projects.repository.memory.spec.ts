
import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryProjectsRepository } from './projects.repository.memory.js';

describe('InMemoryProjectsRepository', () => {
  let repository: InMemoryProjectsRepository;

  const orgA = '11111111-1111-4111-8111-111111111111';
  const orgB = '22222222-2222-4222-8222-222222222222';

  beforeEach(() => {
    repository = new InMemoryProjectsRepository();
  });

  // CREATE
  it('should create a project', async () => {
    const project = await repository.create(orgA, {
      key: 'TF',
      name: 'TaskFlow',
      description: 'Project management platform',
    });

    expect(project.id).toBeDefined();
    expect(project.key).toBe('TF');
    expect(project.name).toBe('TaskFlow');
    expect(project.status).toBe('ACTIVE');
    expect(project.organizationId).toBe(orgA);
  });

  // FIND
  it('should retrieve a project by ID', async () => {
    const created = await repository.create(orgA, {
      key: 'TF',
      name: 'TaskFlow',
    });

    const retrieved = await repository.findById(orgA, created.id);

    expect(retrieved).toEqual(created);
  });

  it('should return null for a nonexistent project', async () => {
    const result = await repository.findById(orgA, 'nonexistent-id');

    expect(result).toBeNull();
  });

  it('should prevent one organization from accessing another organization\'s project', async () => {
    const project = await repository.create(orgA, {
      key: 'TF',
      name: 'TaskFlow',
    });

    const result = await repository.findById(orgB, project.id);

    expect(result).toBeNull();
  });

  // LIST
  it('should list only projects belonging to the requested organization', async () => {
    await repository.create(orgA, { key: 'TF', name: 'TaskFlow' });
    await repository.create(orgB, { key: 'CRM', name: 'CRM' });

    const projects = await repository.list(orgA, {});

    expect(projects).toHaveLength(1);
    expect(projects[0].key).toBe('TF');
  });

  it('should filter projects by status', async () => {
    const active = await repository.create(orgA, {
      key: 'TF',
      name: 'TaskFlow',
    });

    await repository.update(orgA, active.id, { status: 'ARCHIVED' });

    await repository.create(orgA, {
      key: 'CRM',
      name: 'CRM',
    });

    const archived = await repository.list(orgA, {
      status: 'ARCHIVED',
    });

    expect(archived).toHaveLength(1);
    expect(archived[0].key).toBe('TF');
  });

  it('should list newest projects first', async () => {
  const first = await repository.create(orgA, {
    key: 'TF',
    name: 'TaskFlow',
  });

  // Give the second project a later timestamp.
  await new Promise((resolve) => setTimeout(resolve, 5));

  const second = await repository.create(orgA, {
    key: 'CRM',
    name: 'CRM',
  });

  const projects = await repository.list(orgA, {});

  expect(projects[0].id).toBe(second.id);
  expect(projects[1].id).toBe(first.id);
});

  // UPDATE
  it('should update project fields', async () => {
    const project = await repository.create(orgA, {
      key: 'TF',
      name: 'TaskFlow',
    });

    const updated = await repository.update(orgA, project.id, {
      name: 'Updated TaskFlow',
      description: 'Updated description',
    });

    expect(updated?.name).toBe('Updated TaskFlow');
    expect(updated?.description).toBe('Updated description');
  });

  it('should preserve fields that are not included in the patch', async () => {
    const project = await repository.create(orgA, {
      key: 'TF',
      name: 'TaskFlow',
      description: 'Original description',
    });

    const updated = await repository.update(orgA, project.id, {
      name: 'Updated TaskFlow',
    });

    expect(updated?.description).toBe('Original description');
    expect(updated?.key).toBe('TF');
    expect(updated?.organizationId).toBe(orgA);
  });

  it('should allow clearing the description with null', async () => {
    const project = await repository.create(orgA, {
      key: 'TF',
      name: 'TaskFlow',
      description: 'Original description',
    });

    const updated = await repository.update(orgA, project.id, {
      description: null,
    });

    expect(updated?.description).toBeNull();
  });

  it('should return null when updating a nonexistent project', async () => {
    const result = await repository.update(orgA, 'nonexistent-id', {
      name: 'Updated',
    });

    expect(result).toBeNull();
  });

  it('should preserve updatedAt when nothing changes', async () => {
    const project = await repository.create(orgA, {
      key: 'TF',
      name: 'TaskFlow',
    });

    const updated = await repository.update(orgA, project.id, {
      name: 'TaskFlow',
    });

    expect(updated?.updatedAt).toBe(project.updatedAt);
  });

  // DELETE
  it('should delete a project', async () => {
    const project = await repository.create(orgA, {
      key: 'TF',
      name: 'TaskFlow',
    });

    const deleted = await repository.delete(orgA, project.id);
    const retrieved = await repository.findById(orgA, project.id);

    expect(deleted).toBe(true);
    expect(retrieved).toBeNull();
  });

  it('should return false when deleting a nonexistent project', async () => {
    const result = await repository.delete(orgA, 'nonexistent-id');

    expect(result).toBe(false);
  });

  it('should not allow one organization to delete another organization\'s project', async () => {
    const project = await repository.create(orgA, {
      key: 'TF',
      name: 'TaskFlow',
    });

    const result = await repository.delete(orgB, project.id);

    expect(result).toBe(false);
    expect(await repository.findById(orgA, project.id)).toEqual(project);
  });
});
