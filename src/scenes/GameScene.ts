import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
    private bear!: Phaser.GameObjects.Sprite;
    private backgroundMusic!: Phaser.Sound.BaseSound;
    private moveSound!: Phaser.Sound.BaseSound;

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('bear', 'assets/images/cute-bear.webp');
        this.load.image('background', 'assets/images/background.webp');
        this.load.audio('backgroundMusic', 'assets/audio/background.mp3');
        this.load.audio('moveSound', 'assets/audio/move.mp3');
    }

    create() {
        console.log('GameScene create');
        const background = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background');
        background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        this.bear = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2, 'bear');
        console.log('Game scene created');

        this.backgroundMusic = this.sound.add('backgroundMusic', {
            loop: true,
            volume: 0.2
        });

        console.log('Attempting to play background music');
        this.backgroundMusic.play();

        this.moveSound = this.sound.add('moveSound', {
            volume: 1.0
        });

        this.input.on('pointerdown', this.moveBear, this);
    }

    moveBear(pointer: Phaser.Input.Pointer) {
        console.log('Move bear called');
        if (this.moveSound.isPlaying) {
            this.moveSound.stop();
        }
        this.moveSound.play({
            volume: 3.0
        });
        this.tweens.add({
            targets: this.bear,
            x: pointer.x,
            y: pointer.y,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                if (this.moveSound.isPlaying) {
                    this.moveSound.stop();
                }
            }
        });
    }

    update() {
        // No need for continuous update logic here
    }
}

export default GameScene;
