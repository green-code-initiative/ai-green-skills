# Utilisation des modules génériques pour les scanners

**Date**: 25 mars 2026

## 📋 Vue d'ensemble

Les scanners de conformité (RGAA, RGPD, RGS, RGESN, RGI, W3C-WSG) utilisent des modules générique partagés dans `compliance-framework/scripts/`:

- **`personas.js`** - Découverte & gestion des personas (standard-agnostique)
- **`shared-utils.js`** - Configuration, CLI parsing, logging, reports
- **`crawler-auth.js`** - Navigation Puppeteer avec authentification

## ✅ Avantages

✓ **Pas de duplication** - Un seul code de discovery, utilisé par tous les standards  
✓ **Générique** - Fonctionne pour n'importe quel projet (pas de hardcoding projet)  
✓ **Flexible** - Fallback automatique: config → .env → README → defaults  
✓ **Multi-personas** - Test de chaque rôle et de ses permissions associées

## 🔧 Comment intégrer dans un scanner

### 1. Importer les modules

```javascript
const { loadConfig, parseArgs, log, saveJsonReport } = require('./shared-utils')
const { discoverPersonas, getPersona, getPersonasForRoute } = require('./personas')
const { crawlRoutesWithAuth } = require('./crawler-auth')
```

### 2. Charger la configuration

```javascript
const options = parseArgs(process.argv.slice(2))
const config = loadConfig(options.config)
```

### 3. Découvrir les personas

```javascript
const personas = await discoverPersonas(config, process.cwd())
log.success(`Discovered ${personas.length} personas`)
```

### 4. Crawler avec authentification

```javascript
async function reviewPage(pageData) {
  // Votre logique de scan (RGAA, RGPD, etc.)
  return {
    persona: pageData.persona,
    path: pageData.path,
    violations: [...],
  };
}

const results = await crawlRoutesWithAuth(
  config.targets[0].url,
  config,
  personas,
  config.targets[0].name,
  reviewPage
);
```

### 5. Sauvegarder le rapport

```javascript
saveJsonReport(report, options.outputDir, `scan-${standard}-${getDateStamp()}.json`)
```

## 📍 Fichiers à modifier par scanner

### RGAA (`compliance-rgaa/scripts/scan-compliance.js`)

- [x] Importer `personas.js` au lieu de dupliquer discovery
- [x] Utiliser `crawlRoutesWithAuth` pour scanner chaque page
- [x] Importer `shared-utils.js` pour config/logging consistent

### RGPD (`compliance-rgpd/scripts/scan-compliance.js`)

- [ ] À faire

### RGS (`compliance-rgs/scripts/scan-compliance.js`)

- [ ] À faire

### RGESN (`compliance-rgesn/scripts/scan-compliance.js`)

- [ ] À faire

### RGI (`compliance-rgi/scripts/scan-compliance.js`)

- [ ] À faire

### W3C-WSG (`compliance-w3c-wsg/scripts/scan-compliance.js`)

- [ ] À faire

## 🧪 Tester le système

```bash
# De n'importe quel scanner:
node .agents/skills/compliance-rgaa/scripts/scan-compliance.js \
  --config docs/compliance/scanner-config.json \
  --verbose

# Output:
# ✅ Personas found in scanner-config.json (3 personas)
#
# ═══ Testing as Client ═══
# 📍 Crawling 7 route(s) for Client
#
# ═══ Testing as Administrator ═══
# 📍 Crawling 10 route(s) for Administrator
# ...
```

## 🔍 Fonctionnalités du système

### Découverte de personas (personas.js)

1. **Primary**: `scanner-config.json` → `auth.personas`
2. **Fallback 1**: `.env` (patterns: TEST*USER*\_, DEMO\_\_, AUTH\_\*)
3. **Fallback 2**: `README.md` (search for documented test accounts)
4. **Fallback 3**: `CONTRIBUTING.md`
5. **Fallback 4**: Defaults génériques

### Crawler intelligent (crawler-auth.js)

- Authentifie via Puppeteer
- Teste chaque persona
- Crawle les routes permises par persona
- Appelle une fonction `reviewPageFn` pour chaque page
- Passe metadata: route, URL, titre, contenu, persona, HTTP status

### Configuration (shared-utils.js)

- Charge depuis: `./scanner-config.json` → `.../docs/compliance/scanner-config.json` → config-template
- Parse CLI: `--config`, `--targets`, `--personas`, `--output-dir`, `--json`, `--verbose`
- Logging avec couleurs & niveaux
- Sauvegarde JSON/Markdown avec timestamps

## 📊 Configuration attendue (scanner-config.json)

```json
{
  "name": "My Project",
  "auth": {
    "type": "local",
    "loginUrl": "http://localhost:3000/login",
    "usernameSelector": "input[name='username']",
    "passwordSelector": "input[name='password']",
    "submitSelector": "button[type='submit']",
    "personas": [
      {
        "name": "Client",
        "username": "user@example.com",
        "password": "password",
        "description": "Standard user"
      },
      {
        "name": "Administrator",
        "username": "admin@example.com",
        "password": "password",
        "description": "Admin user"
      }
    ]
  },
  "targets": [
    {
      "name": "Web App",
      "type": "web",
      "url": "http://localhost:3000",
      "routes": [
        {
          "path": "/login",
          "personas": ["*"],
          "description": "Login page"
        },
        {
          "path": "/dashboard",
          "personas": ["Client", "Administrator"],
          "description": "Dashboard"
        }
      ]
    }
  ]
}
```

## 🎯 Ordre d'implémentation

1. **RGAA** (déjà en place)
2. **RGPD** (par persona = données personnelles collectées varient)
3. **RGS** (par persona = droits d'accès varient)
4. **RGESN** (optimisation générique, peu de variation par persona)
5. **RGI** (API = peu variation, focus sur contract tests)
6. **W3C-WSG** (performance générique, peu de variation)

## ❓ FAQ

**Q: Où est le code de découverte?**  
R: Dans `compliance-framework/scripts/personas.js` - partagé par TOUS les standards.

**Q: Pourquoi importer crawler-auth.js?**  
R: Pour `crawlRoutesWithAuth()` qui navigue avec Puppeteer tout en testant chaque persona.

**Q: Comment passer personas au crawler?**  
R: C'est le deuxième paramètre: `crawlRoutesWithAuth(url, config, **personas**, targetName, reviewFn)`

**Q: Les personas peuvent-ils avoir un token au lieu de password?**  
R: Oui, utilisez `persona.token` si you have bearer auth. Voir `buildAuthHeaders()` dans personas.js.

---

**Dernière mise à jour**: 25 mars 2026  
**Responsable**: Architecture compliance
