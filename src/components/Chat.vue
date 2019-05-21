<template>
  <div class="chat" :style="chatStyle">
    <div class="container">
      <div class="chat-list">
        <tree name='联系人' :node-arr='friends'></tree>
        <tree name='群' :node-arr='groups'></tree>
      </div>
      <div class="chat-content">
        <div class="chat-content-show"></div>
        <div class="chat-content-input">
          <div class="tools">
            <i class="iconfont icon-biaoqing"></i>
            <i class="iconfont icon-tupian"></i>
            <el-color-picker v-model="fontColor"></el-color-picker>
          </div>
          <textarea v-model="inputContent" :style="{color:fontColor}"></textarea>
          <button>发送(Enter)</button>
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
      friends: ['张三','李四','王麻子'],
      groups: ['软件1607','513宿舍'],
      fontColor: '#000000',
      inputContent: ''
    }
  },
  created() {
      this.chatStyle = `background: url('../../static/img/chat-back.jpg');`;
  },
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
              margin-right: 10px;
              cursor: pointer;
            }
            i:hover{
              color: rgba(0, 0, 0, 0.5);
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
