ig.module(
    'game.entities.minotaur'
)
.requires(
    'impact.entity'
)
.defines(function() {
    EntityMinotaur = ig.Entity.extend({
        
        name: 'minotaur',
        size: {x: 10, y: 10},
        offset: {x: 0, y: 0},
        maxVel: {x: 0, y: 0},
        friction: {x: 0, y: 0},
        flip: false,
        speed: 50,
        jump: 0,
        health: 10,
        tileSize: 0,
        turnCounter: 0,
        animSheet: new ig.AnimationSheet('media/minotaur.png', 10, 10),
        
        movingLeft: false,
        movingRight: false,
        movingUp: false,
        movingDown: false,
        canMoveUp: false,
        canMoveDown: false,
        canMoveLeft: false,
        canMoveRight: false,
        destination: {x:0, y:0},
        changeDirectionCounter: 0,
        
        dying: false,
        moving: false,
        
        type: ig.Entity.TYPE.A, // add to friendly group
        checkAgainst: ig.Entity.TYPE.NONE, // check collisions against nothing
        collides: ig.Entity.COLLIDES.PASSIVE,
        
        _wmIgnore: true,
        
        init: function(x, y, settings) {
        
            this.parent(x, y, settings);
            
            // add the animations
            this.addAnim('idle', 1, [0], true);
            this.addAnim('dead', 1, [1], true);
            
            // update parameters
            this.tileSize = ig.game.tileSize;
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
            
            if (ig.game.turnCounter != this.turnCounter)
            {
                this.updateAction();
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
            
            var directions = [];
            
            // check for open directions
            this.canMoveUp    = !ig.game.checkForTile(this, 0, -1);
            this.canMoveDown  = !ig.game.checkForTile(this, 0, 1);
            this.canMoveLeft  = !ig.game.checkForTile(this, -1, 0);
            this.canMoveRight = !ig.game.checkForTile(this, 1, 0);
            
            if (this.movingLeft)
            {
                this.movingLeft = false;
                if (this.canMoveLeft)
                {
                    directions = ['up', 'down', 'left', 'left'];
                    this.changeDirection(directions);
                }
                else
                {
                    directions = ['up', 'down'];
                    this.changeDirection(directions, 'right');
                }
                return;
            }
            
            if (this.movingRight)
            {
                this.movingRight = false;
                if (this.canMoveRight)
                {
                    directions = ['up', 'down', 'right', 'right'];
                    this.changeDirection(directions);
                }
                else
                {
                    directions = ['up', 'down'];
                    this.changeDirection(directions, 'left');
                }
                return;
            }
            
            if (this.movingUp)
            {
                this.movingUp = false;
                if (this.canMoveUp)
                {
                    directions = ['up', 'up', 'left', 'right'];
                    this.changeDirection(directions);
                }
                else
                {
                    directions = ['left', 'right'];
                    this.changeDirection(directions, 'down');
                }
                return;
            }
            
            if (this.movingDown)
            {
                this.movingDown = false;
                if (this.canMoveDown)
                {
                    directions = ['down', 'down', 'left', 'right'];
                    this.changeDirection(directions);
                }
                else
                {
                    directions = ['left', 'right'];
                    this.changeDirection(directions, 'up');
                }
                return;
            }
            
        },
        
        // pick a direction to try and move towards
        changeDirection: function(directions, turnAround) {
            
            // default is to just turn around
            var direction = (turnAround ? turnAround : '');
            
            if (directions.length)
            {
                // randomly pick a direction from the choices
                var idx = Math.floor(Math.random() * directions.length);
                direction = directions.splice(idx, 1).join();
            }
            
            if (direction == 'up' && this.canMoveUp)
            {
                this.movingUp = true;
                this.updateDirection();
                return;
            }
            
            if (direction == 'down' && this.canMoveDown)
            {
                this.movingDown = true;
                this.updateDirection();
                return;
            }
            
            if (direction == 'left' && this.canMoveLeft)
            {
                this.movingLeft = true;
                this.updateDirection();
                return;
            }
            
            if (direction == 'right' && this.canMoveRight)
            {
                this.movingRight = true;
                this.updateDirection();
                return;
            }
            
            // prevents an endless loop
            this.changeDirectionCounter++;
            if (this.changeDirectionCounter > 4)
            {
                return;
            }
            
            // try again
            this.changeDirection(directions, turnAround);
            
        },
        
        // move towards the new direction
        updateDirection: function() {
        
            this.changeDirectionCounter = 0;
            this.destination.x = this.pos.x;
            this.destination.y = this.pos.y;
            
            if (this.movingLeft)
            {
                this.vel.x -= this.speed;
                this.destination.x = (this.pos.x - this.tileSize);
                this.moving = true;
                return;
            }
            
            if (this.movingRight)
            {
                this.vel.x += this.speed;
                this.destination.x = (this.pos.x + this.tileSize);
                this.moving = true;
                return;
            }
            
            if (this.movingUp)
            {
                this.vel.y -= this.speed;
                this.destination.y = (this.pos.y - this.tileSize);
                this.moving = true;
                return;
            }
            
            if (this.movingDown)
            {
                this.vel.y += this.speed;
                this.destination.y = (this.pos.y + this.tileSize);
                this.moving = true;
                return;
            }
            
        },
        
        // called by attacking entity
        receiveDamage: function(amount, from) {
        
            return false;
            
        },
        
    });
});