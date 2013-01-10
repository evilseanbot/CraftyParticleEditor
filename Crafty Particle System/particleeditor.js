var draggedElement;
var mutables = ["EmitsPerSecond", "ParticleLifetime", "EmitterLifetime", "Height", "Alpha", "X", "Y", "Angle", "Speed", "Hue", "Saturation", "Brightness", "Rotation"];
var mutableBottomValues = {EmitsPerSecond: 0, ParticleLifetime: 0, EmitterLifetime: 0, Height: 0, Alpha: 0.00, X: -160, Y: -120, Angle: 0, Speed: 0, Hue: 0, Saturation: 0, Brightness: 0, Rotation: 0};
var mutableTopValues = {EmitsPerSecond: 180, ParticleLifetime: 240, EmitterLifetime: 240, Height: 32, Alpha: 1.00, X: 160, Y: 120, Angle: 360, Speed: 8, Hue: 1, Saturation: 1, Brightness: 1, Rotation: 360};

var middleLowValues = {};

for (i in mutables) {
    middleLowValues[mutables[i]] = mutableBottomValues[mutables[i]] + ( (mutableTopValues[mutables[i]]-mutableBottomValues[mutables[i]]) / 4.0 );
}

var modelSystem = {};

for (i in mutables) {
    modelSystem[mutables[i]] = {FactoryStart: {Min: middleLowValues[mutables[i]], Max: middleLowValues[mutables[i]]}, 
        FactoryEnd: {Min: middleLowValues[mutables[i]], Max: middleLowValues[mutables[i]]}, 
        ParticleEnd: {Min: middleLowValues[mutables[i]], Max: middleLowValues[mutables[i]]}
    };
}    


function size (obj) {
    var size = 0, key;
    for (key in obj) {
        size++;
    }
    return size;
}; 
 
         function changeShiftingRandomSetter(mutable, timeAxis, randomAxis, setFraction, knobPos) {
            //$("#"+mutable+""+timeAxis+""+randomAxis+"Knob").css("left", knobPos);
            arrangeDots(mutable);
            
            var bottomValue = mutableBottomValues[mutable];
            var topValue = mutableTopValues[mutable];
                        
            var bottomTopDiff = topValue - bottomValue;

            particleEndFraction = (setFraction-0.50)*2;
            
            if (timeAxis == "ParticleEnd") {
                var resultValue = bottomTopDiff * particleEndFraction;
            } else {
                var resultValue = bottomValue + (bottomTopDiff*setFraction);
            }
            
            
            modelSystem[mutable][timeAxis][randomAxis] = resultValue;            
        }
        
        function changeShiftingSetter(mutable, timeAxis, setFraction, knobPos) {
            $("#"+mutable+""+timeAxis+"Knob").css("left", knobPos);
            changeShiftingRandomSetter(mutable, timeAxis, "Min", setFraction, knobPos);
            changeShiftingRandomSetter(mutable, timeAxis, "Max", setFraction, knobPos);            
        }        

        function changeSetter(mutable, setFraction, knobPos) {
            $("#"+mutable+"Knob").css("left", knobPos);
            changeShiftingSetter(mutable, "FactoryStart", setFraction, knobPos);
            changeShiftingSetter(mutable, "FactoryEnd", setFraction, knobPos);
            changeShiftingSetter(mutable, "ParticleEnd", 0.50, 180);
            
            changeRandomSetter(mutable, "Min", setFraction, knobPos);
            changeRandomSetter(mutable, "Max", setFraction, knobPos+10);           
        }
        
        function changeRandomSetter(mutable, randomAxis, setFraction, knobPos) {
            $("#"+mutable+""+randomAxis+"Knob").css("left", knobPos);
            changeShiftingRandomSetter(mutable, "FactoryStart", randomAxis, setFraction, knobPos);
            changeShiftingRandomSetter(mutable, "FactoryEnd", randomAxis, setFraction, knobPos);
            changeShiftingRandomSetter(mutable, "ParticleEnd", randomAxis, 0.50, 180);
            
            if (randomAxis == "Min" && parseFloat($("#"+mutable+"MaxKnob").css("left")+10) < parseFloat($("#"+mutable+"MinKnob").css("left"))) {
                changeRandomSetter(mutable, "Max", setFraction+.025, knobPos+10);
            } else if (randomAxis == "Max" && parseFloat($("#"+mutable+"MaxKnob").css("left")+10) < parseFloat($("#"+mutable+"MinKnob").css("left"))) {
                changeRandomSetter(mutable, "Min", setFraction-.025, knobPos-10);
            }
            
        }
        
        
        function arrangeDots(setter) {
            var delta = ( parseFloat($("#"+setter+"FactoryEndKnob").css("left")) - parseFloat($("#"+setter+"FactoryStartKnob").css("left")) ) / 21;
            var lifetimeDiff = (parseFloat($("#"+setter+"ParticleEndKnob").css("left")) - 180)*2;
        
            for (var i = 1; i < 21; i++) {
                $("#"+setter+"Spot"+i).css("left", parseFloat($("#"+setter+"FactoryStartKnob").css("left")) + delta*i + 10 - 2); 
                $("#"+setter+"Spot"+i).css("top", -2.5*i);                
            } 

            for (var i = 1; i < 21; i++) {
                $("#"+setter+"BlueSpot"+i).css("left", parseFloat($("#"+setter+"FactoryStartKnob").css("left")) + delta*i + 10 + lifetimeDiff); 
                $("#"+setter+"BlueSpot"+i).css("top", (-2.5*i) -100);                
            } 
            
            
        }
        
        function createSetter(setter, bottomValue, topValue) {
            
            //Create the HTML elements:
            
            $("#setters").append(
"<div class='setterDiv'>"+
"                <b>"+setter+":</b><input type='checkbox' id='"+setter+"ShiftingCheck'></input>Shifting <input type='checkbox' id='"+setter+"RandomCheck'></input>Random"+
"                <div id='"+setter+"SlidersShifting' style='display: none'>"+
"                    <div class='slider' id='"+setter+"FactoryStartSlider'><span style='position: absolute'>Start</span><span style='position: absolute; left: 380px'>"+topValue+"</span>"+
"                        <hr style='position: relative; top: 18px'>            "+
"                        <div class='fullKnob' id='"+setter+"FactoryStartKnob'></div>"+
"                    </div>"+
"                    "+
"                    <div class='betweenSlider' id='between"+setter+"Slider'>"+
"                    </div>"+
""+
"                    <div class='slider' id='"+setter+"FactoryEndSlider'><span style='position: absolute'>End</span>"+
"                        <hr style='position: relative; top: 18px'>            "+
"                        <div class='fullKnob' id='"+setter+"FactoryEndKnob'></div>"+
"                    </div>            "+
"                    <div class='slider' id='"+setter+"ParticleEndSlider'><span style='position: absolute'>Particle end</span>"+
"                        <hr style='position: relative; top: 18px'>            "+
"                        <div class='fullKnob' id='"+setter+"ParticleEndKnob'></div>"+
"                    </div>            "+
// "                    <input type='text' id='start"+setter+"' style='display: none' value='"+(minValue+maxValue/2.0)+"'></input>"+
// "                    <input type='text' id='end"+setter+"' style='display: none' value='"+(minValue+maxValue/2.0)+"'></input>"+
// "                    <input type='text' id='particleEnd"+setter+"' style='display: none' value='0'></input>"+
"                </div>"+
"                <div id='"+setter+"Sliders'>"+
"                    <div class='slider' id='"+setter+"Slider'><span style='position: absolute'>Start</span><span style='position: absolute; left: 380px'>"+topValue+"</span>"+
"                        <hr style='position: relative; top: 18px'>            "+
"                        <div class='fullKnob' id='"+setter+"Knob'></div>"+
"                    </div>"+
"                </div>"+
"                <div id='"+setter+"SlidersRandom' style='display: none'>"+
"                    <div class='slider' id='"+setter+"RandomSlider'><span style='position: absolute'>Start</span><span style='position: absolute; left: 380px'>"+topValue+"</span>"+
"                        <hr style='position: relative; top: 18px'>            "+
"                        <div class='minKnob' id='"+setter+"MinKnob'></div>"+
"                        <div class='maxKnob' id='"+setter+"MaxKnob'></div>"+
"                    </div>"+
"                </div>"+
"          "+
"            </div>"            
            )

            for (var i = 1; i < 21; i++) {
                $("#between"+setter+"Slider").append("<div class='spot' id='"+setter+"Spot"+i+"'></div>")
            }
            for (var i = 1; i < 21; i++) {
                $("#between"+setter+"Slider").append("<div class='blueSpot' id='"+setter+"BlueSpot"+i+"'></div>")
            }
            
            
            arrangeDots(setter);
        
            $(".slider").mousemove(function(event) {                                                
                if (draggedElement == setter+"FactoryStartSlider") {
                    changeShiftingSetter(setter, "FactoryStart", (event.pageX-20)/400.0, event.pageX-20);
                } else if (draggedElement == setter+"FactoryEndSlider") {
                    changeShiftingSetter(setter, "FactoryEnd", (event.pageX-20)/400.0, event.pageX-20);
                } else if (draggedElement == setter+"ParticleEndSlider") {
                    changeShiftingSetter(setter, "ParticleEnd", (event.pageX-20)/400, event.pageX-20);

                } else if (draggedElement == setter+"Slider") {
                    changeSetter(setter, (event.pageX-20)/400.0, event.pageX-20);
                    
                } else if (draggedElement == setter+"MinSlider") {
                    changeRandomSetter(setter, "Min", (event.pageX-20)/400, event.pageX-20);
                } else if (draggedElement == setter+"MaxSlider") {
                    changeRandomSetter(setter, "Max", (event.pageX-20)/400, event.pageX-20);
                } 
                
                if (draggedElement) {
                    addParticleSystem();    
                }
                
                
                    
            });
                        
            $("#"+setter+"FactoryStartSlider").mousedown(function(event) {
                draggedElement = setter+"FactoryStartSlider";
                changeShiftingSetter(setter, "FactoryStart", (event.pageX-20)/400.0, event.pageX-20);
                    addParticleSystem();                    
            });
            
            $("#"+setter+"FactoryEndSlider").mousedown(function(event) {
                draggedElement = setter+"FactoryEndSlider";
                changeShiftingSetter(setter, "FactoryEnd", (event.pageX-20)/400.0, event.pageX-20);
                    addParticleSystem();                    
            });
            
            $("#"+setter+"ParticleEndSlider").mousedown(function(event) {
                draggedElement = setter+"ParticleEndSlider";
                changeShiftingSetter(setter, "ParticleEnd", (event.pageX-20)/400, event.pageX-20);
                    addParticleSystem();                    
            });
            

            $("#"+setter+"Slider").mousedown(function(event) {
                draggedElement = setter+"Slider";
                changeSetter(setter, (event.pageX-20)/400.0, event.pageX-20);
                    addParticleSystem();                    
            });            
            
            $("#"+setter+"RandomSlider").mousedown(function(event) {
                
                var distanceToMin = Math.abs(event.pageX - parseFloat($("#"+setter+"MinKnob").css("left")));
                var distanceToMax = Math.abs(event.pageX - parseFloat($("#"+setter+"MaxKnob").css("left")));
                
                
                if (distanceToMin < distanceToMax) {
                    draggedElement = setter+"MinSlider";                
                    changeRandomSetter(setter, "Min", (event.pageX-20)/400.0, event.pageX-20);                    
                    addParticleSystem();    
                    
                } else {
                    draggedElement = setter+"MaxSlider";                
                    changeRandomSetter(setter, "Max", (event.pageX-20)/400.0, event.pageX-20);                                    
                    addParticleSystem();    
                    
                }
            });
            
            $(document).mouseup(function() {
                draggedElement = false;
            });
            
            $("#"+setter+"ShiftingCheck").change(function() {
                if ($("#"+setter+"ShiftingCheck").is(':checked')) {
                    $("#"+setter+"SlidersShifting").css("display", "block");
                    $("#"+setter+"Sliders").css("display", "none");                    
                } else {
                    $("#"+setter+"SlidersShifting").css("display", "none");
                    $("#"+setter+"Sliders").css("display", "block");       
                }
            });
            
            $("#"+setter+"RandomCheck").change(function() {
                if ($("#"+setter+"RandomCheck").is(':checked')) {
                    $("#"+setter+"Sliders").css("display", "none");                    
                    $("#"+setter+"SlidersRandom").css("display", "block");                                        
                } else {
                    $("#"+setter+"Sliders").css("display", "block");       
                    $("#"+setter+"SlidersRandom").css("display", "none");                                                            
                }
            });
            
            
            
            
        }
        
  function addParticleSystem() {    
        Crafty("ParticleSystem").destroy();
        Crafty("Particle").destroy();        
  
      var system = Crafty.e("ParticleSystem")
          .attr({x: 160, y: 120});   
      
      for (i in modelSystem) {
          system[i] = {};
          for (j in modelSystem[i]) {
              system[i][j] = {};
              for (k in modelSystem[i][j]) {
                  system[i][j][k] = modelSystem[i][j][k];
              }
          }
          
          system[i].FactoryCurrent = {Min: modelSystem[i].FactoryStart.Min, Max: modelSystem[i].FactoryStart.Max}                          
      }
      
      system.lifetime = system.randomValue(system.EmitterLifetime.FactoryCurrent);
      system.emitsPerSecond = system.randomValue(system.EmitsPerSecond.FactoryCurrent);           
  }
  
  function space (num) {
      var spaces = "";
      for (var i = 0; i < num; i++) {
          spaces += "&nbsp;";          
      }
      return spaces;
  }
  
  function generateJson() {
     var iindex = 0, jindex = 0, kindex = 0;      
  
  
      $("#jsoncode").html("{<br>");
      for (i in modelSystem) {
          $("#jsoncode").append(space(4)+i+": {<br>");             
          
          jindex = 0;          
          for (j in modelSystem[i]) {
              $("#jsoncode").append(space(8)+j+": {<br>");              
              
              
              kindex = 0;
              for (k in modelSystem[i][j]) {
                  $("#jsoncode").append(space(12)+k+": "+modelSystem[i][j][k]);              
                  
                  kindex++;
                  if (kindex != size(modelSystem[i][j])) {
                      $("#jsoncode").append(",");              
                  }
                  $("#jsoncode").append("<br>");              
                  
              }
              $("#jsoncode").append(space(8) + "}");
              jindex++;
              if (jindex != size(modelSystem[i]) ) {
                  $("#jsoncode").append(",");              
              }
              $("#jsoncode").append("<br>");              
          }
          $("#jsoncode").append(space(4) + "}");          
          iindex++;
          if (iindex != size(modelSystem) ) {
              $("#jsoncode").append(",");              
          }
          $("#jsoncode").append("<br>");
      }
          
      $("#jsoncode").append("}<br>"); // Final close bracket (There should be more.)
  }
    
/*    for (i in mutables) {
        $("#jsoncode").append("&nbsp;&nbsp;"+mutables[i]+":<br>");          
        $("#jsoncode").append("&nbsp;&nbsp;{<br>");                    
        $("#jsoncode").append("&nbsp;&nbsp;&nbsp;&nbsp;factoryStart: "+modelSystem,($("#start"+mutables[i]).val())+",<br>");          
        $("#jsoncode").append("&nbsp;&nbsp;&nbsp;&nbsp;factoryEnd: "+($("#end"+mutables[i]).val())+",<br>");
        $("#jsoncode").append("&nbsp;&nbsp;&nbsp;&nbsp;particleEnd: "+($("#particleEnd"+mutables[i]).val())+"<br>");
        $("#jsoncode").append("&nbsp;&nbsp;}");
        if (i != mutables.length -1) {
            $("#jsoncode").append(",");              
        }
        $("#jsoncode").append("<br>");
    }
    $("#jsoncode").append("}");(*/


function showTab(id) {
    $(id).css("display", "block");
}    

function hideTabs() {
  $("#intro").css("display", "none");
  $("#container").css("display", "none");
}

function readURL(input, Crafty) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
          $("#preview").attr("src", e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
    }
}
        
$(document).ready(function() {

  // Initialize Crafty
  Crafty.init(640, // 640 Pixels Wide
              480  // 480 Pixels Tall
              );
              
  Crafty.canvas.init(); // Create a Canvas Element 

  Crafty.background("black");

  Crafty.viewport.scale(2);  
  
  addParticleSystem();
  
  $("#play").click(function() { 
      Crafty("ParticleSystem").destroy();
      addParticleSystem();
  });

  $("#stop").click(function() { 
      Crafty("ParticleSystem").destroy();
  });

  $("#json").click(function() { 
      if ($("#jsoncode").css("display") == "none") {
          $("#jsoncode").css("display", "block");
          generateJson();
      } else {
          $("#jsoncode").css("display", "none");
      }
  });
  
  $("#introTab").click(function() { 
    hideTabs();
    showTab("#intro");
  });

  $("#editorTab").click(function() { 
    hideTabs();
    showTab("#container");
  });
  
  
  $(".setter").change(function() {
      Crafty("ParticleSystem").destroy();
      addParticleSystem();      
  });
  
  for (i in mutables) {
      createSetter(mutables[i], mutableBottomValues[mutables[i]], mutableTopValues[mutables[i]]);
  }  
  
  $("#setters").append("<input type='file' id='image-file'><img id='preview' src=''>");
  
  $("#image-file").change(function() {
      readURL(this, Crafty);
  });
  
  $("body").append("</div>");
  
  $("#preview").load(function(){
    if ($("#preview").attr("src") != "") {  
        Crafty.sprite($("#preview").width(), $("#preview").height(), $("#preview").attr("src"), {
             loadimg: [0,0]
        }); 
    }
  });  

});