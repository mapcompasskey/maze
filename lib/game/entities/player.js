ig.module(
    'game.entities.player'
)
.requires(
    'impact.entity'
)
.defines(function() {
    EntityPlayer = ig.Entity.extend({
        
        size: {x: 10, y: 10},
        offset: {x: 0, y: 0},
        maxVel: {x: 50, y: 50},
        friction: {x: 0, y: 0},
        flip: false,
        speed: 50,
        jump: 0,
        health: 10,
        animSheet: new ig.AnimationSheet('media/player.png', 10, 10),
        
        dying: false,
        moving: false,
        
        type: ig.Entity.TYPE.A, // add to friendly group
        checkAgainst: ig.Entity.TYPE.NONE, // check collisions against nothing
        collides: ig.Entity.COLLIDES.PASSIVE,
        
        init: function(x, y, settings) {
        
            this.parent(x, y, settings);
            
            // add the animations
            this.addAnim('idle', 1, [0], true);
            this.addAnim('dead', 1, [1], true);
            
            // game instance of this entity
            ig.game.player = this;
            
            this.MoveToPoint = new MoveToPoint();
            this.MoveToPoint.minimun = 0.1;
            
        },
        
        update: function() {
        
            if (ig.game.isPaused)
            {
                return;
            }
            
            this.parent();
            this.checkStatus();
            this.checkPosition();
            
        },
        
        checkStatus: function() {
            
            // check entity status
            this.isHurting();
            this.isMoving();
            this.animate();
            
        },
        
        // check if hurting
        isHurting: function() {
            
            // if dying, kill this entity when the animation ends
            if (this.dying)
            {
                if (this.currentAnim == this.anims.dead)
                {
                    if (this.currentAnim.loopCount)
                    {
                        this.kill();
                    }
                }
            }
            
        },
        
        // checking if idle or moving left/right
        isMoving: function() {
        
            if (this.dying)
            {
                this.moving = false;
                return;
            }
            
            
            if ( ! this.moving)
            {
                // snap to point
                this.pos.x = Math.round(this.pos.x);
                this.pos.y = Math.round(this.pos.y);
                
                var thisX = destX = this.pos.x;
                var thisY = destY = this.pos.y;
                
                // moving left
                if (ig.input.pressed('left'))
                {
                    destX = (thisX - ig.game.tileSize);
                    destY = thisY;
                }
                // moving right
                else if (ig.input.pressed('right'))
                {
                    destX = (thisX + ig.game.tileSize);
                    destY = thisY;
                }
                // moving up
                else if (ig.input.pressed('up'))
                {
                    destX = thisX;
                    destY = (thisY - ig.game.tileSize);
                }
                // moving down
                else if (ig.input.pressed('down'))
                {
                    destX = thisX;
                    destY = (thisY + ig.game.tileSize);
                }
                
                // update move velocity
                if (destX != thisX || destY != thisY)
                {
                    var destination = {x: destX, y: destY};
                    this.MoveToPoint.setDestination(destination);
                    this.moving = true;
                }
            }
            else
            {
                // move to point
                this.vel = this.MoveToPoint.getVelocity(this.speed, this);
                if (this.vel.x == 0 && this.vel.y == 0)
                {
                    this.moving = false;
                }
            }
            
            
            /*
            // if moving left
            if (ig.input.released('left'))
            {
                this.pos.x -= ig.game.tileSize;
            }
            // else, if moving right
            else if (ig.input.released('right'))
            {
                this.pos.x += ig.game.tileSize;
            }
            
            // if moving up
            if (ig.input.released('up'))
            {
                this.pos.y -= ig.game.tileSize;
            }
            // else, if moving down
            else if (ig.input.released('down'))
            {
                this.pos.y += ig.game.tileSize;
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
            
            // update facing direction
            //this.currentAnim.flip.x = this.flip;
            
        },
        
        // check if this entity needs repositioned
        checkPosition: function() {
            /*
            // if this entity has moved off the map
            if (this.pos.x < 0)
            {
                this.pos.x = (ig.game.collisionMap.pxWidth - (this.size.x * 2));
            }
            else if ((this.pos.x + this.size.x) > ig.game.collisionMap.pxWidth)
            {
                this.pos.x = this.size.x;
            }
            
            // if this entity has fallen off the map
            if (this.pos.y > ig.game.collisionMap.pxHeight)
            {
                this.pos.y = 0;
            }
            */
        },
        
        handleMovementTrace: function( res ) {
            
            if (res.collision.x || res.collision.y)
            {
                this.vel.x = 0;
                this.vel.y = 0;
                this.moving = false;
                
                res.pos.x = Math.round(res.pos.x);
                res.pos.y = Math.round(res.pos.y);
            }
            
            this.pos = res.pos;
            
        },
        
        // called by attacking entity
        receiveDamage: function(amount, from) {
        
            return false;
            
        },
        
    });
});