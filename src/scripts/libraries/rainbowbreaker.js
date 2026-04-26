import * as Phaser from "phaser";

export default class RainbowBreaker extends Phaser.Scene {
    /**
     * Initialisation autonome de Phaser
     */
    static init(settings) {
        const config = {
            type: Phaser.AUTO,
            parent: settings.parent,
            width: settings.width,
            height: settings.height,
            transparent: true,
            // Désactive le moteur audio pour éviter les erreurs de contexte
            audio: { noAudio: true },
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },
            physics: {
                default: "arcade",
                arcade: { gravity: { y: 0 } }
            },
            scene: [RainbowBreaker]
        };

        const game = new Phaser.Game(config);
        game.registry.set('onGameOver', settings.onGameOver);
        return game;
    }

    constructor() {
        super("RainbowBreaker");
        
        this.paddle = null;
        this.ball = null;
        this.bricks = null;
        this.cursors = null;
        this.enterKey = null;
        this.trail = [];
        this.onGameOverCallback = null;
        
        this.score = 0;
        this.level = 0;
        this.lives = 3;
        this.baseSpeed = 320;
        this.MAX_SPEED = 800;

        this.comboCount = 0;
        this.lastBrickTime = 0;
        this.comboThreshold = 300; 
        this.comboWords = ["GÉNIAL !", "WOW !", "SUPER !", "SPLENDIDE !", "ARC-EN-CIEL !", "FIERTÉ !", "AMOUR !", "ÉCLATANT !"];

        this.gridConfig = {
            cols: 8, rows: 4, brickW: 90, brickH: 45, startY: 100
        };
        
        this.gridConfig.totalWidth = this.gridConfig.cols * this.gridConfig.brickW;
        this.gridConfig.totalHeight = this.gridConfig.rows * this.gridConfig.brickH;
        this.SYSTEM_FONT = 'system-ui, -apple-system, sans-serif';
        
        this.FLAGS = [
            { id: "flag_trans", name: "Drapeau Transgenre", history: "Dessiné par Monica Helms en 1999. Le bleu pour les garçons, le rose pour les filles et le blanc pour la transition." },
            { id: "flag_bi", name: "Drapeau Bisexuel", history: "Créé par Michael Page en 1998. Le rose pour l'attirance même sexe, le bleu pour l'autre, et le violet pour le mélange." },
            { id: "flag_intersex", name: "Drapeau Intersexe", history: "Créé par Morgan Carpenter en 2013. Le fond jaune et le cercle violet évitent les couleurs associées au genre. Le cercle symbolise la complétude." },
            { id: "flag_lesbian", name: "Drapeau Lesbien", history: "Cette version à 7 bandes représente la non-conformité de genre, l'indépendance, la communauté, l'amour et la féminité." },
            { id: "flag_pan", name: "Drapeau Pansexuel", history: "Représente l'attirance pour tous les genres : féminin (rose), masculin (bleu) et non-binaire (jaune)." },
            { id: "flag_pride", name: "Pride Progressif", history: "Créé en 2018 par Daniel Quasar. Il inclut les personnes trans, les communautés racisées et les personnes vivant avec le VIH/SIDA." }
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
        this.onGameOverCallback = this.registry.get('onGameOver');

        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xffffff).fillRect(0, 0, 120, 20).generateTexture("paddle", 120, 20);
        g.clear().fillStyle(0xffffff).fillCircle(9, 9, 9).generateTexture("ball", 18, 18);
        g.clear().fillStyle(0xffffff).fillRect(0, 0, 4, 4).generateTexture("part", 4, 4);
        g.clear().fillStyle(0xeeeeee, 1).fillRect(0, 0, this.gridConfig.brickW, this.gridConfig.brickH);
        g.lineStyle(2, 0x000000, 0.2).strokeRect(0, 0, this.gridConfig.brickW, this.gridConfig.brickH); 
        g.generateTexture("brick_cover", this.gridConfig.brickW, this.gridConfig.brickH);
        g.destroy();

        this.physics.world.setBounds(0, 60, this.gameWidth, this.gameHeight - 60);
        this.physics.world.checkCollision.down = false;

        this.bgFlag = this.add.image(this.gameWidth / 2, this.gridConfig.startY, "").setOrigin(0.5, 0).setDepth(0).setAlpha(0);
        this.trailG = this.add.graphics().setDepth(1);
        this.uiGroup = this.add.group();
        
        this.cursors = this.input.keyboard.createCursorKeys();
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        const textStyle = { fontFamily: this.SYSTEM_FONT, fontSize: "20px", color: "#000", fontWeight: "900" };
        this.scoreText = this.add.text(30, 25, "Score: 0", textStyle).setDepth(10).setVisible(false);
        this.levelText = this.add.text(this.gameWidth / 2, 25, "Niveau: 1", textStyle).setOrigin(0.5, 0).setDepth(10).setVisible(false);
        this.livesText = this.add.text(this.gameWidth - 130, 25, "Vies: 3", textStyle).setDepth(10).setVisible(false);
        
        this.historyText = this.add.text(this.gameWidth / 2, this.gridConfig.startY + this.gridConfig.totalHeight + 30, "", { 
            fontFamily: this.SYSTEM_FONT, fontSize: "18px", color: "#000", 
            align: "center", fontWeight: "600", wordWrap: { width: 600 } 
        }).setOrigin(0.5, 0).setDepth(10).setVisible(false);

        this.particles = this.add.particles(0, 0, "part", {
            speed: { min: 100, max: 300 }, scale: { start: 2, end: 0 }, lifespan: 800, emitting: false
        }).setDepth(5);

        this.showStartScreen();
    }

    cleanupGame() {
        if (this.bricks) { this.bricks.clear(true, true); this.bricks.destroy(); this.bricks = null; }
        if (this.paddle) this.paddle.destroy();
        if (this.ball) this.ball.destroy();
        this.trail = [];
        this.trailG.clear();
        this.uiGroup.clear(true, true);
    }

    showStartScreen() {
        this.cleanupGame();
        this.gameState = "START";
        this.bgFlag.setAlpha(0);
        this.scoreText.setVisible(false);
        this.levelText.setVisible(false);
        this.livesText.setVisible(false);
        this.historyText.setVisible(false);

        const title = this.add.text(this.gameWidth / 2, this.gameHeight / 2 - 40, "🌈 BRICK BREAQUEER", {
            fontFamily: this.SYSTEM_FONT, fontSize: "42px", color: "#000", fontWeight: "900"
        }).setOrigin(0.5);
        const sub = this.add.text(this.gameWidth / 2, title.y + 60, "APPUYEZ SUR ENTRÉE POUR COMMENCER", {
            fontFamily: this.SYSTEM_FONT, fontSize: "18px", color: "#000", fontWeight: "900"
        }).setOrigin(0.5);
        this.uiGroup.addMultiple([title, sub]);
    }

    startGame() {
        this.cleanupGame();
        this.gameState = "PLAYING";
        this.scoreText.setVisible(true);
        this.levelText.setVisible(true);
        this.livesText.setVisible(true);
        this.score = 0; this.level = 0; this.lives = 3;
        this.bricks = this.physics.add.staticGroup();
        this.createGameObjects();
        this.loadLevel(this.level);
    }

    createGameObjects() {
        this.paddle = this.physics.add.image(this.gameWidth / 2, this.gameHeight - 40, "paddle").setImmovable(true).setTint(0x000000);
        this.paddle.setCollideWorldBounds(true);
        this.ball = this.physics.add.image(this.gameWidth / 2, this.gameHeight - 150, "ball").setCircle(9).setBounce(1, 1).setCollideWorldBounds(true).setDepth(100).setTint(0x000000);
        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);
        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
    }

    loadLevel(i) {
        this.gameState = "PLAYING";
        this.historyText.setVisible(false);
        this.uiGroup.clear(true, true);
        if (this.bricks) this.bricks.clear(true, true);
        
        const flagIndex = i % this.FLAGS.length;
        const currentFlag = this.FLAGS[flagIndex];
        const { cols, rows, brickW, brickH, startY, totalWidth, totalHeight } = this.gridConfig;
        const startX = (this.gameWidth - totalWidth) / 2;

        this.bgFlag.setTexture(currentFlag.id);
        this.bgFlag.setPosition(this.gameWidth / 2, startY);
        this.bgFlag.setDisplaySize(totalWidth, totalHeight);
        this.bgFlag.setAlpha(1);

        this.levelText.setText(`Niveau: ${i + 1}`);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const bx = startX + (c * brickW) + (brickW / 2);
                const by = startY + (r * brickH) + (brickH / 2);
                const b = this.bricks.create(bx, by, "brick_cover");
                b.setData('revealColor', this.rainbowColors[(r + c) % this.rainbowColors.length]);
                b.refreshBody();
            }
        }
        this.ball.setVisible(true).setAlpha(1);
        this.paddle.setVisible(true).setAlpha(1);
        this.resetBall();
    }

    hitBrick(ball, brick) {
        const currentTime = this.time.now;
        if (currentTime - this.lastBrickTime < this.comboThreshold) {
            this.comboCount++;
            if (this.comboCount >= 1) { 
                this.spawnComboWord(brick.x, brick.y);
                this.comboCount = 0;
            }
        } else {
            this.comboCount = 0;
        }
        this.lastBrickTime = currentTime;

        this.particles.setParticleTint(brick.getData('revealColor'));
        this.particles.emitParticleAt(brick.x, brick.y, 10);
        brick.destroy(); 
        this.score += 25;
        if (this.bricks.countActive() === 0) this.revealFlag();
    }

    spawnComboWord(x, y) {
        const word = Phaser.Utils.Array.GetRandom(this.comboWords);
        const txt = this.add.text(x, y, word, {
            fontFamily: this.SYSTEM_FONT, fontSize: "28px", color: "#000", fontWeight: "900",
            stroke: "#FFF", strokeThickness: 6
        }).setOrigin(0.5).setDepth(20);

        this.tweens.add({
            targets: txt, y: y - 80, x: x + Phaser.Math.Between(-20, 20), alpha: 0,
            scale: 1.2, duration: 2500, ease: 'Power1', 
            onComplete: () => txt.destroy()
        });
    }

    revealFlag() {
        this.gameState = "REVEAL";
        this.ball.setVelocity(0, 0).setVisible(false);
        this.paddle.setVisible(false);
        this.trail = [];
        this.trailG.clear();
        
        const currentFlag = this.FLAGS[this.level % this.FLAGS.length];
        this.tweens.add({
            targets: this.bgFlag, scaleX: this.bgFlag.scaleX * 1.05, scaleY: this.bgFlag.scaleY * 1.05,
            duration: 300, yoyo: true, ease: 'Cubic.easeOut'
        });

        const centerX = this.gameWidth / 2;
        const centerY = this.gridConfig.startY + (this.gridConfig.totalHeight / 2);
        this.rainbowColors.forEach((color, idx) => {
            this.time.delayedCall(idx * 50, () => {
                this.particles.setParticleTint(color);
                this.particles.emitParticleAt(centerX, centerY, 20);
            });
        });

        this.historyText.setText(`${currentFlag.name.toUpperCase()}\n\n${currentFlag.history}`);
        this.historyText.setVisible(true);

        const sub = this.add.text(this.gameWidth / 2, this.gameHeight - 60, "APPUYEZ SUR ENTRÉE POUR CONTINUER", {
            fontFamily: this.SYSTEM_FONT, fontSize: "18px", color: "#000", fontWeight: "900"
        }).setOrigin(0.5);
        this.uiGroup.add(sub);
    }

    hitPaddle(ball, paddle) {
        let diff = ball.x - paddle.x;
        ball.setVelocityX(10 * diff);
    }

    handleLifeLoss() {
        this.lives--;
        this.trail = [];
        this.trailG.clear();
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.ball.setVelocity(0, 0).setPosition(this.gameWidth / 2, this.gameHeight - 150);
            this.time.delayedCall(1000, () => { if (this.gameState === "PLAYING") this.resetBall(); });
        }
    }

    resetBall() {
        const speed = Math.min(this.baseSpeed + (this.level * 20), this.MAX_SPEED);
        this.ball.setPosition(this.gameWidth / 2, this.gameHeight - 150);
        this.ball.setVelocity(Phaser.Math.Between(-80, 80), -speed);
    }

    async gameOver() {
        this.gameState = "WAITING";
        
        if (this.ball) this.ball.setVelocity(0, 0);
        if (this.paddle) this.paddle.setVelocityX(0);
        this.historyText.setVisible(false);

        const gameStats = {
            score: this.score,
            levelReached: this.level + 1,
            timestamp: Date.now()
        };

        if (this.onGameOverCallback) {
            await this.onGameOverCallback(gameStats);
        }

        this.gameState = "GAMEOVER";
        
        const displayY = this.gridConfig.startY + this.gridConfig.totalHeight + 60;
        const title = this.add.text(this.gameWidth / 2, displayY, "FIN DE LA PARTIE", { 
            fontFamily: this.SYSTEM_FONT, fontSize: "42px", color: "#000", fontWeight: "900" 
        }).setOrigin(0.5);
        
        const sub = this.add.text(this.gameWidth / 2, displayY + 70, "APPUYEZ SUR ENTRÉE POUR RÉESSAYER", { 
            fontFamily: this.SYSTEM_FONT, fontSize: "18px", color: "#000", fontWeight: "900" 
        }).setOrigin(0.5);
        
        this.uiGroup.addMultiple([title, sub]);
    }

    update() {
        if (this.gameState === "WAITING") return;

        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            if (this.gameState === "START") this.startGame();
            else if (this.gameState === "GAMEOVER") this.showStartScreen();
            else if (this.gameState === "REVEAL") { this.level++; this.loadLevel(this.level); }
        }
        
        if (this.gameState === "PLAYING") {
            this.scoreText.setText(`Score: ${this.score}`);
            this.levelText.setText(`Niveau: ${this.level + 1}`);
            this.livesText.setText(`Vies: ${this.lives}`);

            if (this.cursors.left.isDown) this.paddle.setVelocityX(-750);
            else if (this.cursors.right.isDown) this.paddle.setVelocityX(750);
            else this.paddle.setVelocityX(0);

            if (this.ball && this.ball.y > this.gameHeight + 20) this.handleLifeLoss();

            if (this.ball && this.ball.active && this.ball.visible) {
                this.trail.push({ x: this.ball.x, y: this.ball.y });
                if (this.trail.length > 12) this.trail.shift();
                this.drawTrail();
            }
        }
    }

    drawTrail() {
        this.trailG.clear();
        this.trail.forEach((p, i) => {
            const ratio = i / this.trail.length;
            this.trailG.fillStyle(this.rainbowColors[i % this.rainbowColors.length], ratio * 0.4);
            this.trailG.fillCircle(p.x, p.y, 4 + (ratio * 5));
        });
    }
}