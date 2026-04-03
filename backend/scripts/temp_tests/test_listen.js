const http = require('http');
const server = http.createServer((req, res) => {
    res.end('alive');
});
server.listen(5000, () => {
    console.log('Server listening on 5000');
});
