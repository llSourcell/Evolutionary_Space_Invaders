var invadersApp = invadersApp || {};

invadersApp.Player = function (ctx) {

    this.shootDelay = 30;
    this.ctx = ctx;
    this.game = ctx.game;

    Phaser.Sprite.call(this, this.game, this.game.width / 2, this.game.height - 30, 'nao');
    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.setTo(0.5, 0.5);
    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.collideWorldBounds = true;


    // Create a pool of bullets
    this.bullets = this.game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    // Max = 8 bullets
    this.bullets.createMultiple(8, 'bullet');
    this.bullets.setAll('anchor.x', 0.5);
    this.bullets.setAll('anchor.y', 1);
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('checkWorldBounds', true);

    this.readyToFire = true;
    this.lastShootAt = 0;
};


invadersApp.Player.prototype = Object.create(Phaser.Sprite.prototype);
invadersApp.Player.prototype.constructor = invadersApp.Player;

invadersApp.Player.prototype.update = function () {

    if (this.game.physics.arcade.isPaused) return;

    this.body.velocity.setTo(0, 0);
    
    if (this.ctx.cursors.left.isDown) {
        if (this.scale.x > 0){
            this.scale.x *= -1;
        }
        this.body.velocity.x = -500;
    }
    else if (this.ctx.cursors.right.isDown) {
        if (this.scale.x < 0){
            this.scale.x *= -1;
        }
        this.body.velocity.x = 500;
    }

    
    if (this.ctx.fireButton.isDown && this.readyToFire) {
        this.readyToFire = false;

        if (this.ctx.gameState == invadersApp.GameState.RUNNING &&
            this.game.time.now > this.lastShootAt + this.shootDelay) {

            // Check the number of bullets alive
            var aliveBullets = this.bullets.countLiving();

            // Get the number of alive invaders
            var aliveInvaders = this.ctx.living;

            if (aliveInvaders > MIN_INVADERS && aliveBullets <= aliveInvaders/10) {
                this.lastShootAt = this.game.time.now;
                var bullet = this.bullets.getFirstExists(false);

                if (bullet) {
                    //  And fire it
                    var xpos;
                    if (this.scale.x < 0) {
                        xpos = this.x - 21;
                    } else {
                        xpos = this.x + 21;
                    }
                    bullet.reset(xpos, this.y - 20);
                    //bullet.body.velocity.y = -(1000 + aliveInvaders * 15);
                    bullet.body.velocity.y = -2000;
                    this.ctx.fx.play('shot');
                }
            }
        }
    }

    if (this.ctx.fireButton.isUp){
        this.readyToFire = true;
    }
};

