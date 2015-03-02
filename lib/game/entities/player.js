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
        maxVel: {x: 0, y: 0},
        friction: {x: 0, y: 0},
        flip: false,
        speed: 50,
        jump: 0,
        health: 10,
        tileSize: 0,
        turnCounter: 0,
        animSheet: new ig.AnimationSheet('media/player.png', 10, 10),
        
        idleTime: 0.2,
        idleTimer: null,
        movingLeft: false,
        movingRight: false,
        movingUp: false,
        movingDown: false,
        destination: {x:0, y:0},
        
        idling: false,
        dying: false,
        moving: false,
        
        type: ig.Entity.TYPE.A, // add to friendly group
        checkAgainst: ig.Entity.TYPE.B, // check collisions against enemy group
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
                    this.movingLeft  = false;
                    this.movingRight = false;
                    this.movingUp    = false;
                    this.movingDown  = false;
                }
            }
            else
            {
                this.destination.x = this.pos.x;
                this.destination.y = this.pos.y;
                
                if (ig.input.state('left') && ig.game.checkForTile(this, -1, 0) === false)
                {
                    this.vel.x -= this.speed;
                    this.destination.x = (this.pos.x - this.tileSize);
                    this.moving = true;
                    this.movingLeft = true;
                    this.turnCounter++;
                    ig.game.turnCounter = this.turnCounter;
                    return;
                }
                
                if (ig.input.state('right') && ig.game.checkForTile(this, 1, 0) === false)
                {
                    this.vel.x += this.speed;
                    this.destination.x = (this.pos.x + this.tileSize);
                    this.moving = true;
                    this.movingRight = true;
                    this.turnCounter++;
                    ig.game.turnCounter = this.turnCounter;
                    return;
                }
                
                if (ig.input.state('up') && ig.game.checkForTile(this, 0, -1) === false)
                {
                    this.vel.y -= this.speed;
                    this.destination.y = (this.pos.y - this.tileSize);
                    this.moving = true;
                    this.movingUp = true;
                    this.turnCounter++;
                    ig.game.turnCounter = this.turnCounter;
                    return;
                }
                
                if (ig.input.state('down') && ig.game.checkForTile(this, 0, 1) === false)
                {
                    this.vel.y += this.speed;
                    this.destination.y = (this.pos.y + this.tileSize);
                    this.moving = true;
                    this.movingDown = true;
                    this.turnCounter++;
                    ig.game.turnCounter = this.turnCounter;
                    return;
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
        
        // call to entity during collisoin
        check: function(other) {
            
            //other.receiveDamage(0, this);
            if (other.name && other.name == 'ExitTile')
            {
                if ( ! this.moving)
                {
                    this.currentAnim.alpha = 0;
                    ig.game.stageComplete();
                }
            }
            
        },
        
        // call from entity during collisoin
        receiveDamage: function(amount, from) {
        
            return false;
            
        },
        
    });
});