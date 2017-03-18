/**
 * Created by alexey_baranov on 01.03.2017.
 */

let fs = require("fs"),
  iconv = require('iconv-lite')

let cheq = fs.readFileSync(__dirname + "/arcus2/cheq.out")

console.log(iconv.decode(cheq, 'win1251'))
