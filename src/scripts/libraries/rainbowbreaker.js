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

        // Configuration de la grille (les dimensions de briques seront ajustées dans create)
        this.gridConfig = { cols: 8, rows: 4, brickW: 0, brickH: 0, startY: 0 };
        this.rainbowColors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];

        this.FLAGS = [
            { id: "flag_trans", name: "Drapeau Transgenre", data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MjAgMTgwIj4KICA8cGF0aCBmaWxsPSIjNWJjZWZhIiBkPSJNMCAwaDcyMHYxODBIMHoiLz4KICA8cGF0aCBmaWxsPSIjZjVhOWI4IiBkPSJNMCAzNmg3MjB2MTA4SDB6Ii8+CiAgPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgNzJoNzIwdjM2SDB6Ii8+Cjwvc3ZnPgo=", history: "Dessiné par Monica Helms en 1999. Le bleu pour les garçons, le rose pour les filles et le blanc pour la transition." },
            { id: "flag_bi", name: "Drapeau Bisexuel", data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MjAgMTgwIj4KICA8cGF0aCBmaWxsPSIjMDAzOGE4IiBkPSJNMCAwaDcyMHYxODBIMHoiLz4KICA8cGF0aCBmaWxsPSIjOWI0Zjk2IiBkPSJNMCAwaDcyMHYxMDhIMHoiLz4KICA8cGF0aCBmaWxsPSIjZDYwMjcwIiBkPSJNMCAwaDcyMHY3MkgweiIvPgo8L3N2Zz4K", history: "Créé par Michael Page en 1998. Le rose pour l'attirance même sexe, le bleu pour l'autre, et le violet pour le mélange." },
            { id: "flag_asexual", name: "Drapeau Asexuel", data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MjAgMTgwIj4NCiAgPHBhdGggZD0iTTAgMGg3MjB2NDVIMHoiLz4NCiAgPHBhdGggZmlsbD0iI2EzYTNhMyIgZD0iTTAgNDVoNzIwdjQ1SDB6Ii8+DQogIDxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0wIDkwaDcyMHY0NUgweiIvPg0KICA8cGF0aCBmaWxsPSJwdXJwbGUiIGQ9Ik0wIDEzNWg3MjB2NDVIMHoiLz4NCjwvc3ZnPg==", history: "Créé par le réseau AVEN en 2010. Le noir pour l'asexualité, le gris pour la zone grise entre sexualité et asexualité, le blanc pour les partenaires et alliés, et le violet pour la communauté." },
            { id: "flag_queer", name: "Drapeau Queer", data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MjAgMTgwIj4KICA8cGF0aCBkPSJNMCAwaDcyMHYyMEgweiIvPgogIDxwYXRoIGZpbGw9IiM5OWQ5ZWEiIGQ9Ik0wIDIwaDcyMHYyMEgweiIvPgogIDxwYXRoIGZpbGw9IiMwMGEyZTgiIGQ9Ik0wIDQwaDcyMHYyMEgweiIvPgogIDxwYXRoIGZpbGw9IiNiNWU2MWQiIGQ9Ik0wIDYwaDcyMHYyMEgweiIvPgogIDxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0wIDgwaDcyMHYyMEgweiIvPgogIDxwYXRoIGZpbGw9IiNmZmM5MGUiIGQ9Ik0wIDEwMGg3MjB2MjBIMHoiLz4KICA8cGF0aCBmaWxsPSIjZmQ2NjY2IiBkPSJNMCAxMjBoNzIwdjIwSDB6Ii8+CiAgPHBhdGggZmlsbD0iI2ZmYWVjOSIgZD0iTTAgMTQwaDcyMHYyMEgweiIvPgogIDxwYXRoIGQ9Ik0wIDE2MGg3MjB2MjBIMHoiLz4KPC9zdmc+", history: "Créé par l'utilisateur Tumblr @vampirestepdad en 2014. Le jaune symbolise l'amitié, le rose l'affection, et les autres bandes la diversité des relations situées entre l'amitié et la romance." },
            { id: "flag_gay", name: "Drapeau Gay", data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MjAgMTgwIj4KICA8cGF0aCBmaWxsPSIjM2QxYTc4IiBkPSJNMCAwaDcyMHYxODBIMHoiLz4KICA8cGF0aCBmaWxsPSIjNTA0OWNjIiBkPSJNMCAwaDcyMHYxNTRIMHoiLz4KICA8cGF0aCBmaWxsPSIjN2JhZGUyIiBkPSJNMCAwaDcyMHYxMjlIMHoiLz4KICA8cGF0aCBmaWxsPSIjZmZmIiBkPSJNMCAwaDcyMHYxMDNIMHoiLz4KICA8cGF0aCBmaWxsPSIjOThlOGMxIiBkPSJNMCAwaDcyMHY3N0gweiIvPgogIDxwYXRoIGZpbGw9IiMyNmNlYWEiIGQ9Ik0wIDBoNzIwdjUxSDB6Ii8+CiAgPHBhdGggZmlsbD0iIzA3OGQ3MCIgZD0iTTAgMGg3MjB2MjZIMHoiLz4KPC9zdmc+", history: "Créé par l'utilisateur Tumblr @gayflagblog en 2019. Les verts pour la communauté, le bleu pour la joie et le blanc pour l'inclusion des hommes trans et non-binaires." },            
            { id: "flag_intersex", name: "Drapeau Intersexe", data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDAwIDYwMCI+CiAgPHBhdGggZmlsbD0iI2ZmZDgwMCIgZD0iTTAgMGgyNDAwdjYwMEgweiIvPgogIDxjaXJjbGUgY3g9IjEyMDAiIGN5PSIzMDAiIHI9IjE0NyIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNzkwMmFhIiBzdHJva2Utd2lkdGg9IjUwIi8+Cjwvc3ZnPg==", history: "Créé par Morgan Carpenter en 2013. Le fond jaune et le cercle violet évitent les couleurs associées au genre. Le cercle symbolise la complétude." },
            { id: "flag_lesbian", name: "Drapeau Lesbien", data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MjAgMTgwIj4KICA8cGF0aCBmaWxsPSIjZDQyYzAwIiBkPSJNMCAwaDcyMHYzNkgweiIvPgogIDxwYXRoIGZpbGw9IiNmZDk4NTUiIGQ9Ik0wIDM2aDcyMHYzNkgweiIvPgogIDxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0wIDcyaDcyMHYzNkgweiIvPgogIDxwYXRoIGZpbGw9IiNkMTYxYTIiIGQ9Ik0wIDEwOGg3MjB2MzZIMHoiLz4KICA8cGF0aCBmaWxsPSIjYTIwMTYxIiBkPSJNMCAxNDRoNzIwdjM2SDB6Ii8+Cjwvc3ZnPgo=", history: "Cette version à 7 bandes représente la non-conformité de genre, l'indépendance, la communauté, l'amour et la féminité." },
            { id: "flag_pan", name: "Drapeau Pansexuel", data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MjAgMTgwIj4KICA8cGF0aCBmaWxsPSIjMjFiMWZmIiBkPSJNMCAwaDcyMHYxODBIMCIvPgogIDxwYXRoIGZpbGw9IiNmZmQ4MDAiIGQ9Ik0wIDBoNzIwdjEyMEgwIi8+CiAgPHBhdGggZmlsbD0iI2ZmMjE4YyIgZD0iTTAgMGg3MjB2NjBIMCIvPgo8L3N2Zz4K", history: "Représente l'attirance pour tous les genres : féminin (rose), masculin (bleu) et non-binaire (jaune)." },
            { id: "flag_demisexual", name: "Drapeau Demisexuel", data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MjAgMTgwIj4KICA8cGF0aCBmaWxsPSIjZDJkMmQyIiBkPSJNMCAxMDVoNzIwdjc1SDB6Ii8+CiAgPHBhdGggZmlsbD0iIzZlMDA3MCIgZD0iTTAgNzVoNzIwdjMwSDB6Ii8+CiAgPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgMGg3MjB2NzVIMHoiLz4KICA8cGF0aCBkPSJtMCAwIDExNSA5MEwwIDE4MFoiLz4KPC9zdmc+", history: "Apparu vers 2010. Le blanc pour la sexualité, le violet pour la communauté, le gris pour l'asexualité et le triangle noir pour l'identité demisexuelle." },
            { id: "flag_pride", name: "Pride Progressif", data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MjAgMTgwIj4KICA8cGF0aCBmaWxsPSIjNmQyMzgwIiBkPSJNMCAwaDcyMHYxODBIMHoiLz4KICA8cGF0aCBmaWxsPSIjMmM1OGE0IiBkPSJNMCAwaDcyMHYxNTBIMHoiLz4KICA8cGF0aCBmaWxsPSIjNzhiODJhIiBkPSJNMCAwaDcyMHYxMjBIMHoiLz4KICA8cGF0aCBmaWxsPSIjZWZlNTI0IiBkPSJNMCAwaDcyMHY5MEgweiIvPgogIDxwYXRoIGZpbGw9IiNmMjg5MTcyIiBkPSJNMCAwaDcyMHY2MEgweiIvPgogIDxwYXRoIGZpbGw9IiNlMjIwMTYiIGQ9Ik0wIDBoNzIwdjMwSDB6Ii8+CiAgPHBhdGggZD0iTTc0IDBIMHYxODBofDRsODQtOTB6Ii8+CiAgPHBhdGggZmlsbD0iIzk0NTUxNiIgZD0iTTU3IDBIMHYxODBhaDU3bDgzLTkweiIvPgogIDxwYXRoIGZpbGw9IiM3YmNjZTUiIGQ9Ik00MCAwSDB2MTgwaDQwbDgzLTkweiIvPgogIDxwYXRoIGZpbGw9IiNmNGFlYzgiIGQ9Ik0yMiAwSDB2MTgwaDIybDg0LTkweiIvPgogIDxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0wIDB2MTgwaDVsODMtOTBMNSAwexIvPgogIDxwYXRoIGZpbGw9IiNmZGQ4MTciIGQ9Im0wIDE2NyA3MS03N0wwIDEzeiIvPgogIDxjaXJjbGUgY3g9IjI2LjIiIGN5PSI5MCIIHI9IjE4LjkiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY2MzM4YiIgc3Ryb2tlLXdpZHRoPSI0LjUiLz4KPC9zdmc+", history: "Créé en 2018 par Daniel Quasar et mis à jour en 2021 par Valentino Vecchietti, ce drapeau inclut les personnes trans, les communautés racisées, les personnes vivant avec le VIH/SIDA ainsi que les personnes intersexes." }
        ];
    }

    preload() {
        this.FLAGS.forEach(f => {
            this.load.svg(f.id, f.data, { scale: 2 });
        });
    }

    create() {
        const { width, height } = this.sys.game.config;
        
        // Calcul des dimensions de la grille basées sur la taille de l'écran
        this.gridConfig.brickW = Math.floor((width * 0.9) / this.gridConfig.cols);
        this.gridConfig.brickH = Math.floor(height * 0.08);
        this.gridConfig.startY = height * 0.15;
        this.gridConfig.totalWidth = this.gridConfig.cols * this.gridConfig.brickW;
        this.gridConfig.totalHeight = this.gridConfig.rows * this.gridConfig.brickH;

        this.onGameOverCallback = this.registry.get('onGameOver');
        const fontName = this.registry.get('gameFont');
        const fontWeight = this.registry.get('gameWeight');
        const mainColor = this.registry.get('gameColor');

        const g = this.make.graphics({ x: 0, y: 0, add: false });
        // Paddle dynamique
        const paddleWidth = Math.max(100, width * 0.15);
        g.fillStyle(0xffffff).fillRect(0, 0, paddleWidth, 20).generateTexture("paddle", paddleWidth, 20);
        g.clear();
        
        // Ball
        for (let r = 9; r > 0; r--) {
            const color = this.rainbowColors[r % this.rainbowColors.length];
            g.fillStyle(color).fillCircle(9, 9, r);
        }
        g.generateTexture("ball", 18, 18);
        g.clear();
        
        // Brick
        const bw = this.gridConfig.brickW;
        const bh = this.gridConfig.brickH;
        g.fillStyle(0xbdc3c7, 0.85); 
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

        this.physics.world.setBounds(0, 60, width, height - 60);
        this.physics.world.checkCollision.down = false;

        this.bgFlag = this.add.image(width / 2, this.gridConfig.startY, "").setOrigin(0.5, 0).setDepth(0).setAlpha(0);
        this.trailG = this.add.graphics().setDepth(1);
        this.uiGroup = this.add.group();
        this.cursors = this.input.keyboard.createCursorKeys();
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

        const baseSize = Math.max(14, Math.round(width / 40));
        const textStyle = { 
            font: `${fontWeight} ${baseSize}px "${fontName}"`, 
            fill: mainColor
        };

        this.scoreText = this.add.text(width * 0.05, height * 0.04, "Score: 0", textStyle).setDepth(10).setVisible(false);
        this.levelText = this.add.text(width / 2, height * 0.04, "Niveau: 1", textStyle).setOrigin(0.5, 0).setDepth(10).setVisible(false);
        this.livesText = this.add.text(width * 0.95, height * 0.04, "Vies: 3", textStyle).setOrigin(1, 0).setDepth(10).setVisible(false);

        this.historyText = this.add.text(width / 2, this.gridConfig.startY + this.gridConfig.totalHeight + 30, "", {
            font: `600 ${Math.max(12, baseSize * 0.8)}px "${fontName}"`, fill: mainColor,
            align: "center", wordWrap: { width: width * 0.8 }
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
        }).setOrigin(0.5);

        const sub = this.add.text(width / 2, title.y + (height * 0.1), "APPUYEZ SUR ENTRÉE POUR COMMENCER", {
            font: `${fontWeight} ${Math.round(width / 45)}px "${fontName}"`, fill: mainColor
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

    loadLevel(i) {
        const { width } = this.sys.game.config;
        this.gameState = "PLAYING";
        this.historyText.setVisible(false);
        this.uiGroup.clear(true, true);
        if (this.bricks) this.bricks.clear(true, true);

        const currentFlag = this.FLAGS[i % this.FLAGS.length];
        this.bgFlag.setTexture(currentFlag.id);
        this.bgFlag.setDisplaySize(this.gridConfig.totalWidth, this.gridConfig.totalHeight);
        this.bgFlag.setAlpha(1);

        const startX = (width - this.gridConfig.totalWidth) / 2;
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
        const { width, height } = this.sys.game.config;
        this.gameState = "REVEAL";
        this.ball.setVelocity(0, 0).setVisible(false);
        this.paddle.setVisible(false);
        const fontName = this.registry.get('gameFont');
        const fontWeight = this.registry.get('gameWeight');
        const mainColor = this.registry.get('gameColor');
        const currentFlag = this.FLAGS[this.level % this.FLAGS.length];
        
        this.historyText.setText(`${currentFlag.name.toUpperCase()}\n\n${currentFlag.history}`).setVisible(true);

        const sub = this.add.text(width / 2, height - 80, "APPUYEZ SUR ENTRÉE POUR CONTINUER", {
            font: `${fontWeight} 14px "${fontName}"`, fill: mainColor
        }).setOrigin(0.5);
        
        this.addFloatingEffect(sub);
        this.uiGroup.add(sub);
    }

    resetBall() {
        const { width, height } = this.sys.game.config;
        this.comboCount = 0;
        this.trail = [];
        this.trailG.clear();

        this.ball.setVelocity(0, 0);
        this.ball.setPosition(width / 2, height - 150);
        this.ball.setAlpha(1);
        this.ball.setVisible(true);

        this.time.delayedCall(1000, () => {
            if (this.gameState !== "PLAYING" || !this.ball.active) return;
            
            const speed = Math.min(this.baseSpeed + (this.level * 20), this.MAX_SPEED);
            this.ball.setVelocity(Phaser.Math.Between(-80, 80), -speed);
        });
    }

    async gameOver() {
        const { width, height } = this.sys.game.config;
        this.gameState = "WAITING_FOR_CALLBACK";
        if (this.ball) this.ball.setVelocity(0, 0);
        this.historyText.setVisible(false);
        
        const fontName = this.registry.get('gameFont');
        const fontWeight = this.registry.get('gameWeight');
        const mainColor = this.registry.get('gameColor');

        // On descend le titre à 65% de la hauteur au lieu de 50%
        const titleY = height * 0.65;

        const title = this.add.text(width / 2, titleY, "FIN DE LA PARTIE", {
            font: `${fontWeight} ${Math.round(width / 18)}px "${fontName}"`, 
            fill: mainColor
        }).setOrigin(0.5);
        
        this.uiGroup.add(title);
        this.livesText.setText(`Vies: 0`);

        if (this.onGameOverCallback) {
            await this.onGameOverCallback({ score: this.score, levelReached: this.level + 1 });
        }

        this.gameState = "GAMEOVER";
        
        // Le sous-titre suit avec un espacement fixe
        const sub = this.add.text(width / 2, title.y + 50, "APPUYEZ SUR ENTRÉE POUR RÉESSAYER", {
            font: `${fontWeight} ${Math.round(width / 40)}px "${fontName}"`, 
            fill: mainColor
        }).setOrigin(0.5);
        
        this.addFloatingEffect(sub);
        this.uiGroup.add(sub);
    }

    update() {
        const { width, height } = this.sys.game.config;
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

            if (this.ball && this.ball.y > height + 20) {
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