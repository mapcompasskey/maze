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
        turnCounter: 0,
        player: null,
        minotaur: null,
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
            ig.input.bind(ig.KEY.MOUSE1, 'click');
            
            // load the level
            this.loadLevel( LevelStage1 );
            
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
            
            // update camera
            if (this.camera && this.player)
            {
                this.camera.follow(this.player);
            }
            
        },
        
        draw: function() {
            
            this.parent();
            
            // draw shader after everything but before HUD elements
            this.shader.draw();
            
            this.font.draw('Arrow Keys to Move', (2 - ig.game.screen.x), (2 - ig.game.screen.y), ig.Font.ALIGN.LEFT);
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
            
            // add player
            this.player = ig.game.spawnEntity(EntityPlayer, (16 * ig.game.tileSize), (10 * ig.game.tileSize));
            
            // add minotaur
            this.minotaur = ig.game.spawnEntity(EntityMinotaur, (15 * ig.game.tileSize), (1 * ig.game.tileSize));
            
            // setup shader
            this.shader = new Shader(this.tilesName);
            this.shader.addEntity(this.player);
            
            // this will insert the new map but the entities will appear ontop of it
            //ig.game.backgroundMaps.push(this.shader.lightMap);
            
        },
        
        // check for a tile
        checkForTile: function(entity, x, y) {
            
            var offsetX = (ig.game.screen.x % this.tileSize);
            var offsetY = (ig.game.screen.y % this.tileSize);
            var tileX = Math.round(((entity.pos.x - ig.game.screen.x + offsetX) / this.tileSize)) + x;
            var tileY = Math.round(((entity.pos.y - ig.game.screen.y + offsetY) / this.tileSize)) + y;
            
            if (this.tilesWall.data[tileY][tileX] > 0)
            {
                //if (x < 0) console.log('left');
                //else if (x > 0) console.log('right');
                //else if (y < 0) console.log('up');
                //else if (y > 0) console.log('down');
                
                return true;
            }
            
            //if (x < 0) console.log('no left');
            //else if (x > 0) console.log('no right');
            //else if (y < 0) console.log('no up');
            //else if (y > 0) console.log('no down');
            
            return false;
            
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