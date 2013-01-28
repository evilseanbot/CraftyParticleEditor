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
  //rgb results = 0 ÷ 255  
  RGB['red']=Math.round(var_r * 255);
  RGB['green']=Math.round(var_g * 255);
  RGB['blue']=Math.round(var_b * 255);
  }
return RGB;  
};

Crafty.c("Particle", {
    framesExisted: 0,
    lifetime: 60,
    imageUsed: false, 
    setColor: function(entity) {
        var hsvColor = hsv2rgb(entity.HueCurrent, entity.SaturationCurrent, entity.BrightnessCurrent);
        
        var red = hsvColor["red"].toString(16);
        var green = hsvColor["green"].toString(16);
        var blue = hsvColor["blue"].toString(16);
        
        // Adjust this for image + non-image versions in future.        
        if (entity.imageUsed) {
            //this.spriteColor("#" + red + "" + green + "" + blue, 1);
        } else {
            entity.color("#" + red + "" + green + "" + blue);
        }
    
    },
    init: function() {    
    
      //this.setColor(this);
    
      this.bind("EnterFrame", function() {


      
        // Should eventually make this serialized, like the mutables.
        var delta = (this.AngleEnd - this.AngleStart) / this.lifetime;         
        this.AngleCurrent += delta;
        
        var delta = (this.SpeedEnd - this.SpeedStart) / this.lifetime;         
        this.SpeedCurrent += delta;

        var delta = (this.HueEnd - this.HueStart) / this.lifetime;         
        this.HueCurrent += delta;

        var delta = (this.SaturationEnd - this.SaturationStart) / this.lifetime;         
        this.SaturationCurrent += delta;

        var delta = (this.BrightnessEnd - this.BrightnessStart) / this.lifetime;         
        this.BrightnessCurrent += delta;
        
        this.setColor(this);
        
        var radToDegrees = 57.2957795;
        this._movement.x = Math.cos(this.AngleCurrent/radToDegrees)*this.SpeedCurrent;
        this._movement.y = Math.sin(this.AngleCurrent/radToDegrees)*this.SpeedCurrent;
                
        this.framesExisted++;              
                
        if (this.framesExisted >= this.lifetime) {
          this.destroy();
        }
      });      
    }
});

Crafty.c("ParticleSystem", {
    lifetime: 60,
    framesExisted: 0,
    color: "#ffffff",
    mutables: ["EmitsPerSecond", "ParticleLifetime", "EmitterLifetime", "Height", "Alpha", "X", "Y", "Angle", "Speed", "Hue", "Saturation", "Brightness", "Rotation"],     
    width: 1,
    emitsDue: 0,
    emitsPerSecond: 0,
    randomValue: function(range) {
          var rangeWidth = range.Max - range.Min;
          var randomFraction = (Math.random()*1000.0)/1000.0;
          return (randomFraction * rangeWidth) + range.Min;
    
    },
    load: function(src) {	
	    var entity = this;
        $.getJSON(src, function(data) {
            for (i in entity.mutables) {
                entity[entity.mutables[i]] = {};
                for (j in data[entity.mutables[i]]) {
                    entity[entity.mutables[i]][j] = {};
                    for (k in data[entity.mutables[i]][j]) {
                        entity[entity.mutables[i]][j][k] = data[entity.mutables[i]][j][k];
                    }
                    entity[entity.mutables[i]].FactoryCurrent = {Min: data[entity.mutables[i]].FactoryStart.Min, Max: data[entity.mutables[i]].FactoryStart.Max};
                }
            
            }        
            
            entity.lifetime = entity.randomValue(entity.EmitterLifetime.FactoryCurrent);
            entity.emitsPerSecond = entity.randomValue(entity.EmitsPerSecond.FactoryCurrent);            
            entity.imageUsed = data.imageUsed;
            entity.imageName = data.imageName;
        })
        .error(function(jqXHR, textStatus, errorThrown) {
            console.log("error " + textStatus);
            console.log("incoming Text " + jqXHR.responseText);
        })
        .complete(function(jqXHR, textStatus, errorThrown) {
            console.log("complete " + textStatus);
            //console.log("incoming Text " + jqXHR.responseText);
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
                  
          if (entity.imageUsed && entity.imageUsed != "false") {                    
              var particle = Crafty.e("2D, Canvas, Multiway, Particle, Tween, SpriteColor, " + entity.imageName);
              particle.imageUsed = entity.imageUsed;
			  console.log("Image is used");
          } else {
              var particle = Crafty.e("2D, Canvas, Multiway, Particle, Tween, Color")              
          }
          particle.attr({x: randomSet.X + entity.x, 
              y: randomSet.Y + entity.y, 
              z: entity.z, 
              h: randomSet.Height, 
              w: randomSet.Height, 
              rotation: randomSet.Rotation,
              alpha: randomSet.Alpha })
          .multiway(1, {})
          .origin("center");

          particle.lifetime = randomSet.ParticleLifetime;
          particle.imageUsed = entity.imageUsed;
                    
          particle.tween({alpha: randomParticleEndSet.Alpha, 
              h: randomParticleEndSet.Height, 
              w: randomParticleEndSet.Height, 
              x: randomParticleEndSet.X + entity.x,
              y: randomParticleEndSet.Y + entity.y,
              rotation: randomParticleEndSet.Rotation
          }, parseInt(particle.lifetime));                    
                    
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
          var MinDelta = (mutable.FactoryEnd.Min - mutable.FactoryStart.Min) / entity.lifetime;         
          mutable.FactoryCurrent.Min += MinDelta;
          
          var MaxDelta = (mutable.FactoryEnd.Max - mutable.FactoryStart.Max) / entity.lifetime;         
          mutable.FactoryCurrent.Max += MaxDelta;
          
      }
      
      function realParticleEnd(mutable) {
          return randomValue(mutable.FactoryCurrent) + randomValue(mutable.ParticleEnd);
      }
                
      this.bind("EnterFrame", function() {
      
      
          this.framesExisted++;        
          if (this.framesExisted > this.lifetime) {
            this.destroy();
          }
                    
          for (i in this.mutables) {
              updateMutable(this, this[this.mutables[i]]);
          }                    
                    
		  this.emitsDue += (this.emitsPerSecond / 60.0);		
                              
          while (this.emitsDue > 1) {
              createParticle(this);
              this.emitsDue -= 1.0;              
              this.emitsPerSecond = randomValue(this.EmitsPerSecond.FactoryStart);
          }          
      });      
    }
});