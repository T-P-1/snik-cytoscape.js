/**
Loading animation for long processes, such as layouting.
@module */
import {Spinner} from '../lib/spin.js';

const opts = {
  lines: 13, // The number of lines to draw
  length: 28, // The length of each line
  width: 35, // The line thickness
  radius: 84, // The radius of the inner circle
  scale: 3, // Scales overall size of the spinner
  corners: 1, // Corner roundness (0..1)
  color: '#ffffff', // #rgb or #rrggbb or array of colors
  opacity: 0.6, // Opacity of the lines
  rotate: 35, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  speed: 1, // Rounds per second
  trail: 60, // Afterglow percentage
  fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  className: 'spinner', // The CSS class to assign to the spinner
  top: '50%', // Top position relative to parent
  left: '50%', // Left position relative to parent
  shadow: false, // Whether to render a shadow
  hwaccel: false, // Whether to use hardware acceleration
  position: 'absolute', // Element positioning
};
let spinner = null;
let active = 0;

/** Not thread safe but javascript is single threaded for now.*/
function progress(p)
{
  if(!window) {return;} // ignore when running in nodejs
  if(!spinner) {spinner = new Spinner(opts);}
  if(p<100)
  {
    if(!active)
    {
      document.body.classList.add('waiting');
      spinner.spin(document.body);
    }
    active++;
  }
  if(p>=100)
  {
    active--;
    if(active===0)
    {
      document.body.classList.remove('waiting');
      spinner.stop();
    }
  }
}

export {progress};
