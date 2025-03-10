class DNAInvaders extends Phaser.Scene {
    constructor() {
        super();
        this.player = null;
        this.bases = null;
        this.score = 0;
        this.scoreText = null;
        this.timeText = null;
        this.timeElapsed = 0; // Initialize time elapsed
        this.initialSpeed = 100;
        this.baseSpeed = this.initialSpeed;
        this.gameOver = false;
        this.baseMap = {
            'A': 'T',
            'T': 'A',
            'C': 'G',
            'G': 'C'
        };
        this.spawnTimer = null;
    }

    preload() {
        // Load all assets
        this.load.image('background', 'https://play.rosebud.ai/assets/spaceBackground.png?6raj');
        this.load.image('player', 'https://play.rosebud.ai/assets/playerShip.png?o23j');
        this.load.image('baseA', 'https://play.rosebud.ai/assets/baseA.png?mxca');
        this.load.image('baseT', 'https://play.rosebud.ai/assets/baseT.png?ia9u');
        this.load.image('baseC', 'https://play.rosebud.ai/assets/baseC.png?P2uw');
        this.load.image('baseG', 'https://play.rosebud.ai/assets/baseG.png?IDuh');
        this.load.image('explosion', 'https://play.rosebud.ai/assets/explosion.png?kNr4');
    }

    create() {
        // Set background
        const background = this.add.image(400, 300, 'background');
        const scaleX = 800 / background.width;
        const scaleY = 600 / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);

        // Create player
        this.player = this.add.sprite(400, 550, 'player');
        this.player.setScale(0.1); // Scale down the player ship to appropriate size
        this.player.setRotation(-Math.PI / 4); // Rotate 90 degrees counterclockwise to face upward

        // Create group for falling bases
        this.bases = this.add.group();

        // Add score text
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Arial'
        });
        // Add timer text
        this.timeText = this.add.text(600, 16, 'Time: 0s', {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Arial'
        });
        // Timer event for updating game time
        this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
        // Setup keyboard input
        this.input.keyboard.on('keydown', this.handleInput, this);

        // Start spawning bases
        this.spawnTimer = this.time.addEvent({
            delay: 2000,
            callback: this.spawnBase,
            callbackScope: this,
            loop: true
        });
    }

    spawnBase() {
        if (this.gameOver) return;

        const baseTypes = ['A', 'T', 'C', 'G'];
        const randomBase = baseTypes[Math.floor(Math.random() * baseTypes.length)];
        const x = Phaser.Math.Between(50, 750);

        // Create container for base
        const baseObject = this.add.container(x, -50);

        // Add base sprite
        const baseSprite = this.add.sprite(0, 0, 'base' + randomBase);
        baseSprite.setScale(0.1); // Scale down the base sprites to appropriate size

        // Add text on top
        const text = this.add.text(0, 0, randomBase, {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
        text.setOrigin(0.5);

        baseObject.add([baseSprite, text]);

        // Add to physics
        this.physics.world.enable(baseObject);
        baseObject.body.setVelocity(0, this.baseSpeed);

        // Store the base type
        baseObject.baseType = randomBase;

        this.bases.add(baseObject);
    }

    handleInput(event) {
        if (this.gameOver) return;

        const key = event.key.toUpperCase();
        if (['A', 'T', 'C', 'G'].includes(key)) {
            let destroyed = false;

            this.bases.getChildren().forEach(baseObject => {
                if (this.baseMap[baseObject.baseType] === key) {
                    // Create explosion effect
                    this.createExplosion(baseObject.x, baseObject.y);

                    // Remove base
                    baseObject.destroy();

                    // Increase score
                    this.score += 10;
                    this.scoreText.setText('Score: ' + this.score);

                    destroyed = true;
                }
            });

            if (!destroyed) {
                // Wrong key penalty
                this.score -= 5;
                this.scoreText.setText('Score: ' + this.score);
                this.cameras.main.shake(200, 0.005); // Add screen shake for wrong input
            }
        }
    }

    createExplosion(x, y) {
        const explosion = this.add.sprite(x, y, 'explosion');
        explosion.setScale(0.2); // Scale down explosion sprite

        // Create fade out effect
        this.tweens.add({
            targets: explosion,
            alpha: 0,
            scale: 0.4,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                explosion.destroy();
            }
        });
    }
    updateTimer() {
        if (this.gameOver) return;
        this.timeElapsed++;
        const minutes = Math.floor(this.timeElapsed / 60);
        const seconds = this.timeElapsed % 60;
        const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        this.timeText.setText('Time: ' + formattedTime);
    }
    update() {
        if (this.gameOver) return;
        // Increase base speed based on score (every 50 points increases speed by 20)
        this.baseSpeed = this.initialSpeed + Math.floor(this.score / 50) * 20;
        // Check for bases reaching bottom
        this.bases.getChildren().forEach(baseObject => {
            if (baseObject.y > 600) {
                this.gameOver = true;
                this.add.text(400, 300, 'GAME OVER', {
                    fontSize: '64px',
                    fill: '#fff',
                    fontFamily: 'Arial'
                }).setOrigin(0.5);
                this.spawnTimer.remove();
                return;
            }
        });
    }
}

const container = document.getElementById('renderDiv');
const config = {
    type: Phaser.AUTO,
    parent: container,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: DNAInvaders
};

window.phaserGame = new Phaser.Game(config);
