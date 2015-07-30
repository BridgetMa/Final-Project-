enchant();
window.onload = function(){
  var game = new Game(300, 300);
  game.keybind (32, 'a');
  game.spriteSheetWidth = 128;
  game.spriteSheetHeight = 32;
  game.fps = 15;
  game.spriteWidth = 32;
  game.spriteHeight = 32;
  game.preload('sprites.png');
  var currentLevel = 0;
  var map = new Map(game.spriteWidth, game.spriteHeight);
  var foregroundMap = new Map(game.spriteWidth, game.spriteHeight);

  var changeLevel = function(level) {
    /* level {
      bg: [[]],
      fg: [[]]
    }
    */
    map.image = game.assets['sprites.png'];
    map.loadData(level.bg);
    foregroundMap.image = game.assets['sprites.png'];
    foregroundMap.loadData(level.fg);
    setCollision(level.fg);
  }
  var setCollision = function(foregroundData){
    
    var collisionData = [];
    for(var i = 0; i< foregroundData.length; i++){
      collisionData.push([]);
      for(var j = 0; j< foregroundData[0].length; j++){
        var collision = foregroundData[i][j] %13 > 1 ? 1 : 0;
        collisionData[i][j] = collision;
      }
    }
    map.collisionData = collisionData;
  };
  var stage = new Group();
  var setStage = function(){
    stage.addChild(map);
    stage.addChild(player);
    stage.addChild(foregroundMap);
    game.rootScene.addChild(stage);
  };

  var player = new Sprite(game.spriteWidth, game.spriteHeight);
  var setPlayer = function(){
    player.spriteOffset = 2;
    player.startingX = 1;
    player.startingY = 4;
    player.x = player.startingX * game.spriteWidth;
    player.y = player.startingY * game.spriteHeight;
    player.direction = 0;
    player.walk = 0;
    player.frame = player.spriteOffset + player.direction; 
    player.image = new Surface(game.spriteSheetWidth, game.spriteSheetHeight);
    player.image.draw(game.assets['sprites.png']);

  };

  //note that the tile coordinates go (y, x) NOT (x.y)
  var changeTile = function(x,y){
    //console.log(x+", "+y);
    var tileX = x/32;
    var tileY = y/32;
    var foregroundData = levels[currentLevel].fg;
    foregroundData[tileY][tileX] = 0;
    foregroundMap.loadData(foregroundData);
    map.collisionData[tileY][tileX] = 1;
  }

  player.move = function(){
    this.frame = this.spriteOffset;
    if (this.isMoving) {
      this.moveBy(this.xMovement, this.yMovement);
   
      if (!(game.frame % 2)) {
        this.walk++;
        this.walk %= 2;
      }
      if ((this.xMovement && this.x % 32 === 0) || (this.yMovement && this.y % 32 === 0)) {
        this.isMoving = false;
        switch (this.direction){
          case 1:
          //up 
          changeTile(this.x, this.y+32);
            break;
          case 2:
          //right
          changeTile(this.x-32, this.y);
            break;
          case 3:
          //left
          changeTile(this.x+32, this.y);
            break;
          case 0:
          //down 
          changeTile(this.x, this.y-32);
            break;
        }
        this.walk = 1;
      }
    } else {
      this.xMovement = 0;
      this.yMovement = 0;
      if (game.input.up) {
        this.direction = 1;
        this.yMovement = -4;
      } else if (game.input.right) {
        this.direction = 2;
        this.xMovement = 4;
      } else if (game.input.left) {
        this.direction = 3;
        this.xMovement = -4;
      } else if (game.input.down) {
        this.direction = 0;
        this.yMovement = 4;
      }
      if (this.xMovement || this.yMovement) {
        var x = this.x + (this.xMovement ? this.xMovement / Math.abs(this.xMovement) * 32 : 0);
        var y = this.y + (this.yMovement ? this.yMovement / Math.abs(this.yMovement) * 32 : 0);
      if (0 <= x && x < map.width && 0 <= y && y < map.height && !map.hitTest(x, y)) {
          this.isMoving = true;
          this.move();
        }

      }
    }
  };
  game.focusViewport = function(){
    var x = Math.min((game.width  - 16) / 2 - player.x, 0);
    var y = Math.min((game.height - 16) / 2 - player.y, 0);
    x = Math.max(game.width,  x + map.width)  - map.width;
    y = Math.max(game.height, y + map.height) - map.height;
    game.rootScene.firstChild.x = x;
    game.rootScene.firstChild.y = y;
  };
  game.onload = function(){
    changeLevel(levels[currentLevel]);
    setPlayer();
    setStage();
    player.on('enterframe', function() {
      player.move();
      if (game.input.a) {
        location.reload();
      };
    });
    game.rootScene.on('enterframe', function(e) {
      game.focusViewport();
    });
  };
  game.start();
};
