import * as Phaser from "phaser";
import MidiAudioPlayer from "midi-audio-player";
// import MidiAudioPlayer from "../../../../midi-audio-player";
import DATA from "./rainbowbreaker.json";


export default class RainbowBreaker extends Phaser.Scene {

    player = null;
    currentSongKey = null;
    songOrder = [];
    songIndex = 0;

    musicOn = false;
    effectsOn = true;
    musicBtn = null;
    effectsBtn = null;
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
    lastClickTime = 0;
    lastPauseTime = 0;
    lastPauseToggleTime = 0;
    lastMultiTouchTime = 0;
    isTogglingPause = false;
    comboThreshold = DATA.config.comboThreshold;
    lifeBonuses = 0;
    isSlowed = false;
    slowTimer = null;
    launchTimer = null;
    countdownText = null;
    canContinue = true;
    gridConfig = { cols: DATA.config.gridCols, rows: DATA.config.gridRows, brickW: 0, brickH: 0, startY: 0, bgflagW: 0, bgflagH: 0 };
    rainbowColors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];
    levelOrder = [];


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
            audio: { noAudio: false },
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
        game.registry.set('onLoadComplete', settings.onLoadComplete);
        game.registry.set('gameFont', (settings.fontFamily || DATA.config.fontFamily).replace(/['"]/g, ''));
        game.registry.set('gameWeight', settings.fontWeight || DATA.config.fontWeight);
        game.registry.set('gameColor', settings.color || DATA.config.color);
        game.registry.set('gameEffects', settings.effets || DATA.config.effets);
        game.registry.set('gameMusic', settings.music || DATA.config.music);

        return game;
    }


    preload() {
        DATA.flags.forEach(flag => this.load.image(`flag_${flag.id}`, flag.data));
        Object.keys(DATA.images).forEach(key => this.load.image(`game_${key}`, DATA.images[key]));
        Object.keys(DATA.songs).forEach(key => this.load.binary(`music_${key}`, DATA.songs[key]));
        Object.keys(DATA.sounds).forEach(key => this.load.audio(`sfx_${key}`, DATA.sounds[key]))
    }


    async create() {
        const { width, height } = this.sys.game.config;

        this.pauseText = null;
        this.pauseSubText = null;

        this.gridConfig.brickW = Math.floor((width * 0.9) / this.gridConfig.cols);
        this.gridConfig.brickH = Math.floor((height * 0.32) / this.gridConfig.rows);
        this.gridConfig.totalWidth = this.gridConfig.cols * this.gridConfig.brickW;
        this.gridConfig.totalHeight = this.gridConfig.rows * this.gridConfig.brickH;
        this.gridConfig.bgflagW = this.gridConfig.cols * this.gridConfig.brickW;
        this.gridConfig.bgflagH = this.gridConfig.rows * this.gridConfig.brickH;
        this.gridConfig.startY = Math.floor(height * 0.15);

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
        this.input.addPointer(1);

        const baseSize = Math.max(14, Math.round(width / 40));
        const textStyle = { font: `${fontWeight} ${baseSize}px "${fontName}"`, fill: mainColor };
        const iconStyle = { font: `${baseSize * 1.6}px "${fontName}"`, fill: mainColor };

        this.scoreText = this.add.text(width * 0.055, height * 0.04, "Score: 0", textStyle)
            .setResolution(2).setDepth(10).setVisible(false);


        this.levelText = this.add.text(width / 2, height * 0.04, "Niveau: 1", textStyle)
            .setResolution(2).setOrigin(0.5, 0).setDepth(10).setVisible(false);


        this.livesText = this.add.text(width * 0.945, height * 0.04, "Vies: " + DATA.config.lives, textStyle)
            .setResolution(2).setOrigin(1, 0).setDepth(10).setVisible(false);



        this.musicBtn = this.add.text(width * 0.35, height * 0.025, DATA.icons.music, iconStyle)
            .setOrigin(0.5, 0)
            .setInteractive({ useHandCursor: true })
            .setDepth(10)
            .setVisible(false);

        this.effectsBtn = this.add.text(width * 0.65, height * 0.025, DATA.icons.effets, iconStyle)
            .setOrigin(0.5, 0)
            .setInteractive({ useHandCursor: true })
            .setDepth(10)
            .setVisible(false);


        this.musicBtn.setOrigin(0.5, 0);
        this.musicBtn.setInteractive(new Phaser.Geom.Circle(15, 15, 35), Phaser.Geom.Circle.Contains);

        this.effectsBtn.setOrigin(0.5, 0);
        this.effectsBtn.setInteractive(new Phaser.Geom.Circle(15, 15, 35), Phaser.Geom.Circle.Contains);



        const songKeys = Object.keys(DATA.songs);
        this.songOrder = Phaser.Utils.Array.Shuffle([...songKeys]);
        this.songIndex = 0;

        this.musicOn = this.registry.get('gameMusic');
        const musicStore = localStorage.getItem('gameMusic');
        if(musicStore) this.musicOn = musicStore === 'yes' ? true : false;

        this.player = new MidiAudioPlayer({
            volume: DATA.config.musicVolume,
            onEndFile: async () => await this.playNextSong()
        });

        this.effectsOn = this.registry.get('gameEffets');
        const effetsStore = localStorage.getItem('gameEffets');
        if(effetsStore) this.effectsOn = effetsStore === 'yes' ? true : false;

        if (!this.musicOn) {
            this.musicBtn.setAlpha(0.3);
            this.musicBtn.setTint(0x808080);
        }

        if (!this.effectsOn) {
            this.effectsBtn.setAlpha(0.3);
            this.effectsBtn.setTint(0x808080);
        }

        this.musicBtn.on('pointerdown', (pointer) => {
            pointer.event.stopPropagation();
            this.musicOn = !this.musicOn;

            if (this.musicOn) {
                this.musicBtn.setAlpha(1);
                this.musicBtn.clearTint();
                localStorage.setItem('gameMusic', 'yes');
                this.playNextSong();
            } else {
                this.musicBtn.setAlpha(0.3);
                this.musicBtn.setTint(0x808080);
                localStorage.setItem('gameMusic', 'no');
                this.player.stop();
            }
        });

        this.effectsBtn.on('pointerdown', (pointer) => {
            pointer.event.stopPropagation();
            this.effectsOn = !this.effectsOn;

            if (this.effectsOn) {
                this.effectsBtn.setAlpha(1);
                this.effectsBtn.clearTint();
                localStorage.setItem('gameEffets', 'yes');
            } else {
                this.effectsBtn.setAlpha(0.3);
                this.effectsBtn.setTint(0x808080);
                localStorage.setItem('gameEffets', 'no');
            }
        });


        this.historyText = this.add.text(width / 2, this.gridConfig.startY + this.gridConfig.totalHeight + 30, "", {
            font: `600 ${Math.max(12, baseSize * 0.8)}px "${fontName}"`, fill: mainColor,
            align: "center", wordWrap: { width: width * 0.8 }
        }).setOrigin(0.5, 0).setResolution(2).setDepth(10).setVisible(false);

        this.particles = this.add.particles(0, 0, "part", {
            speed: { min: 100, max: 400 },
            angle: { min: 0, max: 360 },
            lifespan: 800,
            gravityY: 300,
            emitting: false,
            alpha: { start: 1, end: 0.7 },
            scale: { start: 1.8, end: 0 },
            tint: () => {
                const base = Phaser.Display.Color.ValueToColor(Phaser.Utils.Array.GetRandom(this.rainbowColors));
                const washed = Phaser.Display.Color.Interpolate.ColorWithColor(base, new Phaser.Display.Color(255, 255, 255), 100, 40);
                return Phaser.Display.Color.GetColor(washed.r, washed.g, washed.b);
            }
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

        this.input.on('pointerdown', (pointer) => {
            if (this.input.pointer1.active && this.input.pointer2.active) {
                this.lastMultiTouchTime = this.time.now;
                this.handleTogglePause();
                return;
            }
            const currentTime = this.time.now;
            const diff = currentTime - this.lastClickTime;
            this.lastClickTime = currentTime;
            if (diff < 250 && diff > 0) {
                if (this.gameState === "PLAYING" || this.gameState === "PAUSED") {
                    this.handleTogglePause();
                    pointer.ignoreNextUp = true;
                }
            } else {
                pointer.ignoreNextUp = false;
            }
        });

        this.input.on('pointerup', (pointer) => {
            if (pointer.ignoreNextUp) {
                pointer.ignoreNextUp = false;
                return;
            }
            if (this.input.hitTestPointer(pointer).length > 0) return;
            if (this.time.now - this.lastMultiTouchTime < 500) return;
            this.handleGlobalAction(false);
        });

        const onLoadComplete = this.registry.get('onLoadComplete');
        if (onLoadComplete && typeof onLoadComplete === 'function') {
            try {
                await onLoadComplete();
            } catch (error) {
                console.error("Erreur dans le callback onLoadComplete:", error);
            }
        }

        this.showStartScreen();
    }


    async playNextSong() {
        if (this.songOrder.length === 0) return;
        if (this.songIndex >= this.songOrder.length) {
            Phaser.Utils.Array.Shuffle(this.songOrder);
            this.songIndex = 0;
            if (this.songOrder[0] === this.currentSongKey && this.songOrder.length > 1) {
                Phaser.Utils.Array.Shuffle(this.songOrder);
            }
        }

        const nextKey = this.songOrder[this.songIndex];
        // console.log('Song: ' + nextKey);
        this.player.play(this.cache.binary.get(`music_${nextKey}`));
        this.songIndex++;
        this.currentSongKey = nextKey;
    }


    addFloatingEffect(target) {
        this.tweens.add({ targets: target, y: target.y - 5, duration: 800, ease: 'Sine.easeInOut', yoyo: true, loop: -1 });
    }


    cleanupGame() {
        this.cancelSlowMotion();
        if (this.bricks) { this.bricks.clear(true, true); this.bricks.destroy(); this.bricks = null; }
        if (this.paddle) { this.paddle.destroy(); this.paddle = null; }
        if (this.ball) { this.ball.destroy(); this.ball = null; }
        if (this.lifeBonuses) { this.lifeBonuses.clear(true, true); }
        this.trail = [];
        this.trailG.clear();
        this.uiGroup.clear(true, true);
    }


    showStartScreen() {
        this.cleanupGame();
        const { width, height } = this.sys.game.config;
        this.gameState = "START";

        if (this.bgFlag) this.bgFlag.setAlpha(0);
        if (this.textures.exists('game_logo')) {
            const logo = this.add.image(width / 2, height * 0.45, 'game_logo');
            const displayWidth = width * 0.6;
            const scale = displayWidth / logo.width;
            logo.setScale(scale);
            this.uiGroup.add(logo);
            this.createStartText(logo.y + (logo.displayHeight / 2) + 50);
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
            this.highScoreText,
            this.musicBtn,
            this.effectsBtn
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


    startGame() {
        this.cleanupGame();
        this.gameState = "PLAYING";
        this.scoreText.setVisible(true);
        this.levelText.setVisible(true);
        this.livesText.setVisible(true);
        this.musicBtn.setVisible(true);
        this.effectsBtn.setVisible(true);
        this.score = 0; this.level = 0; this.lives = DATA.config.lives;

        const totalFlags = DATA.flags.length;
        let others = Array.from({ length: totalFlags - 1 }, (_, i) => i + 1);
        for (let i = others.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [others[i], others[j]] = [others[j], others[i]];
        }
        this.levelOrder = [0, ...others];

        this.bricks = this.physics.add.staticGroup();
        this.createGameObjects();

        if (this.musicOn) {
            this.playNextSong();
        }
        this.loadLevel(this.level);
    }


    createGameObjects() {
        const { width, height } = this.sys.game.config;
        const mainColor = this.registry.get('gameColor');
        const phaserColor = Phaser.Display.Color.HexStringToColor(mainColor).color;

        this.paddle = this.physics.add.image(width / 2, height - 40, "paddle").setImmovable(true).setTint(phaserColor);
        this.paddle.setCollideWorldBounds(true);
        this.paddle.body.checkCollision.down = false;
        this.paddle.setCollideWorldBounds(true);
        if (!this.lifeBonuses) this.lifeBonuses = this.physics.add.group();

        this.ball = this.physics.add.image(width / 2, height - 150, "ball").setCircle(9).setBounce(1, 1).setCollideWorldBounds(true).setDepth(100);
        this.ball.setVisible(0);
        this.physics.add.collider(this.ball, this.paddle, (ball, paddle) => {
            this.playSoundEffet('sfx_paddle');
            this.comboCount = 0;
            let diff = ball.x - paddle.x;
            ball.setVelocityX(10 * diff); 
        });

        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
        this.physics.add.overlap(this.paddle, this.lifeBonuses, this.collectLife, null, this);
    }


    async playSoundEffet(id) {
        if (this.effectsOn) {
            this.sound.play(id, { volume: 0.1 });
        }
    }


    async loadLevel(i) {
        const { width } = this.sys.game.config;
        this.gameState = "PLAYING";
        this.historyText.setVisible(false);
        this.uiGroup.clear(true, true);
        if (this.bricks) this.bricks.clear(true, true);

        const flagIndex = this.levelOrder[i % this.levelOrder.length];
        const currentFlag = DATA.flags[flagIndex];
        const textureKey = currentFlag.id;
        const targetW = this.gridConfig.bgflagW;
        const targetH = this.gridConfig.bgflagH;

        this.bgFlag.setTexture(`flag_${currentFlag.id}`);
        this.bgFlag.setSize(targetW, targetH);
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


    hitBrick(ball, brick) {
        if (!brick || !brick.active) return;
        const currentTime = this.time.now;
        const timeSinceLastHit = currentTime - this.lastBrickTime;
        if (timeSinceLastHit <= this.comboThreshold) this.comboCount++;
        else this.comboCount = 1;
        this.lastBrickTime = currentTime;
        let totalPoints;
        if (this.comboCount === 1) totalPoints = 50;
        else totalPoints = this.comboCount * 50;
        this.score += totalPoints;
        this.spawnComboWord(brick.x, brick.y, totalPoints, this.comboCount);
        this.particles.emitParticleAt(brick.x, brick.y, 20);
        if (Phaser.Math.Between(1, DATA.config.bonusChance) === 1) this.spawnLifeBonus(brick.x, brick.y);
        brick.destroy();

        if (this.bricks.countActive() === 0) {
            if (this.lifeBonuses) this.lifeBonuses.clear(true, true);
            this.score += 1000;
            this.playSoundEffet('sfx_levelup');
            this.particles.emitParticleAt(this.scoreText.x + 50, this.scoreText.y + 10, 40);
            this.flashTextEffect(this.scoreText, 0x00ff00);
            this.update();
            this.revealFlag();
        } else {
            this.playSoundEffet('sfx_brick');
        }
    }


    flashTextEffect(target, color) {
        const originalFill = this.registry.get('gameColor');
        const baseColor = Phaser.Display.Color.IntegerToColor(color);
        const washedColor = Phaser.Display.Color.Interpolate.ColorWithColor(baseColor, { r: 255, g: 255, b: 255 }, 100, 30);
        const finalHex = Phaser.Display.Color.GetColor(washedColor.r, washedColor.g, washedColor.b);
        target.setFill(Phaser.Display.Color.IntegerToColor(finalHex).rgba);
        this.tweens.add({
            targets: target,
            scale: 1.05,
            duration: 100,
            yoyo: true,
            ease: 'Cubic.easeInOut',
            onComplete: () => {
                target.setFill(originalFill);
                target.setScale(1);
            }
        });
    }


    spawnComboWord(x, y, bonus) {
        const fontName = this.registry.get('gameFont');
        const fontWeight = this.registry.get('gameWeight');
        const mainColor = this.registry.get('gameColor');
        const word = Phaser.Utils.Array.GetRandom(DATA.words);
        const txt = this.add.text(x, y, `${word}\n+${bonus}`, {
            font: `${fontWeight} 22px "${fontName}"`, fill: mainColor,
            stroke: "#FFF", strokeThickness: 4, align: "center"
        }).setOrigin(0.5).setDepth(20).setResolution(2);
        this.tweens.add({ targets: txt, y: y - 100, alpha: 0, scale: 1.3, duration: 2200, ease: 'Cubic.easeOut', onComplete: () => txt.destroy() });
    }


    spawnLifeBonus(x, y) {
        const types = [
            { char: DATA.icons.life, type: 'LIFE' },
            { char: DATA.icons.slow, type: 'SLOW' },
            { char: DATA.icons.points, type: 'POINTS' }
        ];
        const selected = Phaser.Utils.Array.GetRandom(types);
        const bonus = this.add.text(x, y, selected.char, { fontSize: '28px', padding: { x: 10, y: 10 }}).setOrigin(0.5);
        this.physics.add.existing(bonus);
        this.lifeBonuses.add(bonus);
        bonus.setData('type', selected.type);
        bonus.body.setVelocityY(200);
        bonus.body.setCollideWorldBounds(false);
        this.tweens.add({
            targets: bonus,
            scale: 1.1,
            duration: 500,
            yoyo: true,
            loop: -1
        });
    }


    collectLife(paddle, bonus) {
        if (!bonus || !bonus.active) return;
        const type = bonus.getData('type');
        bonus.destroy();
        if (type === 'LIFE') {
            this.lives++;
            this.playSoundEffet('sfx_lifeup');
            this.flashTextEffect(this.livesText, 0x00ff00);
            this.particles.emitParticleAt(this.livesText.x - 40, this.livesText.y + 10, 15);
        }
        else if (type === 'POINTS') {
            this.score += 500;
            this.playSoundEffet('sfx_points');
            this.flashTextEffect(this.scoreText, 0x00ff00);
            this.particles.emitParticleAt(this.scoreText.x + 50, this.scoreText.y + 10, 15);
        }
        else if (type === 'SLOW') {
            this.playSoundEffet('sfx_slow');
            this.applySlowMotion(10000);
        }
        this.particles.emitParticleAt(paddle.x, paddle.y, 10);
    }


    applySlowMotion(duration) {
        if (!this.ball || !this.ball.body) return;
        if (this.slowTimer) this.slowTimer.destroy();
        if (!this.isSlowed) {
            this.isSlowed = true;
            this.ball.body.velocity.scale(0.75);
            this.ball.setTint(0x00ffff);
        }
        this.slowTimer = this.time.delayedCall(duration, () => {
            if (this.ball && this.ball.body && this.gameState === "PLAYING") {
                this.isSlowed = false;
                this.ball.clearTint();
                const targetSpeed = Math.min(this.baseSpeed + (this.level * 20), this.maxSpeed);
                this.ball.body.velocity.normalize().scale(targetSpeed);
                this.slowTimer = null;
            }
        });
        if (this.gameState === "PAUSED") this.slowTimer.paused = true;
    }


    revealFlag() {
        const { width, height } = this.sys.game.config;
        this.gameState = "REVEAL";
        this.canContinue = false;
        this.cancelSlowMotion();

        if (this.lifeBonuses) this.lifeBonuses.clear(true, true);

        this.trail = [];
        this.trailG.clear();
        this.ball.setVelocity(0, 0).setVisible(false);
        this.paddle.setVisible(false);

        const fontName = this.registry.get('gameFont');
        const fontWeight = this.registry.get('gameWeight');
        const mainColor = this.registry.get('gameColor');

        const flagIndex = this.levelOrder[this.level % this.levelOrder.length];
        const currentFlag = DATA.flags[flagIndex];
        const textureKey = currentFlag.id;

        this.historyText.setText(`${currentFlag.name.toUpperCase()}\n\n${currentFlag.history}`).setVisible(true);

        const targetW = this.gridConfig.bgflagW;
        const targetH = this.gridConfig.bgflagH;

        this.bgFlag.setTexture(`flag_${currentFlag.id}`);
        this.bgFlag.setOrigin(0.5, 0.5);
        this.bgFlag.setDisplaySize(targetW, targetH);

        const centerX = Math.floor((width - targetW) / 2) + (targetW / 2);
        const centerY = this.gridConfig.startY + (targetH / 2);
        this.bgFlag.setPosition(centerX, centerY);
        this.bgFlag.setAlpha(1);

        this.tweens.add({
            targets: this.bgFlag,
            displayWidth: targetW * 1.05,
            displayHeight: targetH * 1.05,
            duration: 150,
            yoyo: true,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                this.bgFlag.setDisplaySize(targetW, targetH);
            }
        });

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


    cancelSlowMotion() {
        this.isSlowed = false;
        if (this.slowTimer) {
            this.slowTimer.destroy();
            this.slowTimer = null;
        }
        if (this.ball) this.ball.clearTint();
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
                    if(!this.musicOn) this.playSoundEffet('sfx_count');
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
        let speed = Math.min(this.baseSpeed + (this.level * 20), this.maxSpeed);
        if (this.isSlowed) {
            speed = speed * 0.5;
            this.ball.setTint(0x00ffff);
        }
        this.ball.setVelocity(Phaser.Math.Between(-80, 80), -speed);
    }


    handleTogglePause() {
        if (this.gameState === "PLAYING") this.setPause(true);
        else if (this.gameState === "PAUSED") this.setPause(false);
    }


    setPause(isPaused) {
        const { width, height } = this.sys.game.config;
        const fontName = this.registry.get('gameFont');
        const fontWeight = this.registry.get('gameWeight');
        const mainColor = this.registry.get('gameColor');

        if (isPaused) {
            this.gameState = "PAUSED";
            this.physics.world.pause();
            if (this.musicOn) this.player.pause();
            if (this.slowTimer) this.slowTimer.paused = true;
            if (this.launchTimer) {
                this.launchTimer.paused = true;
                if (this.countdownText) this.countdownText.setVisible(false);
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
            if (this.musicOn) this.player.play();
            if (this.slowTimer) this.slowTimer.paused = false;
            if (this.launchTimer) {
                this.launchTimer.paused = false;
                if (this.countdownText) this.countdownText.setVisible(true);
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

        if(this.musicOn) await this.player.stop();
        this.playSoundEffet('sfx_gameover');   

        const titleText = "FIN DE LA PARTIE";
        const title = this.add.text(width / 2, height * 0.65, titleText, { font: `${fontWeight} ${Math.round(width / 18)}px "${fontName}"`, fill: mainColor }).setOrigin(0.5).setResolution(2);
        this.uiGroup.add(title);

        if (this.lives < 0) this.livesText.setText(`Vies: 0`);
        if (this.livesText) {
            this.livesText.setText(`Vies : 0`);
            this.livesText.setVisible(true);
        }

        if (this.livesGroup) this.livesGroup.clear(true, true);
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
                this.startGame();
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
        if (!this.paddle || !this.paddle.body || !this.ball || !this.ball.body) return;
        if (Phaser.Input.Keyboard.JustDown(this.enterKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) this.handleGlobalAction(true);

        if (this.gameState === "PLAYING") {
            this.scoreText.setText(`Score: ${this.score.toLocaleString()}`);
            this.levelText.setText(`Niveau: ${this.level + 1}`);
            this.livesText.setText(`Vies: ${this.lives}`);

            const moved = Math.abs(pointer.x - this.lastMouseX) > 1;
            this.lastMouseX = pointer.x;

            if (this.cursors.left.isDown || this.cursors.right.isDown) this.lastInputMethod = "keyboard";
            else if (moved || pointer.isDown) this.lastInputMethod = "mouse";

            if (this.lastInputMethod === "keyboard") {
                if (this.cursors.left.isDown) this.paddle.setVelocityX(-750);
                else if (this.cursors.right.isDown) this.paddle.setVelocityX(750);
                else this.paddle.setVelocityX(0);
            } else {
                const isTouch = pointer.wasTouch;
                if (!isTouch || (isTouch && pointer.isDown)) this.paddle.setVelocityX((this.lastPointerX - this.paddle.x) * 20);
                else this.paddle.setVelocityX(0);
            }

            if (this.ball && this.ball.y > height + 20) {
                this.ball.y = -100;
                this.lives--;
                this.flashTextEffect(this.livesText, 0xff0000);
                if (this.lives <= 0) this.gameOver();
                else {
                    this.playSoundEffet('sfx_lifedown');    
                    this.resetBall();
                }
            }

            if (this.ball && this.ball.body) {
                if (Math.abs(this.ball.body.velocity.y) < 100 && Math.abs(this.ball.body.velocity.x) > 10) {
                    const direction = this.ball.body.velocity.y > 0 ? 1 : -1;
                    this.ball.body.setVelocityY(direction * 150);
                }
                const currentSpeed = this.isSlowed ?
                    Math.min(this.baseSpeed + (this.level * 20), this.maxSpeed) * 0.5 :
                    Math.min(this.baseSpeed + (this.level * 20), this.maxSpeed);
                if (Math.abs(this.ball.body.velocity.length() - currentSpeed) > 1) {
                    this.ball.body.velocity.normalize().scale(currentSpeed);
                }
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