(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Script/gameLayer.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '8bdddCze2RD97IUN7F/EblH', 'gameLayer', __filename);
// Script/gameLayer.js

"use strict";

var boxType = {
    NONE: 0,
    WALL: 1,
    LAND: 2,
    BODY: 3,
    BOX: 4,
    ENDBOX: 5,
    HERO: 6
};

var sound = {
    BUTTON: "Texture/sound/button",
    GAMEWIN: "Texture/sound/gamewin",
    MOVE: "Texture/sound/move",
    PUSHBOX: "Texture/sound/pushbox",
    WRONG: "Texture/sound/wrong"
};

cc.Class({
    extends: cc.Component,

    properties: {
        bg: cc.Node,
        menuLayer: cc.Node,
        levelLayer: cc.Node,
        gameLayer: cc.Node,
        gameControlLayer: cc.Node,
        gameOverLayer: cc.Node,

        startBtn: cc.Node,
        titleImg: cc.Node,
        iconImg: cc.Node,
        loadingTxt: cc.Node,

        levelScroll: cc.Node,
        levelContent: cc.Node,

        levelTxt: cc.Node,
        curNum: cc.Node,
        bestNum: cc.Node,

        itemImgAtlas: cc.SpriteAtlas,
        levelImgAtlas: cc.SpriteAtlas,

        levelItemPrefab: cc.Prefab
    },

    onLoad: function onLoad() {
        this.curLayer = 0;
        this.clearGameData();
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        this.initData();
        this.menuLayer.active = true;
        this.levelLayer.active = false;
        this.gameLayer.active = false;
        this.gameOverLayer.active = false;
        this.loadingTxt.active = true;
        this.startBtn.getComponent(cc.Button).interactable = false;
        this.menuLayerAni();
    },

    initData: function initData() {
        this.boxWidth = 90;
        this.boxHeight = 90;
        this.allWidth = 720;
        this.allHeight = 1280;
        this.allRow = 8;
        this.allCol = 8;

        this.allLevelCount = 0;
        this.allLevelConfig = {};
        cc.loader.loadRes('levelConfig.json', function (err, object) {
            if (err) {
                console.log(err);
                return;
            }
            this.allLevelConfig = object.json.level;
            this.allLevelCount = object.json.levelCount;
            this.loadingTxt.active = false;
            this.startBtn.getComponent(cc.Button).interactable = true;
            this.createLavelItem();
        }.bind(this));

        this.tabLevel = [];
    },
    onKeyDown: function onKeyDown(event) {
        var macro = cc.macro;
        switch (event.keyCode) {
            case macro.KEY.a:
            case macro.KEY.left:
                this.runHero("left");
                break;
            case macro.KEY.d:
            case macro.KEY.right:
                this.runHero("right");
                break;
            case macro.KEY.w:
            case macro.KEY.up:
                this.runHero("up");
                break;
            case macro.KEY.s:
            case macro.KEY.down:
                this.runHero("down");
                break;
        }
    },
    createLavelItem: function createLavelItem() {
        var _this = this;

        var callfunc = function callfunc(level) {
            _this.selectLevelCallBack(level);
        };

        for (var i = 0; i < this.allLevelCount; i++) {
            var node = cc.instantiate(this.levelItemPrefab);
            node.parent = this.levelScroll;
            var levelItem = node.getComponent("levelItem");
            levelItem.levelFunc(callfunc);
            this.tabLevel.push(levelItem);
        }
        this.levelContent.height = Math.ceil(this.allLevelCount / 5) * 135 + 20;
    },
    updateLevelInfo: function updateLevelInfo() {
        var finishLevel = parseInt(cc.sys.localStorage.getItem("finishLevel") || 0);
        for (var i = 1; i <= this.allLevelCount; i++) {
            if (i <= finishLevel) {
                var data = parseInt(cc.sys.localStorage.getItem("levelStar" + i) || 0);
                this.tabLevel[i - 1].showStar(true, data, this.levelImgAtlas, i);
            } else if (i == finishLevel + 1) {
                this.tabLevel[i - 1].showStar(true, 0, this.levelImgAtlas, i);
            } else {
                this.tabLevel[i - 1].showStar(false, 0, this.levelImgAtlas, i);
            }
        }
    },
    menuLayerAni: function menuLayerAni() {
        this.startBtn.scale = 1.0;
        this.startBtn.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.6, 1.5), cc.scaleTo(0.6, 1.0))));
    },
    startBtnCallBack: function startBtnCallBack(event, customEventData) {
        var _this2 = this;

        if (this.curLayer == 1) {
            return;
        }
        this.curLayer = 1;

        this.playSound(sound.BUTTON);

        this.menuLayer.runAction(cc.sequence(cc.fadeOut(0.1), cc.callFunc(function () {
            _this2.startBtn.stopAllActions();
            _this2.startBtn.scale = 1.0;
            _this2.menuLayer.opacity = 255;
            _this2.menuLayer.active = false;
        })));

        this.levelLayer.active = true;
        this.levelLayer.opacity = 0;
        this.levelLayer.runAction(cc.sequence(cc.delayTime(0.1), cc.fadeIn(0.1), cc.callFunc(function () {
            _this2.updateLevelInfo();
        })));
    },


    levelBackCallBack: function levelBackCallBack(event, customEventData) {
        if (this.curLayer == 0) {
            return;
        }
        this.playSound(sound.BUTTON);
        this.curLayer = 0;
        this.levelLayer.runAction(cc.sequence(cc.fadeOut(0.1), cc.callFunc(function () {
            this.levelLayer.opacity = 255;
            this.levelLayer.active = false;
        }, this)));

        this.menuLayer.active = true;
        this.menuLayer.opacity = 0;
        this.menuLayer.runAction(cc.sequence(cc.delayTime(0.1), cc.fadeIn(0.1)));
        this.menuLayerAni();
    },

    selectLevelCallBack: function selectLevelCallBack(level) {
        this.curLevel = level;
        if (this.curLayer == 2) {
            return;
        }
        this.playSound(sound.BUTTON);
        this.curLayer = 2;
        this.levelLayer.runAction(cc.sequence(cc.fadeOut(0.1), cc.callFunc(function () {
            this.levelLayer.opacity = 255;
            this.levelLayer.active = false;
        }, this)));

        this.gameLayer.active = true;
        this.gameLayer.opacity = 0;
        this.gameLayer.runAction(cc.sequence(cc.delayTime(0.1), cc.callFunc(function () {
            this.createLevelLayer(level);
        }, this), cc.fadeIn(0.1)));
    },

    backLevelCallBack: function backLevelCallBack(event, customEventData) {
        this.clearGameData();
        if (this.curLayer == 1) {
            return;
        }
        this.playSound(sound.BUTTON);
        this.curLayer = 1;
        this.gameLayer.runAction(cc.sequence(cc.fadeOut(0.1), cc.callFunc(function () {
            this.gameLayer.opacity = 255;
            this.gameLayer.active = false;
        }, this)));

        this.levelLayer.active = true;
        this.levelLayer.opacity = 0;
        this.levelLayer.runAction(cc.sequence(cc.fadeIn(0.1), cc.callFunc(function () {
            this.updateLevelInfo();
        }, this)));
    },

    nextLevelCallBack: function nextLevelCallBack(event, customEventData) {
        this.playSound(sound.BUTTON);
        this.gameOverLayer.active = false;

        this.curLevel = this.curLevel + 1;
        if (this.curLevel > this.allLevelCount) {
            this.backLevelCallBack();
        } else {
            this.createLevelLayer(this.curLevel);
        }
    },


    refreshCallBack: function refreshCallBack(event, customEventData) {
        this.playSound(sound.BUTTON);
        this.gameLayer.stopAllActions();
        this.clearGameData();
        this.createLevelLayer(this.curLevel);
    },

    revokeCallBack: function revokeCallBack(event, customEventData) {},

    createLevelLayer: function createLevelLayer(level) {
        this.gameControlLayer.removeAllChildren();
        this.setLevel();
        this.setCurNum();
        this.setBestNum();

        var levelContent = this.allLevelConfig[level].content;
        this.allRow = this.allLevelConfig[level].allRow;
        this.allCol = this.allLevelConfig[level].allCol;
        this.heroRow = this.allLevelConfig[level].heroRow;
        this.heroCol = this.allLevelConfig[level].heroCol;

        this.boxW = this.allWidth / this.allCol;
        this.boxH = this.boxW;

        var sPosX = -(this.allWidth / 2) + this.boxW / 2;
        var sPosY = this.allWidth / 2 - this.boxW / 2;
        var offset = 0;
        if (this.allRow > this.allCol) {
            offset = (this.allRow - this.allCol) * this.boxH / 2;
        } else {
            offset = (this.allRow - this.allCol) * this.boxH / 2;
        }
        this.landArrays = [];
        this.palace = [];
        for (var i = 0; i < this.allRow; i++) {
            this.landArrays[i] = [];
            this.palace[i] = [];
        }

        for (var _i = 0; _i < this.allRow; _i++) {
            for (var j = 0; j < this.allCol; j++) {
                var x = sPosX + this.boxW * j;
                var y = sPosY - this.boxH * _i + offset;
                var node = this.createBoxItem(_i, j, levelContent[_i * this.allCol + j], cc.v2(x, y));
                this.landArrays[_i][j] = node;
                node.width = this.boxW;
                node.height = this.boxH;
            }
        }

        this.setLandFrame(this.heroRow, this.heroCol, boxType.HERO);
    },
    createBoxItem: function createBoxItem(row, col, type, pos) {
        var node = new cc.Node();
        var sprite = node.addComponent(cc.Sprite);
        sprite.spriteFrame = this.itemImgAtlas.getSpriteFrame("p" + type);
        node.parent = this.gameControlLayer;
        node.position = pos;
        if (type == boxType.WALL) {
            node.name = "wall_" + row + "_" + col;
            node.attr({ "_type_": type });
        } else if (type == boxType.NONE) {
            node.name = "none_" + row + "_" + col;
            node.attr({ "_type_": type });
        } else {
            node.name = "land_" + row + "_" + col;
            node.attr({ "_type_": type });
            node.attr({ "_row_": row });
            node.attr({ "_col_": col });
            if (type == boxType.ENDBOX) {
                this.finishBoxCount += 1;
            }
        }
        this.palace[row][col] = type;

        return node;
    },


    runHero: function runHero(move) {
        this.start.row = this.heroRow;
        this.start.col = this.heroCol;
        if (move == "up") {
            this.checkNextMove(this.start.row - 1, this.start.col);
        } else if (move == "down") {
            this.checkNextMove(this.start.row + 1, this.start.col);
        } else if (move == "left") {
            this.checkNextMove(this.start.row, this.start.col - 1);
        } else if (move == "right") {
            this.checkNextMove(this.start.row, this.start.col + 1);
        }
    },
    checkNextMove: function checkNextMove(next_row, next_col) {
        var t = this.palace[next_row][next_col];
        if (t == boxType.LAND || t == boxType.BODY) {
            this.heroRow = next_row;
            this.heroCol = next_col;
            this.setLandFrame(next_row, next_col, boxType.HERO);
            this.setLandFrame(this.start.row, this.start.col, this.palace[this.start.row][this.start.col]);
        } else if (t == boxType.BOX || t == boxType.ENDBOX) {
            var lr = next_row - this.start.row;
            var lc = next_col - this.start.col;
            if (Math.abs(lr) + Math.abs(lc) == 1) {
                var nextr = next_row + lr;
                var nextc = next_col + lc;
                var t2 = this.palace[nextr][nextc];
                if (t2 && t2 != boxType.WALL && t2 != boxType.BOX && t2 != boxType.ENDBOX) {
                    this.setLandFrame(this.start.row, this.start.col, this.palace[this.start.row][this.start.col]);
                    var bt = this.palace[next_row][next_col];
                    if (bt == boxType.ENDBOX) {
                        this.palace[next_row][next_col] = boxType.BODY;
                        this.finishBoxCount -= 1;
                    } else {
                        this.palace[next_row][next_col] = boxType.LAND;
                    }
                    this.setLandFrame(next_row, next_col, boxType.HERO);
                    var nt = this.palace[nextr][nextc];
                    if (nt == boxType.BODY) {
                        this.palace[nextr][nextc] = boxType.ENDBOX;
                        this.finishBoxCount += 1;
                    } else {
                        this.palace[nextr][nextc] = boxType.BOX;
                    }
                    this.setLandFrame(nextr, nextc, this.palace[nextr][nextc]);
                    this.heroRow = next_row;
                    this.heroCol = next_col;

                    this.checkGameOver();
                }
            }
        }
    },
    setLandFrame: function setLandFrame(row, col, type) {
        var land = this.landArrays[row][col];
        if (land) {
            land.getComponent(cc.Sprite).spriteFrame = this.itemImgAtlas.getSpriteFrame("p" + type);
            land.width = this.boxW;
            land.height = this.boxH;
        }
    },

    checkGameOver: function checkGameOver() {
        var count = this.allLevelConfig[this.curLevel].allBox;
        if (this.finishBoxCount == count) {
            this.gameOverLayer.active = true;
            this.gameOverLayer.opacity = 1;
            this.gameOverLayer.runAction(cc.sequence(cc.delayTime(0.5), cc.fadeIn(0.1)));

            var finishLevel = parseInt(cc.sys.localStorage.getItem("finishLevel") || 0);
            if (this.curLevel > finishLevel) {
                cc.sys.localStorage.setItem("finishLevel", this.curLevel);
            }

            cc.sys.localStorage.setItem("levelStar" + this.curLevel, 3);

            var best = parseInt(cc.sys.localStorage.getItem("levelBest" + this.curLevel) || 0);
            if (this.curStepNum < best || best == 0) {
                cc.sys.localStorage.setItem("levelBest" + this.curLevel, this.curStepNum);
            }
            this.playSound(sound.GAMEWIN);
            this.clearGameData();
        }
    },


    setLevel: function setLevel() {
        this.levelTxt.getComponent(cc.Label).string = this.curLevel;
    },

    setCurNum: function setCurNum() {
        this.curNum.getComponent(cc.Label).string = this.curStepNum;
    },
    setBestNum: function setBestNum() {
        var bestNum = cc.sys.localStorage.getItem("levelBest" + this.curLevel) || "--";
        this.bestNum.getComponent(cc.Label).string = bestNum;
    },
    clearGameData: function clearGameData() {
        this.finishBoxCount = 0;
        this.curStepNum = 0;
        this.curStepNum = 0;
    },

    playSound: function playSound(name) {
        cc.loader.loadRes(name, cc.AudioClip, function (err, clip) {
            var audioID = cc.audioEngine.playEffect(clip, false);
        });
    },

    start: function start() {}
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
        //# sourceMappingURL=gameLayer.js.map
        