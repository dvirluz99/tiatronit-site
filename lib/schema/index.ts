export * from './common';
export * from './show';
export * from './collection';
export * from './recommendation';
export * from './page';
export * from './setting';
export { LABELS } from './labels';

export const V2_COLLECTIONS = {
  shows: 'shows_v2',
  collections: 'collections_v2',
  recommendations: 'recommendations_v2',
  pages: 'pages_v2',
  settings: 'settings_v2',
} as const;

export const V1_COLLECTIONS = {
  shows: 'shows',
  collections: 'collections',
  recommendations: 'recommendations',
  pages: 'pages',
  settings: 'settings',
} as const;
