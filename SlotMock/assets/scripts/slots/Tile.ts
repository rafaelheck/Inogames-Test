const { ccclass, property } = cc._decorator;

@ccclass
export default class Tile extends cc.Component {
  @property({ type: [cc.SpriteFrame], visible: true })
  private textures = [];

  async onLoad(): Promise<void> {
    await this.loadTextures();
  }

  async resetInEditor(): Promise<void> {
    await this.loadTextures();
    this.setRandom();
  }

  async loadTextures(): Promise<boolean> {
    const self = this;
    return new Promise<boolean>(resolve => {
      cc.loader.loadResDir('gfx/Square', cc.SpriteFrame, function afterLoad(err, loadedTextures) {
        self.textures = loadedTextures;
        resolve(true);
      });
    });
  }

  setTile(index: number): void {
    this.node.getComponent(cc.Sprite).spriteFrame = this.textures[index];
  }

  setRandom(): void {
    const randomIndex = Math.floor(Math.random() * this.textures.length);
    this.setTile(randomIndex);
  }

  getTexturesIds(){ //Returns the ids list of possible textures
    const texturesIds = [];

    for(let i=0; i<this.textures.length; i++){
      texturesIds.push(i);
    }
    return texturesIds;
  }
  
  startGlow(){ //Start the glow effect on this tile
    const glow = this.node.getChildByName("glow").active = true;
  }

  stopGlow(){ //Stop the glow effect on this tile
    const glow = this.node.getChildByName("glow").active = false;
  }
}