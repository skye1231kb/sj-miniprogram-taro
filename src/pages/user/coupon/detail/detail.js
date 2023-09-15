import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Button } from '@tarojs/components'

// css
import './detail.scss'

class Detail extends Component {

  config = {
    navigationBarTitleText: '详情',
    navigationBarBackgroundColor: '#FFFFFF',
  }

  componentWillMount () { }

  componentDidMount () { }

  render () {
    return (
      <View className='detail exchange'>
        <View className='banner-container'>
          {/* <Image className='coupon-banner' mode='aspectFit'></Image> */}
        </View>
        <View className='content'>
          <View className='integral'>
            <Text className='num'>100</Text>
            <Text>积分</Text>
          </View>
          <View className='desc'>全场商品4折优惠券</View>
        </View>

        {/* <View className='btn-container'>
          <Button className='btn'>立即使用</Button>
        </View> */}

        <View className='bottom-btn-container'>
          <View className='amount'>
            <View>支付：200积分</View>
            <Text className='balance lack'>余额：900积分</Text>
          </View>
          <View className='btn disabled'>立即兑换</View>
        </View>
      </View>
    )
  }
}

export default Detail