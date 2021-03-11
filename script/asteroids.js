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
// Variables globales
// SELECTEUR HTML
const HTML_body = document.querySelector("*");

// Pour le texte
var text;
var endText;
var endTextScore;
var endTextReturn;

var titleText;
var startText;
var initiateGame = false;

// Score
var score = 0;
var comboMultiplier = 1;

// Pour les tirs
var bullet;
var bulletGroup;
var tempNot = false;
var lastShot = 0;
var cooldown = 300;
var cooldownBeam = 0;
var bulletSpeed = 1500;
var activateAnim = false;

// Pour les asteroids
var asteroid;
var numberOfAsteroids = 4;

// Pour le vaisseau
var ship;
var hp = 0;
var shipHp;
var shipHpGroup;

var tempX;
var tempY;

// POUR LA MUSIQUE
var beat1;
var beat2;
var speedRate = 1100;
var ifActive = true;

var thrustSound;
var dieSound;
var shipIsDead = false;

var explosionSound1;
var explosionSound2;
var explosionSound3;

var shotSound1;
var shotSound2;
var shotSound3;
var machineGun;

// Tableau de musique (pour appeler des sons différents aléatoirement)
explosionTab = [];
shotTab = [];

// Autre
var readyToReset = false;
var cursors;
let keyR;

// Particle
var particles;

// c-c-c-combo
var smallCombo = 0;
var checkpoint = false;
var comboBar;
var comboBarGroup;
var comboCheckpoint;

var smallComboTab;
var bigComboTab;

var superComboActive = false;

var hit = false;
var beam;
var beamGroup;
var activateSuperShot = false;
var superShot = false;

var comboSound;
var comboEnd;
var superCombo;

// Initialisation de phaser
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
}
function create() {
  // Ici on vas initialiser les variables, l'affichage ...
  // Initialisation des particle
  particles = this.add.particles("explodot");

  // Initialisation du son
  beat1 = this.sound.add("beat1", { volume: 0.5 });
  beat2 = this.sound.add("beat2", { volume: 0.5 });

  thrustSound = this.sound.add("thrust", { volume: 0.3 });
  dieSound = this.sound.add("die", { volume: 0.3 });

  explosionSound1 = this.sound.add("explosion1", { volume: 0.1 });
  explosionSound2 = this.sound.add("explosion2", { volume: 0.1 });
  explosionSound3 = this.sound.add("explosion3", { volume: 0.1 });

  shotSound1 = this.sound.add("shot1", { volume: 0.2, detune: -100 });
  shotSound2 = this.sound.add("shot2", { volume: 0.2, detune: -100 });
  shotSound3 = this.sound.add("shot3", { volume: 0.2, detune: -100 });
  machineGun = this.sound.add("machineGun", { volume: 0.8 });

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

  // Pour les tableaux de son
  explosionTab.push(explosionSound1, explosionSound2, explosionSound3);
  shotTab.push(shotSound1, shotSound2, shotSound3);

  // Initialisation des sprites
  ship = this.physics.add.sprite(400, 300, "ship");
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
  text = this.add.bitmapText(10, 15, "pixelFont", "", 20);
  endText = this.add
    .bitmapText(
      this.cameras.main.worldView.x + this.cameras.main.width / 2,
      this.cameras.main.worldView.y + this.cameras.main.height / 2 - 20,
      "pixelFont",
      "",
      32
    )
    .setOrigin(0.5);
  endTextScore = this.add
    .bitmapText(
      this.cameras.main.worldView.x + this.cameras.main.width / 2,
      this.cameras.main.worldView.y + this.cameras.main.height / 2 + 30,
      "pixelFont",
      "",
      32
    )
    .setOrigin(0.5);
  endTextReturn = this.add
    .bitmapText(
      this.cameras.main.worldView.x + this.cameras.main.width / 2,
      this.cameras.main.worldView.y + this.cameras.main.height / 2 + 70,
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
}
function update() {
  // C'est la boucle principale du jeu
  if (cursors.up.isDown) {
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
            smallCombo = 0;
            console.log("combo reset");
            comboSound.detune = -200;
            comboEnd.detune = -2000;
            resetComboBar();
          }
        }
        currentBullet.destroy();
      }, 500);
    } else if (!initiateGame) {
      initiateGame = true;
      resetGameEnd(true);

      setTimeout(() => {
        tempNot = true;
      }, 300);
    }
  }

  if (isShiftDown.isDown && !activateSuperShot && ship.active) {
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
      if (ship.active && tempNot) {
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
        }, 300);
      }
    }
  }

  this.physics.world.wrap(ship, 25);
  this.physics.world.wrap(asteroidsGroup, 50);
  this.physics.world.wrap(bulletGroup, 25);

  if (keyR.isDown && readyToReset) {
    console.log("Reset !");
    resetGameBegin();
  }
}

getCurrentTime();

function generateAsteroid(physics, number) {
  // config.width = 1440
  // config.height = 810
  if (speedRate > 200) {
    speedRate -= 100;
  }
  let iterator = 0;
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
    if (iterator > 3) {
      iterator = 0;
    }

    var currentAsteroid = asteroidsGroup.create(
      posArray[iterator].x,
      posArray[iterator].y,
      "asteroid"
    );

    currentAsteroid.angle = getRandomInt(360);
    let rad = Phaser.Math.DegToRad(currentAsteroid.angle);
    physics.velocityFromRotation(
      rad,
      100 + getRandomInt(100),
      currentAsteroid.body.velocity
    );
    currentAsteroid.setScale(1.5);

    iterator++;
  }
}

function generateAsteroid2(physics, asteroid, scale) {
  for (let i = 0; i < 2; i++) {
    var currentAsteroid2 = asteroidsGroup.create(
      asteroid.x,
      asteroid.y,
      "asteroid"
    );

    currentAsteroid2.setScale(scale);
    currentAsteroid2.angle = getRandomInt(360);
    let rad = Phaser.Math.DegToRad(currentAsteroid2.angle);
    physics.velocityFromRotation(
      rad,
      200 + getRandomInt(50) + (scale == 0.5 ? getRandomInt(100) : 0),
      currentAsteroid2.body.velocity
    );
  }
}

function getCurrentTime() {
  let time = Date.now();
  return time;
}

function killAsteroid(projectile, asteroid) {
  let dot = particles.createEmitter({
    x: asteroid.x,
    y: projectile.y,
    speed: 250,
    frequency: 20,
    lifespan: 300,
  });

  setTimeout(() => {
    dot.on = false;
  }, 100);

  if (!superShot) {
    comboSound.play();
    console.log(comboSound.detune);
    comboSound.detune += 200;
    smallCombo++;
  }
  console.log(smallCombo);
  if (smallCombo == 5) {
    checkpoint = true;
  }

  if (smallCombo == 10) {
    superComboActive = true;
    blinkComboBar(100);
    cooldown = 100;
    console.log("SUPER COMBOOOO");
    playSuperComboSound(1600);
    setTimeout(() => {
      superComboActive = false;
      superCombo.stop();
      checkpoint = false;
      cooldown = 300;
      smallCombo = 0;
      comboSound.detune = -200;
      resetComboBar(true);
    }, 3000);
  }

  updateComboBar(smallCombo);

  explosionTab[getRandomInt(3)].play();
  if (asteroid.scale == 1.5) {
    generateAsteroid2(this.physics, asteroid, 1);
    dot.setScale(1.5);
  } else if (asteroid.scale == 1) {
    generateAsteroid2(this.physics, asteroid, 0.5);
    dot.setScale(1.2);
  }

  projectile.destroy();
  asteroid.destroy();
  score += 16 * comboMultiplier; // Le multiplicateur de combo servira plus tard hihi
  let scoreFormated = zeroPad(score, 6);
  text.setText(`SCORE:${scoreFormated}`);

  if (smallCombo >= 10) {
    comboMultiplier = 2;
  } else if (smallCombo >= 5) {
    comboMultiplier = 1.5;
  } else {
    comboMultiplier = 1;
  }

  if (asteroidsGroup.children.size == 0) {
    numberOfAsteroids++;
    setTimeout(() => {
      generateAsteroid(this.physics, numberOfAsteroids);
    }, 1000);
  }
}

function killPlayer(ship) {
  if (ship.alpha == 1 && !shipIsDead) {
    superComboActive = false;
    if (smallCombo > 0) {
      comboEnd.play();
    }
    smallCombo = 0;
    comboSound.detune = -200;
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
    console.log("ship ded");
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
      smallCombo = 0;
      comboSound.detune = -200;
      resetComboBar(true);
      console.log("T'as perdu mdr");
      ship.disableBody(true, true);
      endGame();
    }
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function zeroPad(number, size) {
  let stringNumber = String(number);
  while (stringNumber.length < (size || 2)) {
    stringNumber = "0" + stringNumber;
  }
  return stringNumber;
}

function destroyLife() {
  shipHpGroup.getChildren()[shipHpGroup.getChildren().length - 1].destroy();
}

// Fonctionne aussi bien pour l'initialisation de vie qu'à un ajout via powerup
function addLife(numberOfLife) {
  if ((shipHpGroup.getChildren().length = 0)) {
    shipHp = shipHpGroup.create(config.width - 30, 25, "shipHp");
    shipHp.setScale(0.4);
    hp++;
  } else {
    for (let i = 0; i < numberOfLife; i++) {
      hp++;
      shipHp = shipHpGroup.create(
        config.width - 30 - shipHpGroup.getChildren().length * 45,
        25,
        "shipHp"
      );
      shipHp.setScale(0.4);
    }
  }
}

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

function endGame() {
  ifActive = false;
  readyToReset = true;
  let scoreFormated = zeroPad(score, 6);
  endText.setText("GAME OVER");
  endTextScore.setText(`SCORE:${scoreFormated}`);
  endTextReturn.setText("PRESS R TO RESTART");
  blinkTextFunction(endTextReturn, 600);
}

function resetGameBegin() {
  readyToReset = false;
  shipIsDead = false;
  endText.setText("");
  endTextScore.setText("");
  endTextReturn.setText("");
  let size = asteroidsGroup.children.size;
  let i = 0;
  cleanAsteroids(i, size, 100);
}

function cleanAsteroids(i, size, delay) {
  setTimeout(() => {
    asteroidsGroup.getChildren()[0].destroy();
    i++;
    i == size ? resetGameEnd() : cleanAsteroids(i, size, delay);
  }, delay);
}

function resetGameEnd(isInitiate = false) {
  speedRate = 1100;
  activateSuperShot = false;
  numberOfAsteroids = 4;
  score = 0;

  if (isInitiate) {
    var tween = this.GLOBAL_Tween.add({
      targets: titleText,
      y: 1000 + titleText.y,
      ease: "Quad.easeIn",
      duration: 1500,
      repeat: 0,
      onComplete: function () {
        titleText.setText("");
      },
      callbackScope: this,
    });

    var tween = this.GLOBAL_Tween.add({
      targets: startText,
      y: 1000 + startText.y,
      ease: "Quad.easeIn",
      duration: 1500,
      repeat: 0,
      onComplete: function () {
        startText.setText("");
        comboBarGroup.setVisible(true);
        comboCheckpoint.setVisible(true);
      },
      callbackScope: this,
    });
  } else {
    text.setText("SCORE:000000");
    addLife(3);
  }

  ship.angle = -90;

  let x = config.width / 2;
  let y = config.height + 20;
  ship.enableBody(true, x, y, true, true);

  ship.alpha = 0.5;

  var tween = this.GLOBAL_Tween.add({
    targets: ship,
    y: config.height / 2,
    ease: isInitiate ? "Quad.easeInOut" : "Power1",
    duration: 1500,
    repeat: 0,
    onComplete: function () {
      ship.body.velocity.y = 0;
      ship.alpha = 1;
      ifActive = true;
      playMusic();
      generateAsteroid(GLOBAL_Physics, numberOfAsteroids);
      if (isInitiate) {
        text.setText("SCORE:000000");
        addLife(3);
      }
    },
    callbackScope: this,
  });
}

function blinkTextFunction(blinkText, delay, blinker = false) {
  metronom = blinker;
  if (blinkText.text != "") {
    setTimeout(() => {
      blinkText.setVisible(metronom);
      blinkTextFunction(blinkText, delay, !metronom);
    }, delay);
  } else {
    blinker = false;
  }
}

function blinkComboBar(delay, blinker = false) {
  metronom = blinker;
  if (superComboActive) {
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

function resetComboBar(fullreset = false) {
  comboCheckpoint.alpha = 0.4;

  for (let i = 9; i >= (checkpoint && !fullreset ? 5 : 0); i--) {
    comboBarGroup.getChildren()[i].alpha = 0.4;
  }

  checkpoint = false;
}

function playSuperComboSound(duration) {
  if (superComboActive) {
    superCombo.play();
    setTimeout(() => {
      playSuperComboSound(duration);
    }, duration);
  }
}
