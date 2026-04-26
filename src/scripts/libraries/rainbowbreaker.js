import * as Phaser from "phaser";

export default class RainbowBreaker extends Phaser.Scene {
    /**
     * @param {Object} settings 
     * @param {string} settings.fontFamily - Ex: 'Unbounded'
     * @param {string|number} settings.fontWeight - Ex: 900
     * @param {string} settings.color - Hexadécimal pour le texte et pad. Ex: '#000000'
     */
    static init(settings) {
        const config = {
            type: Phaser.AUTO,
            parent: settings.parent,
            width: settings.width,
            height: settings.height,
            transparent: true,
            antialias: true,
            pixelArt: false,
            roundPixels: true,
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
        
        const cleanFont = (settings.fontFamily || 'Arial').replace(/['"]/g, '');
        const weight = settings.fontWeight || '900';
        const mainColor = settings.color || '#000000'; 
        
        game.registry.set('onGameOver', settings.onGameOver);
        game.registry.set('gameFont', cleanFont);
        game.registry.set('gameWeight', weight);
        game.registry.set('gameColor', mainColor);
        
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
        this.comboThreshold = 450; 
        this.comboWords = ["INTOLÉRANCE", "OBSCURANTISME", "AVEUGLEMENT", "BIGOTERIE", "BULLYING", "OFFUSCATION", "CHAUVINISME", "SOPHISME", "XÉNOPHOBIE", "RACISME", "HAINE", "IGNORANCE", "BON DIEUZARD", "PROFANE", "HOSTILITÉ", "HUBRIS", "TÊTE DE COCHON", "ESPRIT DE CLOCHER", "FIEL", "MÉPRIS", "FANATISME", "ACHARNEMENT", "CRUAUTÉ", "MALIGNITÉ", "TIDIO CONNAISSANT", "DUNNING-KRUGER", "PÉDANTE", "MADAME JE-SAIS-TOUT", "PEUR", "ARROGANCE", "CONDESCENDANCE"];

        this.gridConfig = { cols: 8, rows: 4, brickW: 90, brickH: 45, startY: 100 };
        this.gridConfig.totalWidth = this.gridConfig.cols * this.gridConfig.brickW;
        this.gridConfig.totalHeight = this.gridConfig.rows * this.gridConfig.brickH;
        this.rainbowColors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];

        this.FLAGS = [
            { id: "flag_trans", name: "Drapeau Transgenre", data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MjAgMTgwIj4KICA8cGF0aCBmaWxsPSIjNWJjZWZhIiBkPSJNMCAwaDcyMHYxODBIMHoiLz4KICA8cGF0aCBmaWxsPSIjZjVhOWI4IiBkPSJNMCAzNmg3MjB2MTA4SDB6Ii8+CiAgPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNzJoNzIwdjM2SDB6Ii8+Cjwvc3ZnPgo=", history: "Dessiné par Monica Helms en 1999. Le bleu pour les garçons, le rose pour les filles et le blanc pour la transition." },
            { id: "flag_bi", name: "Drapeau Bisexuel", data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MjAgMTgwIj4KICA8cGF0aCBmaWxsPSIjMDAzOGE4IiBkPSJNMCAwaDcyMHYxODBIMHoiLz4KICA8cGF0aCBmaWxsPSIjOWI0Zjk2IiBkPSJNMCAwaDcyMHYxMDhIMHoiLz4KICA8cGF0aCBmaWxsPSIjZDYwMjcwIiBkPSJNMCAwaDcyMHY3MkgweiIvPgo8L3N2Zz4K", history: "Créé par Michael Page en 1998. Le rose pour l'attirance même sexe, le bleu pour l'autre, et le violet pour le mélange." },
            { id: "flag_intersex", name: "Drapeau Intersexe", data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDAwIDYwMCI+CiAgPHBhdGggZmlsbD0iI2ZmZDgwMCIgZD0iTTAgMGgyNDAwdjYwMEgweiIvPgogIDxjaXJjbGUgY3g9IjEyMDAiIGN5PSIzMDAiIHI9IjE0NyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNzkwMmFhIiBzdHJva2Utd2lkdGg9IjUwIi8+Cjwvc3ZnPg==", history: "Créé par Morgan Carpenter en 2013. Le fond jaune et le cercle violet évitent les couleurs associées au genre. Le cercle symbolise la complétude." },
            { id: "flag_lesbian", name: "Drapeau Lesbien", data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MjAgMTgwIj4KICA8cGF0aCBmaWxsPSIjZDQyYzAwIiBkPSJNMCAwaDcyMHYzNkgweiIvPgogIDxwYXRoIGZpbGw9IiNmZDk4NTUiIGQ9Ik0wIDM2aDcyMHYzNkgweiIvPgogIDxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0wIDcyaDcyMHYzNkgweiIvPgogIDxwYXRoIGZpbGw9IiNkMTYxYTIiIGQ9Ik0wIDEwOGg3MjB2MzZIMHoiLz4KICA8cGF0aCBmaWxsPSIjYTIwMTYxIiBkPSJNMCAxNDRoNzIwdjM2SDB6Ii8+Cjwvc3ZnPgo=", history: "Cette version à 7 bandes représente la non-conformité de genre, l'indépendance, la communauté, l'amour et la féminité." },
            { id: "flag_pan", name: "Drapeau Pansexuel", data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MjAgMTgwIj4KICA8cGF0aCBmaWxsPSIjMjFiMWZmIiBkPSJNMCAwaDcyMHYxODBIMCIvPgogIDxwYXRoIGZpbGw9IiNmZmQ4MDAiIGQ9Ik0wIDBoNzIwdjEyMEgwIi8+CiAgPHBhdGggZmlsbD0iI2ZmMjE4YyIgZD0iTTAgMGg3MjB2NjBIMCIvPgo8L3N2Zz4K", history: "Représente l'attirance pour tous les genres : féminin (rose), masculin (bleu) et non-binaire (jaune)." },
            { id: "flag_pride", name: "Pride Progressif", data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MjAgMTgwIj4KICA8cGF0aCBmaWxsPSIjNmQyMzgwIiBkPSJNMCAwaDcyMHYxODBIMHoiLz4KICA8cGF0aCBmaWxsPSIjMmM1OGE0IiBkPSJNMCAwaDcyMHYxNTBIMHoiLz4KICA8cGF0aCBmaWxsPSIjNzhiODJhIiBkPSJNMCAwaDcyMHYxMjBIMHoiLz4KICA8cGF0aCBmaWxsPSIjZWZlNTI0IiBkPSJNMCAwaDcyMHY5MEgweiIvPgogIDxwYXRoIGZpbGw9IiNmMjg5MTciIGQ9Ik0wIDBoNzIwdjYwSDB6Ii8+CiAgPHBhdGggZmlsbD0iI2UyMjAxNiIgZD0iTTAgMGg3MjB2MzBIMHoiLz4KICA8cGF0aCBkPSJNNzQgMEgwdjE4MGg3NGw4NC05MHoiLz4KICA8cGF0aCBmaWxsPSIjOTQ1NTE2IiBkPSJNNTcgMEgwdjE4MGg1N2w4My05MHoiLz4KICA8cGF0aCBmaWxsPSIjN2JjY2U1IiBkPSJNNDAgMEgwdjE4MGg0MGw4My05MHoiLz4KICA8cGF0aCBmaWxsPSIjZjRhZWM4IiBkPSJNMjIgMEgwdjE4MGgyMmw4NC05MHoiLz4KICA8cGF0aCBmaWxsPSIjZmZmIiBkPSJNMCAwdjE4MGg1bDgzLTkwTDUgMHoiLz4KICA8cGF0aCBmaWxsPSIjZmRkODE3IiBkPSJtMCAxNjcgNzEtNzdMMCAxM3oiLz4KICA8Y2lyY2xlIGN4PSIyNi4yIiBjeT0iOTAiIHI9IjE4LjkiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY2MzM4YiIgc3Ryb2tlLXdpZHRoPSI0LjUiLz4KPC9zdmc+", history: "Créé en 2018 par Daniel Quasar et mis à jour en 2021 par Valentino Vecchietti, ce drapeau inclut les personnes trans, les communautés racisées, les personnes vivant avec le VIH/SIDA ainsi que les personnes intersexes." }
        ];
    }

    preload() {
        this.FLAGS.forEach(f => {
            this.load.svg(f.id, f.data, { scale: 2 });
        });
    }

    create() {
        this.onGameOverCallback = this.registry.get('onGameOver');
        const fontName = this.registry.get('gameFont');
        const fontWeight = this.registry.get('gameWeight');
        const mainColor = this.registry.get('gameColor');

        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xffffff).fillRect(0, 0, 120, 20).generateTexture("paddle", 120, 20);
        g.clear();
        for (let r = 9; r > 0; r--) {
            const color = this.rainbowColors[r % this.rainbowColors.length];
            g.fillStyle(color).fillCircle(9, 9, r);
        }
        g.generateTexture("ball", 18, 18);
        g.clear();
        const bw = this.gridConfig.brickW;
        const bh = this.gridConfig.brickH;
        g.fillStyle(0xbdc3c7, 1); 
        g.fillRect(0, 0, bw, bh);
        g.fillStyle(0xffffff, 0.3);
        g.fillRect(0, 0, bw, bh / 2);
        g.lineStyle(2, 0xffffff, 0.6);
        g.strokeLineShape(new Phaser.Geom.Line(0, 0, bw, 0));
        g.strokeLineShape(new Phaser.Geom.Line(0, 0, 0, bh));
        g.generateTexture("brick_cover", bw, bh);
        g.clear();
        g.fillStyle(0xffffff).fillRect(0, 0, 5, 5).generateTexture("part", 5, 5);
        g.destroy();

        this.physics.world.setBounds(0, 60, this.sys.game.config.width, this.sys.game.config.height - 60);
        this.physics.world.checkCollision.down = false;

        this.bgFlag = this.add.image(this.sys.game.config.width / 2, this.gridConfig.startY, "").setOrigin(0.5, 0).setDepth(0).setAlpha(0);
        this.trailG = this.add.graphics().setDepth(1);
        this.uiGroup = this.add.group();
        this.cursors = this.input.keyboard.createCursorKeys();
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        const textStyle = { 
            font: `${fontWeight} 18px "${fontName}"`, 
            fill: mainColor
        };

        this.scoreText = this.add.text(40, 25, "Score: 0", textStyle).setDepth(10).setVisible(false);
        this.levelText = this.add.text(this.sys.game.config.width / 2, 25, "Niveau: 1", textStyle).setOrigin(0.5, 0).setDepth(10).setVisible(false);
        this.livesText = this.add.text(this.sys.game.config.width - 40, 25, "Vies: 3", textStyle).setOrigin(1, 0).setDepth(10).setVisible(false);

        this.historyText = this.add.text(this.sys.game.config.width / 2, this.gridConfig.startY + this.gridConfig.totalHeight + 30, "", {
            font: `600 16px "${fontName}"`, fill: mainColor,
            align: "center", wordWrap: { width: 600 }
        }).setOrigin(0.5, 0).setDepth(10).setVisible(false);

        this.particles = this.add.particles(0, 0, "part", {
            speed: { min: 100, max: 400 },
            angle: { min: 0, max: 360 },
            scale: { start: 2, end: 0 },
            lifespan: 800,
            gravityY: 300,
            emitting: false
        }).setDepth(5);

        this.showStartScreen();
    }

    addFloatingEffect(target) {
        this.tweens.add({
            targets: target,
            y: target.y - 5,
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            loop: -1
        });
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

        const fontName = this.registry.get('gameFont');
        const fontWeight = this.registry.get('gameWeight');
        const mainColor = this.registry.get('gameColor');

        const title = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2 - 40, "🌈 BRICK BREAQUEER", {
            font: `${fontWeight} 38px "${fontName}"`, fill: mainColor
        }).setOrigin(0.5);

        const sub = this.add.text(this.sys.game.config.width / 2, title.y + 60, "APPUYEZ SUR ENTRÉE POUR COMMENCER", {
            font: `${fontWeight} 14px "${fontName}"`, fill: mainColor
        }).setOrigin(0.5);

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
        const mainColor = this.registry.get('gameColor');
        const phaserColor = Phaser.Display.Color.HexStringToColor(mainColor).color;

        this.paddle = this.physics.add.image(this.sys.game.config.width / 2, this.sys.game.config.height - 40, "paddle").setImmovable(true).setTint(phaserColor);
        this.paddle.setCollideWorldBounds(true);
        
        this.ball = this.physics.add.image(this.sys.game.config.width / 2, this.sys.game.config.height - 150, "ball").setCircle(9).setBounce(1, 1).setCollideWorldBounds(true).setDepth(100);
        this.physics.add.collider(this.ball, this.paddle, (b, p) => {
            let diff = b.x - p.x;
            b.setVelocityX(10 * diff);
        });
        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
    }

    loadLevel(i) {
        this.gameState = "PLAYING";
        this.historyText.setVisible(false);
        this.uiGroup.clear(true, true);
        if (this.bricks) this.bricks.clear(true, true);

        const currentFlag = this.FLAGS[i % this.FLAGS.length];
        this.bgFlag.setTexture(currentFlag.id);
        this.bgFlag.setDisplaySize(this.gridConfig.totalWidth, this.gridConfig.totalHeight);
        this.bgFlag.setAlpha(1);

        const startX = (this.sys.game.config.width - this.gridConfig.totalWidth) / 2;
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
        const currentTime = this.time.now;
        
        if (currentTime - this.lastBrickTime < this.comboThreshold) {
            this.comboCount++;
            const comboBonus = 100 + ((this.comboCount - 1) * 50);
            this.score += comboBonus;
            this.spawnComboWord(brick.x, brick.y, comboBonus);
        } else {
            this.comboCount = 0;
            this.score += 25;
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
        }).setOrigin(0.5).setDepth(20);

        this.tweens.add({
            targets: txt, y: y - 100, alpha: 0,
            scale: 1.3, duration: 2200, ease: 'Cubic.easeOut',
            onComplete: () => txt.destroy()
        });
    }

    revealFlag() {
        this.gameState = "REVEAL";
        this.ball.setVelocity(0, 0).setVisible(false);
        this.paddle.setVisible(false);
        const fontName = this.registry.get('gameFont');
        const fontWeight = this.registry.get('gameWeight');
        const mainColor = this.registry.get('gameColor');
        const currentFlag = this.FLAGS[this.level % this.FLAGS.length];
        this.historyText.setText(`${currentFlag.name.toUpperCase()}\n\n${currentFlag.history}`).setVisible(true);

        const sub = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height - 80, "APPUYEZ SUR ENTRÉE POUR CONTINUER", {
            font: `${fontWeight} 14px "${fontName}"`, fill: mainColor
        }).setOrigin(0.5);
        
        this.addFloatingEffect(sub);
        this.uiGroup.add(sub);
    }

    resetBall() {
        this.comboCount = 0;
        this.trail = [];
        this.trailG.clear();

        this.ball.setVelocity(0, 0);
        this.ball.setPosition(this.sys.game.config.width / 2, this.sys.game.config.height - 150);
        this.ball.setAlpha(1);
        this.ball.setVisible(true);

        this.time.delayedCall(1000, () => {
            if (this.gameState !== "PLAYING" || !this.ball.active) return;
            
            const speed = Math.min(this.baseSpeed + (this.level * 20), this.MAX_SPEED);
            this.ball.setVelocity(Phaser.Math.Between(-80, 80), -speed);
        });
    }

    async gameOver() {
        this.gameState = "WAITING_FOR_CALLBACK";
        if (this.ball) this.ball.setVelocity(0, 0);
        this.historyText.setVisible(false);
        const fontName = this.registry.get('gameFont');
        const fontWeight = this.registry.get('gameWeight');
        const mainColor = this.registry.get('gameColor');

        const title = this.add.text(this.sys.game.config.width / 2, 400, "FIN DE LA PARTIE", {
            font: `${fontWeight} 32px "${fontName}"`, fill: mainColor
        }).setOrigin(0.5);
        this.uiGroup.add(title);
        this.livesText.setText(`Vies: 0`);

        if (this.onGameOverCallback) {
            await this.onGameOverCallback({ score: this.score, levelReached: this.level + 1 });
        }

        this.gameState = "GAMEOVER";
        const sub = this.add.text(this.sys.game.config.width / 2, 470, "APPUYEZ SUR ENTRÉE POUR RÉESSAYER", {
            font: `${fontWeight} 14px "${fontName}"`, fill: mainColor
        }).setOrigin(0.5);
        
        this.addFloatingEffect(sub);
        this.uiGroup.add(sub);
    }

    update() {
        if (this.gameState === "WAITING_FOR_CALLBACK") return;

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

            if (this.ball && this.ball.y > this.sys.game.config.height + 20) {
                this.ball.y = -100; 
                this.lives--;
                
                if (this.lives <= 0) {
                    this.gameOver();
                } else {
                    this.resetBall();
                }
            }

            if (this.ball && this.ball.active && this.ball.visible && (this.ball.body.velocity.x !== 0 || this.ball.body.velocity.y !== 0)) {
                this.trail.push({ x: this.ball.x, y: this.ball.y });
                if (this.trail.length > 12) this.trail.shift();
                this.drawTrail();
            } else {
                this.trailG.clear();
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