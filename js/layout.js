import * as log from "./log.js";
import timer from "./timer.js";
import * as rdfGraph from "./rdfGraph.js";

var activeLayout = undefined;

function storageName(layoutName,subs) {return "layout"+layoutName+[...subs].sort().toString().replace(/[^a-z]/g,"");}

export function positions(nodes)
{
  const pos=[];
  for(let i=0;i<nodes.size();i++)
  {
    const node = nodes[i];
    pos.push([node.data().id,node.position()]);
  }
  return pos;
}

/** subs are optional and are used to cache the layout. */
export function run(cy,layoutConfig,subs)
{
  if(cy.nodes().size()===0)
  {
    log.warn("layout.js#run: Graph empty. Nothing to layout.");
    return false;
  }
  const layoutTimer = timer("layout");
  if(activeLayout) {activeLayout.stop();}
  activeLayout = cy.elements(":visible").layout(layoutConfig);
  activeLayout.run();
  layoutTimer.stop();
  if(subs)
  {
    if(typeof(localStorage)=== "undefined")
    {
      log.error("web storage not available, could not write to cache.");
      return;
    }
    const pos=positions(cy.nodes());
    const name = storageName(layoutConfig.name,subs);
    localStorage.setItem(name,JSON.stringify(pos));
  }
  return true;
}

export function presetLayout(cy,pos)
{
  const map = new Map(pos);
  let hits = 0;
  let misses = 0;
  const layoutConfig =
  {
    name: 'preset',
    fit:false,
    positions: node=>
    {
      let position;
      if((position= map.get(node._private.data.id)))
      {
        hits++;
        return position;
      }
      misses++;
      return {x:0,y:0};
    },
  };
  const status = run(cy,layoutConfig);
  if(misses>0||hits<positions.length)
  {
    log.warn(`...${hits}/${cy.nodes().size()} node positions set. ${pos.length-hits} superfluous layout positions .`);
    const precision = hits/pos.length;
    const recall = hits/cy.nodes().size();
    if(precision<config.layoutCacheMinPrecision)
    {
    log.warn(`Precision of ${precision} less than minimal required precision of ${config.layoutCacheMinPrecision}.`);
    return false;
    }
    if(recall<config.layoutCacheMinRecall)
    {
    log.warn(`Recall of ${recall} less than minimal required of recall of ${config.layoutCacheMinRecall}.`);
    return false;
    }
  }
  else
  {
    log.debug("...layout applied with 100% overlap.");
  }
  if(hits===0) {return false;}
  return status;
}


export function runCached(cy,layoutConfig,subs)
{
  if(typeof(localStorage)=== "undefined")
  {
    log.error("web storage not available, could not access cache.");
    run(layoutConfig);
    return;
  }
  const name = storageName(layoutConfig.name,subs);
  const cacheItem = localStorage.getItem(name);
  if(cacheItem) // cache hit
  {
    try
    {
      const pos=JSON.parse(cacheItem);
      log.info(`Loaded layout from cache, applying ${pos.length} positions...`);
      const status = presetLayout(cy,pos);
      if(status) {return true;}
      log.warn("Could not apply layout to active graph, recalculating layout...");
    }
    catch(e)
    {
      log.error("Could not load cache item, recalculating layout...",e);
    }
  }
  else // cache miss
  {
    log.warn("Layout not in cache, recalculating layout...");
  }
  return run(cy,layoutConfig,subs);
}


export var breadthfirst = {name: "breadthfirst"};
export var grid = {name: "grid"};

export var euler =
{
  /*eslint no-unused-vars: "off"*/
  name: "euler",
  springLength: edge => 200,
  maxSimulationTime: 2000,
  randomize: true,
  fit:false,
  mass: node => 40,
};

export var cose =
  {
    name: "cose",
    animate: true,
    animationThreshold: 250,
    refresh: 5,
    numIter: 30,
    nodeDimensionsIncludeLabels: true,
    nodeRepulsion: function(){ return 400000; },
    idealEdgeLength: function(){ return 200; },
    nodeOverlap: 100,
    gravity: 80,
    fit: false,
    randomize: true,
    initialTemp: 200,
    //weaver: Weaver,
    weaver: false,
  };

export var coseBilkent =
  {
    name:"cose-bilkent",
    animate: true,
    animationThreshold: 250,
    numIter: 5000,
    nodeDimensionsIncludeLabels: false,
    //nodeRepulsion: function(node){ return 400; },
    //initialTemp: 2000,
  };

export var colaInf =
  {
    name:"cola",
    infinite: true,
    fit: false,
    nodeSpacing: function() {return 40;},
  };

export var cola =
  {
    name:"cola",
    maxSimulationTime: 4000,
    nodeSpacing: function() {return 40;},
    fit:false,
  };
