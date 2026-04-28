import * as Phaser from "phaser";

export default class RainbowBreaker extends Phaser.Scene {
    static init(settings) {
        const config = {
            type: Phaser.AUTO,
            parent: settings.parent,
            width: settings.width,
            height: settings.height,
            transparent: true,
            antialias: false,
            pixelArt: true,
            roundPixels: true,
            audio: { noAudio: true },
            render: {
                antialias: false,
                pixelArt: true,
                roundPixels: true,
                powerPreference: 'high-performance'
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
        this.comboWords = ["INTOLÉRANCE", "OBSCURANTISME", "AVEUGLEMENT", "BIGOTERIE", "BULLYING", "OFFUSCATION", "CHAUVINISME", "SOPHISME", "XÉNOPHOBIE", "RACISME", "HAINE", "IGNORANCE", "BON DIEUZARD", "PROFANE", "HOSTILITÉ", "HUBRIS", "TÊTE DE COCHON", "ESPRIT DE CLOCHER", "FIEL", "MÉPRIS", "FANATISME", "ACHARNEMENT", "CRUAUTÉ", "MALIGNITÉ", "TIDIO CONNAISSANT", "DUNNING-KRUGER", "PÉDANTE", "MADAME JE-SAIS-TOUT", "PEUR", "ARROGANCE", "CONDESCENDANCE"];
        this.gridConfig = { cols: 8, rows: 4, brickW: 0, brickH: 0, startY: 0 };
        this.rainbowColors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];
        this.FLAGS = 
        this.FLAGS = [
            { id: "flag_trans", name: "Drapeau Transgenre", data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTg0IDMxMiI+CiAgPHBhdGggZmlsbD0iIzViY2VmYSIgZD0iTTAgMGgxMTg0djMxMkgweiIvPgogIDxwYXRoIGZpbGw9IiNmNWE5YjgiIGQ9Ik0wIDYyLjRoMTE4NHYxODcuMkgweiIvPgogIDxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0wIDEyNC44aDExODR2NjIuNEgweiIvPgo8L3N2Zz4K", history: "Créé en 1999 par la femme transgenre Monica Helms, ce drapeau déploie des bandes bleu ciel et roses pour représenter les couleurs traditionnelles associées aux garçons et aux filles, entourant une bande blanche centrale qui symbolise les personnes non-binaires, intersexes ou en transition."},
            { id: "flag_bi", name: "Drapeau Bisexuel", data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTg0IDMxMiI+CiAgPHBhdGggZmlsbD0iIzAwMzhhOCIgZD0iTTAgMGgxMTg0djMxMkgweiIvPgogIDxwYXRoIGZpbGw9IiM5YjRmOTYiIGQ9Ik0wIDBoMTE4NHYxODcuMkgweiIvPgogIDxwYXRoIGZpbGw9IiNkNjAyNzAiIGQ9Ik0wIDBoMTE4NHYxMjQuOEgweiIvPgo8L3N2Zz4K", history: "Conçu par Michael Page en 1998 pour accroître la visibilité des personnes bisexuelles au sein de la communauté et de la société, ce drapeau superpose le rose pour l'attirance envers le même sexe et le bleu pour l'attirance envers le sexe opposé, créant au centre une bande violette qui symbolise la fusion et la fluidité de ces attirances."},
            { id: "flag_asexual", name: "Drapeau Asexuel", data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTg0IDMxMiI+DQogIDxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0wIDBoMTE4NHYzMTJIMHoiLz4NCiAgPHBhdGggZD0iTTAgMGgxMTg0djc4SDB6Ii8+DQogIDxwYXRoIGZpbGw9InB1cnBsZSIgZD0iTTAgMjM0aDExODR2NzhIMHoiLz4NCiAgPHBhdGggZmlsbD0iI2EzYTNhMyIgZD0iTTAgNzhoMTE4NHY3OEgweiIvPg0KPC9zdmc+DQo=", history: "Sélectionné par un vote communautaire sur le site de l'AVEN en 2010, ce drapeau décline le noir, le gris, le blanc et le mauve pour représenter l'asexualité, la zone grise entre l'attirance et l'absence de désir, les alliés ainsi que la communauté dans son ensemble."},
            { id: "flag_queer", name: "Drapeau Queer", data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTg0IDMxMiI+CiAgPHBhdGggZD0iTTAgMGgxMTg0djMxMkgweiIgY2xhc3M9InMwIi8+CiAgPHBhdGggZmlsbD0iIzk5ZDllYSIgZD0iTTAgMzQuNjdoMTE4NHYyNzcuMzNIMHoiLz4KICA8cGF0aCBmaWxsPSIjMDBhMmU4IiBkPSJNMCA2OS4zM2gxMTg0djI0Mi42N0gweiIvPgogIDxwYXRoIGZpbGw9IiNiNWU2MWQiIGQ9Ik0wIDEwNGgxMTg0djIwOEgweiIvPgogIDxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0wIDEzOC42N2gxMTg0djE3My4zM0gweiIvPgogIDxwYXRoIGZpbGw9IiNmZmM5MGUiIGQ9Ik0wIDE3My4zM2gxMTg0djEzOC42N0gweiIvPgogIDxwYXRoIGZpbGw9IiNmZDY2NjYiIGQ9Ik0wIDIwOGgxMTg0djEwNEgweiIvPgogIDxwYXRoIGZpbGw9IiNmZmFlYzkiIGQ9Ik0wIDI0Mi42N2gxMTg0djY5LjMzSDB6Ii8+CiAgPHBhdGggZD0iTTAgMjc3LjMzaDExODR2MzQuNjdIMHoiIGNsYXNzPSJzMCIvPgo8L3N2Zz4K", history: "Créé par l'artiste Pastel_Baby vers 2017, ce drapeau à neuf bandes colorées célèbre la diversité et la fluidité de la communauté queer à travers un large spectre chromatique qui s'éloigne des codes traditionnels pour inclure toutes les nuances d'identités et d'expressions."},
            { id: "flag_gay", name: "Drapeau Gay", data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTg0IDMxMiIgd2lkdGg9IjExODQiPgogIDxwYXRoIGZpbGw9IiMzZDFhNzgiIGQ9Ik0wIDBoMTE4NHYzMTJIMHoiLz4KICA8cGF0aCBmaWxsPSIjNTA0OWNjIiBkPSJNMCAwaDExODR2MjY3LjQzSDB6Ii8+CiAgPHBhdGggZmlsbD0iIzdiYWRlMiIgZD0iTTAgMGgxMTg0djIyMi44NkgweiIvPgogIDxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0wIDBoMTE4NHYxNzguMjlIMHoiLz4KICA8cGF0aCBmaWxsPSIjOThlOGMxIiBkPSJNMCAwaDExODR2MTMzLjcySDB6Ii8+CiAgPHBhdGggZmlsbD0iIzI2Y2VhYSIgZD0iTTAgMGgxMTg0djg5LjE1SDB6Ii8+CiAgPHBhdGggZmlsbD0iIzA3OGQ3MCIgZD0iTTAgMGgxMTg0djQ0LjU4SDB6Ii8+Cjwvc3ZnPgo=", history: "Inspiré par le drapeau lesbien, ce drapeau à sept bandes a été conçu vers 2019 pour offrir une représentation spécifique aux hommes gais et aux personnes non-binaires se reconnaissant dans la masculinité, utilisant un dégradé de vert et de bleu pour symboliser la nature, la joie et la diversité des expressions de genre."},            
            { id: "flag_intersex", name: "Drapeau Intersexe", data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTg0IDMxMiI+CiAgPHBhdGggZmlsbD0iI2ZmZDgwMCIgZD0iTTAgMGgxMTg0djMxMkgweiIvPgogIDxjaXJjbGUgY3g9IjU5MiIgY3k9IjE1NiIgcj0iOTUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzc5MDJhYSIgc3Ryb2tlLXdpZHRoPSIzMiIvPgo8L3N2Zz4K", history: "Créé en 2013 par Morgan Carpenter d'Intersex Human Rights Australia, ce drapeau utilise le jaune et le violet pour éviter toute connotation de genre binaire (bleu ou rose), tandis que son cercle central symbolise l'intégrité et la plénitude des personnes nées avec des variations des caractéristiques sexuelles."},
            { id: "flag_lesbian", name: "Drapeau Lesbien", data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTg0IDMxMiI+CiAgPHBhdGggZmlsbD0iI2EzMDI2MiIgZD0iTTAgMGgxMTg0djMxMkgweiIvPgogIDxwYXRoIGZpbGw9IiNkMzYyYTQiIGQ9Ik0wIDBoMTE4NHYyNDkuNkgweiIvPgogIDxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0wIDBoMTE4NHYxODcuMkgweiIvPgogIDxwYXRoIGZpbGw9IiNmZjlhNTYiIGQ9Ik0wIDBoMTE4NHYxMjQuOEgweiIvPgogIDxwYXRoIGZpbGw9IiNkNTJkMDAiIGQ9Ik0wIDBoMTE4NHY2Mi40SDB6Ii8+Cjwvc3ZnPgo=", history: "Apparu sur le web en 2018 pour remplacer les versions plus anciennes, ce drapeau à cinq bandes décline des nuances d'orange et de rose séparées par du blanc pour représenter la diversité des identités lesbiennes, allant de l'expression de genre à la sérénité et à la communauté."},
            { id: "flag_pan", name: "Drapeau Pansexuel", data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTg0IDMxMiI+CiAgPHBhdGggZmlsbD0iIzIxYjFmZiIgZD0iTTAgMGgxMTg0djMxMkgweiIvPgogIDxwYXRoIGZpbGw9IiNmZmQ4MDAiIGQ9Ik0wIDBoMTE4NHYyMDhIMHoiLz4KICA8cGF0aCBmaWxsPSIjZmYyMThjIiBkPSJNMCAwaDExODR2MTA0SDB6Ii8+Cjwvc3ZnPgo=", history: "Créé en 2010 par Jasper V. pour offrir une identité propre à la communauté, ce drapeau arbore trois bandes (rose, jaune et bleu) symbolisant l'attirance envers une personne indépendamment de son sexe ou de son identité de genre."},
            { id: "flag_demisexual", name: "Drapeau Demisexuel", data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTg0IDMxMiI+CiAgPHBhdGggZmlsbD0iI2QyZDJkMiIgZD0iTTAgMGgxMTg0djMxMkgweiIvPgogIDxwYXRoIGZpbGw9IiM2ZTAwNzAiIGQ9Ik0wIDBoMTE4NHYxODJIMHoiLz4KICA8cGF0aCBmaWxsPSIjZmZmIiBkPSJNMCAwaDExODR2MTMwSDB6Ii8+CiAgPHBhdGggZD0iTTAgMGwxOTkgMTU2TDAgMzEyeiIvPgo8L3N2Zz4K", history: "Le drapeau demisexuel a été créé de manière anonyme en 2010 sur le web, peu de temps après l'officialisation du drapeau asexuel, pour donner une visibilité spécifique à cette branche du spectre."},
            { id: "flag_pride", name: "Pride Progressif", data: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTg0IDMxMiI+CiAgPHBhdGggZmlsbD0iIzZkMjM4MCIgZD0iTTAgMGgxMTg0djMxMkgweiIvPgogIDxwYXRoIGZpbGw9IiMyYzU4YTQiIGQ9Ik0wIDBoMTE4NHYyNjBIMHoiLz4KICA8cGF0aCBmaWxsPSIjNzhiODJhIiBkPSJNMCAwaDExODR2MjA4SDB6Ii8+CiAgPHBhdGggZmlsbD0iI2VmZTUyNCIgZD0iTTAgMGgxMTg0djE1NkgweiIvPgogIDxwYXRoIGZpbGw9IiNmMjg5MTciIGQ9Ik0wIDBoMTE4NHYxMDRIMHoiLz4KICA8cGF0aCBmaWxsPSIjZTIyMDE2IiBkPSJNMCAwaDExODR2NTJIMHoiLz4KICA8cGF0aCBkPSJNMTI5IDBIMHYzMTJoMTI5bDE0NC0xNTZ6Ii8+CiAgPHBhdGggZmlsbD0iIzk0NTUxNiIgZD0iTTk4IDBIMHYzMTJoOThsMTQ1LTE1NnoiLz4KICA8cGF0aCBmaWxsPSIjN2JjY2U1IiBkPSJNNjggMEgwdjMxMmg2OGwxNDUtMTU2eiIvPgogIDxwYXRoIGZpbGw9IiNmNGFlYzgiIGQ9Ik0zOCAwSDB2MzEyaDM4bDE0NS0xNTZ6Ii8+CiAgPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgMHYzMTJoOWwxNDQtMTU2TDkgMHoiLz4KICA8cGF0aCBmaWxsPSIjZmRkODE3IiBkPSJtMCAyODkgMTIzLTEzM0wwIDIzeiIvPgogIDxjaXJjbGUgY3g9IjQ1IiBjeT0iMTU2IiByPSIzMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjYzMzhiIiBzdHJva2Utd2lkdGg9IjgiLz4KPC9zdmc+Cg==", history: "Créé en 2018 par Daniel Quasar et mis à jour en 2021 par Valentino Vecchietti, ce drapeau inclut les personnes trans, les communautés racisées, les personnes vivant avec le VIH/SIDA ainsi que les personnes intersexes."}
        ];
    }


    create() {
        const { width, height } = this.sys.game.config;
        
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

        this.scoreText = this.add.text(width * 0.05, height * 0.04, "Score: 0", textStyle).setDepth(10).setVisible(false);
        this.levelText = this.add.text(width / 2, height * 0.04, "Niveau: 1", textStyle).setOrigin(0.5, 0).setDepth(10).setVisible(false);
        this.livesText = this.add.text(width * 0.95, height * 0.04, "Vies: 3", textStyle).setOrigin(1, 0).setDepth(10).setVisible(false);

        this.historyText = this.add.text(width / 2, this.gridConfig.startY + this.gridConfig.totalHeight + 30, "", {
            font: `600 ${Math.max(12, baseSize * 0.8)}px "${fontName}"`, fill: mainColor,
            align: "center", wordWrap: { width: width * 0.8 }
        }).setOrigin(0.5, 0).setDepth(10).setVisible(false);

        this.particles = this.add.particles(0, 0, "part", {
            speed: { min: 100, max: 400 }, angle: { min: 0, max: 360 },
            scale: { start: 2, end: 0 }, lifespan: 800, gravityY: 300, emitting: false
        }).setDepth(5);

        this.showStartScreen();
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
        }).setOrigin(0.5);

        const sub = this.add.text(width / 2, title.y + (height * 0.1), "CLIQUEZ OU APPUYEZ SUR ENTRÉE", {
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

    async loadLevel(i) {
        const { width } = this.sys.game.config;
        this.gameState = "PLAYING";
        this.historyText.setVisible(false);
        this.uiGroup.clear(true, true);
        if (this.bricks) this.bricks.clear(true, true);

        const currentFlag = this.FLAGS[i % this.FLAGS.length];
        
        // CALCUL PRÉCIS DE LA ZONE DES BRIQUES
        const targetW = this.gridConfig.cols * this.gridConfig.brickW;
        const targetH = this.gridConfig.rows * this.gridConfig.brickH; 
        
        const textureKey = "flag_dyn_" + i;

        // On génère la texture avec la hauteur totale des briques
        await this.createFlagTexture(textureKey, currentFlag.data, targetW, targetH);
        
        const startX = Math.floor((width - targetW) / 2);
        this.bgFlag.setTexture(textureKey);
        
        // POSITIONNEMENT : Le haut du drapeau doit être exactement à startY
        this.bgFlag.setPosition(startX, this.gridConfig.startY);
        this.bgFlag.setOrigin(0, 0);
        this.bgFlag.setDisplaySize(targetW, targetH);
        this.bgFlag.setAlpha(1);

        for (let r = 0; r < this.gridConfig.rows; r++) {
            for (let c = 0; c < this.gridConfig.cols; c++) {
                const bx = startX + (c * this.gridConfig.brickW) + (this.gridConfig.brickW / 2);
                // On s'assure que les briques sont parfaitement alignées avec le drapeau étiré
                const by = this.gridConfig.startY + (r * this.gridConfig.brickH) + (this.gridConfig.brickH / 2);
                const b = this.bricks.create(bx, by, "brick_cover");
                b.refreshBody();
            }
        }
        this.ball.setVisible(true).setAlpha(1);
        this.paddle.setVisible(true).setAlpha(1);
        this.resetBall();
    }

    createFlagTexture(key, svgData, targetW, targetH) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = targetW;
                canvas.height = targetH;
                const ctx = canvas.getContext("2d");
                ctx.imageSmoothingEnabled = false;
                
                // EFFET ÉLASTIQUE : On force l'image SVG (peu importe son ratio) 
                // à s'étirer verticalement pour remplir tout le canvas (targetH)
                ctx.drawImage(img, 0, 0, targetW, targetH);

                if (this.textures.exists(key)) this.textures.remove(key);
                this.textures.addCanvas(key, canvas);
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
        }).setOrigin(0.5).setDepth(20);
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
        const sub = this.add.text(width / 2, height - 80, "CLIQUEZ OU APPUYEZ SUR ENTRÉE POUR CONTINUER", { font: `${fontWeight} 14px "${fontName}"`, fill: mainColor }).setOrigin(0.5);
        this.addFloatingEffect(sub);
        this.uiGroup.add(sub);
    }

    resetBall() {
        const { width, height } = this.sys.game.config;
        this.comboCount = 0; this.trail = []; this.trailG.clear();
        this.ball.setVelocity(0, 0).setPosition(width / 2, height - 150).setAlpha(1).setVisible(true);
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
        const title = this.add.text(width / 2, height * 0.65, "FIN DE LA PARTIE", { font: `${fontWeight} ${Math.round(width / 18)}px "${fontName}"`, fill: mainColor }).setOrigin(0.5);
        this.uiGroup.add(title);
        this.livesText.setText(`Vies: 0`);
        if (this.onGameOverCallback) await this.onGameOverCallback({ score: this.score, levelReached: this.level + 1 });
        this.gameState = "GAMEOVER";
        const sub = this.add.text(width / 2, title.y + 50, "CLIQUEZ OU APPUYEZ SUR ENTRÉE POUR RÉESSAYER", { font: `${fontWeight} ${Math.round(width / 40)}px "${fontName}"`, fill: mainColor }).setOrigin(0.5);
        this.addFloatingEffect(sub);
        this.uiGroup.add(sub);
    }

    update() {
        const { width, height } = this.sys.game.config;
        if (this.gameState === "WAITING_FOR_CALLBACK") return;
        const pointer = this.input.activePointer;
        const isClicked = pointer.primaryDown && pointer.downElement === this.game.canvas;
        const actionInput = Phaser.Input.Keyboard.JustDown(this.enterKey) || isClicked;
        if (actionInput) {
            if (this.gameState === "START") this.startGame();
            else if (this.gameState === "GAMEOVER") this.showStartScreen();
            else if (this.gameState === "REVEAL") { this.level++; this.loadLevel(this.level); }
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