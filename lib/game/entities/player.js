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
        maxVel: {x: 200, y: 200},
        friction: {x: 0, y: 0},
        flip: false,
        speed: 50,
        jump: 0,
        health: 10,
        animSheet: new ig.AnimationSheet('media/player.png', 10, 10),
        
        destination: {x:0, y:0},
        
        dying: false,
        moving: false,
        movingNorth: false,
        movingSouth: false,
        movingEast: false,
        movingWest: false,
        
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
            
            // include movement plugin
            this.MoveToPoint = new MoveToPoint();
            this.MoveToPoint.minimun = 0.5;
            
        },
        
        update: function() {
        
            if (ig.game.isPaused)
            {
                return;
            }
            
            this.checkStatus();
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
            
            if ( ! this.moving)
            {
                // * can't move diagonally because I'm only checking tiles directly next to the entity
                
                this.movingNorth = false;
                this.movingSouth = false;
                this.movingEast = false;
                this.movingWest = false;
                
                var destX = this.pos.x = Math.round(this.pos.x);
                var destY = this.pos.y = Math.round(this.pos.y);
                
                // moving left
                if (ig.input.state('left'))
                {
                    if ( ! this.getTile(-1, 0))
                    {
                        this.movingWest = true;
                        destX = (this.pos.x - ig.game.tileSize);
                    }
                }
                
                // moving right
                else if (ig.input.state('right'))
                {
                    if ( ! this.getTile(1, 0))
                    {
                        this.movingEast = true;
                        destX = (this.pos.x + ig.game.tileSize);
                    }
                }
                
                // moving up
                else if (ig.input.state('up'))
                {
                    if ( ! this.getTile(0, -1))
                    {
                        this.movingNorth = true;
                        destY = (this.pos.y - ig.game.tileSize);
                    }
                }
                
                // moving down
                else if (ig.input.state('down'))
                {
                    if ( ! this.getTile(0, 1))
                    {
                        this.movingSouth = true;
                        destY = (this.pos.y + ig.game.tileSize);
                    }
                }
                
                // if moving, set new destination
                if (this.movingNorth || this.movingSouth || this.movingEast || this.movingWest)
                {
                    this.destination = {x: destX, y: destY};
                    this.MoveToPoint.setDestination(this.destination);
                    this.moving = true;
                }
            }
            else
            {
                // update velocity
                this.vel = this.MoveToPoint.getVelocity(this.speed, this);
                
                // stop if reached or passed destination
                if (this.hasReachedDestination())
                {
                    this.vel.x = 0;
                    this.vel.y = 0;
                    this.pos.x = Math.round(this.destination.x);
                    this.pos.y = Math.round(this.destination.y);
                    this.moving = false;
                    this.movingNorth = true;
                    this.movingSouth = true;
                    this.movingEast = true;
                    this.movingWest = true;
                }
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
            
        },
        
        // check if there is a tile to the side of this entity
        getTile: function(x, y) {
            
            // x: -1, 0, 1
            // y: -1, 0, 1
            
            var tileX = this.pos.x + (this.size.x / 2) + (this.size.x * x)
            var tileY = this.pos.y + (this.size.y / 2) + (this.size.y * y)
            
            if (ig.game.collisionMap.getTile(tileX, tileY) == 0)
            {
                if (x < 0) console.log('left');
                else if (x > 0) console.log('right');
                else if (y < 0) console.log('up');
                else if (y > 0) console.log('down');
                
                return false;
            }
            
            if (x < 0) console.log('no left');
            else if (x > 0) console.log('no right');
            else if (y < 0) console.log('no up');
            else if (y > 0) console.log('no down');
            
            return true;
            
        },
        
        // has entity reached or passed its desination
        hasReachedDestination: function() {
            
            // if moving horizontally
            if ((this.movingEast || this.movingWest) && this.vel.x == 0)
            {
                return true;
            }
            else if (this.movingEast && this.pos.x >= this.destination.x)
            {
                return true;
            }
            else if (this.movingWest && this.pos.x <= this.destination.x)
            {
                return true;
            }
            
            // if moving vertically
            if ((this.movingNorth || this.movingSouth) && this.vel.y == 0)
            {
                return true;
            }
            else if (this.movingNorth && this.pos.y <= this.destination.y)
            {
                return true;
            }
            else if (this.movingSouth && this.pos.y >= this.destination.y)
            {
                return true;
            }
            
            return false;
            
        },
        
        // called by attacking entity
        receiveDamage: function(amount, from) {
        
            return false;
            
        },
        
    });
});