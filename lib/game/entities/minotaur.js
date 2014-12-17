ig.module(
    'game.entities.minotaur'
)
.requires(
    'impact.entity'
)
.defines(function() {
    EntityMinotaur = ig.Entity.extend({
        
        size: {x: 10, y: 10},
        offset: {x: 0, y: 0},
        maxVel: {x: 0, y: 0},
        friction: {x: 0, y: 0},
        flip: false,
        speed: 50,
        jump: 0,
        health: 10,
        animSheet: new ig.AnimationSheet('media/minotaur.png', 10, 10),
        
        idleTime: 0.2,
        idleTimer: null,
        //actionTime: 1,
        //actionTimer: null,
        movingLeft: false,
        movingRight: false,
        movingUp: false,
        movingDown: false,
        destination: {x:0, y:0},
        
        idling: false,
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
            ig.game.minotaur = this;
            this.maxVel = {x: this.speed, y: this.speed};
            
            // start moving
            this.movingLeft = true;
            this.updateAction();
            
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
            
            // if action timer ended
            //if (this.actionTimer)
            //{
                //if (this.actionTimer.delta() > 0)
                //{
                    //this.updateAction();
                //}
            //}
            
            // check entity status
            this.isHurting();
            this.isIdling();
            this.isMoving();
            this.animate();
            
        },
        
        // check if hurting
        isHurting: function() {
            
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
            
        },
        
        // check if can't move
        isIdling: function() {
            
            if (this.dying)
            {
                return;
            }
            
            if (this.idling && this.idleTimer)
            {
                if (this.idleTimer.delta() > 0)
                {
                    this.idling = false;
                    this.updateAction();
                }
            }
            
        },
        
        // check if moving
        isMoving: function() {
        
            if (this.dying || this.idling)
            {
                return;
            }
            
            if (this.moving)
            {
                if (this.hasReachedDestination())
                {
                    this.idling = true;
                    this.idleTimer = new ig.Timer(this.idleTime);
                    
                    this.vel.x = 0;
                    this.vel.y = 0;
                    this.pos.x = Math.round(this.destination.x);
                    this.pos.y = Math.round(this.destination.y);
                    this.moving = false;
                }
            }
            
            /*
            if (this.moving)
            {
                if (this.hasReachedDestination())
                {
                    this.idling = true;
                    this.idleTimer = new ig.Timer(this.idleTime);
                    
                    this.vel.x = 0;
                    this.vel.y = 0;
                    this.pos.x = Math.round(this.destination.x);
                    this.pos.y = Math.round(this.destination.y);
                    this.moving = false;
                }
            }
            else
            {
                this.destination.x = this.pos.x;
                this.destination.y = this.pos.y;
                
                this.movingLeft  = ig.input.state('left');
                this.movingRight = ig.input.state('right');
                this.movingUp    = ig.input.state('up');
                this.movingDown  = ig.input.state('down');
                
                // moving left
                if (this.movingLeft && ! this.checkForTile(-1, 0))
                {
                    this.vel.x -= this.speed;
                    this.destination.x = (this.pos.x - ig.game.tileSize);
                    this.moving = true;
                }
                
                // moving right
                else if (this.movingRight && ! this.checkForTile(1, 0))
                {
                    this.vel.x += this.speed;
                    this.destination.x = (this.pos.x + ig.game.tileSize);
                    this.moving = true;
                }
                
                // moving up
                else if (this.movingUp && ! this.checkForTile(0, -1))
                {
                    this.vel.y -= this.speed;
                    this.destination.y = (this.pos.y - ig.game.tileSize);
                    this.moving = true;
                }
                
                // moving down
                else if (this.movingDown && ! this.checkForTile(0, 1))
                {
                    this.vel.y += this.speed;
                    this.destination.y = (this.pos.y + ig.game.tileSize);
                    this.moving = true;
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
        
        // check for a tile
        checkForTile: function(x, y) {
            
            // x: -1, 0, 1
            // y: -1, 0, 1
            
            var tileX = this.pos.x + (this.size.x / 2) + (this.size.x * x)
            var tileY = this.pos.y + (this.size.y / 2) + (this.size.y * y)
            
            if (ig.game.collisionMap.getTile(tileX, tileY) == 0)
            {
                return false;
            }
            
            return true;
            
        },
        
        // has entity reached or passed its desination
        hasReachedDestination: function() {
            
            // if moving horizontally
            if ((this.movingRight || this.movingLeft) && this.vel.x == 0)
            {
                return true;
            }
            else if (this.movingRight && this.pos.x >= this.destination.x)
            {
                return true;
            }
            else if (this.movingLeft && this.pos.x <= this.destination.x)
            {
                return true;
            }
            
            // if moving vertically
            if ((this.movingUp || this.movingDown) && this.vel.y == 0)
            {
                return true;
            }
            else if (this.movingUp && this.pos.y <= this.destination.y)
            {
                return true;
            }
            else if (this.movingDown && this.pos.y >= this.destination.y)
            {
                return true;
            }
            
            return false;
            
        },
        
        // update entity action
        updateAction: function() {
            
            if (this.dying)
            {
                return;
            }
            
            
            //this.movingLeft  = ig.input.state('left');
            //this.movingRight = ig.input.state('right');
            //this.movingUp    = ig.input.state('up');
            //this.movingDown  = ig.input.state('down');
            
            this.destination.x = this.pos.x;
            this.destination.y = this.pos.y;
            
            // moving left and hit a wall
            if (this.movingLeft && this.checkForTile(-1, 0))
            {
                this.movingLeft = false;
                
                // if can go down
                if ( ! this.checkForTile(0, 1))
                {
                    this.movingDown = true;
                }
                // else, if can go up
                else if ( ! this.checkForTile(0, -1))
                {
                    this.movingUp = true;
                }
                // else, go back
                else
                {
                    this.movingRight = true;
                }
            }
            
            // moving right and hit a wall
            else if (this.movingRight && this.checkForTile(1, 0))
            {
                this.movingRight = false;
                
                // if can go down
                if ( ! this.checkForTile(0, 1))
                {
                    this.movingDown = true;
                }
                // else, if can go up
                else if ( ! this.checkForTile(0, -1))
                {
                    this.movingUp = true;
                }
                // else, go back
                else
                {
                    this.movingLeft = true;
                }
            }
            
            // moving up and hit a wall
            else if (this.movingUp && this.checkForTile(0, -1))
            {
                this.movingUp = false;
                
                // if can go left
                if ( ! this.checkForTile(-1, 0))
                {
                    this.movingLeft = true;
                }
                // else, if can go right
                else if ( ! this.checkForTile(1, 0))
                {
                    this.movingRight = true;
                }
                // else, go back
                else
                {
                    this.movingDown = true;
                }
            }
            
            // moving down and hit a wall
            else if (this.movingDown && this.checkForTile(0, 1))
            {
                this.movingDown = false;
                
                // if can go left
                if ( ! this.checkForTile(-1, 0))
                {
                    this.movingLeft = true;
                }
                // else, if can go right
                else if ( ! this.checkForTile(1, 0))
                {
                    this.movingRight = true;
                }
                // else, go back
                else
                {
                    this.movingUp = true;
                }
            }
            
            
            // moving left
            if (this.movingLeft)
            {
                this.vel.x -= this.speed;
                this.destination.x = (this.pos.x - ig.game.tileSize);
                this.moving = true;
            }
            
            // moving right
            else if (this.movingRight)
            {
                this.vel.x += this.speed;
                this.destination.x = (this.pos.x + ig.game.tileSize);
                this.moving = true;
            }
            
            // moving up
            else if (this.movingUp)
            {
                this.vel.y -= this.speed;
                this.destination.y = (this.pos.y - ig.game.tileSize);
                this.moving = true;
            }
            
            // moving down
            else if (this.movingDown)
            {
                this.vel.y += this.speed;
                this.destination.y = (this.pos.y + ig.game.tileSize);
                this.moving = true;
            }
            
            
            
            /*
            // get a random number 1 - 5
            var num = Math.floor((Math.random() * 5) + 1);
            switch (num)
            {
                // walk right
                case 5:
                case 4:
                    this.flip = false;
                    this.walking = true;
                    break;
                
                // walk left
                case 3:
                case 2:
                    this.flip = true;
                    this.walking = true;
                    break;
                
                // stand still
                default:
                    this.walking = false;
            }
            */
            
            // reset action timer
            //this.actionTimer = new ig.Timer(this.actionTime);
            
        },
        
        // called by attacking entity
        receiveDamage: function(amount, from) {
        
            return false;
            
        },
        
    });
});