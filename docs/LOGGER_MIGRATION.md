# Winston Logger - Guide de Migration

## ✅ Configuration Terminée

Winston a été installé et configuré avec:
- **Console** colorée en développement
- **Fichiers de log** avec rotation quotidienne en production
- **Niveaux**: `error`, `warn`, `info`, `http`, `debug`
- **Métadonnées** automatiques (timestamp, service)

## 📁 Structure des fichiers de log

```
logs/
├── combined-2024-12-12.log    # Tous les logs
├── error-2024-12-12.log       # Erreurs seulement
├── http-2024-12-12.log        # Logs HTTP
└── *.gz                        # Archives compressées
```

## 🔧 Fichiers Mis à Jour

- [x] `src/utils/logger.ts` - Configuration Winston
- [x] `src/middlewares/httpLogger.middleware.ts` - Middleware HTTP
- [x] `src/app.ts` - Application Express
- [x] `src/server.ts` - Démarrage serveur
- [x] `src/middlewares/identity.middleware.ts`
- [x] `src/middlewares/access.middleware.ts`
- [x] `src/utils/index.ts` - Export du logger

## 📝 Comment utiliser le logger

### Import simple
```typescript
import logger from '../utils/logger';

logger.info('Message informatif');
logger.error('Erreur critique', { userId: '123', error: err.message });
```

### Logger avec context (recommandé pour les services)
```typescript
import { createContextLogger } from '../utils/logger';

const log = createContextLogger('ContractService');

log.info('Contract created', { contractId: 'CONT-001' });
log.error('Failed to validate', { contractId, error: err.message });
```

### Alias pratiques
```typescript
import { logInfo, logError, logWarn, logDebug } from '../utils/logger';

logInfo('Operation completed', { duration: 123 });
logError('Database query failed', { query, error: err.message });
```

## 🔄 Services à migrer (à faire progressivement)

Remplacer `console.error` par `logger.error` dans:

- [ ] `src/services/agent.service.ts` (~15 occurrences)
- [ ] `src/services/contract.service.ts` (~12 occurrences)
- [ ] `src/services/timeline.service.ts` (~3 occurrences)
- [ ] `src/services/bungie.service.ts` (~5 occurrences)
- [ ] `src/services/appinfo.service.ts` (~2 occurrences)
- [ ] `src/services/role.service.ts` (~1 occurrence)
- [ ] `src/services/division.service.ts` (~1 occurrence)
- [ ] `src/utils/verifyAgent.helper.ts` (~1 occurrence)
- [ ] `src/utils/dateformat.ts` (~1 occurrence)
- [ ] `src/utils/environment.ts` (~2 occurrences)

### Script de remplacement rapide

Pattern de remplacement:
```
// Avant
console.error('Message:', { data });

// Après
logger.error('Message', { data });
```

## 🚀 Niveaux de log par environnement

| Environnement | Niveau par défaut | Logs visibles |
|---------------|-------------------|---------------|
| development   | `debug`           | Tout          |
| production    | `info`            | info, warn, error |
| test          | `debug`           | Console uniquement |

## 📊 Variables d'environnement optionnelles

```env
# Optionnel: override du niveau de log
LOG_LEVEL=debug
```
