

cc.Class({
    extends: cc.Component,
    properties: {
        starImg : cc.Node,
        itemBg : cc.Node,
        levelTxt : cc.Node,
    },

    onLoad : function (){
        
    },

    showStar(isOpen, starCount, levelImgAtlas, level){
        this.itemBg.attr({"_level_" : level});
        if(isOpen){
            this.itemBg.getComponent(cc.Sprite).spriteFrame = levelImgAtlas.getSpriteFrame("pass_bg");
            this.starImg.active = true;
            this.starImg.getComponent(cc.Sprite).spriteFrame = levelImgAtlas.getSpriteFrame("point" + starCount);
            this.levelTxt.opacity = 255;
            this.itemBg.getComponent(cc.Button).interactable = true;
        }
        else{
            this.itemBg.getComponent(cc.Sprite).spriteFrame = levelImgAtlas.getSpriteFrame("lock");
            this.starImg.active = false;
            this.levelTxt.opacity = 125;
            this.itemBg.getComponent(cc.Button).interactable = false;
        }
        this.levelTxt.getComponent(cc.Label).string = level;
    },

    btnCallBack : function(event, customEventData){
        if(this._callfunc){
            this._callfunc(this.itemBg._level_);
        }
    },

    levelFunc : function(callfunc){
        this._callfunc = callfunc;
    }
});
