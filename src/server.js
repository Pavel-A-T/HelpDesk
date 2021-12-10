const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const fileSystem = require('fs');
const config = require('./config');

const app = new Koa();
const router = new Router();

const path = './src/db.json';
const fileDB = fileSystem.readFileSync(path);

app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
    return await next();
  }

  const headers = { 'Access-Control-Allow-Origin': '*' };

  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({ ...headers });
    try {
      return await next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }

  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, DELETE',
    });

    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set(
          'Access-Control-Allow-Headers',
          ctx.request.get('Access-Control-Request-Headers'),
      );
    }

    ctx.response.status = 204;
  }
});


router.get('/allTickets', async (ctx) => {
  try {
    const dataFromDB = JSON.parse(fileDB);
    dataFromDB.map((item) => delete item.description);
    ctx.body = dataFromDB;
  } catch (error) {
    console.error('err', error);
    ctx.status = 500;
    ctx.body = 'Internal Server error';
  }
});

router.get('/:id', async (ctx) => {
  try {
    const { id } = Number(ctx.params);
    if (Number.isNaN(id) || !Number.isInteger(id) || id < 0) throw new Error(" incorrect 'id'");
    const dataFromDB = JSON.parse(fileDB);
    ctx.body = dataFromDB.filter((i) => i.id === id);
  } catch (error) {
    console.error('err', error);
    ctx.status = 500;
    ctx.body = 'Internal Server error';
  }
});

router.post('/', async (ctx) => {
  try {
    const data = ctx.request.body;
    const dataFromDB = JSON.parse(fileDB);
    let result;
    if (Object.keys(data).length !== 4) throw new Error(' incorrect object. The number of object keys is not equal to four');
    if (typeof data.name === 'undefined') throw new Error(" incorrect object. Key 'name' not found");
    if (typeof data.description === 'undefined') throw new Error(" incorrect object. Key 'description' not found");
    if (typeof data.status === 'undefined') throw new Error(" incorrect object. Key 'status' not found");
    if (typeof data.created === 'undefined') throw new Error(" incorrect object. Key 'created' not found");
    if (dataFromDB && dataFromDB.length > 0) {
      dataFromDB.sort((a, b) => b.id - a.id);
      result = { id: dataFromDB[0].id + 1, ...data };
    } else result = { id: 1, ...data };
    fileSystem.writeFileSync(path, JSON.stringify([...dataFromDB, result]));
    ctx.body = data;
  } catch (error) {
    console.error('err', error);
    ctx.status = 500;
    ctx.body = 'Internal Server error';
  }
});

router.delete('/:id', async (ctx) => {
  try {
    const { id } = Number(ctx.params);
    if (Number.isNaN(id) || !Number.isInteger(id) || id < 0) throw new Error(" incorrect 'id'");
    const dataFromDB = JSON.parse(fileDB);
    const index = dataFromDB.findIndex((i) => i.id === id);
    if (index > -1) dataFromDB.splice(index, 1);
    fileSystem.writeFileSync(path, JSON.stringify([...dataFromDB]));
    ctx.body = true;
  } catch (error) {
    console.error('err', error);
    ctx.status = 500;
    ctx.body = 'Internal Server error';
  }
});

app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(config.port, () => {
  app.use(async (ctx) => {
    ctx.body = `Server started on port ${config.port}`;
  });
});
