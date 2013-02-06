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

modelSystem.imageUsed = false;
modelSystem.imageName = "img";
modelSystem.fileName = "file";

syncSetters();

function size (obj) {
    var size = 0, key;
    for (key in obj) {
        size++;
    }
    return size;
}; 
 
         function changeShiftingRandomSetter(mutable, timeAxis, randomAxis, setFraction, knobPos) {
            $("#"+mutable+""+timeAxis+""+randomAxis+"Knob").css("left", knobPos);
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
"                <div id='"+setter+"SlidersRandomShifting' style='display: none'>"+
"                    <div class='slider' id='"+setter+"FactoryStartRandomSlider'><span style='position: absolute'>Start</span><span style='position: absolute; left: 380px'>"+topValue+"</span>"+
"                        <hr style='position: relative; top: 18px'>            "+
"                        <div class='minKnob' id='"+setter+"FactoryStartMinKnob'></div>"+
"                        <div class='maxKnob' id='"+setter+"FactoryStartMaxKnob'></div>"+
"                    </div>"+
"                    "+
"                    <div class='betweenSlider' id='between"+setter+"RandomSlider'>"+
"                    </div>"+
""+
"                    <div class='slider' id='"+setter+"FactoryEndRandomSlider'><span style='position: absolute'>End</span>"+
"                        <hr style='position: relative; top: 18px'>            "+
"                        <div class='minKnob' id='"+setter+"FactoryEndMinKnob'></div>"+
"                        <div class='maxKnob' id='"+setter+"FactoryEndMaxKnob'></div>"+
"                    </div>            "+
"                    <div class='slider' id='"+setter+"ParticleEndRandomSlider'><span style='position: absolute'>Particle end</span>"+
"                        <hr style='position: relative; top: 18px'>            "+
"                        <div class='minKnob' id='"+setter+"ParticleEndMinKnob'></div>"+
"                        <div class='maxKnob' id='"+setter+"ParticleEndMaxKnob'></div>"+
"                    </div>            "+
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
                if (draggedElement == setter+"FactoryStartMinSlider") {
                    changeShiftingRandomSetter(setter, "FactoryStart", "Min", (event.pageX-20)/400.0, event.pageX-20);
                } else if (draggedElement == setter+"FactoryEndMinSlider") {
                    changeShiftingRandomSetter(setter, "FactoryEnd", "Min", (event.pageX-20)/400.0, event.pageX-20);
                } else if (draggedElement == setter+"ParticleEndMinSlider") {
                    changeShiftingRandomSetter(setter, "ParticleEnd", "Min", (event.pageX-20)/400, event.pageX-20);
				}
                if (draggedElement == setter+"FactoryStartMaxSlider") {
                    changeShiftingRandomSetter(setter, "FactoryStart", "Max", (event.pageX-20)/400.0, event.pageX-20);
                } else if (draggedElement == setter+"FactoryEndMaxSlider") {
                    changeShiftingRandomSetter(setter, "FactoryEnd", "Max", (event.pageX-20)/400.0, event.pageX-20);
                } else if (draggedElement == setter+"ParticleEndMaxSlider") {
                    changeShiftingRandomSetter(setter, "ParticleEnd", "Max", (event.pageX-20)/400, event.pageX-20);
                }

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

			addRandomSliderListener(setter, "");
			addRandomSliderListener(setter, "FactoryStart");
			addRandomSliderListener(setter, "FactoryEnd");
			addRandomSliderListener(setter, "ParticleEnd");			
            
            $(document).mouseup(function() {
                draggedElement = false;
            });
            
            $("#"+setter+"ShiftingCheck").change(function() {
			    showRightSliders(setter);
            });
            
            $("#"+setter+"RandomCheck").change(function() {
			    showRightSliders(setter);
            });
        }
		
	function addRandomSliderListener(setter, timeAxis) {
            $("#"+setter+""+timeAxis+"RandomSlider").mousedown(function(event) {
                
                var distanceToMin = Math.abs(event.pageX - parseFloat($("#"+setter+""+timeAxis+"MinKnob").css("left")));
                var distanceToMax = Math.abs(event.pageX - parseFloat($("#"+setter+""+timeAxis+"MaxKnob").css("left")));
                
                
                if (distanceToMin < distanceToMax) {
                    draggedElement = setter+""+timeAxis+"MinSlider";                
					if (timeAxis == "") 
                        changeRandomSetter(setter, "Min", (event.pageX-20)/400.0, event.pageX-20);                    
					else
                        changeShiftingRandomSetter(setter, timeAxis, "Min", (event.pageX-20)/400.0, event.pageX-20);                    					
                    addParticleSystem();    
                    
                } else {
                    draggedElement = setter+""+timeAxis+"MaxSlider";                
					if (timeAxis == "") 
                        changeRandomSetter(setter, "Max", (event.pageX-20)/400.0, event.pageX-20);                    
					else
                        changeShiftingRandomSetter(setter, timeAxis, "Max", (event.pageX-20)/400.0, event.pageX-20);                    					
                    addParticleSystem();    
                    
                }
            });
	
	}
		
    function showRightSliders(setter) {
	
		$("#"+setter+"Sliders").css("display", "none");                    
		$("#"+setter+"SlidersRandom").css("display", "none");                                        
		$("#"+setter+"SlidersShifting").css("display", "none");                    
		$("#"+setter+"SlidersRandomShifting").css("display", "none");                                        
    	
	
		if ($("#"+setter+"RandomCheck").is(':checked')) {
		    if ($("#"+setter+"ShiftingCheck").is(':checked'))
			    $("#"+setter+"SlidersRandomShifting").css("display", "block");             
		    else 
			    $("#"+setter+"SlidersRandom").css("display", "block");             			    
		} else {
		    if ($("#"+setter+"ShiftingCheck").is(':checked'))
			    $("#"+setter+"SlidersShifting").css("display", "block");             
		    else 
			    $("#"+setter+"Sliders").css("display", "block");             			    
		}		
				
    }
        
  function createImageSetter() {
      /*$("#setters").append(
        "<div class='setterDiv'>" +
        "<input type='radio' class='imageUsed' name='imageUsed' id='imageUsedFalse' checked='checked' />Use squares "+
        "<input type='radio' class='imageUsed' name='imageUsed' id='imageUsedTrue' />Use image" +
        "<input type='file' id='image-file' />" + 
        "<br>Image name: <input type='text' id='imageName' />"+        
        "</div>"
      )*/
      
      $(".imageUsed").change(function() {
          if ($("#imageUsedFalse").attr("checked") == "checked") {
              modelSystem.imageUsed = false;
          } else {
              modelSystem.imageUsed = true;
          }
          addParticleSystem();
      });
      
      
      $("#imageName").blur(function() {
          modelSystem.imageName = $("#imageName").val();
          loadUploadedImage();
      });
           
  }
        
  function addParticleSystem() {    
        Crafty("ParticleSystem").destroy();
        Crafty("Particle").destroy();        
  
      var system = Crafty.e("ParticleSystem")
          .attr({x: 160, y: 120});   
      
      for (i in mutables) {      
          system[mutables[i]] = {};
          for (j in modelSystem[mutables[i]]) {
              system[mutables[i]][j] = {};
              for (k in modelSystem[mutables[i]][j]) {
                  system[mutables[i]][j][k] = modelSystem[mutables[i]][j][k];
              }
          }
          
          system[mutables[i]].FactoryCurrent = {Min: modelSystem[mutables[i]].FactoryStart.Min, Max: modelSystem[mutables[i]].FactoryStart.Max}                          
      }
      
      system.lifetime = system.randomValue(system.EmitterLifetime.FactoryCurrent);
      system.emitsPerSecond = system.randomValue(system.EmitsPerSecond.FactoryCurrent);           
      system.imageUsed = modelSystem.imageUsed;
      system.imageName = modelSystem.imageName;
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
 	      i = i.replace(/[`~!@#$%^&*()|+\-=?;:',.<>\{\}\[\]\\\/]/gi, '');
      
          if (typeof(modelSystem[i]) == "object") {
              $("#jsoncode").append(space(4)+"\""+i+"\": {<br>");             
              
              jindex = 0;          
              for (j in modelSystem[i]) {
			      j = j.replace(/[`~!@#$%^&*()|+\-=?;:',.<>\{\}\[\]\\\/]/gi, '');
                  $("#jsoncode").append(space(8)+"\""+j+"\": {<br>");              
                  
                  
                  kindex = 0;
                  for (k in modelSystem[i][j]) {
			          k = k.replace(/[`~!@#$%^&*()|+\-=?;:',.<>\{\}\[\]\\\/]/gi, '');				  
		              if (typeof modelSystem[i][j][k] == "string") {modelSystem[i][j][k] = modelSystem[i][j][k].replace(/[`~!@#$%^&*()|+\-=?;:',.<>\{\}\[\]\\\/]/gi, '');}
                      $("#jsoncode").append(space(12)+"\""+k+"\": "+modelSystem[i][j][k]);              
                      
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
          } else {
		      if (typeof modelSystem[i] == "string") {modelSystem[i] = modelSystem[i].replace(/[`~!@#$%^&*()|+\-=?;:',.<>\{\}\[\]\\\/]/gi, '');}
              $("#jsoncode").append(space(4)+"\""+i+"\": \"" + modelSystem[i] + "\"");              
          }
          iindex++;
          if (iindex != size(modelSystem) ) {
              $("#jsoncode").append(",");              
          }
          $("#jsoncode").append("<br>");

      }
          
      $("#jsoncode").append("}<br>"); // Final close bracket (There should be more.)
  }

function showTab(id) {
    $(id).css("display", "block");
}    

function hideTabs() {
  $("#intro").css("display", "none");
  $("#container").css("display", "none");
  $("#collection").css("display", "none");
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

function loadUploadedImage() {
    if ($("#preview").attr("src") != "") {  
        var insertObj = {};
        insertObj[modelSystem.imageName] = [0, 0];
        Crafty.sprite($("#preview").width(), $("#preview").height(), $("#preview").attr("src"), insertObj); 
    }
}
        
function createCollection(Crafty) {
    $("#collection").html("");

    var jsonFiles;

	$.ajax({
	  url: "readdir.php",
	  context: document.body
	}).done(function(data) {
    	jsonFiles = data.split("\n");
        jsonFiles.pop();
		
		for (i in jsonFiles) {
			$("#collection").append("<br><span id='"+jsonFiles[i]+"'>"+jsonFiles[i]+"</span>");
		}

		
	   
		for (i in jsonFiles) {
			$("[id='"+jsonFiles[i]+"']").click(function(e) {
				var file = e.target.id;
			
				hideTabs();
				showTab("#container");
				
				loadParticleSystemForEditor("json/"+file+".json");
			});
		}    		

	});    
	
	
}

function loadParticleSystemForEditor(file) {

	Crafty("ParticleSystem").destroy();
	Crafty("Particle").destroy();        
	var system = Crafty.e("ParticleSystem").attr({x: 160, y: 120}).load(file);   


	$.getJSON(file, function(data) {
		for (i in mutables) {
			modelSystem[mutables[i]] = {};
			for (j in data[mutables[i]]) {
				modelSystem[mutables[i]][j] = {};
				for (k in data[mutables[i]][j]) {
					modelSystem[mutables[i]][j][k] = data[mutables[i]][j][k];
				}
			}
		
		}        
		
		modelSystem.imageUsed = data.imageUsed;
		modelSystem.imageName = data.imageName;
		modelSystem.fileName = data.fileName;
		
		$("#fileName").val(modelSystem.fileName);


    	syncSetters();
		
	})	
}
		
function syncSetters() {
    for (i in mutables) {
	    var shifting = false;
		var random = false;
        if (modelSystem[mutables[i]].FactoryStart.Min != modelSystem[mutables[i]].FactoryEnd.Min || 
		    modelSystem[mutables[i]].FactoryStart.Max != modelSystem[mutables[i]].FactoryEnd.Max ||
		    modelSystem[mutables[i]].ParticleEnd.Min != 0 || 
			modelSystem[mutables[i]].ParticleEnd.Max != 0 ) {
						
		    shifting = true;
			$("#"+mutables[i]+"ShiftingCheck").attr("checked", "checked");
		} else {
			$("#"+mutables[i]+"ShiftingCheck").attr("checked", false);		
		}
		
        if (modelSystem[mutables[i]].FactoryStart.Min != modelSystem[mutables[i]].FactoryStart.Max || 
		    modelSystem[mutables[i]].FactoryEnd.Min != modelSystem[mutables[i]].FactoryEnd.Max ||
		    modelSystem[mutables[i]].ParticleEnd.Min != modelSystem[mutables[i]].ParticleEnd.Max) {
						
		    random = true;
			$("#"+mutables[i]+"RandomCheck").attr("checked", "checked");
		} else {
			$("#"+mutables[i]+"RandomCheck").attr("checked", false);				
		}
		
				
		showRightSliders(mutables[i]);
		
		var mutableRange = mutableTopValues[mutables[i]] - mutableBottomValues[mutables[i]];
		
		if (shifting == false) {
		    if (random == false) {
    		    var knobPos = ((modelSystem[mutables[i]].FactoryStart.Min-mutableBottomValues[mutables[i]]) / mutableRange)* 400.0
                $("#"+mutables[i]+"Knob").css("left", knobPos);
		    } else {
    		    var knobPos = ((modelSystem[mutables[i]].FactoryStart.Min-mutableBottomValues[mutables[i]]) / mutableRange) * 400.0
                $("#"+mutables[i]+"MinKnob").css("left", knobPos);			
    		    knobPos = (((modelSystem[mutables[i]].FactoryStart.Max-mutableBottomValues[mutables[i]]) / mutableRange) * 400.0) + 10;
                $("#"+mutables[i]+"MaxKnob").css("left", knobPos);							
			}
		} else {
            if (random == false) {		
				var knobPos = ((modelSystem[mutables[i]].FactoryStart.Min-mutableBottomValues[mutables[i]])  / mutableRange) * 400.0
				$("#"+mutables[i]+"FactoryStartKnob").css("left", knobPos);
				knobPos = ((modelSystem[mutables[i]].FactoryEnd.Min-mutableBottomValues[mutables[i]])  / mutableRange) * 400.0
				$("#"+mutables[i]+"FactoryEndKnob").css("left", knobPos);
				knobPos = (((modelSystem[mutables[i]].ParticleEnd.Min-mutableBottomValues[mutables[i]])  / mutableRange) * 200.0) + 200;
				$("#"+mutables[i]+"ParticleEndKnob").css("left", knobPos);			
			} else {
				var knobPos = ((modelSystem[mutables[i]].FactoryStart.Min-mutableBottomValues[mutables[i]])  / mutableRange) * 400.0
				$("#"+mutables[i]+"FactoryStartMinKnob").css("left", knobPos);
				knobPos = ((modelSystem[mutables[i]].FactoryEnd.Min-mutableBottomValues[mutables[i]])  / mutableRange) * 400.0
				$("#"+mutables[i]+"FactoryEndMinKnob").css("left", knobPos);
				knobPos = (((modelSystem[mutables[i]].ParticleEnd.Min-mutableBottomValues[mutables[i]])  / mutableRange) * 200.0) + 200;
				$("#"+mutables[i]+"ParticleEndMinKnob").css("left", knobPos);			

				knobPos = (((modelSystem[mutables[i]].FactoryStart.Max-mutableBottomValues[mutables[i]])  / mutableRange) * 400.0) + 10;
				$("#"+mutables[i]+"FactoryStartMaxKnob").css("left", knobPos);
				knobPos = (((modelSystem[mutables[i]].FactoryEnd.Max-mutableBottomValues[mutables[i]])  / mutableRange) * 400.0) + 10;
				$("#"+mutables[i]+"FactoryEndMaxKnob").css("left", knobPos);
				knobPos = (((modelSystem[mutables[i]].ParticleEnd.Max-mutableBottomValues[mutables[i]])  / mutableRange) * 200.0) + 210;
				$("#"+mutables[i]+"ParticleEndMaxKnob").css("left", knobPos);			
				
			
			}
		}
		
		arrangeDots(mutables[i]);
    }	
}		

function getModelJson() {
    var string = JSON.stringify(modelSystem);
//    var string ="";
//	string += "{\n";
//	string += "}";
	return string;
}
		
$(document).ready(function() {

  // Initialize Crafty
  Crafty.init(640, 480// 640 Pixels Wide
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
  
  $("#share").click(function() {
      $.ajax({
            type: "POST",
            url: "jsonwriter.php?fileName="+modelSystem.fileName,
            dataType: 'json',
            data: { json: getModelJson() }
        });
  });
  
  $("#fileName").change(function() {
      modelSystem.fileName = $("#fileName").val();
  });
  
  $("#introTab").click(function() { 
    hideTabs();
    showTab("#intro");
  });

  $("#editorTab").click(function() { 
    hideTabs();
    showTab("#container");
  });

  $("#collectionTab").click(function() { 
    hideTabs();
    showTab("#collection");
	createCollection(Crafty);
  });
  
  
  $(".setter").change(function() {
      Crafty("ParticleSystem").destroy();
      addParticleSystem();      
  });

  createImageSetter();  
  for (i in mutables) {
      createSetter(mutables[i], mutableBottomValues[mutables[i]], mutableTopValues[mutables[i]]);
  }    
  createCollection(Crafty);
  
  $("#setters").append("<img id='preview' src=''>");
  
  $("#image-file").change(function() {
      readURL(this, Crafty);
  });
  
  $("body").append("</div>");
  $("#preview").load(function(){ 
      loadUploadedImage(); 
  });
});