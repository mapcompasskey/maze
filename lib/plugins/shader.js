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
        losShade: true,
        lightMap: null,
        shaderMap: null,
        ambientLight: 5, // 0 - 10 (transparent to opaque tiles)
        shaderTileSet: new ig.Image('media/lighttiles2.png'),

        init: function () {
            
            this.shaderMap = ig.game.getMapByName('collision');
            this.tileSize = this.shaderMap.tilesize;
            
            this.viewSize.x = this.shaderMap.width + 1;
            this.viewSize.y = this.shaderMap.height + 1;
            
            //console.log(this.shaderMap);
            console.log(this.tileSize);
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
            
        },
        
        draw: function() {
            this.lightMap.draw();
        },
        
    });
});