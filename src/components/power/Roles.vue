<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-button type="primary">添加角色</el-button>
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom', i1 == 0 ? 'bdtop':'','vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightsById(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级权限 -->
              <el-col :span="19">
                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightsById(scope.row, item2.id)">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="removeRightsById(scope.row, item3.id)">
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showRightsDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 设置权限列表对话框 -->
    <el-dialog
      title="权限列表"
      :visible.sync="rightsDialogVisible"
      width="50%"
      @close="rightsDialogClose">
      <!-- 树形控件 -->
      <el-tree 
        :data="rightsList" 
        :props="treeProps" 
        show-checkbox 
        node-key="id" 
        default-expand-all
        :default-checked-keys="rightsIdKeys"
        ref="treeRef">
      </el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="rightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 角色列表
      rolesList: [],
      // 是否显示权限列表对话框
      rightsDialogVisible: false,
      // 权限列表
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认勾选的节点的 id 数组
      rightsIdKeys: [],
      // 保存当前的角色 id
      roleId: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表
    async getRolesList () {
      const {data: res} = await this.$axios.get('roles')
      if(res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
      // console.log(this.rolesList)
    },
    // 根据 id 删除对应的权限
    async removeRightsById (role, rightsId) {
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if(confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const {data: res} = await this.$axios.delete(`roles/${role.id}/rights/${rightsId}`)

      if(res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }

      role.children = res.data
    },
    // 显示权限列表对话框并获取权限列表
    async showRightsDialog (role) {
      this.roleId = role.id
      // 获取权限列表
      const {data: res} = await this.$axios.get('rights/tree')
      this.rightsList = res.data

      // 获取三级权限 id 
      this.getLeafKeys(role, this.rightsIdKeys)

      this.rightsDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的 id ,并保存到 rightsIdKeys 数组中
    getLeafKeys (node, arr) {
      // 已经是三级权限
      if(!node.children) {
        return arr.push(node.id)
      }

      // 递归
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 权限列表框关闭时调用的函数
    rightsDialogClose () {
      this.rightsIdKeys = []
    },
    // 分配权限并提交
    async allotRights () {
      const rightsIdArr = [...this.$refs.treeRef.getCheckedKeys(),...this.$refs.treeRef.getHalfCheckedKeys()]
      // console.log(rightsIdArr);

      const rightsIdStr = rightsIdArr.join(',')
      const {data: res} = await this.$axios.post(`roles/${this.roleId}/rights`, {rids: rightsIdStr})
      if(res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.rightsDialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.bdtop{
  border-top: 1px solid #eee;
}
.bdbottom{
  border-bottom: 1px solid #eee;
}

.el-tag{
  margin: 8px;
}

.vcenter{
  display: flex;
  align-items: center;
}
</style>