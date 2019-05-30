<template>
    <div class="tree">
        <div :class="title + blink" @click="changeList">
            <i class="iconfont icon-xiangyou" v-show="!show"></i>
            <i class="iconfont icon-xiangxia" v-show="show"></i>
            {{ name }}
        </div>
        <div v-show="show" class="list">
            <div class="list-data" v-for="(item, index) in nodeArr" :key="index" @click="clickData(item)">
                <img v-if="item.headimg" :src="item.headimg" alt="" :class="headImgClasses[index]">
                <span :class="nameBlink[index]">{{ item.nickname }}</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Tree',
    props: ['name','nodeArr','headImgClasses','blink','nameBlink'],
    data() {
        return {
            show: false,
            title: 'title '
            // headImgClasses: []
            // name: '联系人',
            // nodeArr: [
            //     {
            //         nickname: '张三',
            //         uid: '123321'
            //     },
            //     {
            //         nickname: '李四',
            //         uid: '123321'
            //     },
            //     {
            //         nickname: '王麻子',
            //         uid: '123321'
            //     }
            // ]
        }
    },
    methods: {
        changeList(){
            if(this.show){
                this.show = false;
            }else{
                this.show = true;
            }
        },
        clickData(chatObj){
            this.$emit('chat',chatObj);
        }
    },
}
</script>

<style lang="scss" scoped>
    .tree{
        width: 100%;
        // background: skyblue;
        display: flex;
        flex-direction: column;
        // color: rgba(255, 255, 255, 0.74);
        .title{
            margin-bottom: 20px;
            text-align: left;
            font-size: 23px;
            white-space: nowrap;
            overflow-x: auto;
            cursor: pointer;
        }
        .blink{
            opacity: 1;
            animation: blink 0.3s linear infinite alternate;
        }
        @keyframes blink{
            from {opacity: 1}
            to {opacity: 0}
        }
        .list{
            width: 80%;
            margin-left: 50px;
            text-align: left;
            font-size: 20px;
            .list-data{
                display: flex;
                align-items: center;
                margin-bottom: 8px;
                white-space: nowrap;
                overflow-x: auto;
                cursor: pointer;
                img{
                    box-sizing: border-box;
                    width: 52px;
                    height: 52px;
                    border-radius: 50%;
                    padding: 2px;
                    margin-right: 10px;
                }
                .bounce{
                    position: relative;
                    animation: bounce 0.4s linear infinite alternate;
                    left: 0;
                    top: 0;
                }
                @keyframes bounce{
                    0% {left: -1px;top: -1px}
                    25% {left: 0px;top: 0}
                    50% {left: 1px;top: 1px}
                    75% {left: 0;top: 0px}
                    100% {left: -1px;top: -1px}
                }
                .name-blink{
                    opacity: 1;
                    animation: nameblink 0.3s linear infinite alternate;
                }
                @keyframes nameblink{
                    from {opacity: 1}
                    to {opacity: 0}
                }
            }
            .list-data:hover{
                // background: rgba(0, 0, 0, 0.219);
                color: rgba(0, 0, 0, 0.3);
            }
        }
    }
</style>
