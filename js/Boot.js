var invadersApp = {};

invadersApp.Boot = function (game) {

};

invadersApp.Boot.prototype = {

    init: function () {

        //  Unless you specifically know your game needs to support multi-touch I would recommend setting this to 1
        this.input.maxPointers = 1;

        //  Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
        this.stage.disableVisibilityChange = true;

        if (this.game.device.desktop)
        {
            //  If you have any desktop specific settings, they can go in here
            this.scale.pageAlignHorizontally = true;
            //this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            var scale = (window.innerWidth/960) * 0.8;
            this.scale.setUserScale(scale, scale);
            this.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;

        }
        else
        {
            //  Same goes for mobile settings.
            //  In this case we're saying "scale the game, no lower than 480x260 and no higher than 1024x768"
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.setMinMax(480, 260, 1024, 768);
            this.scale.forceLandscape = true;
            this.scale.pageAlignHorizontally = true;
        }

        // Pixelized!
        this.game.antialias = false;
        this.game.stage.smoothed = false;

    },

    preload: function () {
        
        this.load.image('preloaderBackground', 'assets/background.png');
        this.load.image('retroFont', 'assets/fonts/font3.png');
        this.load.image('preloaderBar', 'assets/preload.png');
        
    },

    create: function () {

        //  By this point the preloader assets have loaded to the cache, we've set the game settings
        //  So now let's start the real preloader going
        this.state.start('Preloader');

    }

};
