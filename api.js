const Koa=require("koa"),Router=require("koa-router"),koaStatic=require("koa-static"),app=new Koa,prefix="/api",router=new Router({prefix:"/api"}),path=require("path"),repo=require("./repository");let serverInfo=null,koaServer=null;function getIPAddress(){const e=require("os").networkInterfaces();for(let r in e){const t=e[r];for(let e=0;e<t.length;e++){const r=t[e];if("IPv4"===r.family&&"127.0.0.1"!==r.address&&!r.internal)return r.address}}}async function reload(e,r){if(repo.applyConfig(e),r){const e=await repo.loadRuleByURL(),r=e.map(e=>`[加载][${e.name}][${e.url}]`).join("\n"),t=e.filter(e=>e.proxy).length,o=`${r}\n${e.length}个规则加载完成，其中${e.length-t}个可直接使用，${t}个需要代理\n`;console.info(o)}}async function start(e,r){try{const t=process.env.PORT||9e3;return koaServer=app.listen(t),serverInfo={port:t,ip:getIPAddress(),local:"localhost"},await reload(e,r),serverInfo}catch(e){return{message:e.message}}}function stop(e){koaServer&&koaServer.close(()=>{serverInfo=null,koaServer=null,e()})}function isStarting(){return null!=serverInfo}function getServerInfo(){return serverInfo}app.use(require("@koa/cors")()),app.use(require("koa-bodyparser")()),app.use(require("./middleware/block")),app.use(require("./middleware/response-template")),router.get("/rule",async e=>{e.success(await repo.getRule())}),router.get("/load-rule",async e=>{e.success(await repo.loadRuleByURL())}),router.get("/search",async e=>{if(e.query.keyword){const r=repo.makeupSearchOption(e.query),t=await repo.obtainSearchResult(r,e.headers);e.success({current:r,items:t}),t&&t.length>0&&repo.asyncCacheSearchResult(r,e.headers)}else e.throw(400,"请输入关键词")}),router.get("/detail",async e=>{const r=e.query.id,t=e.query.path;if(r&&t){const o=await repo.obtainDetailResult({id:r,path:t},e.headers);e.success(o)}else e.throw(400,"请指定ID和URL")}),app.use(router.routes()).use(router.allowedMethods()),module.exports={reload:reload,start:start,stop:stop,getServerInfo:getServerInfo,isStarting:isStarting,prefix:"/api",getProxyNetworkInfo:repo.getProxyNetworkInfo};