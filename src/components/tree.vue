<template>
    <div class="tree">
        <div class="title" @click="changeList">
            <i class="iconfont icon-xiangyou" v-show="!show"></i>
            <i class="iconfont icon-xiangxia" v-show="show"></i>
            {{ name }}
        </div>
        <div v-show="show" class="list">
            <div class="list-data" v-for="(item, index) in nodeArr" :key="index">{{ item }}</div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Tree',
    props: ['name','nodeArr'],
    data() {
        return {
            show: false
            // name: '联系人',
            // nodeArr: ['张三','李四','王麻子']
        }
    },
    methods: {
        changeList(){
            if(this.show){
                this.show = false;
            }else{
                this.show = true;
            }
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
        margin-bottom: 20px;
        // color: rgba(255, 255, 255, 0.74);
        .title{
            margin-bottom: 20px;
            text-align: left;
            font-size: 23px;
            white-space: nowrap;
            overflow-x: auto;
            cursor: pointer;
        }
        .list{
            width: 80%;
            margin-left: 50px;
            text-align: left;
            font-size: 20px;
            .list-data{
                margin-bottom: 8px;
                white-space: nowrap;
                overflow-x: auto;
                cursor: pointer;
            }
            .list-data:hover{
                // background: rgba(0, 0, 0, 0.219);
                color: rgba(0, 0, 0, 0.3);
            }
        }
    }
</style>
