/* No Steam/RPC/API access. Only safe local fixtures behind the actual Lab 131 JSX. */
import React, {useState} from 'react';
import {createRoot, Root} from 'react-dom/client';
import {AnimatedScreensaverStudio} from '@studio-source';
import {ButtonItem,TextField} from './studio-ui';

const base=new URL('./',location.href);
const asset=(name:string)=>new URL('../assets/'+name,base).href;
const clone=(value:any)=>JSON.parse(JSON.stringify(value));
const examples=[
  {appid:292030,name:'The Witcher 3: Wild Hunt',key:'witcher',status:'ready'},
  {appid:548430,name:'Deep Rock Galactic',key:'drg',status:'ready'},
  {appid:2379780,name:'Balatro',key:'balatro',status:'pending'},
];
let root:Root|null=null, host:Element|null=null, queue:number[]=[], tick=0, last=0, syncValue=false;
let games:any[], state:any, log:any[]=[];
function reset(){
  games=examples.map(g=>({...g,installed:true,thumbnail_url:asset(g.key+'-header.jpg'),width:320,height:180,duration:3,format:'gif',credits:{author:'Local illustrative fixture · not a SteamGridDB download'},crop:{mode:'inherit',x:50,y:50},faceplate_crop:{x:50,y:50}}));
  state={name:'Animated Screensaver Studio',revision:'demo-1',game_count:3,installed_count:3,ready_count:2,excluded_count:0,key_configured:false,connection:'missing',storage_bytes:0,faceplate_present:true,
    options:{scene_seconds:24,shuffle:true,transition:'crossfade',show_title:true,show_logo:true,show_cover:true,cover_position:'beside-title',framing:'original',reduced_motion:false,smoothing:false,smoothing_mode:'fast',smoothing_fps:30,max_video_mib:128,storage_mib:2048,prepare_faceplate:false,triple_sync:false},
    job:{state:'idle',stage:'idle',completed:0,total:0,percent:0,current_percent:null,history:[]},
    capabilities:{ffmpeg:false,ffprobe:false,native_first:true},installation:{installed:false,needs_repair:false,needs_update:false,name:'animated-screensaver-studio'},media_tools:{installed:false,state:'idle',percent:0}};
  queue=[];tick=0;last=Date.now();log=[];syncValue=false;
}
reset();
function update(){
  const shared=(window as any).GCAInterfacePreview?.inspect().apiState;
  if(shared){state.key_configured=['detected','verified'].includes(shared);state.connection=shared==='verified'?'verified':state.key_configured?'saved':'missing';}
  state.game_count=games.length;state.ready_count=games.filter(g=>g.status==='ready'&&!g.excluded).length;state.excluded_count=games.filter(g=>g.excluded).length;
  state.storage_bytes=games.filter(g=>g.status==='ready').length*245760;
  state.faceplate_present=!document.querySelector<HTMLSelectElement>('#preview-situation')?.value.includes('absent');
  if(state.job.state==='running'&&Date.now()-last>650){
    last=Date.now();tick++;
    state.job.stage=['checking','downloading','validating','preparing_jsaux'][Math.min(3,tick%4)];
    state.job.current_percent=(tick%4)*25;state.job.percent=Math.round((state.job.completed+(tick%4)/4)/state.job.total*100);
    state.job.history.push({at:Date.now()/1000,stage:state.job.stage,percent:state.job.current_percent,appid:queue[0]});
    if(tick%4===0){const g=games.find(g=>g.appid===queue.shift());if(g){g.status='ready';g.pending_change=false;g.error='';g.panelReady=state.options.prepare_faceplate;}state.job.completed++;}
    if(!queue.length)Object.assign(state.job,{state:'complete',stage:'complete',percent:100,current_percent:100});
  }
  if(state.media_tools.state==='downloading'&&Date.now()-last>650){last=Date.now();state.media_tools.percent+=25;if(state.media_tools.percent>=100){Object.assign(state.media_tools,{installed:true,state:'complete',percent:100});state.capabilities.ffmpeg=state.capabilities.ffprobe=true;}}
  return clone(state);
}
const onMutation=()=>{state.revision='demo-'+(Number(state.revision.split('-')[1])+1);if(state.installation.installed)state.installation.needs_update=true;};
async function client(action:string,p:any={}){
  log.push({action,payload:clone(p)});
  if(log.length>100)log.shift();
  if(action==='library'){
    const rows=games.filter(g=>g.name.toLowerCase().includes((p.query||'').toLowerCase())).filter(g=>!p.filter||p.filter==='all'||p.filter==='included'&&!g.excluded||p.filter==='excluded'&&g.excluded||p.filter==='installed'&&g.installed||p.filter==='manual'&&g.manual||p.filter===g.status);
    const page=Math.min(Number(p.page)||0,Math.max(0,Math.ceil(rows.length/6)-1));return clone({items:rows.slice(page*6,page*6+6),total:rows.length,page,page_size:6});
  }
  if(action==='configure'){Object.assign(state.options,p.patch);onMutation();}
  if(action==='game'){Object.assign(games.find(g=>g.appid===p.appid)||{},p.patch);onMutation();}
  if(action==='scan')state.warning='Sample installed games loaded. No Steam scan was performed.';
  if(action==='validate_key'){state.connection=state.key_configured?'verified':'missing';if(state.key_configured)(window as any).GCAInterfacePreview?.exampleKey('verified');}
  if(action==='candidates'){
    const g=games.find(g=>g.appid===p.appid)||games[0];
    return ['header','hero','capsule'].map((kind,i)=>({id:i+1,kind:p.role,animated:p.role==='animation',thumb:asset(g.key+'-'+kind+'.jpg'),url:asset(g.key+'-'+kind+'.jpg'),width:kind==='hero'?1920:kind==='capsule'?600:460,height:kind==='hero'?620:kind==='capsule'?900:215,author:'Bundled '+kind+' · illustrative choice'}));
  }
  if(action==='choose'){const g=games.find(g=>g.appid===p.appid);if(g){g.pending_change=true;g.choice=p.asset_id;}onMutation();}
  if(action==='search')return examples.filter(g=>g.name.toLowerCase().includes(String(p.query||'').toLowerCase())||String(g.appid)===String(p.query)||String(p.query).includes('/'+g.appid)).map(g=>({id:g.appid,name:g.name}));
  if(action==='add'){const g=examples.find(g=>g.appid===p.id);if(g&&!games.some(x=>x.appid===p.id))games.push({...g,manual:true,status:'pending',thumbnail_url:asset(g.key+'-header.jpg')});state.warning='Only the three bundled examples are searchable. No SteamGridDB request was made.';}
  if(action==='import_owned')throw Error('Preview only. No Steam profile or key is transmitted. Use Scan Steam to restore the bundled examples.');
  if(action==='prepare'){
    if(!state.key_configured)throw Error('Add an example SteamGridDB key in Settings first. Never enter a real key here.');
    if(!state.media_tools.installed)throw Error('Simulate the video tools installation first.');
    queue=games.filter(g=>!g.excluded&&(!p.appid||g.appid===p.appid)).map(g=>g.appid);tick=0;last=Date.now();
    state.job={state:queue.length?'running':'complete',stage:'checking',completed:0,total:queue.length,percent:0,current_percent:0,history:[],name:games.find(g=>g.appid===queue[0])?.name};onMutation();
  }
  if(action==='pause')Object.assign(state.job,{state:'paused',stage:'paused'});
  if(action==='resume'){state.job.state='running';last=Date.now();}
  if(action==='cancel'){queue=[];Object.assign(state.job,{state:'cancelled',stage:'cancel'});}
  if(action==='tools'){Object.assign(state.media_tools,p.action==='verify'?{state:'complete',installed:true,percent:100}:{state:'downloading',installed:false,percent:0});last=Date.now();}
  if(action==='install'||action==='repair'){Object.assign(state.installation,{installed:true,needs_update:false,scene_count:state.ready_count});state.warning='Simulated installation only. Nothing was installed or selected in Steam.';}
  if(action==='uninstall'){state.installation.installed=false;state.warning='Example installation removed. No real files were touched.';}
  if(action==='purge'){games.forEach(g=>{g.status='pending';g.panelReady=false;});onMutation();}
  if(action==='verify')state.warning='Bundled demo files only. Real prepared media and device playback are not verified.';
  if(action==='unused')state.warning='Example cleanup completed. No real file was deleted.';
  if(action==='report')return {last_error:'Preview only. No diagnostic was collected or sent.'};
  if(action==='preview'){
    const chosen=games.filter(g=>g.status==='ready'&&!g.excluded&&(!p.appid||g.appid===p.appid));
    if(!chosen.length)throw Error('No prepared example is available.');
    return {url:new URL('studio-player/index.html?game='+(p.appid||'all'),base).href,nonce:'public-demo-only',count:chosen.length,revision:state.revision,
      ...(p.appid&&chosen[0].panelReady?{faceplate_url:new URL('studio-player/'+chosen[0].key+'-panel.gif',base).href,faceplate_frames:30}:{})};
  }
  return update();
}
function Connection({changed}:any){
  const [open,setOpen]=useState(false);
  return <><ButtonItem label="SteamGridDB connection" onClick={()=>setOpen(!open)}>{open?'Hide details':state.key_configured?'Manage':'Connect'}</ButtonItem>{open&&<>
    <ButtonItem label="Open API keys in the system browser" onClick={()=>window.open('https://www.steamgriddb.com/profile/preferences/api','_blank','noopener,noreferrer')}>Open copy-capable browser</ButtonItem>
    <TextField label="Personal API key" disabled value="" description="Real keys are disabled in this public preview. Use the example key below."/>
    <ButtonItem label="Use example SteamGridDB key" onClick={()=>{state.key_configured=true;state.connection='saved';(window as any).GCAInterfacePreview?.exampleKey('detected');changed(true);}}>Use example key</ButtonItem>
    <ButtonItem label="Forget example key" onClick={()=>{state.key_configured=false;state.connection='missing';(window as any).GCAInterfacePreview?.exampleKey('absent');changed(false);}}>Forget</ButtonItem>
  </>}</>;
}
function App(){
  const [key,setKey]=useState(state.key_configured),[sync,setSync]=useState(syncValue);
  return <><p className="sample-note">Lab 131 · actual Studio component. Browser-local simulation: no real downloads, API calls, Steam installation or USB writes. Animated examples are illustrative pans from the three bundled still artworks, not SteamGridDB results.</p><AnimatedScreensaverStudio client={client} keyConfigured={key} apiKeySetup={<Connection changed={setKey}/>} syncEnabled={sync} onSyncChange={async v=>{syncValue=v;setSync(v);}}/></>;
}
function unmount(){root?.unmount();root=null;host=null;}
(window as any).GCAStudioDemo={mount:(node:Element)=>{unmount();host=node;root=createRoot(node);root.render(<App/>);},unmount,reset:()=>{unmount();reset();},inspect:()=>({state:clone(state),games:clone(games),log:clone(log)}),catalog:(number?:number)=>({version:1,previewNonce:'public-demo-only',settings:{sceneDuration:state.options.scene_seconds,shuffle:state.options.shuffle,transition:state.options.transition,showLogos:state.options.show_title,showActualLogos:state.options.show_logo,showCover:state.options.show_cover,coverPosition:state.options.cover_position,framing:state.options.framing,tripleSync:false},games:games.filter(g=>g.status==='ready'&&!g.excluded&&(!number||g.appid===number)).map(g=>({id:'steam:'+g.appid,name:g.name,status:'ready',included:true,crop:g.crop,media:{file:'media/'+g.key+'.gif',thumbnail:'media/'+g.key+'.jpg',format:'gif',animated:true,width:320,height:180,author:{name:'Local illustrative animation'}},cover:{file:'media/'+g.key+'.jpg',animated:false}}))})};
