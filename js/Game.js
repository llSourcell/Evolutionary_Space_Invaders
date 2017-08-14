// Game global config vars [MOVE TO SETTINGS]

var WALL_MARGIN = 80;
var DIR_CHANGE_MIN_TIME = 0;
var SHOOT_DELAY = 100;
var MIN_INVADERS = 4;
var INITIAL_INVADERS = 6;
var MIN_GENERATION_TIME = Phaser.Timer.SECOND * 2;
var BLUE = 0x15AFF0;
var ORANGE = 0xEF7D10;

invadersApp.GameState = {
    PAUSED : 0,
    RUNNING : 1,
    GAME_OVER : 2
};

invadersApp.Game = function (game) {
    
    // Auto-injected properties

    this.game;      //  a reference to the currently running game (Phaser.Game)
    this.add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
    this.camera;    //  a reference to the game camera (Phaser.Camera)
    this.cache;     //  the game cache (Phaser.Cache)
    this.input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
    this.load;      //  for preloading assets (Phaser.Loader)
    this.math;      //  lots of useful common math operations (Phaser.Math)
    this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
    this.stage;     //  the game stage (Phaser.Stage)
    this.time;      //  the clock (Phaser.Time)
    this.tweens;    //  the tween manager (Phaser.TweenManager)
    this.state;     //  the state manager (Phaser.StateManager)
    this.world;     //  the game world (Phaser.World)
    this.particles; //  the particle manager (Phaser.Particles)
    this.physics;   //  the physics manager (Phaser.Physics)
    this.rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)

    // Stores the reference to game elements
    this.objects = {};
    this.settings;

    this.player;
    this.bullets;
    this.cursors;
    this.fireButton;


    this.gameState = invadersApp.GameState.PAUSED;
    this.animationDelay = Phaser.Timer.SECOND;
};

invadersApp.Game.prototype = {

    create: function () {

        var that = this;

        this.currentGenerationTime = Phaser.Timer.SECOND * 5;
        this.currentGeneration = 0;

        // Load game config
        this.settings = this.game.cache.getJSON('settings');

        // Initialize basic physics
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        
        // Load mainMusic assets
        this.gameOverMusic = this.add.audio('gameOverMusic');

        // FX sounds (from ...)
        this.fx = this.game.add.audio('sfx');
        this.fx.allowMultiple = true;

        this.fx.addMarker('alien_death', 1, 1.0);
        this.fx.addMarker('hit', 3, 0.5);
        this.fx.addMarker('escape', 4, 3.2);
        this.fx.addMarker('meow', 8, 0.5);
        this.fx.addMarker('numkey', 9, 0.1);
        this.fx.addMarker('ping', 10, 1.0);
        this.fx.addMarker('death', 12, 4.2);
        this.fx.addMarker('shot', 17, 1.0);
        this.fx.addMarker('squit', 19, 0.3);

        // Group of invaders
        this.objects.invaders = this.add.group();
        this.objects.invaders.enableBody = true;
        this.objects.invaders.physicsBodyType = Phaser.Physics.ARCADE;

        for (var i = 0; i < INITIAL_INVADERS; i++) {
            this.objects.invaders.add(new invadersApp.Invader(this, null, this.game.world.width/2, this.game.world.height/2));
        }

        // Add HUDs (before the invaders group to appear over them)
        this.scoreText = invadersApp.utils.addText(this, 60, 20, 'SCORE:', 2);
        this.scoreHud = invadersApp.utils.addText(this, this.scoreText.img.x + this.scoreText.img.width / 2 + 30, 20, invadersApp.utils.pad(0, 3), 2);
        this.invadersText = invadersApp.utils.addText(this, this.scoreHud.img.x + this.scoreHud.img.width + 80, 20, 'INVADERS:', 2);
        this.invadersHud = invadersApp.utils.addText(this, this.invadersText.img.x + this.invadersText.img.width / 2 + 30, 20, invadersApp.utils.pad(0, 3), 2);

        // Create and add the main player
        this.player = new invadersApp.Player(this);
        this.game.add.existing(this.player);

        // Create a white, immovable wall with physics enabled
        this.createWall();

        // A PIXI graphics for drawing lines
        this.bgraphics = this.game.add.graphics(0, 0);

        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.fireButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        // Start the game paused with the message READY!
        var readyText = invadersApp.utils.addText(this, this.game.width / 2, this.game.height / 2, 'READY!', 5);
        this.game.input.keyboard.onDownCallback = function () {
            if (readyText.img.visible){
                that.game.paused = false;
                readyText.img.kill();
                that.lastGenerationTime = that.game.time.now;
                that.gameState = invadersApp.GameState.RUNNING;
            }
        };

        this.updateCounter();
        this.game.paused = true;
    },

    update: function () {

        var that = this;

        // If physics are paused, skip all
        if (this.game.physics.arcade.isPaused) return;

        // Detect collisions with the wall and with the bullets
        this.game.physics.arcade.collide(this.wall, this.objects.invaders);
        this.game.physics.arcade.overlap(this.player.bullets, this.objects.invaders, function (bullet, invader) {
            if (bullet.alive) {
                bullet.kill();
                var living = that.objects.invaders.countLiving();
                if (living > MIN_INVADERS) {
                    invader.destroy();
                    that.fx.play('alien_death');
                    that.updateCounter();
                }
                if (living == MIN_INVADERS + 1) {
                    that.objects.invaders.forEachAlive(function (invader) {
                        invader.drawShield(BLUE);
                    }, that);
                }
            }
        }, null, this);

        // Evolutionary cycle
        this.updateEvolution();
    },

    quitGame: function (pointer) {

        //  TODO: Stop mainMusic, delete sprites, purge caches, free resources...

        //  Then let's go back to the main menu.
        this.state.start('MainMenu');

    },

    pauseGame: function () {
        this.game.physics.arcade.isPaused = true;
        this.gameState = invadersApp.GameState.PAUSED;
    },

    resumeGame: function () {
        this.game.physics.arcade.isPaused = false;
        this.gameState = invadersApp.GameState.RUNNING;
    },
    
    gameOver: function () {
        invadersApp.utils.addText(this, this.game.width / 2, this.game.height / 2, 'GAME OVER!', 5);
        this.gameState = invadersApp.GameState.GAME_OVER;
        //invadersApp.MainMenu.mainMusic.stop();
        this.gameOverMusic.play('', 0, 1, true, true);
    },
    
    updateEvolution: function () {
        var that = this;

        if (this.gameState == invadersApp.GameState.RUNNING &&
            (this.game.time.now > this.lastGenerationTime + this.currentGenerationTime)) {

            // Pause the game during the animation
            this.pauseGame();

            var evolutionText;

            if (this.animationDelay > 500) {
                evolutionText = invadersApp.utils.addText(this, this.game.width / 2, this.game.height / 2, 'EVOLUTION TIME', 5);
            }

            // The number of invaders
            var alive = this.objects.invaders.countLiving();

            var aliveInvaders = this.objects.invaders.filter(function(child, index, children) {
                return child.alive;
            }, true);

            aliveInvaders.callAll('increaseFitness');

            // The number of new individuals is determined by a box-cox
            // transformation with lambda=0.6.
            var numPairs = Math.floor((Math.pow(alive, 0.6) - 1) / 0.6);
            var pool = invadersApp.evolution.pool(aliveInvaders.list, numPairs);
            var offspring = invadersApp.evolution.evolve(pool, this.settings.genes);


            // A timer for playing animations during the reproduction phase
            this.animationTimer = this.game.time.create(true);
            var childIndex = 0;

            this.animationTimer.repeat(this.animationDelay, offspring.length + 1, function () {
                if (childIndex == offspring.length) return;

                if (evolutionText != undefined){
                    evolutionText.img.destroy();
                    evolutionText = null;
                }

                // Disable shields for all the invaders
                aliveInvaders.callAll('hideShield');

                var p = offspring[childIndex++];
                var x = (p[0].x + p[1].x)/2;
                var y = (p[0].y + p[1].y)/2;
                that.objects.invaders.add(new invadersApp.Invader(that, p[2], x, y));

                // Draw lines
                this.bgraphics.clear();
                this.bgraphics.lineStyle(1, ORANGE);
                this.bgraphics.moveTo(p[0].x, p[0].y);
                this.bgraphics.lineTo(p[1].x, p[1].y);

                // Draw shields
                p[0].drawShield(ORANGE);
                p[1].drawShield(ORANGE);

                // Count the new children added to the game
                this.updateCounter();
            }, this);

            this.animationTimer.onComplete.add(function () {
                // Hide any visible shield
                aliveInvaders.callAll('hideShield');

                this.currentGeneration++;

                // Decrease next generation time
                if (this.currentGenerationTime > MIN_GENERATION_TIME) {
                    this.currentGenerationTime -= 150;
                }

                // Decrease the animation time
                if (this.animationDelay > 50){
                    this.animationDelay -= 150;
                }

                if (evolutionText != undefined){
                    evolutionText.img.destroy();
                    evolutionText = null;
                }

                this.updateScore();

                // Clear all lines
                this.bgraphics.clear();

                this.resumeGame();

                if (this.objects.invaders.countLiving() >= 100){
                    this.gameOver();
                }

                // Update the last generation time after completion
                this.lastGenerationTime = this.game.time.now;

            }, this);

            this.animationTimer.start();
        }

    },

    createWall: function () {
        // create a new bitmap data object
        var wallBmp = this.game.add.bitmapData(this.game.width, 3);

        // draw the wall
        wallBmp.ctx.beginPath();
        wallBmp.ctx.rect(0,0,this.game.width,3);
        wallBmp.ctx.fillStyle = '#ffffff';
        wallBmp.ctx.fill();

        // use the bitmap data as the texture for the sprite
        this.wall = this.add.sprite(0, this.game.height - WALL_MARGIN, wallBmp);
        this.game.physics.enable(this.wall, Phaser.Physics.ARCADE);
        this.wall.body.immovable = true;
    },

    updateScore: function () {
        this.scoreHud.font.text = invadersApp.utils.pad(this.currentGeneration, 3);
    },

    updateCounter: function () {
        this.living = this.objects.invaders.countLiving();
        this.invadersHud.font.text = invadersApp.utils.pad(this.living, 3);
    }

};
