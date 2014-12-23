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
        ambientLight: 10, // 0 - 10 (transparent to opaque tiles)
        tilesShader: new ig.Image('media/shader.png'),

        init: function (map) {
            
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
                    data[y][x] = this.ambientLight;
                }
            }
            
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
        
            //console.log('redraw');
            this.reset(this.ambientLight);
            
            // update entity positions
            for (var i = 0; i < this.entities.length; i++)
            {
                var entityTile = this.getEntityTile(this.entities[i]);
                this.calcShadeMap(entityTile.x, entityTile.y, this.entities[i].shaderOptions);
                this.entities[i].shaderOptions.lastTile.x = entityTile.x;
                this.entities[i].shaderOptions.lastTile.y = entityTile.y;
            }
            
        },
        
        // reset the background map
        reset: function (lightValue) {
        
            for (var y = 0; y < this.viewSize.y; y++)
            {
                for (var x = 0; x < this.viewSize.x; x++)
                {
                    this.lightMap.data[y][x] = lightValue;
                }
            }
            
        },
        
        calcShadeMap:function (x0, y0, shaderOptions) {
            
            var radius = shaderOptions.radius;
            
            //this.drawCircle(x0, y0, 9, 9);
            //this.drawCircle(x0, y0, 8, 8);
            //this.drawCircle(x0, y0, 7, 7);
            //this.drawCircle(x0, y0, 6, 6);
            //this.drawCircle(x0, y0, 5, 5);
            //this.drawCircle(x0, y0, 4, 4);
            //this.drawCircle(x0, y0, 3, 3);
            //this.drawCircle(x0, y0, 2, 2);
            //this.drawCircle(x0, y0, 1, 1);
            //this.setTile(x0, y0);
            
            for (var i = radius; i > 1; i--)
            {
                this.drawCircle(x0, y0, i, 0);
            }
            this.setTile(x0, y0, 0);
            
        },
        
        drawCircle: function(x0, y0, radius, tile) {
                
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
        
        setTile:function (x, y, tile) {
            
            if (x < 0) return;
            if (y < 0) return;
            if (x > (this.viewSize.x - 1)) return;
            if (y > (this.viewSize.y - 1)) return;
            
            this.lightMap.data[y][x] = tile;
            
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
                entity.shaderOptions.radius = 5;
                entity.shaderOptions.innerRadius = 0;
                entity.shaderOptions.outerRadius = 5;
            }
            entity.shaderOptions.lastTile = {x: -1, y: -1};
            this.entities.push(entity);
            this.redrawing = true;
            
        },
        
    });
});