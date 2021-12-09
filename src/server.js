const Koa = require('koa');
const KoaBody = require('koa-body');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const fileSystem = require('fs');
const config = require('./config')


const app = new Koa();
const router = new Router();

const path = './src/db.json';
const fileDB = fileSystem.readFileSync(path);
const dataFromDB = JSON.parse(fileDB);

router.get('/', ctx => {
    const fileDB = fileSystem.readFileSync(path);
    let dataFromDB = JSON.parse(fileDB);
    dataFromDB.map(i => delete i.description);
    ctx.body = dataFromDB;
});

router.post('/', ctx => {
    console.log(ctx.params);
    const data = ctx.request.body;
    fileSystem.writeFileSync(path, JSON.stringify([...dataFromDB, data]));
    ctx.body = data;
});

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(config.port, () => {console.log(`Server started on port ${config.port}`)});





