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
        movingLeft: false,
        movingRight: false,
        movingUp: false,
        movingDown: false,
        canMoveUp: false,
        canMoveDown: false,
        canMoveLeft: false,
        canMoveRight: false,
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
            
            this.canMoveUp    = !this.checkForTile(0, -1);
            this.canMoveDown  = !this.checkForTile(0, 1);
            this.canMoveLeft  = !this.checkForTile(-1, 0);
            this.canMoveRight = !this.checkForTile(1, 0);
            
            // if moving left
            if (this.movingLeft)
            {
                if (this.canMoveLeft)
                {
                    this.updateDirection();
                }
                else
                {
                    this.movingLeft = false;
                    var directions = ['up', 'down'];
                    this.changeDirection(directions, 'right');
                }
            }
            
            // if moving right
            else if (this.movingRight)
            {
                if (this.canMoveRight)
                {
                    this.updateDirection();
                }
                else
                {
                    this.movingRight = false;
                    var directions = ['up', 'down'];
                    this.changeDirection(directions, 'left');
                }
            }
            
            // if moving up
            else if (this.movingUp)
            {
                if (this.canMoveUp)
                {
                    this.updateDirection();
                }
                else
                {
                    this.movingUp = false;
                    var directions = ['left', 'right'];
                    this.changeDirection(directions, 'down');
                }
            }
            
            // if moving down
            else if (this.movingDown)
            {
                if (this.canMoveDown)
                {
                    this.updateDirection();
                }
                else
                {
                    this.movingDown = false;
                    var directions = ['left', 'right'];
                    this.changeDirection(directions, 'up');
                }
            }
            
        },
        
        changeDirection: function(directions, turnAround) {
            
            var direction = turnAround;
            
            if (directions.length)
            {
                // randomly try a different direction
                var idx = Math.floor(Math.random() * directions.length);
                direction = directions.splice(idx, 1).join();
            }
            
            switch (direction)
            {
                case 'up':
                    if (this.canMoveUp)
                    {
                        this.movingUp = true;
                        this.updateDirection();
                    }
                    else
                    {
                        this.changeDirection(directions, turnAround);
                    }
                    break;
                    
                case 'down':
                    if (this.canMoveDown)
                    {
                        this.movingDown = true;
                        this.updateDirection();
                    }
                    else
                    {
                        this.changeDirection(directions, turnAround);
                    }
                    break;
                    
                case 'left':
                    if (this.canMoveLeft)
                    {
                        this.movingLeft = true;
                        this.updateDirection();
                    }
                    else
                    {
                        this.changeDirection(directions, turnAround);
                    }
                    break;
                    
                case 'right':
                    if (this.canMoveRight)
                    {
                        this.movingRight = true;
                        this.updateDirection();
                    }
                    else
                    {
                        this.changeDirection(directions, turnAround);
                    }
                    break;
            }
            
        },
        
        updateDirection: function() {
        
            this.destination.x = this.pos.x;
            this.destination.y = this.pos.y;
            
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
            
        },
        
        // called by attacking entity
        receiveDamage: function(amount, from) {
        
            return false;
            
        },
        
    });
});