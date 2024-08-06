import Phaser from 'phaser';

export function createBackground(scene: Phaser.Scene, screenWidth: number, screenHeight: number): void {
    const background = scene.add.image(screenWidth / 2, screenHeight / 2, 'background');
    background.setDisplaySize(screenWidth, screenHeight);
    background.setDepth(-1);
}

export function createBear(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Sprite {
    const bear = scene.add.sprite(x, y, 'bear');
    bear.setDepth(2);
    return bear;
}

export function createActionButton(
    scene: Phaser.Scene,
    screenWidth: number,
    screenHeight: number,
    callback: (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) => void
): Phaser.GameObjects.Sprite {
    const buttonScale = 1.7;
    const actionButtonPaddingX = screenWidth * 0.05;
    const actionButtonPaddingY = screenHeight * 0.05;
    const actionButtonWidth = scene.textures.get('actionButton').getSourceImage().width * buttonScale;
    const actionButtonHeight = scene.textures.get('actionButton').getSourceImage().height * buttonScale;
    const finalX = screenWidth - actionButtonPaddingX - (actionButtonWidth / 2);
    const finalY = screenHeight - actionButtonPaddingY - (actionButtonHeight / 2);

    const actionButton = scene.add.sprite(finalX, finalY, 'actionButton').setScale(buttonScale);
    actionButton.setAlpha(0.9);
    actionButton.setInteractive();
    actionButton.setDepth(3);
    actionButton.on('pointerdown', callback, scene);

    return actionButton;
}

export function createSplash(scene: Phaser.Scene, screenWidth: number, screenHeight: number): Phaser.GameObjects.Sprite {
    const splashVerticalOffset = screenHeight * 0.25;
    const splash = scene.add.sprite(screenWidth / 2, splashVerticalOffset, 'splash');
    splash.setScale(0.4);
    splash.setVisible(false);
    splash.setDepth(1);
    return splash;
}

export function createStove(scene: Phaser.Scene, screenWidth: number, screenHeight: number): Phaser.GameObjects.Sprite {
    const stoveX = screenWidth * 0.8;
    const stoveY = screenHeight * 0.5;
    const stove = scene.add.sprite(stoveX, stoveY, 'stove').setScale(0.55);
    stove.setDepth(0);
    return stove;
}

export function createTable(scene: Phaser.Scene, screenWidth: number, screenHeight: number): Phaser.GameObjects.Sprite {
    const tableX = screenWidth * 0.14;
    const tableY = screenHeight * 0.57;
    const table = scene.add.sprite(tableX, tableY, 'table').setScale(0.4);
    table.setDepth(0);
    return table;
}

export function createSounds(scene: Phaser.Scene): {
    backgroundMusic: Phaser.Sound.BaseSound,
    moveSound: Phaser.Sound.BaseSound,
    splashSound: Phaser.Sound.BaseSound,
    pickSound: Phaser.Sound.BaseSound,
    fryingSound: Phaser.Sound.BaseSound,
    backingSound: Phaser.Sound.BaseSound,
} {
    const backgroundMusic = scene.sound.add('backgroundMusic', {
        loop: true,
        volume: 0.2
    });

    const moveSound = scene.sound.add('moveSound', { volume: 1.0 });
    const splashSound = scene.sound.add('splashSound', { volume: 0.1 });
    const pickSound = scene.sound.add('pickSound', { volume: 1.0 });
    const fryingSound = scene.sound.add('fryingSound', { volume: 0.3 });
    const backingSound = scene.sound.add('backingSound', { volume: 1.0 });

    return {
        backgroundMusic,
        moveSound,
        splashSound,
        pickSound,
        fryingSound,
        backingSound,
    };
}
