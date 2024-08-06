import Phaser from 'phaser';
import eventEmitter from '../utils/EventEmitterModule';
import Fish from '../utils/Fish';
import { createActionButton, createBackground, createBear, createSounds, createSplash, createStove, createTable } from '../utils/SetupUtils';

class GameScene extends Phaser.Scene {
    private background!: Phaser.GameObjects.Sprite;
    private bear!: Phaser.GameObjects.Sprite;
    private actionButton!: Phaser.GameObjects.Sprite;
    private splash!: Phaser.GameObjects.Sprite;
    private stove!: Phaser.GameObjects.Sprite;
    private table!: Phaser.GameObjects.Sprite;

    private backgroundMusic!: Phaser.Sound.BaseSound;
    private moveSound!: Phaser.Sound.BaseSound;
    private splashSound!: Phaser.Sound.BaseSound;
    private pickSound!: Phaser.Sound.BaseSound;
    private fryingSound!: Phaser.Sound.BaseSound;
    private backingSound!: Phaser.Sound.BaseSound;
    private cakeSound!: Phaser.Sound.BaseSound;

    private screenWidth: number = 0;
    private screenHeight: number = 0;

    private buttonActive: boolean = false;

    private fishArray: Fish[] = [];
    private activationDistance: number = 0;

    constructor() {
        super({ key: 'GameScene' });
        this.buttonActive = false;

        eventEmitter.on('fishFried', this.handleFishFried);
        eventEmitter.on('steakCovered', this.handleSteakCovered);
        eventEmitter.on('fishBaked', this.handleFishBaked);
    }

    handleFishFried = () => {
        Fish.stovePending = true;
    };

    handleSteakCovered = () => {
        Fish.tableSteakPending = true;
    };

    handleFishBaked = () => {
        Fish.stovePending = true;
    };

    preload() {
        this.load.image('bear', 'assets/images/cute-bear.webp');
        this.load.image('background', 'assets/images/background.webp');
        this.load.image('splash', 'assets/images/splash.webp');

        this.load.image('fish', 'assets/images/fish.webp');
        this.load.image('steak', 'assets/images/steak.webp');
        this.load.image('unbaked', 'assets/images/unbaked.webp');
        this.load.image('cake', 'assets/images/cake.webp');

        this.load.image('stove', 'assets/images/stove.webp');
        this.load.image('table', 'assets/images/table.webp');

        this.load.audio('backgroundMusic', 'assets/audio/background.mp3');
        this.load.audio('moveSound', 'assets/audio/move.mp3');
        this.load.audio('splashSound', 'assets/audio/splash-sound.mp3');
        this.load.audio('pickSound', 'assets/audio/pick.mp3');
        this.load.audio('fryingSound', 'assets/audio/frying.mp3');
        this.load.audio('backingSound', 'assets/audio/backing.mp3');
        this.load.audio('cakeSound', 'assets/audio/cake.mp3');

        this.load.image('actionButton', 'assets/interface/action-button.svg');
    }

    create() {
        this.screenWidth = this.cameras.main.width;
        this.screenHeight = this.cameras.main.height;

        this.background = createBackground(this, this.screenWidth, this.screenHeight);

        this.bear = createBear(this, this.screenWidth / 2, this.screenHeight / 2);

        this.activationDistance = this.bear.displayHeight;

        this.actionButton = createActionButton(this, this.screenWidth, this.screenHeight, this.onActionButtonClick.bind(this));

        this.splash = createSplash(this, this.screenWidth, this.screenHeight);
        this.stove = createStove(this, this.screenWidth, this.screenHeight);
        this.table = createTable(this, this.screenWidth, this.screenHeight)

        const sounds = createSounds(this);
        this.backgroundMusic = sounds.backgroundMusic;
        this.moveSound = sounds.moveSound;
        this.splashSound = sounds.splashSound;
        this.pickSound = sounds.pickSound;
        this.fryingSound = sounds.fryingSound;
        this.backingSound = sounds.backingSound;
        this.cakeSound = sounds.cakeSound;

        this.backgroundMusic.play();

        this.input.on('pointerdown', this.moveBear, this);

        this.setButtonActive(false);
        this.scheduleNextSplash(2500, 5000);
    }

    moveBear(pointer: Phaser.Input.Pointer) {
        if (this.isAnyFishDragging()) return;

        try {
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
        } catch (error) {
            console.error('Error moving bear:', error);
        }
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

            const distanceToSplash = Phaser.Math.Distance.Between(
                this.bear.x, this.bear.y,
                this.splash.x, this.splash.y
            );
            const distanceToStove = Phaser.Math.Distance.Between(
                this.bear.x, this.bear.y,
                this.stove.x, this.stove.y
            );
            const distanceToTable = Phaser.Math.Distance.Between(
                this.bear.x, this.bear.y,
                this.table.x, this.table.y
            );

            if (distanceToSplash <= this.activationDistance && this.splash.visible) {
                this.handleSplashInteraction();
            } else if (distanceToStove <= this.activationDistance && Fish.stovePending) {
                this.handleStoveInteraction();
            } else if (distanceToTable <= this.activationDistance && Fish.tableSteakPending) {
                this.handleTableInteraction();
            } else {
                console.log('Button clicked but no valid interaction found!');
            }
        }
    }

    handleSplashInteraction() {
        this.splash.setVisible(false);
        if (this.splashSound.isPlaying) {
            this.splashSound.stop();
        }
        this.backgroundMusic.resume();
        this.spawnFish();
        this.scheduleNextSplash(4000, 10000);
    }

    handleStoveInteraction() {
        this.setButtonActive(false);
        Fish.stovePending = false;

        const friedFish = this.fishArray.find(fish => fish.state === 'steak' && !fish.visible);
        if (friedFish) {
            friedFish.setTexture('steak');
            friedFish.setVisible(true);
            friedFish.moveToBorder(false);
            if (this.fryingSound.isPlaying) {
                this.fryingSound.stop();
            }
            return;
        }

        const bakedFish = this.fishArray.find(fish => fish.state === 'cake' && !fish.visible);
        if (bakedFish) {
            bakedFish.setTexture('cake');
            bakedFish.setVisible(true);
            if (this.backingSound.isPlaying) {
                this.backingSound.stop();
            }
            this.party();
        }
    }

    party() {
        this.children.each((child) => {
            if (child !== this.background && child !== this.bear && child !== this.actionButton && !(child instanceof Fish && child.state === 'cake')) {
                child.destroy();
            }
        });

        if (this.moveSound.isPlaying) this.moveSound.stop();
        if (this.splashSound.isPlaying) this.splashSound.stop();
        if (this.pickSound.isPlaying) this.pickSound.stop();
        if (this.fryingSound.isPlaying) this.fryingSound.stop();
        if (this.backingSound.isPlaying) this.backingSound.stop();
        if (this.backgroundMusic.isPlaying) this.backgroundMusic.stop();

        this.cakeSound.play();

        this.tweens.add({
            targets: this.bear,
            x: this.screenWidth / 2 - this.bear.width * 2,
            y: this.screenHeight / 2,
            duration: 300,
            ease: 'Power3',
            scale: 3.0,
        });

        let fish = this.fishArray.find(f => f.state === 'cake');
        if (fish) {
            fish.setPartyMode();
            this.tweens.add({
                targets: fish,
                x: this.screenWidth / 2 + fish.width,
                y: this.screenHeight / 2,
                duration: 300,
                ease: 'Power3',
                scale: 1.0,
            });
        }
    }

    handleTableInteraction() {
        Fish.tableSteakPending = false;
        const steak = this.fishArray.find(fish => fish.state === 'unbaked' && !fish.visible);
        if (steak) {
            steak.setTexture('unbaked');
            steak.setVisible(true);
            steak.moveToBorder(false);
            if (this.backingSound.isPlaying) {
                this.backingSound.stop();
            }
        }
    }

    spawnFish() {
        try {
            const fishOffsetX = Phaser.Math.Between(-50, 50);
            const fishOffsetY = Phaser.Math.Between(-50, 50);
            const tableBounds = this.table.getBounds();

            const fish = new Fish(
                this,
                this.bear.x + fishOffsetX,
                this.bear.y + fishOffsetY,
                this.stove,
                tableBounds,
                this.screenHeight,
                this.screenWidth,
                this.pickSound,
                this.fryingSound,
                this.backingSound,
                this.moveBear.bind(this)
            );
            this.fishArray.push(fish);

            fish.moveToBorder(false);
        } catch (error) {
            console.error('Error spawning fish:', error);
        }
    }

    update() {
        const isActive = this.splash.visible || Fish.stovePending || Fish.tableSteakPending;
        this.setButtonActive(isActive);

        this.bear.setDepth(this.bear.y > this.splash.y ? 2 : 1);
        this.splash.setDepth(this.bear.y > this.splash.y ? 1 : 2);
    }

    destroy() {
        eventEmitter.off('fishFried', this.handleFishFried);
        eventEmitter.off('steakCovered', this.handleSteakCovered);
        eventEmitter.off('fishBaked', this.handleFishBaked)
    }
}

export default GameScene;
