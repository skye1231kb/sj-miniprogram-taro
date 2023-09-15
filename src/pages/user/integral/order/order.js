import Taro, { Component } from '@tarojs/taro'
import { View, ScrollView, Image, Text, Navigator } from '@tarojs/components'
import { AtTabs, AtTabsPane } from 'taro-ui'

// css img
import './order.scss'
import conpon1 from '../../../../static/img/user/coupons/coupon_1.png'
import conpon2 from '../../../../static/img/user/coupons/coupon_2.png'

class Order extends Component {

  config = {
    navigationBarTitleText: '积分订单',
    navigationBarBackgroundColor: '#FFFFFF',
  }

  constructor(props) {
    super(props);
    this.state = {
      currentTab: 0
    }
  }

  componentWillMount () { }

  componentDidMount () { }

  // 切换tab
  changeTab = value => {
    this.setState({ currentTab: value });
  }

  render () {
    const tabList = [
      { title: '优惠券' },
      { title: '商品' },
    ]

    return (
      <View className='order'>
        <AtTabs current={this.state.currentTab} tabList={tabList} onClick={this.changeTab}>
          <AtTabsPane current={this.state.currentTab} index={0}>
            <ScrollView className='coupon-list-container' scrollY>
              {/* <View className='coupon-item'>
                <Image src={conpon1} mode='aspectFit' className='coupon-image'></Image>
                <View className='coupon-desc'>
                  <View className='left'>
                    <View className='denomination-container'>
                      <View className='denomination'>
                        <Text className='symbol'>￥</Text>
                        <Text className='price'>10</Text>
                      </View>
                      <View className='condition'>满20可用</View>
                    </View>
                    <View className='desc-container'>
                      <View className='name'>优惠券名称</View>
                      <View className='scope'>指定商品</View>
                      <View className='date'>2019.08.07-2019.12.12</View>
                    </View>
                  </View>
                  <Navigator className='right' url='/pages/user/coupon/detail/detail'>查看详情</Navigator>
                </View>
              </View>

              <View className='coupon-item'>
                <Image src={conpon2} mode='aspectFit' className='coupon-image'></Image>
                <View className='coupon-desc'>
                  <View className='left'>
                    <View className='denomination-container discount'>
                      <View className='denomination'>
                        <Text className='price'>4</Text>
                        <Text className='symbol'>折</Text>
                      </View>
                    </View>
                    <View className='desc-container'>
                      <View className='name'>优惠券名称</View>
                      <View className='scope'>全场商品</View>
                      <View className='date'>2019.08.07-2019.12.12</View>
                    </View>
                  </View>
                  <View className='right'>查看详情</View>
                </View>
              </View> */}
              <View className='no-more'>- 没有更多记录了 -</View>
            </ScrollView>
          </AtTabsPane>

          <AtTabsPane current={this.state.currentTab} index={1}>
            <View className='no-more'>- 没有更多记录了 -</View>
          </AtTabsPane>
        </AtTabs>
      </View>
    )
  }
}

export default Order