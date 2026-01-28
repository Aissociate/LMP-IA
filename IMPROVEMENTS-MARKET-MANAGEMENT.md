# Améliorations du Système de Gestion des Marchés

## Problème Initial
Les marchés saisis manuellement via le wizard de collecte n'apparaissaient pas dans la recherche de marchés.

## Cause du Problème
1. Les marchés manuels étaient créés avec le statut `draft` par défaut
2. La recherche ne retournait que les marchés avec le statut `published`
3. Aucun mécanisme de publication n'était en place
4. Les tables `manual_markets` et `public_markets` n'étaient pas synchronisées

## Solutions Implémentées

### 1. Migration de Base de Données
**Fichier**: `supabase/migrations/fix_manual_markets_visibility_system.sql`

#### Nouvelles Fonctions
- **`sync_manual_market_to_public(market_id uuid)`**
  - Synchronise un marché manuel vers la table `public_markets`
  - Gère l'insertion ou la mise à jour (upsert)
  - Détecte automatiquement le département selon la localisation

- **`publish_manual_market(market_id uuid)`**
  - Publie un seul marché manuel
  - Change le statut de `draft` à `published`
  - Définit la date de publication
  - Synchronise vers `public_markets`

- **`publish_session_markets(session_id text)`**
  - Publie tous les marchés d'une session en une seule fois
  - Opération en masse pour la validation de session
  - Retourne le nombre de marchés publiés

- **`trigger_sync_manual_market_to_public()`**
  - Trigger automatique sur les marchés publiés
  - Se déclenche lors d'INSERT ou UPDATE avec status='published'
  - Synchronise automatiquement vers `public_markets`

#### Modifications de Schéma
- Changement du statut par défaut de `draft` à `published` pour les nouveaux marchés
- Ajout d'index pour optimiser les requêtes :
  - `idx_manual_markets_created_by_status` sur `(created_by, status)`
  - `idx_public_markets_source` sur `(source, is_public)`

### 2. Amélioration du Service de Recherche
**Fichier**: `src/services/boampService.ts`

#### Nouvelle Méthode `searchPublicMarkets()`
- Recherche unifiée dans la table `public_markets`
- Inclut automatiquement les marchés manuels ET BOAMP synchronisés
- Support de tous les filtres :
  - Mots-clés (titre, client, description)
  - Localisation (location + département)
  - Types de service
  - Acheteur public
  - Code CPV
  - Plages de dates et montants

#### Amélioration de `searchMarketsWithManual()`
- Utilise `searchPublicMarkets()` en priorité
- Complète avec l'API BOAMP si nécessaire
- Évite les doublons en comparant les références
- Affiche des logs de diagnostic
- Meilleure performance grâce à la recherche unifiée

### 3. Formulaire de Saisie
**Fichier**: `src/components/MarketCollector/MarketEntryForm.tsx`

#### Modifications
- Les nouveaux marchés sont créés avec `status='published'` explicitement
- Ajout automatique de `publication_date`
- Les marchés sont immédiatement visibles dans la recherche
- Le champ Localisation est pré-rempli avec "Réunion" par défaut
- Validation obligatoire de la localisation

### 4. Interface du Wizard de Session
**Fichier**: `src/components/MarketCollector/SessionWizard.tsx`

#### Nouveau Bouton "Publier la session"
- Visible dans l'en-tête quand des marchés existent
- Permet de publier tous les marchés d'une session en une fois
- Affiche un message de confirmation avec le nombre de marchés publiés
- Indication visuelle pendant la publication
- Utile pour les sessions migrées avec des marchés en `draft`

## Flux de Données Amélioré

### Saisie d'un Marché
```
1. Utilisateur remplit le formulaire
2. MarketEntryForm.saveMarket()
3. INSERT dans manual_markets avec status='published'
4. Trigger auto_sync_manual_market_to_public
5. Fonction sync_manual_market_to_public()
6. INSERT/UPDATE dans public_markets
7. Marché immédiatement visible dans la recherche
```

### Recherche de Marchés
```
1. Utilisateur lance une recherche
2. MarketSearch.handleSearch()
3. boampService.searchMarketsWithManual()
4. searchPublicMarkets() - marchés locaux (manuels + BOAMP synchro)
5. searchMarkets() - API BOAMP externe
6. Fusion des résultats sans doublons
7. Tri et pagination
8. Affichage unifié
```

### Publication de Session
```
1. Utilisateur clique sur "Publier la session"
2. SessionWizard.handlePublishSession()
3. Appel RPC publish_session_markets(session_id)
4. Tous les marchés draft → published
5. Synchronisation automatique vers public_markets
6. Message de confirmation
```

## Avantages de la Solution

### 1. Visibilité Immédiate
- Les marchés saisis sont publiés automatiquement
- Apparaissent instantanément dans la recherche
- Aucune action manuelle nécessaire

### 2. Source Unifiée
- Table `public_markets` comme source centrale
- Marchés manuels et BOAMP au même endroit
- Recherche plus rapide et cohérente

### 3. Synchronisation Automatique
- Triggers pour maintenir la cohérence
- Pas de tâches manuelles de synchronisation
- Fiabilité accrue

### 4. Flexibilité
- Possibilité de garder des marchés en draft si nécessaire
- Bouton de publication pour valider des sessions entières
- Support des anciennes données

### 5. Performance
- Index optimisés pour les requêtes fréquentes
- Moins d'appels à l'API BOAMP externe
- Cache naturel via public_markets

## Tests Recommandés

1. **Saisie de Nouveau Marché**
   - Saisir un marché via le wizard
   - Vérifier qu'il apparaît dans manual_markets avec status='published'
   - Vérifier qu'il apparaît dans public_markets avec source='manual'
   - Lancer une recherche et vérifier la présence du marché

2. **Publication de Session**
   - Créer des marchés en mode draft manuellement
   - Utiliser le bouton "Publier la session"
   - Vérifier que tous passent à published
   - Vérifier la synchronisation vers public_markets

3. **Recherche Unifiée**
   - Effectuer une recherche avec différents filtres
   - Vérifier que les marchés manuels et BOAMP apparaissent
   - Vérifier l'absence de doublons
   - Tester le tri et la pagination

4. **Déduplication**
   - Saisir un marché manuel avec une référence BOAMP existante
   - Vérifier la détection de doublon
   - Vérifier que le système affiche un avertissement

## Maintenance Future

### Surveillance
- Vérifier régulièrement la cohérence entre manual_markets et public_markets
- Monitorer les performances des recherches
- Analyser les logs de synchronisation

### Optimisations Possibles
- Ajouter un cache Redis pour les recherches fréquentes
- Implémenter une recherche full-text avec PostgreSQL
- Créer des vues matérialisées pour les agrégations

### Extensions Envisageables
- Workflow d'approbation pour certains types de marchés
- Historique des modifications
- Export des marchés en batch
- API REST pour intégrations tierces
