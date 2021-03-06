ig.module(
    'plugins.shader'
)
.requires(
	'impact.game'
)
.defines(function() {
    Shader = ig.Class.extend({
        
        viewSize: {x:0, y:0},
        tileSize: 0,
        entities: [],
        lightMap: null,
        shaderMap: null,
        redrawing: false,
        lightenTiles: [],
        brightestTile: 0, // transparent tile
        darkestTile: 10, // opaque tile
        tilesShader: new ig.Image('media/shader.png'),
        
        init: function (map) {
            
            // get a reference to the collision layer
            var mapName = (map ? map : 'collision');
            this.shaderMap = ig.game.getMapByName(mapName);
            this.tileSize = this.shaderMap.tilesize;
            
            this.viewSize.x = this.shaderMap.width + 1;
            this.viewSize.y = this.shaderMap.height + 1;
            
            var data = new Array(this.viewSize.y);
            for (var y = 0; y < this.viewSize.y; y++)
            {
                data[y] = new Array(this.viewSize.x);
                for (var x = 0; x < this.viewSize.x; x++)
                {
                    data[y][x] = this.darkestTile;
                }
            }
            
            // create new background layer
            this.lightMap = new ig.BackgroundMap(this.tileSize, data, this.tilesShader);
            this.redrawing = true;
            
        },
        
        draw: function() {
        
            // check if any entities have moved
            this.checkEntities();
            
            if (this.redrawing)
            {
                this.redraw();
                this.redrawing = false;
            }
            
            // draw the background map to the screen
            this.lightMap.draw();
            
        },
        
        // update background map
        redraw: function() {
            
            // reset the light layer
            this.reset(this.darkestTile);
            
            // track entity positions
            for (var i = 0; i < this.entities.length; i++)
            {
                var radius = this.entities[i].shaderOptions.radius;
                if ( ! isNaN(radius))
                {
                    var entityTile = this.getEntityTile(this.entities[i]);
                    this.outlineCircle(entityTile.x, entityTile.y, radius);
                    this.entities[i].shaderOptions.lastTile.x = entityTile.x;
                    this.entities[i].shaderOptions.lastTile.y = entityTile.y;
                }
                
                //var entityTile = this.getEntityTile(this.entities[i]);
                //this.calcShadeMap(entityTile.x, entityTile.y, this.entities[i].shaderOptions);
                //this.entities[i].shaderOptions.lastTile.x = entityTile.x;
                //this.entities[i].shaderOptions.lastTile.y = entityTile.y;
            }
            
        },
        
        // reset the background map
        reset: function (lightValue) {
            
            /*
            for (var y = 0; y < this.viewSize.y; y++)
            {
                for (var x = 0; x < this.viewSize.x; x++)
                {
                    this.lightMap.data[y][x] = lightValue;
                }
            }
            */
            
            var y, x;
            for (i = 0; i < this.lightenTiles.length; i++)
            {
                y = this.lightenTiles[i].y;
                x = this.lightenTiles[i].x;
                this.lightMap.data[y][x] = lightValue;
            }
            
            this.lightenTiles = [];
            
        },
        
        calcShadeMap:function (x0, y0, shaderOptions) {
            
            var radius = shaderOptions.radius;
            
            //this.fillCircle(x0, y0, 9, 9);
            //this.fillCircle(x0, y0, 8, 8);
            //this.fillCircle(x0, y0, 7, 7);
            //this.fillCircle(x0, y0, 6, 6);
            //this.fillCircle(x0, y0, 5, 5);
            //this.fillCircle(x0, y0, 4, 4);
            //this.fillCircle(x0, y0, 3, 3);
            //this.fillCircle(x0, y0, 2, 2);
            //this.fillCircle(x0, y0, 1, 1);
            //this.setTile(x0, y0);
            
            /*
            for (var i = radius; i > 1; i--)
            {
                this.fillCircle(x0, y0, i, 0);
            }
            this.setTile(x0, y0, 0);
            */
            
            this.outlineCircle(x0, y0, radius);
            
        },
        
        // fill in circle
        fillCircle: function(x0, y0, radius, tile) {
            
            if (isNaN(x0)) return;
            if (isNaN(y0)) return;
            if (isNaN(radius)) return;
            if (isNaN(tile)) return;
            
            // Bresenham's Algorithm
            var x = -radius;
            var y = 0;
            var err = 2 - (2 * radius); // Quadrant II
            do
            {
                // edge tiles
                this.setTile(x0 - x, y0 + y, tile); // Quadrant I
                this.setTile(x0 - y, y0 - x, tile); // Quadrant II
                this.setTile(x0 + x, y0 - y, tile); // Quadrant III
                this.setTile(x0 + y, y0 + x, tile); // Quadrant IV
                
                // inner tiles
                this.setTile(x0 - x - 1, y0 + y, tile); // Quadrant I
                this.setTile(x0 - y + 1, y0 - x, tile); // Quadrant II
                this.setTile(x0 + x + 1, y0 - y, tile); // Quadrant III
                this.setTile(x0 + y - 1, y0 + x, tile); // Quadrant IV
                
                // inner tiles
                this.setTile(x0 - x, y0 + y - 1, tile); // Quadrant I
                this.setTile(x0 - y, y0 - x - 1, tile); // Quadrant II
                this.setTile(x0 + x, y0 - y + 1, tile); // Quadrant III
                this.setTile(x0 + y, y0 + x + 1, tile); // Quadrant IV
                
                radius = err;
                if (radius <= y) err += ++y * 2 + 1;
                if (radius > x || err > y) err += ++x * 2 + 1;
            }
            while (x < 0);
            
        },
        
        // draw outer edge of circle
        outlineCircle: function(x0, y0, radius) {
            
            if (isNaN(x0)) return;
            if (isNaN(y0)) return;
            if (isNaN(radius)) return;
            if (radius < 0) return;
            
            var r = radius;
            
            // Bresenham's Algorithm
            var x = -radius;
            var y = 0;
            var err = 2 - (2 * radius);
            do
            {
                // edge tiles
                this.plotLines(x0, y0, (x0 - x), (y0 + y), r);
                this.plotLines(x0, y0, (x0 - y), (y0 - x), r);
                this.plotLines(x0, y0, (x0 + x), (y0 - y), r);
                this.plotLines(x0, y0, (x0 + y), (y0 + x), r);
                
                // additional inner tiles to fill in missing holes
                this.plotLines(x0, y0, (x0 - x - 1), (y0 + y), r);
                this.plotLines(x0, y0, (x0 - y), (y0 - x - 1), r);
                this.plotLines(x0, y0, (x0 + x + 1), (y0 - y), r);
                this.plotLines(x0, y0, (x0 + y), (y0 + x + 1), r);
                
                radius = err;
                if (radius <= y) err += ++y * 2 + 1;
                if (radius > x || err > y) err += ++x * 2 + 1;
            }
            while (x < 0);
            
        },
        
        // draw line from point (x0, y0) to point (x1, y1)
        plotLines: function(x0, y0, x1, y1, radius) {
            
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
            
            var tile = 0;
            var wall = false;
            
            // (10 - 0) / 8
            //var step = Math.abs((this.darkestTile - this.brightestTile) / radius);
            
            //var i = 0;
            for (;;)
            {
                //tile = Math.round(i * step);
                //i++;
                
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
                
                this.setTile(x0, y0, tile);
                
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
        
        setTile: function(x, y, tile) {
            
            if (x < 0) return;
            if (y < 0) return;
            if (x > (this.viewSize.x - 1)) return;
            if (y > (this.viewSize.y - 1)) return;
            
            this.lightMap.data[y][x] = tile;
            
            // track lighten tiles
            if (tile != this.darkestTile)
            {
                this.lightenTiles.push({y: y, x: x});
            }
            
        },
        
        checkWall: function(x, y) {
            
            if (x < 0) return true;
            if (y < 0) return true;
            if (x > (this.viewSize.x - 1)) return true;
            if (y > (this.viewSize.y - 1)) return true;
            
            if (this.shaderMap.data[y])
            {
                if (this.shaderMap.data[y][x])
                {
                    if (this.shaderMap.data[y][x] > 0)
                    {
                        return true;
                    }
                }
            }
            
            return false;
            
        },
        
        // check if tracked entities have moved
        checkEntities: function() {
            
            for (var i = 0; i < this.entities.length; i++)
            {
                var entityTile = this.getEntityTile(this.entities[i]);
                
                if (entityTile.x !== this.entities[i].shaderOptions.lastTile.x)
                {
                    this.redrawing = true;
                    return;
                }
                
                if (entityTile.y !== this.entities[i].shaderOptions.lastTile.y)
                {
                    this.redrawing = true;
                    return;
                }
            }
            
        },
        
        // get an entities position relative to a tile
        getEntityTile: function(entity) {
        
            var offsetX = (ig.game.screen.x % this.tileSize);
            var offsetY = (ig.game.screen.y % this.tileSize);
            var entityX = Math.round(((entity.pos.x - ig.game.screen.x + offsetX) / this.tileSize));
            var entityY = Math.round(((entity.pos.y - ig.game.screen.y + offsetY) / this.tileSize));
            return {x: entityX, y: entityY};
            
        },
        
        // add an entity and track it's position on screen
        addEntity: function (entity) {
        
            if (entity.shaderOptions === undefined)
            {
                entity.shaderOptions = {};
                entity.shaderOptions.radius = 8;
                entity.shaderOptions.innerRadius = 0;
                entity.shaderOptions.outerRadius = 5;
            }
            entity.shaderOptions.lastTile = {x: -1, y: -1};
            this.entities.push(entity);
            this.redrawing = true;
            
        },
        
    });
});