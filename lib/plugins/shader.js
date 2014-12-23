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
        losShade: true,
        lightMap: null,
        shaderMap: null,
        redrawing: false,
        ambientLight: 10, // 0 - 10 (transparent to opaque tiles)
        shaderTileSet: new ig.Image('media/lighttiles1.png'),

        init: function () {
            
            this.shaderMap = ig.game.getMapByName('collision');
            this.tileSize = this.shaderMap.tilesize;
            
            this.viewSize.x = this.shaderMap.width + 1;
            this.viewSize.y = this.shaderMap.height + 1;
            
            //console.log(this.shaderMap);
            //console.log(this.tileSize);
            //console.log(this.viewSize.x, this.viewSize.y);
            
            var data = new Array(this.viewSize.y);
            var losData = new Array(this.viewSize.y);
            
            for (var y = 0; y < this.viewSize.y; y++)
            {
                data[y] = new Array(this.viewSize.x);
                losData[y] = new Array(this.viewSize.x);
                
                for (var x = 0; x < this.viewSize.x; x++)
                {
                    data[y][x] = this.ambientLight;
                    losData[y][x] = 0;
                }
            }
            
            this.losData = losData;
            this.lightMap = new ig.BackgroundMap(this.tileSize, data, this.shaderTileSet);
            
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
        
            console.log('redraw');
            
            this.reset(this.ambientLight);
            
            // update entity positions
            for (var i = 0; i < this.entities.length; i++)
            {
                var entityTile = this.getEntityTile(this.entities[i]);
                this.calcShadeMap(entityTile.x, entityTile.y, this.entities[i].lightOptions);
                this.entities[i].lightOptions.lastTile.x = entityTile.x;
                this.entities[i].lightOptions.lastTile.y = entityTile.y;
            }
            
        },
        
        // reset the background map
        reset: function (lightValue) {
        
            for (var y = 0; y < this.viewSize.y; y++)
            {
                for (var x = 0; x < this.viewSize.x; x++)
                {
                    this.lightMap.data[y][x] = lightValue;
                    //this.losData[y][x] = 0;
                }
            }
            
        },
        
        calcShadeMap:function (x0, y0, lightOptions) {
            
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
            
            this.drawCircle2(x0, y0, lightOptions);
            this.setTile(x0, y0, 0);
            
        },
        
        drawCircle2: function(x0, y0, lightOptions) {
            
            var radius = lightOptions.radius;
            for (var i = radius; i > 1; i--)
            {
                var r = i;
                var tile = 0;
                
                // Bresenham's Algorithm
                var x = -r;
                var y = 0;
                var err = 2 - (2 * r); // Quadrant II
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
                    
                    r = err;
                    if (r <= y) err += ++y*2+1;
                    if (r > x || err > y) err += ++x*2+1;
                }
                while (x < 0);
            }
            
        },
        
        drawCircle: function(x0, y0, radius, lightOptions) {
        
            if (1 == 0)
            {
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
                    if (radius <= y) err += ++y*2+1;
                    if (radius > x || err > y) err += ++x*2+1;
                }
                while (x < 0);
            }
            
            if (1 == 0)
            {
                var x = radius;
                var y = 0;
                var radiusError = (1 - x);
                
                var num = 0;
                /*
                if (radius == 7) num = 2;
                if (radius == 5) num = 0;
                if (radius == 4) num = 1;
                if (radius == 3) num = 2;
                if (radius == 2) num = 3;
                if (radius == 1) num = 1;
                */
                
                while (x >= y)
                {
                    this.setTile( x + x0,  y + y0, tile);
                    this.setTile( y + x0,  x + y0, tile);
                    this.setTile(-x + x0,  y + y0, tile);
                    this.setTile(-y + x0,  x + y0, tile);
                    this.setTile(-x + x0, -y + y0, tile);
                    this.setTile(-y + x0, -x + y0, tile);
                    this.setTile( x + x0, -y + y0, tile);
                    this.setTile( y + x0, -x + y0, tile);
                    
                    y++;
                    //if (radiusError < 0)
                    if (radiusError < num)
                    {
                        radiusError += ((2 * y) + 1);
                    }
                    else
                    {
                        x--;
                        radiusError += (2 * (y - x + 1));
                    }
                }
            }
            
        },
        
        setTile:function (x, y, tile) {
            
            if (x < 0 || y < 0 || x > this.viewSize.x - 1 || y > this.viewSize.y - 1)
            {
                return;
            }
            this.lightMap.data[y][x] = tile;
            
        },
        
        /*
        calcShadeMap:function (centerX, centerY, lightOptions) {
            
            var stepSize = Math.round(this.ambientLight / (lightOptions.outerRadius - lightOptions.innerRadius));
            for (var i = lightOptions.outerRadius; i > lightOptions.innerRadius ; i--)
            {
                var d = 3 - (2 * i);
                var x = 0;
                var y = i;
                var shade = (i - 1 - lightOptions.innerRadius) * stepSize;
                shade = (shade > this.ambientLight ? this.ambientLight : shade);
                shade = (shade < 0 ? 0 : shade);
                shade = 0
                //console.log(shade);
                
                do {
                    this.setTile(centerY - y, centerX + x, shade);
                    this.setTile(centerY - y, centerX - x, shade);
                    this.setTile(centerY + y, centerX - x, shade);
                    this.setTile(centerY + y, centerX + x, shade);
                    
                    this.setTile(centerY + x, centerX + y, shade);
                    this.setTile(centerY - x, centerX + y, shade);
                    this.setTile(centerY + x, centerX - y, shade);
                    this.setTile(centerY - x, centerX - y, shade);
                    
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
        
        setTile:function (y, x, shade, forceAmbient) {
        
            shade = (shade > this.ambientLight ? this.ambientLight : shade);
            shade = (shade < 0 ? 0 : shade);
            
            if (x < 0 || y < 0 || x > this.viewSize.x - 1 || y > this.viewSize.y - 1)
            {
                return;
            }
            
            this.lightMap.data[y][x] = shade;
            
            if (1 == 0)
            {
                if ( ! (x < 0 || y < 0 || x > this.viewSize.x - 1 || y > this.viewSize.y - 1))
                {
                    if ( ! this.shadeCircle)
                    {
                        this.lightMap.data[y][x] = this.innerShade;
                    }
                    else
                    {
                        if (forceAmbient)
                        {
                            this.lightMap.data[y][x] = shade;
                        }
                        else
                        {
                            this.lightMap.data[y][x] = Math.min(shade, this.lightMap.data[y][x]);
                            if (this.losData[y][x] < 2)
                            {
                                this.losData[y][x] = 1; // I see this tile
                            }
                        }
                    }
                }
            }
        },
        */
        
        // check if tracked entities have moved
        checkEntities: function() {
            
            for (var i = 0; i < this.entities.length; i++)
            {
                var entityTile = this.getEntityTile(this.entities[i]);
                
                if (entityTile.x !== this.entities[i].lightOptions.lastTile.x)
                {
                    this.redrawing = true;
                    return;
                }
                
                if (entityTile.y !== this.entities[i].lightOptions.lastTile.y)
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
            var entityX = Math.floor(((entity.pos.x - ig.game.screen.x + offsetX) / this.tileSize));
            var entityY = Math.floor(((entity.pos.y - ig.game.screen.y + offsetY) / this.tileSize));
            return {x: entityX, y: entityY};
            
        },
        
        // add an entity and track it's position on screen
        addEntity: function (entity) {
            if (entity.lightOptions === undefined)
            {
                entity.lightOptions = {};
                entity.lightOptions.radius = 5;
                entity.lightOptions.innerRadius = 0;
                entity.lightOptions.outerRadius = 5;
            }
            entity.lightOptions.lastTile = {x: -1, y: -1};
            this.entities.push(entity);
            this.redrawing = true;
        },
        
    });
});