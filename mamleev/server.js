var exec 		= require('child_process').execFile,
    fs 			= require('fs'),
    iconv 		= require('iconv-lite'),
    express 	= require("express"),
    bodyParser  = require("body-parser");
 
var app = express();
 
// создаем парсер для данных application/x-www-form-urlencoded
var urlencodedParser = bodyParser.urlencoded({extended: false});
 
 
app.post("/", urlencodedParser, function (request, response) {
	console.log(request.body.operation);
	response.header("Access-Control-Allow-Origin", "*");
	if (request.body.operation == 1 || request.body.operation == 3) {
	    if(!request.body.amount) return response.send('Неверная сумма');
	    if (isNaN(request.body.amount)) return response.send('Не число');
	    var summ = request.body.amount * 100;
		console.log('Сумма:  '+summ);
	}
	console.log('Операция на пинпаде...');
	var params = '';
	if (request.body.operation == 1) {params = '/o1,/a'+ summ +',/c643'
	}else if (request.body.operation == 2) {params = '/o2'
	}else if (request.body.operation == 3) {params = '/o3,/a'+ summ +',/c643';
	}else if (request.body.operation == 7) {params = '/o7'
	}else if (request.body.operation == 8) {params = '/o8'
	}else if (request.body.operation == 10) {params = '/o10'
	}else 	return response.send('Неверный тип операции!');
   	exec('../commandlinetool/bin/commandlinetool.exe',[params], function(){
		console.log('Чтение файла ответа');
		fs.readFile("../cheq.out", function(err, content){
				if (err) return response.send('Не найден файл');
				var cheqtxt = iconv.decode(new Buffer(content), 'win1251');
				console.log('Ответ:');
				console.log(cheq);
				cheq = cheq.replace(/\r\n/g,'<br>');
			    response.send('<p>' + cheq + '<p>');
		});   
	});
});
 
app.listen(8080);
console.log('Сервер запущен');