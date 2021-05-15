let timer = require('node-schedule')
let mysql = require('./link.js')
let moment = require('moment')
let template = require('art-template')
const { spawn, execFile, exec } = require("child_process")
//const {bat} = spawn('cmd.exe', ['/c','test1.bat'])
let connection = null
var p = {}
let datarr = []
let tomail = []
const nodemailer = require('nodemailer');
const { callbackPromise } = require('nodemailer/lib/shared')
// 创建可重用邮件传输器
const transporter = nodemailer.createTransport({
    host: "154.85.52.96", // 邮件地址
    port: 25, // 端口
    secureConnection: false, // use SSL
    auth: {
        "user": 'compaltpr@compal.top', // 邮箱账号
        "pass": 'XUDELIN8800275' // 邮箱的授权码
    }
});
const send = (mailOptions, callback) => {
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        }
        return callback('ms')
    });
}

// let code = Math.floor(Math.random() * 999999).toString()

// let emailCode = code //验证码为6位随机数
let email = {
    title: '仪器校验提醒',
    htmlBody: '<test>'
}
let mailOptions = {
    from: 'compal-SOD@compal.top', // 发件人地址
    to: ['Iori_Liu@compal.com', 'RuiY_Yang@compal.com', 'Bruce_Xu@compal.com'], // 收件人地址，多个收件人可以使用逗号分隔
    subject: email.title, // 邮件标题
    html: email.htmlBody // 邮件内容
};

function objtimer() {
    p = timer.scheduleJob({ second: 30 }, function () {
        connection = mysql.createConnection()
        connection.connect()
        let sql = "select id,yiqimingcheng as epname,xinghao as model,changpai as brand,plant,deptname,jiaoyanriqi as cdate,jiaoyanxingzhi as checktype,jiaoyanbianhao as ckcode, baoguanren as custodian,yiqifuzeren as incharge,step1_master_name as director1,bgr_mail,fzr_mail,dt1_mail from compal_sod_instrument_list "
        let isql = ""
        connection.query(sql, function (error, results) {
            if (error) {
                console.log(error)
                throw error
            }
            else {
                //console.log('success')
                results.forEach((item, i) => {
                    // moment(date,'format') 这个format 令牌，不传这个format参数的话，会报警告，date不是符合格式的日期字符串！！！ 
                    if (item.cdate !== '' && item.cdate !== null) {
                        item.cdate = moment(item.cdate, ['YYYY-MM-DD HH:mm:ss', 'YYYY/MM/DD', 'YYYY/M/D']).format('YYYY-MM-DD')
                        let now = moment().format('YYYY-MM-DD')
                        if (moment(item.cdate).format('x') > moment(now).format('x')) { //得到unix时间戳
                            if ((moment(moment(item.cdate, 'YYYY-MM-DD')).diff(moment(now, 'YYYY-MM-DD'), 'days')) === 8) { //如果当天离校验日期天数为8的话
                                item.status = 0
                                item.itime = moment().format('YYYY-MM-DD HH::mm:ss')
                                item.step1 = 0
                                item.step2 = 0
                                datarr.push(Object.values(item))

                            }
                        }
                    }
                })
                //console.log(datarr)
                if (datarr.length >= 1) {

                    isql = "insert into pend_equipitem(`id`,`name`,`model`,`brand`,`plant`,`dept`,`checkdata`,`checktype`,`ckcode`,`custodian`,`incharge`,`director1`,`bgr_mail`,`fzr_mail`,`dt1_mail`,`status`,`itime`,`step1`,`step2`) VALUES ?  "
                    connection.query(isql, [datarr], function (err, res) {
                        if (err) {
                            console.log('sql语句执行错误，错误如下：', err.message)
                            return
                        } else {
                            //console.log(res)
                            if (res.affectedRows >= 1) {
                                //console.log('insert success')
                                p.cancel()
                                //console.log('定时器取消')

                                let html = ``
                                for (let i = 0; i < datarr.length; i++) {
                                    html +=
                                        '<tr>'
                                        + '<td style="border:1px solod black;text-align:center;">' + datarr[i][1] + '</td>'
                                        + '<td style="border:1px solod black;text-align:center;">' + datarr[i][2] + '</td>'
                                        + '<td style="border:1px solod black;text-align:center;">' + datarr[i][3] + '</td>'
                                        + '<td style="border:1px solod black;text-align:center;">' + datarr[i][4] + '</td>'
                                        + '<td style="border:1px solod black;text-align:center;">' + datarr[i][5] + '</td>'
                                        + '<td style="border:1px solod black;text-align:center;">' + datarr[i][6] + '</td>'
                                        + '<td style="border:1px solod black;text-align:center;">' + datarr[i][7] + '</td>'
                                        + '<td style="border:1px solod black;text-align:center;">' + datarr[i][8] + '</td>'
                                        + '<td style="border:1px solod black;text-align:center;">' + datarr[i][9] + '</td>'
                                        + '<td style="border:1px solod black;text-align:center;">' + datarr[i][10] + '</td>'
                                        + '<td style="border:1px solod black;text-align:center;">' + datarr[i][11] + '</td>'
                                        + '</tr>'

                                    let t = [datarr[i][12], datarr[i][13], datarr[i][14]];
                                    tomail.push(...t)

                                }
                                let chtml = `
                                    <table border="1" cellspacing="0" cellpadding="0" style="border-spacing:0;bloder-collapse:collapse;margin:10px 0">
                                    <caption style="font-size: 18px;font-weight: bold;margin: 1em 0;">以下表格中的数据为近期需要校验的仪器信息，请留意！！！</caption>
                                    <tbody>
                                        <tr style="border:1px solod black;text-align:center;color:white;">
                                        <th style="background-color:#87ceeb;font-weight:bold;">仪器名称</th>
                                        <th style="background-color:#87ceeb;font-weight:bold;">型号</th>
                                        <th style="background-color:#87ceeb;font-weight:bold;">厂牌</th>
                                        <th style="background-color:#87ceeb;font-weight:bold;">厂区</th>
                                        <th style="background-color:#87ceeb;font-weight:bold;">部门</th>
                                        <th style="background-color:#87ceeb;font-weight:bold;">校验日期</th>
                                        <th style="background-color:#87ceeb;font-weight:bold;">校验性质</th>
                                        <th style="background-color:#87ceeb;font-weight:bold;">校验编号</th>
                                        <th style="background-color:#87ceeb;font-weight:bold;">保管人</th>
                                        <th style="background-color:#87ceeb;font-weight:bold;">负责人</th>
                                        <th style="background-color:#87ceeb;font-weight:bold;">保管人主管</th>
                                        </tr>
                                        ${html}
                                    </tbody>
                                    </table>`
                                mailOptions.html = chtml
                                //console.log(tomail);
                                for (let q = 0; q < tomail.length; q++) {
                                    if (!mailOptions.to.includes(tomail[q])) {
                                        mailOptions.to.push(tomail[q])
                                    }
                                }

                                console.log(mailOptions)
                                send(mailOptions, function (data) {
                                    if (data == 'ms') {
                                        console.log(data)
                                        execFile('test1.bat', { encoding: 'buffer' }, (error, stdout, stderr) => {
                                            if (error) throw error;
                                            console.log(exit)
                                        });
                                        //const bat =    spawn('cmd.exe',['/c', 'test1.bat'])
                                        // execFile('test1.bat', { encoding: 'buffer' }, (error, stdout, stderr) => {
                                        //     if (error) throw error;

                                        // });
                                        // bat.stdout.on('data', (data) => {
                                        //     console.log(data.toString());
                                        // });

                                        // bat.stderr.on('data', (data) => {
                                        //     console.error(data.toString());
                                        // });

                                        // bat.on('exit', (code) => {
                                        //     console.log(`子进程退出，退出码 ${code}`);
                                        // });
                                    }
                                })




                            }



                        }
                    })
                } else {
                    console.log('exit with no data')
                    // exec("taskkill /f /fi 'WINDOWTITLE eq test.cmd' ", (error,stdout,stderr=>{
                    //     if (error){
                    //         console.log('run error')
                    //     }else{
                    //         console.log('ok')
                    //     }
                    // }

                    execFile('test1.bat', { encoding: 'buffer' }, (error, stdout, stderr) => {
                        if (error) throw error;
                        console.log(exit)
                    });
                }
            }

        });



        // 关闭连接  循环往数据库插数据时，尽量别关闭，因为插入一次就关闭连接，第二次往后没有重新开启连接数据就无法插进去，从而报错！！！


    })
}
objtimer()
