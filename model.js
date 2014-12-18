'use strict';

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/wikistack');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var Article;
var Schema = mongoose.Schema;

var articleSchema = new Schema({
  url: String,
  headline: String,
  snippet: String,
  articleScoreSentiment: Number,
  articleTypeSentiment: String
});

Article = mongoose.model('Article', articleSchema);

module.exports = {'Article': Article };