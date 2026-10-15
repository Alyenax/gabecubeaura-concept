/* Offline source audit. Reads JSX definitions, never imports the plugin runtime. */
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const sourceRoot = path.resolve(process.argv[2]);
const ts = require(require.resolve('typescript', { paths: [sourceRoot] }));
const files = ['src/index.tsx','src/components/GabeAssistantPanel.tsx','src/components/AmbienceProfilesPanel.tsx','src/components/FlashProtectionPanel.tsx'];
const allVariables = new Map(), trees = [];
for (const file of files) {
  const tree = ts.createSourceFile(file, fs.readFileSync(path.join(sourceRoot,file),'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const scan = node => { if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) allVariables.set(node.name.text,node.initializer); ts.forEachChild(node,scan); }; scan(tree); trees.push(tree);
}
function value(node, seen = new Set()) {
  if (!node) return undefined;
  if (ts.isJsxExpression(node) || ts.isAsExpression(node) || ts.isParenthesizedExpression(node) || ts.isSatisfiesExpression(node)) return value(node.expression,seen);
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken) return -value(node.operand,seen);
  if (ts.isIdentifier(node) && allVariables.has(node.text) && !seen.has(node.text)) return value(allVariables.get(node.text),new Set([...seen,node.text]));
  if (ts.isArrayLiteralExpression(node)) { const r=node.elements.map(n=>value(n,seen)); return r.every(v=>v!==undefined)?r:undefined; }
  if (ts.isObjectLiteralExpression(node)) { const r={}; for(const p of node.properties) if(ts.isPropertyAssignment(p)) r[p.name.text]=value(p.initializer,seen); return r; }
  if (ts.isConditionalExpression(node)) return value(node.whenTrue,seen) ?? value(node.whenFalse,seen);
  return undefined;
}
function attrs(node) { const out={}; for(const p of node.attributes.properties) if(ts.isJsxAttribute(p))out[p.name.text]=p.initializer; return out; }
function strings(node) { const out=[]; const walk=n=>{if(ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n))out.push(n.text);else ts.forEachChild(n,walk);};if(node)walk(node);return out; }
const controls=[];
for (const tree of trees) {
  const walk=node=>{
    if(ts.isJsxSelfClosingElement(node)||ts.isJsxOpeningElement(node)) {
      const type=node.tagName.getText(tree), a=attrs(node);
      if(['ToggleField','SliderField','DropdownItem','TextField','PreciseColorEditor','ButtonItem'].includes(type)&&a.label) {
        let ancestors=[], owner='', page='', section='', disclosure='';
        for(let n=node.parent;n;n=n.parent) {
          if(ts.isJsxElement(n)){const t=n.openingElement.tagName.getText(tree),p=attrs(n.openingElement);if(!section&&t==='PanelSection')section=value(p.title)||strings(p.title)[0]||'';if(!disclosure&&t==='Disclosure')disclosure=value(p.title)||'';}
          if(ts.isConditionalExpression(n)){const c=n.condition.getText(tree),m=c.match(/showPage\("([^"]+)"\)/)||c.match(/page === "([^"]+)"/);if(m&&!page)page=m[1];}
          if(ts.isFunctionDeclaration(n)){owner=n.name?.text||'';break;}
        }
        const label=value(a.label)||strings(a.label)[0]||'Contextual control';
        const description=value(a.description)||strings(a.description)[0]||'';
        let setting;
        const settingsWalk=n=>{if(ts.isCallExpression(n)&&n.expression.getText(tree)==='setSetting')setting=value(n.arguments[0]);ts.forEachChild(n,settingsWalk);};
        if(a.onChange)settingsWalk(a.onChange);
        const bound=(a.checked||a.selectedOption||a.value)?.getText(tree).match(/(?:status|config|draft)\.([a-zA-Z_0-9.]+)/)?.[1];
        const options=value(a.rgOptions);
        controls.push({owner,page,section,disclosure,type,label,description,key:setting||bound||null,
          options:Array.isArray(options)?options.filter(v=>v&&v.data!==undefined&&v.label!==undefined).map(v=>({value:v.data,label:v.label})):null,
          optionsRef:options?null:a.rgOptions?.getText(tree).replace(/^\{|\}$/g,'')||null,
          min:value(a.min),max:value(a.max),step:value(a.step),suffix:value(a.valueSuffix),
          file:tree.fileName,line:tree.getLineAndCharacterOfPosition(node.getStart()).line+1});
      }
    } ts.forEachChild(node,walk);
  };walk(tree);
}
const groups={};for(const field of controls){const id=field.page||field.owner;(groups[id]??=[]).push(field);}
const constants={};for(const [key,node]of allVariables){if(key.endsWith('_OPTIONS')){const v=value(node);if(Array.isArray(v))constants[key]=v;}}
const vm=require('node:vm'), cache=new Map();
const allowed=new Set(['customization_catalog','controller_variants','event_variants','weather_variants','gabe_glossary','weather_icon_sets']);
function dataModule(name){
 if(!allowed.has(name))throw Error('Module not allowed: '+name);
 if(cache.has(name))return cache.get(name);
 const out={};cache.set(name,out);
 const code=ts.transpileModule(fs.readFileSync(path.join(sourceRoot,'src',name+'.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInNewContext(code,{exports:out,require:id=>dataModule(id.replace(/^\.\//,''))},{timeout:1000});return out;
}
const catalogs={};for(const name of allowed)Object.assign(catalogs,dataModule(name));
catalogs.WEATHER_ICON_SVGS=Object.fromEntries(catalogs.WEATHER_ICON_STYLE_OPTIONS.map(style=>[style.data,Object.fromEntries(catalogs.WEATHER_CONDITIONS.map(condition=>[condition.data,catalogs.weatherIconSvg(style.data,condition.data).replace(/ style="[^"]*"/g,'')]))]));
const result={source_commit:cp.execFileSync('git',['-C',sourceRoot,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),groups,constants,catalogs};
fs.writeFileSync(path.join(__dirname,'source-catalog.js'),'globalThis.GCA_INTERFACE_SOURCE='+JSON.stringify(result)+';\n');
console.log(Object.fromEntries(Object.entries(groups).map(([key,rows])=>[key,rows.length])));
