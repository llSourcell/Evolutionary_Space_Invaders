
invadersApp.MainMenu = function (game) {

	this.mainMusic = null;
	this.playButton = null;
};

invadersApp.MainMenu.prototype = {

	create: function () {

		this.mainMusic = this.add.audio('mainMusic');

        var textTop = invadersApp.utils.addText(this, this.game.width / 2, 50, 'CITIUS PROUDLY PRESENTS:' , 2);
        textTop.alpha = 0;


        var titleYPos = this.game.height / 3;
		var title = this.add.sprite(this.game.width / 2, -100, 'title');
		title.anchor.setTo(0.5, 0.5);


		var logo = this.add.sprite(this.game.width / 2, this.game.height - 60, 'logo');
		logo.anchor.setTo(0.5, 0.5);
		logo.scale.setTo(0.6, 0.6);
        logo.visible = false;

        var textIES = invadersApp.utils.addText(this, this.game.width / 2, titleYPos + 50, 'A GAME FOR IES ROSALIA DE CASTRO', 1);
        textIES.img.visible = false;

        var textPressStart = invadersApp.utils.addText(this, this.game.width / 2, titleYPos + 200, 'PRESS ENTER', 2);
        textPressStart.img.visible = false;

        var textCopyright = invadersApp.utils.addText(this, this.game.width / 2, logo.y + 40, 'CENTRO SINGULAR DE INVESTIGACION EN TECNOLOXIAS DA INFORMACION', 1);
        textCopyright.img.visible = false;

        var tweenPresents = this.game.add.tween(textTop).to( { alpha: 1 }, 800, Phaser.Easing.Linear.None, false, 200);
        var tweenTitle = this.game.add.tween(title).to( { y: this.game.height / 3 }, 1200, Phaser.Easing.Bounce.Out, false);
        tweenPresents.chain(tweenTitle);

        tweenPresents.onComplete.add(function () {
            // Play mainMusic
            this.mainMusic.play('', 0, 1, true, true);
        }, this);

        tweenTitle.onComplete.add(function () {
            // Show bottom info
            logo.visible = true;
            textCopyright.img.visible = true;
            textPressStart.img.visible = true;
            textIES.img.visible = true;

            // Start blinking event for 'PRESS START'
            this.game.time.events.loop(Phaser.Timer.HALF, function () {
                textPressStart.img.visible = !textPressStart.img.visible;
            }, this);

        }, this);

        // Start animated chain
        tweenPresents.start();

        this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER).onDown.add(function () {
            this.startGame();
        }, this);
	},

	update: function () {

	},

	startGame: function (pointer) {
		this.mainMusic.stop();
		this.state.start('Game');
	}

};
