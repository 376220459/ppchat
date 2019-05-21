<template>
  <div class="register" :style="registerStyle" v-loading="loading" :element-loading-text="loadingText" element-loading-background="rgba(0, 0, 0, 0.6)">
    <div class="container" :style="containerStyle">
      <img src="../../static/img/register.png" alt="login">
      <input type="text" placeholder="UserId" v-model="nickname">
      <input type="password" placeholder="PassWord" v-model="password" @keydown.enter="register">
      <button @click="register">Register</button>
    </div>
    <span class="login" @click="login">登录</span>
  </div>
</template>

<script>
export default {
  name: 'Register',
  data() {
    return {
      registerStyle: '',
      containerStyle: '',
      loading: false,
      loadingText: '',
      nickname: '',
      password: ''
    }
  },
  methods: {
    login(){
      this.containerStyle = 'transform: rotateY(90deg)';
      setTimeout(() => {
        this.$router.push({
          path: '/login'
        })
      }, 450);
    },
    register(){
      if(!/^[\u4e00-\u9fa5a-zA-Z0-9]{1,9}$/.test(this.nickname)){
        this.$message.warning('别乱起名字，UserId 由 1~9 位英文、汉字或数字组成，不能有空格哦');
      }else if(!/^[+-.a-zA-Z0-9]{4,16}$/.test(this.password)){
        this.$message.warning('密码不规范哦，PassWord 由 4~16 位英文、数字或+-.组成');
      }else{
        this.loading = true;
        this.$http.post('http://localhost:3000/api/register',{
          nickname: this.nickname,
          password: this.password
        },
        {timeout: 3000})
        .then((res)=>{
            console.log(res.data);
            if(res.data.status === 1){
                if(res.data.message === '注册成功'){
                  // this.$message.success('注册成功');
                  this.loadingText = '注册成功，正在跳转至登录页面...';
                  setTimeout(() => {
                    this.loading = false;
                    this.$router.push({
                      name: 'Login',
                      params:{
                        nickname:this.nickname
                      }
                    });
                  }, 1500);
                }else{
                  this.loading = false;
                  this.$message.warning('此 UserId已被抢注，发挥你的才智再想一个吧~');
                }
            }else{
              this.loading = false;
              this.$message.warning('服务器开小差了，休息一会吧~');
            }
        })
        .catch((err)=>{
            console.log(err);
            this.loading = false;
            this.$message.warning('您怕是没联网吧~');
        })
      }
    }
  },
  created() {
      this.registerStyle = `background: url('../../static/img/register-back.jpeg');background-size: cover;`;
  },
  mounted() {
    setTimeout(() => {
      this.containerStyle = 'transform: rotateY(0deg)';
    }, 0);
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
  .register{
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
      border: 1px solid black;
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
        border: 1px solid black;
        border-radius: 15px;
        padding: 0 30px;
        margin-bottom: 30px;
        font-size: 20px;
        color: 	#FFFFF0;
        text-align: center;
      }
      button{
        width: 80%;
        height: 60px;
        line-height: 50px;
        background: rgba(255, 255, 255, 0.233);
        border: 1px solid black;
        border-radius: 30px;
        margin-top: 10px;
        text-align: center;
        font-size: 25px;
        color: black;
        cursor: pointer;
      }
      button:active{
        font-size: 24px;
        color: rgba(0, 0, 0, 0.692);
      }
    }
    .login{
      position: absolute;
      top: 30px;
      right: 50px;
      font-size: 20px;
      font-weight: bold;
      color: rgba(0, 0, 0, 0.411);
      cursor: pointer;
    }
    .login:hover{
      color: rgba(0, 0, 0, 0.596);
      text-decoration: underline;
    }
  }
</style>
