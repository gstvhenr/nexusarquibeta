import { describe, expect, it } from 'vitest';
import { traverseAndModify, traverseAndCollect, addItemToTree, deleteRecursive } from './tree';
import { createTestDocumentFolder, createTestDocumentFile } from '../test/factories';
import type { DocumentFolder } from '../types';

const buildTree = (): DocumentFolder => {
  const file1 = createTestDocumentFile({ id: 'file-1', name: 'doc.pdf' });
  const file2 = createTestDocumentFile({ id: 'file-2', name: 'foto.jpg' });
  const childFolder = createTestDocumentFolder({
    id: 'child-folder',
    name: 'Subpasta',
    children: [file2],
  });
  return createTestDocumentFolder({
    id: 'personal-root',
    name: 'Pessoal',
    children: [file1, childFolder],
  });
};

describe('tree utils', () => {
  describe('traverseAndModify', () => {
    it('modifies items matching the predicate', () => {
      // Given
      const root = buildTree();

      // When
      const result = traverseAndModify(
        root,
        (item) => item.id === 'file-1',
        (item) => ({ ...item, name: 'renamed.pdf' }),
      );

      // Then
      expect(result.children[0].name).toBe('renamed.pdf');
      expect(result.children[1].name).toBe('Subpasta');
    });

    it('modifies items inside nested folders', () => {
      // Given
      const root = buildTree();

      // When
      const result = traverseAndModify(
        root,
        (item) => item.id === 'file-2',
        (item) => ({ ...item, name: 'nova-foto.jpg' }),
      );

      // Then
      const childFolder = result.children[1] as DocumentFolder;
      expect(childFolder.children[0].name).toBe('nova-foto.jpg');
    });

    it('preserves items that do not match predicate', () => {
      // Given
      const root = buildTree();

      // When
      const result = traverseAndModify(
        root,
        (item) => item.id === 'nonexistent',
        (item) => ({ ...item, name: 'never' }),
      );

      // Then
      expect(result.children[0].name).toBe('doc.pdf');
    });
  });

  describe('traverseAndCollect', () => {
    it('collects items matching predicate across nested structure', () => {
      // Given
      const root = buildTree();

      // When
      const result = traverseAndCollect(root.children, (item) => item.type === 'file');

      // Then
      expect(result).toHaveLength(2);
      expect(result.map((item) => item.id)).toContain('file-1');
      expect(result.map((item) => item.id)).toContain('file-2');
    });

    it('returns empty array when nothing matches', () => {
      // Given
      const root = buildTree();

      // When
      const result = traverseAndCollect(root.children, (item) => item.id === 'nonexistent');

      // Then
      expect(result).toEqual([]);
    });
  });

  describe('addItemToTree', () => {
    it('adds item to the correct parent folder', () => {
      // Given
      const root = buildTree();
      const newFile = createTestDocumentFile({ id: 'file-3', name: 'novo.pdf' });

      // When
      const result = addItemToTree(root, 'child-folder', newFile);

      // Then
      const childFolder = result.children[1] as DocumentFolder;
      expect(childFolder.children).toHaveLength(2);
      expect(childFolder.children[0].id).toBe('file-3');
    });

    it('rejects duplicate names in the same folder', () => {
      // Given
      const root = buildTree();
      const duplicateFile = createTestDocumentFile({ id: 'file-dup', name: 'doc.pdf' });

      // When
      const result = addItemToTree(root, 'personal-root', duplicateFile);

      // Then — folder unchanged
      expect(result.children).toHaveLength(2);
      expect(result.children.map((c) => c.id)).not.toContain('file-dup');
    });

    it('returns unchanged tree when parent id not found', () => {
      // Given
      const root = buildTree();
      const newFile = createTestDocumentFile({ id: 'file-4', name: 'orphan.pdf' });

      // When
      const result = addItemToTree(root, 'nonexistent-parent', newFile);

      // Then
      expect(result).toBe(root);
    });
  });

  describe('deleteRecursive', () => {
    it('deletes a file from root level', () => {
      // Given
      const root = buildTree();

      // When
      const result = deleteRecursive(root, 'file-1');

      // Then
      expect(result.children).toHaveLength(1);
      expect(result.children[0].id).toBe('child-folder');
    });

    it('deletes a file from nested folder', () => {
      // Given
      const root = buildTree();

      // When
      const result = deleteRecursive(root, 'file-2');

      // Then
      const childFolder = result.children[1] as DocumentFolder;
      expect(childFolder.children).toHaveLength(0);
    });

    it('deletes an entire sub-folder', () => {
      // Given
      const root = buildTree();

      // When
      const result = deleteRecursive(root, 'child-folder');

      // Then
      expect(result.children).toHaveLength(1);
      expect(result.children[0].id).toBe('file-1');
    });
  });
});
