import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, Button, Block } from '@tarojs/components'
import { AtTabs } from 'taro-ui'
import { connect } from '@tarojs/redux'

// js
import moment from 'moment'
import Utils from "../../static/js/utils/utils"
import { request, getUrl, GET_ORDER_LIST, URGE_ORDER, BIND_ORDER_FOR_MEMBER } from '../../static/js/api'

// css img
import './order.scss'
import logo from '../../static/img/logo.png'
import noOrderIcon from '../../static/img/order/no_order.png'

// redux
import { onChangeAuthType, onSetUserInfo } from '../../store/actions/action'
import AuthButton from "../../components/anth_button/auth_button";

const STATUS = [-1, 0, 2, 3, 4]; // 订单状态编码
//订单状态 0:已下单;1:已支付;2:已接单;3:已完成;4:已取消;5:已关闭;-1:已作废
const STATUS_TIP = ['待付款', '待收货', '待收货', '已完成', '已取消', '已关闭', '支付超时'];
const PAY_STATUS = [-1, 0, 1, 1, 1]; // 订单支付状态编码

@connect(({ reducers }) => (
  { ...reducers }
), (dispatch) => ({
  onChangeAuthType(payload) {
    dispatch(onChangeAuthType(payload))
  },
  onSetUserInfo(payload) {
    dispatch(onSetUserInfo(payload))
  }
}))
export default class Order extends Component {

  config = {
    navigationBarTitleText: '我的订单',
    enablePullDownRefresh: true
  }

  constructor(props) {
    super(props);
    this.state = {
      tabList: [
        { title: '全部' },
        { title: '待付款' },
        { title: '待收货' },
        { title: '已完成' },
        { title: '已取消' }
      ],
      currentTab: 0,
      currentPage: 1,
      orderList: [],
      timer: null,
      orderNumber: null,
      isScan: false
    }
  }

  componentWillMount() {
  }

  componentDidMount() {
    let q;
    // 判断是扫码进入哪个端的小程序
    if (Utils.isWeApp()) {
      q = this.$router.params['q'];
    } else if (Utils.isAliPay()) {
      q = Taro.getStorageSync('qrCode');
    }
    console.log(decodeURIComponent(q));
    let orderNumber = decodeURIComponent(q).split('=')[1];
    let scanText = decodeURIComponent(q).indexOf('ordernumber') > -1;
    if (orderNumber && scanText) {
      this.setState({
        orderNumber,
        isScan: true
      });
    }
  }

  componentDidShow() {
    this.verifyAuth();
  }

  componentDidHide() {
    clearInterval(this.state.timer);
  }
  
  // 验证授权
  verifyAuth = () => {
    Taro.getSetting().then(res => {
      if (Utils.isWeApp()) {
        if (res.authSetting['scope.userInfo']) {
          // 判断是否是扫码进入
          if (this.state.isScan) {
            this.bindOrderToUser();
          } else {
            this.getOrderList();
          }
        }
        this.props.onChangeAuthType(!res.authSetting['scope.userInfo']);
      } else {
        if (res.authSetting['userInfo']) {
          // 判断是否是扫码进入
          if (this.state.isScan) {
            this.bindOrderToUser();
          } else {
            this.getOrderList();
          }
        }
        this.props.onChangeAuthType(!res.authSetting['userInfo']);
      }
    }).catch(() => {
      this.props.onChangeAuthType(true);
      Taro.showToast({ title: '获取授权信息失败，请重新打开程序', icon: 'none', duration: 1500, mask: true });
    });
  }

  // 绑定订单到用户
  bindOrderToUser = () => {
    request({
      url: getUrl(BIND_ORDER_FOR_MEMBER),
      data: {
        ordernumber: this.state.orderNumber
      }
    }).then(res => {
      if (res.error_code === 'ok') {
        Taro.showToast({ title: '绑定订单成功', icon: 'none', duration: 1500, mask: true});
      } else {
        Taro.showToast({ title: res.msg, icon: 'none', duration: 1500, mask: true});
      }
      this.getOrderList();
    }).catch(() => Taro.showToast({ title: '绑定订单失败', icon: 'none', duration: 1500, mask: true}));
  }

  // isReachBottom ==> 为true说明是上拉加载请求, isPullDownRefresh ===> 为true说明是下拉刷新
  getOrderList = (isReachBottom = false, isPullDownRefresh = false) => {
    clearInterval(this.state.timer);
    request({
      url: getUrl(GET_ORDER_LIST),
      data: {
        page: this.state.currentPage,
        size: 10,
        status: STATUS[this.state.currentTab],
        pay_status: PAY_STATUS[this.state.currentTab],
      }
    }).then(res => {
      Taro.stopPullDownRefresh();
      if (res.error_code === 'ok') {
        if (isPullDownRefresh) {
          this.setState({orderList: []}, () => {
            this.handleOrderList(res.data, isReachBottom);
          });
        } else {
          this.handleOrderList(res.data, isReachBottom);
        }
      } else if (res.error_code == 0) {
        if (isPullDownRefresh) {
          this.setState({orderList: []});
        }
        Taro.showToast({ title: '已无更多数据', icon: 'none', duration: 1500, mask: true});
      } else {
        Taro.showToast({ title: '获取订单列表失败', icon: 'none', duration: 1500, mask: true});
      }
    }).catch(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '获取订单列表失败', icon: 'none', duration: 1500, mask: true});
    })
  }

  // 处理订单信息
  handleOrderList = (orderList, isReachBottom) => {
    let newOrderList = [...this.state.orderList];
    // 如果订单列表为空，直接添加数据
    if (!this.state.orderList.length) {
      newOrderList = orderList;
    } else {
      // 如果是下拉加载，则直接在数组中添加数据
      if (isReachBottom) {
        orderList.forEach(item => {
          newOrderList.push(item);
        });
      } else {
        // 如果不是下拉加载，判断是否改变订单状态
        newOrderList.forEach(order => {
          orderList.forEach(item => {
            if (item.order_id === order.order_id && item.status !== order.status) {
              order.status = item.status;
            }
          });
        });
      }
    }

    // 启动催单倒计时
    let isStartTimeInteval = newOrderList.some(item => {
      return item.status == 2 && item.pay_status == 1 && item.show_urge == 1
    });
    if (isStartTimeInteval) {
      const timer = setInterval(() => {
        this.refreshUrgetime(newOrderList);
      }, 1000);
      this.setState({ timer });
    } else {
      this.setState({orderList: newOrderList});
    }
  }

  // 计算催单倒计时时间
  refreshUrgetime = orderList => {
    orderList.forEach(order => {
      if (moment(order.urgetime).isAfter(moment())) {
        let mistiming = moment(order.urgetime).diff(moment(), 's');
        order['urgetime_'] = `${parseInt(mistiming / 60).toString().padStart(2, '0')}:${(mistiming % 60).toString().padStart(2, '0')}`;
        order['isDisabledUrgeBtn'] = true;
      } else {
        order['urgetime_'] = '00:00';
        order['isDisabledUrgeBtn'] = false;
      }
    });
    this.setState({ orderList });
  }

  changeTab = (index) => {
    this.setState({
      currentTab: index,
      currentPage: 1
    }, () => {
      this.getOrderList(false, true);
    });
  }

  // 下拉刷新
  onPullDownRefresh = () => {
    this.setState({currentPage: 1}, () => {
      this.getOrderList(false, true);
    });
  }

  // 上拉加载更多
  onReachBottom = () => {
    let page = this.state.currentPage + 1;
    this.setState({currentPage: page}, () => {
      this.getOrderList(true);
    });
  }

  // 查看订单详情
  toOrderDetail = (e, orderId) => {
    Taro.navigateTo({url: '/pages/order/order_detail/order_detail?orderId=' + orderId});
  }

  // 用户授权后
  afterAuthorized = () => {
    // 判断是否是扫码进入
    if (this.state.isScan) {
      this.bindOrderToUser();
    } else {
      this.getOrderList();
    }
  }
  
  // 催单
  reminder = (order, e) => {
    e.stopPropagation();
    if (order.isDisabledUrgeBtn) {
      Taro.showToast({ title: '催单时间未到，请在催单计时结束后催单！', icon: 'none', duration: 1500, mask: true});
      return;
    }
    request({
      url: getUrl(URGE_ORDER),
      data: {
        order_id: order.order_id
      }
    }).then(res => {
      this.getOrderList();
      Taro.showToast({ title: res.msg, icon: 'none', duration: 1500, mask: true});
    }).catch(() => {
      Taro.showToast({ title: '催单失败', icon: 'none', duration: 1500, mask: true});
    });
  }

  render() {
    const { orderList } = this.state;

    return (
      <View className='order'>
        {
          this.props.isShowAuthButton
            ?
            <View className='auth'>
              <Image src={logo} mode='aspectFit' className='logo' />
              <View className='btn-container'>
                {
                  this.props.isShowAuthButton &&
                  <AuthButton onAfterAuthorized={this.afterAuthorized}></AuthButton>
                }
                <Button className='btn'>授权登录</Button>
              </View>
            </View>
            :
            orderList.length
            ?
            <Block>
              <View className='tab-header'>
                <AtTabs tabList={this.state.tabList} current={this.state.currentTab} onClick={this.changeTab}></AtTabs>
              </View>
              <View className='order-list-container'>
                {
                  orderList.map((order, idx) => {
                    return (
                      <View className='order-item' key={idx} onClick={e => this.toOrderDetail(e, order.order_id)}>
                        <View className='header'>
                          <Text>{order.train}</Text>
                          <Text className='order-status'>{STATUS_TIP[order.status] || '支付超时'}</Text>
                        </View>
                        {/*<View className='train'>{order.train}</View>*/}
                        {
                          order.orderlist.map((item, index) => {
                            return (
                              <View className='order-content' key={index * 1000}>
                                <View className='product-img'>
                                  <Image src={item.thumb_img} />
                                </View>
                                <View className='product-info'>
                                  <View className='name'>{item.product_name}</View>
                                  <View className='price'>
                                    <Text>￥{item.price}/份</Text>
                                    <Text>x{item.num}</Text>
                                  </View>
                                </View>
                              </View>
                            )
                          })
                        }
                        <View className='total-price'>
                          合计：
                          <Text>￥{(Math.round(order.totalprice * 100) - Math.round(order.discount_price * 100)) / 100}</Text>
                        </View>
                        {
                          order.status == 2 && order.pay_status == 1 && order.show_urge == 1 &&
                          <View className='urge-container'>
                            <Text className='time'>催单倒计时 {order.urgetime_}</Text>
                            <View
                              className={`urge-btn ${order.isDisabledUrgeBtn ? 'disabled' : ''}`}
                              onClick={this.reminder.bind(this, order)}
                            >
                              催单
                            </View>
                          </View>
                        }
                      </View>
                    )
                  })
                }
              </View>
            </Block>
            :
            <Block>
              <View className='tab-header'>
                <AtTabs tabList={this.state.tabList} current={this.state.currentTab} onClick={this.changeTab}></AtTabs>
              </View>
              <View className='no-data'>
                <Image src={noOrderIcon} mode='aspectFit' />
                <View className='tip'>暂无订单,快去逛逛吧~</View>
              </View>
            </Block>
        }
      </View>
    )
  }
}
