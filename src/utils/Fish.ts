import Phaser from 'phaser';
import eventEmitter from '../utils/EventEmitterModule'; // The centralized EventEmitter

class Fish extends Phaser.GameObjects.Sprite {
    isDragging: boolean;
    state: 'raw' | 'steak' | 'unbacked';
    private stove: Phaser.GameObjects.Sprite;
    private table: Phaser.GameObjects.Sprite;
    private screenHeight: number;
    private screenWidth: number;
    private pickSound: Phaser.Sound.BaseSound;
    private fryingSound: Phaser.Sound.BaseSound;
    private backingSound: Phaser.Sound.BaseSound;
    static stoveFishPending: boolean = false;
    static tableSteakPending: boolean = false;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        stove: Phaser.GameObjects.Sprite,
        table: Phaser.GameObjects.Sprite,
        screenHeight: number,
        screenWidth: number,
        pickSound: Phaser.Sound.BaseSound,
        fryingSound: Phaser.Sound.BaseSound,
        backingSound: Phaser.Sound.BaseSound,
    ) {
        super(scene, x, y, texture);
        this.scene = scene;
        this.isDragging = false;
        this.state = 'raw';
        this.stove = stove;
        this.table = table;
        this.screenHeight = screenHeight;
        this.screenWidth = screenWidth;
        this.pickSound = pickSound;
        this.fryingSound = fryingSound;
        this.backingSound = backingSound;
        scene.add.existing(this);
        this.setScale(0.3);
    }

    enableDragging() {
        this.setInteractive({ draggable: true });

        this.on('dragstart', (pointer: Phaser.Input.Pointer) => {
            if (this.scene.tweens.isTweening(this)) return;
            this.setScale(0.3);
            this.isDragging = true;
        });

        this.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            this.x = dragX;
            this.y = dragY;
        });

        this.on('dragend', (pointer: Phaser.Input.Pointer) => {
            this.isDragging = false;
            this.onDragEnd();
        });
    }

    onDragEnd() {
        if (Fish.stoveFishPending) {
            this.moveToBorder(false);
            return;
        }

        const fishBounds = this.getBounds();
        const stoveBounds = this.stove.getBounds();
        const tableBounds = this.table.getBounds();

        if (this.state === 'raw' && Phaser.Geom.Intersects.RectangleToRectangle(fishBounds, stoveBounds)) {
            this.fry();
        } else if (this.state === 'steak' && Phaser.Geom.Intersects.RectangleToRectangle(fishBounds, tableBounds)) {
            this.coverInDough();
        } else {
            this.moveToBorder(true);
        }
    }

    fry() {
        this.setVisible(false);
        Fish.stoveFishPending = true;
        this.state = 'steak';
        this.fryingSound.play();
        eventEmitter.emit('fishFried');
    }

    coverInDough() {
        this.setVisible(false);
        Fish.tableSteakPending = true;
        this.state = 'unbacked';
        this,this.backingSound.play()
        eventEmitter.emit('steakCovered');
    }

    moveToBorder(closest: boolean) {
        this.pickSound.play();

        const fishHeight = this.displayHeight / 2;
        const fishWidth = this.displayWidth / 2;

        const borderPositions = [
            { x: this.x, y: fishHeight }, // top border
            { x: this.x, y: this.screenHeight - fishHeight }, // bottom border
            { x: fishWidth, y: this.y }, // left border
            { x: this.screenWidth - fishWidth, y: this.y } // right border
        ];

        let targetPosition;
        if (closest) {
            let minDistance = Phaser.Math.Distance.Between(this.x, this.y, borderPositions[0].x, borderPositions[0].y);
            targetPosition = borderPositions[0];

            for (let i = 1; i < borderPositions.length; i++) {
                const distance = Phaser.Math.Distance.Between(this.x, this.y, borderPositions[i].x, borderPositions[i].y);
                if (distance < minDistance) {
                    minDistance = distance;
                    targetPosition = borderPositions[i];
                }
            }
        } else {
            targetPosition = Phaser.Math.RND.pick(borderPositions);
        }

        this.scene.tweens.add({
            targets: this,
            x: targetPosition.x,
            y: targetPosition.y,
            duration: 2000,
            ease: 'Power2',
            scale: 0.5,
            onComplete: () => {
                this.enableDragging();
            }
        });
    }
}

export default Fish;
