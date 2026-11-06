import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname,resolve,sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('./dist/',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.ttf':'font/ttf'};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://127.0.0.1');
  const path=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
  if(!path.startsWith(root.endsWith(sep)?root:root+sep)){res.writeHead(403);return res.end('Acesso não permitido');}
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
  const data=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Página não encontrada');}
});
const port=Number(process.env.PORT||3003);server.listen(port,'127.0.0.1',()=>console.log(`GOJIRA — prévia local: http://127.0.0.1:${port}`));
process.on('SIGINT',()=>server.close(()=>process.exit(0)));process.on('SIGTERM',()=>server.close(()=>process.exit(0)));
