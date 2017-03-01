/**
 * Created by alexey_baranov on 14.01.2017.
 */
/*
 * https://github.com/vitaly-t/pg-promise/wiki/Learn-by-Example#simple-insert
 */
let express = require('express')
require('shelljs/global')
let pgp = require('pg-promise')()
let fs = require("fs")
  // ,  exec = require('child_process').execFile

const
  port = 3000
const commandLineToolPath = __dirname + "/arcus2"

let NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : "development"
let config = require("./cfg/main")[NODE_ENV]
// console.log("NODE_ENV", NODE_ENV, "config", config)

let app = express(),
  db = pgp(config.database),
  /**
   * это глобольная ссылна на Express-овский req
   * он заполняется ошибкой внутри process.on("unhandledRejection",,,) и app.use(syncErrorHandler)
   */
  response

/**
 * "onrequest"
 * логаю все входящие
 * устанавливаю крос-оригин потому что иначе с страница с 210-го отказывается стучаться на localhost
 */
app.use((req, res, next) => {
  response = res
  res.setHeader("Access-Control-Allow-Origin", "*")
  console.log(`${req.protocol}://${req.hostname}:${port}${req.originalUrl}`)
  next()
})

/**
 * проверка состояния
 */
app.get('/ping', function (req, res) {
  res.status(200).json("I'm alive!!!")
})

/**
 * операции
 */
app.get('/', function (req, res) {
  // let code = exec('sbcall 4000 200 1 1', {cwd: commandLineToolPath, encoding: "win1251"}).code
  // throw new Error("Я синхронная ошибка")
/*  new Promise(function(){
    throw new Error("rejection")
  })*/
  // if (code) {
  //   throw new Error(code)
  // }

  let query = req.query

  if (query.operation == 1 || query.operation == 3) {
    if (!query.sum) {
      throw new Error('Не указана сумма')
    }
    if (isNaN(+query.sum)) {
      throw new Error('Сумма не является числом')
    }
  }
  let params = ''
  switch (+query.operation) {
    //Оплата
    case 1:
      params = '/o1,/a' + query.sum * 100 + ',/c643'
      break
    //Отмена последней
    case 2:
      params = '/o2'
      break
    //Возврат
    case 3:
      params = '/o3,/a' + query.sum * 100 + ',/c643'
      break
    //Полный журнал
    case 7:
      params = '/o7'
      break
    //Краткий журнал
    case 8:
      params = '/o8'
      break
    //Сверка итогов
    case 10:
      params = '/o10'
      break
    default:
      throw new Error('Неверный тип операции: ' + query.operation)
  }

  let cmd= __dirname + '/arcus2/commandlinetool/bin/commandlinetool.exe '+params
  let result = exec(cmd, {
    /*cwd: commandLineToolPath,*/
    encoding: "win1251"
  })

  if (result.code) {
    throw new Error(`"Терминал закрылся с ошибкой ${cmd}. Код: ${result.code}, stdout: ${result.stdout}`)
  }
  // exec(__dirname + '/arcus2/commandlinetool/bin/commandlinetool.exe', [params], function () {
  console.log('Чтение файла ответа...')
  let cheq = fs.readFileSync(__dirname + "/arcus2/cheq.out")
  // cheq = iconv.decode(new Buffer(cheq), 'win1251')
  console.log('Ответ:', cheq)
  response.send({status: "success", cheq})
  // })

  db.none("insert into payment(sum) values($[sum])", {sum: req.query.sum})
    .then(() => {
      // throw new Error("Я асинхронная ошибка")
      console.log("статусю 200 и выхожу с успехом")
      res.status(200).json({status: "success"})
    })
})


/**
 * Вспомогательная функция которая отправляет клиенту ошибку в json - формате
 * @param err
 */
function sendError(err) {
  response.status(500).json({
    status: "failed",
    error: {
      code: err.code,
      message: err.message,
      stack: err.stack
    }
  })
}

/**
 * перехватчик всех синхронных ошибок
 */
app.use((err, req, res, next) => {
  console.error(err.stack)
  sendError(err)
})

/**
 * перехватчик всех асинхронных ошибок
 */
process.on('unhandledRejection', (err, p) => {
  console.error(err.stack)
  sendError(err)
})

app.listen(3000, function () {
  console.log(`pin-pad-node listening on port ${port}!`)
})
