ig.module(
    'game.scenes.stage-1'
)
.requires(
    'impact.game'
)
.defines(function() {

    //
    // --------------------------------------------------------------------------
    // Stage 1
    // --------------------------------------------------------------------------
    //
    Stage1 = ig.Game.extend({
    
        levelName: 'stage1',
        isPaused: false,
        gravity: 0,
        tileSize: 10,
        tilesName: 'walls',
        tilesWall: null,
        clearColor: '#000033',
        clearColor: '#333366',
        turnCounter: 0,
        lightsOn: false,
        player: null,
        playerShader: null,
        minotaur: null,
        minotaurShader: null,
        minotaurVision: null,
        font: new ig.Font('media/04b03.grey.font.png'),
        
        // initialize
        init: function() {
            
            // bind keys
            ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
            ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
            ig.input.bind(ig.KEY.UP_ARROW, 'up');
            ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
            ig.input.bind(ig.KEY.A, 'left');
            ig.input.bind(ig.KEY.D, 'right');
            ig.input.bind(ig.KEY.W, 'up');
            ig.input.bind(ig.KEY.S, 'down');
            ig.input.bind(ig.KEY.P, 'pause');
            ig.input.bind(ig.KEY.Q, 'lights');
            ig.input.bind(ig.KEY.MOUSE1, 'click');
            
            // load the level
            this.loadLevel(LevelStage1);
            
            // show collision boxes
            //ig.Entity._debugShowBoxes = true;
            
            this.resizeGame();
            
        },
        
        update: function() {
            
            this.parent();
            
            if (ig.input.pressed('pause'))
            {
                this.isPaused = !this.isPaused;
            }
            
            if (ig.game.isPaused)
            {
                return;
            }
            
            if (ig.input.pressed('lights'))
            {
                this.lightsOn = !this.lightsOn;
            }
            
            // check for player death
            this.checkForPlayerDeath();
            
            // update camera
            if (this.camera && this.player)
            {
                this.camera.follow(this.player);
            }
            
        },
        
        draw: function() {
            
            ig.game.getMapByName('walls').alpha = 0;
            this.parent();
            
            // draw minotaur shader
            if (this.minotaurShader) 
            {
                this.minotaurShader.draw();
            }
            
            // draw minotaur vision
            if (this.minotaurVision)
            {
                this.minotaurVision.draw();
            }
            
            // draw minotaur
            if (this.minotaur)
            {
                this.minotaur.draw();
            }
            
            // draw player
            if (this.player)
            {
                this.player.draw();
            }
            
            // draw player shader
            if (this.lightsOn)
            {
                this.playerShader.draw();
            }
            
            this.font.draw('Arrow Keys to Move | Q key to toggle lights', (2 - ig.game.screen.x), (2 - ig.game.screen.y), ig.Font.ALIGN.LEFT);
            this.font.draw(this.turnCounter, (ig.system.width - 2 + ig.game.screen.x),  (2 - ig.game.screen.y), ig.Font.ALIGN.RIGHT);
            
        },
        
        loadLevel: function(data) {
        
            // remember the currently loaded level, so we can reload when the player dies.
            this.currentLevel = data;
            
            // call the parent implemenation. this creates the background maps and entities.
            this.parent(data);
            
            // get background map
            this.tilesWall = ig.game.getMapByName(this.tilesName);
            this.tileSize = this.tilesWall.tilesize;
            
            // setup simple camera plugin
            this.camera = new ig.SimpleCamera(this.tilesName);
            this.camera.offset.x.min = 0;
            this.camera.offset.x.max = 0;
            this.camera.getMinMax();
            
            // add player and shader
            //this.player = ig.game.spawnEntity(EntityPlayer, (1 * ig.game.tileSize), (1 * ig.game.tileSize));
            //this.playerShader = new EntityPlayerShader(this.tilesName, this.player);
            
            // add minotaur
            //this.minotaur = ig.game.spawnEntity(EntityMinotaur, (15 * ig.game.tileSize), (1 * ig.game.tileSize));
            //this.minotaurShader = new EntityMinotaurShader(this.tilesName, this.minotaur, 'shader');
            //this.minotaurVision = new EntityMinotaurShader(this.tilesName, this.minotaur, 'vision');
            
            if (this.namedEntities)
            {
                var xPos = 0;
                var yPos = 0;
                
                // add player and shader
                if (this.namedEntities.spawnPlayer)
                {
                    xPos = this.namedEntities.spawnPlayer.pos.x;
                    yPos = this.namedEntities.spawnPlayer.pos.y;
                    console.log(xPos, yPos);
                    this.player = ig.game.spawnEntity(EntityPlayer, xPos, yPos);
                    this.playerShader = new EntityPlayerShader(this.tilesName, this.player);
                }
                
                // add minotaur
                if (this.namedEntities.spawnMinotaur1)
                {
                    xPos = this.namedEntities.spawnMinotaur1.pos.x;
                    yPos = this.namedEntities.spawnMinotaur1.pos.y;
                    this.minotaur = ig.game.spawnEntity(EntityMinotaur, xPos, yPos);
                }
            }
            
        },
        
        // check for a tile
        // caller: player.js, minotaur.js
        checkForTile: function(entity, x, y) {
            
            var offsetX = (ig.game.screen.x % this.tileSize);
            var offsetY = (ig.game.screen.y % this.tileSize);
            //var tileX = Math.round(((entity.pos.x - ig.game.screen.x + offsetX) / this.tileSize)) + x;
            //var tileY = Math.round(((entity.pos.y - ig.game.screen.y + offsetY) / this.tileSize)) + y;
            var tileX = Math.round(((entity.pos.x) / this.tileSize)) + x;
            var tileY = Math.round(((entity.pos.y) / this.tileSize)) + y;
            
            if (this.tilesWall.data[tileY][tileX] > 0)
            {
                return true;
            }
            
            return false;
            
        },
        
        checkForPlayerDeath: function () {
            
            if (this.player && this.minotaurVision)
            {
                var offsetX = (ig.game.screen.x % this.tileSize);
                var offsetY = (ig.game.screen.y % this.tileSize);
                var tileX = Math.round(((this.player.pos.x - ig.game.screen.x + offsetX) / this.tileSize));
                var tileY = Math.round(((this.player.pos.y - ig.game.screen.y + offsetY) / this.tileSize));
                
                if (this.minotaurVision.lightMap.data[tileY][tileX] > 0)
                {
                    console.log('player is dead');
                    //console.log(this.minotaurVision.lightMap.data[tileY][tileX]);
                }
            }
            
        },
        
        // reposition entities
        resizeGame: function() {
        
            // has the game started
            if ( ! ig.system)
            {
                return;
            }
            
        },
        
    });
});