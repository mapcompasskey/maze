ig.module(
    'game.entities.minotaur-shader'
)
.requires(
	'impact.entity'
)
.defines(function() {
    MinotaurShader = ig.Entity.extend({
        
        viewSize: {x:0, y:0},
        tileSize: 0,
        radius: 8,
        entity: null,
        lastTile: {x:0, y:0},
        map: null,
        collisionMap: null,
        redrawing: false,
        alteredTiles: [],
        yellowTile: 2,
        redTile: 3,
        tilesShader: new ig.Image('media/minotaur-shader.png'),
        
        init: function (map, entity) {
            
            // get a reference to the collision layer
            var mapName = (map ? map : 'collision');
            this.collisionMap = ig.game.getMapByName(mapName);
            this.tileSize = this.collisionMap.tilesize;
            
            this.viewSize.x = this.collisionMap.width + 1;
            this.viewSize.y = this.collisionMap.height + 1;
            
            var data = new Array(this.viewSize.y);
            for (var y = 0; y < this.viewSize.y; y++)
            {
                data[y] = new Array(this.viewSize.x);
                for (var x = 0; x < this.viewSize.x; x++)
                {
                    //data[y][x] = this.redTile;
                    data[y][x] = 0;
                }
            }
            
            // create new background layer
            this.map = new ig.BackgroundMap(this.tileSize, data, this.tilesShader);
            this.redrawing = true;
            
            // reference the entity to track
            this.entity = entity;
            
        },
        
        draw: function() {
            
            // check if any entities have moved
            this.checkEntity();
            
            if (this.redrawing)
            {
                this.redrawMap();
                this.redrawing = false;
            }
            
            // draw the background map to the screen
            this.map.draw();
            
        },
        
        // update light map
        redrawMap: function() {
            
            // reset the light layer
            this.resetMap();
            
            // get entity position
            if (this.entity)
            {
                var entity = this.getEntityTile(this.entity);
                this.lastTile.x = entity.x;
                this.lastTile.y = entity.y;
                this.outlineCircle(entity.x, entity.y);
            }
            
        },
        
        // reset the light map
        resetMap: function () {
            
            var y, x;
            for (i = 0; i < this.alteredTiles.length; i++)
            {
                y = this.alteredTiles[i].y;
                x = this.alteredTiles[i].x;
                this.map.data[y][x] = 0;
            }
            
            this.alteredTiles = [];
            
        },
        
        // draw outer edge of circle
        outlineCircle: function(x0, y0) {
            
            if (isNaN(x0)) return;
            if (isNaN(y0)) return;
            
            // Bresenham's Algorithm
            var radius = this.radius;
            var x = -(radius);
            var y = 0;
            var err = 2 - (2 * radius);
            do
            {
                // edge tiles
                this.plotLines(x0, y0, (x0 - x), (y0 + y));
                this.plotLines(x0, y0, (x0 - y), (y0 - x));
                this.plotLines(x0, y0, (x0 + x), (y0 - y));
                this.plotLines(x0, y0, (x0 + y), (y0 + x));
                
                // additional inner tiles to fill in missing holes
                this.plotLines(x0, y0, (x0 - x - 1), (y0 + y));
                this.plotLines(x0, y0, (x0 - y), (y0 - x - 1));
                this.plotLines(x0, y0, (x0 + x + 1), (y0 - y));
                this.plotLines(x0, y0, (x0 + y), (y0 + x + 1));
                
                radius = err;
                if (radius <= y) err += ++y * 2 + 1;
                if (radius > x || err > y) err += ++x * 2 + 1;
            }
            while (x < 0);
            
        },
        
        // draw line from point (x0, y0) to point (x1, y1)
        plotLines: function(x0, y0, x1, y1) {
            
            if (isNaN(x0)) return;
            if (isNaN(y0)) return;
            if (isNaN(x1)) return;
            if (isNaN(y1)) return;
            
            var dx = Math.abs(x1 - x0);
            var dy = Math.abs(y1 - y0) * -1;
            
            var sx = (x0 < x1 ? 1 : -1);
            var sy = (y0 < y1 ? 1 : -1);
            
            var err = (dx + dy);
            var e2;
            
            var radius = this.radius;
            
            var i = 0;
            for (;;)
            {
                // check for a wall
                if (this.checkWall(x0, y0))
                {
                    return;
                }
                
                this.setTile(x0, y0, i);
                
                if (x0 == x1 && y0 == y1)
                {
                    return;
                }
                
                e2 = (2 * err);
                
                if (e2 >= dy)
                {
                    err += dy;
                    x0 += sx;
                }
                
                if (e2 <= dx)
                {
                    err += dx;
                    y0 += sy;
                }
                
                i++;
            }
            
        },
        
        setTile: function(x, y, i) {
            
            if (x < 0) return;
            if (y < 0) return;
            if (x > (this.viewSize.x - 1)) return;
            if (y > (this.viewSize.y - 1)) return;
            
            // update tile
            this.map.data[y][x] = (i < 4 ? this.redTile : this.yellowTile);
            
            // track updated tile
            this.alteredTiles.push({y: y, x: x});
            
        },
        
        checkWall: function(x, y) {
            
            if (x < 0) return true;
            if (y < 0) return true;
            if (x > (this.viewSize.x - 1)) return true;
            if (y > (this.viewSize.y - 1)) return true;
            
            if (this.collisionMap.data[y])
            {
                if (this.collisionMap.data[y][x])
                {
                    if (this.collisionMap.data[y][x] > 0)
                    {
                        return true;
                    }
                }
            }
            
            return false;
            
        },
        
        // check if entity has moved
        checkEntity: function() {
            
            if (this.entity)
            {
                var entity = this.getEntityTile(this.entity);
                
                if (entity.x !== this.lastTile.x)
                {
                    this.redrawing = true;
                    return;
                }
                
                if (entity.y !== this.lastTile.y)
                {
                    this.redrawing = true;
                    return;
                }
            }
            
        },
        
        // get entity position relative to a tile
        getEntityTile: function(entity) {
        
            var offsetX = (ig.game.screen.x % this.tileSize);
            var offsetY = (ig.game.screen.y % this.tileSize);
            var entityX = Math.round(((entity.pos.x - ig.game.screen.x + offsetX) / this.tileSize));
            var entityY = Math.round(((entity.pos.y - ig.game.screen.y + offsetY) / this.tileSize));
            return {x: entityX, y: entityY};
            
        },
        
    });
});