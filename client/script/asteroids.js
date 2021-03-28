//TODO
// - Améliorer le code (optimisation et fragmentation en fonctions et fichers)
// - Système de pause et pour couper le son
// - Bonus (pour ralentir le temps ou jsp ?)
// - Amélioration de l'affichage
// - Amélioration du gameplay etou

// Initialisation du classement pour faire la requete
let scoreList = [];
let isScoreListAvaible = false;

// Initialise les valeurs de scoreList en fonction de si l'api fonctionne ou non
getScoreList();

/**
 * Initialisation des variables et du jeu
 */
var config = {
  parent: "asteroids", // Affiche le jeu dans le div id="asteroids"
  width: 1440,
  height: 810,
  physics: {
    default: "arcade", // Permet d'appliquer un set de mouvements aux objets
    arcade: {
      gravity: {
        y: 0,
      },
    },
  },
  scene: {
    preload: preload, // Chargement des ressources
    create: create, // Initialisation des variables & objets
    update: update, // Fonction appelée 60 fois par seconde
  },
};
/**
 * Variables globales
 */
// SELECTEUR HTML
const HTML_body = document.querySelector("*");

// Texte
var scoreText; // Le score qui sera affiché à l'écran
var endText; // Texte de fin, affiche "GAME OVER"
var endTextScore; // Score affiché sur l'écran de fin
var endTextReturn; // Texte affiché sur l'écran de fin, affiche "Press r to restart"

var titleText; // Le titre du jeu, affiché sur l'écran titre (logique)
var startText; // Texte affiché sur l'écran titre : "press space to start"
var initiateGame = false; // Variable indiquant si la game est initialisé (quand on appuie sur espace)
var authorText; // Texte affichant par qui a été fait le jeu

// Score
var score = 0; // Le score du joueur
var comboMultiplier = 1; // Le multiplicateur du combo

// Classements
var scoreListText; // String qui contient tout le classement - utilisé pour l'affichage
var scoreListRectangle; // Un rectangle qui overlap le meilleur score pour le selectionner
var scoreListRectangleY; // Position Y du rectangle
var readyToType = false; // Indique si l'ont peut écrire dans le classement
var readyToSubmit = false; // Indique si le score est prêt à être envoyé
var readyToSend = false; // Indique si le score est envoyé
var scoreName = ""; // Contient le nom que rentre le joueur quand il fait un HS
var highScoreId = null; // L'id du meilleur score
var bestScore = null; // String contenant le meilleur score et son nom, sert au lancement du jeu

// Pour les tirs
var bullet; // Un tir
var bulletGroup; // Le groupe de tirs
var tempNot = false; // le status du cooldown : Impossible de tirer quand il est à true
var lastShot = 0; // Temps depuis le dernier tir
var cooldown = 300; // Temps de recharge entre chaque tir (est changé dans le supercombo)
var cooldownBeam = 0; // Temps de recharge du SuperTir (est à zéro car c'est un SuperTir quand même)
var bulletSpeed = 1500; // Vitesse du tir
var activateAnim = false; // Active l'animation du vaisseau ou non

// Pour les asteroids
var asteroid; // Un asteroide
var numberOfAsteroids = 4; // Le nombre d'asteroides à générer
var asteroidWrap = true; // Indique si les asteroides wrap sur la bordure du jeu (sert dans l'animation de lancement)

// Pour le vaisseau
var ship; // Le vaiseau, l'unique, le meilleur
var hp = 0; // Nombre de vies (elles sont instanciés dans le create())
var shipHp; // L'icone de la vie du vaisseau
var shipHpGroup; // Le groupe des icones de vies du vaisseau

// POUR LA MUSIQUE
// (Oui, la musique est composé de deux notes.)
var beat1; // Premier beat de la musique
var beat2; // Second beat de la musique

var speedRate = 1100; // Vitesse de lecture de la musique (moins elle est élevé, plus la musique va vite)
var ifActive = true; // Si la musique est active, oupa

// Les sons
var thrustSound; // Le son du moteur du vaiseau
var dieSound; // Quand le vaiseau meurt (nullos)
var shipIsDead = false; // Permet de savoir si le vaiseau est mort

// Les 3 sons différents pour les explosions (d'asteroides)
var explosionSound1;
var explosionSound2;
var explosionSound3;

// Les 3 sons différents pour les tirs du vaiseau (normal et SuperCombo)
var shotSound1;
var shotSound2;
var shotSound3;

// Son du tir du SuperTir (C'est une gatling en fait)
var machineGun;

// Les 3 sons différents pour la saisie du clavier
var typing1;
var typing2;
var typing3;

var cancel; // Son quand on cancel la saisie (quand on appuie sur backspace)
var resetAsteroid; // Son quand l'asteroide est reset
var resetAsteroidPitch = 0; // Le pitch de resetAsteroid

var scoreSent; // Son quand le score est envoyé
var startShip; // Son quand le vaiseau arrive sur le board

var comboSound; // Son du combo
var comboEnd; // Son joué quand on perd le combo
var superCombo; // Son du SuperCombo

// Tableau de musique (pour appeler des sons différents aléatoirement)
explosionTab = [];
shotTab = [];
typingTab = [];

// Autre
var readyToReset = false; // Indique si le jeu est prêt à être reset
var cursors; // Permet de get les touches
var infoBar; // Barre d'information sur le jeu;
let keyR; // Permet de get la touche r

// Particle
var particles; // Les particules

// c-c-c-combo
var smallCombo = 0; // Le combo de base
var checkpoint = false; // Indique si le checkpoint de combo est activé ou non
var comboBar; // La bar du combo
var comboBarGroup; // Le groupe de la bar du combo
var comboCheckpoint; // Le point de checkpoint de combo sur la barre

var smallComboTab; // Tableau regroupant les points de combo (points = carré pour l'affichage)
var superComboActive = false; // Indique si le superCombo est actif

var beam; // Un bullet du SuperTir
var beamGroup; // Le groupe de bullet du SuperTir
var activateSuperShot = false; // Indique si le SuperTir est activé ou non
var superShot = false; // Indique si le SuperTir est actif

var superComboText = ""; // Affiche le combo du SuperCombo
var comboStatusText = ""; // Affiche le multiplicateur du combo (vide, 1.5, 2)

/**
 * Initialisation de phaser
 */
var game = new Phaser.Game(config);
function preload() {
  // C'est là qu'on vas charger les images et les sons
  this.load.image("bullet", "img/sprite/bullet.png"); // Tir
  this.load.spritesheet("ship", "img/sprite/ship_animation.png", {
    // Vaisseau
    frameWidth: 100,
    frameHeight: 90,
  });
  this.load.spritesheet("shipHp", "img/sprite/ship_animation.png", {
    // Barre de vie
    frameWidth: 100,
    frameHeight: 90,
  });
  this.load.image("asteroid", "img/sprite/asteroid.png"); // Les Asteroids
  this.load.image("infoBar", "img/infobar.jpg"); // La barre d'info
  this.load.bitmapFont("pixelFont", "img/font/font.png", "img/font/font.xml"); // La bitmap de texte

  // Chargement de l'audio
  // musique
  this.load.audio("beat1", "sound/music/beat1.wav");
  this.load.audio("beat2", "sound/music/beat2.wav");

  // vaiseau
  this.load.audio("thrust", "sound/ship/thrust.wav");
  this.load.audio("die", "sound/ship/die.wav");

  // explosions des asteroids
  this.load.audio("explosion1", "sound/explosion/explosion1.wav");
  this.load.audio("explosion2", "sound/explosion/explosion2.wav");
  this.load.audio("explosion3", "sound/explosion/explosion3.wav");

  // tirs
  this.load.audio("shot1", "sound/shot/shot1.wav");
  this.load.audio("shot2", "sound/shot/shot2.wav");
  this.load.audio("shot3", "sound/shot/shot3.wav");
  this.load.audio("machineGun", "sound/shot/machine_gun.wav");

  // particule
  this.load.image("explodot", "img/sprite/dot_explosion_smol.png");
  this.load.image("rectangleSprite", "img/sprite/dot_explosion_smol.png");

  // combo
  this.load.image("comboMetter", "img/sprite/dot_explosion_smol.png");
  this.load.image("comboCheckpoint", "img/sprite/dot_explosion_smol.png");
  this.load.audio("comboSound", "sound/combo/combo1.wav");
  this.load.audio("comboBreak", "sound/combo/comboBreak.wav");
  this.load.audio("superCombo", "sound/combo/supercombo.wav");

  // Score et autres
  this.load.audio("typing1", "sound/ui/typing/typing1.wav");
  this.load.audio("typing2", "sound/ui/typing/typing2.wav");
  this.load.audio("typing3", "sound/ui/typing/typing3.wav");

  this.load.audio("cancel", "sound/ui/typing/cancel.wav");
  this.load.audio("resetAsteroid", "sound/ui/resetAsteroid.wav");
  this.load.audio("scoreSent", "sound/ui/scoreSent.wav");
  this.load.audio("startShip", "sound/ui/startShip.wav");
}
function create() {
  // Ici on vas initialiser les variables, l'affichage ...
  // Initialisation des particle
  particles = this.add.particles("explodot");

  // Initialisation du son
  beat1 = this.sound.add("beat1", { volume: 0.5 });
  beat2 = this.sound.add("beat2", { volume: 0.5 });

  thrustSound = this.sound.add("thrust", { volume: 0.3 }); // Son du propulseur
  dieSound = this.sound.add("die", { volume: 0.3 }); // Son de mort

  // Son des explosions
  explosionSound1 = this.sound.add("explosion1", { volume: 0.1 });
  explosionSound2 = this.sound.add("explosion2", { volume: 0.1 });
  explosionSound3 = this.sound.add("explosion3", { volume: 0.1 });

  // Son des tirs
  shotSound1 = this.sound.add("shot1", { volume: 0.2, detune: -100 });
  shotSound2 = this.sound.add("shot2", { volume: 0.2, detune: -100 });
  shotSound3 = this.sound.add("shot3", { volume: 0.2, detune: -100 });
  machineGun = this.sound.add("machineGun", { volume: 0.8 });

  // Sons des combos
  comboSound = this.sound.add("comboSound", { volume: 0.3, detune: -200 });
  comboEnd = this.sound.add("comboBreak", {
    volume: 0.3,
    detune: -2000,
    rate: 1.3,
  });
  superCombo = this.sound.add("superCombo", {
    volume: 0.2,
    detune: 1000,
    rate: 0.1,
  });

  // Son de saisie
  typing1 = this.sound.add("typing1", { volume: 0.3 });
  typing2 = this.sound.add("typing2", { volume: 0.3 });
  typing3 = this.sound.add("typing3", { volume: 0.3 });

  // Son d'annulation
  cancel = this.sound.add("cancel", { volume: 0.2 });

  // Sons pour le reset de la partie
  resetAsteroid = this.sound.add("resetAsteroid", {
    volume: 0.4,
    detune: -400,
  });

  scoreSent = this.sound.add("scoreSent", {
    volume: 0.3,
    detune: -600,
    rate: 1.4,
  });

  startShip = this.sound.add("startShip", {
    volume: 0.4,
    rate: 0.4,
    detune: 1000,
  });

  // Pour les tableaux de son
  explosionTab.push(explosionSound1, explosionSound2, explosionSound3);
  shotTab.push(shotSound1, shotSound2, shotSound3);
  typingTab.push(typing1, typing2, typing3);

  // Initialisation des sprites
  ship = this.physics.add.sprite(400, 300, "ship").setImmovable(true);
  ship.setSize(25, 22.5, true);
  shipHp = this.physics.add.sprite(400, 300, "ship");

  bullet = this.physics.add.sprite(13, 37, "bullet");
  asteroid = this.physics.add.sprite(600, 600, "asteroid");

  comboBar = this.physics.add.sprite(400, 300, "comboMetter");
  comboCheckpoint = this.physics.add.sprite(
    config.width / 2,
    25,
    "comboMetter"
  );
  comboCheckpoint.tint = 0xffff00;
  comboCheckpoint.setScale(1.5);
  comboCheckpoint.alpha = 0.4;

  infoBar = this.physics.add.sprite(
    this.cameras.main.worldView.x + this.cameras.main.width / 2,
    30,
    "infoBar"
  );

  infoBar.setScale(0.6);

  // On détruit les sprites que l'ont utilise pas (sert pour les groupes)
  shipHp.destroy();
  bullet.destroy();
  asteroid.destroy();
  comboBar.destroy();

  // Animation pour le déplacement du vaiseau
  this.anims.create({
    key: "ship_movement",
    frames: this.anims.generateFrameNumbers("ship", {
      start: 0,
      end: 6,
    }),
    frameRate: 24,
    repeat: 0,
  });

  // Animation pour le l'arret
  this.anims.create({
    key: "ship_stop",
    frames: this.anims.generateFrameNumbers("ship", {
      start: 6,
      end: 0,
    }),
    frameRate: 24,
    repeat: 0,
  });

  // Configuration du vaisseau

  // On lui donne une plus petite taille
  ship.setScale(0.5);
  // Règle la méthode de décélération
  ship.setDamping(true);
  // Réglage de la vitesse de décélération
  ship.setDrag(0.5);
  // Règle la vitesse maximale de notre vaiseau
  ship.setMaxVelocity(400);

  // Configuration des variables d'input
  cursors = this.input.keyboard.createCursorKeys();
  keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  isShiftDown = this.input.keyboard.addKey(
    Phaser.Input.Keyboard.KeyCodes.SHIFT
  );

  // Initialisation des textes
  scoreText = this.add.bitmapText(10, 15, "pixelFont", "", 20);
  endText = this.add
    .bitmapText(
      this.cameras.main.worldView.x + this.cameras.main.width / 2,
      this.cameras.main.worldView.y + this.cameras.main.height / 2 - 160,
      "pixelFont",
      "",
      32
    )
    .setOrigin(0.5);

  highScoreText = this.add
    .bitmapText(
      this.cameras.main.worldView.x + this.cameras.main.width / 2,
      this.cameras.main.worldView.y + this.cameras.main.height / 2 - 75,
      "pixelFont",
      "",
      16
    )
    .setOrigin(0.5);

  endTextScore = this.add
    .bitmapText(
      this.cameras.main.worldView.x + this.cameras.main.width / 2,
      this.cameras.main.worldView.y + this.cameras.main.height / 2 - 110,
      "pixelFont",
      "",
      32
    )
    .setOrigin(0.5);

  endTextReturn = this.add
    .bitmapText(
      this.cameras.main.worldView.x + this.cameras.main.width / 2,
      this.cameras.main.worldView.y + this.cameras.main.height / 2 + 280,
      "pixelFont",
      "",
      10
    )
    .setOrigin(0.5);

  titleText = this.add
    .bitmapText(
      this.cameras.main.worldView.x + this.cameras.main.width / 2,
      this.cameras.main.worldView.y + this.cameras.main.height / 2 - 20,
      "pixelFont",
      "ASTEROIDS",
      48
    )
    .setOrigin(0.5);

  startText = this.add
    .bitmapText(
      this.cameras.main.worldView.x + this.cameras.main.width / 2,
      this.cameras.main.worldView.y + this.cameras.main.height / 2 + 30,
      "pixelFont",
      "PRESS SPACE TO START",
      16
    )
    .setOrigin(0.5);

  authorText = this.add
    .bitmapText(60, 790, "pixelFont", "By Theo", 12)
    .setOrigin(0.5);

  bestScoreText = this.add
    .bitmapText(
      this.cameras.main.worldView.x + this.cameras.main.width / 2,
      -25,
      "pixelFont",
      "",
      24
    )
    .setOrigin(0.5);

  bestScoreTextLabel = this.add
    .bitmapText(
      this.cameras.main.worldView.x + this.cameras.main.width / 2,
      -60,
      "pixelFont",
      "",
      24
    )
    .setOrigin(0.5);

  superComboText = this.add
    .bitmapText(
      this.cameras.main.worldView.x + this.cameras.main.width / 2,
      this.cameras.main.worldView.y + this.cameras.main.height / 2,
      "pixelFont",
      "",
      24
    )
    .setOrigin(0.5);
  superComboText.visible = false;
  superComboText.alpha = 0.5;

  scoreListEnter = this.add
    .bitmapText(
      this.cameras.main.worldView.x + this.cameras.main.width / 2,
      this.cameras.main.worldView.y + this.cameras.main.height / 2 + 240,
      "pixelFont",
      "",
      16
    )
    .setOrigin(0.5);

  scoreListText = this.add
    .bitmapText(
      this.cameras.main.worldView.x + this.cameras.main.width / 2,
      this.cameras.main.worldView.y + this.cameras.main.height / 2 + 90,
      "pixelFont",
      "",
      24
    )
    .setOrigin(0.6, 0.5);

  scoreListRectangleY =
    this.cameras.main.worldView.y + this.cameras.main.height / 2 - 10;

  scoreListRectangle = this.add.rectangle(
    this.cameras.main.worldView.x + this.cameras.main.width / 2,
    scoreListRectangleY,
    500,
    40,
    0x000000
  );
  scoreListRectangle.visible = false;
  scoreListRectangle.active = false;

  comboStatusText = this.add.bitmapText(10, 45, "pixelFont", "", 16);

  // Création des groupes de sprite
  asteroidsGroup = this.physics.add.group();
  bulletGroup = this.physics.add.group();
  shipHpGroup = this.physics.add.group();
  beamGroup = this.physics.add.group();
  comboBarGroup = this.physics.add.group();

  // Collisions
  this.physics.add.overlap(ship, asteroidsGroup, killPlayer, null, this);

  //Initialisation des variables globales de create()
  GLOBAL_Physics = this.physics;
  GLOBAL_Tween = this.tweens;

  // Désactivation du vaisseau pour le menu de départ
  ship.disableBody(true, true);

  //Clignotement du texte dans le menu
  blinkTextFunction(startText, 600);

  // Pour le rayon
  beam = this.physics.add.sprite(13, 37, "bullet");
  beam.destroy();

  // Combo
  generateComboBar();
  comboBarGroup.setVisible(false);
  comboCheckpoint.setVisible(false);

  // génération des asteroids du menu
  generateAsteroid(this.physics, 8);
}
function update() {
  // C'est la boucle principale du jeu
  if (cursors.up.isDown && ship.active) {
    if (!activateAnim) {
      thrustSound.play({ loop: true });
      ship.play("ship_movement", true);
      activateAnim = true;
    }
    this.physics.velocityFromRotation(
      ship.rotation,
      superShot ? 150 : 1000,
      ship.body.acceleration
    );
  } else {
    ship.setAcceleration(0);
    if (activateAnim) {
      ship.play("ship_stop", true);
      thrustSound.stop();
      activateAnim = false;
    }
  }

  if (cursors.left.isDown) {
    superShot ? ship.setAngularVelocity(-50) : ship.setAngularVelocity(-400);
  } else if (cursors.right.isDown) {
    superShot ? ship.setAngularVelocity(50) : ship.setAngularVelocity(400);
  } else {
    ship.setAngularVelocity(0);
  }

  if (spaceBar.isDown && getCurrentTime() >= lastShot + cooldown) {
    if (ship.active && tempNot) {
      shotTab[getRandomInt(3)].play();
      var currentBullet = bulletGroup.create(ship.x, ship.y, "bullet");

      currentBullet.angle = ship.angle + 90;
      let rad = Phaser.Math.DegToRad(ship.angle);
      this.physics.velocityFromRotation(
        rad,
        bulletSpeed,
        currentBullet.body.velocity
      );

      this.physics.add.overlap(
        currentBullet,
        asteroidsGroup,
        killAsteroid,
        null,
        this
      );
      lastShot = getCurrentTime();

      setTimeout(() => {
        if (currentBullet._eventsCount != 0 && !superComboActive) {
          if (checkpoint) {
            smallCombo = 5;

            comboSound.detune = 600;
            comboEnd.play();
            comboEnd.detune = -1500;

            resetComboBar();
          } else {
            if (smallCombo > 0) {
              comboEnd.play();
            }
            resetCombo();
          }
        }
        currentBullet.destroy();
      }, 500);
    } else if (!initiateGame) {
      initiateGame = true;
      resetGameEnd(true);
      slideDown();

      setTimeout(() => {
        tempNot = true;
      }, 1500);
    }
  }

  if (isShiftDown.isDown && !activateSuperShot && ship.active && tempNot) {
    resetComboBar(true);
    machineGun.play();
    activateSuperShot = true;

    HTML_body.classList.add("super-shot");

    superShot = true;
    ship.setMaxVelocity(200);

    setTimeout(() => {
      superShot = false;
      ship.setMaxVelocity(400);

      HTML_body.classList.remove("super-shot");
    }, 1500);
  }

  if (superShot) {
    if (getCurrentTime() >= lastShot + cooldownBeam) {
      if (ship.active) {
        var currentBeam = beamGroup.create(ship.x, ship.y, "rectangleSprite");

        currentBeam.setScale(2);
        currentBeam.angle = ship.angle + 90;
        let rad = Phaser.Math.DegToRad(ship.angle);
        this.physics.velocityFromRotation(rad, 2200, currentBeam.body.velocity);

        this.physics.add.overlap(
          currentBeam,
          asteroidsGroup,
          killAsteroid,
          null,
          this
        );
        lastShot = getCurrentTime();
        setTimeout(() => {
          currentBeam.destroy();
        }, 500);
      } else if (!initiateGame) {
        initiateGame = true;
        resetGameEnd(true);

        setTimeout(() => {
          tempNot = true;
        }, 1500);
      }
    }
  }

  this.physics.world.wrap(ship, 25);
  this.physics.world.wrap(bulletGroup, 25);
  if (asteroidWrap) this.physics.world.wrap(asteroidsGroup, 50);

  if (keyR.isDown && readyToReset && (readyToSend || !highScoreId)) {
    console.log("Reset !");
    resetGameBegin();
  }
}

/**
 *
 * @param {Le moteur physique} physics
 * @param {Le nombre d'astéroides à créer} number
 */
function generateAsteroid(physics, number) {
  // Accélère la musique si celle-ci n'est pas déjà à son maximum
  if (speedRate > 200) speedRate -= 100;
  let iterator = 0;

  /**
   * Le tableau des différentes positions possibles
   * Les asteroides, ne peuvent spawner que dans les coins du bord (évite de se faire instant kill)
   */
  let posArray = [
    {
      x: 0 + getRandomInt(100),
      y: 0 + getRandomInt(100),
    },
    {
      x: config.width - getRandomInt(100),
      y: 0 + getRandomInt(100),
    },
    {
      x: config.width - getRandomInt(100),
      y: config.height - getRandomInt(100),
    },
    {
      x: 0 + getRandomInt(100),
      y: config.height - getRandomInt(100),
    },
  ];

  for (let i = 0; i < number; i++) {
    // Permet de "tourner en rond" sur le spawn des astéroides
    if (iterator > 3) {
      iterator = 0;
    }

    // On crée un astéroide, avec une position sur un coin
    var currentAsteroid = asteroidsGroup.create(
      posArray[iterator].x,
      posArray[iterator].y,
      "asteroid"
    );

    // On lui donne un angle aléatoire, qui défininra sa trajectoire (en ligne droite)
    currentAsteroid.angle = getRandomInt(360);
    let rad = Phaser.Math.DegToRad(currentAsteroid.angle);
    physics.velocityFromRotation(
      rad,
      100 + getRandomInt(100), // La vitesse est aussi en partie aléatoire
      currentAsteroid.body.velocity
    );
    currentAsteroid.setScale(1.5);

    iterator++;
  }
}

/**
 *
 * @param {Le moteur physique} physics
 * @param {L'asteroide} asteroid
 * @param {La taille de celui-ci (permet de calculer sa vitesse)} scale
 */
function generateSmallerAsteroid(physics, asteroid, scale) {
  for (let i = 0; i < 2; i++) {
    // On crée deux astéroides à la position de celui qu'on vient de toz
    var currentAsteroid2 = asteroidsGroup.create(
      asteroid.x,
      asteroid.y,
      "asteroid"
    );

    // On lui règle la bonne taille
    currentAsteroid2.setScale(scale);
    currentAsteroid2.angle = getRandomInt(360);
    let rad = Phaser.Math.DegToRad(currentAsteroid2.angle);
    physics.velocityFromRotation(
      rad,
      200 + getRandomInt(50) + (scale == 0.5 ? getRandomInt(100) : 0), // La vitesse de l'astéroide sera plus rapide si il est plus petit !
      currentAsteroid2.body.velocity
    );
  }
}

/**
 *
 * @returns Renvoit le timestamp actuel
 */
function getCurrentTime() {
  let time = Date.now();
  return time;
}

/**
 *
 * @param {Un tir du vaisseau} projectile
 * @param {L'astéroide touché} asteroid
 */
function killAsteroid(projectile, asteroid) {
  // On génère l'effet de particule
  let dot = particles.createEmitter({
    x: asteroid.x,
    y: projectile.y,
    speed: 250,
    frequency: 20,
    lifespan: 300,
  });

  // La particule dure 100ms
  setTimeout(() => {
    dot.on = false;
  }, 100);

  // Si on utilise pas le SuperTir, on ajoute au combo
  if (!superShot) {
    comboSound.play();
    comboSound.detune += 200;
    smallCombo++;
    if (superComboText.visible) {
      // Affichage du SuperCombo
      superComboText.scale = 1 + smallCombo / 10;
      superComboText.setText(smallCombo);
    }
  }
  if (smallCombo == 5) {
    checkpoint = true;
  } else if (smallCombo == 10) {
    // Activation du SuperCombo
    superComboActive = true;
    superComboText.scale = 1 + smallCombo / 10;
    superComboText.setText(smallCombo);
    superComboText.visible = true;

    blinkComboBar(100);

    cooldown = 100; // On fait tirer le vaiseau beaucoup plus rapidement
    console.log("SUPER COMBOOOO");
    playSuperComboSound(1600);

    setTimeout(() => {
      superComboActive = false;
      superComboText.visible = false;
      superCombo.stop();
      cooldown = 300;

      // Ajoute le score du combo de fin x2
      addScore(smallCombo * 2);

      resetCombo(true);
    }, 3000);
  }

  updateComboBar(smallCombo);

  explosionTab[getRandomInt(3)].play();

  projectile.destroy();
  asteroid.destroy();
  addScore();

  if (smallCombo >= 10) {
    comboMultiplier = 2;
    if (comboStatusText.scoreText == "x1.5") {
      comboStatusText.setText("x2");
    }
  } else if (smallCombo >= 5) {
    comboMultiplier = 1.5;
    if (comboStatusText.scoreText == "") {
      comboStatusText.setText("x1.5");
      blinkTextFunction(comboStatusText, 400);
    }
  } else {
    comboMultiplier = 1;
    comboStatusText.setText("");
  }

  if (asteroidsGroup.children.size == 0) {
    numberOfAsteroids++;
    setTimeout(() => {
      generateAsteroid(this.physics, numberOfAsteroids);
    }, 1000);
  }

  if (asteroid.scale == 1.5) {
    generateSmallerAsteroid(this.physics, asteroid, 1);
    dot.setScale(1.5);
  } else if (asteroid.scale == 1) {
    generateSmallerAsteroid(this.physics, asteroid, 0.5);
    dot.setScale(1.2);
  }
}

/**
 *
 * @param {Le vaisseau} ship
 */
function killPlayer(ship) {
  // empèche que le vaisseau meurt plusieurs fois à la suite
  if (ship.alpha == 1 && !shipIsDead) {
    superComboActive = false;
    if (smallCombo > 0) comboEnd.play();

    resetCombo();
    resetComboBar(true);
    superShot = false;
    activateSuperShot = false;

    let dot = particles.createEmitter({
      x: ship.x,
      y: ship.y,
      speed: 250,
      frequency: 0,
      lifespan: 350,
    });

    dot.setScale(1.5);

    setTimeout(() => {
      dot.on = false;
    }, 110);

    shipIsDead = true;
    dieSound.play();
    hp--;
    destroyLife();
    if (hp > 0) {
      ship.angle = -90;
      ship.disableBody(true, true);

      setTimeout(() => {
        let x = config.width / 2;
        let y = config.height;
        ship.enableBody(true, x, y, true, true);

        ship.alpha = 0.5;

        var tween = this.tweens.add({
          targets: ship,
          y: config.height / 2,
          ease: "Power1",
          duration: 1500,
          repeat: 0,
          onComplete: function () {
            ship.body.velocity.y = 0;
            ship.alpha = 1;
            shipIsDead = false;
          },
          callbackScope: this,
        });
      }, 500);
    } else {
      resetCombo();
      resetComboBar(true);
      ship.disableBody(true, true);
      endGame();
    }
  }
}

/**
 *
 * @param {La valeur maximale de l'interval} max
 * @returns Un nombre aléatoire entre 0 et valeur max - 1
 */
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/**
 *
 * @param {Le nombre} number
 * @param {La taille du score à renvoyer} size
 * @returns un score formaté (ex zeroPad(12, 6) => 000012)
 */
function zeroPad(number, size) {
  let stringNumber = String(number);
  while (stringNumber.length < (size || 2)) {
    stringNumber = "0" + stringNumber;
  }
  return stringNumber;
}

/**
 * Enlève une vie sur le groupe des vies
 */
function destroyLife() {
  shipHpGroup.getChildren()[shipHpGroup.getChildren().length - 1].destroy();
}

/**
 * Fonctionne aussi bien pour l'initialisation de vie qu'à un ajout via powerup
 * @param {Le nombre de vies (int)} numberOfLife
 */
function addLife(numberOfLife) {
  if ((shipHpGroup.getChildren().length = 0)) {
    shipHp = shipHpGroup.create(config.width - 30, 25, "shipHp");
    shipHp.setScale(0.4);
    hp++;
  } else {
    for (let i = 0; i < numberOfLife; i++) {
      shipHp = shipHpGroup.create(
        config.width - 30 - shipHpGroup.getChildren().length * 45,
        25,
        "shipHp"
      );
      shipHp.setScale(0.4);
      hp++;
    }
  }
}

/**
 * Fonction pour jouer la musique du jeu
 * La musique fait deux notes, et on augmente sa cadence au fûr et à mesure du jeu
 */
function playMusic() {
  beat1.play();
  setTimeout(() => {
    beat2.play();
    setTimeout(() => {
      if (ifActive) {
        playMusic();
      }
    }, speedRate);
  }, speedRate);
}

/**
 * Déclenché quand il y a un Game Over
 */
function endGame() {
  ifActive = false;
  readyToReset = true;

  endText.setText("GAME OVER");
  endTextScore.setText(`SCORE:${zeroPad(score, 6)}`);

  //Vérifie si le classement est disponible, sinon ne l'affiche pas
  if (isScoreListAvaible) {
    scoreListRectangle.active = true;
    checkBestScore(score, scoreList);
  } else {
    endText.y += 140;
    endTextScore.y += 140;
    endTextReturn.y -= 160;
  }

  // Vérifie si il y a un nouveau HS et agit en conséquences
  if (highScoreId == null) {
    endTextReturn.setText("PRESS R TO RESTART");
    blinkTextFunction(endTextReturn, 600);
    endTextReturn.y -= 40;
  } else {
    endText.y -= 20;
    endTextScore.y -= 20;
    highScoreText.setText("New high score");
    blinkTextFunction(highScoreText, 600, true);
  }
}

/**
 * Première fonction du reset de la partie
 * (Le reset de la partie ce fait en 3 temps :
 * - resetGameBegin
 * - cleanAsteroids
 * - resetGameEnd
 * )
 */
function resetGameBegin() {
  readyToReset = false;
  shipIsDead = false;
  scoreListRectangle.active = false;
  scoreListRectangle.visible = false;
  firstUpdate = true;

  if (highScoreId) {
    endText.y += 20;
    endTextScore.y += 20;
  } else {
    endTextReturn.y += 40;
  }

  if (!isScoreListAvaible) {
    endText.y -= 140;
    endTextScore.y -= 140;
    endTextReturn.y += 160;
  }

  getScoreList();
  highScoreId = 0;
  readyToSend = false;
  scoreName = "";

  scoreListText.setText("");
  endText.setText("");
  endTextScore.setText("");
  highScoreText.setText("");
  scoreListEnter.setText("");
  endTextReturn.setText("");

  let size = asteroidsGroup.children.size;
  let i = 0;
  cleanAsteroids(i, size, 100);
}

/**
 * Seconde partie du reset
 * @param {itérateur} i
 * @param {la taille du groupe d'astéroides} size
 * @param {le délais entre chaque explosion} delay
 */
function cleanAsteroids(i, size, delay) {
  setTimeout(() => {
    resetAsteroid.play();
    resetAsteroidPitch += 100;

    resetAsteroid.detune = resetAsteroidPitch;
    asteroidsGroup.getChildren()[0].destroy();

    i++;
    i == size ? resetGameEnd() : cleanAsteroids(i, size, delay);
  }, delay);
}

/**
 * La dernière partie du reset
 * Remet les variables à leurs valeurs initiales et relance la partie
 * @param {Permet de savoir si la fonction est un lancement de partie ou un reset} isInitiate
 */
function resetGameEnd(isInitiate = false) {
  // On remet les valeurs des variable à leurs initiale
  speedRate = 1100;
  activateSuperShot = false;
  numberOfAsteroids = 4;
  score = 0;
  resetAsteroidPitch = 0;

  // Si on est au lancement de la partie
  if (isInitiate) {
    asteroidWrap = false;

    slideDownText(titleText);
    slideDownText(startText);
    slideDownText(authorText);
    slideDownText(infoBar, true);

    // Si le classement est disponible, affiche le meilleur score, 0.8 seconde après
    if (isScoreListAvaible) {
      setTimeout(() => {
        showBestScoreText();
      }, 800);
    }
  } else {
    scoreText.setText("SCORE:000000");
    addLife(3);
  }

  // Met le vaiseau à la verticale
  ship.angle = -90;

  // On positionne le vaisseau en bas de l'écran, hors du cadre du jeu
  let x = config.width / 2;
  let y = config.height + 20;
  ship.enableBody(true, x, y, true, true);
  ship.alpha = 0.5;

  // On joue le son du vaiseau en décalé pour que ce soit un peu plus agréable à écouter
  setTimeout(() => {
    startShip.play();
  }, 100);

  var tween = this.GLOBAL_Tween.add({
    targets: ship,
    y: config.height / 2,
    ease: isInitiate ? "Quad.easeInOut" : "Power1", // Change la transition du vaiseau si on lance la partie, ou si c'est pendant un respawn
    duration: isScoreListAvaible && isInitiate ? 2500 : 1500, // La durée change si on peut afficher le meilleur score
    repeat: 0,
    onComplete: function () {
      // Lancement de la partie
      ship.body.velocity.y = 0;
      ship.alpha = 1;
      ifActive = true;

      playMusic();

      generateAsteroid(GLOBAL_Physics, numberOfAsteroids);

      // Lancé au lancement de la partie
      if (isInitiate) {
        scoreText.setText("SCORE:000000");
        addLife(3);
        comboBarGroup.setVisible(true);
        comboCheckpoint.setVisible(true);
        asteroidWrap = true;
      }
    },
    callbackScope: this,
  });
}

/**
 * Pour faire clignoter du texte
 * @param {Le texte à faire clignoter} blinkText
 * @param {Le delais entre chaque blink} delay
 * @param {Utilisé dans la fonction pour le clignotement} blinker
 */
function blinkTextFunction(blinkText, delay, blinker = false) {
  metronom = blinker;
  if (blinkText.text != "") {
    // La fonction s'arrête automatiquement dès que le texte devient vide
    setTimeout(() => {
      blinkText.setVisible(metronom);
      blinkTextFunction(blinkText, delay, !metronom);
    }, delay);
  } else {
    blinker = false;
  }
}

/**
 * Pour faire clignoter la barre de combo lors du SuperCombo
 * @param {Le delais entre chaque blink} delay
 * @param {Utilisé dans la fonction pour le clignotement} blinker
 */
function blinkComboBar(delay, blinker = false) {
  metronom = blinker;
  if (superComboActive) {
    // Désactive le clignotement quand on est plus en SuperCombo
    setTimeout(() => {
      for (let i = 0; i < 10; i++) {
        metronom
          ? (comboBarGroup.getChildren()[i].alpha = 0.4)
          : (comboBarGroup.getChildren()[i].alpha = 0);
      }
      metronom ? (comboCheckpoint.alpha = 0.4) : (comboCheckpoint.alpha = 0);
      blinkComboBar(delay, !metronom);
    }, delay);
  } else {
    blinker = false;
  }
}

/**
 * Fait apparaitre la barre de combo
 */
function generateComboBar() {
  for (let i = 0; i < 10; i++) {
    comboBar = comboBarGroup.create(
      config.width / 2 +
        comboBarGroup.getChildren().length * 40 -
        195 +
        (comboBarGroup.getChildren().length >= 5 ? 30 : 0),
      25,
      "comboMetter"
    );
    comboBar.alpha = 0.4;
  }
}

/**
 *
 * @param {La valeur du combo} combo
 */
function updateComboBar(combo) {
  if (combo <= 10) {
    for (let i = 0; i < combo; i++) {
      comboBarGroup.getChildren()[i].alpha = 1;
    }
  }
  if (checkpoint && !superComboActive) {
    comboCheckpoint.alpha = 1;
  }
}

/**
 * Réinitialise le combo
 * @param {Si c'est un reset partiel ou total du combo} fullreset
 */
function resetCombo(fullreset = false) {
  console.log("combo reset");
  smallCombo = 0;
  checkpoint = false;
  comboStatusText.setText("");
  comboSound.detune = -200;
  comboEnd.detune = -2000;
  resetComboBar(fullreset);
}

/**
 *
 * @param {Si c'est un reset partiel ou total du combo} fullreset
 */
function resetComboBar(fullreset = false) {
  comboCheckpoint.alpha = 0.4;

  for (let i = 9; i >= (checkpoint && !fullreset ? 5 : 0); i--) {
    comboBarGroup.getChildren()[i].alpha = 0.4;
  }

  checkpoint = false;
}

/**
 * Joue le son du SuperCombo
 * @param {Durée du son} duration
 */
function playSuperComboSound(duration) {
  if (superComboActive) {
    superCombo.play();
    setTimeout(() => {
      playSuperComboSound(duration);
    }, duration);
  }
}

/**
 * Activé pendant le lancement de la partie,
 * Fait déscendre les astéroides hors de l'écran de jeu, puis les détruit
 */
function slideDown() {
  for (let i = 0; i < asteroidsGroup.getChildren().length; i++) {
    let children = asteroidsGroup.getChildren()[i];
    var tween = this.GLOBAL_Tween.add({
      targets: children,
      y: 900 + children.y,
      ease: "Quad.easeInOut",
      duration: 1400 + getRandomInt(100),
      repeat: 0,
      onComplete: function () {
        children.destroy();
      },
      callbackScope: this,
    });
  }
}

/**
 * Activé pendant le lancement de la partie,
 * Fait déscendre le texte hors de l'écran puis le met à vide ou le détruit si c'est une image
 * @param {Le text (ou l'image)} text
 * @param {Si le text est une image (est à false par défaut)} isImg
 */
function slideDownText(text, isImg = false) {
  var tween = this.GLOBAL_Tween.add({
    targets: text,
    y: 1000 + text.y,
    ease: "Quad.easeIn",
    duration: 1500,
    repeat: 0,
    onComplete: function () {
      isImg ? text.destroy() : text.setText("");
    },
    callbackScope: this,
  });
}

//TODO : REVOIR COMMENT FAIRE LA DISPOSITION DE TEXTE AVEC UN TABLEAU ETOU
function generateScores(list) {
  scoreListText.setText(`
    ${list[0].id} ${list[0].name}....${list[0].score}\n
    ${list[1].id} ${list[1].name}....${list[1].score}\n
    ${list[2].id} ${list[2].name}....${list[2].score}\n
    ${list[3].id} ${list[3].name}....${list[3].score}\n
    ${list[4].id} ${list[4].name}....${list[4].score}\n
    `);
}

/**
 * Vérifie si le score du joueur dépasse un score du classement
 * @param {Le score du joueur} score
 * @param {Le classement} list
 */
function checkBestScore(score, list) {
  let isNewHighScore = false;
  let i = 0;
  let indexOfNewHighScore = null;

  if (score > 0) {
    while (!isNewHighScore && i < 5) {
      if (score > +list[i].score) {
        indexOfNewHighScore = list[i].id - 1;
        highScoreId = indexOfNewHighScore;
        isNewHighScore = true;
      }
      i++;
    }
    isNewHighScore ? updateScores() : generateScores(list);
  } else {
    generateScores(list);
  }
}

/**
 * Lance l'update du classement, quand il y a un nouvel HS
 */
function updateScores() {
  readyToType = true;
  scoreListRectangle.y = scoreListRectangleY + 45 * highScoreId - 1;
  blinkHighScoreRectangle(600);

  updateScoreDisplay();
}

let firstUpdate = true;

/**
 * Actualise l'affichage du classement, en prenant en compte la saisie de l'utilisateur
 */
function updateScoreDisplay() {
  let scoreFormated = zeroPad(score, 6);
  let scoreNameDisplay = scoreName;

  if (scoreName == "") {
    scoreNameDisplay = "____";
  } else {
    for (let i = 0; i < 4 - scoreName.length; i++) {
      scoreNameDisplay += "_";
    }
  }

  /**
   * Le contenu du if permet de faire un nouveau classement en décallant les scores inférieurs au HS de un cran
   * et ensuite coupant ceux qui sont en dehors du tableau de 5 éléments
   */
  if (firstUpdate) {
    firstUpdate = false;
    let newScoreList = [];

    for (let i = 0; i < highScoreId; i++) {
      newScoreList.push({
        id: scoreList[i].id,
        name: scoreList[i].name,
        score: scoreList[i].score,
      });
    }

    newScoreList.push({
      id: highScoreId - 1,
      name: scoreNameDisplay,
      score: scoreFormated,
    });

    for (let i = highScoreId; i < 5; i++) {
      newScoreList.push({
        id: scoreList[i].id,
        name: scoreList[i].name,
        score: scoreList[i].score,
      });
    }

    newScoreList = newScoreList.slice(0, 5);
    scoreList = newScoreList;
  } else {
    scoreList[highScoreId].score = scoreFormated;
    scoreList[highScoreId].name = scoreNameDisplay;
  }

  // On set les id des scores correctement (de 1 à 5)
  for (i = 1; i < 6; i++) {
    scoreList[i - 1].id = i;
  }

  generateScores(scoreList);
}

/**
 *
 * @param {Le delais en ms} delay
 * @param {Utilisé dans la fonction pour le clignotement} blinker
 */
function blinkHighScoreRectangle(delay, blinker = true) {
  blinker = !blinker;
  scoreListRectangle.visible = true;
  scoreListRectangle.alpha = blinker ? 0 : 0.6;

  if (scoreListRectangle.active) {
    setTimeout(() => {
      blinkHighScoreRectangle(delay, blinker);
    }, delay);
  } else {
    blinker = true;
    scoreListRectangle.visible = false;
    scoreListRectangle.alpha = 0.3;
  }
}

/**
 * EventListener qui se déclange quand on appuie sur une touche
 */
document.addEventListener("keydown", (event) => {
  if (readyToType) {
    const keyCode = event.code;

    if (checkGoodKey(event) && scoreName.length < 4) {
      typingTab[getRandomInt(3)].play();
      const keyName = event.key;
      scoreName += keyName.toUpperCase();
      if (scoreName.length >= 4) {
        readyToSubmit = true;
        scoreListEnter.setText("PRESS ENTER TO SUBMIT");
      } else {
        readyToSubmit = false;
        scoreListEnter.setText("");
      }

      updateScoreDisplay();
    } else if (keyCode == "Backspace" && scoreName.length > 0) {
      cancel.play();
      scoreName = scoreName.slice(0, -1);
      readyToSubmit = false;
      scoreListEnter.setText("");
      updateScoreDisplay();
    } else if (keyCode == "Enter" && readyToSubmit) {
      sendScore();
    }
  }
});

/**
 * Vérifie si l'utilisateur rentre une lettre (fonctionne en azerty et en qwerty)
 * @param {La touche rentrée par l'utilisateur} key
 * @returns true si la touche est valide et false si ce n'est pas le cas
 */
function checkGoodKey(key) {
  const keyCode = key.code;
  const keyValue = key.key;

  let value = false;
  // azerty m qwerty m
  if (
    keyCode == "Semicolon" &&
    keyValue == "m" &&
    !(keyCode == "Semicolon" && keyValue == ";")
  ) {
    value = true;
  }
  // azerty , qwerty ,
  else if (
    !(keyCode == "KeyM" && keyValue == ",") &&
    keyCode == "KeyM" &&
    keyValue == "m"
  ) {
    value = true;
  } else if (
    keyCode.includes("Key") &&
    !(keyCode == "KeyM" && keyValue == ",") &&
    !(keyCode == "Semicolon" && keyValue == ";")
  ) {
    value = true;
  }

  return value;
}

/**
 * Envoie le score dans notre API, qui le mettra dans la BDD
 * (Api => server.js)
 */
function sendScore() {
  // On reset les valeurs de saisie
  readyToType = false;
  readyToSubmit = false;
  readyToSend = true;

  const apiScore = { name: scoreName, score };

  // bip bip c'est la query
  fetch("http://127.0.0.1:8080/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(apiScore),
  })
    // TODO: update score list from the response
    .then(console.log("Score sent !"))
    .catch((error) => console.error("Erreur : " + error));

  console.log(scoreList);
  scoreSent.play();

  scoreListEnter.setText("SCORE SAVED");
  endTextReturn.setText("PRESS R TO RESTART");

  blinkTextFunction(endTextReturn, 600);
}

/**
 * Permet de récupérer la liste des scores, sous un format tableau d'objets
 * Les scores sont stockés dans la bdd, puis sont récupéré via une api
 * (Api => server.js)
 */
function getScoreList() {
  fetch("http://127.0.0.1:8080/scores")
    .then((response) => response.json())
    .then((response) => {
      scoreList = response.map((score) => ({
        ...score,
        score: zeroPad(score.score, 6),
      }));
      isScoreListAvaible = true;
      bestScore = scoreList[0];
      console.log(scoreList);
    })
    .catch((error) => {
      console.error("Erreur : " + error);
      isScoreListAvaible = false;
      bestScore = null;
    });
}

/**
 * Au lancement de la partie, affiche le meilleur score pour taunt le joueur
 */
function showBestScoreText() {
  bestScoreTextLabel.setText("High score");
  bestScoreText.setText(`${bestScore.name} - ${bestScore.score}`);

  const bestScoreTextLabelY = bestScoreTextLabel.y;
  const bestScoreTextY = bestScoreText.y;

  var tween = this.GLOBAL_Tween.add({
    targets: bestScoreTextLabel,
    y: 450 + bestScoreTextLabelY,
    ease: "Quad.easeOut",
    duration: 1000,
    repeat: 0,
    onComplete: function () {
      showBestScoreTextTween(bestScoreTextLabel, bestScoreTextLabelY);
    },
    callbackScope: this,
  });

  var tween = this.GLOBAL_Tween.add({
    targets: bestScoreText,
    y: 450 + bestScoreTextY,
    ease: "Quad.easeOut",
    duration: 1000,
    repeat: 0,
    onComplete: function () {
      showBestScoreTextTween(bestScoreText, bestScoreTextY);
    },
    callbackScope: this,
  });
}

/**
 * Permet de simplifier un peu la fonction showBestScoreText()
 * @param {cible (en l'occurence, le bestScoreText)} target
 * @param {la position y voulue} y
 */
function showBestScoreTextTween(target, y) {
  var tween = this.GLOBAL_Tween.add({
    targets: target,
    y: 1000 + y,
    ease: "Quad.easeIn",
    duration: 1000,
    repeat: 0,
    onComplete: function () {
      bestScoreText.setText("");
    },
    callbackScope: this,
  });
}

/**
 * Ajoute le score voulu à notre score total
 * @param {Le score, si non renseigné est égal à 16} number
 */
function addScore(number = 16) {
  score += number * comboMultiplier;
  scoreText.setText(`SCORE:${zeroPad(score, 6)}`);
  // Valeurs pour la fonction d'animation de score
  // const oldScore = score;
  // increment(number, oldScore);
}

// Fonction qui marche pas trop, pas toucher pour le moment
let incrementVar = 0;
/**
 * Fonction pour faire une animation quand on augmente de score
 * ! Mais elle ne fonctionne pas très bien pour le moment, donc à ne pas utiliser
 * @param {La valeur du score} number
 * @param {L'ancien score} oldScore
 */
function increment(number, oldScore) {
  if (incrementVar <= number) {
    scoreText.setText(`SCORE:${zeroPad(oldScore + incrementVar, 6)}`);
    incrementVar++;
    setTimeout(() => {
      increment(number, oldScore);
    }, 10);
  } else {
    incrementVar = 0;
    console.log(score);
  }
}

// On get le temps actuel
getCurrentTime();
