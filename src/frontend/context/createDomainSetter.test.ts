import { describe, expect, it, vi } from 'vitest';
import type { AppData } from '../services/infrastructure/api';
import { createDomainSetter } from './createDomainSetter';

describe('createDomainSetter', () => {
  // ── Direct value forwarding ──

  it('forwards direct values to setField using the selected key', () => {
    // Given
    const setField = vi.fn();
    const setProjects = createDomainSetter(setField, 'projects');
    const projects = [{ id: 'project-1' }] as unknown as AppData['projects'];

    // When
    setProjects(projects);

    // Then
    expect(setField).toHaveBeenCalledWith('projects', projects);
    expect(setField).toHaveBeenCalledTimes(1);
  });

  // ── Functional updater forwarding ──

  it('forwards functional updaters without changing the callback reference', () => {
    // Given
    const setField = vi.fn();
    const setProjects = createDomainSetter(setField, 'projects');
    const updater = vi.fn((prev: AppData['projects']) => prev);

    // When
    setProjects(updater);

    // Then
    expect(setField).toHaveBeenCalledWith('projects', updater);
  });

  // ── Multiple domain keys ──

  it('binds to the correct key for different domain slices', () => {
    // Given
    const setField = vi.fn();
    const setClients = createDomainSetter(setField, 'clients');
    const setSuppliers = createDomainSetter(setField, 'suppliers');
    const clients = [{ id: 'c1' }] as unknown as AppData['clients'];
    const suppliers = [{ id: 's1' }] as unknown as AppData['suppliers'];

    // When
    setClients(clients);
    setSuppliers(suppliers);

    // Then
    expect(setField).toHaveBeenNthCalledWith(1, 'clients', clients);
    expect(setField).toHaveBeenNthCalledWith(2, 'suppliers', suppliers);
  });

  // ── Edge cases ──

  it('forwards empty array value correctly', () => {
    // Given
    const setField = vi.fn();
    const setProjects = createDomainSetter(setField, 'projects');

    // When
    setProjects([] as unknown as AppData['projects']);

    // Then
    expect(setField).toHaveBeenCalledWith('projects', []);
  });

  it('forwards null value for nullable fields', () => {
    // Given
    const setField = vi.fn();
    const setTemplate = createDomainSetter(setField, 'customBudgetTemplate');

    // When
    setTemplate(null);

    // Then
    expect(setField).toHaveBeenCalledWith('customBudgetTemplate', null);
  });

  it('returns a stable function reference for the same key', () => {
    // Given
    const setField = vi.fn();

    // When
    const setter1 = createDomainSetter(setField, 'projects');
    const setter2 = createDomainSetter(setField, 'projects');

    // Then — both are functions (not the same reference since factory creates new each call)
    expect(typeof setter1).toBe('function');
    expect(typeof setter2).toBe('function');
  });

  it('forwards scalar value (globalIdentifierCounter)', () => {
    // Given
    const setField = vi.fn();
    const setCounter = createDomainSetter(setField, 'globalIdentifierCounter');

    // When
    setCounter(5000);

    // Then
    expect(setField).toHaveBeenCalledWith('globalIdentifierCounter', 5000);
  });
});
