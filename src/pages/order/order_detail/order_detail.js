import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, Button } from '@tarojs/components'
import { connect } from "@tarojs/redux"
import moment from 'moment'

// component
import CartBar from '../../../components/cart_bar/cart_bar'

// js
import { request, getUrl, GET_ORDER_DETAIL } from '../../../static/js/api'
import pay from '../../../static/js/pay/pay'

// css image
import './order_detail.scss'
import positionIcon from '../../../static/img/order/position.png'

// redux
import { onCalcTotalPrice } from "../../../store/actions/action"

//订单状态 0:已下单;1:已支付;2:已接单;3:已完成;4:已取消;5:已关闭;-1:已作废
const STATUS_TIP = ['待付款', '待收货', '待收货', '已完成', '已取消', '已关闭', '支付超时'];


@connect(({ reducers }) => (
  { ...reducers }
), (dispatch) => ({
  onCalcTotalPrice(payload) {
    dispatch(onCalcTotalPrice(payload));
  }
}))
export default class OrderDetail extends Component {

  config = {
    navigationBarTitleText: '订单详情',
    navigationBarBackgroundColor: '#FFFFFF'
  }

  constructor(props) {
    super(props);
    this.state = {
      orderDetail: {},
      timer: null,
      orderTime: ''
    }
  }

  componentWillMount () { }

  componentDidMount () { }

  componentDidShow () {
    this.getOrderDetail();
  }

  componentWillUnmount() {
    if (this.state.timer) {
      clearInterval(this.state.timer);
    }
  }

  getOrderDetail = () => {
    Taro.showLoading({ mask: true, title: '加载中...' });
    request({
      url: getUrl(GET_ORDER_DETAIL),
      data: {
        order_id: this.$router.params.orderId
      }
    }).then(res => {
      Taro.hideLoading();
      if (res.error_code === 'ok') {
        this.setState({orderDetail: res.data}, () => {
          this.startCountdown();
        });
      } else {
        Taro.showToast({ title: res.msg, icon: 'none', duration: 1500, mask: true })
      }
    }).catch(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '获取订单详情失败，请退出重试', icon: 'none', duration: 1500, mask: true });
    });
  }

  // 执行支付倒计时
  startCountdown = () => {
    clearInterval(this.state.timer);
    // 当订单不是待付款状态，取消倒计时
    if (this.state.orderDetail.status !== 0) {
      return;
    }
    // 获取订单结束时间的时间戳(秒)
    const orderEndTime = moment(this.state.orderDetail.endtime).unix();
    let now = moment().unix() + 2; // 延长两秒
    //  当订单付款时间没到，启动定时器
    if (orderEndTime > now) {
      let timer = setInterval(() => {
        now = moment().unix() + 2;
        if (orderEndTime > now) {
          let diffTime = orderEndTime - now;
          this.setState({
            orderTime: moment.unix(diffTime).format('mm分ss秒')
          });
        } else {
          clearInterval(this.state.timer);
          this.setState({
            orderDetail: {
              ...this.state.orderDetail,
              status: -1
            }
          });
        }
      }, 1000);
      this.setState({timer});
    } else {
      // 如果订单付款时间过了，改变订单状态，清除定时器
      clearInterval(this.state.timer);
      this.setState({
        orderDetail: {
          ...this.state.orderDetail,
          status: -1
        }
      });
    }
  }

  // 重新发起支付
  rePay = () => {
    if (this.state.timer) {
      clearInterval(this.state.timer);
    }
    let orderInfo = {
      order_id: this.state.orderDetail.order_id,
      bid: this.state.orderDetail.bid,
      protype: this.state.orderDetail.protype
    };
    this.props.onCalcTotalPrice(this.state.orderDetail.totalprice);
    pay(orderInfo, this.state.orderDetail.train);
  }

  // 去发票页
  toInvoice = () => {
    Taro.navigateTo({
      url: `/pages/order/invoice/invoice` +
        `?billId=${this.state.orderDetail.bid}` +
        `&isInvoice=${this.state.orderDetail.is_invoice}` +
        `&price=${this.state.orderDetail.totalprice}`
    });
  }

  render () {
    const { orderDetail } = this.state;

    // 计算商品数量
    let totalNum = 0;
    let orderList = orderDetail['orderlist'] || [];
    orderList.forEach(goods => {
      totalNum += goods.num;
    });

    return (
      <View className='order-detail'>
          <View className='header'>
            {
              this.state.orderDetail.status == 0
              ?
              <Text>{this.state.orderTime}后订单失效</Text>
              :
              <Text></Text>
            }
            <Text className='order-status'>{STATUS_TIP[this.state.orderDetail.status] || '支付超时'}</Text>
          </View>

        <View className='order-info-container'>
          <View className='order-position'>
            <View className='icon'>
              <Image src={positionIcon} />
            </View>
            <View className='position-info'>
              <View className='user-info'>
                <Text>{this.state.orderDetail.username}</Text>
                <Text>{this.state.orderDetail.mobile}</Text>
              </View>
              <View className='train-info'>
                {this.state.orderDetail.address}
              </View>
            </View>
          </View>
          <View className='order-item-container'>
            {
              orderDetail.orderlist.map((item, idx) => {
                return (
                  <View className='order-item' key={idx}>
                    <View className='product-img'>
                      <Image src={item.thumb_img} />
                    </View>
                    <View className='product-info'>
                      <View className='name'>{item.product_name}</View>
                      <View className='price-container'>
                        <Text className='price'>￥{item.price}/份</Text>
                        <Text className='num'>x{item.num}</Text>
                      </View>
                    </View>
                  </View>
                )
              })
            }
            {/* <View className='num-of-tableware'>
              <Text>餐具数量</Text>
              <Text>x{this.state.orderDetail.orderlist.length}</Text>
            </View> */}
          </View>
          <View className='order-info'>
            <View className='title'>订单详情</View>
            {/*<View className='order-info-item'>*/}
            {/*  <Text>商品金额（共{totalNum}件）</Text>*/}
            {/*  <Text className='price'>￥{this.state.orderDetail.totalprice}</Text>*/}
            {/*</View>*/}
            {/*<View className='order-info-item'>*/}
            {/*  <Text>活动优惠</Text>*/}
            {/*  <Text className='price'>-￥{this.state.orderDetail.discount_price}</Text>*/}
            {/*</View>*/}
            <View className='order-info-item'>
              <Text>订单编号</Text>
              <Text>{this.state.orderDetail.ordernumber}</Text>
            </View>
            <View className='order-info-item'>
              <Text>下单时间</Text>
              <Text>{this.state.orderDetail.ordertime}</Text>
            </View>
            <View className='order-info-item'>
              <Text>备注</Text>
              <View>{this.state.orderDetail.memo}</View>
            </View>
            <View className='order-info-item'>
              <Text></Text>
              <View>合计：
                <Text className='price'>
                  ￥{(Math.round(this.state.orderDetail.totalprice * 100) - Math.round(this.state.orderDetail.discount_price * 100)) / 100}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {
          this.state.orderDetail.status == 3 && this.state.orderDetail.is_show_invoice &&
          <View className='invoice-btn-container'>
            <Button className='invoice-btn' onClick={this.toInvoice}>
              {
                this.state.orderDetail.is_invoice
                  ?
                  <Text>查看发票</Text>
                  :
                  <Text>开具发票</Text>
              }
            </Button>
          </View>
        }

        {
          (this.state.orderDetail.pay_status == 0 && this.state.orderDetail.status === 0) &&
          <View className='cart-bar'>
            <CartBar
              isShowCartIcon={false}
              totalNum={totalNum}
              selectedGoodsList={this.state.orderDetail.orderlist}
              totalPrice={(Math.round(this.state.orderDetail.totalprice * 100) - Math.round(this.state.orderDetail.discount_price * 100)) / 100}
              toCreateOrder={this.rePay}
            />
          </View>
        }
      </View>
    )
  }
}
