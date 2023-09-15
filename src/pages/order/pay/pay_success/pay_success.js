import Taro, { Component } from '@tarojs/taro'
import { View, Image, Button, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import moment from 'moment'

// redux
import { onResetGoodsAndPrice } from '../../../../store/actions/action'

// css img
import './pay_success.scss'
import successIcon from '../../../../static/img/order/pay_success.png'

@connect(({ reducers }) => (
  { ...reducers }
), (dispatch) => ({
  onResetGoodsAndPrice(payload) {
    dispatch(onResetGoodsAndPrice(payload));
  }
}))
export default class PaySuccess extends Component {

  config = {
    navigationBarTitleText: '支付成功'
  }

  constructor(props) {
    super(props);
  }

  componentWillMount () {
  }

  componentDidMount () { }

  backToIndex = () => {
    this.props.onResetGoodsAndPrice();
    Taro.switchTab({url: '/pages/index/index'});
  }

  toOrderList = () => {
    this.props.onResetGoodsAndPrice();
    Taro.switchTab({url: '/pages/order/order'});
  }

  render () {
    return (
      <View className='pay-success'>
        <Image src={successIcon} className='success-icon' />
        <View className='tip'>订单已经支付成功!</View>
        <View className='sub-tip'>感谢您的购买!</View>
        <View className='pay-info'>
          <View className='price'>支付金额：<Text>￥{this.props.totalPrice}</Text></View>
          <View className='time'>支付时间：<Text>{moment().format('YYYY-MM-DD HH:mm:ss')}</Text></View>
        </View>
        <View>
          <Button className='btn back' onClick={this.backToIndex}>返回首页</Button>
          <Button className='btn order' onClick={this.toOrderList}>查看订单</Button>
        </View>
      </View>
    )
  }
}
