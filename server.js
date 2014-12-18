var express = require('express');

var app = express();
require('./api.js');

var mongoose = require('mongoose');
var Article = require('./model.js');


app.get('/', function(req, res) {
  res.send('Hello Seattle\n');
});

var articles = require('./api.js');
    app.get('/articles', articles.nytimes);
//     app.get('/morearticles', articles.findAll);
//     app.get('/articles/:id', articles.show);
//     app.post('/articles', articles.create);
//     app.put('/articles/:id', articles.update);
//     app.delete('/articles/:id', articles.destroy);

// app.get('/articles', function(req, res){
// 	console.log('making articles');
// 	new Article(req)
// 		.save(function(err, articles) {
// 		if (err) return console.error(err);
// 		console.log('saved');
// 		res.send('Saved to Database');
// 	});
// });

app.listen(3001);
console.log('Listening on port 3001...');