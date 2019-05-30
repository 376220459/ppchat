<template>
  <div class="chat" @click="hiddenAddList">
    <div class="add-friend-page" v-if="showFriendPage" @click.stop>
      <input type="text" placeholder="请输入好友昵称" maxlength="10" v-model="addFriendName" @keydown.enter="addFriend">
      <button @click="addFriend">添加</button>
    </div>
    <div class="add-group-page" v-if="showGroupPage" @click.stop>
      <input type="text" placeholder="请输入群名称" maxlength="15" v-model="addGroupName" @keydown.enter="addGroup">
      <button @click="addGroup">添加</button>
    </div>
    <div class="create-group-page" v-if="showCreateGroupPage" @click.stop>
      <input type="text" placeholder="请输入群名称" maxlength="15" v-model="createGroupName" @keydown.enter="createGroup">
      <button @click="createGroup">创建</button>
    </div>
    <div class="container">
      <div class="chat-list">
        <div class="self-inf">
          <img :src="headimg" alt="">
          <span>{{ nickname }}</span>
        </div>
        <tree name='联系人' :node-arr='friends' @chat='chat' :head-img-classes='headImgClasses' :blink='blink' name-blink="[]"></tree>
        <tree name='群' :node-arr='groups' @chat='chatGroup' :blink='blink2' :name-blink="nameBlink"></tree>
        <i class="add-button iconfont icon-add" @click.stop="changeAddList"></i>
        <div class="add-list" v-if="showAddList" @click.stop>
          <div @click="showAddPage('friend')"><i class="iconfont icon-tianjiahaoyou"></i>添加好友</div>
          <div @click="showAddPage('group')"><i class="iconfont icon-qunliao"></i>加入群</div>
          <div @click="showAddPage('create')"><i class="iconfont icon-qunzu"></i>新建群</div>
        </div>
      </div>
      <div class="chat-content" v-if="otheruid || group">
        <div class="chat-content-show">
          <div class="icon-list" v-if="iconListIf">
            <i v-for="(item, index) in iconList2" :key="index" :class="iconfontClass + item" @click="selectIcon(item)"></i>
          </div>

          <div class="chat-obj">{{ otherNickname || group }}</div>

          <div class="chat-main" v-if="otheruid">
            <div ref="message" class="chat-message" v-for="(item, index) in messages[otheruid]" :key="index">
              <div class="msg msg-self" v-if="item.nickname !== otherNickname">
                <span :style="{color: item.color}" v-html="item.msg">{{ item.msg }}</span>
                <img :src="item.headimg" alt="">
              </div>
              <div class="msg msg-other" v-else>
                <img :src="item.headimg" alt="">
                <span class='span-inf'>{{ item.nickname }}</span>
                <span class='span-msg' :style="{color: item.color}" v-html="item.msg">{{ item.msg }}</span>
              </div>
            </div>
          </div>

          <div class="chat-main" v-if="group">
            <div class="chat-message" v-for="(item, index) in messages[gid]" :key="index">
              <div class="msg msg-self" v-if="item.nickname == nickname">
                <span :style="{color: item.color}" v-html="item.msg">{{ item.msg }}</span>
                <img :src="item.headimg" alt="">
              </div>
              <div class="msg msg-other" v-else>
                <img :src="item.headimg" alt="">
                <span class='span-inf'>{{ item.nickname }}</span>
                <span class='span-msg' :style="{color: item.color}" v-html="item.msg">{{ item.msg }}</span>
              </div>
            </div>
          </div>

        </div>
        <div class="chat-content-input">
          <div class="tools">
            <i class="iconfont icon-biaoqing" @click.stop="showIconList"></i>
            <i class="iconfont icon-tupian"></i>
            <el-color-picker v-model="fontColor"></el-color-picker>
          </div>
          <textarea v-model="msg" :style="{color:fontColor}" @keydown.enter="send" id="ipt"></textarea>
          <button @click="send">发送(Enter)</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
function getPosition(element) {
    let cursorPos = 0;
    if (document.selection) {//IE
        var selectRange = document.selection.createRange();
        selectRange.moveStart('character', -element.value.length);
        cursorPos = selectRange.text.length;
    } else if (element.selectionStart || element.selectionStart == '0') {
        cursorPos = element.selectionStart;
    }
    return cursorPos;
}
import tree from './Tree.vue'  
export default {
  name: 'Chat',
  components: {tree},
  data() {
    return {
      headImgClasses: [],
      blink: '',
      blink2: '',
      nameBlink: [],
      iconfontClass: 'iconfont ',
      iconList1: ['[icon-Nird]','[icon-Ninja]','[icon-Pirate]','[icon-LOL]','[icon-Money-Eye]','[icon-Layer-1]','[icon-Kiss]','[icon-Layer-]','[icon-Laugh-Hard]','[icon-Ufo]','[icon-Sweating]','[icon-Karate]','[icon-Hypster]','[icon-Hypnotized]','[icon-Headache]','[icon-In-Love]','[icon-Quiet]','[icon-Shy]'],
      iconList2: ['icon-Nird','icon-Ninja','icon-Pirate','icon-LOL','icon-Money-Eye','icon-Layer-1','icon-Kiss','icon-Layer-','icon-Laugh-Hard','icon-Ufo','icon-Sweating','icon-Karate','icon-Hypster','icon-Hypnotized','icon-Headache','icon-In-Love','icon-Quiet','icon-Shy'],
      iconListIf: false,
      nickname: '',
      uid: '',
      headimg: '',
      friends: [],
      groups: [],
      fontColor: '#000000',
      msg: ``,
      ws: null,
      group: '',
      gid: '',
      otherNickname: '',
      otheruid: '',
      messages: {},
      showAddList: false,
      showFriendPage: false,
      showGroupPage: false,
      showCreateGroupPage: false,
      addFriendName: '',
      addGroupName: '',
      createGroupName: ''
    }
  },
  methods: {
    showIconList(){
      if(this.iconListIf){
        this.iconListIf = false;
      }else{
        this.iconListIf = true;
      }
    },
    changeAddList(){
      if(!this.showAddList){
        this.showAddList = true;
      }else{
        this.showAddList = false;
      }
      this.showFriendPage = false;
      this.showGroupPage = false;
      this.showCreateGroupPage = false;
    },
    hiddenAddList(e){
      if(this.iconListIf){
        this.iconListIf = false;
      }
      if(e.currentTarget.className !== 'add-list' && this.showAddList){
        this.showAddList = false;
      }
      if(e.currentTarget.className !== 'add-friend-page' || e.currentTarget.className !== 'add-group-page'){
        this.showFriendPage = false;
        this.showGroupPage = false;
        this.showCreateGroupPage = false;
      }
    },
    showAddPage(type){
      this.showAddList = false;
      if(type === 'friend'){
        this.showGroupPage = false;
        this.showCreateGroupPage = false;
        this.showFriendPage = true;
      }else if(type === 'group'){
        this.showFriendPage = false;
        this.showCreateGroupPage = false;
        this.showGroupPage = true;
      }else{
        this.showFriendPage = false;
        this.showGroupPage = false;
        this.showCreateGroupPage = true;
      }
    },
    addFriend(){
      let friends = this.friends.map(e=>e.nickname);
      let name = this.addFriendName.trim();
      if(!name){
        this.$message.warning('拜托，你都没有输入昵称好吧')
      }else if(name === this.nickname){
        this.$message.warning('添加自己为好友就过分了啊')
      }else if(friends.indexOf(this.addFriendName) !== -1){
        this.$message.warning('Ta已经是你的好友了，不要贪心哦')
      }else{
        this.$http.post('http://localhost:3000/api/addFriend',{
          nickname: name,
          self: this.nickname
        },
        {timeout: 3000})
        .then((res)=>{
            // console.log(res.data);
            if(res.data.status === 1){
                if(res.data.message === '添加成功'){
                  let friendUid = res.data.friendUid;
                  let headimg = res.data.headimg;
                  this.friends.push({
                    nickname: name,
                    uid: friendUid,
                    headimg: headimg
                  });
                  this.$set(this.messages,friendUid,[]);

                  let sendMsg = {
                    type: 3,
                    // msg: '一对一建立连接',
                    nickname: this.nickname,
                    uid: this.uid,
                    bridge: [this.uid + '',friendUid + '']
                  }
                  if(this.ws.readyState === 1){
                    this.ws.send(JSON.stringify(sendMsg));
                    this.$message.success('添加成功');
                    this.showFriendPage = false;
                  }
                  // console.log(this.friends);
                }else if(res.data.message === '查无此人'){
                  this.$message.warning('没有找到该好友哦，检查下昵称吧');
                }else{
                  this.$message.warning('服务器开小差了，休息一会吧~');
                }
            }else{
              this.$message.warning('服务器开小差了，休息一会吧~');
            }
        })
        .catch((err)=>{
            console.log(err);
            this.$message.warning('您怕是没联网吧~');
        })
      }
      this.addFriendName = '';
    },
    addGroup(){
      let groups = this.groups.map(e=>e.nickname);
      let name = this.addGroupName.trim();
      if(!name){
        this.$message.warning('拜托，你都没有输入群名好吧')
      }else if(groups.indexOf(this.addGroupName) !== -1){
        this.$message.warning('你已经是改群组的成员啦，不要贪心哦')
      }else{
        this.$http.post('http://localhost:3000/api/addGroup',{
          nickname: this.nickname,
          uid: this.uid,
          group: name
        },
        {timeout: 3000})
        .then((res)=>{
            // console.log(res.data);
            if(res.data.status === 1){
                if(res.data.message === '加入成功'){
                  let gid = res.data.gid;
                  this.groups.push({
                    nickname: name,
                    gid: gid
                  });
                  this.$set(this.messages,gid,[]);

                  let sendMsg = {
                    type: 7,
                    // msg: '加入群组',
                    group: name,
                    gid: gid,
                    nickname: this.nickname,
                    uid: this.uid + ''
                  }
                  // let sendMsg = {
                  //   type: 3,
                  //   // msg: '一对一建立连接',
                  //   nickname: this.nickname,
                  //   uid: this.uid,
                  //   bridge: [this.uid + '',friendUid + '']
                  // }
                  if(this.ws.readyState === 1){
                    this.ws.send(JSON.stringify(sendMsg));
                    this.$message.success('加入成功');
                    this.showGroupPage = false;
                  }
                  // console.log(this.friends);
                }else if(res.data.message === '查无此群'){
                  this.$message.warning('没有找到该群哦，检查下群昵称吧');
                }else{
                  this.$message.warning('服务器开小差了，休息一会吧~');
                }
            }else{
              this.$message.warning('服务器开小差了，休息一会吧~');
            }
        })
        .catch((err)=>{
            console.log(err);
            this.$message.warning('您怕是没联网吧~');
        })
      }
      this.addGroupName = '';
    },
    createGroup(){
      let name = this.createGroupName.trim();
      if(!name){
        this.$message.warning('拜托，你都没有输入群名好吧')
      }else{
        this.$http.post('http://localhost:3000/api/createGroup',{
          nickname: this.nickname,
          uid: this.uid,
          group: name
        },
        {timeout: 3000})
        .then((res)=>{
            // console.log(res.data);
            if(res.data.status === 1){
                if(res.data.message === '创建成功'){
                  // console.log('创建成功')
                  let group = res.data.group;
                  this.$http.post('http://localhost:3000/api/addGroup',{
                    nickname: this.nickname,
                    uid: this.uid,
                    group: group
                  },
                  {timeout: 3000})
                  .then((res)=>{
                      // console.log(res.data);
                      if(res.data.status === 1){
                          if(res.data.message === '加入成功'){
                            let gid = res.data.gid;
                            this.groups.push({
                              nickname: group,
                              gid: gid
                            });
                            this.$set(this.messages,gid,[]);

                            let sendMsg = {
                              type: 7,
                              // msg: '加入群组',
                              group: group,
                              gid: gid,
                              nickname: this.nickname,
                              uid: this.uid + ''
                            }
                            if(this.ws.readyState === 1){
                              this.ws.send(JSON.stringify(sendMsg));
                              this.$message.success('创建成功');
                              this.showCreateGroupPage= false;
                            }
                          }else{
                            this.$message.warning('服务器开小差了，休息一会吧~');
                          }
                      }else{
                        this.$message.warning('服务器开小差了，休息一会吧~');
                      }
                  })
                  .catch((err)=>{
                      console.log(err);
                      this.$message.warning('您怕是没联网吧~');
                  })
                }else if(res.data.message === '已创建'){
                  this.$message.warning('本群已创建，重新想一个群名称吧');
                }else{
                  this.$message.warning('服务器开小差了，休息一会吧~');
                }
            }else{
              this.$message.warning('服务器开小差了，休息一会吧~');
            }
        })
        .catch((err)=>{
            console.log(err);
            this.$message.warning('您怕是没联网吧~');
        })
      }
      this.createGroupName = '';
    },
    selectIcon(iconName){
      let ipt = document.getElementById('ipt');
      let index = 0;
      index = getPosition(ipt);
      iconName = '[' + iconName + ']'
      this.msg = this.msg.slice(0,index) + iconName + this.msg.slice(index);
      ipt.focus();
    },
    send(e){
      if(!this.msg && !e.shiftKey){
        e.preventDefault();
        return;
      }
      if(!e.shiftKey){
        let changemsg = this.msg;
        this.iconList1.forEach(e=>{
          if(this.msg.includes(e)){
            let str = '<i style="width:20px;height:20px;font-size:20px;" class="iconfont ' + e.slice(1,e.length - 1) + '"></i>';
            changemsg = changemsg.split(e).join(str)
          }
        })
        e.preventDefault();
        if(this.otherNickname){
          let msg = this.msg
          let sendMsg = {
            type: 4,
            msg: changemsg,
            nickname: this.nickname,
            uid: this.uid,
            headimg: this.headimg,
            bridge: [this.uid + '',this.otheruid + ''],
            color: this.fontColor
          }
          this.msg = ``;
          this.$http.post('http://localhost:3000/api/checkFriend',{
            nickname: this.nickname,
            otherNickname: this.otherNickname
          },
          {timeout: 3000})
          .then((res)=>{
              // console.log(res.data);
              if(res.data.status === 1){
                  if(res.data.message === '对方已添加自己'){
                    if(this.ws.readyState === 1){
                      this.ws.send(JSON.stringify(sendMsg));
                    }
                  }else if(res.data.message === '对方未添加自己'){
                    this.$message.warning('对方还没有添加你为好友哦，再等等吧');
                  }
              }else{
                this.$message.warning('服务器开小差了，休息一会吧~');
              }
          })
          .catch((err)=>{
              console.log(err);
              this.$message.warning('您怕是没联网吧~');
          })
        }else if(this.group){
          let sendMsg = {
            type: 6,
            msg: changemsg,
            nickname: this.nickname,
            uid: this.uid + '',
            headimg: this.headimg,
            group: this.group,
            gid: this.gid + '',
            color: this.fontColor
          }
          this.msg = ``;
          if(this.ws.readyState === 1){
            this.ws.send(JSON.stringify(sendMsg));
          }
        }
      }
    },
    chat(otherObj){
      // console.log(otherNickname.nickname)
      if(this.group){
        this.group = '';
        this.gid = '';
      }
      let friends = this.friends.map(e=>e.nickname);
      let index = friends.indexOf(otherObj.nickname);
      if(this.headImgClasses[index] === 'bounce'){
        this.$set(this.headImgClasses,index,'');
      }
      if(!this.headImgClasses.includes('bounce')){
        this.blink = '';
      }
      this.otherNickname = otherObj.nickname;
      this.otheruid = otherObj.uid + '';
      setTimeout(() => {
        let msgs = document.getElementsByClassName('msg');
        if(msgs[msgs.length - 1]){
          msgs[msgs.length - 1].scrollIntoView();
        }
      }, 0);
    },
    chatGroup(groupObj){
      // console.log(otherNickname.nickname)
      if(this.otherNickname){
        this.otherNickname = '';
        this.otheruid = '';
      }
      let groups = this.groups.map(e=>e.nickname);
      let index = groups.indexOf(groupObj.nickname);
      if(this.nameBlink[index] === 'name-blink'){
        this.$set(this.nameBlink,index,'');
      }
      if(!this.nameBlink.includes('name-blink')){
        this.blink2 = '';
      }
      this.group = groupObj.nickname;
      this.gid = groupObj.gid + '';
      setTimeout(() => {
        let msgs = document.getElementsByClassName('msg');
        if(msgs[msgs.length - 1]){
          msgs[msgs.length - 1].scrollIntoView();
        }
      }, 0);
    }
  },
  created() {
    // this.chatStyle = `background: url('../../static/img/chat-back.jpg');background-size: cover;`;
  },
  mounted() {
    if(!this.$route.params.nickname){
      this.$message({
        message: 'Sorry...掉线了，重新登录吧',
        type: 'warning',
        duration: 1000
      });
      setTimeout(() => {
        this.$router.push({
          path: '/login'
        })
      }, 1000);
      return;
    }
    let nickname = this.$route.params.nickname;
    let uid = this.$route.params.uid;
    let headimg = this.$route.params.headimg;
    this.nickname = nickname;
    this.uid = uid;
    this.headimg = headimg;
    let userInf = {
      type: 1,
      nickname: this.nickname,
      uid: this.uid + '',
      headimg: this.headimg
    }
    this.ws = new WebSocket('ws://localhost:5000?uid=' + this.uid);
    this.ws.onmessage = e=>{
      let obj = JSON.parse(e.data);
      if(obj.type === 1){
        if(obj.msg === '连接成功'){
          // this.messages.push('连接成功，您可以和 ' + this.otherNickname + ' 对话了。');
          console.log(this.nickname + '，您已成功连接至ppchat，当前在线人数：' + obj.data.onlineCount + '人');
          this.$message.success(this.nickname + '，您已成功连接至ppchat，当前在线人数：' + obj.data.onlineCount + '人');
        }else if(obj.msg === '成功返回关系表'){
          // console.log('成功返回关系表');
          if(obj.data.friends){
            obj.data.friends.forEach(e=>{
              /* 重点！！！  此处不能写作 this.messages[e.uid] = [],否则将会导致视图层不能正常渲染。 */
              this.$set(this.messages,e.uid,[]);
            })
          }
          if(obj.data.groups){
            obj.data.groups.forEach(e=>{
              /* 重点！！！  此处不能写作 this.messages[e.gid] = [],否则将会导致视图层不能正常渲染。 */
              this.$set(this.messages,e.gid,[]);
            })
          }
          if(obj.data.friends){
            this.friends = obj.data.friends;
            this.friends.forEach(e=>{
              let sendMsg = {
                type: 3,
                // msg: '一对一建立连接',
                nickname: this.nickname,
                uid: this.uid,
                bridge: [this.uid + '',e.uid + '']
              }
              if(this.ws.readyState === 1){
                this.ws.send(JSON.stringify(sendMsg));
              }
            })
          }
          if(obj.data.groups){
            this.groups = obj.data.groups;
            this.groups.forEach(e=>{
              let sendMsg = {
                type: 5,
                // msg: '群内成员建立连接',
                group: e,
                nickname: this.nickname,
                uid: this.uid + ''
              }
              if(this.ws.readyState === 1){
                this.ws.send(JSON.stringify(sendMsg));
              }
            })
          }
        }
      }else if(obj.type === 4){
        if(this.otherNickname !== obj.nickname && obj.nickname !== this.nickname){
          let friends = this.friends.map(e=>e.nickname);
          let index = friends.indexOf(obj.nickname);
          this.$set(this.headImgClasses,index,'bounce');
          if(this.blink === ''){
            this.blink = 'blink';
          }
        }
        if(obj.nickname === this.nickname){
          this.messages[obj.bridge[1]].push({
            nickname: obj.nickname,
            msg: obj.msg,
            headimg: obj.headimg,
            color: obj.color
          });
        }else{
          this.messages[obj.uid].push({
            nickname: obj.nickname,
            msg: obj.msg,
            headimg: obj.headimg,
            color: obj.color
          });
        }
        setTimeout(() => {
          let msgs = document.getElementsByClassName('msg');
          if(msgs[msgs.length - 1]){
            msgs[msgs.length - 1].scrollIntoView();
          }
        }, 0);
      }else if(obj.type === 5){
        // console.log('收到回复')
        if(obj.msg === '群内成员建立连接'){
          console.log(obj.msg);
        }
      }else if(obj.type === 6){
        console.log(this.group)
        if(this.group !== obj.group && obj.nickname !== this.nickname){
          let groups = this.groups.map(e=>e.nickname);
          let index = groups.indexOf(obj.group);
          this.$set(this.nameBlink,index,'name-blink');
          if(this.blink2 === ''){
            this.blink2 = 'blink';
          }
        }
        let gid = obj.gid;
        this.messages[gid].push({
          msg: obj.msg,
          nickname: obj.nickname,
          uid: obj.uid,
          headimg: obj.headimg,
          group: obj.group,
          gid: obj.gid,
          color: obj.color
        });
        setTimeout(() => {
          let msgs = document.getElementsByClassName('msg');
          if(msgs[msgs.length - 1]){
            msgs[msgs.length - 1].scrollIntoView();
          }
        }, 0);
      }else if(obj.type === 7){
        if(obj.msg === '新建群成功'){
          console.log(obj.msg);
        }else if(obj.msg === '加入群成功'){
          console.log(obj.msg);
        }else{
          console.log(obj.msg);
        }
      }else{
        console.log(obj.msg);
      }
    }
    this.ws.onopen = ()=>{
      console.log('ws通道已打开')
      if(this.ws.readyState === 1){
        this.ws.send(JSON.stringify(userInf));
      }
    }
    this.ws.onclose = ()=>{
      console.log('ws通道已关闭');
    }
  },
  beforeRouteLeave(to, from, next){
    // console.log(to)
    if(to.name === 'Login' && this.nickname){
      next(false);
    }else{
      next();
    }
  }
}
</script>

<style lang="scss" scoped>
  input{  
    background:none;  
    outline:none;  
    border:0px;
  }
  button{  
    background:none;
    border: 1px solid transparent;  //自定义边框
    outline: none;    //消除默认点击蓝色边框效果
    margin: 0;
    padding: 0;
  }
  .chat{
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    .add-friend-page,.add-group-page,.create-group-page{
      width: 300px;
      height: 150px;
      border: 1px solid #606060;
      border-radius: 15px;
      background: rgba(255, 255, 255, 0.589);
      position: absolute;
      z-index: 3;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      input{
        box-sizing: border-box;
        height: 30px;
        width: 80%;
        border: 1px solid #888888;
        border-radius: 15px;
        padding: 0 1.5em;
      }
      button{
        height: 30px;
        width: 40%;
        border: 3px solid #888888;
        border-radius: 10px;
        margin-top: 20px;
        color: #404040b7;
        font-weight: bold;
        cursor: pointer;
      }
      button:active{
        transform: scale(0.99);
      }
    }
    .container{
      box-sizing: border-box;
      width: 1200px;
      min-width: 1200px;
      height: 700px;
      min-height: 700px;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid white;
      border-radius: 5px;
      box-shadow: 0px 0px 50px #aaaaaa;
      display: flex;
      .chat-list,.chat-content{
        box-sizing: border-box;
        height: 100%;
        border-right: 1px solid white;
      }
      .chat-list{
        width: 400px;
        padding: 60px;
        padding-top: 120px;
        // background: url(../../static/img/list-back.jpg);
        // background-size: cover;
        background: #D8D8D8;
        position: relative;
        .self-inf{
          display: flex;
          align-items: center;
          position: absolute;
          left: 25px;
          top: 20px;
          cursor: pointer;
          img{
            width: 80px;
            height: 80px;
            border-radius: 50%;
            margin-right: 15px;
          }
          span{
            font-size: 30px;
          }
        }
        .add-button{
          position: absolute;
          bottom: 10px;
          right: 10px;
          z-index: 2;
          font-size: 35px;
          color: rgba(0, 0, 0, 0.459);
          cursor: pointer;
        }
        .add-button:hover{
          color: rgba(0, 0, 0, 0.35);
        }
        .add-button:active{
          transform: scale(0.9);
        }
        .add-list{
          box-sizing: border-box;
          width: 130px;
          height: 150px;
          background: white;
          border-radius: 10px;
          border-bottom-right-radius: 0;
          position: absolute;
          bottom: 45px;
          right: 45px;
          div{
            font-size: 20px;
            color: black;
            margin: 20px 10px;
            text-align: left;
            cursor: pointer;
            i{
              margin-right: 5px;
            }
          }
          div:hover{
            color: rgba(0, 0, 0, 0.438);
          }
        }
      }
      .chat-content{
        width: 800px;
        display: flex;
        flex-direction: column;
        background: rgba(255, 255, 255, 0.8);
        .chat-content-show,.chat-content-input{
          box-sizing: border-box;
        }
        .chat-content-show{
          height: 449px;
          border-bottom: 1px solid white;
          display: flex;
          flex-direction: column;
          position: relative;
          .icon-list{
            box-sizing: border-box;
            width: 320px;
            height: 200px;
            border: 1px solid #C0C0C0;
            border-radius: 10px;
            border-bottom-left-radius: 0;
            background: #F0F0F0;
            position: absolute;
            bottom: 5px;
            left: 25px;
            z-index: 3;
            display: flex;
            flex-wrap: wrap;
            align-content: flex-start;
            i{
              width: 25px;
              height: 25px;
              margin: 10px;
              font-size: 25px;
              cursor: pointer;
            }
          }
          .chat-obj{
            height: 50px;
            line-height: 50px;
            font-size: 25px;
            color: rgba(0, 0, 0, 0.5);
          }
          .chat-main{
            box-sizing: border-box;
            flex: auto;
            overflow: auto;
            padding: 10px;
            .chat-message{
              display: flex;
              flex-direction: column;
              margin: 20px 0;
              font-size: 20px;
              .msg-self,.msg-other{
                box-sizing: border-box;
                width: auto;
                display: flex;
                img{
                  width: 50px;
                  height: 50px;
                  border-radius: 50%;
                  vertical-align: top;
                  margin: 0 10px;
                }
                span{
                  box-sizing: border-box;
                  max-width: 70%;
                  border: 2px solid rgba(255, 255, 255, 0.555);
                  border-radius: 10px;
                  display: flex;
                  flex-wrap: wrap;
                  justify-content: flex-start;
                  padding: 5px 10px;
                  margin-top: 10px;
                  text-align: left;
                  white-space: pre-wrap;
                  word-break: break-all;
                  position: relative;
                  top: 10px;
                  user-select: text;
                }
              }
              .msg-self{
                justify-content: flex-end;
                align-self: flex-end;
                span{
                  background: skyblue;
                  color: white;
                }
              }
              .msg-other{
                justify-content: flex-start;
                align-self: flex-start;
                position: relative;
                .span-inf{
                  box-sizing: border-box;
                  border: none;
                  border-radius: 0;
                  padding: 0;
                  margin: 0;
                  white-space: nowrap;
                  overflow: auto;
                  position: absolute;
                  left: 70px;
                  top: 0;
                  font-size: 15px;
                  color: #aaaaaa;
                }
                .span-msg{
                  background: pink;
                  color: white;
                }
              }
            }
          }
          .chat-main::-webkit-scrollbar {/*滚动条整体样式*/
              width: 8px;     /*高宽分别对应横竖滚动条的尺寸*/
              height: 4px;
          }
          .chat-main::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
              border-radius: 5px;
              -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
              background: rgba(0,0,0,0.2);
          }
        }
        .chat-content-input{
          height: 251px;
          display: flex;
          flex-direction: column;
          .tools{
            display: flex;
            align-items: center;
            i{
              font-size: 35px;
              color: rgba(0, 0, 0, 0.5);
              margin-right: 10px;
              cursor: pointer;
            }
            i:hover{
              color: rgb(0, 0, 0);
            }
            i:active{
              transform: scale(0.95);
            }
            i:nth-child(1){
              margin-left: 10px;
            }
          }
          textarea{
            border: none;
            outline:none;
            resize: none;
            background: transparent;
            flex: auto;
            font-size: 20px;
            margin: 5px 10px;
          }
          textarea::-webkit-scrollbar {/*滚动条整体样式*/
              width: 8px;     /*高宽分别对应横竖滚动条的尺寸*/
              height: 4px;
          }
          textarea::-webkit-scrollbar-thumb {/*滚动条里面小方块*/
              border-radius: 5px;
              -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
              background: rgba(0,0,0,0.2);
          }
          button{
            box-sizing: border-box;
            width: 100px;
            border: 1px solid rgba(0,0,0,0.5);
            border-radius: 15px;
            align-self: flex-end;
            padding: 5px 10px;
            margin: 0 15px 5px 0;
            font-size: 15px;
            cursor: pointer;
          }
          button:hover{
            color: rgba(0, 0, 0, 0.603);
          }
          button:active{
            transform: scale(0.98);
          }
        }
      }
    }
  }
</style>
