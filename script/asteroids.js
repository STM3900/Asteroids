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
var text;
var bullet;
var lastShot = 0;
var cooldown = 500;
var activateAnim = false;

var game = new Phaser.Game(config);
function preload() {
  // C'est là qu'on vas charger les images et les sons 100 90
  this.load.image("bullet", "img/sprite/bullet.png");
  this.load.spritesheet("ship", "img/sprite/ship_animation.png", {
    frameWidth: 100,
    frameHeight: 90,
  });
  // this.load.image("ship", "img/ship.png");
}
function create() {
  // Ici on vas initialiser les variables, l'affichage ...

  //Sprite de notre vaisseau
  bullet = this.physics.add.sprite(13, 37, "bullet");
  bullet.destroy();
  ship = this.physics.add.sprite(400, 300, "ship");

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
  //text = this.add.text(10, 10, "", { font: "16px Courier", fill: "#00ff00" });
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

  //text.setText("Speed: " + ship.body.speed);
  if (spaceBar.isDown && getCurrentTime() >= lastShot + cooldown) {
    bullets = this.physics.add.group();
    var currentBullet = bullets.create(ship.x, ship.y, "bullet");

    currentBullet.angle = ship.angle + 90;
    var rad = Phaser.Math.DegToRad(ship.angle);
    this.physics.velocityFromRotation(rad, 600, currentBullet.body.velocity);
    //currentBullet.events.onOutOfBounds.add(destroy, this);

    lastShot = getCurrentTime();
  }

  this.physics.world.wrap(ship, 50);

  // bullets.forEachExists(screenWrap, this);
}

getCurrentTime();

function getCurrentTime() {
  var time = Date.now();
  return time;
}

function destroy(sprite) {
  sprite.destroy();
  console.log("Sprite détruit !");
}
