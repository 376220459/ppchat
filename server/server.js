const express = require('express')
const mysql = require('mysql')
const bodyParser = require('body-parser')

const app = express()

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '376220459',
    database: 'chat'
})

/* 跨域 */
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Origin", "http://localhost:8080");
    if (req.method == 'OPTIONS') {
        /*让options请求快速返回*/
        res.send(200);
    }
    else {
        next();
    }
});

app.use(bodyParser.json());

app
.post('/api/login',(req,res)=>{
    let nickname = req.body.nickname;
    let password = req.body.password;
    const sqlStr = 'select password from user where nickname = ?';
    conn.query(sqlStr,nickname,(err,results)=>{
        if(err){
            res.json({
                status: 0,
                message: '查询失败'
            })
        }else{
            if(!results.length){
                res.json({
                    status: 1,
                    message: '查无此人'
                })
            }else{
                if(results[0].password === password){
                    res.json({
                        status: 1,
                        message: '密码正确'
                    })
                }else{
                    res.json({
                        status: 1,
                        message: '密码错误'
                    })
                }
            }
        }
    })
})
.post('/api/register',(req,res)=>{
    let user = req.body;
    let nickname = req.body.nickname;
    const sqlStr1 = 'select * from user where nickname = ?';
    const sqlStr2 = 'insert into user set ?';
    conn.query(sqlStr1,nickname,(err,results)=>{
        if(err){
            res.json({
                status: 0,
                message: '查询失败'
            })
        }else{
            if(results.length){
                res.json({
                    status: 1,
                    message: '已注册'
                })
            }else{
                user.uid = Date.now();
                conn.query(sqlStr2,user,(err,results)=>{
                    if(err){
                        res.json({
                            status: 0,
                            message: '添加失败'
                        })
                    }else{
                        if(!results.affectedRows){
                            res.json({
                                status: 0,
                                message: '添加失败'
                            })
                        }else{
                            res.json({
                                status: 1,
                                message: '注册成功'
                            })
                        }
                    }
                })
            }
        }
    })
})
.listen(3000)