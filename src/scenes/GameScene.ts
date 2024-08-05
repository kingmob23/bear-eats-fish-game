import EventEmitter from 'events';
import Phaser from 'phaser';
import Fish from '../utils/Fish';

class GameScene extends Phaser.Scene {
    private bear!: Phaser.GameObjects.Sprite;
    private actionButton!: Phaser.GameObjects.Sprite;
    private splash!: Phaser.GameObjects.Sprite;
    private stove!: Phaser.GameObjects.Sprite;

    private backgroundMusic!: Phaser.Sound.BaseSound;
    private moveSound!: Phaser.Sound.BaseSound;
    private splashSound!: Phaser.Sound.BaseSound;
    private pickSound!: Phaser.Sound.BaseSound;

    private screenWidth!: number;
    private screenHeight!: number;

    private buttonActive: boolean;

    private fishArray: Fish[] = [];
    private stoveFishPending: boolean;

    private eventEmitter: EventEmitter;

    constructor() {
        super({ key: 'GameScene' });
        this.buttonActive = false;
        this.stoveFishPending = false;
        this.eventEmitter = new EventEmitter();

        this.eventEmitter.on('fishFried', () => {
            this.stoveFishPending = true;
        });
    }

    preload() {
        this.load.image('bear', 'assets/images/cute-bear.webp');
        this.load.image('background', 'assets/images/background.webp');
        this.load.image('splash', 'assets/images/splash.webp');
        this.load.image('fish', 'assets/images/fish.webp');
        this.load.image('stove', 'assets/images/stove.webp');
        this.load.image('steak', 'assets/images/steak.webp');

        this.load.audio('backgroundMusic', 'assets/audio/background.mp3');
        this.load.audio('moveSound', 'assets/audio/move.mp3');
        this.load.audio('splashSound', 'assets/audio/splash-sound.mp3');
        this.load.audio('pickSound', 'assets/audio/pick.mp3');

        this.load.image('actionButton', 'assets/interface/action-button.svg');
    }

    create() {
        this.screenWidth = this.cameras.main.width;
        this.screenHeight = this.cameras.main.height;

        const background = this.add.image(this.screenWidth / 2, this.screenHeight / 2, 'background');
        background.setDisplaySize(this.screenWidth, this.screenHeight);
        background.setDepth(-1)

        this.bear = this.add.sprite(this.screenWidth / 2, this.screenHeight / 2, 'bear');

        const buttonScale = 1.7;
        const actionButtonPaddingX = this.screenWidth * 0.05;
        const actionButtonPaddingY = this.screenHeight * 0.05;
        const actionButtonWidth = this.textures.get('actionButton').getSourceImage().width * buttonScale;
        const actionButtonHeight = this.textures.get('actionButton').getSourceImage().height * buttonScale;
        const finalX = this.screenWidth - actionButtonPaddingX - (actionButtonWidth / 2);
        const finalY = this.screenHeight - actionButtonPaddingY - (actionButtonHeight / 2);
        this.actionButton = this.add.sprite(finalX, finalY, 'actionButton').setScale(buttonScale);
        this.actionButton.setAlpha(0.9);
        this.actionButton.setInteractive();
        this.actionButton.on('pointerdown', this.onActionButtonClick, this);

        const splashVerticalOffset = this.screenHeight * 0.25;
        this.splash = this.add.sprite(this.screenWidth / 2, splashVerticalOffset, 'splash');
        this.splash.setScale(0.4);
        this.splash.setVisible(false);

        const stoveX = this.screenWidth * 0.8;
        const stoveY = this.screenHeight * 0.5;
        this.stove = this.add.sprite(stoveX, stoveY, 'stove').setScale(0.55);

        this.backgroundMusic = this.sound.add('backgroundMusic', {
            loop: true,
            volume: 0.2
        });
        this.backgroundMusic.play();

        this.moveSound = this.sound.add('moveSound', { volume: 1.0 });
        this.splashSound = this.sound.add('splashSound', { volume: 0.1 });
        this.pickSound = this.sound.add('pickSound', { volume: 1.0 });

        this.input.on('pointerdown', this.moveBear, this);

        this.setButtonActive(false);

        this.scheduleNextSplash(2500, 5000);
    }

    moveBear(pointer: Phaser.Input.Pointer) {
        if (this.isAnyFishDragging()) return;

        this.moveSound.play({ volume: 3.0 });
        this.tweens.add({
            targets: this.bear,
            x: pointer.x,
            y: pointer.y,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                this.moveSound.stop();
            }
        });
    }

    isAnyFishDragging(): boolean {
        return this.fishArray.some(fish => fish.isDragging);
    }

    setButtonActive(active: boolean) {
        this.buttonActive = active;
        this.actionButton.setAlpha(active ? 1 : 0.9);
        if (!active) {
            this.tweens.killTweensOf(this.actionButton);
        }
    }

    scheduleNextSplash(min: number, max: number) {
        const randomTime = Phaser.Math.Between(min, max);
        this.time.delayedCall(randomTime, this.showSplash, [], this);
    }

    showSplash() {
        this.splash.setPosition(this.screenWidth / 4, this.screenHeight - this.screenHeight / 4);
        this.splash.setVisible(true);
        this.backgroundMusic.pause();
        this.splashSound.play();

        this.setButtonActive(true);
    }

    onActionButtonClick(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) {
        if (this.buttonActive) {
            this.setButtonActive(false);
            event.stopPropagation();

            const distanceToSplash = Phaser.Math.Distance.Between(this.bear.x, this.bear.y, this.splash.x, this.splash.y);
            const distanceToStove = Phaser.Math.Distance.Between(this.bear.x, this.bear.y, this.stove.x, this.stove.y);
            const activationDistance = this.bear.displayHeight;

            if (distanceToSplash <= activationDistance && this.isSplashInteraction()) {
                this.handleSplashInteraction();
            } else if (distanceToStove <= activationDistance && this.isStoveInteraction()) {
                this.handleStoveInteraction();
            } else {
                console.log('Button clicked but no valid interaction found!');
            }
        }
    }

    isSplashInteraction(): boolean {
        return this.splash.visible;
    }

    isStoveInteraction(): boolean {
        return this.stoveFishPending;
    }

    handleSplashInteraction() {
        this.splash.setVisible(false);
        if (this.splashSound.isPlaying) {
            this.splashSound.stop();
        };
        this.backgroundMusic.resume();
        this.spawnFish();
        this.scheduleNextSplash(4000, 10000);
    }

    handleStoveInteraction() {
        this.setButtonActive(false);
        this.stoveFishPending = false;
        const friedFish = this.fishArray.find(fish => fish.state === 'steak' && !fish.visible);
        if (friedFish) {
            friedFish.setTexture('steak');
            friedFish.setVisible(true);
            friedFish.moveToBorder(false);
        }
    }

    spawnFish() {
        const fishOffsetX = Phaser.Math.Between(-50, 50);
        const fishOffsetY = Phaser.Math.Between(-50, 50);

        const fish = new Fish(this, this.bear.x + fishOffsetX, this.bear.y + fishOffsetY, 'fish', this.stove, this.screenHeight, this.screenWidth, this.eventEmitter, this.pickSound);
        this.fishArray.push(fish);

        fish.moveToBorder(false);
    }

    update() {
        const isActive = this.splash.visible || this.stoveFishPending;

        this.setButtonActive(isActive);

        const isBearBehind = this.bear.y > this.splash.y;
        this.bear.setDepth(isBearBehind ? 1 : 0);
        this.splash.setDepth(isBearBehind ? 0 : 1);
    }
}

export default GameScene;
