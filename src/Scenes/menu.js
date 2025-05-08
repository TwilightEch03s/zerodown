class Menu extends Phaser.Scene {
    constructor() {
        super("menuScene");
        this.my = { sprite: {} };

        this.logoX = 415;
        this.logoY = 500;

        this.playX = 410;
        this.playY = 800;
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.audio("music", "menu_theme.mp3");
        this.load.image("logo", "zero_down_logo.png");
        this.load.image("play", "zero_down_play.png");
        this.load.image("play2", "zero_down_play2.png");
        this.load.audio("ui", "ui.mp3");

    }

    create() {
        let my = this.my;

        // Add UI Sprites
        my.sprite.logo = this.add.sprite(this.logoX, this.logoY, "logo");
        my.sprite.logo.scale = 0.4;

        my.sprite.play = this.add.sprite(this.playX, this.playY, "play");
        my.sprite.play.scale = 0.4;
        my.sprite.play.setInteractive();

        // Hover effects
        my.sprite.play.on('pointerover', () => {
            my.sprite.play.setTexture("play2");
        });

        my.sprite.play.on('pointerout', () => {
            my.sprite.play.setTexture("play");
        });

        my.sprite.play.on('pointerdown', () => {
            this.music.stop();
            this.ui.play();
            this.scene.start("ZeroDownScene");
        });

        // Play music
        this.music = this.sound.add("music", { 
            loop: true, 
            volume: 0.5 
        });
        
        this.ui = this.sound.add("ui", { volume: 1.0 });
        this.music.play();
    }

    update() {
        // Empty
    }
}
