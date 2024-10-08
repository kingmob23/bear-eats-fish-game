import Phaser from 'phaser';
import eventEmitter from '../utils/EventEmitterModule'; // The centralized EventEmitter

class Fish extends Phaser.GameObjects.Sprite {
  isDragging: boolean;
  state: 'raw' | 'steak' | 'unbaked' | 'cake';
  private stove: Phaser.GameObjects.Sprite;
  private tableBounds: Phaser.Geom.Rectangle;
  private screenHeight: number;
  private screenWidth: number;
  private pickSound: Phaser.Sound.BaseSound;
  private fryingSound: Phaser.Sound.BaseSound;
  private backingSound: Phaser.Sound.BaseSound;
  static stovePending: boolean = false;
  static tableSteakPending: boolean = false;
  // private partyMode: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    stove: Phaser.GameObjects.Sprite,
    tableBounds: Phaser.Geom.Rectangle,
    screenHeight: number,
    screenWidth: number,
    pickSound: Phaser.Sound.BaseSound,
    fryingSound: Phaser.Sound.BaseSound,
    backingSound: Phaser.Sound.BaseSound,
  ) {
    super(scene, x, y, 'fish');
    this.scene = scene;
    this.isDragging = false;
    this.state = 'raw';
    this.stove = stove;
    this.tableBounds = tableBounds;
    this.screenHeight = screenHeight;
    this.screenWidth = screenWidth;
    this.pickSound = pickSound;
    this.fryingSound = fryingSound;
    this.backingSound = backingSound;
    scene.add.existing(this);
    this.setScale(0.3);
    this.enableDragging();
  }

  // setPartyMode() {
  //     this.partyMode = true;
  //     this.disableInteractive();
  //     console.log('setPartyMode: partyMode enabled');
  // }

  enableDragging() {
    // if (this.partyMode) {
    //     console.log('enableDragging: partyMode enabled, skipping enableDragging');
    //     return;
    // }

    this.setInteractive({ draggable: true });

    this.on('dragstart', () => {
      if (this.scene.tweens.isTweening(this)) {
        return;
      }
      this.isDragging = true;
      this.setScale(0.3);
      console.log('enableDragging: dragstart occurred');
    });

    this.on(
      'drag',
      (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        this.x = dragX;
        this.y = dragY;
      },
    );

    this.on('dragend', () => {
      this.isDragging = false;
      // console.log('onDragEnd event: partyMode=', this.partyMode);
      // if (!this.partyMode) {
      this.onDragEnd();
      // } else {
      // console.log('onDragEnd: partyMode enabled, skipping onDragEnd');
      // }
    });
  }

  onDragEnd() {
    // if (this.partyMode) {
    //     console.log('onDragEnd: partyMode enabled, skipping onDragEnd');
    //     return;
    // }

    const fishBounds = this.getBounds();
    const stoveBounds = this.stove.getBounds();

    if (
      this.state === 'raw' &&
      Phaser.Geom.Intersects.RectangleToRectangle(fishBounds, stoveBounds) &&
      !Fish.stovePending
    ) {
      this.fry();
    } else if (
      this.state === 'steak' &&
      Phaser.Geom.Intersects.RectangleToRectangle(fishBounds, this.tableBounds)
    ) {
      this.coverInDough();
    } else if (
      this.state === 'unbaked' &&
      Phaser.Geom.Intersects.RectangleToRectangle(fishBounds, stoveBounds) &&
      !Fish.stovePending
    ) {
      this.bake();
    } else {
      console.log('onDragEnd: moving to border');
      this.moveToBorder(true);
    }
  }

  fry() {
    this.setVisible(false);
    this.state = 'steak';
    this.fryingSound.play();
    eventEmitter.emit('fishFried');
  }

  coverInDough() {
    this.setVisible(false);
    this.state = 'unbaked';
    this.backingSound.play();
    eventEmitter.emit('steakCovered');
  }

  bake() {
    this.setVisible(false);
    this.state = 'cake';
    this.fryingSound.play();
    eventEmitter.emit('fishBaked');
  }

  moveToBorder(closest: boolean) {
    // if (this.partyMode) {
    //     console.log('moveToBorder: partyMode enabled, skipping moveToBorder');
    //     return;
    // }

    this.pickSound.play();

    const fishHeight = this.displayHeight / 2;
    const fishWidth = this.displayWidth / 2;

    const borderPositions = [
      { x: this.x, y: fishHeight }, // top border
      { x: this.x, y: this.screenHeight - fishHeight }, // bottom border
      { x: fishWidth, y: this.y }, // left border
      { x: this.screenWidth - fishWidth, y: this.y }, // right border
    ];

    let targetPosition;
    if (closest) {
      let minDistance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        borderPositions[0].x,
        borderPositions[0].y,
      );
      targetPosition = borderPositions[0];

      for (let i = 1; i < borderPositions.length; i++) {
        const distance = Phaser.Math.Distance.Between(
          this.x,
          this.y,
          borderPositions[i].x,
          borderPositions[i].y,
        );
        if (distance < minDistance) {
          minDistance = distance;
          targetPosition = borderPositions[i];
        }
      }
    } else {
      targetPosition = Phaser.Math.RND.pick(borderPositions);
    }

    console.log('moveToBorder: moving to ', targetPosition);

    this.scene.tweens.add({
      targets: this,
      x: targetPosition.x,
      y: targetPosition.y,
      duration: 2000,
      ease: 'Power2',
      scale: 0.5,
    });
  }
}

export default Fish;
