/**
 * Created by alexey_baranov on 12.01.2017.
 */
require('shelljs/global');


// Run external tool synchronously
// if (exec('git commit -am "Auto-commit"').code !== 0) {
if (exec('sbcall 4000 200 1 1').code !== 0) {
    echo('Error: Git commit failed');
    exit(1);
}
console.log( "!!!")