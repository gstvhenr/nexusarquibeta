import type { DocumentFolder, DocumentItem } from '../types';

export const traverseAndModify = (
  root: DocumentFolder,
  predicate: (item: DocumentItem) => boolean,
  modifier: (item: DocumentItem) => DocumentItem,
): DocumentFolder => {
  const newChildren = root.children.map((child) => {
    if (predicate(child)) return modifier(child);
    if (child.type === 'folder') return traverseAndModify(child, predicate, modifier);
    return child;
  });
  if (root.id !== 'personal-root' && root.id !== 'projects-root' && predicate(root)) {
    return modifier(root) as DocumentFolder;
  }
  return { ...root, children: newChildren, dateModified: new Date().toISOString() };
};

export const traverseAndCollect = (
  items: DocumentItem[],
  predicate: (item: DocumentItem) => boolean,
): DocumentItem[] => {
  let results: DocumentItem[] = [];
  for (const item of items) {
    if (predicate(item)) {
      results.push(item);
    }
    if (item.type === 'folder') {
      results = [...results, ...traverseAndCollect(item.children, predicate)];
    }
  }
  return results;
};

export const addItemToTree = (
  folder: DocumentFolder,
  parentId: string,
  item: DocumentItem,
): DocumentFolder => {
  if (folder.id === parentId) {
    if (folder.children.some((child) => child.name.toLowerCase() === item.name.toLowerCase())) {
      console.warn(`An item with the name "${item.name}" already exists in this folder.`);
      return folder;
    }
    return {
      ...folder,
      children: [item, ...folder.children],
      dateModified: new Date().toISOString(),
    };
  }
  let itemAdded = false;
  const newChildren = folder.children.map((child) => {
    if (child.type === 'folder') {
      const updatedChild = addItemToTree(child, parentId, item);
      if (updatedChild !== child) {
        itemAdded = true;
        return updatedChild;
      }
    }
    return child;
  });
  if (itemAdded) {
    return { ...folder, children: newChildren, dateModified: new Date().toISOString() };
  }
  return folder;
};

export const deleteRecursive = (root: DocumentFolder, id: string): DocumentFolder => ({
  ...root,
  children: root.children
    .filter((c) => c.id !== id)
    .map((c) => (c.type === 'folder' ? deleteRecursive(c, id) : c)),
});
