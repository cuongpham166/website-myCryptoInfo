var express = require ("express");
var app = express();
var bodyParser = require("body-parser");
var dotenv = require('dotenv').config();
var axios = require ("axios");
var numeral = require ('numeral');
var cookieParser = require('cookie-parser');
var i18n = require("i18n");
var moment = require('moment');

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.set('views',__dirname + '/views');
app.use(cookieParser());
app.use(i18n.init);
i18n.configure({
	locales:['en', 'vi'],
	directory: __dirname + '/locales',
	cookie: 'lang',
	defaultLocale: 'en'
});

app.use(express.static(__dirname + "/public"));

app.get('/homepage', function(req,res){
	res.render("landing.ejs");
});

app.get('/', function(req, res){
	res.render("homepage")
});


function getMarketCapHistory(){
	var today = new Date();
	var finalDate = new Date(today);
	finalDate.setDate(today.getDate()-1);
	var beginDay = finalDate.toISOString();
	return axios.get("https://api.nomics.com/v1/market-cap/history?key="+process.env.NOMICS+"&start="+beginDay);
}

function getAllCurrencyTicker(interval){
	return axios.get("https://api.nomics.com/v1/currencies/ticker?key="+process.env.NOMICS+"&interval="+interval);
}

app.get('/crypto', function(req,res){
	var query_req = req.query.interval;
	var query;
	if (query_req == undefined){
		query = '1d';
	}
	else{
		query_req = query_req.split(" ").join("");
		query = query_req;
	}
	axios.all([getMarketCapHistory(),getAllCurrencyTicker(query)])
		.then(axios.spread(function(marketCapHistory, allCurrencyTicker){
			var marketCapHistoryData = marketCapHistory.data;
			var allCurrencyTickerData = allCurrencyTicker.data;
			var allCurrencyTickerNewData = [];


			for (var i=0; i<200; i++){
				allCurrencyTickerNewData.push(allCurrencyTickerData[i]);
			}

			var timeArray = [];
			var timeArrayNew =[];
			var marketcapArray = [];
			var marketcapArrayNew =[];

			for (var i=0; i<marketCapHistoryData.length;i++){

				timeArray.push(moment(marketCapHistoryData[i]["timestamp"]).format('LT'));
			}

			for (var i=0; i<marketCapHistoryData.length;i++){
				marketcapArray.push(parseFloat(marketCapHistoryData[i]["market_cap"]))
			}

			for (var i=0; i<marketCapHistoryData.length;i++){
				marketcapArrayNew.push(numeral(parseFloat(marketCapHistoryData[i]["market_cap"])).format('$0,0.00'));
			}

			for (var i=0; i<marketCapHistoryData.length;i++){
				timeArrayNew.push(marketCapHistoryData[i]["timestamp"]);
			}
			
			var lastestMarketCapData = marketcapArray[marketCapHistoryData.length-1];

			var lastestUpdateDate = timeArrayNew[marketCapHistoryData.length-1]; 


			console.log(timeArrayNew);
			

			res.render("info.ejs",{
				data:allCurrencyTickerNewData,
				numeral:numeral,
				range:query,
				labels:timeArray,
				data2:marketcapArray,
				lastestMarketCapData:lastestMarketCapData,
				marketcapArrayNew:marketcapArrayNew,
				moment:moment,
				lastestUpdateDate:lastestUpdateDate,
				
			});
		}))
		.catch(function(error){
			console.log(error);
		});
});

function getCurrencyTicker(currency){
	return axios.get("https://api.nomics.com/v1/currencies/ticker?key="+process.env.NOMICS+"&ids="+currency);
}

function getCurrencyMetaData(currency){
	return axios.get("https://api.nomics.com/v1/currencies?key="+process.env.NOMICS+"&ids="+currency);
}

function getSparkLineData(){
	var today = new Date();
	var finalDate = new Date(today);
	finalDate.setDate(today.getDate()-1);
	var beginDay = finalDate.toISOString();
	return axios.get("https://api.nomics.com/v1/currencies/sparkline?key="+process.env.NOMICS+"&start="+beginDay);
}


app.get('/crypto/info/:crypto',function(req,res){
	var currency = req.params.crypto;
	axios.all([getCurrencyTicker(currency), getCurrencyMetaData(currency), getSparkLineData()])
		.then(axios.spread(function(currencyTicker, metaData, sparklineData) {

			var currencyTickerData = currencyTicker.data;
			var currencyMetaData = metaData.data;
			var sparkLineData = sparklineData.data;
			var timestampArray = [];
			var priceArray = [];

			for (var i=0; i < sparkLineData.length; i++){
				if(sparkLineData[i]["currency"]===currency){
					for(var j=0; j<sparkLineData[i]["timestamps"].length;j++){
						timestampArray.push(moment(sparkLineData[i]["timestamps"][j]).format('LT'));
					}
				}
			}

			for (var i=0; i < sparkLineData.length; i++){
				if(sparkLineData[i]["currency"]===currency){
					for(var j=0; j<sparkLineData[i]["prices"].length;j++){
						priceArray.push(parseFloat(sparkLineData[i]["prices"][j]));
					}
				}
			}
			//console.log(timestampArray);

			res.render("detail.ejs", {
				data:currencyMetaData,
				data2:currencyTickerData,
				numeral:numeral,
				moment:moment,
				timestampArray:timestampArray,
				priceArray:priceArray,
			});
		}))
		.catch(function(error){
			console.log(error);
		});
});


app.use ('/change-lang/:lang', function(req,res){
	res.cookie('lang', req.params.lang, { maxAge: 900000});
	res.redirect('back');
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server has started");
});