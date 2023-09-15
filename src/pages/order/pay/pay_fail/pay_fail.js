import Taro, { Component } from '@tarojs/taro'
import { View, Image, Button } from '@tarojs/components'
import { connect } from '@tarojs/redux'


// js
import { request, getUrl, GET_ORDER_DETAIL } from '../../../../static/js/api'
import pay from '../../../../static/js/pay/pay'
import { onResetGoodsAndPrice, onCalcTotalPrice } from "../../../../store/actions/action";

// css img
import './pay_fail.scss'
import failIcon from '../../../../static/img/order/pay_fail.png'

@connect(({ reducers }) => (
  { ...reducers }
), (dispatch) => ({
  onResetGoodsAndPrice(payload) {
    dispatch(onResetGoodsAndPrice(payload));
  },
  onCalcTotalPrice(payload) {
    dispatch(onCalcTotalPrice(payload));
  }
}))
export default class PaySuccess extends Component {

  config = {
    navigationBarTitleText: '支付失败'
  }

  constructor(props) {
    super(props);
  }

  componentWillMount () {
  }

  componentDidMount () { }

  toOrderList = () => {
    this.props.onResetGoodsAndPrice();
    Taro.switchTab({url: '/pages/order/order'});
  }

  rePay = () => {
    Taro.showLoading({ mask: true, title: '加载中...' });
    request({
      url: getUrl(GET_ORDER_DETAIL),
      data: {
        order_id: this.$router.params.orderId
      }
    }).then(res => {
      if (res.error_code === 'ok') {
        let orderInfo = {
          bid: res.data.bid,
          order_id: res.data.order_id,
          protype: res.data.protype
        }
        pay(orderInfo, res.data.train);
      } else {
        Taro.showToast({ title: res.msg, icon: 'none', duration: 1500, mask: true });
      }
    }).catch(() => Taro.showToast({ title: '获取订单详情失败，请重试', icon: 'none', duration: 1500, mask: true }))
  }

  render () {
    return (
      <View className='pay-fail'>
        <Image src={failIcon} className='fail-icon' />
        <View className='tip'>很抱歉,支付失败!</View>
        <View>
          <Button className='btn order' onClick={this.toOrderList}>查看订单</Button>
          <Button className='btn pay' onClick={this.rePay}>重新支付</Button>
        </View>
      </View>
    )
  }
}
