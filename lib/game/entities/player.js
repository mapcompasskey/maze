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
            
        },
        
        update: function() {
        
            if (ig.game.isPaused)
            {
                return;
            }
            
            this.checkStatus();
            this.checkPosition();
            this.parent();
            
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
            
            // if moving left
            if (ig.input.state('left'))
            {
                this.vel.x = -(this.speed);
            }
            // else, if moving right
            else if (ig.input.state('right'))
            {
                this.vel.x = this.speed;
            }
            // else, no horizontal movement
            else
            {
                this.vel.x = 0;
            }
            
            // if moving up
            if (ig.input.state('up'))
            {
                this.vel.y = -(this.speed);
            }
            // else, if moving down
            else if (ig.input.state('down'))
            {
                this.vel.y = this.speed;
            }
            // else, no vertical movement
            else
            {
                this.vel.y = 0;
            }
            
            if (this.vel.x != 0 && this.vel.y != 0)
            {
                this.moving = true;
            }
            else
            {
                this.moving = false;
            }
            
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
        
        // called by attacking entity
        receiveDamage: function(amount, from) {
        
            return false;
            
        },
        
    });
});