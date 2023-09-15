import Taro, { Component } from '@tarojs/taro'
import { View, Input, Button } from '@tarojs/components'

// js
import Utils from '../../static/js/utils/utils'
import { getUrl } from '../../static/js/api'

// css
import './index.scss'

class Index extends Component {

  config = {
    navigationBarBackgroundColor: '#006699',
    navigationBarTextStyle: 'white',
    navigationBarTitleText: '员工登录'
  }

  constructor(props) {
    super(props);
    this.state = {
      mobile: '',
      password: ''
    }
  }

  componentWillMount () { }

  componentDidMount () { }

  // 设置表单值
  setFormValue = (e) => {
    this.setState({ [e.currentTarget.dataset['name']]: e.currentTarget.value });
  }

  // 员工登录
  login = () => {
    if (!Utils.regMobile(this.state.mobile)) {
      Taro.showToast({ title: '请输入正确的手机号码！', icon: 'none', duration: 1500, mask: true });
      return;
    }
    if (!this.state.password) {
      Taro.showToast({ title: '请输入密码！', icon: 'none', duration: 1500, mask: true });
      return;
    }
    Taro.showLoading({ mask: true, title: '加载中...' });
    Taro.login().then(res => {
      if (res.errMsg == 'login:ok') {
        Taro.request({
          method: 'POST',
          url: getUrl('/staff/v1/getStaffToken'),
          data: {
            mobile: this.state.mobile,
            password: this.state.password,
            code: res.code
          }
        }).then(response => {
          Taro.hideLoading();
          if (response.data.code == '1') {
            // Taro.setStorage({ staffToken: response.data.staffToken });
            Taro.redirectTo({ url: '/pages/staffMeal/home/index' });
          } else {
            Taro.showToast({ title: `${res.data.message} ,请重新登录！`, icon: 'none', duration: 1500, mask: true });
          }
        }).catch(() => {
          Taro.hideLoading();
          Taro.showToast({ title: '登录失败', icon: 'none', duration: 1500, mask: true });
        })
      }
    }).catch(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '获取code失败，请关闭小程序重试！', icon: 'none', duration: 1500, mask: true });
    })
  }

  render () {
    return (
      <View className='staff-meal'>
        <View className='login-container'>
          <View className='title'>员工餐预订系统</View>

          <Input className='login-input' type='number' maxLength='11' data-name='mobile' placeholder='手机号码' onInput={this.setFormValue}></Input>
          <Input className='login-input' maxLength='50' data-name='password' placeholder='登录密码' onInput={this.setFormValue}></Input>
          <Button className='login-btn' onClick={this.login}>登 录</Button>
        </View>
      </View>
    )
  }
}

export default Index