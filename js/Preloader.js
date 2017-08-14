
invadersApp.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;
	this.ready = false;

};

invadersApp.Preloader.prototype = {

	preload: function () {

		

		var loadingText = invadersApp.utils.addText(this, this.game.width / 2, this.game.height / 2 - 60, 'Loading...', 3);


		this.preloadBar = this.add.sprite(this.game.width / 2, loadingText.img.y + 40, 'preloaderBar');
		this.preloadBar.anchor.setTo(0.5, 0.5);
       
		//	This sets the preloadBar sprite as a loader sprite.
		//	What that does is automatically crop the sprite from 0 to full-width
		//	as the files below are loaded in.
		this.load.setPreloadSprite(this.preloadBar);

		//	Here we load the rest of the assets our game needs.
		//	As this is just a Project Template I've not provided these assets, swap them for your own.
		this.load.image('titlepage', 'assets/title.png');

		// this.load.audio('titleMusic', ['assets/audio/bodenstaendig_2000_in_rock_4bit.ogg']);
		this.load.audio('gameOverMusic', ['assets/audio/invaders_gameover.ogg']);
		this.load.audio('mainMusic', ['assets/audio/invaders_mainloop.ogg']);
		this.load.audio('sfx', 'assets/audio/fx_mixdown.ogg');

		//	+ lots of other required assets here
		this.load.image('nao', 'assets/nao.png');
		this.load.image('invader', 'assets/invader.png');
		this.load.image('bullet', 'assets/player_bullet.png');
        this.load.image('title', 'assets/title-3.png');
		this.load.image('logo', 'assets/citius-logo-8bit.png');
        

		// Read game settings
        this.load.json('settings', 'settings.json');
	},

	create: function () {

		//	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the mainMusic decodes
		this.preloadBar.cropEnabled = false;

	},

	update: function () {
		
		if (this.cache.isSoundDecoded('mainMusic') && this.ready == false)
		{
			this.ready = true;
			this.state.start('MainMenu');
		}

	}

};
