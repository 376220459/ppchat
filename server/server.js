const express = require('express')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const ws = require('nodejs-websocket')
const moment = require('moment')

const app = express()

const sql = mysql.createConnection({
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
    const sqlStr = 'select * from user where nickname = ?';
    sql.query(sqlStr,nickname,(err,results)=>{
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
                        message: '密码正确',
                        uid: results[0].uid
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
    sql.query(sqlStr1,nickname,(err,results)=>{
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
                sql.query(sqlStr2,user,(err,results)=>{
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




/* type类型 */

/*
    1：初次登录
    3：建立一对一通讯桥梁
    4：一对一发送消息
*/


console.log('正在建立连接...')

function broadcast(obj){
    if(obj.type === 1){
        server.connections.forEach(conn=>{
            if(conn.path.slice(6) === obj.data.uid + ''){
                conn.sendText(JSON.stringify(obj));
            }
        });
        return;
        // user.conn.sendText(JSON.stringify(obj));
        // obj.conn.sendText(JSON.stringify(obj));
    }else if(obj.type === 3){
        server.connections.forEach(conn=>{
            if(obj.bridge[0] === conn.path.slice(6)){
                conn.sendText(JSON.stringify(obj));
            }
        });
        // user.conn.sendText(JSON.stringify(obj));
        if(msgs[obj.bridge[1] + '-' + obj.bridge[0]]){
            msgs[obj.bridge[1] + '-' + obj.bridge[0]].forEach(e=>{
                server.connections.forEach(conn=>{
                    if(obj.bridge[0] === conn.path.slice(6)){
                        conn.sendText(JSON.stringify(e));
                    }
                });
                // user.conn.sendText(JSON.stringify(e));
            })
            msgs[obj.bridge[1] + '-' + obj.bridge[0]] = undefined;
        }
        return;
    }else if(obj.type === 4){
        // server.connections.forEach(conn=>{
        //     conn.sendText(JSON.stringify(obj));
        // })
        // obj.bridge.forEach(e=>{
        //     if(bridge[obj.bridge[0] + '-' + obj.bridge[1]][e]){
        //         console.log(e)
        //         bridge[obj.bridge[0] + '-' + obj.bridge[1]][e].sendText(JSON.stringify(obj))
        //     }
        //     if(bridge[obj.bridge[1] + '-' + obj.bridge[0]][e]){
        //         console.log(e)
        //         bridge[obj.bridge[1] + '-' + obj.bridge[0]][e].sendText(JSON.stringify(obj))
        //     }
        // });
        bridge[obj.bridge[0] + '-' + obj.bridge[1]][obj.bridge[0]].sendText(JSON.stringify(obj))
        if(!bridge[obj.bridge[1] + '-' + obj.bridge[0]]){
            if(!msgs[obj.bridge[0] + '-' + obj.bridge[1]]){
                msgs[obj.bridge[0] + '-' + obj.bridge[1]] = []
            }
            msgs[obj.bridge[0] + '-' + obj.bridge[1]].push(obj);
        }else{
            bridge[obj.bridge[1] + '-' + obj.bridge[0]][obj.bridge[1]].sendText(JSON.stringify(obj))
        }
        return;
        // server.connections.forEach(conn=>{
        //     // console.log(conn.path.slice(6))
        //     if(obj.bridge.indexOf(conn.path.slice(6)) !== -1){
        //         conn.sendText(JSON.stringify(obj));
        //     }
        // });
        // return;
    }
    server.connections.forEach(conn=>{
        conn.sendText(JSON.stringify(obj));
    })
}

function getDate(){
    return moment().format('YYYY-MM-DD HH:mm:ss')
}

let users = [];
let user;
let bridge = {};
let msgs = {};
let server = ws.createServer(conn=>{
    conn
    .on('text',obj=>{
        obj = JSON.parse(obj);
        if(obj.type === 1){
            // user = {
            //     nickname: obj.nickname,
            //     uid: obj.uid
            // };
            // users.push(obj.nickname);
            // console.log(server.connections.length);
            let onlineCount = server.connections.length;
            let nickname = obj.nickname;
            const sqlStr = 'select * from relationship where owner = ?';
            sql.query(sqlStr,nickname,(err,results)=>{
                if(err){
                    broadcast({
                        type: 1,
                        msg: '查询失败',
                        data: {
                            users: users,
                            onlineCount: onlineCount,
                            nickname: obj.nickname,
                            uid: obj.uid,
                            date: getDate()
                        }
                    });
                }else{
                    if(results.length){
                        console.log('成功返回关系表')
                        // console.log(results[0])
                        let groups,friends0,friends;
                        if(results[0].groups){
                            groups = results[0].groups.split(',');
                        }
                        if(results[0].friends){
                            friends0 = results[0].friends.split(',').map(e=>e.split('-'))
                            friends = [];
                            friends0.forEach((item,index)=>{
                                friends[index] = {};
                                friends[index].nickname = item[0];
                                friends[index].uid = item[1];
                            });
                        }
                        let data = {
                            users: users,
                            onlineCount: onlineCount,
                            nickname: obj.nickname,
                            uid: obj.uid,
                            date: getDate(),
                            friends: friends,
                            groups:groups
                        };
                        broadcast({
                            type: 1,
                            msg: '成功返回关系表',
                            data: data
                        });
                    }else{
                        broadcast({
                            type: 1,
                            msg: '查询失败',
                            data: {
                                users: users,
                                onlineCount: onlineCount,
                                nickname: obj.nickname,
                                uid: obj.uid,
                                date: getDate()
                            }
                        });
                    }
                }
            })
            broadcast({
                type: 1,
                msg: '连接成功',
                data: {
                    users: users,
                    onlineCount: onlineCount,
                    nickname: obj.nickname,
                    uid: obj.uid,
                    date: getDate()
                }
            });
        }else if(obj.type === 2){
            broadcast({
                type: 2,
                date: getDate(),
                msg: obj.nickname + '：' + obj.msg,
                nickname: obj.nickname,
                uid: obj.uid
            });
        }else if(obj.type === 3){
            // if(!(bridge[obj.bridge[0] + '-' + obj.bridge[1]])){
            // }
            // for (const key in bridge) {
            //     if (key.split('-')[0] === obj.bridge[1]) {
            //         bridge[key] = undefined;
            //     }
            // }
            bridge[obj.bridge[0] + '-' + obj.bridge[1]] = {};
            bridge[obj.bridge[0] + '-' + obj.bridge[1]][obj.uid] = conn;
            broadcast({
                type: 3,
                date: getDate(),
                msg: '一对一',
                nickname: obj.nickname,
                uid: obj.uid,
                bridge: obj.bridge
            });
        }else if(obj.type === 4){
            // server.connections.forEach(conn=>console.log(conn.path.slice(6)+'---'))
            broadcast({
                type: 4,
                date: getDate(),
                // msg: obj.nickname + '：' + obj.msg,
                msg: obj.msg,
                nickname: obj.nickname,
                uid: obj.uid + '',
                bridge: obj.bridge
            });
        }else if(obj.type === 0){
            let tag = 0;
            server.connections.forEach(e=>{
                if(e.path.slice(6) === obj.uid + ''){
                    tag = 1;
                }
            })
            if(tag === 1){
                conn.sendText('已登录');
            }else{
                conn.sendText('未登录');
            }
        }
    })
    .on('close',()=>{
        console.log('连接已关闭。')
    })
    .on('error',err=>{
        console.log('异常关闭。')
    })
}).listen(5000);

console.log('成功建立连接...')