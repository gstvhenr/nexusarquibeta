import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DocumentIcons } from './DocumentIcons';

function renderIconMarkup(type: string): string {
  const { container, unmount } = render(<DocumentIcons.GetIcon type={type} className="doc-icon" />);
  const svg = container.querySelector('svg');
  const markup = svg?.innerHTML ?? '';
  unmount();
  return markup;
}

describe('DocumentIcons', () => {
  it('resolves mime types and falls back to default for unknown values', () => {
    const pdfFromMime = renderIconMarkup('application/pdf');
    const pdfFromExt = renderIconMarkup('pdf');
    const fallbackUnknown = renderIconMarkup('application/unknown-type');
    const fallbackDefault = renderIconMarkup('default');

    expect(pdfFromMime).toBe(pdfFromExt);
    expect(fallbackUnknown).toBe(fallbackDefault);
  });

  it('distinguishes folder and project folder visuals', () => {
    const folderMarkup = renderIconMarkup('folder');
    const projectFolderMarkup = renderIconMarkup('projectfolder');

    expect(projectFolderMarkup).not.toBe(folderMarkup);
    expect(projectFolderMarkup).toContain('<circle');
  });

  it('renders action icons with custom className', () => {
    const iconKeys = [
      'Folder',
      'ProjectFolder',
      'Home',
      'Trash',
      'Search',
      'Add',
      'Upload',
      'Empty',
      'Open',
      'Rename',
      'Manage',
    ] as const;

    for (const key of iconKeys) {
      const IconComponent = DocumentIcons[key];
      const { container, unmount } = render(<IconComponent className="icon-action" />);
      const svg = container.querySelector('svg');
      expect(svg, `${key} should render an svg`).not.toBeNull();
      expect(svg).toHaveClass('icon-action');
      unmount();
    }
  });
});
