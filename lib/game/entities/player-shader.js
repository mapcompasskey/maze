ig.module(
    'game.entities.player-shader'
)
.requires(
	'impact.entity'
)
.defines(function() {
    PlayerShader = ig.Entity.extend({
        
        viewSize: {x:0, y:0},
        tileSize: 0,
        radius: 8,
        entity: null,
        lastTile: {x:0, y:0},
        redrawing: false,
        clearTile: 0,
        brightestTile: 1, // transparent tile
        darkestTile: 10, // opaque tile
        tilesShader: new ig.Image('media/player-shader.png'),
        
        lightMap: null,
        lightMapTiles: [],
        
        gradientMap: null,
        gradientMapTiles: [],
        
        collisionMap: null,
        
        init: function (map, entity) {
            
            // get a reference to the collision layer
            var mapName = (map ? map : 'collision');
            this.collisionMap = ig.game.getMapByName(mapName);
            this.tileSize = this.collisionMap.tilesize;
            
            this.viewSize.x = this.collisionMap.width + 1;
            this.viewSize.y = this.collisionMap.height + 1;
            
            // each map needs its own array or they'll end up sharing the same one
            var data1 = new Array(this.viewSize.y);
            var data2 = new Array(this.viewSize.y);
            for (var y = 0; y < this.viewSize.y; y++)
            {
                data1[y] = new Array(this.viewSize.x);
                data2[y] = new Array(this.viewSize.x);
                for (var x = 0; x < this.viewSize.x; x++)
                {
                    data1[y][x] = this.darkestTile;
                    data2[y][x] = this.clearTile;
                }
            }
            
            // create new background layer
            this.lightMap = new ig.BackgroundMap(this.tileSize, data1, this.tilesShader);
            
            // create a layer to store the smooth lighting
            this.gradientMap = new ig.BackgroundMap(this.tileSize, data2, this.tilesShader);
            
            // start by redrawing the background layer
            this.redrawing = true;
            
            // reference the entity to track
            this.entity = entity;
            
        },
        
        draw: function(gradient) {
            
            // check if any entities have moved
            this.checkEntity();
            
            if (this.redrawing)
            {
                this.redrawMap(gradient);
                this.redrawing = false;
            }
            
            // draw the background map to the screen
            this.lightMap.draw();
            //this.gradientMap.draw();
            
        },
        
        // update light map
        redrawMap: function(gradient) {
            
            // reset the background maps
            this.resetMaps();
            
            // get entity position
            if (this.entity)
            {
                var entity = this.getEntityTile(this.entity);
                this.lastTile.x = entity.x;
                this.lastTile.y = entity.y;
                
                if (gradient)
                {
                    this.fillGradientCircle(entity.x, entity.y, this.radius);
                }
                this.plotCircle(entity.x, entity.y, this.radius);
            }
            
        },
        
        // reset the background maps
        resetMaps: function () {
            
            var y, x;
            
            // reset the light map layer
            for (i = 0; i < this.lightMapTiles.length; i++)
            {
                y = this.lightMapTiles[i].y;
                x = this.lightMapTiles[i].x;
                this.lightMap.data[y][x] = this.darkestTile;
            }
            this.lightMapTiles = [];
            
            // reset the gradient map layer
            for (i = 0; i < this.gradientMapTiles.length; i++)
            {
                y = this.gradientMapTiles[i].y;
                x = this.gradientMapTiles[i].x;
                this.gradientMap.data[y][x] = this.clearTile;
            }
            this.gradientMapTiles = [];
            
        },
        
        // draw outer edge of circle
        plotCircle: function(x0, y0, radius) {
            
            if (isNaN(x0)) return;
            if (isNaN(y0)) return;
            
            // Bresenham's Algorithm
            var x = -(radius);
            var y = 0;
            var err = 2 - (2 * radius);
            do
            {
                // edge tiles
                this.plotLine(x0, y0, (x0 - x), (y0 + y));
                this.plotLine(x0, y0, (x0 - y), (y0 - x));
                this.plotLine(x0, y0, (x0 + x), (y0 - y));
                this.plotLine(x0, y0, (x0 + y), (y0 + x));
                
                // additional inner tiles to fill in missing holes
                this.plotLine(x0, y0, (x0 - x - 1), (y0 + y));
                this.plotLine(x0, y0, (x0 - y), (y0 - x - 1));
                this.plotLine(x0, y0, (x0 + x + 1), (y0 - y));
                this.plotLine(x0, y0, (x0 + y), (y0 + x + 1));
                
                radius = err;
                if (radius <= y) err += ++y * 2 + 1;
                if (radius > x || err > y) err += ++x * 2 + 1;
            }
            while (x < 0);
            
        },
        
        // draw line from point (x0, y0) to point (x1, y1)
        plotLine: function(x0, y0, x1, y1) {
            
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
            
            var wall = false;
            var radius = this.radius;
            
            for (;;)
            {
                // check for a wall
                if (this.checkWall(x0, y0))
                {
                    wall = true;
                }
                // else, if there isn't a wall but there was one in the last loop
                else if (wall)
                {
                    return;
                }
                
                this.setLightTile(x0, y0);
                
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
                
            }
            
        },
        
        // draw circle and fill it with a radial gradient
        fillGradientCircle: function(x0, y0, radius) {
        
            var outerRadius = radius;
            var innerRadius = 0;
            var stepSize = Math.round(this.darkestTile / (outerRadius - innerRadius));
            for (var i = outerRadius; i > innerRadius; i--)
            {
                var d = 3 - (2 * i);
                var x = 0;
                var y = i;
                var shade = (i - 1 - innerRadius) * stepSize;
                if (shade > this.darkestTile) shade = this.darkestTile;
                if (shade < 0) shade = 0;
                
                do {
                    this.setGradientTile(y0 - y, x0 + x, shade);
                    this.setGradientTile(y0 - y, x0 - x, shade);
                    this.setGradientTile(y0 + y, x0 - x, shade);
                    this.setGradientTile(y0 + y, x0 + x, shade);
                    this.setGradientTile(y0 + x, x0 + y, shade);
                    this.setGradientTile(y0 - x, x0 + y, shade);
                    this.setGradientTile(y0 + x, x0 - y, shade);
                    this.setGradientTile(y0 - x, x0 - y, shade);
                    
                    // additional inner tiles to fill in missing holes
                    this.setGradientTile(y0 - x, x0 - y + 1, shade);
                    this.setGradientTile(y0 + x, x0 - y + 1, shade);
                    this.setGradientTile(y0 - x, x0 + y - 1, shade);
                    this.setGradientTile(y0 + x, x0 + y - 1, shade);
                    this.setGradientTile(y0 + y - 1, x0 + x, shade);
                    this.setGradientTile(y0 + y - 1, x0 - x, shade);
                    this.setGradientTile(y0 - y + 1, x0 - x, shade);
                    this.setGradientTile(y0 - y + 1, x0 + x, shade);
                    
                    if (d < 0)
                    {
                        d = d + (4 * x) + 6;
                    }
                    else
                    {
                        d = d + 4 * (x - y) + 10;
                        y--;
                    }
                    x++;
                }
                while (x <= y);
            }
            
        },
        
        // update a tile in the light map
        setLightTile: function(x, y) {
            
            if (x < 0) return;
            if (y < 0) return;
            if (x > (this.viewSize.x - 1)) return;
            if (y > (this.viewSize.y - 1)) return;
            
            // update tile
            this.lightMap.data[y][x] = this.gradientMap.data[y][x];
            
            // track updated tile
            this.lightMapTiles.push({y: y, x: x});
            
        },
        
        // update a tile in the gradient map
        setGradientTile: function(y, x, tile) {
            
            if (x < 0) return;
            if (y < 0) return;
            if (x > (this.viewSize.x - 1)) return;
            if (y > (this.viewSize.y - 1)) return;
            
            // update tile
            this.gradientMap.data[y][x] = tile;
            
            // track updated tile
            this.gradientMapTiles.push({y: y, x: x});
            
        },
        
        // check for a wall in the collision map
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