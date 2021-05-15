let timer = require('node-schedule')
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Hijack',
    database: 'demo' // 对不起，我一不小心把数据库名字和表名起成一样的，你知道就行
});
// let interval = ()=>{
//     timer.scheduleJob('30 * * * * *',()=>{
//         console.log('scheduleCronstyle:' + new Date());
//     });
// }
function objtimer() {
    timer.scheduleJob({ second: 10, minute: 19, hour: 17 }, function () {
        connection.connect();

        // 3. 执行数据操作 把大象放到冰箱
        connection.query('insert into equipment_mail values(2,"test","test@123.com") ', function (error, results, fields) {
            if (error) throw error;
            console.log('The solution is: ', results);
        });

        // connection.query('INSERT INTO users VALUES(NULL, "admin", "123456")', function (error, results, fields) {
        //   if (error) throw error;
        //   console.log('The solution is: ', results);
        // });

        // 4. 关闭连接 关闭冰箱门
        connection.end();

    })
}
objtimer()