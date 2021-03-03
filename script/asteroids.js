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
var text;
var score = 0;
var bullet;
var lastShot = 0;
var cooldown = 300;
var bulletSpeed = 1500;
var activateAnim = false;

let keyA;

var game = new Phaser.Game(config);
function preload() {
  // C'est là qu'on vas charger les images et les sons 100 90
  this.load.image("bullet", "img/sprite/bullet.png");
  this.load.spritesheet("ship", "img/sprite/ship_animation.png", {
    frameWidth: 100,
    frameHeight: 90,
  });
  this.load.image("asteroid", "img/sprite/asteroid.png");
  // this.load.image("ship", "img/ship.png");
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
  ship.setDrag(0.99);
  //Règle la vitesse maximale de notre vaiseau
  ship.setMaxVelocity(300);

  cursors = this.input.keyboard.createCursorKeys();
  spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  text = this.add.text(10, 10, "", { font: "16px Courier", fill: "#ffffff" });
  text.setText(`Score : ${score}`);

  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  asteroidsGroup = this.physics.add.group();

  this.physics.add.overlap(ship, asteroidsGroup, killPlayer, null, this);
  generateAsteroid(this.physics);
}
function update() {
  // C'est la boucle principale du jeu
  if (cursors.up.isDown) {
    if (!activateAnim) {
      ship.play("ship_movement", true);
      activateAnim = true;
    }
    this.physics.velocityFromRotation(
      ship.rotation,
      300,
      ship.body.acceleration
    );
  } else {
    ship.setAcceleration(0);
    if (activateAnim) {
      ship.play("ship_stop", true);
      activateAnim = false;
    }
  }

  if (cursors.left.isDown) {
    ship.setAngularVelocity(-300);
  } else if (cursors.right.isDown) {
    ship.setAngularVelocity(300);
  } else {
    ship.setAngularVelocity(0);
  }

  if (spaceBar.isDown && getCurrentTime() >= lastShot + cooldown) {
    bullets = this.physics.add.group();
    var currentBullet = bullets.create(ship.x, ship.y, "bullet");

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

    //TODO : Que les bullets se destroy à la sortie de l'écran (utiliser le config.width et height pour bricoler un truc)
  }

  if (keyA.isDown && getCurrentTime() >= lastShot + cooldown) {
    generateAsteroid(this.physics);
    lastShot = getCurrentTime();
  }

  this.physics.world.wrap(ship, 25);
  this.physics.world.wrap(asteroidsGroup, 50);
}

getCurrentTime();

function generateAsteroid(physics) {
  // config.width = 1440
  // config.height = 810
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

  for (let i = 0; i < posArray.length; i++) {
    var currentAsteroid = asteroidsGroup.create(
      posArray[i].x,
      posArray[i].y,
      "asteroid"
    );

    currentAsteroid.angle = getRandomInt(360);
    let rad = Phaser.Math.DegToRad(currentAsteroid.angle);
    physics.velocityFromRotation(rad, 200, currentAsteroid.body.velocity);
    currentAsteroid.setScale(1.5);
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
    physics.velocityFromRotation(rad, 200, currentAsteroid2.body.velocity);
  }
}

function getCurrentTime() {
  var time = Date.now();
  return time;
}

function destroy(sprite) {
  sprite.destroy();
  console.log("Sprite détruit !");
}

function killAsteroid(projectile, asteroid) {
  if (asteroid.scale == 1.5) {
    generateAsteroid2(this.physics, asteroid, 1);
  } else if (asteroid.scale == 1) {
    generateAsteroid2(this.physics, asteroid, 0.5);
  }
  projectile.destroy();
  asteroid.destroy();
  score++;
  text.setText(`Score : ${score}`);
}

function killPlayer(ship, asteroid) {
  console.log("lol t mor");
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
