/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'This dependency is part of a circular relationship.',
      from: { pathNot: 'src/services/infrastructure/(loadData|autoBackupService)' },
      to: { circular: true, dependencyTypesNot: ['type-only'] },
    },
    {
      name: 'no-circular-infra-known',
      severity: 'warn',
      comment: 'Known type-only cycle between loadData and autoBackupService (acceptable).',
      from: { path: 'src/services/infrastructure/(loadData|autoBackupService)' },
      to: { circular: true },
    },
    {
      name: 'no-orphans',
      comment: 'This is an orphan module - it is likely not used.',
      severity: 'warn',
      from: {
        orphan: true,
        pathNot: [
          '\\.d\\.ts$',
          '\\.test\\.(ts|tsx)$',
          'setup\\.ts$',
          'src/services/infrastructure/storageService\\.ts$',
        ],
      },
      to: {},
    },
    {
      name: 'not-to-unresolvable',
      comment: 'This module depends on a module that cannot be found.',
      severity: 'error',
      from: { pathNot: '^src/vite-env\\.d\\.ts$' },
      to: { couldNotResolve: true },
    },
    {
      name: 'services-not-to-ui',
      comment:
        'Services MUST NOT depend on UI components or pages. Services contain pure business logic.',
      severity: 'error',
      from: { path: '^src/services' },
      to: { path: '^src/(components|pages)/' },
    },
    {
      name: 'types-not-to-implementation',
      comment: 'Types should ideally not depend on implementation files.',
      severity: 'warn',
      from: { path: '^src/types' },
      to: { pathNot: '^src/types' },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
      dependencyTypes: ['npm', 'npm-dev', 'npm-optional', 'npm-peer', 'npm-bundled', 'npm-no-pkg'],
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+',
      },
    },
  },
};
