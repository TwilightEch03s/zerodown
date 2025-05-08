class ZeroDown extends Phaser.Scene {
    constructor() {
        super("ZeroDownScene");
        this.my = { sprite: {} };

        // Keys
        this.aKey = null;
        this.dKey = null;
        this.rKey = null;
        this.spaceKey = null;

        // Player
        this.playerX = 400;
        this.playerY = 780;
        this.playerHealth = 5;
        this.playerLives = 3;

        // Bullets
        this.bullets = [];
        this.maxBullets = 10;
        this.bulletCount = this.maxBullets;

        this.canShoot = true;
        this.lastShotTime = 0;

        this.enemyBullets = [];

        // Statistics
        this.myScore = 0;
        this.finalScore = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;

        // Enemy Planes
        this.enemyPlanes = [];
        this.enemyFighterHealth = 3;
        this.enemyKamikazeHealth = 2;
        this.enemyBomberHealth = 5;

        this.enemyDirection = 1;

        // Game States
        this.gameStarted = false;
        this.isGameOver = false;
        this.nextWave = false;
        this.waveNumber = 1;
    }

    preload() {
        this.load.setPath("./assets/");

        // Water Tiles
        this.load.image("water_tiles", "water.png");
        this.load.tilemapTiledJSON("map", "water.json");

        // Player
        this.load.image("player", "ship_0004.png");

        // Bullets
        this.load.image("bullet", "tile_0001.png");
        this.load.image("enemyBullet", "tile_0001.png");

        // Enemy Planes
        this.load.image("enemyFighter", "ship_0009.png");
        this.load.image("enemyKamikaze", "ship_0005.png");
        this.load.image("enemyBomber", "ship_0001.png");

        // Explosion
        this.load.image("explosion1", "tile_0006.png");
        this.load.image("explosion2", "tile_0005.png");
        this.load.image("explosion4", "tile_0007.png");
        this.load.image("explosion5", "tile_0008.png");

        // Gun Sounds
        this.load.audio("shoot", "gun.mp3");
        this.load.audio("shoot2", "gun2.mp3");
        this.load.audio("empty", "empty.mp3");
        this.load.audio("reload", "reload.mp3");

        // Plane Sounds
        this.load.audio("plane", "plane.mp3");
        this.load.audio("bomberSound", "bomber.mp3");
        this.load.audio("kamikazeSound", "kama.mp3");
        this.load.audio("planeHit", "planeHit.mp3");


        // Music
        this.load.audio("music2", "music2.mp3");
        this.load.audio("defeatTheme", "defeat.mp3")

        // Explosion
        this.load.audio("explosion", "death.mp3");
        this.load.audio("explosion2", "explosion2.mp3");

        // Stat Increase
        this.load.audio("stats", "stats.mp3")

        // UI
        this.load.audio("ui", "ui.mp3");

    }

    create() {
        let my = this.my;

        // Create Keyboard Keys
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        // Create Water Tilemaps
        this.map = this.make.tilemap({ key: "map" });
        this.tileset = this.map.addTilesetImage("water-packed", "water_tiles");

        this.waterLayer = this.map.createLayer("water", this.tileset, 0, 0);
        this.water2Layer = this.map.createLayer("water2", this.tileset, 0, 0);
        this.waterLayer.setScale(6.0);
        this.water2Layer.setScale(6.0);
        this.waterLayer.visible = true;
        this.water2Layer.visible = false;
        this.waterType = "Water1";
        this.counter = 0;

        // Create Player Plane
        my.sprite.playerPlane = this.add.sprite(this.playerX, 900, "player");
        my.sprite.playerPlane.setScale(3.0);
        
        this.tweens.add({
            targets: my.sprite.playerPlane,
            y: this.playerY,
            duration: 1000,
            ease: "Sine.easeOut"
        });

        // Delayed gameStarted()
        this.time.delayedCall(15000, () => {
            this.gameStarted = true;
        }, [], this);

        // Create Audio
        this.shootSound = this.sound.add("shoot", { volume: 0.3 });
        this.emptySound = this.sound.add("empty", { volume: 0.5 });
        this.reloading = this.sound.add("reload", { volume: 1 });

        this.hit = this.sound.add("planeHit", { volume: 0.5 });
        this.enemyShootSound = this.sound.add("shoot2", { volume: 0.4 });
        this.deathExplosion = this.sound.add("explosion", { volume: 0.3 });
        this.lifeLoss = this.sound.add("explosion2", { volume: 0.5 });
        
        this.statIncrease = this.sound.add("stats", { volume: 0.6 });

        // Create Audio Looping
        this.planeSound = this.sound.add("plane", { loop: true, volume: 0.15 });
        this.planeSound.play();

        this.battleMusic = this.sound.add("music2", { loop: true, volume: 0.5 });
        this.battleMusic.play();

        this.defeatMusic = this.sound.add("defeatTheme", { loop: true, volume: 0.5 });

        // Delay Spawning Enemy Planes
        this.time.delayedCall(12500, () => {
            this.controls1.setVisible(false);
            this.controls2.setVisible(false);
            this.controls3.setVisible(false);
            this.controls4.setVisible(false);
            this.spawnEnemies();
        }, [], this);

        // Controls Text
        this.controls1 = this.add.text(220, 310, `A -> Move Left`, {
            fontFamily: '"Special Elite", cursive',
            fontSize: '52px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                fill: true
            }
        });

        this.controls2 = this.add.text(220, 360, `D -> Move Right`, {
            fontFamily: '"Special Elite", cursive',
            fontSize: '52px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                fill: true
            }
        });

        this.controls3 = this.add.text(220, 410, `SPACE -> Shoot`, {
            fontFamily: '"Special Elite", cursive',
            fontSize: '52px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                fill: true
            }
        });

        this.controls4 = this.add.text(220, 460, `R -> Reload`, {
            fontFamily: '"Special Elite", cursive',
            fontSize: '52px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                fill: true
            }
        });

        // Statistics Text
        this.scoreText = this.add.text(10, 5, `Score: ${this.myScore}`, {
            fontFamily: '"Special Elite", cursive',
            fontSize: '40px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                fill: true
            }
        });
        

        this.ammoText = this.add.text(10, 40, `Ammo: ${this.bulletCount}/${this.maxBullets}`, {
            fontFamily: '"Special Elite", cursive',
            fontSize: '30px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                fill: true
            }     
        }); 

        this.healthText = this.add.text(10, 70, `Health: ${this.playerHealth}`, {
            fontFamily: '"Special Elite", cursive',
            fontSize: '30px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                fill: true
            }     
        }); 

        this.lives = this.add.text(625, 5, `Lives: ${this.playerLives}`, {
            fontFamily: '"Special Elite", cursive',
            fontSize: '40px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                fill: true
            }
        });
        
        this.gameOverText = this.add.text(150, 200, `Game Over`, {
            fontFamily: '"Special Elite", cursive',
            fontSize: '100px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                fill: true
            }
        });

        this.shotsFiredText = this.add.text(220, 310, `Shots Fired: ${this.shotsFired}`, {
            fontFamily: '"Special Elite", cursive',
            fontSize: '52px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                fill: true
            }
        });

        this.shotsHitText = this.add.text(220, 360, `Shots Hit: ${this.shotsHit}`, {
            fontFamily: '"Special Elite", cursive',
            fontSize: '52px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                fill: true
            }
        });

        this.accuracyText = this.add.text(220, 410, `Accuracy: 0.0%`, {
            fontFamily: '"Special Elite", cursive',
            fontSize: '52px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                fill: true
            }
        });

        this.finalScoreText = this.add.text(220, 490, `Score: ${this.finalScore}`, {
            fontFamily: '"Special Elite", cursive',
            fontSize: '54px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                fill: true
            }
        });

        this.ui = this.sound.add("ui", { volume: 1.0 });

        // Play Again
        this.playAgainText = this.add.text(250, 650, `Play Again`, {
            fontFamily: '"Special Elite", cursive',
            fontSize: '60px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                fill: true
            }
        });

        this.playAgainText.setInteractive({ useHandCursor: true });
        this.playAgainText.on('pointerover', () => {
            this.playAgainText.setStyle({ fill: '#f00' });
        });
        this.playAgainText.on('pointerout', () => {
            this.playAgainText.setStyle({ fill: '#fff' });
        });

        this.playAgainText.on('pointerdown', () => {
            this.defeatMusic.stop();
            this.defeatMusic.destroy();
            this.ui.play();
            this.playerX = 400;
            this.playerY = 780;
            this.playerHealth = 5;
            this.playerLives = 3;
            this.bullets = [];
            this.maxBullets = 10;
            this.bulletCount = this.maxBullets;
            this.canShoot = true;
            this.lastShotTime = 0;
            this.enemyBullets = [];
            this.myScore = 0;
            this.finalScore = 0;
            this.shotsFired = 0;
            this.shotsHit = 0;
            this.enemyPlanes = [];
            this.enemyFighterHealth = 3;
            this.enemyKamikazeHealth = 2;
            this.enemyBomberHealth = 5;
            this.enemyDirection = 1;
            this.gameStarted = false;
            this.isGameOver = false;
            this.nextWave = false;
            this.waveNumber = 1;
            this.scene.start('ZeroDownScene');
        });

        this.shotsFiredText.setVisible(false);
        this.shotsHitText.setVisible(false);
        this.accuracyText.setVisible(false);
        this.finalScoreText.setVisible(false);

        this.gameOverText.setVisible(false);
        this.playAgainText.setVisible(false);

        this.bulletCount = this.maxBullets;
        this.GameOver = false;
    }

    createExplosion(x, y) {
        const frames = ["explosion1", "explosion2", "explosion4", "explosion5"];
        let explosion = this.add.sprite(x, y, frames[0]);
        explosion.setScale(5.0);

        for (let i = 1; i < frames.length; i++) {
            this.time.delayedCall(i * 100, () => {
                explosion.setTexture(frames[i]);
            });
        }
        this.time.delayedCall(frames.length * 100, () => {
            explosion.destroy();
        });
    }

    update() {
        let my = this.my;

        // Water Tile Update
        this.counter++;
        if (this.counter % 20 === 0) {
            if (this.waterType === "Water1") {
                this.waterType = "Water2";
                this.waterLayer.visible = false;
                this.water2Layer.visible = true;
            } else {
                this.waterType = "Water1";
                this.waterLayer.visible = true;
                this.water2Layer.visible = false;
            }
        }

        // Plane Movement & Actions
        let movementSpeed = 3 + (this.playerHealth);
        if (!this.isGameOver) {
            // Left
            if (this.aKey.isDown) {
                my.sprite.playerPlane.x -= movementSpeed;
                if (my.sprite.playerPlane.x <= 100) {
                    my.sprite.playerPlane.x = 100;
                }
            }
            
            // Right
            if (this.dKey.isDown) {
                my.sprite.playerPlane.x += movementSpeed;
                if (my.sprite.playerPlane.x >= 700) {
                    my.sprite.playerPlane.x = 700;
                }
            }
    
            // Reload
            if (Phaser.Input.Keyboard.JustDown(this.rKey) && this.gameStarted) {
                this.canShoot = false;
                this.reloading.play();
                this.time.delayedCall(1500, () => {
                    this.bulletCount = this.maxBullets; 
                    this.ammoText.setText(`Ammo: ${this.bulletCount}/${this.maxBullets}`);
                    this.canShoot = true;
                });
            }
    
            // Shooting
            if (this.spaceKey.isDown && this.gameStarted) {
                let currentTime = this.time.now;
                if (this.canShoot && currentTime - this.lastShotTime > 100) {
                    if (this.bulletCount > 0) {
                        let bullet = this.add.sprite(my.sprite.playerPlane.x, my.sprite.playerPlane.y - 50, "bullet");
                        this.bullets.push(bullet);
                        bullet.setScale(2.0);
                        this.bulletCount--;
                        this.ammoText.setText(`Ammo: ${this.bulletCount}/${this.maxBullets}`);
                        this.lastShotTime = currentTime;
                        this.shootSound.play();

                        this.shotsFired++;
                        this.shotsFiredText.setText(`Shots Fired: ${this.shotsFired}`);

                        let accuracyRatio = this.shotsFired > 0 ? ((this.shotsHit / this.shotsFired) * 100).toFixed(1) + "%" : "0.0%";
                        this.accuracyText.setText(`Accuracy: ${accuracyRatio}`);
                    } else {
                        this.emptySound.play();
                        this.lastShotTime = currentTime;
                    }
                }
            }
            
        }

        // Plane Sound Management
        if (this.isGameOver && this.planeSound.isPlaying) {
            this.planeSound.stop();
        }
        
        // Bullet Movement & Collision
        for (let bullet of this.bullets) {
            bullet.y -= 10;
            for (let enemy of this.enemyPlanes) {
                if (enemy.visible && this.collides(enemy, bullet)) {
                    bullet.y = -100;
                    enemy.hitPoints--;
                    this.hit.play();
                    this.tweens.add({
                        targets: enemy,
                        alpha: 0.5,
                        duration: 50,
                        yoyo: true
                    });

                    this.shotsHit++;
                    this.shotsHitText.setText(`Shots Hit: ${this.shotsHit}`);

                    let accuracyRatio = this.shotsFired > 0 ? ((this.shotsHit / this.shotsFired) * 100).toFixed(1) + "%" : "0.0%";
                    this.accuracyText.setText(`Accuracy: ${accuracyRatio}`);   
                    
                    if (enemy.hitPoints <= 0) {
                        this.deathExplosion.play();
                        this.createExplosion(enemy.x, enemy.y);

                        if (enemy.type === "bomber" && enemy.bomberSoundInstance) {
                            enemy.bomberSoundInstance.stop(); 
                            enemy.bomberSoundInstance.destroy();
                            enemy.bomberSoundInstance = null;
                        }
                        if (enemy.type === "kamikaze" && enemy.kamikazeSoundInstance) {
                            enemy.kamikazeSoundInstance.stop(); 
                            enemy.kamikazeSoundInstance.destroy();
                            enemy.kamikazeSoundInstance = null;
                        }

                        if(enemy.type === "fighter") {
                            this.myScore += 100;
                            this.scoreText.setText(`Score: ${this.myScore}`);
                        }
                        if(enemy.type === "kamikaze") {
                            this.myScore += 200;
                            this.scoreText.setText(`Score: ${this.myScore}`);
                        }
                        if(enemy.type === "bomber") {
                            this.myScore += 300;
                            this.scoreText.setText(`Score: ${this.myScore}`);
                        }

                        enemy.visible = false;
                        enemy.x = -100;
                    }
                    break;
                }
            }
        }
        
        // Enemy Bullet Movement & Collision
        for (let bullet of this.enemyBullets) {
            bullet.y += 10;
            if (this.collides(bullet, my.sprite.playerPlane)) {
                this.hit.play();
                bullet.y = -100;
                this.playerHealth--;
                this.healthText.setText(`Health: ${this.playerHealth}`);
                this.tweens.add({
                    targets: my.sprite.playerPlane,
                    alpha: 0.5,
                    duration: 50,
                    yoyo: true
                });
            
                if (this.playerHealth <= 0) {
                    this.createExplosion(my.sprite.playerPlane.x, my.sprite.playerPlane.y);
                    this.deathExplosion.play();
                    my.sprite.playerPlane.y = -100;
                    my.sprite.playerPlane.visible = false;
                    this.playerLives--;
                
                    this.lives.setText(`Lives: ${this.playerLives}`);
                    this.isGameOver = true;

                    if (this.playerLives < 0) {
                        this.playerLives = 0;
                        this.lives.setText(`Lives: ${this.playerLives}`);
                        my.sprite.playerPlane.destroy();
                        this.isGameOver = true;
                        this.defeatMusic.play();
                        this.time.delayedCall(5000, () => {
                            this.GameOver = true;
                        });
                    } else {
                        this.time.delayedCall(2000, () => {
                            my.sprite.playerPlane.x = this.playerX;
                            my.sprite.playerPlane.y = this.playerY;
                            my.sprite.playerPlane.visible = true;
                            this.playerHealth = 5;
                            this.healthText.setText(`Health: ${this.playerHealth}`);
                            this.bulletCount = this.maxBullets; 
                            this.ammoText.setText(`Ammo: ${this.bulletCount}/${this.maxBullets}`);
                            this.time.delayedCall(2000, () => {
                                this.planeSound.play();
                                this.isGameOver = false;
                            });
                        });
                    }
                }

                for (let enemy of this.enemyPlanes) {
                    if (enemy.type === "bomber" && enemy.bomberSoundInstance) {
                        enemy.bomberSoundInstance.stop(); 
                        enemy.bomberSoundInstance.destroy();
                        enemy.bomberSoundInstance = null;
                    }
                    if (enemy.type === "kamikaze" && enemy.kamikazeSoundInstance) {
                        enemy.kamikazeSoundInstance.stop(); 
                        enemy.kamikazeSoundInstance.destroy();
                        enemy.kamikazeSoundInstance = null;                    
                    }
                }
            }
            
        }
        
        this.bullets = this.bullets.filter(bullet => bullet.y > -bullet.displayHeight / 2);
        this.enemyBullets = this.enemyBullets.filter(bullet => bullet.y > -bullet.displayHeight / 2);
        
        // When Game Starts
        if (!this.gameStarted) {
            return;
        }
        
        // Enemy Plane Movements
        let changeDirection = false;
        for (let enemy of this.enemyPlanes) {
            if (!enemy.visible) {
                continue;
            }

            if ((enemy.type === "kamikaze" && enemy.charging) || (enemy.type === "bomber" && enemy.run)) {
                continue;
            }

            enemy.x += 1.5 * this.enemyDirection;
            if (enemy.x <= 100 || enemy.x >= 700) {
                changeDirection = true;
            }
        }

        if (changeDirection) {
            this.enemyDirection *= -1;
        }

        
        // Enemy Fighter Plane AI
        for (let enemy of this.enemyPlanes) {
            if (!enemy.visible || enemy.type != "fighter") {
                continue;
            }

            if (this.isGameOver) {
                enemy.attack = false;
                continue;
            }
            
            let fighterChance = this.getWaveAdjustedChance(2);
            if (!enemy.attack && Phaser.Math.Between(0, 100) < fighterChance) {
                enemy.attack = true;
            }
            
            if (enemy.attack) {
                if (Phaser.Math.Between(0, 100) < 1) {
                    let bullet = this.add.sprite(enemy.x, enemy.y + 50, "enemyBullet");
                    this.enemyBullets.push(bullet);
                    this.enemyShootSound.play();
                    bullet.setScale(2.0);
                }
            }
        }

        // Enemy Kamikaze Plane AI
        for (let enemy of this.enemyPlanes) {
            if (!enemy.visible || enemy.type !== "kamikaze") {
                continue;
            }
    
            if (this.isGameOver) {
                let formationY = 200;
                enemy.y = formationY;
                enemy.charging = false;
                enemy.setAngle(180);
                continue;
            }
    
            let kamikazeChance = this.getWaveAdjustedChance(1);
            if (!enemy.charging && Phaser.Math.Between(0, 250) < kamikazeChance) {
                enemy.charging = true;
                enemy.kamikazeSoundInstance = this.sound.add("kamikazeSound", {volume: 0.5});
                enemy.kamikazeSoundInstance.play();
            }
    
            if (enemy.charging) {
                let dx = my.sprite.playerPlane.x - enemy.x;
                let dy = my.sprite.playerPlane.y - enemy.y;
                let angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, my.sprite.playerPlane.x, my.sprite.playerPlane.y);
    
                enemy.setRotation(angle + Math.PI / 2);
    
                let magnitude = Math.sqrt(dx * dx + dy * dy);
                dx /= magnitude;
                dy /= magnitude;
    
                enemy.x += dx * 7;
                enemy.y += dy * 7;
    
                if (enemy.y > 1000) {
                    enemy.visible = false;
                    enemy.x = -100;
                }
    
                if (this.collides(enemy, my.sprite.playerPlane)) {
                    enemy.visible = false;
                    enemy.x = -100;

                    this.createExplosion(my.sprite.playerPlane.x, my.sprite.playerPlane.y);
                    this.deathExplosion.play();

                    my.sprite.playerPlane.visible = false;
                    this.playerLives--;
                    this.playerHealth -= this.playerHealth;
                    this.healthText.setText(`Health: ${this.playerHealth}`);
                    this.lives.setText(`Lives: ${this.playerLives}`);
                    this.isGameOver = true;

                    if (this.playerLives < 0) {
                        this.playerLives = 0;
                        this.lives.setText(`Lives: ${this.playerLives}`);
                        my.sprite.playerPlane.destroy();
                        this.isGameOver = true;
                        this.defeatMusic.play();
                        this.time.delayedCall(5000, () => {
                            this.GameOver = true;
                        });
                    } else {
                        this.time.delayedCall(2000, () => {
                            this.playerHealth = 5;
                            this.healthText.setText(`Health: ${this.playerHealth}`);
                            this.bulletCount = this.maxBullets; 
                            this.ammoText.setText(`Ammo: ${this.bulletCount}/${this.maxBullets}`);
                            my.sprite.playerPlane.x = this.playerX;
                            my.sprite.playerPlane.y = this.playerY;
                            my.sprite.playerPlane.visible = true;
                            this.time.delayedCall(2000, () => {
                                this.planeSound.play();
                                this.isGameOver = false;
                            });
                        });
                    }

                    for (let enemy of this.enemyPlanes) {
                        if (enemy.type === "kamikaze" && enemy.kamikazeSoundInstance) {
                            enemy.kamikazeSoundInstance.stop(); 
                            enemy.kamikazeSoundInstance.destroy();
                            enemy.kamikazeSoundInstance = null;
                        }
                    }
                }
            }
        }

        // Enemy Bomber Plane AI
        for (let enemy of this.enemyPlanes) {
            if (!enemy.visible || enemy.type !== "bomber") {
                continue;
            }

            if (this.isGameOver) {
                let formationY = 100;
                enemy.y = formationY;
                enemy.run = false;
                enemy.setAngle(180);
                continue;
            }

            let bomberChance = this.getWaveAdjustedChance(1);
            if (!enemy.run && Phaser.Math.Between(0, 300) < bomberChance) {
                enemy.run = true;
                enemy.bomberSoundInstance = this.sound.add("bomberSound", {volume: 0.5});
                enemy.bomberSoundInstance.play();
            }

            if (enemy.run) {
                enemy.y += 2;
                if (Phaser.Math.Between(0, 280) < 1) {
                    let bullet = this.add.sprite(enemy.x, enemy.y + 50, "enemyBullet");
                    this.enemyShootSound.play();
                    bullet.setScale(2.0);
                    this.enemyBullets.push(bullet);
                }
                
            }

            if(enemy.y > 950) {
                this.lifeLoss.play();
                this.playerLives--;
                this.lives.setText(`Lives: ${this.playerLives}`);
                if (this.playerLives < 0) {
                    this.playerLives = 0;
                    this.lives.setText(`Lives: ${this.playerLives}`);
                }
                enemy.y = -100;
                this.time.delayedCall(1550, () => {
                    enemy.run = false;
                });
            }

        }
        
        //Wave End
        if (!this.isGameOver && this.gameStarted && !this.nextWave) {
            const allEnemiesDefeated = this.enemyPlanes.every(enemy => !enemy.visible);
            if (allEnemiesDefeated) {
                this.shotsFiredText.setVisible(true);
                this.shotsHitText.setVisible(true);
                this.accuracyText.setVisible(true);
                
                this.nextWave = true;
                this.waveNumber++;
                
                this.time.delayedCall(10000, () => {
                    this.spawnEnemies();
                    this.buffs(); 
                    this.nextWave = false;
                }, [], this);
            }
        }
        
        // Game Over Screen
        if(this.GameOver) {
            for (let enemy of this.enemyPlanes) {
                enemy.destroy();
            }            
            this.battleMusic.stop();
            this.scoreText.setVisible(false);
            this.healthText.setVisible(false);
            this.ammoText.setVisible(false);
            this.lives.setVisible(false);

            this.shotsFiredText.setVisible(true);
            this.shotsHitText.setVisible(true);
            this.accuracyText.setVisible(true);
            let accuracyRatio = this.shotsFired > 0 ? this.shotsHit / this.shotsFired : 0;
            this.accuracyText.setText(`Accuracy: ${(accuracyRatio * 100).toFixed(1)}%`);
        
            this.finalScore = this.myScore + (accuracyRatio * this.myScore * 0.5);
            this.finalScore = Math.round(this.finalScore);
            this.finalScoreText.setText(`Score: ${this.finalScore}`);
            this.finalScoreText.setVisible(true);
            
            this.gameOverText.setVisible(true);
            this.playAgainText.setVisible(true);
        }
    }
    
    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

    spawnEnemies() {
        this.shotsFiredText.setVisible(false);
        this.shotsHitText.setVisible(false);
        this.accuracyText.setVisible(false);
        for (let i = 0; i < 4; i++) {
            let enemyX = 180 + i * 150;
            let enemy = this.add.sprite(enemyX, 300, "enemyFighter");
            enemy.hitPoints = this.enemyFighterHealth;
            enemy.setAngle(180);
            enemy.setScale(3.0);
            enemy.type = "fighter";
            this.enemyPlanes.push(enemy);
        }

        for (let i = 0; i < 3; i++) {
            let enemyX = 250 + i * 150;
            let enemy = this.add.sprite(enemyX, 200, "enemyKamikaze");
            enemy.hitPoints = this.enemyKamikazeHealth;
            enemy.setAngle(180);
            enemy.setScale(2.5);
            enemy.type = "kamikaze";
            enemy.charging = false;
            this.enemyPlanes.push(enemy);
        }

        for (let i = 0; i < 2; i++) {
            let enemyX = 325 + i * 150;
            let enemy = this.add.sprite(enemyX, 100, "enemyBomber");
            enemy.hitPoints = this.enemyBomberHealth;
            enemy.setAngle(180);
            enemy.setScale(3);
            enemy.type = "bomber";
            enemy.run = false;
            enemy.bomberSoundInstance = null;
            this.enemyPlanes.push(enemy);
        }
    }
    // Buff Enemy Planes and Player
    buffs() {
        if (this.waveNumber < 6) {
            this.maxBullets += 2;
            this.bulletCount = this.maxBullets;
            this.ammoText.setText(`Ammo: ${this.bulletCount}/${this.maxBullets}`);
            this.statIncrease.play();
        }

        if (this.waveNumber < 6) {
            this.enemyFighterHealth += 1;
            this.enemyBomberHealth += 1;
        }

        if (this.waveNumber < 3) {
            this.enemyKamikazeHealth += 1;
        }

        if (this.waveNumber % 2 === 0) {
            this.playerLives++;
            this.lives.setText(`Lives: ${this.playerLives}`);
            this.statIncrease.play();
        }
    
    }
    getWaveAdjustedChance(baseChance) {
        let cappedWave = Math.min(this.waveNumber, 5);
        return baseChance + cappedWave;
    }
    

}
