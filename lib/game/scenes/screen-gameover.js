ig.module(
    'game.scenes.screen-gameover'
)
.requires(
    'impact.game'
)
.defines(function() {

    //
    // --------------------------------------------------------------------------
    // Gameover Screen
    // --------------------------------------------------------------------------
    //
    ScreenGameover = ig.Game.extend({
        
        levelName: 'gameover',
        isPaused: false,
        gravity: 0,
        tileSize: 10,
        clearColor: '#000033',
        font: new ig.Font('media/04b03.blue.font.png'),
        
        // initialize your game here
        init: function() {
            
            // bind keys
            ig.input.bind(ig.KEY.MOUSE1, 'click');
            
            // add Start button
            var settings = {action:'again', anchor:{left:'center', bottom: 40, offset:{x:0, y:0}}, width:49, height:19, imgSrc:'media/button-again.png'};
            this.buttonAgain = ig.game.spawnEntity(EntityButton, 0, 0, settings);
            
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
            
            // if Again button is pressed
            this.buttonAgain.update();
            if (ig.input.released('again'))
            {
                ig.system.setGame(ScreenTitle);
            }
            
        },
        
        draw: function() {
            
            this.parent();
            
            // draw text
            this.font.draw(' YOU\'RE DEAD! \n You got spotted. Try not to do that. ', (ig.system.width / 2), 60, ig.Font.ALIGN.CENTER);
            
            // draw Start button
            this.buttonAgain.draw(true);
            
        },
        
        // reposition entities
        resizeGame: function() {
        
            // has the game started
            if ( ! ig.system)
            {
                return;
            }
            
            // reposition Start button
            this.buttonAgain.align();
            
        },
        
    });
});