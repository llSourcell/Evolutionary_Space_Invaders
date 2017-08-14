var invadersApp = invadersApp || {};


// Port of python random.gammavariate
function gammavariate(alpha, beta) {
    SG_MAGICCONST = 2.504077396776274;
    ainv = Math.sqrt(2.0 * alpha - 1.0);
    bbb = alpha - 1.3862943611198906;
    ccc = alpha + ainv;
    while (1) {
        u1 = Math.random();
        if (u1 <= 1e-7 || u1 >= .9999999) {
            continue;
        }
        u2 = 1.0 - Math.random();
        v = Math.log(u1 / (1.0 - u1)) / ainv;
        x = alpha * Math.exp(v);
        z = u1 * u1 * u2;
        r = bbb + ccc * v - x;
        if (r + SG_MAGICCONST - 4.5 * z >= 0.0 || r >= Math.log(z)) {
            return x * beta;
        }
    }
}

function bound_value(v, min_v, max_v) {
    return Math.min(Math.max(min_v, v), max_v)
}

// Extended sprite object for Invaders

invadersApp.Invader = function (ctx, genes, x, y) {

    this.game = ctx.game;
    x = x || this.game.world.randomX;
    y = y || this.game.world.randomY % (this.game.world.height - WALL_MARGIN * 1.5);
    Phaser.Sprite.call(this, this.game, x, y, 'invader');
    this.game.physics.enable(this, Phaser.Physics.ARCADE);

    // Initialize genes by getting the default values from settings.json
    this.genes = genes || function () {
            var settings = ctx.settings;
            var genes = {};            
            //TODO guarrada para comprobar a influencia da primeira xeración
            genes['scale'] = bound_value(gammavariate(4, 0.5) + 1, 1, 7);
            genes['alpha'] = chance.integer({min: 20, max: 255});
            genes['xvelocity'] = 120 * bound_value(gammavariate(2, 0.4), 0.01, 5);
            genes['yvelocity'] = 120 * bound_value(gammavariate(2, 0.3), 0.01, 5);
            genes['x_prob_change_dir'] = chance.floating({min: 0.01, max: 0.05});
            genes['y_prob_change_dir'] = chance.floating({min: 0.01, max: 0.05});
            return genes;
        }();

    this.anchor.setTo(0.5, 0.5);

    var alpha = Math.round(this.genes['alpha']);
    this.tint = Phaser.Color.getColor(alpha, alpha, alpha);
    this.body.velocity.x = this.genes['xvelocity'];
    this.body.velocity.y = this.genes['yvelocity'];
    this.scaleValue = this.genes['scale'];
    this.scale.setTo(this.scaleValue, this.scaleValue);
    this.body.collideWorldBounds = true;
    this.body.bounce.set(1);

    // Used to control the probability of x-y change in direction
    // this.lastTimeChanged = 0;

    // Event loop to check the probability of changing directions (each 10ms)
    // TODO: Move this timer to Game.js?
    this.changeTimer = this.game.time.events.loop(10, function () {
        if (this.alive && this.game != null) {
            if (this.game.rnd.frac() < this.genes['x_prob_change_dir']) {
                this.body.velocity.x = -this.body.velocity.x;
            }
            if (this.game.rnd.frac() < this.genes['y_prob_change_dir']) {
                this.body.velocity.y = -this.body.velocity.y;
            }
        }
    }, this);

    this.fitness = 0;

    // Create a shield
    this.shieldGraphics = this.game.make.graphics(0, 0);

    // Add the invader to the game (move this outside this class?)
    this.game.add.existing(this);
};

invadersApp.Invader.prototype = Object.create(Phaser.Sprite.prototype);
invadersApp.Invader.prototype.constructor = invadersApp.Invader;
invadersApp.Invader.prototype.drawShield = function (color) {
    this.shieldGraphics.clear();
    this.shieldGraphics.lineStyle(1, color, 1);
    this.shieldGraphics.drawCircle(-0.5, -0.5, 15 * this.scaleValue);
    this.addChildAt(this.shieldGraphics, 0);
    this.shieldGraphics.visible = true;
    this.shieldGraphics.scale.setTo(1.5 / this.scaleValue, 1.5 / this.scaleValue);
};
invadersApp.Invader.prototype.hideShield = function () {
    this.shieldGraphics.clear();
    this.shieldGraphics.visible = false;
};
invadersApp.Invader.prototype.increaseFitness = function () {
    this.fitness++;
};
