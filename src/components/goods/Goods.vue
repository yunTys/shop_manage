<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索和添加商品区域 -->
      <el-row :gutter="20">
        <!-- 搜索区 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <!-- 添加商品区 -->
        <el-col :span="4">
          <el-button type="primary" @click="pushToAddGoods">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 表格数据 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="100"></el-table-column>
        <el-table-column label="商品重量(克)" prop="goods_weight" width="100"></el-table-column>
        <el-table-column label="创建时间" width="140">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteGoods(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 页码 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background>
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },

      // 商品列表
      goodsList: [],

      // 数据总数
      total: 0,

      // 控制添加商品对话框的显示与隐藏
      addDialogVisible: false
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表
    async getGoodsList () {
      const {data: res} = await this.$axios.get('goods', { params: this.queryInfo })
      if(res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.goodsList = res.data.goods
      this.total = res.data.total
      // console.log(this.goodsList);
    },

    // 每页显示多少条数据
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },

    // 切换页码
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },

    // 删除商品
    async deleteGoods (goods_id) {
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if(confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const {data: res} = await this.$axios.delete('goods/' + goods_id)
      if(res.meta.status !== 200) {
        return this.$message.error('删除商品失败')
      }
      this.$message.success('删除商品成功')
      this.getGoodsList()
    },

    // 跳转到添加商品页面
    pushToAddGoods () {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="scss" scoped>
.el-table{
  font-size: 12px;
}
</style>