<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 用户头像 -->
      <div class="head_portrait">
        <img src="../assets/logo.png" alt="">
      </div>

      <!-- 登录表单 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" class="login_form">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" prefix-icon="iconfont icon-3702mima"></el-input>
        </el-form-item>
        <el-form-item class="login_btns">
          <el-button @click="login" type="primary">登录</el-button>
          <el-button @click="resetForm" type="info">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 登录表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 表单数据验证规则对象
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置表单
    resetForm () {
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        if(!valid) return;
        const {data: res} = await this.$axios.post('login', this.loginForm)
        // console.log(res)
        if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)

        // 1.将登录成功之后的 token 保存到客户端的 sessionStorage 中
        //   1.1 项目中除了登录之外的其他 api 接口，必须在登录之后才能访问
        //   1.2 token 只在当前网站打开期间生效
        window.sessionStorage.setItem('token', res.data.token)
        // 2.通过编程式导航跳转到后台主页，路由地址为 /home
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.login_container{
  background-color: #2b4b6b;
  height: 100%;
}
.login_box{
  position: absolute;
  left: 50%;
  top: 50%;
  width: 450px;
  height: 350px;
  background: #fff;
  border-radius: 4px;
  transform: translate(-50%, -50%);
  .head_portrait{
    position: absolute;
    left: 50%;
    padding: 10px;
    width: 130px;
    height: 130px;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 50%;
    box-shadow: 0 0 10px #eee;
    transform: translate(-50%, -50%);
    img{
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: #eee;
    }
  }
}

.login_form{
  position: absolute;
  bottom: 0;
  padding: 20px;
  box-sizing: border-box;
  width: 100%;
  .login_btns{
    display: flex;
    justify-content: flex-end;
  }
}
</style>