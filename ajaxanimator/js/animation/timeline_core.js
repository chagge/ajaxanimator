Ax.timeline = {el: null, mask: null};
Ax.layers = {}; //this stores all the data for layer stuff


Ax.tstat = { //statistics for the count of frames and layers (displayed in timeline, not animation)
  layers: 0, //layers
  frames: 0  //frames.
}

Ax.tcurrent = { //currently selected frame/layer
  layer: null, //btw layers are strings (their ID)
  frame: null //im trying to decide whether this shoudl be 0 or null
}

Ax.renameLayer = function(oldname,newname){ //pretty neat. eh?
  Ax.layers[newname]=Ax.layers[oldname]; //we didn't have cusom layer names in the old version
  delete Ax.layers[oldname]; //...just random numbers
  
  Ax.canvas_storage[newname] = Ax.canvas_storage[oldname]; //but this seems nicer
  delete Ax.canvas_storage[oldname]; //right?
  
  return Ax.layers; //ok.
}

Ax.deleteLayer = function(name){//Sorta works.... anyone wanna test?
  if(Ax.tcurrent.layer == name){
  	return Ax.toastMsg("Delete Error","You can not delect the current selected layer.")
  }

  Ext.get(Ax.layers[name].el).remove(); //remove the table element
  Ax.viewport.findById("layers").getStore().remove(Ax.layers[name].record);
  //remoe the stuff from the little editable grid witht he titles
   
  delete Ax.layers[name]; //delete the entry
  Ax.tstat.layers--; //we removed a frame...
  
}

Ax.addLayer = function(layername){
  layername = (layername)?layername:"Layer "+((Ax.tstat.layers+1).toString());

  var f_layer = document.createElement("tr"); 
  Ax.layers[layername] = {
    el:f_layer,
    keyframes: [1],
    tweens: [],
    record: new Ext.data.Record({comment:layername})
    }
  Ax.viewport.findById("layers").getStore().add(Ax.layers[layername].record)
  if(!Ax.canvas_storage[layername]){
    Ax.canvas_storage[layername] = {"1":[]};//create a canvas storage slot with first frame set to blank
  }
  
  //Ext.log(f_layer.innerHTML)
  //Ax.current.layer = layer
  Ax.tstat.layers++
  Ax.timeline.el.appendChild(f_layer)
  
  for(var frame = 0; frame < Ax.tstat.frames; frame++){
    Ax.addFrame_core(frame+1,layername)
  }


  //Ext.log(f_layer.innerHTML)
  return f_layer;
}

Ax.addFrame = function(){
  Ax.tstat.frames++
  for(var layer in Ax.layers){
    Ax.addFrame_core(Ax.tstat.frames,layer)
  }
}

Ax.addFrames = function(frames){ //mind the s, this just loops through whatever number and makes so many frames
  for(var i = 0; i < frames; i++){
    Ax.addFrame()
  }
}




Ax.addFrame_core = function(frame,layer){
  //console.log(layer)
  var frame_cell = document.createElement("td")
  //frame.style.bgColor = "#99BBE8";
  frame_cell.className = "frame"

  var frame_content = document.createElement("div")
  frame_content.className = "frame"
  frame_content.innerHTML =  frame //[1,2,5,10,42,420,316,4242,1337][Math.floor(Math.random()*9)];

  switch(frame_content.innerHTML.length){
    case 1:
      frame_content.style.marginTop = "1px";    
      frame_content.style.fontSize = "110%";
      //frame_content.style.marginTop = "-6px";
      //frame_content.style.fontSize = "140%";
    break;
    case 2:
      frame_content.style.marginBottom = "-2px";    
      frame_content.style.fontSize = "90%";
      break;
    case 3:
      frame_content.style.marginBottom = "-7px"
      frame_content.style.fontSize = "65%";
    break;
    case 4:
      frame_content.style.marginBottom = "-11px"
      frame_content.style.fontSize = "40%";
    break;
  }
  
  frame_cell.appendChild(frame_content)
  
  Ax.addFrameListeners(frame_cell,frame,layer)
  
  Ax.layers[layer].el.appendChild(frame_cell)
}
//#99BBE8



Ax.getFrame = function(frame,layer){
  if(frame > 0){
    return Ext.get(Ax.layers[layer].el.childNodes[frame-1]);
  }
}

Ax.selectFrame = function(frame,layer){
  if(frame < 1){return false;}; //OMG!! PONIES!
  
  if(Ext.get("cbframe")){
  	Ext.get("cbframe").dom.value = frame;
  }
  
  Ax.viewport.findById("layers").getSelectionModel().selectRecords([Ax.layers[layer].record], false)
  //select the layer
  
  Ax.autodiff(); //save current state, etc.
    
  //Set cursor
  Ax.tcurrent.frame = frame;
  Ax.tcurrent.layer = layer;
  //Change Styles
  Ax.selectFrame_core(frame,layer);
  //Add frames if necessary
  if(frame > Ax.tstat.frames - 30){
    Ax.addFrames(50 - (Ax.tstat.frames - frame))
  }

  //change the canvas to new one if possible
  Ax.loadframe(frame,layer)
  
}

Ax.selectFrame_core = function(frame,layer){
  Ax.timeline.mask.style.top = (Ax.getFrame(frame,layer).getY()-Ext.get(Ax.timeline.el).getY()).toString()+"px"
  Ax.timeline.mask.style.left = (Ax.getFrame(frame,layer).getX()-Ext.get(Ax.timeline.el).getX()).toString()+"px"
}

Ax.insertFrame = function(frame,layer){
  if(frame < 1){return false;}; //OMG!! PONIES!
  if(!frame){frame = Ax.tcurrent.frame}
  if(!layer){layer = Ax.tcurrent.layer}

  Ax.addFrame()
  
  for(var i = 0; i < Ax.layers[layer].keyframes.length; i++){
    if(Ax.layers[layer].keyframes[i] > frame){
      var keyframe_id = Ax.layers[layer].keyframes[i];
      Ax.layers[layer].keyframes[i] += 1;
      Ax.canvas_storage[layer][(keyframe_id+1).toString()] = Ax.canvas_storage[layer][keyframe_id.toString()]
      delete Ax.canvas_storage[layer][keyframe_id.toString()]
    }
  }
  for(var i = 0; i < Ax.layers[layer].tweens.length; i++){
    if(Ax.layers[layer].tweens[i] > frame){
      Ax.layers[layer].tweens[i]+=1
    }
  }
  for(var i = frame; i < Ax.tstat.frames; i++){
    Ax.renderFrame(i,layer)
  }
  
  if(Ax.isTween(frame,layer)){
    Ax.tween(Ax.largest_nonempty(frame,layer),Ax.smallest_nonempty(frame,layer),layer); //tween from previous keyframe to no
    if(frame == Ax.tcurrent.frame && layer == Ax.tcurrent.layer){
      Ax.loadframe(frame, layer)
    }
  }
  
}

Ax.renderFrame = function(frame,layer){
  switch(Ax.frameType(frame,layer)){
    case "keyframe":
      Ax.toKeyframe_core(frame,layer)
      break;
    case "tween":
      Ax.toTween_core(frame,layer)
      break;
    case "blank":
      Ax.toBlank_core(frame,layer)
      break;
  }
}

Ax.frameType = function(frame,layer){
  if(Ax.isKeyframe(frame,layer) == true){
    return "keyframe"
  }
  if(Ax.isTween(frame,layer) == true){
    return "tween"
  }
  return "blank"
}

Ax.toKeyframe = function(frame,layer){
  if(!frame){frame = Ax.tcurrent.frame}
  if(!layer){layer = Ax.tcurrent.layer}

  
  if(!Ax.isKeyframe(frame,layer)){
    Ax.layers[layer].keyframes.push(frame);
  }
  
  
  if(Ax.isTween(frame,layer)){//this never sees light, because the thing above keeps it from ever executing
    //but its still here as a useless brick in case pigs can fly (don't you love cliches?)
    Ax.layers[layer].tweens.splice(Ax.layers[layer].tweens.indexOf(frame),1)
    //Ax.tween(frame,Ax.smallest_nonempty(frame,layer),layer); //tween from now to next
  }else{
    Ax.tween(Ax.largest_nonempty(frame,layer),frame,layer); //tween from previous keyframe to now
  }
  
  
  return Ax.toKeyframe_core(frame,layer)
}

Ax.frameClass = function(frame,layer,frameclass){
  Ax.getFrame(frame,layer).dom.className = "frame "+frameclass;
}

Ax.isTween = function(frame,layer){
  if(!frame){frame = Ax.tcurrent.frame}
  if(!layer){layer = Ax.tcurrent.layer}
  return (Ax.layers[layer].tweens.indexOf(frame) != -1)
}

Ax.isKeyframe = function(frame,layer){
  if(!frame){frame = Ax.tcurrent.frame}
  if(!layer){layer = Ax.tcurrent.layer}
  return (Ax.layers[layer].keyframes.indexOf(frame)!= -1)
}

Ax.toKeyframe_core = function(frame,layer){
  Ax.frameClass(frame,layer,"keyframe");
}

//there is no non-core Ax.toTween as it is supposedly automatic
//scratch that.... idk
Ax.toTween_core = function(frame,layer){
  Ax.frameClass(frame,layer,"tween");
}

Ax.toTween = function(frame,layer){
  if(Ax.layers[layer].tweens.indexOf(frame) == -1){
    Ax.layers[layer].tweens.push(frame);
  }
  
  return Ax.toTween_core(frame,layer)
}

Ax.toBlank_core = function(frame,layer){
  Ax.frameClass(frame,layer)
}

Ax.addFrameListeners = function(frame_cell,frame,layer){
  //not very memory friendlyish. stuffs dont get removed when unneeded/unused.
  new Ext.ToolTip({
   target: frame_cell,
   trackMouse: true,
   shadow: false,
   width: 120,
   title: "Loading...",
   html: 'Loading...',
   rframe: frame,
   rlayer: layer,
   listeners: {
   	"show":function(tooltip){
		
		var dataformat = {
			"Shapes": Ax.getshapes(tooltip.rframe, tooltip.rlayer).length
		}, dataoutput = "";
		
		for(var label in dataformat){
			dataoutput += "<span style=\"float: left\">"+label+"</span><span style=\"float: right\">"+dataformat[label]+"</span><br>"
		}
		
		
		var preview_tip = document.createElement("div"); //im not good with Ext dom stuffs
		preview_tip.className = "preview_tip"
		Ext.get(preview_tip).setHeight(((tooltip.getBox().width - 12) * Ax.canvasHeight)/Ax.canvasWidth)
		Ext.get(preview_tip).setWidth(tooltip.getBox().width - 12)
		
		
		tooltip.setTitle('Frame '+tooltip.rframe.toString()+" "+tooltip.rlayer.toString())
		tooltip.body.update(dataoutput)
		
		if(Ext.isIE){
			preview_tip.innerHTML = "Preview Tips Not Available For Microsoft Internet Explorer"
		}
		
		tooltip.body.dom.appendChild(preview_tip)
		
		Ax.viewer_load_frame(tooltip.rframe, Ax.export_animation_core(), Ax.init_view_core(preview_tip))

		//console.log((tooltip.getBox().width * Ax.canvasHeight)/Ax.canvasWidth)
		
		//
	},
	"hide": function(tooltip){
		//make more memory friendlyish
		tooltip.body.dom.innerHTML = "";
	}
   }
  });

}


Ax.create_timeline_mask = function(){
  Ax.timeline.mask = document.createElement("div")
  Ax.timeline.mask.className = "fselect_mask"
  Ax.timeline.el.appendChild(Ax.timeline.mask)
  
   new Ext.ToolTip({
   target: Ax.timeline.mask,
   trackMouse: true,
   shadow: false,
   //width: 120,
   title: 'Loading...',
   html: "Loading...",
   listeners: {
   	"show": function(tooltip){
		tooltip.setTitle('Frame '+Ax.tcurrent.frame.toString()+" "+Ax.tcurrent.layer.toString())
		tooltip.body.update("Selected Frame")
		
	}
   }
   })
}


Ax.reloadTimeline = function(){
	for(var layer in Ax.layers){
		for(var frame = 1; frame < Ax.tstat.frames+1; frame++){
			Ax.renderFrame(frame, layer);
		}
	}
	Ax.msg("Timeline Reloaded","Timeline has been sucessfully rendered")
}

Ax.timelineCleanup = function(){
	Ax.msg("Timeline Cleanup","Timeline has been sucessfully cleaned up."); //meh. it did nothing
}

Ax.initTimeline = function(){
  Ax.layers = {};
  
  Ext.get("timeline_core").dom.innerHTML = ""
  var frameTable = document.createElement("table");
  frameTable.setAttribute("cellspacing","0")
  frameTable.setAttribute("cellpadding","0")
  frameTable.setAttribute("border","0")
  //frameTable.style.border = "1px solid gra"
  var frameTBody = document.createElement("tbody");
  frameTable.appendChild(frameTBody)
  Ext.get("timeline_core").dom.appendChild(frameTable)
  Ax.timeline.el = frameTBody;
  
  Ext.get("timeline_core").parent().on("selectstart",function(event){event.stopEvent();return false})
  Ext.get("timeline_core").parent().on("mousedown", function(event, target){
  	if(target.className == "frame"){
	for(var layer in Ax.layers){
      if(target.parentNode.parentNode == Ax.layers[layer].el){
        Ax.selectFrame(parseInt(target.innerHTML),layer)
        break;
      }
    }
	}
	if(event.button == 2){
		
	}
  //	console.log(event,target)
  })
  Ext.get("timeline_core").parent().on("contextmenu",function(event,target){
    //console.log(event,target)
    event.stopEvent();
//console.log(Ax.tcurrent)
    if(target.className == "fselect_mask" ||( target.innerHTML == Ax.tcurrent.frame.toString() )){
      new Ext.menu.Menu({
        items: [
        {text: "Add Layer", iconCls: "tb_newlayer", handler: function(){Ax.addLayer()}},
        {text: "To Keyframe", iconCls: "tb_addkeyframe", handler: function(){Ax.toKeyframe()}},
        {text: "Insert Frame", iconCls: "tb_insertframe", handler: function(){Ax.insertFrame()}}
        ]
      }).showAt(event.xy)
    }else{
      new Ext.menu.Menu({
        items: [
         {text: "Add Layer", iconCls: "tb_newlayer", handler: function(){Ax.addLayer()}}
        ]
      }).showAt(event.xy)
    }
  })
  
  Ax.create_timeline_mask();
}

/*
Ext.onReady(function(){
  Ax.initTimeline()
  Ax.addLayer()
  Ax.addFrames(150)
})
//*/ /**/ //END


