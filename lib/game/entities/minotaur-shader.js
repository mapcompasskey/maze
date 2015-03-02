ig.module(
    'game.entities.minotaur-shader'
)
.requires(
	'impact.entity'
)
.defines(function() {
    EntityMinotaurShader = ig.Entity.extend({
        
        viewSize: {x:0, y:0},
        tileSize: 0,
        radius: 8,
        entities: [],
        entitiesShader: [],
        lastTile: {x:0, y:0},
        redrawing: false,
        
        mapType: '',
        isGradient: false,
        clearTile: 0,
        brightestTile: 1, // transparent tile
        darkestTile: 10, // opaque tile
        tilesShader: new ig.Image('media/minotaur-shader.png'),
        
        lightMap: null,
        lightMapTiles: [],
        
        gradientMap: null,
        gradientMapTiles: [],
        
        collisionMap: null,
        
        _wmIgnore: true,
        
        init: function (map, type) {
            
            if (type == 'vision')
            {
                this.radius = 3;
                this.mapType = 'vision';
                this.tilesShader = new ig.Image('media/minotaur-shader-red.png');
            }
            
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
                    data1[y][x] = this.clearTile;
                    data2[y][x] = this.clearTile;
                }
            }
            
            // create new background layer
            this.lightMap = new ig.BackgroundMap(this.tileSize, data1, this.tilesShader);
            
            // create a layer to store the smooth lighting
            this.gradientMap = new ig.BackgroundMap(this.tileSize, data2, this.tilesShader);
            
            // start by redrawing the background layer
            this.redrawing = true;
            
        },
        
        draw: function() {
            
            // check if any entities have moved
            this.checkEntities();
            
            if (this.redrawing)
            {
                this.redrawMap();
                this.redrawing = false;
            }
            
            // update the map's positions
            this.lightMap.scroll.x = (ig.game.screen.x);
            this.lightMap.scroll.y = (ig.game.screen.y);
            
            // draw the background map to the screen
            this.lightMap.draw();
            //this.gradientMap.draw();
            
        },
        
        // update light map
        redrawMap: function() {
            
            // reset the background maps
            this.resetMaps();
            
            // check each entity position
            for (var i = 0; i < this.entities.length; i++)
            {
                if (this.entities[i] && this.entitiesShader[i])
                {
                    var entity = this.getEntityTile(this.entities[i]);
                    this.entitiesShader[i].lastTile.x = entity.x;
                    this.entitiesShader[i].lastTile.y = entity.y;
                    
                    if (this.isGradient)
                    {
                        this.fillGradientCircle(entity.x, entity.y, this.radius);
                    }
                    this.plotCircle(entity.x, entity.y, this.radius);
                }
            }
            
        },
        
        // reset the background maps
        resetMaps: function () {
            
            var i, y, x;
            
            // reset the vision map layer
            for (i = 0; i < this.lightMapTiles.length; i++)
            {
                y = this.lightMapTiles[i].y;
                x = this.lightMapTiles[i].x;
                this.lightMap.data[y][x] = this.clearTile;
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
        plotLine: function(x0, y0, x1, y1, map) {
            
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
            
            for (;;)
            {
                // check for a wall
                if (this.checkWall(x0, y0))
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
            var stepSize = (this.darkestTile / (outerRadius - innerRadius));
            for (var i = outerRadius; i > innerRadius; i--)
            {
                var d = 3 - (2 * i);
                var x = 0;
                var y = i;
                var shade = Math.round((i - 1 - innerRadius) * stepSize);
                if (shade > this.darkestTile) shade = this.darkestTile;
                if (shade < 0) shade = 0;
                
                do {
                    if (this.mapType == 'vision')
                    {
                        if (ig.game.minotaur.movingUp)
                        {
                            // N - NE
                            this.setGradientTile(y0 - y, x0 + x, shade);
                            this.setGradientTile(y0 - y + 1, x0 + x, shade);
                            
                            // N - NW
                            this.setGradientTile(y0 - y, x0 - x, shade);
                            this.setGradientTile(y0 - y + 1, x0 - x, shade);
                        }
                        else if (ig.game.minotaur.movingDown)
                        {
                            // S - SW
                            this.setGradientTile(y0 + y, x0 - x, shade);
                            this.setGradientTile(y0 + y - 1, x0 - x, shade);
                            
                            // S - SE
                            this.setGradientTile(y0 + y, x0 + x, shade);
                            this.setGradientTile(y0 + y - 1, x0 + x, shade);
                        }
                        else if (ig.game.minotaur.movingRight)
                        {
                            // E - SE
                            this.setGradientTile(y0 + x, x0 + y, shade);
                            this.setGradientTile(y0 + x, x0 + y - 1, shade);
                            
                            // E - NE
                            this.setGradientTile(y0 - x, x0 + y, shade);
                            this.setGradientTile(y0 - x, x0 + y - 1, shade);
                        }
                        else if (ig.game.minotaur.movingLeft)
                        {
                            // W - SW
                            this.setGradientTile(y0 + x, x0 - y, shade);
                            this.setGradientTile(y0 + x, x0 - y + 1, shade);
                            
                            // W - NW
                            this.setGradientTile(y0 - x, x0 - y, shade);
                            this.setGradientTile(y0 - x, x0 - y + 1, shade);
                        }
                    }
                    else
                    {
                        // N - NE
                        this.setGradientTile(y0 - y, x0 + x, shade);
                        this.setGradientTile(y0 - y + 1, x0 + x, shade);
                        
                        // N - NW
                        this.setGradientTile(y0 - y, x0 - x, shade);
                        this.setGradientTile(y0 - y + 1, x0 - x, shade);
                        
                        // S - SW
                        this.setGradientTile(y0 + y, x0 - x, shade);
                        this.setGradientTile(y0 + y - 1, x0 - x, shade);
                        
                        // S - SE
                        this.setGradientTile(y0 + y, x0 + x, shade);
                        this.setGradientTile(y0 + y - 1, x0 + x, shade);
                        
                        // E - SE
                        this.setGradientTile(y0 + x, x0 + y, shade);
                        this.setGradientTile(y0 + x, x0 + y - 1, shade);
                        
                        // E - NE
                        this.setGradientTile(y0 - x, x0 + y, shade);
                        this.setGradientTile(y0 - x, x0 + y - 1, shade);
                        
                        // W - SW
                        this.setGradientTile(y0 + x, x0 - y, shade);
                        this.setGradientTile(y0 + x, x0 - y + 1, shade);
                        
                        // W - NW
                        this.setGradientTile(y0 - x, x0 - y, shade);
                        this.setGradientTile(y0 - x, x0 - y + 1, shade);
                    }
                    
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
            if (this.isGradient)
            {
                this.lightMap.data[y][x] = this.gradientMap.data[y][x];
            }
            else
            {
                this.lightMap.data[y][x] = 5;
            }
            
            // track updated tile
            this.lightMapTiles.push({y: y, x: x});
            
        },
        
        // update a tile in the gradient map
        setGradientTile: function(y, x, tile) {
            
            if (x < 0) return;
            if (y < 0) return;
            if (x > (this.viewSize.x - 1)) return;
            if (y > (this.viewSize.y - 1)) return;
            if (isNaN(tile)) return;
            
            // update tile
            if (this.isGradient)
            {
                this.gradientMap.data[y][x] = (tile < this.brightestTile ? this.brightestTile : tile);
            }
            else
            {
                this.gradientMap.data[y][x] = this.brightestTile;
            }
            
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
        
        // check if entities has moved
        checkEntities: function() {
            
            for (var i = 0; i < this.entities.length; i++)  
            {
                if (this.entities[i])
                {
                    var entity = this.getEntityTile(this.entities[i]);
                    
                    if (entity.x !== this.entitiesShader[i].lastTile.x)
                    {
                        this.redrawing = true;
                        return;
                    }
                    
                    if (entity.y !== this.entitiesShader[i].lastTile.y)
                    {
                        this.redrawing = true;
                        return;
                    }
                }
            }
            
        },
        
        // get entity position relative to a tile
        getEntityTile: function(entity) {
        
            var entityX = Math.round(entity.pos.x / this.tileSize);
            var entityY = Math.round(entity.pos.y / this.tileSize);
            return {x: entityX, y: entityY};
            
        },
        
        // add entity to track
        addEntity: function(entity) {
            
            // tracker for entities last position
            // *can't be attached to the entity since another instance of this class would update the variables
            var entityShader = {
                lastTile: {
                    x: 0,
                    y: 0
                }
            }
            this.entitiesShader.push(entityShader);
            
            // track entity
            this.entities.push(entity);
            
        },
        
    });
});