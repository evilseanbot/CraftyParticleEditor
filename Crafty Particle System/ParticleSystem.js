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
	mutables: {Angle: 0, Speed: 0, Hue: 0, Saturation: 0, Brightness: 0},
    setColor: function() {
        var hsvColor = hsv2rgb(this.Hue.Current, this.Saturation.Current, this.Brightness.Current);
        
        var red = hsvColor["red"].toString(16);
        var green = hsvColor["green"].toString(16);
        var blue = hsvColor["blue"].toString(16);
        
        // Adjust this for image + non-image versions in future.        
        if (this.imageUsed && this.imageUsed != "false") {
           //entity.spriteColor("#" + red + "" + green + "" + blue, 1);
        } else {
            this.color("#" + red + "" + green + "" + blue);
        }
    
    },
	updateMutable: function(mutable) {
          var delta = (mutable.End - mutable.Start) / this.lifetime;         
          mutable.Current += delta;
	},
    init: function() {    
	    
	  for (i in this.mutables) {
	      this[i] = {};
		  this[i].Current = 0;
		  this[i].Start = 0;
		  this[i].End = 0;
      }	  
	  		
      this.bind("EnterFrame", function() {

	      for (i in this.mutables) {
		      this.updateMutable(this[i]);
		  }
        		
        this.setColor(this);
        var radToDegrees = 57.2957795;
        this._movement.x = Math.cos(this.Angle.Current/radToDegrees)*this.Speed.Current;
        this._movement.y = Math.sin(this.Angle.Current/radToDegrees)*this.Speed.Current;
                
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
    },
	createParticle: function() {
          var randomSet = {};
          var randomParticleEndSet = {};

          for (i in this.mutables) {
              randomSet[this.mutables[i]] = this.randomValue(this[this.mutables[i]].FactoryCurrent);
              randomParticleEndSet[this.mutables[i]] = randomSet[this.mutables[i]] + this.randomValue(this[this.mutables[i]].ParticleEnd);
          }       
                  
          if (this.imageUsed && this.imageUsed != "false") {                    
              var particle = Crafty.e("2D, Canvas, Multiway, Particle, Tween, SpriteColor, " + this.imageName);
              particle.imageUsed = this.imageUsed;
          } else {
              var particle = Crafty.e("2D, Canvas, Multiway, Particle, Tween, Color");
          }
		  		  		  
          particle.attr({x: randomSet.X + this.x, 
              y: randomSet.Y + this.y, 
              z: this.z, 
              h: randomSet.Height, 
              w: randomSet.Height, 
              rotation: randomSet.Rotation,
              alpha: randomSet.Alpha })
          .multiway(1, {})
          .origin("center");

          particle.lifetime = randomSet.ParticleLifetime;
          particle.imageUsed = this.imageUsed;
                    
          particle.tween({alpha: randomParticleEndSet.Alpha, 
              h: randomParticleEndSet.Height, 
              w: randomParticleEndSet.Height, 
              x: randomParticleEndSet.X + this.x,
              y: randomParticleEndSet.Y + this.y,
              rotation: randomParticleEndSet.Rotation
          }, parseInt(particle.lifetime));                    
                   
		  for (i in particle.mutables) {
		      particle[i].Start = randomSet[i];
			  particle[i].Current = particle[i].Start;
			  particle[i].End = randomParticleEndSet[i];
		  }
	
	},
    init: function()  {
      this.addComponent("2D")
        .addComponent("Canvas")

        
      for (i in this.mutables) {
          this[this.mutables[i]] = {FactoryStart: {Min: 0, Max: 1}, FactoryEnd: {Min: 0, Max: 1}, FactoryCurrent: {Min: 0, Max: 1}, ParticleEnd: {Min: 0, Max: 1} };
      }              
      
       
      function updateMutable(entity, mutable) {
          var MinDelta = (mutable.FactoryEnd.Min - mutable.FactoryStart.Min) / entity.lifetime;         
          mutable.FactoryCurrent.Min += MinDelta;
          
          var MaxDelta = (mutable.FactoryEnd.Max - mutable.FactoryStart.Max) / entity.lifetime;         
          mutable.FactoryCurrent.Max += MaxDelta;
          
      }
      
      function realParticleEnd(mutable) {
          return this.randomValue(mutable.FactoryCurrent) + this.randomValue(mutable.ParticleEnd);
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
              this.createParticle();
              this.emitsDue -= 1.0;              
              this.emitsPerSecond = this.randomValue(this.EmitsPerSecond.FactoryCurrent);
          }          
      });      
    }
});