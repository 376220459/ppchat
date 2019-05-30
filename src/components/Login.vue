<template>
  <div class="login" :style="loginStyle">
    <div class="container" :style="containerStyle">
      <img src="../../static/img/login.png" alt="login">
      <input type="text" placeholder="UserId" v-model="nickname">
      <input type="password" placeholder="PassWord" v-model="password" @keydown.enter="login">
      <button @click="login" onclick="">Go</button>
    </div>
    <span class="register" @click="register">注册</span>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      loginStyle: '',
      containerStyle: '',
      nickname: '王少华',
      password: '376220459',
      uid: '',
      headimg: '',
      pre: 0
    }
  },
  methods: {
    login(){
      let now = Date.now();
      if(now - this.pre <= 1000){
        this.$message.warning('点那么快干嘛~');
        return;
      }else{
        this.pre = now;
      }
      if(this.nickname.trim().length == 0){
        this.$message.warning('不急，您还没有输入 UserId');
      }else if(this.password.trim().length == 0){
        this.$message.warning('不急，您还没有输入 PassWord');
      }else{
        this.$http.post('http://localhost:3000/api/login',{
          nickname: this.nickname,
          password: this.password
        },
        {timeout: 3000})
        .then((res)=>{
            console.log(res.data);
            if(res.data.status === 1){
                if(res.data.message === '密码正确'){
                  this.uid = res.data.uid;
                  this.headimg = res.data.headimg;
                  let ws = new WebSocket('ws://localhost:5000');
                  ws.onmessage = e=>{
                    // console.log(e.data);
                    ws.close();
                    if(e.data === '未登录'){
                      this.$message({
                        message: '登录成功',
                        type: 'success',
                        duration: 1000
                      });
                      setTimeout(() => {
                        this.$router.push({
                          name: 'Chat',
                          params: {
                            nickname: this.nickname,
                            uid: this.uid,
                            headimg: this.headimg
                          }
                        })
                      }, 1000);
                    }else{
                      this.$message({
                        message: '此账号已经登录啦，试试登录其他账号',
                        type: 'warning',
                        duration: 1000
                      });
                    }
                  }
                  ws.onopen = ()=>{
                    if(ws.readyState === 1){
                      ws.send(JSON.stringify({
                        type: 0,
                        uid: this.uid
                      }));
                    }
                  }
                }else if(res.data.message === '密码错误'){
                  this.$message.warning('UserId 或 PassWord输入错误，三思而后行');
                }else{
                  this.$message.warning('此 UserId还没有注册哦，快去注册吧~');
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
    },
    register(){
      this.containerStyle = 'transform: rotateY(90deg)';
      setTimeout(() => {
        this.$router.push({
          path: '/register'
        })
      }, 450);
    }
  },
  created() {
      this.loginStyle = `background: url('../../static/img/login-back.png');background-size: cover;`;
  },
  mounted() {
    setTimeout(() => {
      this.containerStyle = 'transform: rotateY(0deg)';
    }, 0);
    if(this.$route.params.nickname){
      this.nickname = this.$route.params.nickname;
      console.log(this.nickname)
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
  .login{
    height: 100%;
    min-height: 700px;
    display: flex;
    justify-content: center;
    align-items: center;
    .container{
      width: 430px;
      min-width: 430px;
      height: 450px;
      min-height: 450px;
      border: 1px solid white;
      border-radius: 20px;
      box-shadow: 0px 0px 50px #aaaaaa;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 50px;
      transform: rotateY(-90deg);
      transition: transform 0.5s;
      img{
        width: 120px;
        margin-bottom: 40px;
      }
      input{
        box-sizing: border-box;
        width: 80%;
        height: 50px;
        border: 1px solid white;
        border-radius: 15px;
        padding: 0 30px;
        margin-bottom: 30px;
        font-size: 20px;
        text-align: center;
      }
      button{
        width: 80%;
        height: 60px;
        line-height: 50px;
        background: rgba(255, 255, 255, 0.233);
        border: 1px solid white;
        border-radius: 30px;
        margin-top: 10px;
        text-align: center;
        font-size: 25px;
        cursor: pointer;
      }
      button:active{
        font-size: 24px;
        color: rgba(0, 0, 0, 0.555);
      }
    }
    .register{
      position: absolute;
      top: 30px;
      right: 50px;
      font-size: 20px;
      font-weight: bold;
      color: rgba(0, 0, 0, 0.411);
      cursor: pointer;
    }
    .register:hover{
      color: rgba(0, 0, 0, 0.596);
      text-decoration: underline;
    }
  }
</style>
