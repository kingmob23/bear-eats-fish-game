import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
    private bear!: Phaser.GameObjects.Sprite;

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('bear', 'assets/images/cute-bear.webp');
        this.load.image('background', 'assets/images/background.webp');
    }

    create() {
        const background = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background');
        background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        this.bear = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2, 'bear');
        console.log('Game scene created');

        this.input.on('pointerdown', this.moveBear, this);
    }

    moveBear(pointer: Phaser.Input.Pointer) {
        this.tweens.add({
            targets: this.bear,
            x: pointer.x,
            y: pointer.y,
            duration: 500,
            ease: 'Power2'
        });
    }

    update() {
    }
}

export default GameScene;
