import Phaser from 'phaser';

class Fish extends Phaser.GameObjects.Sprite {
    isDragging: boolean;
    state: 'raw' | 'steak';
    private stove: Phaser.GameObjects.Sprite;
    private screenHeight: number;
    private screenWidth: number;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, stove: Phaser.GameObjects.Sprite, screenHeight: number, screenWidth: number) {
        super(scene, x, y, texture);
        this.scene = scene;
        this.isDragging = false;
        this.state = 'raw';
        this.stove = stove;
        this.screenHeight = screenHeight;
        this.screenWidth = screenWidth;
        scene.add.existing(this);
        this.setScale(0.3);
    }

    enableDragging() {
        this.setInteractive({ draggable: true });

        this.on('dragstart', (pointer: Phaser.Input.Pointer) => {
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
        const fishBounds = this.getBounds();
        const stoveBounds = this.stove.getBounds();

        if (this.state === 'raw' && Phaser.Geom.Intersects.RectangleToRectangle(fishBounds, stoveBounds)) {
            this.cook();
        } else {
            this.moveToBorder({ closest: true, enableDragging: true });
        }
    }

    cook() {
        this.setTexture('steak');
        this.state = 'steak';
    }

    moveToBorder({ closest = false, enableDragging = false }: { closest?: boolean, enableDragging?: boolean }) {
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
                if (enableDragging) {
                    this.enableDragging();
                }
            }
        });
    }
}

export default Fish;
