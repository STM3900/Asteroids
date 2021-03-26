# Asteroids

Fait en +60h avec phaser.js, pour un projet d'école

## Jouer au jeu

Vous pouvez jouer au jeu directement depuis votre navigateur, en cliquant [ici](http://theo.anawens.fr/)

## But du jeu

Dans Asteroids, vous contrôlez un petit vaiseau qui dois faire le meilleur score, en détruisant le plus d'astéroides, avant d'être à court de vies. Aidez-vous de votre SuperTir et du SuperCombo pour faire des ravages !

## Touches

- Utilisez ← et → pour orianter votre vaisseau, ↑ pour accélérer
- Utilisez la touche espace pour tirer
- Utilisez shift pour faire un SuperTir (un seul disponible par vie)

## Système de combo

Quand vous enchainer plusieurs tir réussi à la suite, votre combo augmente.

- Votre combo se rénitialise quand vous rater un tir (sauf checkpoint)
- Quand votre combo arrive à 5, vous avez un checkpoint
- Un checkpoint permet en cas de tir raté, de reset le combo à 5 au lieu de 0
- Au bout de 10 tir réussi, vous activez le SuperCombo

> Quand votre combo arrive à 5, il active un multiplicateur de score de 1.5

### SuperCombo

Le SuperCombo augmente temporairement votre cadence de tir ainsi que votre multiplicateur de combo. Une fois celui-ci écoulé, votre combo actuel est ajouté au score, en le multipliant par deux (si le combo est égal à 20 on gagne 40 points) et celui-ci est remis à 0.

---

Et voila ! J'espère que vous aimerez le jeu, et bonne chance pour rentrer dans le classement ~
