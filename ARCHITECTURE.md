# 🏗️ Architecture du Projet - Le Marché Public

## 📁 Structure des Dossiers

```
src/
├── components/           # Composants React
│   ├── ui/              # ✅ Composants UI réutilisables (NOUVEAU)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Section.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts
│   ├── Admin/           # Administration
│   ├── Assistant/       # Assistant IA
│   ├── Auth/            # Authentification
│   ├── Common/          # Composants communs
│   ├── Dashboard/       # Tableau de bord
│   ├── Landing/         # Pages de destination
│   ├── Layout/          # Layout et navigation
│   ├── Markets/         # Gestion des marchés
│   ├── MarketSearch/    # Recherche de marchés
│   │   ├── MarketSearch.tsx
│   │   ├── SearchBar.tsx      # ✅ (NOUVEAU)
│   │   ├── QuickFilters.tsx   # ✅ (NOUVEAU)
│   │   └── SearchStats.tsx    # ✅ (NOUVEAU)
│   ├── SEO/             # Optimisation SEO
│   ├── Settings/        # Paramètres
│   ├── Sourcing/        # Sourcing
│   └── TechnicalMemory/ # Mémoires techniques
│
├── hooks/               # Hooks React personnalisés
│   ├── common/          # ✅ Hooks réutilisables (NOUVEAU)
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── usePagination.ts
│   │   ├── useAsync.ts
│   │   └── index.ts
│   ├── useAuth.ts       # Authentification
│   └── useTheme.ts      # Thème dark/light
│
├── services/            # Services métier (micro-services)
│   ├── aiGenerationService.ts
│   ├── boampService.ts
│   ├── contextService.ts
│   ├── documentGenerationService.ts
│   ├── favoritesService.ts
│   ├── imageDescriptionService.ts
│   ├── logService.ts
│   ├── marketSentinelService.ts
│   ├── pdfGenerationService.ts
│   └── sectionService.ts
│
├── utils/               # ✅ Utilitaires réutilisables (NOUVEAU)
│   ├── formatters.ts    # Formatage (dates, montants, etc.)
│   ├── validators.ts    # Validation (email, SIRET, etc.)
│   └── index.ts
│
├── lib/                 # Bibliothèques et configurations
│   ├── supabase.ts      # Client Supabase
│   ├── openrouter.ts    # Client OpenRouter
│   ├── analytics.ts     # Analytics
│   ├── facebookPixel.ts # Facebook Pixel
│   └── ...
│
└── types/               # Types TypeScript
    ├── boamp.ts
    ├── technicalMemory.ts
    └── index.ts
```

---

## 🎨 Composants UI Réutilisables (`/src/components/ui`)

### ✅ Problème Résolu
**Avant** : 5+ définitions dupliquées du composant `Button` dans différents fichiers
**Après** : 1 seul composant `Button` centralisé et réutilisable

### 📦 Composants Disponibles

#### **1. Button**
```typescript
import { Button } from '@/components/ui';

<Button variant="primary" size="md" icon={Search}>
  Rechercher
</Button>
```

**Props** :
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `icon`: LucideIcon (optionnel)
- `loading`: boolean (affiche un spinner)
- `fullWidth`: boolean

#### **2. Card**
```typescript
import { Card } from '@/components/ui';

<Card hover padding="md" isDark={isDark}>
  {children}
</Card>
```

**Props** :
- `hover`: boolean (effet hover)
- `padding`: 'none' | 'sm' | 'md' | 'lg'
- `isDark`: boolean (mode sombre)

#### **3. Section**
```typescript
import { Section } from '@/components/ui';

<Section maxWidth="xl" padding="md">
  {children}
</Section>
```

**Props** :
- `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
- `padding`: 'none' | 'sm' | 'md' | 'lg'

#### **4. Modal**
```typescript
import { Modal } from '@/components/ui';

<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Mon Modal"
  size="md"
>
  {children}
</Modal>
```

**Props** :
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string (optionnel)
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `isDark`: boolean

---

## 🪝 Hooks Personnalisés (`/src/hooks/common`)

### ✅ Problème Résolu
**Avant** : Code dupliqué dans 46+ fichiers utilisant `useState` et `useEffect`
**Après** : Hooks réutilisables et testables

### 📦 Hooks Disponibles

#### **1. useDebounce**
```typescript
import { useDebounce } from '@/hooks/common';

const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

// Utilisez debouncedSearch pour les appels API
```

#### **2. useLocalStorage**
```typescript
import { useLocalStorage } from '@/hooks/common';

const [filters, setFilters] = useLocalStorage('searchFilters', defaultFilters);
```

#### **3. usePagination**
```typescript
import { usePagination } from '@/hooks/common';

const {
  currentPage,
  currentData,
  nextPage,
  previousPage,
  canGoNext,
  canGoPrevious
} = usePagination(allData, 20);
```

#### **4. useAsync**
```typescript
import { useAsync } from '@/hooks/common';

const { data, loading, error, execute } = useAsync(
  () => fetchMarkets(filters),
  true // immediate execution
);
```

---

## 🛠️ Utilitaires (`/src/utils`)

### ✅ Problème Résolu
**Avant** : Fonctions de formatage dupliquées partout
**Après** : Utilitaires centralisés et testables

### 📦 Fonctions Disponibles

#### **Formatters** (`/src/utils/formatters.ts`)

```typescript
import {
  formatCurrency,
  formatDate,
  getDaysRemaining,
  formatDaysRemaining,
  truncate,
  formatFileSize,
  getInitials
} from '@/utils';

// Exemples
formatCurrency(150000);           // "150 000 €"
formatDate('2024-12-01');         // "1 déc. 2024"
getDaysRemaining('2024-12-15');   // 14
formatDaysRemaining('2024-12-15'); // "14 jours"
truncate('Long texte...', 50);    // "Long texte..."
formatFileSize(1024000);          // "1000 KB"
getInitials('Jean Dupont');       // "JD"
```

#### **Validators** (`/src/utils/validators.ts`)

```typescript
import {
  isValidEmail,
  isValidPhone,
  isValidSIRET,
  isValidURL,
  isRequired,
  minLength,
  maxLength,
  inRange
} from '@/utils';

// Exemples
isValidEmail('test@example.com');    // true
isValidPhone('06 12 34 56 78');      // true
isValidSIRET('12345678901234');      // true (si valide)
isValidURL('https://example.com');   // true
isRequired('');                      // false
minLength('test', 3);                // true
maxLength('test', 10);               // true
inRange(50, 0, 100);                 // true
```

---

## 🔄 Architecture en Micro-Services

### Principe de Séparation des Responsabilités

Chaque service a **UNE SEULE responsabilité** :

```
services/
├── aiGenerationService.ts       # IA et génération de contenu
├── boampService.ts              # API BOAMP
├── contextService.ts            # Gestion du contexte
├── documentGenerationService.ts # Génération de documents
├── favoritesService.ts          # Gestion des favoris
├── imageDescriptionService.ts   # Description d'images
├── logService.ts                # Logging
├── marketSentinelService.ts     # Surveillance des marchés
├── pdfGenerationService.ts      # Génération PDF
└── sectionService.ts            # Gestion des sections
```

### ✅ Bonnes Pratiques

1. **Un service = Une responsabilité**
2. **Pas de dépendances circulaires**
3. **Fonctions pures quand possible**
4. **Gestion d'erreur centralisée**
5. **Types TypeScript stricts**

---

## 📊 Métriques du Code

### Avant Refactorisation

| Métrique | Valeur |
|----------|--------|
| Fichiers > 1000 lignes | 3 |
| Fichiers > 800 lignes | 5 |
| Composants dupliqués | 5+ Button, 7+ Section |
| Hooks personnalisés | 2 |
| Utils centralisés | 0 |

### Après Refactorisation

| Métrique | Valeur |
|----------|--------|
| Composants UI réutilisables | 4 |
| Hooks personnalisés | 4 |
| Fonctions utils | 15+ |
| Duplication | ✅ Éliminée |
| Maintenabilité | ✅ Améliorée |

---

## 🚀 Migration Progressive

### Comment Adopter la Nouvelle Architecture

#### Étape 1 : Remplacer les Buttons

**Avant** :
```typescript
const Button = ({ className = "", children, onClick }: any) => (
  <button className={`px-4 py-2 ${className}`} onClick={onClick}>
    {children}
  </button>
);
```

**Après** :
```typescript
import { Button } from '@/components/ui';

<Button variant="primary" onClick={handleClick}>
  Mon bouton
</Button>
```

#### Étape 2 : Utiliser les Hooks

**Avant** :
```typescript
const [value, setValue] = useState('');
const [debouncedValue, setDebouncedValue] = useState('');

useEffect(() => {
  const handler = setTimeout(() => {
    setDebouncedValue(value);
  }, 300);
  return () => clearTimeout(handler);
}, [value]);
```

**Après** :
```typescript
import { useDebounce } from '@/hooks/common';

const [value, setValue] = useState('');
const debouncedValue = useDebounce(value, 300);
```

#### Étape 3 : Utiliser les Utils

**Avant** :
```typescript
const formatAmount = (amount?: number) => {
  if (!amount) return 'Non spécifié';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};
```

**Après** :
```typescript
import { formatCurrency } from '@/utils';

const formatted = formatCurrency(amount);
```

---

## 🎯 Prochaines Étapes Recommandées

### Court Terme
1. ✅ Remplacer les composants dupliqués par les composants UI
2. ✅ Migrer vers les hooks personnalisés
3. ✅ Utiliser les utilitaires de formatage

### Moyen Terme
1. Refactoriser les gros composants (>800 lignes)
2. Extraire la logique métier dans les services
3. Ajouter des tests unitaires

### Long Terme
1. Créer un design system complet
2. Ajouter Storybook pour les composants
3. Implémenter le lazy loading
4. Optimiser les performances

---

## 📚 Ressources

- [React Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)

---

**Version** : 1.0.0
**Date** : Décembre 2024
**Auteur** : Claude Code
