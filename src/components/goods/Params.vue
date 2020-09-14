<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示消息 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
        show-icon>
      </el-alert>

      <!-- 选择商品分类 -->
      <el-row class="margintb">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            v-model="selectedKeys"
            :options="cateList"
            :props="cateProps"
            clearable
            @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>

      <!-- tabs 选项卡 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button @click="addDialogVisible = true" type="primary" size="small" :disabled="isBtnDisabled">添加参数</el-button>

          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环出来的 tag 标签 -->
                <el-tag
                  :key="i"
                  v-for="(tag, i) in scope.row.attr_vals"
                  closable
                  :disable-transitions="false"
                  @close="handleClose(i, scope.row)">
                  {{tag}}
                </el-tag>

                <!-- 文本输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteProp(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button @click="addDialogVisible = true" type="primary" size="small" :disabled="isBtnDisabled">添加属性</el-button>

          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环出来的 tag 标签 -->
                <el-tag
                  :key="i"
                  v-for="(tag, i) in scope.row.attr_vals"
                  closable
                  :disable-transitions="false"
                  @close="handleClose(i, scope.row)">
                  {{tag}}
                </el-tag>

                <!-- 文本输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteProp(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 添加参数/属性对话框 -->
      <el-dialog
        :title="'添加' + titleText"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClose">
        <!-- 提交表单 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改参数/属性对话框 -->
      <el-dialog
        :title="'修改' + titleText"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClose">
        <!-- 提交表单 -->
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类列表
      cateList: [],
      // 商品id
      selectedKeys: [],
      // 级联选择器的规则
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      // 当前活动的tab 选项卡
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态参数的数据
      onlyTableData: [],
      // 添加参数/属性对话框显示与隐藏
      addDialogVisible: false,
      // 添加参数/属性表单数据
      addForm: {},
      // 添加参数/属性表单验证规则
      addFormRules: {
        attr_name: [
           { required: true, message: '请输入参数名称', trigger: 'blur' },
        ]
      },
      // 修改参数/属性对话框显示与隐藏
      editDialogVisible: false,
      // 修改参数/属性表单数据
      editForm: {},
      // 修改参数/属性表单验证规则
      editFormRules: {
        attr_name: [
           { required: true, message: '请输入参数名称', trigger: 'blur' },
        ]
      }
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
    },
    // 监听级联选择器改变的事件
    handleChange () {
      this.getParamsData()
    },
    // 监听 tabs 选项卡的点击事件
    handleTabClick () {
      this.getParamsData()
    },
    // 获取参数列表数据
    async getParamsData () {
      // 选中的不是三级分类
      if(this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }

      // 选中的是三级分类
      // 根据所选分类的 id 和当前所处的面板，获取对应的参数
      const {data: res} = await this.$axios.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if(res.meta.status !== 200) {
        return this.$message.error('获取参数数据失败')
      }

      // 将 attr_vals 转换为数组
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      
      if(this.activeName === 'many') {
        this.manyTableData = res.data
      }else{
        this.onlyTableData = res.data
      }
      // console.log(res.data)
    },
    // 监听添加参数/属性对话框的关闭事件
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
    },
    // 添加参数/属性
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$axios.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })

        if(res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }

        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 显示修改对话框并获取数据
    async showEditDialog (attrId) {
      const {data: res} = await this.$axios.get(`categories/${this.cateId}/attributes/${attrId}`, {
        params: { attr_sel: this.activeName }
      })
      if(res.meta.status !== 200) {
        return this.$message.error('获取参数失败')
      }

      this.editForm = res.data
      
      this.editDialogVisible = true
    },
    // 监听修改参数/属性对话框的关闭事件
    editDialogClose () {
      this.$refs.editFormRef.resetFields()
    },
    // 修改参数/属性
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if(!valid) return

        const {data: res} = await this.$axios.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName,
          attr_vals: this.editForm.attr_vals
        })
        if(res.meta.status !== 200) {
          return this.$message.error('修改参数失败')
        }
        this.$message.success('修改参数成功')
        this.editDialogVisible = false
        this.getParamsData()
      })
    },
    // 根据 id 删除参数/属性
    async deleteProp (attrId) {
      const confirmRes = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if(confirmRes !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const {data: res} = await this.$axios.delete(`categories/${this.cateId}/attributes/${attrId}`)
      if(res.meta.status !== 200) {
        return this.$message.error('删除参数失败')
      }
      this.$message.success('删除参数成功')
      this.getParamsData()
    },
    // 文本框失去焦点或按下 enter 键后的处理函数
    handleInputConfirm (row) {
      if(row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      
      // 如果输入的是有效字符，则进行后续的处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false

      // 将数据添加到数据库中
      this.saveAttrValue(row)
    },
    // 修改 attr_vals 数据
    async saveAttrValue (row) {
      const {data: res} = await this.$axios.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })

      if(res.meta.status !== 200) {
        return this.$message.error('修改标签失败')
      }

      this.$message.success('修改标签成功')
    },
    // 监听 tag 标签的关闭事件
    handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrValue(row)
    },
    // 显示文本框 
    showInput (row) {
      row.inputVisible = true

      // $nextTick 方法的作用是当页面上元素被重新渲染之后，才会执行回调中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    }
  },
  computed: {
    // 如果按钮需要禁用，则返回 true，否则返回 false
    isBtnDisabled () {
      if(this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选择的三级分类的 id
    cateId () {
      if(this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    // 显示动态参数还是静态属性
    titleText () {
      if(this.activeName === 'many') {
        return '动态参数'
      }

      return '静态属性'
    }
  }
}
</script>

<style scoped lang="scss">
.margintb{
  margin: 15px 0;
}
.el-tag{
  margin-right: 10px;
}

.input-new-tag{
  width: 90px;
}
</style>