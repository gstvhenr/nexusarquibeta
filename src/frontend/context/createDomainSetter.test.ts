import { describe, expect, it, vi } from 'vitest';
import type { AppData } from '../services/infrastructure/api';
import { createDomainSetter } from './createDomainSetter';

describe('createDomainSetter', () => {
  it('forwards direct values to setField using the selected key', () => {
    const setField = vi.fn();
    const setProjects = createDomainSetter(setField, 'projects');
    const projects = [{ id: 'project-1' }] as unknown as AppData['projects'];

    setProjects(projects);

    expect(setField).toHaveBeenCalledWith('projects', projects);
  });

  it('forwards functional updaters without changing the callback reference', () => {
    const setField = vi.fn();
    const setProjects = createDomainSetter(setField, 'projects');
    const updater = vi.fn((prev: AppData['projects']) => prev);

    setProjects(updater);

    expect(setField).toHaveBeenCalledWith('projects', updater);
  });
});
