/** @type {import('jest').Config} */
module.exports = {
    // Utilise ts-jest pour transpiler TypeScript
    preset: 'ts-jest',

    // Environnement de test (Node.js pour une API)
    testEnvironment: 'node',

    // Dossier racine des sources
    roots: ['<rootDir>/src'],

    // Pattern pour trouver les fichiers de test
    testMatch: [
        '**/__tests__/**/*.test.ts',
        '**/*.spec.ts'
    ],

    // Extensions de fichiers
    moduleFileExtensions: ['ts', 'js', 'json'],

    // Mapping des modules (pour les imports absolus)
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },

    // Fichiers à ignorer
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/'
    ],

    // Coverage (couverture de code)
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/**/index.ts',
        '!src/docs/**',
        '!src/types/**'
    ],

    // Seuils de couverture (optionnel, à ajuster)
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50
        }
    },

    // Répertoire de sortie pour les rapports de couverture
    coverageDirectory: 'coverage',

    // Transformations
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            tsconfig: 'tsconfig.json'
        }]
    },

    // Configuration de setup (si besoin)
    // setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],

    // Verbose pour plus de détails
    verbose: true,

    // Timeout par test (en ms)
    testTimeout: 10000,

    // Clear mocks entre les tests
    clearMocks: true,

    // Force exit après les tests
    forceExit: true
};
