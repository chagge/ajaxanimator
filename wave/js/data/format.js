/*The magickal ALEON (Animation Lightweight Ecmascript Object Notation Format)*/
//or maybe AXON woudl be better.
//you can call it Awesome Lightweight Extreme Online New-animation-format if you like
//or other countless bacronyms
//sorry for the ridiculous name

/*
ALEON/Axff/Xff


{
  frames: 0, //frame count (required)
  tcframe: 1, //current frame
  tclayer: "Layer 1", //current layer
  generator: { //Ax.v dump
    app: "Ajax Animator",
    release: 0.2,
    build: 232
  },
  creation: 1214687653614, //unix epoch of creation
  modified: 1214687673324, //last modified date
  contrib: [ //array of contributors
    "k7d13x32fc" //10 digit auto-generated id for session, or username
  ],
    
  layers: { //where all the data is stored
    "Layer 1": {
      keyframes: [1,5,10,15,20],
      //tweens: [2,3,4,6,7,8,9,11,12,13,14,16,17,18,19], //this one is optional and not included by default
      src: [ //standard OPF data
        {type: "rect", id: "somelongidstring", x: 31, y: 32, ...}
      ]
    }
  }
}
*/


//format information
Ax.format = {
  support: {//format support. minimum version, maximum version
    min: 20,
    max: 21
  },
  revision: 21 //the version the app exports
}


Ax.emptyAnimation = {
  layers: {
    "Layer 1": {
      keyframes: [1],
      visible: true,
      src: {
        "1":[]
      }
    }
  }
}

Ax.new_animation = function(){
  Ax.import_animation(Ext.ux.clone(Ax.emptyAnimation))
  //Ax.history_add("New Animation")
}

Ax.export_animation_core = function(input,format){
  var layers = {};
  for(var layer in Ax.layers){
    layers[layer] = {
      keyframes: Ax.layers[layer].keyframes,
      visible: Ax.layers[layer].visible,
      //tweens: Ax.layers[layer].tweens, //this is not necessary
      src: Ax.getlayercanvas(layer)
    }
  }
  return layers;
}

Ax.export_animation = function(input, format){
  if(!input){
    input = {};
  }
  
  input.name = Ax.animation.name; //quite important to have this up here so you can easily identify the animation from a quick glance
	
  if(!input.creation){
    input.creation = (new Date()).getTime()
  }
  
  if(typeof input.contrib != typeof ['antimatter15','is','awesome']){
    input.contrib = []; //an array
  }
  if(input.contrib.indexOf((Ax.userid)?Ax.userid:"anonymous") == -1){
    input.contrib.push((Ax.userid)?Ax.userid:"anonymous"); //add user to list of contributors if not there already
  }
  
  input.modified = (new Date()).getTime();
  input.generator = Ax.v;
    
  input.revision = Ax.format.revision;
  
  input.tcframe = Ax.tcurrent.frame;
  input.tclayer = Ax.tcurrent.layer;
  
  input.layers = Ax.export_animation_core(); //the most important part: the data
  
  input.width = Ax.canvasWidth;
  input.height = Ax.canvasHeight;
  
  input.framerate = Ax.framerate;
  
  if(format == "json"){
    return Ext.util.JSON.encode(input);
  }else{
    return input;
  }
}

Ax.import_animation = function(markup){
  if(typeof markup == typeof "tehkooliest"){ //if its in json, then decode it first
    markup = Ext.util.JSON.decode(markup)
  }
  Ax.setAnimationName(markup.name)
  //set the name for the animation in that little box in the toolbar. overly hackish, I know. Seriously, acessing dom?
  Ax.animation.markup = markup;
  
  Ax.canvasWidth = markup.width?markup.width:480
  Ax.canvasHeight = markup.height?markup.height:272
  Ax.canvasSize_core();
  
  Ax.framerate = markup.framerate?markup.framerate:12;
  
  Ax.import_animation_core(markup.layers);
  
  //this is quite horrible to the code. but google wants it
  Ax.selectFrame((markup.tcframe)?markup.tcframe:1,"~1")//(markup.tclayer)?markup.tclayer:"Layer 1");
  
}

Ax.test_animation_markup = function(markup){
  if(typeof markup != typeof "actionwoot"){
    return false; //its not valid, only takes json formatted string
  }
  try{
    markup = Ext.util.JSON.decode(markup); //attempt to decode
  }catch(err){
    return false;
  }
  if(!markup){
    return false; //its not valid, it didn't get through
  }
  if(typeof markup != typeof ({woot: "ness"})){
    return false; //its not the right type
  }
  if(typeof markup.layers != typeof ({ello: "world"})){
    return false;
  }
  
  return markup;
}

Ax.import_animation_core = function(layers){
  Ax.reloadCanvas_core(); //try resolving some issues;
  
  Ax.viewport.findById("layers").getStore().removeAll(); //remove all entries from layers panel
  Ax.initTimeline(); //reset timeline
  //Ax.canvas_storage = {}; //empty canvas storage
  Ax.removeallcanvas();
  
  Ax.canvas.unselect();//unselect the canvas, saves a nasty bug
  Ax.deleteAll(); //clear canvas
  
  
  Ax.layers = {};//reset layers object
  //Ax.tstat = {layers: 0, frames: 0}
  Ax.tstat.layers = 0;
/*
for(var firstlayer in layers){
  Ax.tcurrent.layer = firstlayer;
  Ax.tcurrent.frame = 1;
  Ax.loadShapes(layers[firstlayer].src[1]);
  break;
}  
*/


//wave2.fire_evt = false;

var lc = 1;
for(var layerx in layers){ //loop through layers
    var layer = "~"+(lc++);

    Ax.addLayer(layer); //add layer
    Ax.layers[layer].keyframes = layers[layerx].keyframes; //set keyframes
    
    for(var i = 0; i < Ax.layers[layer].keyframes.length; i++){
      wave2.set(["k",Ax.layers[layer].keyframes[i],layer],1)
    }
    Ax.layers[layer].visible = Ax.layers[layer].visible
    //Ax.canvas_storage[layer] = layers[layer].src; //load canvas src
    
    
    
    Ax.setlayercanvas(layer, layers[layerx].src)
    
    //Ax.loadframe(1, layer); //note: this is a hack!
    //console.log(layers[layer].src);
    //*
    for(var i = 0; i < layers[layerx].keyframes.sort(function(a,b){return b-a})[0] + 1; i++){
      Ax.renderFrame2(i + 1,layer); //render frame to timeline, (renderFrame may be better)
      	//if(layers[layer].keyframes.indexOf(i+1) != -1){
        //  Ax.toKeyframe(i+1, layer)
        //}
    }
    //*/
    
  }

}

Ax.reload_animation = function(){
  try{
    Ax.import_animation(Ax.export_animation(Ax.animation.markup))
  }catch(err){
    return Ax.msg("Animation Recovery","Animation recovery has failed due to error: "+err)
  }
  Ax.msg("Animation Reloaded","The current animation was reloaded. This hopefully has resolved most issues related to the timeline and other components.")
}

