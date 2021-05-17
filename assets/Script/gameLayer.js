let boxType = {
    NONE: 0,   
    WALL: 1,   
    LAND: 2,   
    BODY: 3,   
    BOX: 4,    
    ENDBOX: 5, 
    HERO: 6    
}

let sound = {
    BUTTON: "Texture/sound/button",      
    GAMEWIN: "Texture/sound/gamewin",    
    MOVE: "Texture/sound/move",         
    PUSHBOX: "Texture/sound/pushbox",    
    WRONG: "Texture/sound/wrong",        
}

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

        levelItemPrefab: cc.Prefab,
    },

    onLoad: function () {
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

    initData: function () {
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
    onKeyDown(event) {
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
    createLavelItem() {
        let callfunc = level => {
            this.selectLevelCallBack(level);
        };

        for (let i = 0; i < this.allLevelCount; i++) {
            let node = cc.instantiate(this.levelItemPrefab);
            node.parent = this.levelScroll;
            let levelItem = node.getComponent("levelItem");
            levelItem.levelFunc(callfunc);
            this.tabLevel.push(levelItem);
        }
        this.levelContent.height = Math.ceil(this.allLevelCount / 5) * 135 + 20;
    },

    updateLevelInfo() {
        let finishLevel = parseInt(cc.sys.localStorage.getItem("finishLevel") || 0);
        for (let i = 1; i <= this.allLevelCount; i++) {
            if (i <= finishLevel) {
                let data = parseInt(cc.sys.localStorage.getItem("levelStar" + i) || 0);
                this.tabLevel[i - 1].showStar(true, data, this.levelImgAtlas, i);
            }
            else if (i == (finishLevel + 1)) {
                this.tabLevel[i - 1].showStar(true, 0, this.levelImgAtlas, i);
            }
            else {
                this.tabLevel[i - 1].showStar(false, 0, this.levelImgAtlas, i);
            }
        }
    },

    menuLayerAni() {
        this.startBtn.scale = 1.0;
        this.startBtn.runAction(cc.repeatForever(cc.sequence(
            cc.scaleTo(0.6, 1.5),
            cc.scaleTo(0.6, 1.0)
        )));
    },

    startBtnCallBack(event, customEventData) {
        if (this.curLayer == 1) {
            return;
        }
        this.curLayer = 1;

        this.playSound(sound.BUTTON);

        this.menuLayer.runAction(cc.sequence(
            cc.fadeOut(0.1),
            cc.callFunc(() => {
                this.startBtn.stopAllActions();
                this.startBtn.scale = 1.0;
                this.menuLayer.opacity = 255;
                this.menuLayer.active = false;
            }
            )));

        this.levelLayer.active = true;
        this.levelLayer.opacity = 0;
        this.levelLayer.runAction(cc.sequence(
            cc.delayTime(0.1),
            cc.fadeIn(0.1),
            cc.callFunc(() => {
                this.updateLevelInfo();
            }
            )));
    },

    levelBackCallBack: function (event, customEventData) {
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

    selectLevelCallBack: function (level) {
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

    backLevelCallBack: function (event, customEventData) {
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

    nextLevelCallBack(event, customEventData) {
        this.playSound(sound.BUTTON);
        this.gameOverLayer.active = false;

        this.curLevel = this.curLevel + 1;
        if (this.curLevel > this.allLevelCount) {
            this.backLevelCallBack();
        }
        else {
            this.createLevelLayer(this.curLevel);
        }
    },

    refreshCallBack: function (event, customEventData) {
        this.playSound(sound.BUTTON);
        this.gameLayer.stopAllActions();
        this.clearGameData();
        this.createLevelLayer(this.curLevel);
    },

    revokeCallBack: function (event, customEventData) {

    },

    createLevelLayer(level) {
        this.gameControlLayer.removeAllChildren();
        this.setLevel();
        this.setCurNum();
        this.setBestNum();

        let levelContent = this.allLevelConfig[level].content;
        this.allRow = this.allLevelConfig[level].allRow;
        this.allCol = this.allLevelConfig[level].allCol;
        this.heroRow = this.allLevelConfig[level].heroRow;
        this.heroCol = this.allLevelConfig[level].heroCol;

        this.boxW = this.allWidth / this.allCol;
        this.boxH = this.boxW;

        let sPosX = -(this.allWidth / 2) + (this.boxW / 2);
        let sPosY = (this.allWidth / 2) - (this.boxW / 2);
        let offset = 0;
        if (this.allRow > this.allCol) {
            offset = ((this.allRow - this.allCol) * this.boxH) / 2;
        }
        else {
            offset = ((this.allRow - this.allCol) * this.boxH) / 2;
        }
        this.landArrays = [];  
        this.palace = [];      
        for (let i = 0; i < this.allRow; i++) {
            this.landArrays[i] = [];
            this.palace[i] = [];
        }

        for (let i = 0; i < this.allRow; i++) {    
            for (let j = 0; j < this.allCol; j++) {   
                let x = sPosX + (this.boxW * j);
                let y = sPosY - (this.boxH * i) + offset;
                let node = this.createBoxItem(i, j, levelContent[i * this.allCol + j], cc.v2(x, y));
                this.landArrays[i][j] = node;
                node.width = this.boxW;
                node.height = this.boxH;
            }
        }

        this.setLandFrame(this.heroRow, this.heroCol, boxType.HERO);
    },


    createBoxItem(row, col, type, pos) {
        let node = new cc.Node();
        let sprite = node.addComponent(cc.Sprite);
        sprite.spriteFrame = this.itemImgAtlas.getSpriteFrame("p" + type);
        node.parent = this.gameControlLayer;
        node.position = pos;
        if (type == boxType.WALL) {  
            node.name = "wall_" + row + "_" + col;
            node.attr({ "_type_": type });
        }
        else if (type == boxType.NONE) {  
            node.name = "none_" + row + "_" + col;
            node.attr({ "_type_": type });
        }
        else { 
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

    runHero: function (move) {
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
    checkNextMove: function (next_row, next_col) {
        let t = this.palace[next_row][next_col];
        if(t == boxType.LAND || t == boxType.BODY) {
            this.heroRow = next_row;
            this.heroCol = next_col;
            this.setLandFrame(next_row, next_col, boxType.HERO);
            this.setLandFrame(this.start.row, this.start.col, this.palace[this.start.row][this.start.col]);
        } else if(t == boxType.BOX || t == boxType.ENDBOX) {
            let lr = next_row - this.start.row;
            let lc = next_col - this.start.col;
            if((Math.abs(lr) + Math.abs(lc)) == 1){
                let nextr = next_row + lr;
                let nextc = next_col + lc;
                let t2 = this.palace[nextr][nextc];
                if(t2 && (t2 != boxType.WALL) && (t2 != boxType.BOX) && (t2 != boxType.ENDBOX)) {
                    this.setLandFrame(this.start.row, this.start.col, this.palace[this.start.row][this.start.col]);
                    let bt = this.palace[next_row][next_col];
                    if(bt == boxType.ENDBOX){    
                        this.palace[next_row][next_col] = boxType.BODY;
                        this.finishBoxCount -= 1;
                    } else {
                        this.palace[next_row][next_col] = boxType.LAND;
                    }
                    this.setLandFrame(next_row, next_col, boxType.HERO);
                    let nt = this.palace[nextr][nextc];
                    if(nt == boxType.BODY){
                        this.palace[nextr][nextc] = boxType.ENDBOX;
                        this.finishBoxCount += 1;
                    }
                    else {
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
    setLandFrame: function (row, col, type) {
        let land = this.landArrays[row][col];
        if (land) {
            land.getComponent(cc.Sprite).spriteFrame = this.itemImgAtlas.getSpriteFrame("p" + type);
            land.width = this.boxW;
            land.height = this.boxH;
        }
    },

    checkGameOver() {
        let count = this.allLevelConfig[this.curLevel].allBox;
        if (this.finishBoxCount == count) {
            this.gameOverLayer.active = true;
            this.gameOverLayer.opacity = 1;
            this.gameOverLayer.runAction(cc.sequence(
                cc.delayTime(0.5),
                cc.fadeIn(0.1)
            ));

            let finishLevel = parseInt(cc.sys.localStorage.getItem("finishLevel") || 0);
            if (this.curLevel > finishLevel) {
                cc.sys.localStorage.setItem("finishLevel", this.curLevel);
            }

            cc.sys.localStorage.setItem("levelStar" + this.curLevel, 3);

            let best = parseInt(cc.sys.localStorage.getItem("levelBest" + this.curLevel) || 0);
            if ((this.curStepNum < best) || (best == 0)) {
                cc.sys.localStorage.setItem("levelBest" + this.curLevel, this.curStepNum);
            }
            this.playSound(sound.GAMEWIN);
            this.clearGameData();
        }
    },

    setLevel: function () {
        this.levelTxt.getComponent(cc.Label).string = this.curLevel;
    },

    setCurNum: function () {
        this.curNum.getComponent(cc.Label).string = this.curStepNum;
    },
    setBestNum: function () {
        let bestNum = cc.sys.localStorage.getItem("levelBest" + this.curLevel) || "--";
        this.bestNum.getComponent(cc.Label).string = bestNum;
    },
    clearGameData: function () {
        this.finishBoxCount = 0;
        this.curStepNum = 0;
        this.curStepNum = 0;
    },

    playSound: function (name) {
        cc.loader.loadRes(name, cc.AudioClip, function (err, clip) {
            var audioID = cc.audioEngine.playEffect(clip, false);
        });
    },

    start() {

    },
});