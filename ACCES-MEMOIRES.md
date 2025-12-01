# 📝 Comment Accéder aux Mémoires Techniques

## 🎯 Navigation

Pour accéder aux mémoires techniques, suivez ces étapes :

### 1. Se Connecter à l'Application

1. Allez sur `/mmp` ou cliquez sur le bouton de connexion
2. Entrez vos identifiants
3. Vous arrivez sur le Dashboard

### 2. Créer ou Gérer vos Marchés

Dans la **sidebar à gauche**, cliquez sur **"Marchés"** (icône 📄)

Vous arrivez sur la page de gestion des marchés avec 2 onglets :

#### **Onglet "Mes Marchés"**
- Liste de vos marchés créés
- Bouton **"+ Créer un marché"** en haut à droite

#### **Onglet "Favoris BOAMP"**
- Marchés mis en favoris depuis la recherche BOAMP
- Bouton **"Importer dans Mes Marchés"**

---

## 🚀 Workflow Complet

### Option 1 : Créer un Marché Manuellement

1. **Cliquer sur "Marchés"** dans la sidebar
2. **Cliquer sur "+ Créer un marché"**
3. **Remplir les informations** :
   - Titre du marché
   - Client (organisme)
   - Description
   - Date limite
   - Montant estimé
   - Statut (En cours, Soumis, Gagné, Perdu)

4. **Cliquer sur "Créer"**

### Option 2 : Importer depuis BOAMP

1. **Aller dans "Recherche de marchés"** (icône 🔍)
2. **Rechercher des marchés** avec filtres
3. **Cliquer sur l'étoile** ⭐ pour ajouter aux favoris
4. **Retourner dans "Marchés"**
5. **Onglet "Favoris BOAMP"**
6. **Cliquer sur "Importer dans Mes Marchés"**

---

## 📋 Accéder aux Mémoires Techniques

Une fois qu'un marché est créé ou importé :

### 1. Analyser le DCE (Optionnel)

Sur la card du marché, cliquez sur **"📊 Analyser DCE"** pour :
- Uploader les documents du DCE
- Extraire automatiquement les critères
- Analyser les exigences

### 2. Générer le Mémoire Technique

Cliquez sur **"📝 Mémoire Technique"** pour :

#### **Étape 1 : Configuration**
- Choisir le modèle IA (GPT-4, Claude, etc.)
- Configurer les paramètres de génération

#### **Étape 2 : Contexte**
- Uploader votre base de connaissances
- Ajouter des documents de référence
- Configurer le contexte entreprise

#### **Étape 3 : Sections**
- Voir les sections générées automatiquement
- Éditer chaque section
- Régénérer si nécessaire
- Ajouter des images

#### **Étape 4 : Export**
- Exporter en Word (.docx)
- Exporter en PDF
- Télécharger le document final

### 3. Générer les Documents Économiques

Cliquez sur **"💰 Doc. Économiques"** pour :
- Générer le BPU (Bordereau de Prix Unitaire)
- Créer l'Acte d'Engagement
- Générer le Mémoire Justificatif des Prix

---

## 🔧 Fonctionnalités Avancées

### Éditer un Marché

1. Cliquer sur **"✏️ Éditer"** sur la card
2. Modifier les informations
3. Sauvegarder

### Archiver un Marché

1. Cliquer sur **"📁 Archiver"**
2. Le marché passe en mode archivé
3. Toujours accessible mais masqué par défaut

### Gérer les Statuts

- **En cours** : Marché actif en préparation
- **Soumis** : Dossier déposé
- **Gagné** : Marché remporté ✅
- **Perdu** : Marché non attribué

---

## ❓ Problèmes Courants

### "Je ne vois pas mes marchés"

**Solutions** :
1. Vérifier que vous êtes bien connecté
2. Vérifier l'onglet actif (Mes Marchés / Favoris)
3. Créer un premier marché avec le bouton "+"
4. Vérifier que vous n'avez pas de filtre actif

### "Je ne peux pas générer de mémoire"

**Vérifications** :
1. Le marché est bien créé/importé
2. Vous avez cliqué sur "Mémoire Technique"
3. Votre abonnement permet la génération
4. Vous avez des crédits disponibles

### "Le bouton Mémoire Technique ne répond pas"

**Actions** :
1. Rafraîchir la page (F5)
2. Vérifier la console (F12)
3. Se déconnecter / reconnecter
4. Vider le cache du navigateur

---

## 📊 Architecture des Données

```
Utilisateur
    └── Marchés (markets table)
        ├── Informations de base
        ├── Statut
        ├── Documents uploadés
        └── Mémoires générés
            ├── Sections
            ├── Contexte
            └── Documents exportés
```

---

## 🎓 Tips & Astuces

### Workflow Optimal

1. **Rechercher** des marchés BOAMP pertinents
2. **Ajouter aux favoris** les plus intéressants
3. **Importer** dans "Mes Marchés"
4. **Analyser le DCE** pour extraire les critères
5. **Générer le mémoire** avec l'IA
6. **Éditer** et personnaliser
7. **Exporter** et soumettre

### Gagner du Temps

- Utilisez **Market Sentinel™** pour la veille automatique
- Configurez des **alertes** sur critères
- Réutilisez votre **base de connaissances**
- Dupliquez des **sections** entre marchés similaires

### Qualité des Mémoires

1. **Uploadez un maximum de contexte** (certifications, références, etc.)
2. **Relisez** les sections générées
3. **Personnalisez** selon le client
4. **Ajoutez des images** pertinentes
5. **Vérifiez** la cohérence globale

---

## 🆘 Support

Si vous rencontrez toujours des problèmes :

1. **Bug Report** : Cliquez sur le bouton 🐛 en bas à droite
2. **Console du navigateur** : F12 > Console (envoyez les erreurs)
3. **Screenshot** : Partagez ce que vous voyez

---

**Version** : 1.0.0
**Dernière mise à jour** : Décembre 2024
