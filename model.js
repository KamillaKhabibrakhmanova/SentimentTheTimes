'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
 	myConnection = Mongoose.createConnection('localhost', 'mydatabase');

var ArticleSchema = new Mongoose.schema({
  url: String,
  headline: String,
  snippet: String,
  articleScoreSentiment: Number,
  articleTypeSentiment: String
});

module.exports = myConnection.model('Article', ArticleSchema);