import * as Phaser from "phaser";

export default class RainbowBreaker extends Phaser.Scene {
    static init(settings) {
        const config = {
            type: Phaser.AUTO,
            parent: settings.parent,
            width: settings.width,
            height: settings.height,
            transparent: true,
            antialias: true,
            pixelArt: false,
            roundPixels: false,
            audio: { noAudio: true },
            render: {
                antialias: true,
                pixelArt: false,
                roundPixels: false,
                powerPreference: 'high-performance',
                batchSize: 4096,
                premultipliedAlpha: true
            },
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
        const cleanFont = (settings.fontFamily || 'Arial').replace(/['"]/g, '');
        const weight = settings.fontWeight || '900';
        const mainColor = settings.color || '#000000';

        game.registry.set('onGameOver', settings.onGameOver);
        game.registry.set('gameFont', cleanFont);
        game.registry.set('gameWeight', weight);
        game.registry.set('gameColor', mainColor);
        game.registry.set('gameFlags', settings.flags)
        game.registry.set('gameWords', settings.words);

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
        this.score = 0;
        this.level = 0;
        this.lives = 5;
        this.baseSpeed = 320;
        this.MAX_SPEED = 800;
        this.comboCount = 0;
        this.lastBrickTime = 0;
        this.comboThreshold = 450;
        this.gridConfig = { cols: 8, rows: 4, brickW: 0, brickH: 0, startY: 0 };
        this.rainbowColors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];
        this.comboWords = [];
        this.FLAGS = [];
    }


    preload() {
        this.FLAGS.forEach((flag, index) => {
            const base64Data = flag.data.split(',')[1];
            const binaryData = atob(base64Data);
            const arrayBuffer = new Uint8Array(binaryData.length);
            for (let j = 0; j < binaryData.length; j++) arrayBuffer[j] = binaryData.charCodeAt(j);
            const blob = new Blob([arrayBuffer], { type: 'image/svg+xml' });
            const blobUrl = URL.createObjectURL(blob);
            this.load.image(flag.id, blobUrl);
        });
    }


    create() {
        const { width, height } = this.sys.game.config;
        this.FLAGS = this.registry.get('gameFlags') || [];
        this.comboWords = this.registry.get('gameWords') || ["BRAVO"];

        this.pauseText = null;
        this.pauseSubText = null;
        this.gridConfig.brickW = Math.floor((width * 0.9) / this.gridConfig.cols);
        this.gridConfig.brickH = Math.floor(height * 0.08);
        this.gridConfig.startY = Math.floor(height * 0.15);
        this.gridConfig.totalWidth = this.gridConfig.cols * this.gridConfig.brickW;
        this.gridConfig.totalHeight = this.gridConfig.rows * this.gridConfig.brickH;

        this.onGameOverCallback = this.registry.get('onGameOver');
        const fontName = this.registry.get('gameFont');
        const fontWeight = this.registry.get('gameWeight');
        const mainColor = this.registry.get('gameColor');

        const g = this.make.graphics({ x: 0, y: 0, add: false });
        const paddleWidth = Math.max(100, width * 0.15);
        g.fillStyle(0xffffff).fillRect(0, 0, paddleWidth, 20).generateTexture("paddle", paddleWidth, 20);
        g.clear();

        for (let r = 9; r > 0; r--) {
            const color = this.rainbowColors[r % this.rainbowColors.length];
            g.fillStyle(color).fillCircle(9, 9, r);
        }
        g.generateTexture("ball", 18, 18);
        g.clear();

        g.fillStyle(0xbdc3c7, 0.85);
        g.fillRect(0, 0, this.gridConfig.brickW, this.gridConfig.brickH);
        g.fillStyle(0xffffff, 0.3);
        g.fillRect(0, 0, this.gridConfig.brickW, this.gridConfig.brickH / 2);
        g.lineStyle(2, 0xffffff, 0.6);
        g.strokeRect(0, 0, this.gridConfig.brickW, this.gridConfig.brickH);
        g.generateTexture("brick_cover", this.gridConfig.brickW, this.gridConfig.brickH);
        g.clear();
        g.fillStyle(0xffffff).fillRect(0, 0, 5, 5).generateTexture("part", 5, 5);
        g.destroy();

        this.physics.world.setBounds(0, 60, width, height - 60);
        this.physics.world.checkCollision.down = false;

        this.bgFlag = this.add.image(0, 0, "").setOrigin(0, 0).setDepth(0).setAlpha(0);

        this.trailG = this.add.graphics().setDepth(1);
        this.uiGroup = this.add.group();
        this.cursors = this.input.keyboard.createCursorKeys();
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        const baseSize = Math.max(14, Math.round(width / 40));
        const textStyle = { font: `${fontWeight} ${baseSize}px "${fontName}"`, fill: mainColor };

        this.scoreText = this.add.text(width * 0.05, height * 0.04, "Score: 0", textStyle).setResolution(2).setDepth(10).setVisible(false);
        this.levelText = this.add.text(width / 2, height * 0.04, "Niveau: 1", textStyle).setResolution(2).setOrigin(0.5, 0).setDepth(10).setVisible(false);
        this.livesText = this.add.text(width * 0.95, height * 0.04, "Vies: 3", textStyle).setResolution(2).setOrigin(1, 0).setDepth(10).setVisible(false);

        this.historyText = this.add.text(width / 2, this.gridConfig.startY + this.gridConfig.totalHeight + 30, "", {
            font: `600 ${Math.max(12, baseSize * 0.8)}px "${fontName}"`, fill: mainColor,
            align: "center", wordWrap: { width: width * 0.8 }
        }).setOrigin(0.5, 0).setResolution(2).setDepth(10).setVisible(false);

        this.particles = this.add.particles(0, 0, "part", {
            speed: { min: 100, max: 400 }, angle: { min: 0, max: 360 },
            scale: { start: 2, end: 0 }, lifespan: 800, gravityY: 300, emitting: false
        }).setDepth(5);

        this.showStartScreen();
        this.input.on('pointerup', () => {
            this.handleGlobalAction(false);
        }, this);
    }


    addFloatingEffect(target) {
        this.tweens.add({ targets: target, y: target.y - 5, duration: 800, ease: 'Sine.easeInOut', yoyo: true, loop: -1 });
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
        const { width, height } = this.sys.game.config;
        this.gameState = "START";
        this.bgFlag.setAlpha(0);
        this.scoreText.setVisible(false);
        this.levelText.setVisible(false);
        this.livesText.setVisible(false);
        this.historyText.setVisible(false);

        const fontName = this.registry.get('gameFont');
        const fontWeight = this.registry.get('gameWeight');
        const mainColor = this.registry.get('gameColor');

        const title = this.add.text(width / 2, height * 0.45, "🌈 BRICK BREAQUEER", {
            font: `${fontWeight} ${Math.round(width / 18)}px "${fontName}"`, fill: mainColor
        }).setOrigin(0.5).setResolution(2);

        const sub = this.add.text(width / 2, title.y + (height * 0.1), "CLIQUEZ OU APPUYEZ SUR ENTRÉE", {
            font: `${fontWeight} ${Math.round(width / 45)}px "${fontName}"`, fill: mainColor
        }).setOrigin(0.5).setResolution(2);

        this.addFloatingEffect(sub);
        this.uiGroup.addMultiple([title, sub]);
    }


    startGame() {
        this.cleanupGame();
        this.gameState = "PLAYING";
        this.scoreText.setVisible(true);
        this.levelText.setVisible(true);
        this.livesText.setVisible(true);
        this.score = 0; this.level = 0; this.lives = 5;
        this.bricks = this.physics.add.staticGroup();
        this.createGameObjects();
        this.loadLevel(this.level);
    }


    createGameObjects() {
        const { width, height } = this.sys.game.config;
        const mainColor = this.registry.get('gameColor');
        const phaserColor = Phaser.Display.Color.HexStringToColor(mainColor).color;

        this.paddle = this.physics.add.image(width / 2, height - 40, "paddle").setImmovable(true).setTint(phaserColor);
        this.paddle.setCollideWorldBounds(true);
        this.ball = this.physics.add.image(width / 2, height - 150, "ball").setCircle(9).setBounce(1, 1).setCollideWorldBounds(true).setDepth(100);
        this.physics.add.collider(this.ball, this.paddle, (b, p) => {
            let diff = b.x - p.x;
            b.setVelocityX(10 * diff);
        });
        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
    }


    async loadLevel(i) {
        const { width } = this.sys.game.config;
        this.gameState = "PLAYING";
        this.historyText.setVisible(false);
        this.uiGroup.clear(true, true);
        if (this.bricks) this.bricks.clear(true, true);

        const currentFlag = this.FLAGS[i % this.FLAGS.length];
        const textureKey = "flag_sharp_" + i;
        const targetW = this.gridConfig.cols * this.gridConfig.brickW;
        const targetH = this.gridConfig.rows * this.gridConfig.brickH;

        if (!this.textures.exists(textureKey)) await this.createFlagTexture(textureKey, currentFlag.data, targetW, targetH);

        this.bgFlag.setTexture(textureKey);
        this.bgFlag.setDisplaySize(targetW, targetH);

        const startX = Math.floor((width - targetW) / 2);
        this.bgFlag.setPosition(startX, this.gridConfig.startY);
        this.bgFlag.setOrigin(0, 0);
        this.bgFlag.setDisplaySize(targetW, targetH);
        this.bgFlag.setAlpha(1);

        for (let r = 0; r < this.gridConfig.rows; r++) {
            for (let c = 0; c < this.gridConfig.cols; c++) {
                const bx = startX + (c * this.gridConfig.brickW) + (this.gridConfig.brickW / 2);
                const by = this.gridConfig.startY + (r * this.gridConfig.brickH) + (this.gridConfig.brickH / 2);
                const b = this.bricks.create(bx, by, "brick_cover");
                b.refreshBody();
            }
        }
        this.ball.setVisible(true).setAlpha(1);
        this.paddle.setVisible(true).setAlpha(1);
        this.resetBall();
    }


    async createFlagTexture(key, svgData, targetW, targetH) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                if (this.textures.exists(key)) this.textures.remove(key);
                const tex = this.textures.createCanvas(key, targetW, targetH);
                tex.context.drawImage(img, 0, 0, targetW, targetH);
                tex.update();
                resolve();
            };
            img.src = svgData;
        });
    }


    hitBrick(ball, brick) {
        const currentTime = this.time.now;
        if (currentTime - this.lastBrickTime < this.comboThreshold) {
            this.comboCount++;
            const comboBonus = 100 + ((this.comboCount - 1) * 50);
            this.score += comboBonus;
            this.spawnComboWord(brick.x, brick.y, comboBonus);
        } else {
            this.comboCount = 0;
            this.score += 25;
            this.spawnComboWord(brick.x, brick.y, 25);
        }
        this.lastBrickTime = currentTime;
        for (let i = 0; i < 20; i++) {
            const color = (Math.random() > 0.5) ? 0xffffff : Phaser.Utils.Array.GetRandom(this.rainbowColors);
            this.particles.setParticleTint(color);
            this.particles.emitParticleAt(brick.x, brick.y, 1);
        }
        brick.destroy();
        if (this.bricks.countActive() === 0) this.revealFlag();
    }


    spawnComboWord(x, y, bonus) {
        const fontName = this.registry.get('gameFont');
        const fontWeight = this.registry.get('gameWeight');
        const mainColor = this.registry.get('gameColor');
        const word = Phaser.Utils.Array.GetRandom(this.comboWords);
        const txt = this.add.text(x, y, `${word}\n+${bonus}`, {
            font: `${fontWeight} 22px "${fontName}"`, fill: mainColor,
            stroke: "#FFF", strokeThickness: 4, align: "center"
        }).setOrigin(0.5).setDepth(20).setResolution(2);
        this.tweens.add({ targets: txt, y: y - 100, alpha: 0, scale: 1.3, duration: 2200, ease: 'Cubic.easeOut', onComplete: () => txt.destroy() });
    }


    revealFlag() {
        const { width, height } = this.sys.game.config;
        this.gameState = "REVEAL";
        this.ball.setVelocity(0, 0).setVisible(false);
        this.paddle.setVisible(false);
        const fontName = this.registry.get('gameFont');
        const fontWeight = this.registry.get('gameWeight');
        const mainColor = this.registry.get('gameColor');
        const currentFlag = this.FLAGS[this.level % this.FLAGS.length];
        this.historyText.setText(`${currentFlag.name.toUpperCase()}\n\n${currentFlag.history}`).setVisible(true);
        const sub = this.add.text(width / 2, height - 80, "CLIQUEZ OU APPUYEZ SUR ENTRÉE POUR CONTINUER", { font: `${fontWeight} 14px "${fontName}"`, fill: mainColor }).setOrigin(0.5).setResolution(2);
        this.addFloatingEffect(sub);
        this.uiGroup.add(sub);
    }


    resetBall() {
        const { width, height } = this.sys.game.config;
        this.comboCount = 0;
        this.trail = [];
        this.trailG.clear();

        this.ball.setVelocity(0, 0).setPosition(width / 2, height - 150).setAlpha(1).setVisible(true);
        if (this.launchTimer) this.launchTimer.remove();

        this.launchTimer = this.time.delayedCall(1000, () => {
            if (this.gameState !== "PLAYING" || !this.ball.active) return;
            const speed = Math.min(this.baseSpeed + (this.level * 20), this.MAX_SPEED);
            this.ball.setVelocity(Phaser.Math.Between(-80, 80), -speed);
            this.launchTimer = null;
        });
    }


    setPause(isPaused) {
        const { width, height } = this.sys.game.config;
        const fontName = this.registry.get('gameFont');
        const fontWeight = this.registry.get('gameWeight');
        const mainColor = this.registry.get('gameColor');

        if (isPaused) {
            this.gameState = "PAUSED";
            this.physics.world.pause();
            if (this.launchTimer) this.launchTimer.paused = true;

            this.pauseText = this.add.text(width / 2, height * 0.65, "PAUSE", {
                font: `${fontWeight} ${Math.round(width / 15)}px "${fontName}"`, fill: mainColor
            }).setOrigin(0.5).setResolution(2).setDepth(100);
            this.pauseSubText = this.add.text(width / 2, this.pauseText.y + (height * 0.1), "APPUYEZ SUR ENTRÉE POUR CONTINUER", {
                font: `${fontWeight} ${Math.round(width / 45)}px "${fontName}"`, fill: mainColor
            }).setOrigin(0.5).setResolution(2).setDepth(100);

            this.addFloatingEffect(this.pauseSubText);
        } else {
            this.gameState = "PLAYING";
            this.physics.world.resume();
            if (this.launchTimer) {
                this.launchTimer.paused = false;
            } else if (this.ball.body.velocity.x === 0 && this.ball.body.velocity.y === 0) {
                this.resetBall();
            }
            if (this.pauseText) this.pauseText.destroy();
            if (this.pauseSubText) this.pauseSubText.destroy();
        }
    }


    async gameOver() {
        const { width, height } = this.sys.game.config;
        this.gameState = "WAITING_FOR_CALLBACK";
        if (this.ball) this.ball.setVelocity(0, 0);
        this.historyText.setVisible(false);
        const fontName = this.registry.get('gameFont');
        const fontWeight = this.registry.get('gameWeight');
        const mainColor = this.registry.get('gameColor');
        const title = this.add.text(width / 2, height * 0.65, "FIN DE LA PARTIE", { font: `${fontWeight} ${Math.round(width / 18)}px "${fontName}"`, fill: mainColor }).setOrigin(0.5).setResolution(2);
        this.uiGroup.add(title);
        this.livesText.setText(`Vies: 0`);
        if (this.onGameOverCallback) await this.onGameOverCallback({ score: this.score, levelReached: this.level + 1 });
        this.gameState = "GAMEOVER";
        const sub = this.add.text(width / 2, title.y + 50, "CLIQUEZ OU APPUYEZ SUR ENTRÉE POUR RÉESSAYER", { font: `${fontWeight} ${Math.round(width / 40)}px "${fontName}"`, fill: mainColor }).setOrigin(0.5).setResolution(2);
        this.addFloatingEffect(sub);
        this.uiGroup.add(sub);
    }


    handleGlobalAction(isKeyboard = false) { 
        if (this.gameState === "WAITING_FOR_CALLBACK") return;

        switch (this.gameState) {
            case "START":
                this.startGame();
                break;
            case "GAMEOVER":
                this.showStartScreen();
                break;
            case "REVEAL":
                this.level++;
                this.loadLevel(this.level);
                break;
            case "PLAYING":
                if (isKeyboard) this.setPause(true);
                break;
            case "PAUSED":
                this.setPause(false);
                break;
        }
    }


    update() {
        const { width, height } = this.sys.game.config;
        const pointer = this.input.activePointer;

        if (this.gameState === "WAITING_FOR_CALLBACK") return;
        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            this.handleGlobalAction(true);
        }

        if (this.gameState === "PLAYING") {
            this.scoreText.setText(`Score: ${this.score}`);
            this.levelText.setText(`Niveau: ${this.level + 1}`);
            this.livesText.setText(`Vies: ${this.lives}`);
            const moved = Math.abs(pointer.x - this.lastMouseX) > 1;
            this.lastMouseX = pointer.x;
            if (this.cursors.left.isDown || this.cursors.right.isDown) this.lastInputMethod = "keyboard";
            else if (moved) this.lastInputMethod = "mouse";
            if (this.lastInputMethod === "keyboard") {
                if (this.cursors.left.isDown) this.paddle.setVelocityX(-750);
                else if (this.cursors.right.isDown) this.paddle.setVelocityX(750);
                else this.paddle.setVelocityX(0);
            } else {
                this.paddle.setVelocityX((pointer.x - this.paddle.x) * 15);
            }
            if (this.ball && this.ball.y > height + 20) {
                this.ball.y = -100; this.lives--;
                if (this.lives <= 0) this.gameOver();
                else this.resetBall();
            }
            if (this.ball && this.ball.active && this.ball.visible && (this.ball.body.velocity.x !== 0 || this.ball.body.velocity.y !== 0)) {
                this.trail.push({ x: this.ball.x, y: this.ball.y });
                if (this.trail.length > 12) this.trail.shift();
                this.drawTrail();
            } else this.trailG.clear();
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