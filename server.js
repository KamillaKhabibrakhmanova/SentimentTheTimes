var express = require('express');

var app = express();
require('./api.js');


app.get('/', function(req, res) {
  res.send('Hello Seattle\n');
});

var articles = require('./api.js');
    app.get('/articles', articles.nytimes);
    app.get('/morearticles', articles.findAll);
    app.get('/articles/:id', articles.show);
    app.post('/articles', articles.create);
    app.put('/articles/:id', articles.update);
    app.delete('/articles/:id', articles.destroy);

app.listen(3001);
console.log('Listening on port 3001...');