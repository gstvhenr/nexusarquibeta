import { describe, expect, it } from 'vitest';
import {
  getAllowedAddendumStatusTransitions,
  canTransitionAddendumStatus,
  getStatusSelectionOptions,
} from './addendumWorkflow';
import type { ContractAddendumStatus } from '../types';

describe('addendumWorkflow', () => {
  describe('getAllowedAddendumStatusTransitions', () => {
    it('returns valid transitions from Rascunho', () => {
      // Given
      const status: ContractAddendumStatus = 'Rascunho';

      // When
      const result = getAllowedAddendumStatusTransitions(status);

      // Then
      expect(result).toEqual(['Pendente', 'Rejeitado']);
    });

    it('returns valid transitions from Pendente', () => {
      // Given
      const status: ContractAddendumStatus = 'Pendente';

      // When
      const result = getAllowedAddendumStatusTransitions(status);

      // Then
      expect(result).toEqual(['Rascunho', 'Aprovado', 'Rejeitado']);
    });

    it('returns valid transitions from Aprovado', () => {
      // Given
      const status: ContractAddendumStatus = 'Aprovado';

      // When
      const result = getAllowedAddendumStatusTransitions(status);

      // Then
      expect(result).toEqual(['Faturado', 'Rejeitado']);
    });

    it('returns empty array for Faturado (terminal state)', () => {
      // Given
      const status: ContractAddendumStatus = 'Faturado';

      // When
      const result = getAllowedAddendumStatusTransitions(status);

      // Then
      expect(result).toEqual([]);
    });

    it('returns Rascunho as only transition from Rejeitado', () => {
      // Given
      const status: ContractAddendumStatus = 'Rejeitado';

      // When
      const result = getAllowedAddendumStatusTransitions(status);

      // Then
      expect(result).toEqual(['Rascunho']);
    });
  });

  describe('canTransitionAddendumStatus', () => {
    it('allows self-transition (same status)', () => {
      // Given / When / Then
      expect(canTransitionAddendumStatus('Rascunho', 'Rascunho')).toBe(true);
      expect(canTransitionAddendumStatus('Faturado', 'Faturado')).toBe(true);
    });

    it('allows valid transition', () => {
      // Given / When / Then
      expect(canTransitionAddendumStatus('Rascunho', 'Pendente')).toBe(true);
      expect(canTransitionAddendumStatus('Pendente', 'Aprovado')).toBe(true);
      expect(canTransitionAddendumStatus('Aprovado', 'Faturado')).toBe(true);
    });

    it('rejects invalid transition', () => {
      // Given / When / Then
      expect(canTransitionAddendumStatus('Rascunho', 'Faturado')).toBe(false);
      expect(canTransitionAddendumStatus('Faturado', 'Rascunho')).toBe(false);
      expect(canTransitionAddendumStatus('Rejeitado', 'Aprovado')).toBe(false);
    });
  });

  describe('getStatusSelectionOptions', () => {
    it('includes current status plus allowed transitions', () => {
      // Given
      const status: ContractAddendumStatus = 'Pendente';

      // When
      const result = getStatusSelectionOptions(status);

      // Then
      expect(result).toContain('Pendente');
      expect(result).toContain('Rascunho');
      expect(result).toContain('Aprovado');
      expect(result).toContain('Rejeitado');
      expect(result).toHaveLength(4);
    });

    it('returns only current status for terminal state', () => {
      // Given
      const status: ContractAddendumStatus = 'Faturado';

      // When
      const result = getStatusSelectionOptions(status);

      // Then
      expect(result).toEqual(['Faturado']);
    });
  });
});
