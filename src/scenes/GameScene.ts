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
        const background = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background');
        background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        this.bear = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2, 'bear');

        this.backgroundMusic = this.sound.add('backgroundMusic', {
            loop: true,
            volume: 0.2
        });

        this.backgroundMusic.play();

        this.moveSound = this.sound.add('moveSound', {
            volume: 1.0
        });

        this.input.on('pointerdown', this.moveBear, this);
    }

    moveBear(pointer: Phaser.Input.Pointer) {
        // if (this.moveSound.isPlaying) {
        //     this.moveSound.stop();
        // }
        // The moveBear method stops the sound if it is already playing before starting it again. This ensures that the sound effect starts from the beginning each time the bear moves.
        // But it actually acts the same without it.
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
