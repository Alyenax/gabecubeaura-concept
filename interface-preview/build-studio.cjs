/* Build-time only. Copy the real UI, never import the plugin backend or settings. */
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const esbuild = require('esbuild');
const root = path.resolve(process.argv[2] || '../../GabeCubeAura-Lab-consolidation');
const component = path.join(root, 'src/components/AnimatedScreensaverStudio.tsx');
const sha = cp.execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], {encoding:'utf8'}).trim();
fs.mkdirSync(path.join(__dirname, 'studio-player'), {recursive:true});
for (const file of ['index.html','player.js','player.css']) fs.copyFileSync(path.join(root,'assets/animated-screensaver-player',file),path.join(__dirname,'studio-player',file));
fs.copyFileSync(path.join(root,'licenses/SteamOS-Animated-Screensaver-MIT.txt'),path.join(__dirname,'studio-player/LICENSE.txt'));
esbuild.build({
  entryPoints:[path.join(__dirname,'studio-demo.tsx')], outfile:path.join(__dirname,'studio.bundle.js'),
  bundle:true,minify:true,jsx:'automatic',legalComments:'eof',define:{'process.env.NODE_ENV':'"production"'},
  alias:{'@studio-source':component},
  plugins:[{name:'public-service-adapters',setup(build){
    build.onResolve({filter:/^\.\.\/(localized_ui|i18n|studio_types|cinema_types)$/},args=>({path:path.join(__dirname,['../localized_ui','../i18n'].includes(args.path)?'studio-ui.tsx':'studio-safe.ts')}));
  }}],
  nodePaths:[path.join(__dirname,'node_modules')],
  banner:{js:`/* Actual Lab 131 Studio JSX, source ${sha}. Browser-only simulated services. */`}
}).then(()=>{
  fs.copyFileSync(path.join(__dirname,'node_modules/react/LICENSE'),path.join(__dirname,'REACT-LICENSE.txt'));
  console.log('Built Studio preview from',sha);
}).catch(()=>process.exitCode=1);
