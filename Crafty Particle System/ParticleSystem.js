function hsv2rgb(h,s,v) {
// Adapted from http://www.easyrgb.com/math.html
// hsv values = 0 - 1, rgb values = 0 - 255
var r, g, b;
var RGB = new Array();
if(s==0){
  RGB['red']=RGB['green']=RGB['blue']=Math.round(v*255);
}else{
  // h must be < 1
  var var_h = h * 6;
  if (var_h==6) var_h = 0;
  //Or ... var_i = floor( var_h )
  var var_i = Math.floor( var_h );
  var var_1 = v*(1-s);
  var var_2 = v*(1-s*(var_h-var_i));
  var var_3 = v*(1-s*(1-(var_h-var_i)));
  if(var_i==0){ 
    var_r = v; 
    var_g = var_3; 
    var_b = var_1;
  }else if(var_i==1){ 
    var_r = var_2;
    var_g = v;
    var_b = var_1;
  }else if(var_i==2){
    var_r = var_1;
    var_g = v;
    var_b = var_3
  }else if(var_i==3){
    var_r = var_1;
    var_g = var_2;
    var_b = v;
  }else if (var_i==4){
    var_r = var_3;
    var_g = var_1;
    var_b = v;
  }else{ 
    var_r = v;
    var_g = var_1;
    var_b = var_2
  }
  //rgb results = 0 � 255  
  RGB['red']=Math.round(var_r * 255);
  RGB['green']=Math.round(var_g * 255);
  RGB['blue']=Math.round(var_b * 255);
  }
return RGB;  
};

Crafty.c("Particle", {
    timeToLive: 60,
    lifeTime: 0.00,
    init: function() {    
      this.bind("EnterFrame", function() {


        var delta = (this.AngleEnd - this.AngleStart) / this.timeToLive;         
        this.AngleCurrent += delta;
        
        var delta = (this.SpeedEnd - this.SpeedStart) / this.timeToLive;         
        this.SpeedCurrent += delta;

        var delta = (this.HueEnd - this.HueStart) / this.timeToLive;         
        this.HueCurrent += delta;

        var delta = (this.SaturationEnd - this.SaturationStart) / this.timeToLive;         
        this.SaturationCurrent += delta;

        var delta = (this.BrightnessEnd - this.BrightnessStart) / this.timeToLive;         
        this.BrightnessCurrent += delta;
        
        var hsvColor = hsv2rgb(this.HueCurrent, this.SaturationCurrent, this.BrightnessCurrent);
        
        var red = hsvColor["red"].toString(16);
        var green = hsvColor["green"].toString(16);
        var blue = hsvColor["blue"].toString(16);
                
        this.color("#" + red + "" + green + "" + blue);
        
        
        var radToDegrees = 57.2957795;
        this._movement.x = Math.cos(this.AngleCurrent/radToDegrees)*this.SpeedCurrent;
        this._movement.y = Math.sin(this.AngleCurrent/radToDegrees)*this.SpeedCurrent;
        
        //console.log("Particle z: " + this.z + "Particle x: " + this.x + "Particle y: " + this.y);
        
        this.lifeTime++;              
        
        if (this.lifeTime >= this.timeToLive) {
          this.destroy();
        }
      });      
    }
});

Crafty.c("ParticleSystem", {
    timeToLive: 60.0,
    lifeTime: 0,
    color: "#000000",
    mutables: ["Height", "Alpha", "X", "Y", "Angle", "Speed", "Hue", "Saturation", "Brightness", "Rotation"], 
    
    width: 1,
    emitsPerSecond: 10,
    framesSinceEmit: 0,
    particleTimeToLive: 60,
    load: function(entity, src) {
        $.getJSON("snowDig.json", function(data) {
            for (i in data) {
                entity[i] = {};
                for (j in data[i]) {
                    entity[i][j] = {};
                    for (k in data[i][j]) {
                        entity[i][j][k] = data[i][j][k];
                    }
                    entity[i].FactoryCurrent = {Min: data[i].FactoryStart.Min, Max: data[i].FactoryStart.Max};
                }
            
            }        
        })
        .error(function(jqXHR, textStatus, errorThrown) {
            console.log("error " + textStatus);
            console.log("incoming Text " + jqXHR.responseText);
        })
        .complete(function(jqXHR, textStatus, errorThrown) {
            console.log("complete " + textStatus);
            console.log("incoming Text " + jqXHR.responseText);
        });
        /*$.ajax({
            url: 'testParticle.json',
            dataType: 'json',
            success: function( data ) {
              alert( "SUCCESS:  " + data );
            },
            error: function( data ) {
              alert( "ERROR:  ");
              for (i in data) {
                  console.log(i + ": " +data[i]);
              }
            }
          });*/        
        
    },
    init: function()  {
      this.addComponent("2D")
        .addComponent("Canvas")

        
      for (i in this.mutables) {
          this[this.mutables[i]] = {FactoryStart: {Min: 0, Max: 1}, FactoryEnd: {Min: 0, Max: 1}, FactoryCurrent: {Min: 0, Max: 1}, ParticleEnd: {Min: 0, Max: 1} };
      }              
      
      function randomValue(range) {
          var rangeWidth = range.Max - range.Min;
          var randomFraction = (Math.random()*1000.0)/1000.0;
          return (randomFraction * rangeWidth) + range.Min;
      }

      function createParticle(entity) {       

          var randomSet = {};
          var randomParticleEndSet = {};

          for (i in entity.mutables) {
              randomSet[entity.mutables[i]] = randomValue(entity[entity.mutables[i]].FactoryCurrent);
              randomParticleEndSet[entity.mutables[i]] = randomSet[entity.mutables[i]] + randomValue(entity[entity.mutables[i]].ParticleEnd);
          }                
          
          var particle = Crafty.e("2D, Canvas, Multiway, Particle, Color, Tween")          
          .attr({x: randomSet.X + entity.x, 
              y: randomSet.Y + entity.y, 
              z: entity.z, 
              h: randomSet.Height, 
              w: randomSet.Height, 
              rotation: randomSet.Rotation,
              alpha: randomSet.Alpha })
          .multiway(1, {})
          .color(entity.color)
          .origin("center");

          particle.timeToLive = entity.particleTimeToLive;
                    
          particle.tween({alpha: randomParticleEndSet.Alpha, 
              h: randomParticleEndSet.Height, 
              w: randomParticleEndSet.Height, 
              x: randomParticleEndSet.X + entity.x,
              y: randomParticleEndSet.Y + entity.y,
              rotation: randomParticleEndSet.Rotation
          }, parseInt(particle.timeToLive));                    
                    
          particle.AngleStart = randomSet.Angle;
          particle.AngleCurrent = particle.AngleStart;          
          particle.AngleEnd = randomParticleEndSet.Angle;
                    
          particle.SpeedStart = randomSet.Speed;
          particle.SpeedCurrent = particle.SpeedStart;          
          particle.SpeedEnd = randomParticleEndSet.Speed;                              
          
          particle.HueStart = randomSet.Hue;
          particle.HueCurrent = particle.HueStart;          
          particle.HueEnd = randomParticleEndSet.Hue;                              

          particle.SaturationStart = randomSet.Saturation;
          particle.SaturationCurrent = particle.SaturationStart;          
          particle.SaturationEnd = randomParticleEndSet.Saturation;                              

          particle.BrightnessStart = randomSet.Brightness;
          particle.BrightnessCurrent = particle.BrightnessStart;          
          particle.BrightnessEnd = randomParticleEndSet.Brightness;                              
          
       }      
       
      function updateMutable(entity, mutable) {
          var MinDelta = (mutable.FactoryEnd.Min - mutable.FactoryStart.Min) / entity.timeToLive;         
          mutable.FactoryCurrent.Min += MinDelta;
          
          var MaxDelta = (mutable.FactoryEnd.Max - mutable.FactoryStart.Max) / entity.timeToLive;         
          mutable.FactoryCurrent.Max += MaxDelta;
          
      }
      
      function realParticleEnd(mutable) {
          return randomValue(mutable.FactoryCurrent) + randomValue(mutable.ParticleEnd);
      }
                
      this.bind("EnterFrame", function() {
      
      
          this.lifeTime++;        
          if (this.lifeTime > this.timeToLive) {
            this.destroy();
          }
                    
          for (i in this.mutables) {
              updateMutable(this, this[this.mutables[i]]);
          }                    
                    
          this.framesSinceEmit++;
          
          if (this.framesSinceEmit > (60.0 / this.emitsPerSecond) ) {
              createParticle(this);
              this.framesSinceEmit = 0;
          }          
      });      
    }
});