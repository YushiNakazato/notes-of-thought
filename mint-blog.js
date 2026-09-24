import {initTheme, initDisclosure} from './vendor/mint-ui/0.4.15/mint-ui.js';
const theme=initTheme({storageKey:'mint-theme-notes',syncDarkClass:true,allowedModes:['dark']});
let nav;
function setup(){
  theme.setMode('dark');
  const next=document.querySelector('.mint-blog-nav');
  if(next && next!==nav){initDisclosure(next);nav=next;}
}
document.addEventListener('mint:set-theme',event=>theme.setMode(event.detail));
setup();
document.addEventListener('astro:page-load',setup);
function connectSwup(){window.swup?.hooks.on('page:view',setup);}
if(window.swup)connectSwup();else document.addEventListener('swup:enable',connectSwup,{once:true});
