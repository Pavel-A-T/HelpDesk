const port = process.env.PORT || 7070;
const server = http.createServer(app.callback()).listen(port);


const http = require('http');
const Koa = require('koa');


const app = new Koa();

const server = http.createServer((req, res) => {
    console.log(req);
    res.end('server response');
});
const port = 7070;
// слушаем определённый порт
server.listen(port, (err) => {
    if (err) {
        console.log('Error occured:', error);
        return;
    }
    console.log(`server is listening on ${port}`);
});


app.use(async (ctx) => {
    ctx.response.body = 'server response';
});
const server = http.createServer(app.callback()).listen(7070);

app.use(async (ctx, next) => {
// do something
    await next(); // передача контроля следующему middleware
// do something
})


