import Taro, { Component } from '@tarojs/taro'
import { View, Navigator } from '@tarojs/components'

// js
import { getUrl } from '../../../static/js/api'

// css
import './index.scss'

class Index extends Component {

  config = {
    navigationBarBackgroundColor: '#006699',
    navigationBarTextStyle: 'white',
    navigationBarTitleText: '员工系统'
  }

  componentWillMount () {
    this.checkLogin();
  }

  componentDidMount () { }

  checkLogin = () => {
    Taro.showLoading({ mask: true, title: '加载中...' });
    Taro.login().then(res => {
      if (res.errMsg == 'login:ok') {
        Taro.request({
          method: 'POST',
          url: getUrl('/staff/v1/checkStaff'),
          data: {
            code: res.code
          }
        }).then(response => {
          Taro.hideLoading();
          if (response.data.code == '1') {
            if (response.data.data.isLogin != '1') {
              Taro.redirectTo({ url: '/pages/staffMeal/index' });
            } else {
              Taro.setStorage({ key: 'staffToken', data: response.data.data.staffToken });
              Taro.setStorage({ key: 'isLogin', data: response.data.data.isLogin });
              Taro.setStorage({ key: 'staffType', data: response.data.data.staffType });
            }
          } else if (response.data.code == '4000003') {
            Taro.showToast({ title: `${res.data.message} ,请重新登录！`, icon: 'none', duration: 1500, mask: true });
            const timer = setTimeout(() => {
              Taro.redirectTo({ url: '/pages/staffMeal/index' });
              clearTimeout(timer);
            }, 1500);
          } else {
            Taro.showToast({ title: res.data.data.message, icon: 'none', duration: 1500, mask: true });
          }
        }).catch(() => {
          Taro.hideLoading();
          Taro.showToast({ title: '获取code失败，请重试！', icon: 'none', duration: 1500, mask: true });
        });
      } else {
        Taro.hideLoading();
        Taro.showToast({ title: '获取code失败，请关闭小程序重试！', icon: 'none', duration: 1500, mask: true });
      }
    }).catch(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '获取code失败，请关闭小程序重试！', icon: 'none', duration: 1500, mask: true });
    });
  }

  render () {
    return (
      <View className='home'>
        <Navigator className='nav' url='/pages/staffMeal/cart/index'>员工订餐</Navigator>
        <Navigator className='nav' url='/pages/staffMeal/order/index'>查看订单</Navigator>
      </View>
    )
  }
}

export default Index