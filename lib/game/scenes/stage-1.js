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
        clearColor: '#000033',
        font: new ig.Font('media/04b03.font.png'),
        
        // initialize
        init: function() {
            
            // bind keys
            //ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
            //ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
            //ig.input.bind(ig.KEY.UP_ARROW, 'up');
            //ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
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
            
            this.font.draw('Arrow Keys to Move', (20 - ig.game.screen.x), (ig.system.height - ig.game.screen.y - 10), ig.Font.ALIGN.LEFT);
            
        },
        
        loadLevel: function(data) {
        
            // remember the currently loaded level, so we can reload when the player dies.
            this.currentLevel = data;
            
            // call the parent implemenation. this creates the background maps and entities.
            this.parent(data);
            
            // setup simple camera plugin
            this.camera = new ig.SimpleCamera();
            this.camera.offset.x.min = 0;
            this.camera.offset.x.max = 0;
            this.camera.getMinMax();
            
            // add player
            ig.game.spawnEntity(EntityPlayer, 160, 100);
            
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