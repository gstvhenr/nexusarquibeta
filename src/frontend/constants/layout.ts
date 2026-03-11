export const PAGE_HEADER_CONTENT_GAP = {
  none: 'mb-0',
  compact: 'mb-4',
  default: 'mb-6',
  spacious: 'mb-8',
} as const;

export type PageHeaderContentGap = keyof typeof PAGE_HEADER_CONTENT_GAP;
