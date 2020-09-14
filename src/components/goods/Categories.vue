<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加分类 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCate">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 分类数据表格 -->
      <tree-table 
        :data="cateList" 
        :columns="columns"
        show-index
        index-text="#"
        :show-row-hover="false"
        :expand-type="false"
        :selection-type="false"
        border
        class="tree-table">
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: #67c23a;"></i>
          <i class="el-icon-error" v-else style="color: #F56C6C;"></i>
        </template>

        <!-- 级别 -->
        <template slot="order" slot-scope="scope">
          <el-tag type="primary" size="small" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="small" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="small" v-else>三级</el-tag>
        </template>

        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>

      <!-- 页码 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClose">
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="parentCateProps"
            clearable
            @change="handleChange"
            ref="cascaderRef">
          </el-cascader>
        </el-form-item>
      </el-form>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类数据列表
      cateList: [],
      // 商品分类数据总数
      total: 0,
      // 表格各行的数据配置
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 当前列定义为模板列
          type: 'template',
          // 模板使用的名称
          template: 'isok'
        },
        {
          label: '级别',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类数据对象
      addCateForm: {
        // 分类名称
        cat_name: '',
        // 分类父级 id
        cat_pid: 0,
        // 当前添加的分类等级默认是一级分类
        cat_level: 0
      },
      // 表单验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类数据列表
      parentCateList: [],
      // 级联选择器的规则
      parentCateProps: { 
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      // 选择的父级分类数组
      selectedKeys: []
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类列表
    async getCateList () {
      const {data: res} = await this.$axios.get('categories', { params: this.queryInfo })
      if(res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 监听 pagesize 的改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听 pagenum 的改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 显示添加分类对话框
    showAddCate () {
      this.getParentList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类数据
    async getParentList () {
      const {data: res} = await this.$axios.get('categories', { params: { type: 2 } })

      if(res.meta.status !== 200) {
        return this.$message.error('获取父级商品分类失败')
      }

      this.parentCateList = res.data
      // console.log(res.data)
    },
    // 监听父级分类的改变事件
    handleChange () {
      this.$refs.cascaderRef.toggleDropDownVisible()
      if(this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      }else{
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 添加分类
    saveCate () {
      this.$refs.addCateFormRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$axios.post('categories', this.addCateForm)
        if(res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 对话框关闭时重置表单
    addCateDialogClose () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    }
  }
}
</script>

<style lang="scss" scoped>
.tree-table{
  margin-top: 15px;
}
.el-cascader{
  width: 100%;
}

</style>