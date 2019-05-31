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

console.log('正在建立连接...')

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
                        uid: results[0].uid,
                        headimg: results[0].headimg
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
    const sqlStr3 = 'insert into relationship set owner = ?';
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
                            sql.query(sqlStr3,nickname,(err,results)=>{
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
            }
        }
    })
})
.post('/api/addFriend',(req,res)=>{
    let nickname = req.body.nickname;
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
                let self = req.body.self;
                let uid = results[0].uid;
                let headimg = results[0].headimg;
                let str;
                let friends;
                const sqlStr1 = 'select friends from relationship where owner = ?';
                const sqlStr2 = 'update relationship set friends = ? where owner = ?';
                sql.query(sqlStr1,self,(err,results)=>{
                    if(err){
                        res.json({
                            status: 0,
                            message: '查询失败'
                        })
                    }else{
                        if(!results.length){
                            res.json({
                                status: 1,
                                message: '查询失败'
                            })
                        }else{
                            if(results[0].friends){
                                friends = results[0].friends;
                                str = friends +  ',' + nickname + '-' + uid + '-' + headimg;
                            }else{
                                str = nickname + '-' + uid + '-' + headimg;
                            }
                            sql.query(sqlStr2,[str,self],(err,results)=>{
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
                                            message: '添加成功',
                                            friendUid: uid,
                                            headimg: headimg
                                        })
                                    }
                                }
                            })
                        }
                    }
                })
            }
        }
    })
})
.post('/api/addGroup',(req,res)=>{
    let nickname = req.body.nickname;
    let uid = req.body.uid;
    let group = req.body.group;
    const sqlStr = 'select gid from mygroup where nickname = ?';
    sql.query(sqlStr,group,(err,results)=>{
        if(err){
            res.json({
                status: 0,
                message: '查询失败'
            })
        }else{
            if(!results.length){
                res.json({
                    status: 1,
                    message: '查无此群'
                })
            }else{
                let gid = results[0].gid;
                let str;
                let groups;
                let members;
                let str2;
                const sqlStr1 = 'select * from relationship where owner = ?';
                const sqlStr2 = 'update relationship set mygroups = ? where owner = ?';
                const sqlStr3 = 'select * from mygroup where nickname = ?';
                const sqlStr4 = 'update mygroup set members = ? where nickname = ?';
                sql.query(sqlStr1,nickname,(err,results)=>{
                    if(err){
                        res.json({
                            status: 0,
                            message: '查询失败'
                        })
                    }else{
                        if(!results.length){
                            res.json({
                                status: 1,
                                message: '查询失败'
                            })
                        }else{
                            if(results[0].mygroups){
                                groups = results[0].mygroups;
                                str = groups +  ',' + group + '-' + gid;
                            }else{
                                str = group + '-' + gid;
                            }
                            sql.query(sqlStr2,[str,nickname],(err,results)=>{
                                console.log(err)
                                if(err){
                                    res.json({
                                        status: 0,
                                        message: '加入失败'
                                    })
                                }else{
                                    if(!results.affectedRows){
                                        res.json({
                                            status: 0,
                                            message: '加入失败'
                                        })
                                    }else{
                                        sql.query(sqlStr3,group,(err,results)=>{
                                            if(err){
                                                res.json({
                                                    status: 0,
                                                    message: '查询失败'
                                                })
                                            }else{
                                                if(!results.length){
                                                    res.json({
                                                        status: 1,
                                                        message: '查询失败'
                                                    })
                                                }else{
                                                    if(results[0].members){
                                                        members = results[0].members;
                                                        str2 = members +  ',' + nickname + '-' + uid;
                                                    }else{
                                                        str2 = nickname + '-' + uid;
                                                    }
                                                    sql.query(sqlStr4,[str2,group],(err,results)=>{
                                                        if(err){
                                                            res.json({
                                                                status: 0,
                                                                message: '加入失败'
                                                            })
                                                        }else{
                                                            if(!results.affectedRows){
                                                                res.json({
                                                                    status: 0,
                                                                    message: '加入失败'
                                                                })
                                                            }else{
                                                                res.json({
                                                                    status: 1,
                                                                    message: '加入成功',
                                                                    gid: gid
                                                                })
                                                            }
                                                        }
                                                    })
                                                }
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    }
                })
            }
        }
    })
})
.post('/api/createGroup',(req,res)=>{
    let nickname = req.body.nickname;
    let uid = req.body.uid;
    let group = req.body.group;
    const sqlStr = 'select nickname from mygroup';
    const sqlStr1 = 'insert into mygroup set ?';
    sql.query(sqlStr,nickname,(err,results)=>{
        if(err){
            res.json({
                status: 0,
                message: '查询失败'
            })
        }else{
            let groups = results.map(e=>e.nickname);
            if(groups.length && groups.includes(group)){
                res.json({
                    status: 1,
                    message: '已创建'
                })
            }else{
                // console.log('可创建')
                let gid = Date.now();
                let groupObj = {
                    nickname: group,
                    gid: gid
                }
                sql.query(sqlStr1,groupObj,(err,results)=>{
                    if(err){
                        res.json({
                            status: 0,
                            message: '创建失败'
                        })
                    }else{
                        if(!results.affectedRows){
                            res.json({
                                status: 0,
                                message: '创建失败'
                            })
                        }else{
                            res.json({
                                status: 1,
                                message: '创建成功',
                                group: group
                            })
                        }
                    }
                })
            }
        }
    })
})
.post('/api/checkFriend',(req,res)=>{
    let nickname = req.body.nickname;
    let otherNickname = req.body.otherNickname;
    const sqlStr = 'select friends from relationship where owner = ?';
    sql.query(sqlStr,otherNickname,(err,results)=>{
        if(err){
            res.json({
                status: 0,
                message: '查询失败'
            })
        }else{
            if(!results.length){
                res.json({
                    status: 0,
                    message: '查询失败'
                })
            }else{
                if(results[0].friends && results[0].friends.includes(nickname)){
                    res.json({
                        status: 1,
                        message: '对方已添加自己',
                        uid: results[0].uid
                    })
                }else{
                    res.json({
                        status: 1,
                        message: '对方未添加自己'
                    })
                }
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
    5: 建立群内通讯桥梁
    6：群内发送消息
    7：加入群组
*/

let users = [];
let bridge = {};
let msgs = {};
let allGroups = {}

function broadcast(obj){
    if(obj.type === 1){
        server.connections.forEach(conn=>{
            if(conn.path.slice(6) === obj.data.uid + ''){
                conn.sendText(JSON.stringify(obj));
            }
        });
        return;
    }else if(obj.type === 3){
        server.connections.forEach(conn=>{
            if(obj.bridge[0] === conn.path.slice(6)){
                conn.sendText(JSON.stringify(obj));
            }
        });
        if(msgs[obj.bridge[1] + '-' + obj.bridge[0]]){
            msgs[obj.bridge[1] + '-' + obj.bridge[0]].forEach(e=>{
                server.connections.forEach(conn=>{
                    if(obj.bridge[0] === conn.path.slice(6)){
                        conn.sendText(JSON.stringify(e));
                    }
                });
            })
            msgs[obj.bridge[1] + '-' + obj.bridge[0]] = undefined;
        }
        return;
    }else if(obj.type === 4){
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
    }else if(obj.type === 5){
        let uid = obj.uid;
        let gid = obj.group.gid;
        server.connections.forEach(conn=>{
            if(uid === conn.path.slice(6)){
                conn.sendText(JSON.stringify(obj));
            }
        });
        if(allGroups[gid][uid].length !== 0){
            allGroups[gid][uid].forEach(e=>{
                server.connections.forEach(conn=>{
                    if(uid === conn.path.slice(6)){
                        conn.sendText(JSON.stringify(e));
                    }
                });
            })
            allGroups[gid][uid] = [];
        }
    }else if(obj.type === 6){
        let arr = server.connections.map(conn=>conn.path.slice(6));
        allGroups[obj.gid].members.forEach(e=>{
            if(!arr.includes(e)){
                allGroups[obj.gid][e].push(obj);
            }
        })
        server.connections.forEach(conn=>{
            if(allGroups[obj.gid].members.includes(conn.path.slice(6))){
                conn.sendText(JSON.stringify(obj));
            }
        });
    }else if(obj.type === 7){
        let uid = obj.uid;
        server.connections.forEach(conn=>{
            if(uid === conn.path.slice(6)){
                conn.sendText(JSON.stringify(obj));
            }
        });
    }
}

function getDate(){
    return moment().format('YYYY-MM-DD HH:mm:ss')
}

let server = ws.createServer(conn=>{
    conn
    .on('text',obj=>{
        obj = JSON.parse(obj);
        if(obj.type === 1){
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
                        // console.log('成功返回关系表')
                        let groups,groups0,friends0,friends;
                        if(results[0].mygroups){
                            groups0 = results[0].mygroups.split(',').map(e=>e.split('-'))
                            groups = [];
                            groups0.forEach((item,index)=>{
                                groups[index] = {};
                                groups[index].nickname = item[0];
                                groups[index].gid = item[1];
                            });
                        }
                        if(results[0].friends){
                            friends0 = results[0].friends.split(',').map(e=>e.split('-'))
                            friends = [];
                            friends0.forEach((item,index)=>{
                                friends[index] = {};
                                friends[index].nickname = item[0];
                                friends[index].uid = item[1];
                                friends[index].headimg = item[2];
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
            broadcast({
                type: 4,
                date: getDate(),
                msg: obj.msg,
                nickname: obj.nickname,
                uid: obj.uid + '',
                headimg: obj.headimg,
                bridge: obj.bridge,
                color: obj.color
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
        }else if(obj.type === 5){
            let uid = obj.uid;
            let nickname = obj.group.nickname;
            let gid = obj.group.gid + '';
            const sqlStr = 'select * from mygroup where nickname = ?';
            sql.query(sqlStr,nickname,(err,results)=>{
                if(err){
                    broadcast({
                        type: 5,
                        msg: '查询失败',
                        uid: uid,
                        group: obj.group
                    });
                }else{
                    if(results.length){
                        if(!allGroups[gid]){
                            allGroups[gid] = {};
                            allGroups[gid].members = [];
                            members0 = results[0].members.split(',').map(e=>e.split('-'));
                            members0.forEach((item,index)=>{
                                allGroups[gid].members[index] = item[1];
                                allGroups[gid][item[1] + ''] = [];
                            });
                        }
                        // console.log('群内成员建立连接');
                        broadcast({
                            type: 5,
                            msg: '群内成员建立连接',
                            uid: uid,
                            group: obj.group
                        });
                    }else{
                        broadcast({
                            type: 5,
                            msg: '查询失败',
                            uid: uid,
                            group: obj.group
                        });
                    }
                }
            })
        }else if(obj.type === 6){
            broadcast({
                type: 6,
                date: getDate(),
                msg: obj.msg,
                nickname: obj.nickname,
                uid: obj.uid + '',
                headimg: obj.headimg,
                group: obj.group,
                gid: obj.gid,
                color: obj.color
            });
        }else if(obj.type === 7){
            let uid = obj.uid;
            let nickname = obj.group;
            let gid = obj.gid + '';
            const sqlStr = 'select * from mygroup where nickname = ?';
            sql.query(sqlStr,nickname,(err,results)=>{
                if(err){
                    broadcast({
                        type: 7,
                        msg: '查询失败',
                        uid: uid
                    });
                }else{
                    if(results.length){
                        if(!allGroups[gid]){
                            allGroups[gid] = {};
                            allGroups[gid].members = [];
                            members0 = results[0].members.split(',').map(e=>e.split('-'));
                            members0.forEach((item,index)=>{
                                allGroups[gid].members[index] = item[1];
                                allGroups[gid][item[1] + ''] = [];
                            });
                            broadcast({
                                type: 7,
                                msg: '新建群成功',
                                uid: uid
                            });
                        }else{
                            allGroups[gid].members.push(uid);
                            allGroups[gid][uid + ''] = [];
                            broadcast({
                                type: 7,
                                msg: '加入群成功',
                                uid: uid
                            });
                        }
                        // console.log('群内成员建立连接');
                        
                    }else{
                        broadcast({
                            type: 7,
                            msg: '查询失败',
                            uid: uid
                        });
                    }
                }
            })
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