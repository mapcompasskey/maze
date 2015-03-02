ig.module(
    'game.entities.exit-tile'
)
.requires(
    'impact.entity'
)
.defines(function() {
    EntityExitTile = ig.Entity.extend({
        
        name: 'ExitTile',
        size: {x: 10, y: 10},
        offset: {x: 0, y: 0},
        maxVel: {x: 0, y: 0},
        tileSize: 10,
        
        type: ig.Entity.TYPE.B, // add to enemies group
        checkAgainst: ig.Entity.TYPE.NONE, // check collisions against nothing
        collides: ig.Entity.COLLIDES.PASSIVE,
        
        _wmIgnore: false,
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(255, 170, 66, 0.7)',
        
        init: function(x, y, settings) {
        
            this.parent(x, y, settings);
            
            if (ig.game.tileSize)
            {
                this.tileSize = ig.game.tileSize;
            }
            
            // set the tile's position
            this.tileX = Math.round(this.pos.x / this.tileSize);
            this.tileY = Math.round(this.pos.y / this.tileSize);
            
            // adds itself to the game's exit tiles array
            if (ig.game.exitTiles)
            {
                ig.game.exitTiles.push(this);
            }
            
        },
        
    });
});