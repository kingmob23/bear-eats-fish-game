import Phaser from 'phaser';

class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    create() {
        const startText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Tap to Start', {
            fontSize: '32px',
            color: '#fff'
        }).setOrigin(0.5).setInteractive();

        startText.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}

export default StartScene;
