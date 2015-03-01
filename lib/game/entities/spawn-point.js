ig.module(
    'game.entities.spawn-point'
)
.requires(
    'impact.entity'
)
.defines(function() {
    EntitySpawnPoint = ig.Entity.extend({
        
        size: {x: 10, y: 10},
        offset: {x: 0, y: 0},
        maxVel: {x: 0, y: 0},
        
        _wmIgnore: false,
        _wmDrawBox: true,
        _wmBoxColor: 'rgba(255, 170, 66, 0.7)',
        
        init: function(x, y, settings) {
        
            this.parent(x, y, settings);
            
        },
        
    });
});