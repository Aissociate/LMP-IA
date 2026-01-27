# Session Wizard - Documentation

## Vue d'ensemble

Le **Session Wizard** est un système complet de saisie guidée de marchés publics pour les opérateurs de collecte. Il permet de gérer efficacement la saisie des marchés en suivant une liste ordonnée de donneurs d'ordre (autorités contractantes) tout en gardant une trace de la progression.

## Fonctionnalités principales

### 1. Gestion des donneurs d'ordre

La base de données contient maintenant **47 donneurs d'ordre** de La Réunion avec :
- Nom du donneur d'ordre
- URL du site de consultation des marchés
- Notes spéciales pour aider l'opérateur (ex: "faire une recherche avec la date du jour")
- Ordre d'affichage (suit l'ordre de votre liste originale)
- Département (974 pour La Réunion)

**Donneurs d'ordre inclus :**
- Région Réunion
- Département de La Réunion
- CINOR, TCO, CIREST, CIVIS, CASUD
- 24 communes (Saint-Denis, Saint-Pierre, Le Tampon, etc.)
- Services publics (SPLAR, SEMADER, SEDRE, SDIS 974)
- Services d'État (Police nationale, CHU, Préfecture, DEAL, ARS, etc.)
- Organismes sociaux (CAF, CPAM, France Travail)
- Autres organismes (CCI, CMA, ministères)
- Sites divers (AchatPublic, Linfo.re)

### 2. Système de sessions

Chaque session de saisie est tracée avec :
- Email/nom de l'opérateur
- Date et heure de début
- Statut (en cours, terminé, en pause)
- Nombre total de donneurs d'ordre
- Nombre de donneurs d'ordre traités
- Nombre total de marchés ajoutés

### 3. Workflow guidé

Le wizard guide l'opérateur à travers les étapes suivantes :

#### Étape 1 : Ouverture de la session
- L'opérateur clique sur "Session de saisie"
- Le système charge ou crée automatiquement une session
- Si une session est déjà en cours, elle est reprise

#### Étape 2 : Sélection du donneur d'ordre
- Le wizard affiche automatiquement le premier donneur d'ordre non traité
- L'opérateur peut voir :
  - Le nom du donneur d'ordre
  - Les notes spéciales (si disponibles)
  - Un lien pour ouvrir le site des marchés
- Possibilité de changer manuellement de donneur d'ordre

#### Étape 3 : Saisie des marchés
- Formulaire simplifié de saisie de marché :
  - Titre (obligatoire)
  - Référence
  - Date limite
  - Type de service (Travaux/Services/Fournitures/Mixte)
  - Montant estimé
  - Localisation
  - Type de procédure
  - Code CPV
  - URL de l'annonce
  - URL du DCE
  - Description
- Le client (donneur d'ordre) est automatiquement pré-rempli
- Bouton "Ajouter ce marché" pour enregistrer et continuer

#### Étape 4 : Passage au donneur d'ordre suivant
- L'opérateur peut :
  - Ajouter des notes sur le donneur d'ordre traité
  - Voir le nombre de marchés ajoutés pour ce donneur
  - Cliquer sur "Terminer ce donneur d'ordre" pour passer au suivant
  - Ou "Passer sans saisie" s'il n'y a pas de marché

#### Étape 5 : Progression
- Affichage en temps réel de :
  - Nombre de donneurs d'ordre traités / total
  - Nombre total de marchés ajoutés dans la session
- Liste des donneurs d'ordre restants accessible à tout moment

### 4. Suivi et statistiques

Le système enregistre pour chaque donneur d'ordre :
- Date et heure de début de traitement
- Date et heure de fin
- Nombre de marchés ajoutés
- Notes de l'opérateur
- Statut (traité ou non)

## Structure de la base de données

### Tables créées

#### `manual_markets_donneurs_ordre`
Contient les informations sur les donneurs d'ordre :
```sql
- id (uuid)
- name (text) - Nom du donneur d'ordre
- markets_url (text) - URL du site de consultation
- special_notes (text) - Instructions spéciales
- display_order (integer) - Ordre d'affichage
- department (text) - Département
- is_active (boolean) - Si actif
- siret, address, city, postal_code, contact_email, contact_phone, website
```

#### `manual_markets_sessions`
Suivi des sessions de saisie :
```sql
- id (uuid)
- operator_email (text) - Email/nom de l'opérateur
- started_at (timestamptz) - Date de début
- completed_at (timestamptz) - Date de fin
- status (text) - in_progress, completed, paused
- total_donneurs_ordre (integer) - Total à traiter
- completed_donneurs_ordre (integer) - Nombre traité
- total_markets_added (integer) - Marchés ajoutés
- notes (text) - Notes générales
```

#### `manual_markets_session_progress`
Progression détaillée par donneur d'ordre :
```sql
- id (uuid)
- session_id (uuid) - Lien vers la session
- donneur_ordre_id (uuid) - Lien vers le donneur d'ordre
- is_completed (boolean) - Si traité
- markets_added_count (integer) - Nombre de marchés
- notes (text) - Notes de l'opérateur
- started_at (timestamptz) - Début du traitement
- completed_at (timestamptz) - Fin du traitement
```

## Fichiers créés

### Services
- **`src/services/sessionService.ts`** - Service de gestion des sessions avec toutes les opérations CRUD

### Composants
- **`src/components/MarketCollector/SessionWizard.tsx`** - Composant principal du wizard
- **`src/components/MarketCollector/MarketEntryForm.tsx`** - Formulaire de saisie rapide de marché

### Migrations
- **`add_donneurs_ordre_fields_and_sessions.sql`** - Ajout des colonnes et tables de session
- **`insert_reunion_donneurs_ordre.sql`** - Insertion des 47 donneurs d'ordre

## Utilisation

### Pour l'opérateur

1. **Se connecter** à l'interface MarketCollector avec le mot de passe
2. **Cliquer sur "Session de saisie"** (bouton bleu)
3. Le wizard s'ouvre et affiche le premier donneur d'ordre
4. **Ouvrir le site** du donneur d'ordre via le lien
5. **Saisir les marchés** trouvés un par un
6. **Cliquer sur "Terminer ce donneur d'ordre"** pour passer au suivant
7. **Répéter** jusqu'à la fin de la liste
8. Le wizard se ferme automatiquement à la fin

### Pour changer de donneur d'ordre manuellement

1. Cliquer sur **"Changer de donneur d'ordre"**
2. Sélectionner dans la liste des donneurs restants
3. Continuer la saisie

### Pour mettre en pause

1. Cliquer sur la croix (X) en haut à droite
2. La session est marquée comme "paused"
3. Au prochain démarrage, la session reprend où elle s'était arrêtée

## Avantages du système

✅ **Workflow guidé** - L'opérateur sait toujours où il en est
✅ **Pas d'oubli** - Tous les donneurs d'ordre sont traités dans l'ordre
✅ **Traçabilité** - Chaque session est enregistrée avec détails
✅ **Reprise possible** - Une session peut être mise en pause et reprise
✅ **Statistiques** - Suivi du nombre de marchés ajoutés
✅ **Notes contextuelles** - Instructions spéciales affichées pour chaque donneur
✅ **Saisie rapide** - Formulaire optimisé pour la vitesse
✅ **Ordre personnalisable** - Modification possible de l'ordre via la base

## Évolutions possibles

- Ajout de raccourcis clavier pour la saisie ultra-rapide
- Import automatique depuis certains sites
- Détection de doublons
- Planification de sessions récurrentes
- Statistiques par opérateur
- Notifications de nouveaux marchés
- Export des données de session

## Notes techniques

- Le système utilise Supabase pour la persistance
- Compatible avec le mode sombre
- Responsive design
- Gestion des erreurs avec messages clairs
- Triggers SQL pour la mise à jour automatique des compteurs
- RLS (Row Level Security) activé pour la sécurité
