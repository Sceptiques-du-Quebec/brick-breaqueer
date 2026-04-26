import * as Phaser from "phaser";

export default class RainbowBreaker extends Phaser.Scene {
    constructor() {
        super("RainbowBreaker");
        
        this.paddle = null;
        this.ball = null;
        this.bricks = null;
        this.cursors = null;
        this.enterKey = null;
        this.score = 0;
        this.level = 0;
        this.lives = 3;
        this.baseSpeed = 320;
        this.scoreText = null;
        this.levelText = null;
        this.livesText = null;
        this.particles = null;
        this.trail = [];
        this.gameState = "START";
        this.uiGroup = null;
        this.trailG = null;
        this.bgFlag = null; 

        this.gridConfig = {
            cols: 8,
            rows: 4,
            brickW: 90,
            brickH: 45,
            startY: 120
        };
        
        this.gridConfig.totalWidth = this.gridConfig.cols * this.gridConfig.brickW;
        this.gridConfig.totalHeight = this.gridConfig.rows * this.gridConfig.brickH;

        this.SYSTEM_FONT = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        
        this.FLAGS = [
            { id: "flag_pride", name: "Pride", stripes: [0xE40303, 0xFF8C00, 0xFFED00, 0x008026, 0x24408E, 0x732982] },
            { id: "flag_trans", name: "Trans", stripes: [0x5BCEFA, 0xF5A9B8, 0xFFFFFF, 0xF5A9B8, 0x5BCEFA] },
            { id: "flag_bi", name: "Bi", stripes: [0xD60270, 0x9B4F96, 0x0038A8] },
            { id: "flag_pan", name: "Pan", stripes: [0xFF1B8D, 0xFFD900, 0x1BB3FF] }
        ];
        this.rainbowColors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];
    }

    get gameWidth() { return this.sys.game.config.width; }
    get gameHeight() { return this.sys.game.config.height; }

    preload() {
        this.FLAGS.forEach(f => {
            this.load.svg(f.id, `./images/${f.id.replace('flag_', '')}-flag.svg`);
        });
    }

    create() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        
        // --- MODIFICATION TAILLES ---
        // Paddle plus long (120) et plus épais (20)
        g.fillStyle(0xffffff).fillRect(0, 0, 120, 20).generateTexture("paddle", 120, 20);
        // Balle plus grosse (rayon 9 au lieu de 6)
        g.clear().fillStyle(0xffffff).fillCircle(9, 9, 9).generateTexture("ball", 18, 18);
        g.clear().fillStyle(0xffffff).fillRect(0, 0, 4, 4).generateTexture("part", 4, 4);
        
        g.clear();
        g.fillStyle(0xeeeeee, 1);
        g.fillRect(0, 0, this.gridConfig.brickW, this.gridConfig.brickH);
        g.lineStyle(1, 0x000000, 0.1); 
        g.strokeRect(0, 0, this.gridConfig.brickW, this.gridConfig.brickH); 
        g.generateTexture("brick_cover", this.gridConfig.brickW, this.gridConfig.brickH);
        g.destroy();

        this.physics.world.setBounds(0, 80, this.gameWidth, this.gameHeight - 80);
        this.physics.world.checkCollision.down = false;

        this.bgFlag = this.add.image(0, 0, "").setOrigin(0, 0).setDepth(0).setAlpha(0);
        this.trailG = this.add.graphics().setDepth(1);
        this.uiGroup = this.add.group();
        
        this.cursors = this.input.keyboard.createCursorKeys();
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        const textStyle = { fontFamily: this.SYSTEM_FONT, fontSize: "20px", color: "#000", fontWeight: "900" };
        this.scoreText = this.add.text(30, 25, "Score: 0", textStyle).setDepth(10).setVisible(false);
        this.livesText = this.add.text(this.gameWidth - 130, 25, "Vies: 3", textStyle).setDepth(10).setVisible(false);
        this.levelText = this.add.text(this.gameWidth / 2, 45, "", { ...textStyle, fontSize: "24px" }).setOrigin(0.5).setDepth(10);

        this.particles = this.add.particles(0, 0, "part", {
            speed: { min: 80, max: 250 }, scale: { start: 2, end: 0 }, lifespan: 600, gravityY: 200, emitting: false
        }).setDepth(5);

        this.showStartScreen();
    }

    showStartScreen() {
        this.gameState = "START";
        if (this.paddle) this.paddle.destroy();
        if (this.ball) this.ball.destroy();
        if (this.bricks) this.bricks.clear(true, true);
        this.bgFlag.setAlpha(0);
        this.scoreText.setVisible(false);
        this.livesText.setVisible(false);
        this.levelText.setText("");
        this.trailG.clear();

        const title = this.add.text(this.gameWidth / 2, this.gameHeight / 2 - 40, "🌈 PRIDE REVEAL", {
            fontFamily: this.SYSTEM_FONT, fontSize: "42px", color: "#000", fontWeight: "900"
        }).setOrigin(0.5);
        const sub = this.add.text(this.gameWidth / 2, title.y + 60, "ENTRÉE POUR COMMENCER", {
            fontFamily: this.SYSTEM_FONT, fontSize: "18px", color: "#000", fontWeight: "900"
        }).setOrigin(0.5);
        this.uiGroup.addMultiple([title, sub]);
    }

    startGame() {
        this.gameState = "PLAYING";
        this.scoreText.setVisible(true);
        this.livesText.setVisible(true);
        this.uiGroup.clear(true, true);
        
        if (this.paddle) this.paddle.destroy();
        if (this.ball) this.ball.destroy();
        
        this.score = 0; this.level = 0; this.lives = 3; this.trail = [];
        this.trailG.clear();

        this.bricks = this.physics.add.staticGroup();

        this.paddle = this.physics.add.image(this.gameWidth / 2, this.gameHeight - 40, "paddle")
            .setImmovable(true)
            .setTint(0x000000);
        this.paddle.setCollideWorldBounds(true);
        
        // --- MODIF HITBOX BALLE ---
        this.ball = this.physics.add.image(this.gameWidth / 2, this.gameHeight - 150, "ball")
            .setCircle(9) // Rayon 9
            .setBounce(1, 1)
            .setCollideWorldBounds(true)
            .setDepth(100)
            .setTint(0x000000);

        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);
        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);

        this.loadLevel(this.level);
    }

    loadLevel(i) {
        this.bricks.clear(true, true);
        const { cols, rows, brickW, brickH, startY, totalWidth, totalHeight } = this.gridConfig;
        const startX = (this.gameWidth - totalWidth) / 2;

        this.bgFlag.setTexture(this.FLAGS[i].id);
        this.bgFlag.setPosition(startX, startY);
        this.bgFlag.setDisplaySize(totalWidth, totalHeight);
        this.bgFlag.setAlpha(1);

        this.levelText.setText(this.FLAGS[i].name.toUpperCase());

        for (let r = 0; r < rows; r++) {
            const colorIndex = Math.floor((r / rows) * this.FLAGS[i].stripes.length);
            const stripeColor = this.FLAGS[i].stripes[colorIndex];

            for (let c = 0; c < cols; c++) {
                const bx = startX + (c * brickW) + (brickW / 2);
                const by = startY + (r * brickH) + (brickH / 2);
                const b = this.bricks.create(bx, by, "brick_cover");
                b.setData('revealColor', stripeColor);
                b.body.setSize(brickW - 1, brickH - 1);
                b.refreshBody();
            }
        }
        this.resetBall();
    }

    hitBrick(ball, brick) {
        brick.disableBody(true, true);
        this.particles.setParticleTint(brick.getData('revealColor'));
        this.particles.emitParticleAt(brick.x, brick.y, 20);
        this.score += 25;
        
        if (this.bricks.countActive() === 0) {
            this.level++;
            if (this.level < this.FLAGS.length) {
                this.time.delayedCall(1000, () => this.loadLevel(this.level));
            } else {
                this.victory();
            }
        }
    }

    hitPaddle(ball, paddle) {
        let diff = 0;
        if (ball.x < paddle.x) {
            diff = paddle.x - ball.x;
            ball.setVelocityX(-10 * diff);
        } else if (ball.x > paddle.x) {
            diff = ball.x - paddle.x;
            ball.setVelocityX(10 * diff);
        } else {
            ball.setVelocityX(2 + Math.random() * 8);
        }
    }

    handleLifeLoss() {
        this.lives--;
        this.trail = [];
        this.trailG.clear();
        
        if (this.lives <= 0) {
            this.lives = 0;
            this.gameOver();
        } else {
            this.ball.setVelocity(0, 0);
            this.ball.setPosition(this.gameWidth / 2, this.gameHeight - 150);
            this.time.delayedCall(1000, () => { 
                if (this.gameState === "PLAYING") this.resetBall(); 
            });
        }
    }

    resetBall() {
        const s = this.baseSpeed + (this.level * 15);
        this.ball.setPosition(this.gameWidth / 2, this.gameHeight - 150);
        this.ball.setVelocity(Phaser.Math.Between(-100, 100), -s);
    }

    gameOver() {
        this.gameState = "GAMEOVER";
        this.ball.setVelocity(0, 0);
        this.levelText.setText("");
        this.livesText.setText("Vies: 0");

        const brickBottomY = this.gridConfig.startY + this.gridConfig.totalHeight;
        const uiAreaY = (brickBottomY + this.gameHeight) / 2;

        const skull = this.add.text(this.gameWidth / 2, uiAreaY - 50, "💀", {
            fontFamily: this.SYSTEM_FONT, fontSize: "64px"
        }).setOrigin(0.5).setDepth(1000);

        const title = this.add.text(this.gameWidth / 2, uiAreaY + 10, "FIN DE LA PARTIE", {
            fontFamily: this.SYSTEM_FONT, fontSize: "42px", color: "#000", fontWeight: "900"
        }).setOrigin(0.5).setDepth(1000);

        const sub = this.add.text(this.gameWidth / 2, title.y + 70, "ENTRÉE POUR RÉESSAYER", {
            fontFamily: this.SYSTEM_FONT, fontSize: "18px", color: "#000", fontWeight: "900"
        }).setOrigin(0.5).setDepth(1000);

        this.uiGroup.addMultiple([skull, title, sub]);
    }

    victory() {
        this.gameState = "VICTORY";
        this.ball.destroy();
        this.levelText.setText("MAGNIFIQUE !");
        const t = this.add.text(this.gameWidth / 2, this.gameHeight / 2, "TOUS LES DRAPEAUX RÉVÉLÉS", {
            fontFamily: this.SYSTEM_FONT, fontSize: "32px", color: "#000", fontWeight: "900"
        }).setOrigin(0.5);
        this.uiGroup.add(t);
    }

    update() {
        if ((this.gameState === "START" || this.gameState === "GAMEOVER" || this.gameState === "VICTORY") && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            if (this.gameState === "GAMEOVER" || this.gameState === "VICTORY") {
                this.showStartScreen();
            } else {
                this.startGame();
            }
        }
        
        if (this.gameState === "PLAYING") {
            this.scoreText.setText(`Score: ${this.score}`);
            this.livesText.setText(`Vies: ${this.lives}`);

            if (this.cursors.left.isDown) this.paddle.setVelocityX(-750);
            else if (this.cursors.right.isDown) this.paddle.setVelocityX(750);
            else this.paddle.setVelocityX(0);

            if (this.ball.y > this.gameHeight + 20) this.handleLifeLoss();

            if (this.ball && this.ball.active) {
                this.trail.push({ x: this.ball.x, y: this.ball.y });
                if (this.trail.length > 15) this.trail.shift();
                this.drawTrail();
            }
        }
    }

    drawTrail() {
        this.trailG.clear();
        this.trail.forEach((p, i) => {
            const ratio = i / this.trail.length;
            this.trailG.fillStyle(this.rainbowColors[i % this.rainbowColors.length], ratio * 0.5);
            // Traînée adaptée à la nouvelle taille de balle
            this.trailG.fillCircle(p.x, p.y, 4 + (ratio * 5));
        });
    }
}