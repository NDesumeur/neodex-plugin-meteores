# Météores

Un jeu de tir spatial à défilement vertical : ton vaisseau tire tout seul, à toi de l'emmener partout sur l'écran pour détruire les météores, les drones ennemis et un vaisseau amiral toutes les 5 vagues, sans te faire toucher.

*English version: [README.en.md](README.en.md)*

## Commandes

- **Flèches**, **ZQSD** ou **souris** : déplacer le vaisseau dans tout l'écran.
- Le vaisseau **tire tout seul**.
- **Espace** ou **clic droit** : **bombe**, qui nettoie l'écran (une par vague au moins).
- **P** ou **Échap** : pause.
- **Manette** : stick gauche ou croix pour bouger, **A** pour jouer, **B** ou **X** : bombe, **Start** : pause.
- **Plein écran** : le bouton du même nom ; Échap pour en sortir. Hors plein écran, le jeu prend toute la hauteur que laisse la fenêtre.

## Règles

- Seul le **cockpit** (le point blanc au centre du vaisseau) peut être touché : on peut frôler les tirs.
- Les **météores** se divisent en deux plus petits quand on les casse.
- Les **drones** arrivent en vagues, zigzaguent et tirent.
- Toutes les 5 vagues, une alerte annonce un **vaisseau amiral** ; il lâche une pluie de bonus quand il est détruit.
- Tu commences avec 3 vies. Être touché coûte une vie, un niveau d'arme et ton multiplicateur ; quelques instants d'invincibilité suivent.

## Bonus

- **P** : arme plus forte (5 niveaux ; au maximum, 500 points à la place).
- **Bombe** : une bombe de plus (5 au plus).
- **S** : bouclier pendant 15 secondes.
- **L** : une vie de plus (6 au plus).
- **Aimant** : attire tous les bonus pendant 10 secondes.
- Des éclats à ramasser pour des points.

## Points

Chaque ennemi détruit rapporte des points, multipliés par ton **multiplicateur** : il monte de 0,5 tous les 10 ennemis détruits sans être touché, jusqu'à ×8, et retombe si tu restes 4 secondes sans rien détruire. Chaque vague nettoyée rapporte 200 points par numéro de vague.

## Sons et musique

Tout est joué en direct, sans fichier : une musique de jeu vidéo à l'ancienne (basse, batterie et une mélodie tirée à chaque partie), plus rapide et plus sombre face au vaisseau amiral ; des sons pour les tirs, les explosions, la bombe, les bonus, l'alerte et la fin. Les boutons **Musique** et **Sons** coupent l'un ou l'autre, et ton choix est gardé. La musique se tait en pause.

## Textes

Les textes du jeu sont en grosses lettres pixel : le score en haut, et un écran titre, une pause et une fin de partie lisibles de loin.

## Statistiques

En fin de partie : ton score, la vague atteinte et ton record (ou « nouveau record »). À côté du jeu : ton meilleur score, ta meilleure vague et ton nombre de parties.

## Données et synchronisation

Ton record et ta meilleure vague sont enregistrés par NeoDex, sauvegardés et synchronisés entre tes PC si la synchro est activée.

## Installer

Dans NeoDex : **NeoStore → À découvrir → Météores → Installer**.

Développer un plugin : voir le [SDK NeoDex](https://github.com/NDesumeur/neodex-sdk).
