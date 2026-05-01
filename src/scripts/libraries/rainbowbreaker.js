import * as Phaser from "phaser";
import DATA from "./rainbowbreaker.json";


export default class RainbowBreaker extends Phaser.Scene {

    score = 0;
    level = 0;
    lives = DATA.config.lives;
    paddle = null;
    ball = null;
    bricks = null;
    cursors = null;
    enterKey = null;
    trail = [];
    baseSpeed = DATA.config.baseSpeed;
    maxSpeed = DATA.config.maxSpeed;
    comboCount = 0;
    lastBrickTime = 0;
    lastPointerX = 0;
    comboThreshold = DATA.config.comboThreshold;
    launchTimer = null;
    countdownText = null;
    canContinue = true;
    gridConfig = { cols: DATA.config.gridCols, rows: DATA.config.gridRows, brickW: 0, brickH: 0, startY: 0 };
    rainbowColors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];
    comboWords = [];
    levelOrder = [];
    FLAGS = [];


    static init(settings) {
        const game = new Phaser.Game({
            type: Phaser.AUTO,
            parent: settings.parent || DATA.config.parent,
            width: settings.width || DATA.config.width,
            height: settings.height || DATA.config.height,
            transparent: true,
            antialias: true,
            pixelArt: false,
            roundPixels: false,
            audio: { noAudio: true },
            input: { windowEvents: true },
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
        });
        game.registry.set('onGameOver', settings.onGameOver);
        game.registry.set('gameFont', (settings.fontFamily || DATA.config.fontFamily).replace(/['"]/g, ''));
        game.registry.set('gameWeight', settings.fontWeight || DATA.config.fontWeight);
        game.registry.set('gameColor', settings.color || DATA.config.color);
        game.registry.set('gameFlags', DATA.flags)
        game.registry.set('gameWords', DATA.words);
        return game;
    }


    preload() {
        this.load.image('game_logo', DATA.images.logo);
        this.FLAGS = this.registry.get('gameFlags') || [];
        this.FLAGS.forEach((flag) => {
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
        this.comboWords = this.registry.get('gameWords') || ["BRAVO"];

        this.pauseText = null;
        this.pauseSubText = null;

        this.gridConfig.brickW = Math.floor((width * 0.9) / this.gridConfig.cols);
        this.gridConfig.brickH = Math.floor((height * 0.32) / this.gridConfig.rows);
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
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.input.mouse.preventDefaultWheel = false;

        const baseSize = Math.max(14, Math.round(width / 40));
        const textStyle = { font: `${fontWeight} ${baseSize}px "${fontName}"`, fill: mainColor };

        this.scoreText = this.add.text(width * 0.055, height * 0.04, "Score: 0", textStyle).setResolution(2).setDepth(10).setVisible(false);
        this.levelText = this.add.text(width / 2, height * 0.04, "Niveau: 1", textStyle).setResolution(2).setOrigin(0.5, 0).setDepth(10).setVisible(false);
        this.livesText = this.add.text(width * 0.945, height * 0.04, "Vies: " + DATA.config.lives, textStyle).setResolution(2).setOrigin(1, 0).setDepth(10).setVisible(false);

        this.historyText = this.add.text(width / 2, this.gridConfig.startY + this.gridConfig.totalHeight + 30, "", {
            font: `600 ${Math.max(12, baseSize * 0.8)}px "${fontName}"`, fill: mainColor,
            align: "center", wordWrap: { width: width * 0.8 }
        }).setOrigin(0.5, 0).setResolution(2).setDepth(10).setVisible(false);

        this.particles = this.add.particles(0, 0, "part", {
            speed: { min: 100, max: 400 }, angle: { min: 0, max: 360 },
            scale: { start: 2, end: 0 }, lifespan: 800, gravityY: 300, emitting: false,
            tint: () => Phaser.Utils.Array.GetRandom(this.rainbowColors)
        }).setDepth(5);

        this.lastPointerX = width / 2;
        window.addEventListener('pointermove', (event) => {
            const canvas = this.sys.game.canvas;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const x = (event.clientX - rect.left) * (canvas.width / rect.width);

            if (this.gameState === "PLAYING") {
                this.lastPointerX = x;
            }
        }, { passive: true });

        this.createLogoTexture('game_logo', DATA.images.logo);
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

        if (this.bgFlag) this.bgFlag.setAlpha(0);

        const fontName = this.registry.get('gameFont');
        const mainColor = this.registry.get('gameColor');

        const displayLogoHD = () => {
            const sourceImg = this.textures.get('game_logo').getSourceImage();

            if (!sourceImg || sourceImg.width === 0) {
                this.time.delayedCall(50, displayLogoHD);
                return;
            }

            const hdWidth = 2000;
            const ratio = sourceImg.height / sourceImg.width;
            const hdHeight = hdWidth * ratio;

            if (!this.textures.exists('logo_hd')) {
                const canvasTexture = this.textures.createCanvas('logo_hd', hdWidth, hdHeight);
                canvasTexture.context.drawImage(sourceImg, 0, 0, hdWidth, hdHeight);
                canvasTexture.refresh();
            }

            const logo = this.add.image(width / 2, height * 0.45, 'logo_hd');
            const displayWidth = width * 0.6;
            logo.setScale(displayWidth / hdWidth);
            this.uiGroup.add(logo);
            this.createStartText(logo.y + (logo.displayHeight / 2) + 50);
        };

        if (this.textures.exists('game_logo')) {
            displayLogoHD();
        } else {
            this.createStartText(height * 0.5);
        }

        if (this.livesGroup) this.livesGroup.clear(true, true);

        const uiElements = [
            this.scoreText,
            this.levelText,
            this.comboText,
            this.statsText,
            this.livesText,
            this.highScoreText
        ];

        uiElements.forEach(element => {
            if (element) element.setVisible(false);
        });
    }


    createStartText(yPos) {
        const { width } = this.sys.game.config;
        const fontName = this.registry.get('gameFont');
        const mainColor = this.registry.get('gameColor');
        const fontWeight = this.registry.get('gameWeight') || '900';

        const sub = this.add.text(width / 2, yPos, "CLIQUEZ OU APPUYEZ SUR ENTRÉE POUR COMMENCER", {
            font: `${fontWeight} ${Math.round(width / 45)}px "${fontName}"`,
            fill: mainColor
        }).setOrigin(0.5);

        this.addFloatingEffect(sub);
        this.uiGroup.add(sub);
    }


    async createLogoTexture(key, svgData) {
        const { width } = this.sys.game.config;
        const targetWidth = width * 0.6;

        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const ratio = img.height / img.width;
                const targetHeight = targetWidth * ratio;
                if (this.textures.exists(key)) this.textures.remove(key);
                const tex = this.textures.createCanvas(key, targetWidth, targetHeight);
                tex.context.drawImage(img, 0, 0, targetWidth, targetHeight);
                tex.update();
                resolve();
            };
            img.src = svgData;
        });
    }


    startGame() {
        this.cleanupGame();
        this.gameState = "PLAYING";
        this.scoreText.setVisible(true);
        this.levelText.setVisible(true);
        this.livesText.setVisible(true);
        this.score = 0; this.level = 0; this.lives = DATA.config.lives;

        const totalFlags = this.FLAGS.length;
        let others = Array.from({ length: totalFlags - 1 }, (_, i) => i + 1);
        for (let i = others.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [others[i], others[j]] = [others[j], others[i]];
        }
        this.levelOrder = [0, ...others];

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
        this.ball.setVisible(0);
        this.physics.add.collider(this.ball, this.paddle, (b, p) => {
            this.comboCount = 0;
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

        const flagIndex = this.levelOrder[i % this.levelOrder.length];
        const currentFlag = this.FLAGS[flagIndex];
        const textureKey = "flag_sharp_" + flagIndex;
        const targetW = this.gridConfig.cols * this.gridConfig.brickW;
        const targetH = this.gridConfig.rows * this.gridConfig.brickH;

        if (!this.textures.exists(textureKey)) await this.createFlagTexture(textureKey, currentFlag.data, targetW, targetH);

        this.bgFlag.setTexture(textureKey);
        this.bgFlag.setDisplaySize(targetW, targetH);

        const startX = Math.floor((width - targetW) / 2);
        this.bgFlag.setPosition(startX, this.gridConfig.startY);
        this.bgFlag.setOrigin(0, 0);
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
        const timeSinceLastHit = currentTime - this.lastBrickTime;
        if (timeSinceLastHit <= this.comboThreshold) {
            this.comboCount++;
        } else {
            this.comboCount = 1;
        }
        this.lastBrickTime = currentTime;
        let totalPoints;
        if (this.comboCount === 1) {
            totalPoints = 25;
        } else {
            totalPoints = this.comboCount * 50;
        }
        this.score += totalPoints;
        if (typeof this.spawnComboWord === 'function') {
            this.spawnComboWord(brick.x, brick.y, totalPoints, this.comboCount);
        }
        this.particles.emitParticleAt(brick.x, brick.y, 20);
        brick.destroy();
        if (this.bricks.countActive() === 0) {
            this.revealFlag();
        }
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
        this.canContinue = false;

        this.trail = [];
        this.trailG.clear();
        this.ball.setVelocity(0, 0).setVisible(false);
        this.paddle.setVisible(false);

        const fontName = this.registry.get('gameFont');
        const fontWeight = this.registry.get('gameWeight');
        const mainColor = this.registry.get('gameColor');

        const flagIndex = this.levelOrder[this.level % this.levelOrder.length];
        const currentFlag = this.FLAGS[flagIndex];
        this.historyText.setText(`${currentFlag.name.toUpperCase()}\n\n${currentFlag.history}`).setVisible(true);

        this.time.delayedCall(3000, () => {
            this.canContinue = true;
            const sub = this.add.text(width / 2, height - 80, "CLIQUEZ OU APPUYEZ SUR ENTRÉE POUR CONTINUER", {
                font: `${fontWeight} 14px "${fontName}"`,
                fill: mainColor
            }).setOrigin(0.5).setResolution(2);
            this.addFloatingEffect(sub);
            this.uiGroup.add(sub);
        });
    }


    resetBall() {
        const { width, height } = this.sys.game.config;
        this.comboCount = 0;
        this.trail = [];
        this.trailG.clear();
        this.ball.setVelocity(0, 0)
            .setPosition(width / 2, height - 150)
            .setVisible(false);
        this.startCountdown();
    }


    startCountdown() {
        const { width, height } = this.sys.game.config;
        const fontName = this.registry.get('gameFont');
        const mainColor = this.registry.get('gameColor');
        const fontWeight = this.registry.get('gameWeight');

        this.ball.setVisible(false);
        const bottomOfBricks = this.gridConfig.startY + (this.gridConfig.rows * this.gridConfig.brickH);
        const centerY = bottomOfBricks + (this.paddle.y - bottomOfBricks) / 2;
        const countdownValues = ['3', '2', '1'];
        let index = 0;

        this.countdownText = this.add.text(width / 2, centerY, '', {
            font: `${fontWeight} ${Math.round(width / 10)}px "${fontName}"`,
            fill: mainColor
        }).setOrigin(0.5).setDepth(100).setResolution(2);

        this.launchTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (index < countdownValues.length) {
                    this.countdownText.setText(countdownValues[index]);
                    this.countdownText.setScale(0.5);
                    this.tweens.add({
                        targets: this.countdownText,
                        scale: 1,
                        duration: 150,
                        ease: 'Back.easeOut'
                    });
                    index++;
                } else {
                    this.countdownText.destroy();
                    this.countdownText = null;
                    this.launchTimer = null;
                    this.launchBall();
                }
            },
            repeat: countdownValues.length
        });
    }


    launchBall() {
        this.ball.setVisible(true);
        this.comboCount = 0;
        this.lastBrickTime = 0;
        const speed = Math.min(this.baseSpeed + (this.level * 20), this.maxSpeed);
        this.ball.setVelocity(Phaser.Math.Between(-80, 80), -speed);
    }


    setPause(isPaused) {
        const { width, height } = this.sys.game.config;
        const fontName = this.registry.get('gameFont');
        const fontWeight = this.registry.get('gameWeight');
        const mainColor = this.registry.get('gameColor');

        if (isPaused) {
            this.gameState = "PAUSED";
            this.physics.world.pause();

            if (this.launchTimer) {
                this.launchTimer.paused = true;
                if (this.countdownText) {
                    this.countdownText.setVisible(false);
                }
            }

            this.pauseText = this.add.text(width / 2, height * 0.65, "PAUSE", {
                font: `${fontWeight} ${Math.round(width / 15)}px "${fontName}"`, fill: mainColor
            }).setOrigin(0.5).setResolution(2).setDepth(100);

            this.pauseSubText = this.add.text(width / 2, this.pauseText.y + (height * 0.1), "CLIQUEZ OU APPUYEZ SUR ENTRÉE POUR CONTINUER", {
                font: `${fontWeight} ${Math.round(width / 45)}px "${fontName}"`, fill: mainColor
            }).setOrigin(0.5).setResolution(2).setDepth(100);

            this.addFloatingEffect(this.pauseSubText);
        } else {
            this.gameState = "PLAYING";
            this.physics.world.resume();

            if (this.launchTimer) {
                this.launchTimer.paused = false;
                if (this.countdownText) {
                    this.countdownText.setVisible(true);
                }
            }
            else if (this.ball.body.velocity.x === 0 && this.ball.body.velocity.y === 0) {
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

        const titleText = "FIN DE LA PARTIE";
        const title = this.add.text(width / 2, height * 0.65, titleText, { font: `${fontWeight} ${Math.round(width / 18)}px "${fontName}"`, fill: mainColor }).setOrigin(0.5).setResolution(2);
        this.uiGroup.add(title);

        if (this.lives < 0) this.livesText.setText(`Vies: 0`);
        if (this.livesText) {
            this.livesText.setText(`Vies : 0`);
            this.livesText.setVisible(true);
        }
        if (this.livesGroup) {
            this.livesGroup.clear(true, true);
        }

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
                if (!this.canContinue) return;
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

        if (Phaser.Input.Keyboard.JustDown(this.enterKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.handleGlobalAction(true);
        }

        if (this.gameState === "PLAYING") {
            this.scoreText.setText(`Score: ${this.score}`);
            this.levelText.setText(`Niveau: ${this.level + 1}`);
            this.livesText.setText(`Vies: ${this.lives}`);

            const moved = Math.abs(pointer.x - this.lastMouseX) > 1;
            this.lastMouseX = pointer.x;

            if (this.cursors.left.isDown || this.cursors.right.isDown) {
                this.lastInputMethod = "keyboard";
            } else if (moved || pointer.isDown) {
                this.lastInputMethod = "mouse";
            }

            if (this.lastInputMethod === "keyboard") {
                if (this.cursors.left.isDown) this.paddle.setVelocityX(-750);
                else if (this.cursors.right.isDown) this.paddle.setVelocityX(750);
                else this.paddle.setVelocityX(0);
            } else {
                const isTouch = pointer.wasTouch;
                if (!isTouch || (isTouch && pointer.isDown)) {
                    this.paddle.setVelocityX((this.lastPointerX - this.paddle.x) * 20);
                } else {
                    this.paddle.setVelocityX(0);
                }
            }

            if (this.ball && this.ball.y > height + 20) {
                this.ball.y = -100;
                this.lives--;
                if (this.lives <= 0) this.gameOver();
                else this.resetBall();
            }

            if (this.ball && this.ball.active && this.ball.visible && (this.ball.body.velocity.x !== 0 || this.ball.body.velocity.y !== 0)) {
                this.trail.push({ x: this.ball.x, y: this.ball.y });
                if (this.trail.length > 20) this.trail.shift();
                this.drawTrail();
            } else {
                this.trailG.clear();
            }
        } else {
            this.trailG.clear();
            this.trail = [];
        }
    }


    drawTrail() {
        this.trailG.clear();
        this.trail.forEach((p, i) => {
            const ratio = i / this.trail.length;
            const color = this.rainbowColors[i % this.rainbowColors.length];
            const radius = 2 + (ratio * 7);
            this.trailG.fillStyle(color, ratio * 0.2);
            this.trailG.fillCircle(p.x, p.y, radius);
            this.trailG.fillStyle(color, ratio * 0.4);
            this.trailG.fillCircle(p.x, p.y, radius * 0.6);
        });
    }

}