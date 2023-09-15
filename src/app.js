import Taro, { Component } from '@tarojs/taro'
import { Provider } from '@tarojs/redux'

import store from './store/index'
import Index from './pages/index'

import Utils from "./static/js/utils/utils"

// 阿拉丁
import './ald/ald-stat'

// css
import './app.scss'

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }

let uma;
if (Utils.isAliPay()) {
  uma = require('umtrack-alipay');
}

class AApp extends Component {

  config = {
    pages: [
      'pages/index/index',
      'pages/index/guide/guide',
      'pages/index/common/common',
      'pages/index/common/detail/detail',
      'pages/index/train/train',
      'pages/index/site/site',
      'pages/index/recommend/recommend',
      'pages/index/date_picker/date_picker',
      'pages/goods/goods',
      'pages/order/order',
      'pages/order/create_order/create_order',
      'pages/order/order_detail/order_detail',
      'pages/order/invoice/invoice',
      'pages/order/pay/scan/scan',
      'pages/order/pay/pay_success/pay_success',
      'pages/order/pay/pay_fail/pay_fail',
      'pages/order/pay/scan_order/scan_order',
      'pages/order/pay/face_pay/face_pay',
      'pages/user/user',
      'pages/user/info/info',
      'pages/user/coupon/coupon',
      'pages/user/coupon/detail/detail',
      'pages/user/invite/invite',
      'pages/user/integral/integral',
      'pages/user/integral/detail/detail',
      'pages/user/integral/order/order',
      'pages/undeveloped/undeveloped',

      'pages/h5/index',
      'pages/video/video',
      'pages/live-broadcast/live-broadcast',
    ],
    subpackages: [
      {
        root: 'pages/staffMeal',
        pages: [
          'index',
          'home/index',
          'cart/index',
          'order/index'
        ]
      },
      {
        root: 'pages/travel',
        pages: [
          'index',
          'history/history',
          'add/add'
        ]
      }
    ],
    window: {
      navigationBarTitleText: '舌尖上de旅途',
      backgroundTextStyle: 'light',
      navigationBarTextStyle: 'black',
      navigationBarBackgroundColor: '#FFFFFF'
    },
    tabBar: {
      color: '#999999',
      selectedColor: "#f8b02a",
      borderStyle: "black",
      backgroundColor: "#ffffff",
      list: [
        {
          text: "主页",
          pagePath: "pages/index/index",
          iconPath: "./static/img/tabBar/index.png",
          selectedIconPath: "./static/img/tabBar/index_selected.png"
        },
        {
          text: "订单",
          pagePath: "pages/order/order",
          iconPath: "./static/img/tabBar/order.png",
          selectedIconPath: "./static/img/tabBar/order_selected.png"
        },
        {
          text: "我的",
          pagePath: "pages/user/user",
          iconPath: "./static/img/tabBar/user.png",
          selectedIconPath: "./static/img/tabBar/user_selected.png"
        }
      ]
    },
    plugins: {
      "live-player-plugin": {
        "version": "1.0.6",
        "provider": "wx2b03c6e691cd7370"
      }
    },
    navigateToMiniProgramAppIdList: [
      // 微信
      'wx8d75e764f0c4bf1c',
      "wxbd687630cd02ce1d",
      "wx736e48c2f7bb06f5",
      "wx121b74bed28859ca",
      "wx528c1c20aa2ef14f",
      "wx62ddbfd30dd24b15",
      "wx6ee906fbaa89d8b0",
      "wx51a909520aeb57f6",

      // 支付宝
      '2019012663094851'
    ]
  }

  // 友盟
  umengConfig = {
    appKey: '5e1bcbb68bbd62283d1a5040', //由友盟分配的APP_KEY
    debug: true //是否打开调试模式
  }

  globalData = {
    uma
  }

  componentWillMount () {
    const ENV = Taro.getEnv();

    this.scanInForAliPay(ENV);

    console.log(ENV);
    // 除了 web 端，其他检测更新
    if (ENV !== 'WEB') {
      Taro.getUpdateManager().onCheckForUpdate(res => {
        if (res.hasUpdate) {
          //当新版本下载完成，会进行回调
          Taro.getUpdateManager().onUpdateReady(() => {
            if (ENV === 'WEAPP') {
              Taro.showModal({
                title: '小程序更新提示',
                content: '新版本已经准备好，单击确定重启应用',
                showCancel: false,
              }).then(modalConfirm => {
                if (modalConfirm.confirm) {
                  if (res.confirm) {
                    // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                    Taro.getUpdateManager().applyUpdate();
                  }
                }
              });
            } else {
              my.confirm({
                title: '小程序更新提示',
                content: '新版本已经准备好，单击确定重启应用',
                success: () => {
                  Taro.getUpdateManager().applyUpdate();
                },
              });
            }
          });

          //当新版本下载失败，会进行回调
          Taro.getUpdateManager().onUpdateFailed(function () {
            if (Taro.getEnv() === 'WEAPP') {
              Taro.showModal({
                title: '提示',
                content: '检查到有新版本，但下载失败，请检查网络设置',
                showCancel: false,
              });
            } else {
              my.alert({
                title: '提示',
                content: '检查到有新版本，但下载失败，请检查网络设置',
              });
            }
          });
        }
      });
    }
  }

  componentDidMount () {
  }

  componentDidShow () {
  }

  componentDidHide () {}

  componentDidCatchError () {}

  // 支付宝扫码进入获取参数
  scanInForAliPay = env => {
    if (env === 'ALIPAY') {
      let q = this.$router.params['query']['qrCode'].split('&')[0];
      if (q) {
        Taro.setStorageSync('qrCode', q);
      }
    }
  }

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render () {
    return (
      <Provider store={store}>
        <Index />
      </Provider>
    )
  }
}

Taro.render(<AApp />, document.getElementById('app'))
