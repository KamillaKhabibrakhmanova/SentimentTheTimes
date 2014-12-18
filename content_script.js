
//Adding jQuery script
var script = document.createElement('script');
script.src = 'http://code.jquery.com/jquery-1.11.0.min.js';
script.type = 'text/javascript';

//fake test article info
var articles = [
{
	"title": "Russia invades New York City",
	"author": "Kamilla Khabibrakhmanova",
	"snippet": "On the eve of December 13",
	"url": "http://www.grumpycats.com",
	"positivity": 0.5
},
{
	"title": "Christmas is cancelled nationwide",
	"author": "Kamilla Khabibrakhmanova",
	"snippet": "This will be the last Christmas celebrated in USA",
	"url": "http://www.grumpycats.com",
	"positivity": 0.9
},
{
	"title": "Wall Street burned to the ground",
	"author": "Kamilla Khabibrakhmanova",
	"snippet": "Goodbye Bankers",
	"url": "http://www.grumpycats.com",
	"positivity": 0.7
},
{
	"title": "Grumpy Cat elected president of the United States",
	"author": "Kamilla Khabibrakhmanova",
	"snippet": "Wins by unprecedented 86% margine",
	"url": "http://www.grumpycats.com",
	"positivity": 0.6
},
{
	"title": "Unicorns are real",
	"author": "Kamilla Khabibrakhmanova",
	"snippet": "Discovered in the depths of the Amazin rainforest",
	"url": "http://www.grumpycats.com",
	"positivity": 0.2
},
{
	"title": "Russia invades New York City",
	"author": "Kamilla Khabibrakhmanova",
	"snippet": "On the eve of December 13",
	"url": "http://www.grumpycats.com",
	"positivity": 0.5
},
{
	"title": "Christmas is cancelled nationwide",
	"author": "Kamilla Khabibrakhmanova",
	"snippet": "This will be the last Christmas celebrated in USA",
	"url": "http://www.grumpycats.com",
	"positivity": 0.9
},
{
	"title": "Wall Street burned to the ground",
	"author": "Kamilla Khabibrakhmanova",
	"snippet": "Goodbye Bankers",
	"url": "http://www.grumpycats.com",
	"positivity": 0.7
},
{
	"title": "Grumpy Cat elected president of the United States",
	"author": "Kamilla Khabibrakhmanova",
	"snippet": "Wins by unprecedented 86% margine",
	"url": "http://www.grumpycats.com",
	"positivity": 0.6
},
{
	"title": "Unicorns are real",
	"author": "Kamilla Khabibrakhmanova",
	"snippet": "Discovered in the depths of the Amazin rainforest",
	"url": "http://www.grumpycats.com",
	"positivity": 0.2
}
];

articles.forEach(function(article){
	article.author = article.author.toUpperCase();
})

$.get( "http://localhost:3001/articles", function( data ) {
  console.log(data);
});


$(document).ready(function() {

	//adding pos/neg class depending on value
	//NEED TO HOOK UP TO DATA - then uncomment and change "database variables"
	// $('.collection').each(function() {

	// 	var title = $(this).find('.story-heading a').text();
	// 	var link = $(this).find('.story-heading a').attr('href');
	// 	if ((title == database_title) || link == database_link)) {
	// 		if (database_title.positive > 0 ) {
	// 			$(this).addClass('positive');
	// 		}
	// 		else if (database_title.positive < 0) {
	// 			$(this.addClass('negative'));
	// 		}
	// 	}
	// });
	//finding article elements and editing texts
	$('.collection').each(function( index ) {
		$(this).find('.byline').text("By " + articles[index]['author']);
		$(this).find('.story-heading').html("<a href =\'" + articles[index]['url'] + "\'>" + articles[index]["title"]+"</a>");
		$(this).find('.summary').text(articles[index]["snippet"]);
	})
	

});
