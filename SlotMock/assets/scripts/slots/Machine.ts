import Aux from '../SlotEnum';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Machine extends cc.Component {
  @property(cc.Node)
  public button: cc.Node = null;

  @property(cc.Prefab)
  public _reelPrefab = null;

  @property({ type: cc.Prefab })
  get reelPrefab(): cc.Prefab {
    return this._reelPrefab;
  }

  set reelPrefab(newPrefab: cc.Prefab) {
    this._reelPrefab = newPrefab;
    this.node.removeAllChildren();

    if (newPrefab !== null) {
      this.createMachine();
    }
  }

  @property({ type: cc.Integer })
  public _numberOfReels = 3;

  @property({ type: cc.Integer, range: [3, 6], slide: true })
  get numberOfReels(): number {
    return this._numberOfReels;
  }

  set numberOfReels(newNumber: number) {
    this._numberOfReels = newNumber;

    if (this.reelPrefab !== null) {
      this.createMachine();
    }
  }

  private reels = [];

  public spinning = false;

  createMachine(): void {
    this.node.destroyAllChildren();
    this.reels = [];

    let newReel: cc.Node;
    for (let i = 0; i < this.numberOfReels; i += 1) {
      newReel = cc.instantiate(this.reelPrefab);
      this.node.addChild(newReel);
      this.reels[i] = newReel;

      const reelScript = newReel.getComponent('Reel');
      reelScript.shuffle();
      reelScript.reelAnchor.getComponent(cc.Layout).enabled = false;
    }
    this.node.getComponent(cc.Widget).updateAlignment();
  }

  spin(): void {
    this.spinning = true;
    this.button.getChildByName('Label').getComponent(cc.Label).string = 'STOP';

    for (let i = 0; i < this.numberOfReels; i += 1) {
      const theReel = this.reels[i].getComponent('Reel');

      for(let j=0;j<theReel.tiles.length;j++){
        theReel.tiles[j].getComponent('Tile').stopGlow(); //Stop the glow effect of every tile
      }

      if (i % 2) {
        theReel.spinDirection = Aux.Direction.Down;
      } else {
        theReel.spinDirection = Aux.Direction.Up;
      }

      theReel.doSpin(0.03 * i);
    }
  }

  getResult(){ //Returns the number of winner lines, between 0 and 3, based on chance of success
    const resultPercent = Math.floor(Math.random() * 100) + 1; //Generates a random number between 1 and 100
    let winnerLines;

    if(resultPercent <= 7){ //7% chance of 3 winner lines
      winnerLines = 3

    }else if(resultPercent <= 17){ //10% chance of 2 winner lines
      winnerLines = 2

    }else if(resultPercent <= 50){ //33% chance of 1 winner line
      winnerLines = 1

    }else{ //50% chance of no winner line
      winnerLines = 0;
    }
    console.log(winnerLines);
    return winnerLines;
  }

  getWinnerLines(){ //Randomize wich lines will show the winner result
    let slotResult = this.createRandomLines();
    const result = this.getResult();
    const lines = [2, 3, 4]; //Array of possible winner lines

    if(result != 0){ //If there are no winner lines, return an empty array

      for(let i=0; i<result; i++){ //For each winner line, randomize the line where it will be and add the line on the slot result
        let winnerLineIndex = Math.floor(Math.random()*lines.length);
        const winnerLine = lines[winnerLineIndex];
        lines.splice(winnerLineIndex, 1); //Removes the chosen line from the lines array, so the next one will be different
        slotResult = this.createWinnerLine(slotResult, winnerLine);

      }
    return slotResult;
    
    }else{
      return []

    }
  }

  createWinnerLine(slotResult, winnerLine){ //Change the tiles from the winner line with the chosen texture.
    const winnerTexture = this.getRandomTexture();

    for(let i=0;i<5;i++){
      
      if(i%2){
        slotResult[i][winnerLine] = {"texture": winnerTexture, "winnerTile": true}; //Add the winner texture to the tile and set winner as true
      }else{
        slotResult[i][winnerLine - 2] = {"texture": winnerTexture, "winnerTile": true};
      }
    }

    return slotResult;
  }

  createRandomLines(){ //Create an initial slot result with random values without any winner line
    const randomReels = [];

    for(let i=0;i<5;i++){
      const randomReel = []
      for(let j=0;j<5;j++){
        randomReel.push({"texture": this.getRandomTexture(), "winnerTile": false});
      }
      randomReels.push(randomReel);
    }

    let finalRandomReels = this.removeFalseWinnerLines(randomReels);
    return finalRandomReels;
  }

  removeFalseWinnerLines(randomSlotResult){ //Check if there are winner lines on the random result and remove it

    for(let i=2;i<5;i++){
      let line = []; //Creates an array wich will receive the texture values of this line
      for(let j=0;j<5;j++){
        if(j%2){
          line.push(randomSlotResult[j][i]["texture"]); 
        }else{
          line.push(randomSlotResult[j][i-2]["texture"]);
        }
      }
      let allEqual = arr => arr.every( v => v === arr[0]); //Check if the values of the array are all the same

      if(allEqual(line)){
        randomSlotResult = this.removeFalseWinnerLine(randomSlotResult, i);
      }
    }
    return randomSlotResult;
  }

  removeFalseWinnerLine(randomSlotResult, falseWinnerLine){ //Get the slot result with the false winner line and change a random tile of the line with a new random texture
    const randomReel = Math.floor(Math.random()*5);
    const textures = this.reels[0].getComponent('Reel').tiles[0].getComponent('Tile').getTexturesIds();

    if(randomReel%2){
      falseWinnerLine = falseWinnerLine;
    }else{
      falseWinnerLine = falseWinnerLine - 2;
    }

    textures.splice(randomSlotResult[randomReel][falseWinnerLine], 1); //Removes the texture of the tile from the array, so it wont get the same texture again
    const newTexture = textures[Math.floor(Math.random()*textures.length)]; //Randomize the new texture of the tile
    randomSlotResult[randomReel][falseWinnerLine] = {"texture": newTexture, "winnerTile": false};
    
    return randomSlotResult;
  }

  getRandomTexture(){ //Returns a random texture id
    const textures = this.reels[0].getComponent('Reel').tiles[0].getComponent('Tile').getTexturesIds();
    let randomTexture = Math.floor(Math.random()*textures.length);

    return textures[randomTexture];
  }

  lock(): void {
    this.button.getComponent(cc.Button).interactable = false;
  }

  stop(result: Array<Array<number>> = null): void {
    setTimeout(() => {
      this.spinning = false;
      this.button.getComponent(cc.Button).interactable = true;
      this.button.getChildByName('Label').getComponent(cc.Label).string = 'SPIN';
    }, 2500);

    const rngMod = Math.random() / 2;
    for (let i = 0; i < this.numberOfReels; i += 1) {

      const spinDelay = i < 2 + rngMod ? i / 4 : rngMod * (i - 2) + i / 4;
      const theReel = this.reels[i].getComponent('Reel');
      
      setTimeout(() => {
        theReel.readyStop(result[i]);
      }, spinDelay * 1000);
    }
    
  }
}
