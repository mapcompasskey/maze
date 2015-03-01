ig.module(
    'game.entities.sphinx'
)
.requires(
    'impact.entity'
)
.defines(function() {
    EntitySphinx = ig.Entity.extend({
        
        size: {x: 10, y: 10},
        offset: {x: 0, y: 0},
        maxVel: {x: 0, y: 0},
        friction: {x: 0, y: 0},
        flip: false,
        speed: 0,
        jump: 0,
        health: 10,
        tileSize: 0,
        turnCounter: 0,
        animSheet: new ig.AnimationSheet('media/sphinx.png', 10, 10),
        
        dying: false,
        moving: false,
        
        type: ig.Entity.TYPE.B, // add to friendly group
        checkAgainst: ig.Entity.TYPE.A, // check collisions against nothing
        collides: ig.Entity.COLLIDES.PASSIVE,
        
        init: function(x, y, settings) {
        
            this.parent(x, y, settings);
            
            // add the animations
            this.addAnim('idle', 1, [0], true);
            this.addAnim('dead', 1, [0], true);
            
            // update parameters
            this.tileSize = ig.game.tileSize;
            this.maxVel = {x: this.speed, y: this.speed};
            
            // start moving
            //this.movingLeft = true;
            //this.updateAction();
            
        },
        
        update: function() {
        
            if (ig.game.isPaused)
            {
                return;
            }
            
            this.parent();
            this.checkStatus();
            
        },
        
        checkStatus: function() {
            
            if (ig.game.turnCounter != this.turnCounter)
            {
                //this.updateAction();
                this.turnCounter = ig.game.turnCounter;
            }
            
            // check entity status
            this.isHurting();
            this.isMoving();
            this.animate();
            
        },
        
        // check if hurting
        isHurting: function() {
            
            /*
            // if dying, kill this entity when the animation ends
            if (this.dying)
            {
                this.vel.x = 0;
                this.vel.y = 0;
                
                if (this.currentAnim == this.anims.dead)
                {
                    if (this.currentAnim.loopCount)
                    {
                        this.kill();
                    }
                }
            }
            */
            
        },
        
        // check if moving
        isMoving: function() {
        
            /*
            if (this.dying)
            {
                return;
            }
            
            if (this.moving)
            {
                if (this.hasReachedDestination())
                {
                    this.vel.x = 0;
                    this.vel.y = 0;
                    this.pos.x = Math.round(this.destination.x);
                    this.pos.y = Math.round(this.destination.y);
                    this.moving = false;
                }
            }
            */
            
        },
        
        // update entity animation
        animate: function() {
            
            // update animation state
            if (this.dying)
            {
                if (this.currentAnim != this.anims.dead)
                {
                    this.currentAnim = this.anims.dead.rewind();
                }
            }
            else if (this.currentAnim != this.anims.idle)
            {
                if (this.currentAnim != this.anims.idle)
                {
                    this.currentAnim = this.anims.idle.rewind();
                }
            }
            
        },
        
        // call to entity during collisoin
        check: function(other) {
            
            other.receiveDamage(0, this);
            
        },
        
        // call from entity during collisoin
        receiveDamage: function(amount, from) {
        
            return false;
            
        },
        
    });
});