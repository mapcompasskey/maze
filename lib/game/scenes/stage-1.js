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
        clearColor: '#333366',
        turnCounter: 0,
        lightsOn: false,
        player: null,
        playerShader: null,
        minotaurs: [],
        minotaurShader: null,
        minotaurVision: null,
        exitTiles: [],
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
            
            // toggle pause state
            if (ig.input.pressed('pause'))
            {
                this.isPaused = !this.isPaused;
            }
            
            // prevents recursive updating of game entities
            if (ig.game.isPaused)
            {
                return;
            }
            
            // toggle the player's shader
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
            
            this.parent();
            
            // draw minotaurs and shaders
            if (this.minotaurs.length)
            {
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
                
                // draw minotaurs
                for (var i = 0; i < this.minotaurs.length; i++)
                {
                    if (this.minotaurs[i])
                    {
                        this.minotaurs[i].draw();
                    }
                }
            }
            
            // draw player
            if (this.player)
            {
                this.player.draw();
                
                // draw player shader
                if (this.lightsOn)
                {
                    this.playerShader.draw();
                }
            }
            
            // add controls
            this.font.draw('Arrow Keys to Move | Q key to toggle lights', 5, 2, ig.Font.ALIGN.LEFT);
            this.font.draw(this.turnCounter, (ig.system.width - 5), 2, ig.Font.ALIGN.RIGHT);
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
            
            // add entities
            if (this.namedEntities)
            {
                var xPos = 0;
                var yPos = 0;
                
                // add player and shader
                if (this.namedEntities.spawnPlayer)
                {
                    xPos = this.namedEntities.spawnPlayer.pos.x; // 49 * this.tileSize;
                    yPos = this.namedEntities.spawnPlayer.pos.y; // 49 * this.tileSize;
                    this.player = ig.game.spawnEntity(EntityPlayer, xPos, yPos);
                    this.playerShader = new EntityPlayerShader(this.tilesName, this.player);
                }
                
                // add minotaur shaders
                this.minotaurShader = new EntityMinotaurShader(this.tilesName, null, 'shader');
                this.minotaurVision = new EntityMinotaurShader(this.tilesName, null, 'vision');
                
                // add minotaur 1
                if (this.namedEntities.spawnMinotaur1)
                {
                    xPos = this.namedEntities.spawnMinotaur1.pos.x;
                    yPos = this.namedEntities.spawnMinotaur1.pos.y;
                    this.minotaurs[0] = ig.game.spawnEntity(EntityMinotaur, xPos, yPos);
                    this.minotaurShader.addEntity(this.minotaurs[0]);
                    this.minotaurVision.addEntity(this.minotaurs[0]);
                }
                
                // add minotaur 2
                if (this.namedEntities.spawnMinotaur2)
                {
                    xPos = this.namedEntities.spawnMinotaur2.pos.x;
                    yPos = this.namedEntities.spawnMinotaur2.pos.y;
                    this.minotaurs[1] = ig.game.spawnEntity(EntityMinotaur, xPos, yPos);
                    this.minotaurShader.addEntity(this.minotaurs[1]);
                    this.minotaurVision.addEntity(this.minotaurs[1]);
                }
                
                // add minotaur 3
                if (this.namedEntities.spawnMinotaur3)
                {
                    xPos = this.namedEntities.spawnMinotaur3.pos.x;
                    yPos = this.namedEntities.spawnMinotaur3.pos.y;
                    this.minotaurs[2] = ig.game.spawnEntity(EntityMinotaur, xPos, yPos);
                    this.minotaurShader.addEntity(this.minotaurs[2]);
                    this.minotaurVision.addEntity(this.minotaurs[2]);
                }
                
                // add minotaur 4
                if (this.namedEntities.spawnMinotaur4)
                {
                    xPos = this.namedEntities.spawnMinotaur4.pos.x;
                    yPos = this.namedEntities.spawnMinotaur4.pos.y;
                    this.minotaurs[3] = ig.game.spawnEntity(EntityMinotaur, xPos, yPos);
                    this.minotaurShader.addEntity(this.minotaurs[3]);
                    this.minotaurVision.addEntity(this.minotaurs[3]);
                }
            }
            
        },
        
        // check for a tile
        // caller: player.js, minotaur.js
        checkForTile: function(entity, x, y) {
            
            // check for an exit tile
            if (this.checkForExitTile(entity, x, y))
            {
                return false;
            }
            
            var tileX = Math.round(entity.pos.x / this.tileSize) + x;
            var tileY = Math.round(entity.pos.y / this.tileSize) + y;
            if (this.tilesWall.data[tileY])
            {
                if (this.tilesWall.data[tileY][tileX] > 0)
                {
                    return true;
                }
            }
            
            return false;
            
        },
        
        // check for an exit tile
        checkForExitTile: function(entity, x, y) {
            
            for (var i = 0; i < this.exitTiles.length; i++)
            {
                if (this.exitTiles[i])
                {
                    var entityTileX = Math.round(entity.pos.x / this.tileSize) + x;
                    var entityTileY = Math.round(entity.pos.y / this.tileSize) + y;
                    
                    var exitTileX = this.exitTiles[i].tileX;
                    var exitTileY = this.exitTiles[i].tileY;
                    
                    if (entityTileX == exitTileX && entityTileY == exitTileY)
                    {
                        return true;
                    }
                }
            }
            
            return false;
            
        },
        
        // check if the player has entered an enemy's vision
        checkForPlayerDeath: function() {
            
            if (this.player && this.minotaurVision)
            {
                var tileX = Math.round(this.player.pos.x / this.tileSize);
                var tileY = Math.round(this.player.pos.y / this.tileSize);
                if (this.minotaurVision.lightMap.data[tileY])
                {
                    if (this.minotaurVision.lightMap.data[tileY][tileX] > 0)
                    {
                        console.log('player is dead');
                    }
                }
            }
            
        },
        
        // stage was completed
        stageComplete: function() {
        
            ig.game.isPaused = true;
            console.log('game won!');
            
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