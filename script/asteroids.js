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
var ship;
var cursors;
var asteroid;
var numberOfAsteroids = 4;
var text;
var score = 0;
var comboMultiplier = 1;
var bullet;
var bulletGroup;
var lastShot = 0;
var cooldown = 300;
var bulletSpeed = 1500;
var activateAnim = false;

let keyA;

var tempX;
var tempY;

var game = new Phaser.Game(config);
function preload() {
  // C'est là qu'on vas charger les images et les sons 100 90
  this.load.image("bullet", "img/sprite/bullet.png");
  this.load.spritesheet("ship", "img/sprite/ship_animation.png", {
    frameWidth: 100,
    frameHeight: 90,
  });
  this.load.image("asteroid", "img/sprite/asteroid.png");
  this.load.bitmapFont("pixelFont", "img/font/font.png", "img/font/font.xml");
}
function create() {
  // Ici on vas initialiser les variables, l'affichage ...

  //Sprite de notre vaisseau
  bullet = this.physics.add.sprite(13, 37, "bullet");
  bullet.destroy();
  ship = this.physics.add.sprite(400, 300, "ship");
  asteroid = this.physics.add.sprite(600, 600, "asteroid");
  asteroid.destroy();

  this.anims.create({
    key: "ship_movement",
    frames: this.anims.generateFrameNumbers("ship", {
      start: 0,
      end: 6,
    }),
    frameRate: 24,
    repeat: 0,
  });

  this.anims.create({
    key: "ship_stop",
    frames: this.anims.generateFrameNumbers("ship", {
      start: 6,
      end: 0,
    }),
    frameRate: 24,
    repeat: 0,
  });

  //On lui donne une plus petite taille
  ship.setScale(0.5);

  //Règle la méthode de décélération
  ship.setDamping(true);
  //Réglage de la vitesse de décélération
  ship.setDrag(0.5);
  //Règle la vitesse maximale de notre vaiseau
  ship.setMaxVelocity(400);

  cursors = this.input.keyboard.createCursorKeys();
  spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  text = this.add.bitmapText(10, 10, "pixelFont", "SCORE : 000000", 32);

  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  asteroidsGroup = this.physics.add.group();
  bulletGroup = this.physics.add.group();

  this.physics.add.overlap(ship, asteroidsGroup, killPlayer, null, this);
  generateAsteroid(this.physics, numberOfAsteroids);
  console.log(asteroidsGroup.children.size);
}
function update() {
  // C'est la boucle principale du jeu
  if (cursors.up.isDown) {
    if (true) {
      if (!activateAnim) {
        ship.play("ship_movement", true);
        activateAnim = true;
      }
      this.physics.velocityFromRotation(
        ship.rotation,
        1000,
        ship.body.acceleration
      );
    }
  } else {
    ship.setAcceleration(0);
    if (activateAnim) {
      ship.play("ship_stop", true);
      activateAnim = false;
    }
  }

  if (cursors.left.isDown) {
    ship.setAngularVelocity(-400);
  } else if (cursors.right.isDown) {
    ship.setAngularVelocity(400);
  } else {
    ship.setAngularVelocity(0);
  }

  if (spaceBar.isDown && getCurrentTime() >= lastShot + cooldown) {
    if (ship.active) {
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
        currentBullet.destroy();
      }, 500);
    }
  }

  this.physics.world.wrap(ship, 25);
  this.physics.world.wrap(asteroidsGroup, 50);
  this.physics.world.wrap(bulletGroup, 25);
}

getCurrentTime();

function generateAsteroid(physics, number) {
  // config.width = 1440
  // config.height = 810
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
  var time = Date.now();
  return time;
}

function killAsteroid(projectile, asteroid) {
  if (asteroid.scale == 1.5) {
    generateAsteroid2(this.physics, asteroid, 1);
  } else if (asteroid.scale == 1) {
    generateAsteroid2(this.physics, asteroid, 0.5);
  }
  projectile.destroy();
  asteroid.destroy();
  score += 15 * comboMultiplier; // Le multiplicateur de combo servira plus tard hihi
  let scoreFormated = zeroPad(score, 6);
  text.setText(`SCORE : ${scoreFormated}`);

  if (asteroidsGroup.children.size == 0) {
    numberOfAsteroids++;
    setTimeout(() => {
      generateAsteroid(this.physics, numberOfAsteroids);
    }, 1000);
  }
}

function killPlayer(ship, asteroid) {
  if (ship.alpha == 1) {
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
        },
        callbackScope: this,
      });
    }, 500);
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
