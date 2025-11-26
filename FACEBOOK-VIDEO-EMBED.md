# Intégration Vidéo Facebook - Instructions

## ✅ Vidéo Facebook Intégrée sur la Page d'Accueil

La section vidéo de la page d'accueil est maintenant configurée pour afficher une vidéo Facebook en mode embed.

## 📋 Comment Obtenir le Code d'Embed de Votre Vidéo Facebook

### Méthode 1 : Via Facebook (Recommandée)

1. **Aller sur votre vidéo Facebook**
   - Connectez-vous à Facebook
   - Accédez à votre page : https://www.facebook.com/LeMarchéPublic
   - Trouvez la vidéo que vous voulez intégrer

2. **Obtenir le code d'embed**
   - Cliquez sur les 3 points (`...`) en haut à droite de la vidéo
   - Sélectionnez **"Intégrer"** ou **"Embed"**
   - Copiez le code iframe généré

3. **Format du code**
   Le code ressemblera à ceci :
   ```html
   <iframe
     src="https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2FLeMarch%C3%A9Public%2Fvideos%2F123456789%2F&show_text=false&width=560"
     width="560"
     height="314"
     style="border:none;overflow:hidden"
     scrolling="no"
     frameborder="0"
     allowfullscreen="true"
     allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
   </iframe>
   ```

### Méthode 2 : Via le Page Plugin de Facebook

1. **Aller sur Facebook for Developers**
   - Visitez : https://developers.facebook.com/docs/plugins/embedded-video-player

2. **Configurer le plugin**
   - URL de la vidéo Facebook
   - Largeur (laissez par défaut)
   - Options d'affichage

3. **Obtenir le code**
   - Cliquez sur "Get Code"
   - Copiez l'URL de l'iframe

## 🔧 Comment Mettre à Jour le Code

### Étape 1 : Extraire l'URL src de l'iframe

De votre code embed Facebook, copiez uniquement l'URL qui se trouve dans l'attribut `src=""`.

**Exemple :**
```
https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2FLeMarch%C3%A9Public%2Fvideos%2F123456789%2F&show_text=false&width=560
```

### Étape 2 : Modifier le fichier Home.tsx

Ouvrez le fichier : `src/components/Landing/Home.tsx`

Cherchez cette section (ligne ~233) :

```typescript
<iframe
  src="https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2FLeMarch%C3%A9Public%2Fvideos%2F1234567890%2F&show_text=false&width=560&t=0"
  className="w-full h-full"
  style={{ border: 'none', overflow: 'hidden' }}
  scrolling="no"
  frameBorder="0"
  allowFullScreen={true}
  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
/>
```

**Remplacez** l'URL dans `src=""` par votre URL de vidéo Facebook.

### Étape 3 : Rebuild et Deploy

```bash
npm run build
```

Puis déployez sur Netlify.

## 🎯 Exemple de Remplacement

### AVANT (code actuel - vidéo exemple)
```typescript
src="https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2FLeMarch%C3%A9Public%2Fvideos%2F1234567890%2F&show_text=false&width=560&t=0"
```

### APRÈS (votre vraie vidéo)
```typescript
src="https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2FLeMarch%C3%A9Public%2Fvideos%2F987654321%2F&show_text=false&width=560&t=0"
```

## 📍 Localisation dans le Code

**Fichier :** `/src/components/Landing/Home.tsx`
**Ligne :** ~234
**Section :** VIDEO DEMO SECTION

```typescript
{/* VIDEO DEMO SECTION */}
<Section className="py-16 bg-white">
  <div className="text-center mb-12">
    <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
      Découvrez l'interface en vidéo
    </h2>
    ...
  </div>
  <div className="max-w-5xl mx-auto">
    <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
      <div className="aspect-video">
        <iframe
          src="METTEZ_VOTRE_URL_ICI"
          ...
        />
      </div>
    </div>
  </div>
</Section>
```

## ✅ Vérifications Effectuées

- ✅ **CSP mis à jour** pour autoriser Facebook embeds
  - `script-src` : autorise `https://www.facebook.com`
  - `frame-src` : autorise `https://www.facebook.com`
  - `img-src` : autorise `https://*.fbcdn.net`
  - `media-src` : autorise `https://www.facebook.com` et `https://*.fbcdn.net`

- ✅ **Design responsive**
  - Aspect ratio 16:9 maintenu
  - S'adapte à toutes les tailles d'écran
  - Shadow et border-radius pour un look moderne

- ✅ **Permissions iframe**
  - `allowFullScreen` activé
  - Autoplay, clipboard-write, encrypted-media activés
  - Picture-in-picture et web-share activés

## 🎨 Personnalisation (Optionnel)

Vous pouvez personnaliser l'apparence en modifiant :

### Titre de la section
```typescript
<h2 className="text-3xl md:text-4xl font-extrabold mb-4">
  Votre Titre Personnalisé
</h2>
```

### Description
```typescript
<p className="text-lg text-gray-600">
  Votre description personnalisée
</p>
```

### Largeur du conteneur
Changez `max-w-5xl` par :
- `max-w-4xl` (plus petit)
- `max-w-6xl` (plus grand)
- `max-w-7xl` (très large)

## 🔍 Trouver l'ID de Votre Vidéo Facebook

L'ID de la vidéo se trouve dans l'URL de votre vidéo Facebook :

**Format :**
```
https://www.facebook.com/LeMarchéPublic/videos/[ID_VIDEO]/
```

**Exemple :**
```
https://www.facebook.com/LeMarchéPublic/videos/987654321/
                                                 ^^^^^^^^^^^
                                                 Ceci est l'ID
```

## 🚨 Résolution de Problèmes

### La vidéo ne s'affiche pas ?

1. **Vérifiez la visibilité**
   - La vidéo doit être publique (pas privée)
   - La page Facebook doit être publiée

2. **Vérifiez l'URL**
   - L'URL doit être correctement encodée
   - Format : `https%3A%2F%2Fwww.facebook.com%2F...`

3. **Vérifiez le CSP**
   - Le Content Security Policy doit autoriser Facebook
   - Déjà configuré dans `index.html`

4. **Testez l'iframe directement**
   ```html
   <!-- Copiez ceci dans un fichier HTML pour tester -->
   <iframe
     src="VOTRE_URL_FACEBOOK"
     width="560"
     height="314"
     style="border:none"
   ></iframe>
   ```

### La vidéo est trop petite/grande ?

Le conteneur s'adapte automatiquement grâce à :
- `className="w-full h-full"` (100% de largeur et hauteur)
- `aspect-video` (maintient le ratio 16:9)

## 📞 Support

Pour toute question :
- **Email :** contact@lemarchepublic.fr
- **Documentation Facebook :** https://developers.facebook.com/docs/plugins/embedded-video-player

## 🔗 Liens Utiles

- [Facebook Video Embed Plugin](https://developers.facebook.com/docs/plugins/embedded-video-player)
- [Facebook for Developers](https://developers.facebook.com/)
- [Générateur d'Embed Facebook](https://developers.facebook.com/docs/plugins/embedded-video-player/)
