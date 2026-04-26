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
        this.comboWords = ["INTOLÉRANCE", "OBSCURANTISME", "AVEUGLEMENT", "BIGOTERIE", "BULLYING", "OFFUSCATION", "CHAUVINISME", "SOPHISME", "XÉNOPHOBIE", "RACISME", "HAINE", "IGNORANCE", "BON DIEUZARD", "PROFANE", "HOSTILITÉ", "HUBRIS", "TÊTE DE COCHON", "ESPRIT DE CLOCHER", "FIEL", "MÉPRIS", "FANATISME", "ACHARNEMENT", "CRUAUTÉ", "MALIGNITÉ", "TIDIO CONNAISSANT", "DUNNING-KRUGER", "PÉDANTE", "MADAME JE-SAIS-TOUT", "PEUR", "ARROGANCE", "CONDESCENDANCE"];

        this.gridConfig = {
            cols: 8, rows: 4, brickW: 90, brickH: 45, startY: 100
        };

        this.gridConfig.totalWidth = this.gridConfig.cols * this.gridConfig.brickW;
        this.gridConfig.totalHeight = this.gridConfig.rows * this.gridConfig.brickH;
        this.rainbowColors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];
        this.SYSTEM_FONT = 'system-ui, -apple-system, sans-serif';

        this.FLAGS = [
            {
                id: "flag_trans",
                name: "Drapeau Transgenre",
                data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MjAgMTgwIj4KICA8cGF0aCBmaWxsPSIjNWJjZWZhIiBkPSJNMCAwaDcyMHYxODBIMHoiLz4KICA8cGF0aCBmaWxsPSIjZjVhOWI4IiBkPSJNMCAzNmg3MjB2MTA4SDB6Ii8+CiAgPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNzJoNzIwdjM2SDB6Ii8+Cjwvc3ZnPgo=",
                history: "Dessiné par Monica Helms en 1999. Le bleu pour les garçons, le rose pour les filles et le blanc pour la transition."
            },
            {
                id: "flag_bi",
                name: "Drapeau Bisexuel",
                data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MjAgMTgwIj4KICA8cGF0aCBmaWxsPSIjMDAzOGE4IiBkPSJNMCAwaDcyMHYxODBIMHoiLz4KICA8cGF0aCBmaWxsPSIjOWI0Zjk2IiBkPSJNMCAwaDcyMHYxMDhIMHoiLz4KICA8cGF0aCBmaWxsPSIjZDYwMjcwIiBkPSJNMCAwaDcyMHY3MkgweiIvPgo8L3N2Zz4K",
                history: "Créé par Michael Page en 1998. Le rose pour l'attirance même sexe, le bleu pour l'autre, et le violet pour le mélange."
            },
            {
                id: "flag_intersex",
                name: "Drapeau Intersexe",
                data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDAwIDYwMCI+CiAgPHBhdGggZmlsbD0iI2ZmZDgwMCIgZD0iTTAgMGgyNDAwdjYwMEgweiIvPgogIDxjaXJjbGUgY3g9IjEyMDAiIGN5PSIzMDAiIHI9IjE0NyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNzkwMmFhIiBzdHJva2Utd2lkdGg9IjUwIi8+Cjwvc3ZnPg==",
                history: "Créé par Morgan Carpenter en 2013. Le fond jaune et le cercle violet évitent les couleurs associées au genre. Le cercle symbolise la complétude."
            },
            {
                id: "flag_lesbian",
                name: "Drapeau Lesbien",
                data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MjAgMTgwIj4KICA8cGF0aCBmaWxsPSIjZDQyYzAwIiBkPSJNMCAwaDcyMHYzNkgweiIvPgogIDxwYXRoIGZpbGw9IiNmZDk4NTUiIGQ9Ik0wIDM2aDcyMHYzNkgweiIvPgogIDxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0wIDcyaDcyMHYzNkgweiIvPgogIDxwYXRoIGZpbGw9IiNkMTYxYTIiIGQ9Ik0wIDEwOGg3MjB2MzZIMHoiLz4KICA8cGF0aCBmaWxsPSIjYTIwMTYxIiBkPSJNMCAxNDRoNzIwdjM2SDB6Ii8+Cjwvc3ZnPgo=",
                history: "Cette version à 7 bandes représente la non-conformité de genre, l'indépendance, la communauté, l'amour et la féminité."
            },
            {
                id: "flag_pan",
                name: "Drapeau Pansexuel",
                data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MjAgMTgwIj4KICA8cGF0aCBmaWxsPSIjMjFiMWZmIiBkPSJNMCAwaDcyMHYxODBIMCIvPgogIDxwYXRoIGZpbGw9IiNmZmQ4MDAiIGQ9Ik0wIDBoNzIwdjEyMEgwIi8+CiAgPHBhdGggZmlsbD0iI2ZmMjE4YyIgZD0iTTAgMGg3MjB2NjBIMCIvPgo8L3N2Zz4K",
                history: "Représente l'attirance pour tous les genres : féminin (rose), masculin (bleu) et non-binaire (jaune)."
            },
            {
                id: "flag_pride",
                name: "Pride Progressif",
                data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MjAgMTgwIj4KICA8cGF0aCBmaWxsPSIjNmQyMzgwIiBkPSJNMCAwaDcyMHYxODBIMHoiLz4KICA8cGF0aCBmaWxsPSIjMmM1OGE0IiBkPSJNMCAwaDcyMHYxNTBIMHoiLz4KICA8cGF0aCBmaWxsPSIjNzhiODJhIiBkPSJNMCAwaDcyMHYxMjBIMHoiLz4KICA8cGF0aCBmaWxsPSIjZWZlNTI0IiBkPSJNMCAwaDcyMHY5MEgweiIvPgogIDxwYXRoIGZpbGw9IiNmMjg5MTciIGQ9Ik0wIDBoNzIwdjYwSDB6Ii8+CiAgPHBhdGggZmlsbD0iI2UyMjAxNiIgZD0iTTAgMGg3MjB2MzBIMHoiLz4KICA8cGF0aCBkPSJNNzQgMEgwdjE4MGg3NGw4NC05MHoiLz4KICA8cGF0aCBmaWxsPSIjOTQ1NTE2IiBkPSJNNTcgMEgwdjE4MGg1N2w4My05MHoiLz4KICA8cGF0aCBmaWxsPSIjN2JjY2U1IiBkPSJNNDAgMEgwdjE4MGg0MGw4My05MHoiLz4KICA8cGF0aCBmaWxsPSIjZjRhZWM4IiBkPSJNMjIgMEgwdjE4MGgyMmw4NC05MHoiLz4KICA8cGF0aCBmaWxsPSIjZmZmIiBkPSJNMCAwdjE4MGg1bDgzLTkwTDUgMHoiLz4KICA8cGF0aCBmaWxsPSIjZmRkODE3IiBkPSJtMCAxNjcgNzEtNzdMMCAxM3oiLz4KICA8Y2lyY2xlIGN4PSIyNi4yIiBjeT0iOTAiIHI9IjE4LjkiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY2MzM4YiIgc3Ryb2tlLXdpZHRoPSI0LjUiLz4KPC9zdmc+",
                history: "Créé en 2018 par Daniel Quasar et mis à jour en 2021 par Valentino Vecchietti, ce drapeau inclut les personnes trans, les communautés racisées, les personnes vivant avec le VIH/SIDA ainsi que les personnes intersexes."
            }
        ];
    }

    preload() {
        this.FLAGS.forEach(f => {
            this.load.svg(f.id, f.data, { scale: 2 });
        });
    }

    create() {
        this.onGameOverCallback = this.registry.get('onGameOver');
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // PADDLE
        g.fillStyle(0xffffff).fillRect(0, 0, 120, 20).generateTexture("paddle", 120, 20);
        g.clear();

        // BALLE
        for (let r = 9; r > 0; r--) {
            const color = this.rainbowColors[r % this.rainbowColors.length];
            g.fillStyle(color).fillCircle(9, 9, r);
        }
        g.generateTexture("ball", 18, 18);
        g.clear();

        // --- BRICK COVERS (Miroir Opaque) ---
        const bw = this.gridConfig.brickW;
        const bh = this.gridConfig.brickH;
        g.fillStyle(0xbdc3c7, 1); 
        g.fillRect(0, 0, bw, bh);
        g.fillStyle(0xffffff, 0.3);
        g.fillRect(0, 0, bw, bh / 2);
        g.fillStyle(0xffffff, 0.5);
        g.fillTriangle(0, 0, bw * 0.7, 0, 0, bh * 0.7);
        g.lineStyle(2, 0xffffff, 0.6);
        g.strokeLineShape(new Phaser.Geom.Line(0, 0, bw, 0));
        g.strokeLineShape(new Phaser.Geom.Line(0, 0, 0, bh));
        g.lineStyle(2, 0x7f8c8d, 0.6);
        g.strokeLineShape(new Phaser.Geom.Line(0, bh, bw, bh));
        g.strokeLineShape(new Phaser.Geom.Line(bw, 0, bw, bh));
        g.generateTexture("brick_cover", bw, bh);
        g.clear();
        
        // TEXTURE PARTICULE
        g.fillStyle(0xffffff).fillRect(0, 0, 5, 5).generateTexture("part", 5, 5);
        g.destroy();

        this.physics.world.setBounds(0, 60, this.sys.game.config.width, this.sys.game.config.height - 60);
        this.physics.world.checkCollision.down = false;

        this.bgFlag = this.add.image(this.sys.game.config.width / 2, this.gridConfig.startY, "").setOrigin(0.5, 0).setDepth(0).setAlpha(0);
        this.trailG = this.add.graphics().setDepth(1);
        this.uiGroup = this.add.group();

        this.cursors = this.input.keyboard.createCursorKeys();
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        const textStyle = { fontFamily: this.SYSTEM_FONT, fontSize: "20px", color: "#000", fontWeight: "900" };
        this.scoreText = this.add.text(40, 25, "Score: 0", textStyle).setDepth(10).setVisible(false);
        this.levelText = this.add.text(this.sys.game.config.width / 2, 25, "Niveau: 1", textStyle).setOrigin(0.5, 0).setDepth(10).setVisible(false);
        this.livesText = this.add.text(this.sys.game.config.width - 100, 25, "Vies: 3", textStyle).setDepth(10).setVisible(false);

        this.historyText = this.add.text(this.sys.game.config.width / 2, this.gridConfig.startY + this.gridConfig.totalHeight + 30, "", {
            fontFamily: this.SYSTEM_FONT, fontSize: "18px", color: "#000",
            align: "center", fontWeight: "600", wordWrap: { width: 600 }
        }).setOrigin(0.5, 0).setDepth(10).setVisible(false);

        // --- CONFIGURATION DES PARTICULES (Explosion) ---
        this.particles = this.add.particles(0, 0, "part", {
            speed: { min: 100, max: 400 },
            angle: { min: 0, max: 360 },
            scale: { start: 2, end: 0 },
            lifespan: 800,
            gravityY: 300, // Les particules retombent
            emitting: false
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

        const title = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2 - 40, "🌈 BRICK BREAQUEER", {
            fontFamily: this.SYSTEM_FONT, fontSize: "42px", color: "#000", fontWeight: "900"
        }).setOrigin(0.5);
        const sub = this.add.text(this.sys.game.config.width / 2, title.y + 60, "APPUYEZ SUR ENTRÉE POUR COMMENCER", {
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
        this.score = 0; this.level = 0; this.lives = 5;
        this.bricks = this.physics.add.staticGroup();
        this.createGameObjects();
        this.loadLevel(this.level);
    }

    createGameObjects() {
        this.paddle = this.physics.add.image(this.sys.game.config.width / 2, this.sys.game.config.height - 40, "paddle").setImmovable(true).setTint(0x000000);
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
        if (this.bgFlag.texture) {
            this.bgFlag.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        }

        this.bgFlag.setDisplaySize(this.gridConfig.totalWidth, this.gridConfig.totalHeight);
        this.bgFlag.setAlpha(1);

        const startX = (this.sys.game.config.width - this.gridConfig.totalWidth) / 2;
        for (let r = 0; r < this.gridConfig.rows; r++) {
            for (let c = 0; c < this.gridConfig.cols; c++) {
                const bx = startX + (c * this.gridConfig.brickW) + (this.gridConfig.brickW / 2);
                const by = this.gridConfig.startY + (r * this.gridConfig.brickH) + (this.gridConfig.brickH / 2);
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

        // --- EFFET D'EXPLOSION MULTICOLORE ---
        // On tire 20 particules : certaines blanches (verre) et d'autres de toutes les couleurs
        for (let i = 0; i < 20; i++) {
            const isWhite = Math.random() > 0.5;
            const color = isWhite ? 0xffffff : Phaser.Utils.Array.GetRandom(this.rainbowColors);
            this.particles.setParticleTint(color);
            this.particles.emitParticleAt(brick.x, brick.y, 1);
        }

        brick.destroy();
        this.score += 25;
        if (this.bricks.countActive() === 0) this.revealFlag();
    }

    spawnComboWord(x, y) {
        this.score += 100;
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
        const currentFlag = this.FLAGS[this.level % this.FLAGS.length];
        this.historyText.setText(`${currentFlag.name.toUpperCase()}\n\n${currentFlag.history}`).setVisible(true);

        const sub = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height - 60, "APPUYEZ SUR ENTRÉE POUR CONTINUER", {
            fontFamily: this.SYSTEM_FONT, fontSize: "18px", color: "#000", fontWeight: "900"
        }).setOrigin(0.5);
        this.uiGroup.add(sub);
    }

    resetBall() {
        const speed = Math.min(this.baseSpeed + (this.level * 20), this.MAX_SPEED);
        this.ball.setPosition(this.sys.game.config.width / 2, this.sys.game.config.height - 150);
        this.ball.setVelocity(Phaser.Math.Between(-80, 80), -speed);
    }

    async gameOver() {
        this.gameState = "WAITING_FOR_CALLBACK";
        if (this.ball) this.ball.setVelocity(0, 0);
        this.historyText.setVisible(false);

        const title = this.add.text(this.sys.game.config.width / 2, 400, "FIN DE LA PARTIE", {
            fontFamily: this.SYSTEM_FONT, fontSize: "42px", color: "#000", fontWeight: "900"
        }).setOrigin(0.5);
        this.uiGroup.add(title);
        this.livesText.setText(`Vies: 0`);

        if (this.onGameOverCallback) {
            await this.onGameOverCallback({ score: this.score, levelReached: this.level + 1 });
        }

        this.gameState = "GAMEOVER";
        const sub = this.add.text(this.sys.game.config.width / 2, 470, "APPUYEZ SUR ENTRÉE POUR RÉESSAYER", {
            fontFamily: this.SYSTEM_FONT, fontSize: "18px", color: "#000", fontWeight: "900"
        }).setOrigin(0.5);
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
                this.lives--;
                if (this.lives <= 0) this.gameOver();
                else this.resetBall();
            }

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