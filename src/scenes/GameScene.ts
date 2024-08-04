// GameScene.ts
import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
    private bear!: Phaser.GameObjects.Sprite;

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('bear', 'assets/images/cute-bear.png');
        this.load.image('background', 'assets/images/background.png');
    }

    create() {
        // Add background
        this.add.image(400, 300, 'background');

        // Add bear sprite
        this.bear = this.add.sprite(400, 300, 'bear');
        console.log('Game scene created');
    }

    update() {
        // Game logic goes here
        this.bear.x += 1; // Example usage of bear to move it
    }
}

export default GameScene;
