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
        const background = this.add.image(400, 300, 'background');
        background.setDisplaySize(800, 600);

        this.bear = this.add.sprite(400, 300, 'bear');
        console.log('Game scene created');
    }

    update() {
        this.bear.x += 1;
    }
}

export default GameScene;
