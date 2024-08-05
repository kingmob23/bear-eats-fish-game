import Phaser from 'phaser';

class GameScene extends Phaser.Scene {
    private bear!: Phaser.GameObjects.Sprite;
    private actionButton!: Phaser.GameObjects.Sprite;
    private splash!: Phaser.GameObjects.Sprite;
    private fish!: Phaser.GameObjects.Sprite;

    private backgroundMusic!: Phaser.Sound.BaseSound;
    private moveSound!: Phaser.Sound.BaseSound;
    private splashSound!: Phaser.Sound.BaseSound;

    private buttonActive: boolean;
    private screenWidth!: number;
    private screenHeight!: number;
    private isDraggingFish: boolean = false;

    constructor() {
        super({ key: 'GameScene' });
        this.buttonActive = false;
    }


    preload() {
        this.load.image('bear', 'assets/images/cute-bear.webp');
        this.load.image('background', 'assets/images/background.webp');
        this.load.image('splash', 'assets/images/splash.webp');
        this.load.image('fish', 'assets/images/fish.webp');

        this.load.audio('backgroundMusic', 'assets/audio/background.mp3');
        this.load.audio('moveSound', 'assets/audio/move.mp3');
        this.load.audio('splashSound', 'assets/audio/splash-sound.mp3');

        this.load.image('actionButton', 'assets/interface/action-button.svg');
    }

    create() {
        this.screenWidth = this.cameras.main.width;
        this.screenHeight = this.cameras.main.height;

        const background = this.add.image(this.screenWidth / 2, this.screenHeight / 2, 'background');
        background.setDisplaySize(this.screenWidth, this.screenHeight);

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

        this.backgroundMusic = this.sound.add('backgroundMusic', {
            loop: true,
            volume: 0.2
        });
        this.backgroundMusic.play();

        this.moveSound = this.sound.add('moveSound', { volume: 1.0 });
        this.splashSound = this.sound.add('splashSound', { volume: 0.1 });

        this.input.on('pointerdown', this.moveBear, this);

        this.setButtonActive(false);
        this.scheduleNextSplash(3000, 10000);
    }

    moveBear(pointer: Phaser.Input.Pointer) {
        if (!pointer || this.buttonActive || this.isDraggingFish) return;

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

    setButtonActive(active: boolean) {
        this.buttonActive = active;
        this.actionButton.setAlpha(active ? 1 : 0.9);
        if (!active) {
            this.tweens.killTweensOf(this.actionButton);
        }
    }

    scheduleNextSplash(min: integer, max: integer) {
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
            event.stopPropagation();
            if (this.isSplashInteraction()) {
                this.handleSplashInteraction();
            } else {
                console.log('Button clicked!');
                // Placeholder for future interactions
            }
        }
    }

    isSplashInteraction(): boolean {
        return this.splash.visible;
    }

    handleSplashInteraction() {
        this.splash.setVisible(false);
        if (this.splashSound.isPlaying) {
            this.splashSound.stop();
        }
        this.backgroundMusic.resume();
        this.setButtonActive(false);
        this.spawnFish();
        this.scheduleNextSplash(5000, 20000);
    }

    spawnFish() {
        const fishOffsetX = Phaser.Math.Between(-50, 50);
        const fishOffsetY = Phaser.Math.Between(-50, 50);

        this.fish = this.add.sprite(this.bear.x + fishOffsetX, this.bear.y + fishOffsetY, 'fish');
        this.fish.setScale(0.25);

        const fishHeight = this.fish.displayHeight / 2;
        const fishWidth = this.fish.displayWidth / 2;

        const borderPositions = [
            { x: Phaser.Math.Between(fishWidth, this.screenWidth - fishWidth), y: fishHeight },
            { x: Phaser.Math.Between(fishWidth, this.screenWidth - fishWidth), y: this.screenHeight - fishHeight },
            { x: fishWidth, y: Phaser.Math.Between(fishHeight, this.screenHeight - fishHeight) },
            { x: this.screenWidth - fishWidth, y: Phaser.Math.Between(fishHeight, this.screenHeight - fishHeight) }
        ];

        const targetPosition = Phaser.Math.RND.pick(borderPositions);

        this.tweens.add({
            targets: this.fish,
            x: targetPosition.x,
            y: targetPosition.y,
            duration: 2000,
            ease: 'Power2',
            scale: 0.5,
            onComplete: () => {
                this.enableFishDragging(this.fish);
            }
        });
    }

    enableFishDragging(fish: Phaser.GameObjects.Sprite) {
        fish.setInteractive({ draggable: true });

        fish.on('dragstart', (pointer: Phaser.Input.Pointer) => {
            this.isDraggingFish = true;
            this.tweens.add({
                targets: fish,
                scale: 0.3,
                duration: 200,
                ease: 'Power2'
            });
        });

        fish.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            fish.x = dragX;
            fish.y = dragY;
        });

        fish.on('dragend', (pointer: Phaser.Input.Pointer) => {
            this.isDraggingFish = false;

            const fishHeight = fish.displayHeight / 2;
            const fishWidth = fish.displayWidth / 2;

            const positions = [
                { x: fish.x, y: fishHeight }, // top border
                { x: fish.x, y: this.screenHeight - fishHeight }, // bottom border
                { x: fishWidth, y: fish.y }, // left border
                { x: this.screenWidth - fishWidth, y: fish.y } // right border
            ];

            let closestPosition = positions[0];
            let minDistance = Phaser.Math.Distance.Between(fish.x, fish.y, positions[0].x, positions[0].y);

            for (let i = 1; i < positions.length; i++) {
                const distance = Phaser.Math.Distance.Between(fish.x, fish.y, positions[i].x, positions[i].y);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestPosition = positions[i];
                }
            }

            this.tweens.add({
                targets: fish,
                x: closestPosition.x,
                y: closestPosition.y,
                scale: 0.5,
                duration: 500,
                ease: 'Power2'
            });
        });
    }

    update() {
        if (this.splash.visible) {
            const distance = Phaser.Math.Distance.Between(
                this.bear.x, this.bear.y,
                this.splash.x, this.splash.y
            );
            const activationDistance = this.splash.displayHeight;
            const isActive = distance <= activationDistance;
            this.setButtonActive(isActive);

            const isBearBehind = this.bear.y > this.splash.y;
            this.bear.setDepth(isBearBehind ? 1 : 0);
            this.splash.setDepth(isBearBehind ? 0 : 1);
        }
    }
}

export default GameScene;
