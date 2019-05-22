<template>
  <div class="chat" :style="chatStyle">
    <div class="container">
      <div class="chat-list">
        <tree name='联系人' :node-arr='friends' @chat='chat'></tree>
        <tree name='群' :node-arr='groups' @chat='chat'></tree>
      </div>
      <div class="chat-content" v-if="otheruid">
        <div class="chat-content-show">
          <div class="chat-obj">{{ chatObj }}</div>
          <div class="chat-main">
            <div ref="message" class="chat-message" v-for="(item, index) in messages[otheruid]" :key="index">
              <div class="msg-self" v-if="item.nickname !== chatObj">
                <span>{{ item.msg }}</span>
                <img src="../../static/headImg/self.jpg" alt="">
              </div>
              <div class="msg-other" v-else>
                <img src="../../static/headImg/niu.jpg" alt="">
                <span>{{ item.msg }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="chat-content-input">
          <div class="tools">
            <i class="iconfont icon-biaoqing"></i>
            <i class="iconfont icon-tupian"></i>
            <el-color-picker v-model="fontColor"></el-color-picker>
          </div>
          <textarea v-model="msg" :style="{color:fontColor}" @keydown.enter="send"></textarea>
          <button @click="send">发送(Enter)</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import tree from './Tree.vue'  
export default {
  name: 'Chat',
  components: {tree},
  data() {
    return {
      nickname: '',
      uid: '',
      friends: [],
      groups: [],
      fontColor: '#000000',
      msg: ``,
      ws: null,
      chatObj: '',
      otheruid: '',
      messages: {}
    }
  },
  methods: {
    send(e){
      if(!e.shiftKey){
        e.preventDefault();
        let sendMsg = {
          type: 4,
          msg: this.msg,
          nickname: this.nickname,
          uid: this.uid,
          bridge: [this.uid + '',this.otheruid + '']
        }
        this.msg = '';
        if(this.ws.readyState === 1 && this.otheruid){
          this.ws.send(JSON.stringify(sendMsg));
        }
      }
    },
    chat(chatObj){
      // console.log(chatObj.nickname)
      this.chatObj = chatObj.nickname;
      this.otheruid = chatObj.uid + '';
      // let sendMsg = {
      //   type: 3,
      //   // msg: '建立连接',
      //   nickname: this.nickname,
      //   uid: this.uid,
      //   bridge: [this.uid + '',this.otheruid + '']
      // }
      // if(this.ws.readyState === 1){
      //   this.ws.send(JSON.stringify(sendMsg));
      // }
    }
  },
  created() {
    this.chatStyle = `background: url('../../static/img/chat-back.jpg');background-size: cover;`;
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
    this.nickname = nickname;
    this.uid = uid;
    let userInf = {
      type: 1,
      nickname: this.nickname,
      uid: this.uid + ''
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
          obj.data.friends.forEach(e=>{
            /* 重点！！！  此处不能写作 this.messages[e.uid] = [],否则将会导致视图层不能正常渲染。 */
            this.$set(this.messages,e.uid,[]);
          })
          if(obj.data.friends){
            this.friends = obj.data.friends;
            this.friends.forEach(e=>{
              let sendMsg = {
                type: 3,
                // msg: '建立连接',
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
            // this.groups = obj.data.groups;
            obj.data.groups.forEach((item,index)=>{
              this.groups[index] = {};
              this.groups[index].nickname = item;
            })
          }
        }
      }else if(obj.type === 4){
        if(this.otheruid){
          this.messages[this.otheruid].push({
            nickname: obj.nickname,
            msg: obj.msg
          });
          // setTimeout(() => {
          //   this.$refs.message[this.messages[this.otheruid.length - 1].style.color = 'red';
          // }, 0);
        }else{
          console.log(obj.nickname + ':' + obj.uid)
          this.messages[obj.uid].push({
            nickname: obj.nickname,
            msg: obj.msg
          });
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
        // background: #C8C8C8;
        background: url(../../static/img/list-back.jpg);
        background-size: cover;
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
          .chat-obj{
            height: 50px;
            line-height: 50px;
            font-size: 25px;
            color: rgba(0, 0, 0, 0.5);
          }
          .chat-main{
            // background: red;
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
                // align-items: flex-start;
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
                  border: 2px solid rgba(0, 0, 0, 0.555);
                  border-radius: 10px;
                  display: inline-block;
                  padding: 5px 10px 0 10px;
                  margin-top: 10px;
                  text-align: left;
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
                span{
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
