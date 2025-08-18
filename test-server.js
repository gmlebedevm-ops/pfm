const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Тестовый сервер</title>
        <meta charset="utf-8">
    </head>
    <body>
        <h1>Тестовый сервер работает!</h1>
        <p>Если вы видите эту страницу, значит сервер работает правильно.</p>
        <p>Время: ${new Date().toLocaleString('ru-RU')}</p>
        <p>URL: ${req.url}</p>
        <p>Метод: ${req.method}</p>
    </body>
    </html>
  `);
});

server.listen(9000, '0.0.0.0', () => {
  console.log('Тестовый сервер запущен на http://localhost:9000');
});