<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 警告消息 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>

      <!-- 步骤条 -->
      <el-steps :active="active - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>


      <!-- tab 标签 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs v-model="active" tab-position="left" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格(元)" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量(克)" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                clearable
                @change="handleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item v-for="item in manyPropsData" :key="item.attr_id" :label="item.attr_name">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(val, i) in item.attr_vals" :key="i" :label="val" border size="mini"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyPropsData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 表示要上传的后台 API 地址 -->
            <el-upload
              :action="uploadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce">
            </quill-editor>

            <!-- 添加商品按钮 -->
            <el-button type="primary" class="add-btn" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <!-- 预览图片 -->
      <el-dialog
        title="预览图片"
        :visible.sync="previewVisible"
        width="50%">
        <img :src="previewPath" alt="" class="preview-img">
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  data () {
    return {
      // tab 标签和 步骤条连接的活动值
      active: '0',
      // 表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 分类列表的 id
        goods_cat: [],
        // 上传的图片临时路径
        pics: [],
        // 商品的详情描述
        goods_introduce: '',
        // 商品的参数
        attrs: []
      },
      // 表单验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类(只允许选择第三级分类)', trigger: 'change' }
        ]
      },
      // 商品分类列表
      cateList: [],
      // 级联选择器的规则
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      // 动态参数列表
      manyPropsData: [],
      // 静态属性列表
      onlyPropsData: [],
      // 图片上传的地址
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传的 headers 请求头
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览的图片地址
      previewPath: '',
      // 控制预览图片对话框显示与隐藏
      previewVisible: false
    }
  },

  created () {
    this.getCateList()
  },

  methods: {
    // 获取商品分类列表
    async getCateList () {
      const {data: res} = await this.$axios.get('categories')
      
      if(res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }

      this.cateList = res.data
      // console.log(this.cateList);
    },
     
    // 监听级联菜单改变事件
    handleChange () {
      if(this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        return
      }
    },

    // tab 标签切换之前的函数
    beforeTabLeave (activeName, oldActiveName) {
      if(oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },

    // tab 标签点击事件
    async tabClicked () {
      // 切换的是 商品参数 面板
      if(this.active === '1') {
        const {data: res} = await this.$axios.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })

        if(res.meta.status !== 200) {
          return this.$message.error('获取参数失败')
        }

        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        })

        this.manyPropsData = res.data
        // console.log(this.manyPropsData)
      }else if(this.active === '2') {
        const {data: res} = await this.$axios.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
        if(res.meta.status !== 200) {
          return this.$message.error('获取参数失败')
        }
        this.onlyPropsData = res.data
        // console.log(this.onlyPropsData)
      }
    },

    // 点击文件列表中已上传的文件时的钩子
    handlePreview (file) {
      // console.log(file);
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },

    // 文件列表移除文件时的钩子
    handleRemove (file) {
      // 1. 获取将要删除图片的临时路径
      const filePath = file.response.data.tmp_path

      // 2. 从 pics 数组中，找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex(item => item.pic === filePath)

      // 3. 调用 splice 方法，把图片信息对象，从 pics 数组中删除
      this.addForm.pics.splice(i, 1)
    },

    // 图片上传成功的处理函数
    handleSuccess (res) {
      const picInfo = { pic: res.data.tmp_path }
      this.addForm.pics.push(picInfo)
      // console.log(this.addForm)
    },

    // 添加商品
    add () {
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) {
          this.$message.error('请填写必要的表单数据')
          return
        }

        // 校验通过

        // 处理参数列表
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')

        // 处理动态参数
        this.manyPropsData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyPropsData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        // console.log(form)

        // 发起请求添加商品
        const {data: res} = await this.$axios.post('goods', form)
      
        if(res.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }

        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  
  computed: {
    cateId () {
      if(this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="scss" scoped>
.el-checkbox{
  margin: 0 10px 0 0 !important;
}

.preview-img{
  width: 100%;
}

.add-btn{
  margin-top: 15px;
}
</style>
