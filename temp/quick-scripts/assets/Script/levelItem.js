(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Script/levelItem.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'ae408IqDF5DFo8na+52hGjt', 'levelItem', __filename);
// Script/levelItem.js

"use strict";

cc.Class({
    extends: cc.Component,
    properties: {
        starImg: cc.Node,
        itemBg: cc.Node,
        levelTxt: cc.Node
    },

    onLoad: function onLoad() {},

    showStar: function showStar(isOpen, starCount, levelImgAtlas, level) {
        this.itemBg.attr({ "_level_": level });
        if (isOpen) {
            this.itemBg.getComponent(cc.Sprite).spriteFrame = levelImgAtlas.getSpriteFrame("pass_bg");
            this.starImg.active = true;
            this.starImg.getComponent(cc.Sprite).spriteFrame = levelImgAtlas.getSpriteFrame("point" + starCount);
            this.levelTxt.opacity = 255;
            this.itemBg.getComponent(cc.Button).interactable = true;
        } else {
            this.itemBg.getComponent(cc.Sprite).spriteFrame = levelImgAtlas.getSpriteFrame("lock");
            this.starImg.active = false;
            this.levelTxt.opacity = 125;
            this.itemBg.getComponent(cc.Button).interactable = false;
        }
        this.levelTxt.getComponent(cc.Label).string = level;
    },


    btnCallBack: function btnCallBack(event, customEventData) {
        if (this._callfunc) {
            this._callfunc(this.itemBg._level_);
        }
    },

    levelFunc: function levelFunc(callfunc) {
        this._callfunc = callfunc;
    }
});

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=levelItem.js.map
        