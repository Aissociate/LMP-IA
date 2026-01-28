# Test des Emails - Démarrage Rapide

Testez votre système d'alertes email en 5 minutes.

## Prérequis

- [x] Compte créé sur l'application
- [x] Au moins une alerte créée et active
- [x] Notifications email activées dans les paramètres

## Test en 3 Étapes

### 1. Activer les Notifications

1. Connectez-vous à votre compte
2. **Paramètres** > **Notifications**
3. Activez **"Notifications email"**
4. Cliquez sur **"Enregistrer les préférences"**

### 2. Envoyer un Email de Test

1. Restez sur la page **Paramètres** > **Notifications**
2. Cliquez sur le bouton **"Email de test"**
3. Attendez le message de confirmation (5-10 secondes)

### 3. Vérifier Votre Email

1. Ouvrez votre boîte mail
2. Cherchez un email de "Le Marche Public"
3. Vérifiez les spams si vous ne le voyez pas
4. Durée d'attente normale : 10-30 secondes

## Ce que Vous Devez Voir

### Message de confirmation (dans l'app) :
```
✅ Email envoyé avec 3 détections des dernières 24h à votre@email.com
```

OU si vous n'avez pas de détections récentes :
```
✅ Email de test envoyé (aucune détection récente) à votre@email.com
```

### Email reçu :
- **Sujet** : "Email de test - X détections récentes" ou "Format des notifications"
- **Contenu** : Vos vraies détections des dernières 24h OU aperçu du format
- **Footer** : Liens vers "Gérer mes alertes" et "Modifier mes préférences"

## Dépannage Rapide

### Pas de message de confirmation ?
- Vérifiez que les notifications sont activées
- Rafraîchissez la page et réessayez

### Message confirmé mais pas d'email ?
1. Vérifiez les spams/courrier indésirable
2. Attendez 2-3 minutes
3. Vérifiez l'adresse email dans votre profil

### Email vide ou sans détections ?
- C'est normal si aucun marché n'a été détecté dans les dernières 24h
- L'email montre quand même le format que vous recevrez
- Créez des alertes avec des critères plus larges

## Test du Système Automatique

Une fois l'email de test validé, le système automatique fonctionnera :

**8h00 (UTC+4)** : Email du matin (si nouvelles détections)
**18h00 (UTC+4)** : Email du soir (si nouvelles détections)

Les détections sont vérifiées **toutes les heures** automatiquement.

## Validation Complète

Pour être sûr que tout fonctionne :

1. ✅ Email de test reçu
2. ✅ Détections correspondant à vos alertes
3. ✅ Liens fonctionnels vers les marchés
4. ✅ Email automatique reçu à 8h ou 18h (le lendemain)

## Questions Fréquentes

**Q : Combien d'emails vais-je recevoir par jour ?**
R : Maximum 2 (matin et soir), uniquement s'il y a de nouvelles détections.

**Q : Puis-je désactiver un des deux digests ?**
R : Oui, dans Paramètres > Notifications, vous pouvez désactiver le digest du matin ou du soir.

**Q : L'email de test montre-t-il des vraies détections ?**
R : Oui, il montre vos détections réelles des dernières 24h. Si vous n'en avez pas, il montre un aperçu du format.

**Q : Combien de temps avant de recevoir des détections ?**
R : Les alertes sont vérifiées toutes les heures. Si un nouveau marché correspond à vos critères, vous le verrez dans l'heure qui suit sa publication.

## Support

Documentation complète : `TEST-EMAIL-DIGEST.md`
Configuration CRON : `CRON-QUICKSTART.md`

Tout fonctionne ? Vous êtes prêt ! Les emails automatiques seront envoyés 2 fois par jour.
