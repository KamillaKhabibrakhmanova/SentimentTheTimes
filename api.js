'use strict';

var _ = require('lodash');
var Article = require('./model.js');
var request = require('request');
var topStoriesAPIKey = "d805ba97c656f759efe195cc43e65aa8:3:70391328";

// get nytimes articles
exports.nytimes = function(req, res){
  getTopStories(res);
};

function getTopStories(res){
  console.log("getTopStories");
  var url = "http://api.nytimes.com/svc/topstories/v1/home.json?api-key=" + topStoriesAPIKey;
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var results = JSON.parse(body).results
      var articles = [];
      for (var i in results){
        var result = results[i]
        var article = {
          "url": result.url,
          "headline": result.title,
          "snippet": result.abstract,
        };
        articles.push(article);
      }
      alchemy(articles, res);
    } else{
      handleError(res, error);
    }
  });
}

var alchemyAPI = new AlchemyAPI();

// var nytArticles = [{url: "",
//                articleScoreSentiment: "",
//                articleTypeSentiment: "",
//                headline: "",
//                snippet: ""}]

function alchemy(articles, res) {
  var numArticles = articles.length;
  var counter = 0;
  articles.forEach(function(articleObject) {
     alchemyAPI.sentiment('url', articleObject.url, {}, function(response) {
         articleObject.articleScoreSentiment = response.docSentiment.score;
         articleObject.articleTypeSentiment = response.docSentiment.type;
         counter++;
    if (counter === (numArticles - 1) ) {
      res.status(200).send(articles);
    }
    });
  });
};

/**
  * Calculates the sentiment for text, a URL or HTML.
  * For an overview, please refer to: http://www.alchemyapi.com/products/features/sentiment-analysis/
  * For the docs, please refer to: http://www.alchemyapi.com/api/sentiment-analysis/
  *
  * INPUT:
  * flavor -> which version of the call, i.e. text, url or html.
  * data -> the data to analyze, either the text, the url or html code.
  * options -> various parameters that can be used to adjust how the API works, see below for more info on the available options.
  * callback -> the callback function for this async function
  *
  * Available Options:
  * showSourceText -> 0: disabled (default), 1: enabled
  *
  * OUTPUT:
  * The response, already converted from JSON to a Javascript object.
*/
AlchemyAPI.prototype.sentiment = function(flavor, data, options, callback) {
  options = options || {}

  if (!(flavor in AlchemyAPI.ENDPOINTS['sentiment'])) {
    callback({ status:'ERROR', statusInfo:'Sentiment analysis is not available for ' + flavor });
  } else {
    //Add the data to the options and analyze
    options[flavor] = data;
    this.analyze(AlchemyAPI.ENDPOINTS['sentiment'][flavor], options, callback);
  }
};


/**
   Copyright 2014 AlchemyAPI

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/


var http = require('http');
var fs = require('fs');


//Make the class available
//exports = module.exports = AlchemyAPI;



/**
  * Checks if file is called directly, and then writes the API key to api_key.txt if it's included in the args
  *
  * Note: if you don't have an API key, register for one at: http://www.alchemyapi.com/api/register.html
  *
  * INPUT:
  * Your API Key (sent as a command line argument)
  *
  * OUTPUT:
  * none
*/
if (require.main === module) {
  //file was called directly from command line to set the key
  if (process.argv[2]) {
    console.log('Args: ' + process.argv[2]);
    fs.writeFile(__dirname + '/api_key.txt',process.argv[2], function(err) {
      if (err) {
        console.log('Error, unable to write key file: ' + err);
        process.exit(1);
      } else {
        console.log('AlchemyAPI key: ' + process.argv[2] + ' successfully written to api_key.txt');
        console.log('You are now ready to start using AlchemyAPI. For an example, run: node app.js');
        process.exit(0);
      }
    });
  } else {
    console.log('Are you trying to set the key? Make sure to use: node alchemyapi.js YOUR_KEY_HERE');
    process.exit(1);
  }
}



function AlchemyAPI() {

  //Load the key from api_key.txt
  try {
    var key = "1000f92f6efe94e96e0b723d2c3675a25fbf4dc2";
    //key = fs.readFileSync(__dirname + '/api_key.txt').toString().trim();
  }
  catch(err) {
    //Create the file
    fs.openSync(__dirname + '/api_key.txt', 'w');
    console.log('API key not detected in api_key.txt, please run: node alchemyapi.js YOUR_KEY_HERE');
    console.log('If you do not have a key, register for one at: http://www.alchemyapi.com/api/register.html');
    process.exit(1);
  }

  //Make sure the key formating looks good
  if (key.length != 40) {
    console.log('The API key in api_key.txt does not appear to be valid. Make sure to run: node alchemyapi.js YOUR_KEY_HERE');
    console.log('If you do not have a key, register for one at: http://www.alchemyapi.com/api/register.html');
    process.exit(1);
  }

  //Set the key
  this.apikey = key;


  /**
    * HTTP Request wrapper that is called by the endpoint functions. This function is not intended to be called through an external interface.
    * It makes the call, then converts the returned JSON string into a Javascript object.
    *
    * INPUT:
    * url -> the full URI encoded url
    * params -> the call parameters, both required and optional
    * sfile -> a file to stream if this is a file upload (optional)
    * callback -> the callback function
    *
    * OUTPUT:
    * The response, already converted from JSON to a Javascript object.
  */
  /*
  this.analyze = function (endpoint, params, sfile, callback) {
    // This is an upload if there is a file for streaming
    if (typeof sfile === "string") {
      return this.analyze_upload(endpoint, params, sfile, callback);
    } else {
      callback = sfile;
    }

    //Insert the base url
    var url = AlchemyAPI.BASE_URL + endpoint;

    //Add the API key and set the output mode to JSON
    params['apikey'] = this.apikey;
    params['outputMode'] = 'json';
    if ("image" in params) {
      params['imagePostMode'] = 'not-raw';
    }

    //Fire off the request
    request.post(url, {form:params}, function(error, response, body) {
      if (error) throw new Error(error);
      if (response.statusCode == 200) {
        callback(JSON.parse(body));
      } else {
        callback({ status:'ERROR', statusInfo:'invalid server response' });
      }
    });
  }
  */

  /**
    * HTTP Uploader
    * It makes the call, then converts the returned JSON string into a Javascript object.
    *
    * INPUT:
    * url -> the full URI encoded url
    * params -> the call parameters, both required and optional
    * sfile -> a file to stream if this is a file upload (optional)
    * callback -> the callback function
    *
    * OUTPUT:
    * The response, already converted from JSON to a Javascript object.
  */
  this.analyze = function (endpoint, params, sfile, callback) {
    var urlKVPairs = [];
    var reqParams = "";
    var reqBody = "";
    var upload = false;

    //Add the API key and set the output mode to JSON
    params['apikey'] = this.apikey;
    params['outputMode'] = 'json';

    // This is an upload if there is a file for streaming
    if (typeof sfile === "string") {
      params['imagePostMode'] = 'raw';
      upload = true;
    } else { // not an upload, sfile param must be the callback
      callback = sfile;
    }

    //Build the API options into the URL (for upload) or body
    Object.keys(params).forEach(function(key) {
      urlKVPairs.push(key + '=' + encodeURIComponent(params[key]));
    });
    if (upload) {
      reqParams = "?" + urlKVPairs.join('&');
    } else {
      reqBody = urlKVPairs.join('&');
    }

    //Build the HTTP request options
    var opts = {
      method: "POST",
      hostname: AlchemyAPI.HOST,
      path: AlchemyAPI.BASE_URL + endpoint + reqParams,
    };
    if (upload) {
      opts['headers'] = {'Content-Length': fs.statSync(sfile).size};
    } else {
      opts['headers'] = {'Content-Length': reqBody.length};
    }

    var postReq = http.request(opts, function (res) {
      var response = "";
      res.setEncoding('utf8');
      res.on('data', function (chunk) { response += chunk; });
      res.on('end', function () { callback(JSON.parse(response)); });
      res.on('error', function (err) {
        callback({ status:'ERROR', statusInfo: err });
      });
    });

    // Execute the call to the API
    if (upload) {
      fs.createReadStream(sfile).pipe(postReq);
    } else {
      postReq.write(reqBody);
      postReq.end();
    }
  };

}; // end AlchemyAPI



//Add the static variables
AlchemyAPI.HOST = 'access.alchemyapi.com';
AlchemyAPI.BASE_URL = '/calls';

//Setup the endpoints
AlchemyAPI.ENDPOINTS = {};
AlchemyAPI.ENDPOINTS['sentiment'] = {};
AlchemyAPI.ENDPOINTS['sentiment']['url'] = '/url/URLGetTextSentiment';
AlchemyAPI.ENDPOINTS['sentiment']['text'] = '/text/TextGetTextSentiment';
AlchemyAPI.ENDPOINTS['sentiment']['html'] = '/html/HTMLGetTextSentiment';
AlchemyAPI.ENDPOINTS['sentiment_targeted'] = {};
AlchemyAPI.ENDPOINTS['sentiment_targeted']['url'] = '/url/URLGetTargetedSentiment';
AlchemyAPI.ENDPOINTS['sentiment_targeted']['text'] = '/text/TextGetTargetedSentiment';
AlchemyAPI.ENDPOINTS['sentiment_targeted']['html'] = '/html/HTMLGetTargetedSentiment';
AlchemyAPI.ENDPOINTS['author'] = {};
AlchemyAPI.ENDPOINTS['author']['url'] = '/url/URLGetAuthor';
AlchemyAPI.ENDPOINTS['author']['html'] = '/html/HTMLGetAuthor';
AlchemyAPI.ENDPOINTS['keywords'] = {};
AlchemyAPI.ENDPOINTS['keywords']['url'] = '/url/URLGetRankedKeywords';
AlchemyAPI.ENDPOINTS['keywords']['text'] = '/text/TextGetRankedKeywords';
AlchemyAPI.ENDPOINTS['keywords']['html'] = '/html/HTMLGetRankedKeywords';
AlchemyAPI.ENDPOINTS['concepts'] = {};
AlchemyAPI.ENDPOINTS['concepts']['url'] = '/url/URLGetRankedConcepts';
AlchemyAPI.ENDPOINTS['concepts']['text'] = '/text/TextGetRankedConcepts';
AlchemyAPI.ENDPOINTS['concepts']['html'] = '/html/HTMLGetRankedConcepts';
AlchemyAPI.ENDPOINTS['entities'] = {};
AlchemyAPI.ENDPOINTS['entities']['url'] = '/url/URLGetRankedNamedEntities';
AlchemyAPI.ENDPOINTS['entities']['text'] = '/text/TextGetRankedNamedEntities';
AlchemyAPI.ENDPOINTS['entities']['html'] = '/html/HTMLGetRankedNamedEntities';
AlchemyAPI.ENDPOINTS['category'] = {};
AlchemyAPI.ENDPOINTS['category']['url']  = '/url/URLGetCategory';
AlchemyAPI.ENDPOINTS['category']['text'] = '/text/TextGetCategory';
AlchemyAPI.ENDPOINTS['category']['html'] = '/html/HTMLGetCategory';
AlchemyAPI.ENDPOINTS['relations'] = {};
AlchemyAPI.ENDPOINTS['relations']['url']  = '/url/URLGetRelations';
AlchemyAPI.ENDPOINTS['relations']['text'] = '/text/TextGetRelations';
AlchemyAPI.ENDPOINTS['relations']['html'] = '/html/HTMLGetRelations';
AlchemyAPI.ENDPOINTS['language'] = {};
AlchemyAPI.ENDPOINTS['language']['url']  = '/url/URLGetLanguage';
AlchemyAPI.ENDPOINTS['language']['text'] = '/text/TextGetLanguage';
AlchemyAPI.ENDPOINTS['language']['html'] = '/html/HTMLGetLanguage';
AlchemyAPI.ENDPOINTS['text'] = {};
AlchemyAPI.ENDPOINTS['text']['url']  = '/url/URLGetText';
AlchemyAPI.ENDPOINTS['text']['html'] = '/html/HTMLGetText';
AlchemyAPI.ENDPOINTS['text_raw'] = {};
AlchemyAPI.ENDPOINTS['text_raw']['url']  = '/url/URLGetRawText';
AlchemyAPI.ENDPOINTS['text_raw']['html'] = '/html/HTMLGetRawText';
AlchemyAPI.ENDPOINTS['title'] = {};
AlchemyAPI.ENDPOINTS['title']['url']  = '/url/URLGetTitle';
AlchemyAPI.ENDPOINTS['title']['html'] = '/html/HTMLGetTitle';
AlchemyAPI.ENDPOINTS['feeds'] = {};
AlchemyAPI.ENDPOINTS['feeds']['url']  = '/url/URLGetFeedLinks';
AlchemyAPI.ENDPOINTS['feeds']['html'] = '/html/HTMLGetFeedLinks';
AlchemyAPI.ENDPOINTS['microformats'] = {};
AlchemyAPI.ENDPOINTS['microformats']['url']  = '/url/URLGetMicroformatData';
AlchemyAPI.ENDPOINTS['microformats']['html'] = '/html/HTMLGetMicroformatData';
AlchemyAPI.ENDPOINTS['taxonomy'] = {};
AlchemyAPI.ENDPOINTS['taxonomy']['url'] = '/url/URLGetRankedTaxonomy';
AlchemyAPI.ENDPOINTS['taxonomy']['text'] = '/text/TextGetRankedTaxonomy';
AlchemyAPI.ENDPOINTS['taxonomy']['html'] = '/html/HTMLGetRankedTaxonomy';
AlchemyAPI.ENDPOINTS['combined'] = {};
AlchemyAPI.ENDPOINTS['combined']['url'] = '/url/URLGetCombinedData';
AlchemyAPI.ENDPOINTS['image'] = {};
AlchemyAPI.ENDPOINTS['image']['url'] = '/url/URLGetImage';
AlchemyAPI.ENDPOINTS['image_keywords'] = {};
AlchemyAPI.ENDPOINTS['image_keywords']['url'] = '/url/URLGetRankedImageKeywords';
AlchemyAPI.ENDPOINTS['image_keywords']['image'] = '/image/ImageGetRankedImageKeywords';



/**
  * Extracts the entities for text, a URL or HTML.
  * For an overview, please refer to: http://www.alchemyapi.com/products/features/entity-extraction/
  * For the docs, please refer to: http://www.alchemyapi.com/api/entity-extraction/
  *
  * INPUT:
  * flavor -> which version of the call, i.e. text, url or html.
  * data -> the data to analyze, either the text, the url or html code.
  * options -> various parameters that can be used to adjust how the API works, see below for more info on the available options.
  * callback -> the callback function for this async function
  *
  * Available Options:
  * disambiguate -> disambiguate entities (i.e. Apple the company vs. apple the fruit). 0: disabled, 1: enabled (default)
  * linkedData -> include linked data on disambiguated entities. 0: disabled, 1: enabled (default)
  * coreference -> resolve coreferences (i.e. the pronouns that correspond to named entities). 0: disabled, 1: enabled (default)
  * quotations -> extract quotations by entities. 0: disabled (default), 1: enabled.
  * sentiment -> analyze sentiment for each entity. 0: disabled (default), 1: enabled. Requires 1 additional API transction if enabled.
  * showSourceText -> 0: disabled (default), 1: enabled
  * maxRetrieve -> the maximum number of entities to retrieve (default: 50)
  *
  * OUTPUT:
  * The response, already converted from JSON to a Javascript object.
*/
AlchemyAPI.prototype.entities = function(flavor, data, options, callback) {
  options = options || {}

  if (!(flavor in AlchemyAPI.ENDPOINTS['entities'])) {
    callback({ status:'ERROR', statusInfo:'Entity extraction is not available for ' + flavor });
  } else {
    //Add the data to the options and analyze
    options[flavor] = data;
    this.analyze(AlchemyAPI.ENDPOINTS['entities'][flavor], options, callback);
  }
};


/**
  * Extracts the keywords from text, a URL or HTML.
  * For an overview, please refer to: http://www.alchemyapi.com/products/features/keyword-extraction/
  * For the docs, please refer to: http://www.alchemyapi.com/api/keyword-extraction/
  *
  * INPUT:
  * flavor -> which version of the call, i.e. text, url or html.
  * data -> the data to analyze, either the text, the url or html code.
  * options -> various parameters that can be used to adjust how the API works, see below for more info on the available options.
  * callback -> the callback function for this async function
  *
  * Available Options:
  * keywordExtractMode -> normal (default), strict
  * sentiment -> analyze sentiment for each keyword. 0: disabled (default), 1: enabled. Requires 1 additional API transaction if enabled.
  * showSourceText -> 0: disabled (default), 1: enabled.
  * maxRetrieve -> the max number of keywords returned (default: 50)
  *
  * OUTPUT:
  * The response, already converted from JSON to a Javascript object.
*/
AlchemyAPI.prototype.keywords = function(flavor, data, options, callback) {
  options = options || {}

  if (!(flavor in AlchemyAPI.ENDPOINTS['keywords'])) {
    callback({ status:'ERROR', statusInfo:'Keyword extraction is not available for ' + flavor });
  } else {
    //Add the data to the options and analyze
    options[flavor] = data;
    this.analyze(AlchemyAPI.ENDPOINTS['keywords'][flavor], options, callback);
  }
};


/**
  * Tags the concepts for text, a URL or HTML.
  * For an overview, please refer to: http://www.alchemyapi.com/products/features/concept-tagging/
  * For the docs, please refer to: http://www.alchemyapi.com/api/concept-tagging/
  *
  * INPUT:
  * flavor -> which version of the call, i.e. text, url or html.
  * data -> the data to analyze, either the text, the url or html code.
  * options -> various parameters that can be used to adjust how the API works, see below for more info on the available options.
  * callback -> the callback function for this async function
  *
  * Available Options:
  * maxRetrieve -> the maximum number of concepts to retrieve (default: 8)
  * linkedData -> include linked data, 0: disabled, 1: enabled (default)
  * showSourceText -> 0:disabled (default), 1: enabled
  *
  * OUTPUT:
  * The response, already converted from JSON to a Javascript object.
*/
AlchemyAPI.prototype.concepts = function(flavor, data, options, callback) {
  options = options || {}

  if (!(flavor in AlchemyAPI.ENDPOINTS['concepts'])) {
    callback({ status:'ERROR', statusInfo:'Concept tagging is not available for ' + flavor });
  } else {
    //Add the data to the options and analyze
    options[flavor] = data;
    this.analyze(AlchemyAPI.ENDPOINTS['concepts'][flavor], options, callback);
  }
};


/**
  * Calculates the targeted sentiment for text, a URL or HTML.
  * For an overview, please refer to: http://www.alchemyapi.com/products/features/sentiment-analysis/
  * For the docs, please refer to: http://www.alchemyapi.com/api/sentiment-analysis/
  *
  * INPUT:
  * flavor -> which version of the call, i.e. text, url or html.
  * data -> the data to analyze, either the text, the url or html code.
  * target -> the word or phrase to run sentiment analysis on.
  * options -> various parameters that can be used to adjust how the API works, see below for more info on the available options.
  * callback -> the callback function for this async function
  *
  * Available Options:
  * showSourceText  -> 0: disabled, 1: enabled
  *
  * OUTPUT:
  * The response, already converted from JSON to a Javascript object.
*/
AlchemyAPI.prototype.sentiment_targeted = function(flavor, data, target, options, callback) {
  options = options || {}

  if (!(flavor in AlchemyAPI.ENDPOINTS['sentiment_targeted'])) {
    callback({ status:'ERROR', statusInfo:'Sentiment analysis is not available for ' + flavor });
  } else if (!target) {
    callback({ status:'ERROR', statusInfo:'target must not be null' });
  } else {
    //Add the data to the options and analyze
    options[flavor] = data;
    options['target'] = target;
    this.analyze(AlchemyAPI.ENDPOINTS['sentiment_targeted'][flavor], options, callback);
  }
};


/**
  * Extracts the cleaned text (removes ads, navigation, etc.) for a URL or HTML.
  * For an overview, please refer to: http://www.alchemyapi.com/products/features/text-extraction/
  * For the docs, please refer to: http://www.alchemyapi.com/api/text-extraction/
  *
  * INPUT:
  * flavor -> which version of the call, i.e. url or html.
  * data -> the data to analyze, either the url or html code.
  * options -> various parameters that can be used to adjust how the API works, see below for more info on the available options.
  * callback -> the callback function for this async function
  *
  * Available Options:
  * useMetadata -> utilize meta description data, 0: disabled, 1: enabled (default)
  * extractLinks -> include links, 0: disabled (default), 1: enabled.
  *
  * OUTPUT:
  * The response, already converted from JSON to a Javascript object.
*/
AlchemyAPI.prototype.text = function(flavor, data, options, callback) {
  options = options || {}

  if (!(flavor in AlchemyAPI.ENDPOINTS['text'])) {
    callback({ status:'ERROR', statusInfo:'Text extraction is not available for ' + flavor });
  } else {
    //Add the data to the options and analyze
    options[flavor] = data;
    this.analyze(AlchemyAPI.ENDPOINTS['text'][flavor], options, callback);
  }
};


/**
  * Extracts the raw text (includes ads, navigation, etc.) for a URL or HTML.
  * For an overview, please refer to: http://www.alchemyapi.com/products/features/text-extraction/
  * For the docs, please refer to: http://www.alchemyapi.com/api/text-extraction/
  *
  * INPUT:
  * flavor -> which version of the call, i.e. url or html.
  * data -> the data to analyze, either the url or html code.
  * options -> various parameters that can be used to adjust how the API works, see below for more info on the available options.
  * callback -> the callback function for this async function
  *
  * Available Options:
  * none
  *
  * OUTPUT:
  * The response, already converted from JSON to a Javascript object.
*/
AlchemyAPI.prototype.text_raw = function(flavor, data, options, callback) {
  options = options || {}

  if (!(flavor in AlchemyAPI.ENDPOINTS['text_raw'])) {
    callback({ status:'ERROR', statusInfo:'Text extraction is not available for ' + flavor });
  } else {
    //Add the data to the options and analyze
    options[flavor] = data;
    this.analyze(AlchemyAPI.ENDPOINTS['text_raw'][flavor], options, callback);
  }
};


/**
  * Extracts the author from a URL or HTML.
  * For an overview, please refer to: http://www.alchemyapi.com/products/features/author-extraction/
  * For the docs, please refer to: http://www.alchemyapi.com/api/author-extraction/
  *
  * INPUT:
  * flavor -> which version of the call, i.e. url or html.
  * data -> the data to analyze, either the the url or html code.
  * options -> various parameters that can be used to adjust how the API works, see below for more info on the available options.
  * callback -> the callback function for this async function
  *
  * Availble Options:
  * none
  *
  * OUTPUT:
  * The response, already converted from JSON to a Javascript object.
*/
AlchemyAPI.prototype.author = function(flavor, data, options, callback) {
  options = options || {}

  if (!(flavor in AlchemyAPI.ENDPOINTS['author'])) {
    callback({ status:'ERROR', statusInfo:'Author extraction is not available for ' + flavor });
  } else {
    //Add the data to the options and analyze
    options[flavor] = data;
    this.analyze(AlchemyAPI.ENDPOINTS['author'][flavor], options, callback);
  }
};


/**
  * Detects the language for text, a URL or HTML.
  * For an overview, please refer to: http://www.alchemyapi.com/api/language-detection/
  * For the docs, please refer to: http://www.alchemyapi.com/products/features/language-detection/
  *
  * INPUT:
  * flavor -> which version of the call, i.e. text, url or html.
  * data -> the data to analyze, either the text, the url or html code.
  * options -> various parameters that can be used to adjust how the API works, see below for more info on the available options.
  * callback -> the callback function for this async function
  *
  * Available Options:
  * none
  *
  * OUTPUT:
  * The response, already converted from JSON to a Javascript object.
*/
AlchemyAPI.prototype.language = function(flavor, data, options, callback) {
  options = options || {}

  if (!(flavor in AlchemyAPI.ENDPOINTS['language'])) {
    callback({ status:'ERROR', statusInfo:'Language detection is not available for ' + flavor });
  } else {
    //Add the data to the options and analyze
    options[flavor] = data;
    this.analyze(AlchemyAPI.ENDPOINTS['language'][flavor], options, callback);
  }
};


/**
  * Extracts the title for a URL or HTML.
  * For an overview, please refer to: http://www.alchemyapi.com/products/features/text-extraction/
  * For the docs, please refer to: http://www.alchemyapi.com/api/text-extraction/
  *
  * INPUT:
  * flavor -> which version of the call, i.e. url or html.
  * data -> the data to analyze, either the url or html code.
  * options -> various parameters that can be used to adjust how the API works, see below for more info on the available options.
  * callback -> the callback function for this async function
  *
  * Available Options:
  * useMetadata -> utilize title info embedded in meta data, 0: disabled, 1: enabled (default)
  *
  * OUTPUT:
  * The response, already converted from JSON to a Javascript object.
*/
AlchemyAPI.prototype.title = function(flavor, data, options, callback) {
  options = options || {}

  if (!(flavor in AlchemyAPI.ENDPOINTS['title'])) {
    callback({ status:'ERROR', statusInfo:'Title extraction is not available for ' + flavor });
  } else {
    //Add the data to the options and analyze
    options[flavor] = data;
    this.analyze(AlchemyAPI.ENDPOINTS['title'][flavor], options, callback);
  }
};


/**
  * Extracts the relations for text, a URL or HTML.
  * For an overview, please refer to: http://www.alchemyapi.com/products/features/relation-extraction/
  * For the docs, please refer to: http://www.alchemyapi.com/api/relation-extraction/
  *
  * INPUT:
  * flavor -> which version of the call, i.e. text, url or html.
  * data -> the data to analyze, either the text, the url or html code.
  * options -> various parameters that can be used to adjust how the API works, see below for more info on the available options.
  * callback -> the callback function for this async function
  *
  * Available Options:
  * sentiment -> 0: disabled (default), 1: enabled. Requires one additional API transaction if enabled.
  * keywords -> extract keywords from the subject and object. 0: disabled (default), 1: enabled. Requires one additional API transaction if enabled.
  * entities -> extract entities from the subject and object. 0: disabled (default), 1: enabled. Requires one additional API transaction if enabled.
  * requireEntities -> only extract relations that have entities. 0: disabled (default), 1: enabled.
  * sentimentExcludeEntities -> exclude full entity name in sentiment analysis. 0: disabled, 1: enabled (default)
  * disambiguate -> disambiguate entities (i.e. Apple the company vs. apple the fruit). 0: disabled, 1: enabled (default)
  * linkedData -> include linked data with disambiguated entities. 0: disabled, 1: enabled (default).
  * coreference -> resolve entity coreferences. 0: disabled, 1: enabled (default)
  * showSourceText -> 0: disabled (default), 1: enabled.
  * maxRetrieve -> the maximum number of relations to extract (default: 50, max: 100)
  *
  * OUTPUT:
  * The response, already converted from JSON to a Javascript object.
*/
AlchemyAPI.prototype.relations = function(flavor, data, options, callback) {
  options = options || {}

  if (!(flavor in AlchemyAPI.ENDPOINTS['relations'])) {
    callback({ status:'ERROR', statusInfo:'Relation extraction is not available for ' + flavor });
  } else {
    //Add the data to the options and analyze
    options[flavor] = data;
    this.analyze(AlchemyAPI.ENDPOINTS['relations'][flavor], options, callback);
  }
};


/**
  * Categorizes the text for text, a URL or HTML.
  * For an overview, please refer to: http://www.alchemyapi.com/products/features/text-categorization/
  * For the docs, please refer to: http://www.alchemyapi.com/api/text-categorization/
  *
  * INPUT:
  * flavor -> which version of the call, i.e. text, url or html.
  * data -> the data to analyze,

...





*/






// Get list of articles
exports.index = function(req, res) {
  Article.find(function (err, articles) {
    if(err) { return handleError(res, err); }
    return res.json(200, articles);
  });
};

// Get a single article
exports.show = function(req, res) {
  Article.findById(req.params.id, function (err, article) {
    if(err) { return handleError(res, err); }
    if(!article) { return res.send(404); }
    return res.json(article);
  });
};

// Creates a new article in the DB.
exports.create = function(req, res) {
  Article.create(req.body, function(err, article) {
    if(err) { return handleError(res, err); }
    return res.json(201, article);
  });
};

// Updates an existing article in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Article.findById(req.params.id, function (err, article) {
    if (err) { return handleError(res, err); }
    if(!article) { return res.send(404); }
    var updated = _.merge(article, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, article);
    });
  });
};

// Deletes a article from the DB.
exports.destroy = function(req, res) {
  Article.findById(req.params.id, function (err, article) {
    if(err) { return handleError(res, err); }
    if(!article) { return res.send(404); }
    article.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};



function handleError(res, err) {
  return res.send(500, err);
}
