import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
    private bear!: Phaser.GameObjects.Sprite;
    private actionButton!: Phaser.GameObjects.Sprite;
    private splash!: Phaser.GameObjects.Sprite;
    private backgroundMusic!: Phaser.Sound.BaseSound;
    private moveSound!: Phaser.Sound.BaseSound;
    private splashSound!: Phaser.Sound.BaseSound;
    private buttonActive: boolean;

    constructor() {
        super({ key: 'GameScene' });
        this.buttonActive = false;
    }

    preload() {
        this.load.image('bear', 'assets/images/cute-bear.webp');
        this.load.image('background', 'assets/images/background.webp');
        this.load.audio('backgroundMusic', 'assets/audio/background.mp3');
        this.load.audio('moveSound', 'assets/audio/move.mp3');
        this.load.image('actionButton', 'assets/interface/action-button.svg');
        this.load.image('splash', 'assets/images/splash.webp');
        this.load.audio('splashSound', 'assets/audio/splash-sound.mp3');
    }

    create() {
        const { width, height } = this.cameras.main;

        const background = this.add.image(width / 2, height / 2, 'background') as Phaser.GameObjects.Image;
        background.setDisplaySize(width, height);

        this.bear = this.add.sprite(width / 2, height / 2, 'bear');

        const buttonScale = 1.7;
        const actionButtonPaddingX = width * 0.05;
        const actionButtonPaddingY = height * 0.05;
        const finalX = width - actionButtonPaddingX - ((this.textures.get('actionButton').getSourceImage().width * buttonScale) / 2);
        const finalY = height - actionButtonPaddingY - ((this.textures.get('actionButton').getSourceImage().height * buttonScale) / 2);
        this.actionButton = this.add.sprite(finalX, finalY, 'actionButton').setScale(buttonScale);
        this.actionButton.setAlpha(0.9);
        this.actionButton.setInteractive();
        this.actionButton.on('pointerdown', this.onActionButtonClick, this);

        const splashVerticalOffset = height * 0.25;
        this.splash = this.add.sprite(width / 2, splashVerticalOffset, 'splash');
        this.splash.setScale(0.4);
        this.splash.setVisible(false);

        this.backgroundMusic = this.sound.add('backgroundMusic', {
            loop: true,
            volume: 0.2
        });
        this.backgroundMusic.play();

        this.moveSound = this.sound.add('moveSound', { volume: 1.0 });
        this.splashSound = this.sound.add('splashSound', { volume: 0.1 });

        this.input.on('pointerdown', this.moveBear, this);

        const randomTime = Phaser.Math.Between(3000, 10000);
        this.time.delayedCall(randomTime, this.showSplash, [], this);

        this.setButtonActive(false);
    }

    onActionButtonClick(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) {
        if (this.buttonActive) {
            console.log('Button clicked!');
            event.stopPropagation();

            this.splash.setVisible(false);
            if (this.splashSound.isPlaying) {
                this.splashSound.stop();
            }
            this.backgroundMusic.resume();
            this.setButtonActive(false);
        }
    }

    setButtonActive(active: boolean) {
        this.buttonActive = active;
        if (active) {
            this.actionButton.setAlpha(1);
        } else {
            this.actionButton.setAlpha(0.9);
            this.tweens.killTweensOf(this.actionButton);
        }
    }

    showSplash() {
        const { width, height } = this.cameras.main;
        this.splash.setPosition(width / 4, height - height / 4);
        this.splash.setVisible(true);
        this.backgroundMusic.pause();
        this.splashSound.play();

        this.setButtonActive(true);
    }

    moveBear(pointer: Phaser.Input.Pointer) {
        this.moveSound.play({ volume: 3.0 });
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
        if (this.splash.visible) {
            const distance = Phaser.Math.Distance.Between(
                this.bear.x, this.bear.y,
                this.splash.x, this.splash.y
            );
            const activationDistance = this.splash.displayHeight;
            this.setButtonActive(distance <= activationDistance);

            this.bear.setDepth(this.bear.y > this.splash.y ? 1 : 0);
            this.splash.setDepth(this.bear.y > this.splash.y ? 0 : 1);
        }
    }
}

export default GameScene;
