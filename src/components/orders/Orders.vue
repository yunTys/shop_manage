<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索区 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable>
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 表格列表 -->
      <el-table :data="ordersList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="90"></el-table-column>
        <el-table-column label="是否付款" width="90">
          <template slot-scope="scope">
            <el-tag type="danger" size="small" v-if="scope.row.pay_status === '0'">未付款</el-tag>
            <el-tag type="success" size="small" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="90"></el-table-column>
        <el-table-column label="下单时间" width="170">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showDialog"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 页码 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 修改地址对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressVisible"
      width="50%"
      @close="handleClosed">
      
      <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
        <el-form-item label="省市县/区" prop="address1">
          <el-cascader
            v-model="addressForm.address1"
            :options="cityData"
            :props="{ expandTrigger: 'hover' }">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 显示物流进度 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressVisible"
      width="50%">

      <el-timeline>
        <el-timeline-item v-for="(item, i) in progressInfo" :key="i" :timestamp="item.time" placement="top">
          <p>{{ item.context }}</p>
        </el-timeline-item>
      </el-timeline>

      <span slot="footer" class="dialog-footer">
        <el-button @click="progressVisible = false">取 消</el-button>
        <el-button type="primary" @click="progressVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata'

export default {
  data () {
    return {
      // 订单列表
      ordersList: [],

      // 查询信息
      queryInfo: {
        // 查询字段
        query: '',
        // 当前页码
        pagenum: 1,
        // 每页显示条数
        pagesize: 10
      },

      // 总数据条数
      total: 0,

      // 修改地址对话框显示与隐藏
      addressVisible: false,

      // 修改地址表单对象
      addressForm: {
        address1: [],
        address2: ''
      },
      // 修改地址表单规则
      addressFormRules: {
        address1: [
          { required: true, message: '请选择地区', trigger: 'change' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },

      // 省市区数据
      cityData,

      // 物流进度对话框显示/隐藏
      progressVisible: false,
      // 物流进度信息
      progressInfo: []
    }
  },
  created () {
    this.getOrdersList()
  },
  methods: {
    // 获取订单列表
    async getOrdersList () {
      const {data: res} = await this.$axios.get('orders', { params: this.queryInfo })

      if(res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败')
      }

      this.ordersList = res.data.goods
      this.total = res.data.total
      // console.log(this.ordersList)
    },

    // 每页显示的条数
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrdersList()
    },

    // 显示第几页
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrdersList()
    },

    // 显示修改地址对话框
    showDialog () {
      this.addressVisible = true
    },

    // 监听修改地址对话框的关闭事件
    handleClosed () {
      this.$refs.addressFormRef.resetFields()
    },

    // 显示物流进度对话框
    async showProgressBox () {
      const {data: res} = await this.$axios.get('/kuaidi/1106975712662')

      if(res.meta.status !== 200) {
        return this.$message.error('获取物流进度失败')
      }
      this.progressInfo = res.data
      this.progressVisible = true
      // console.log(this.progressInfo)
    }
  }
}
</script>

<style lang="scss" scoped>
.el-cascader{
  width: 100%;
}
</style>