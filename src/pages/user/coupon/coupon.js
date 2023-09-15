import Taro, { Component } from '@tarojs/taro'
import { View, Image, ScrollView, Text, Navigator } from '@tarojs/components'
import { AtTabs, AtTabsPane } from 'taro-ui'

// css img
import './coupon.scss'
import conpon1 from '../../../static/img/user/coupons/coupon_1.png'
import conpon2 from '../../../static/img/user/coupons/coupon_2.png'
import conponOverdue from '../../../static/img/user/coupons/coupon_overdue.png'
import conponUsed from '../../../static/img/user/coupons/coupon_used.png'

class Coupon extends Component {

  config = {
    navigationBarTitleText: '优惠券',
    navigationBarBackgroundColor: '#FFFFFF',
  }

  constructor(props) {
    super(props);
    this.state = {
      current: 0
    }
  }

  componentWillMount () { }

  componentDidMount () { }

  // 切换tab页
  changeTab = (idx) => {
    this.setState({ current: idx });
  }

  render () {
    const tabList = [
      { title: '未使用' },
      { title: '已失效' },
    ];

    return (
      <View className='coupon'>
        <AtTabs current={this.state.current} tabList={tabList} onClick={this.changeTab}>
          <AtTabsPane current={this.state.current} index={0} >
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
                  <View className='right'>立即使用</View>
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
                  <View className='right'>立即使用</View>
                </View>
              </View> */}
              <View className='no-more'>- 没有更多记录了 -</View>
            </ScrollView>
          </AtTabsPane>
          <AtTabsPane current={this.state.current} index={1}>
            <ScrollView className='coupon-list-container' scrollY>
              {/* <View className='coupon-item'>
                <Image src={conponUsed} mode='aspectFit' className='coupon-image'></Image>
                <View className='coupon-desc failure'>
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
                  <View className='right'></View>
                </View>
              </View>
              
              <View className='coupon-item'>
                <Image src={conponOverdue} mode='aspectFit' className='coupon-image'></Image>
                <View className='coupon-desc failure'>
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
                  <View className='right'></View>
                </View>
              </View> */}
              <View className='no-more'>- 没有更多记录了 -</View>
            </ScrollView>
          </AtTabsPane>
        </AtTabs>

        {/* <View className='bottom-bar'>
          <Text>想要更多优惠券？快去邀请好友注册吧</Text>
          <Navigator className='invition-btn' url='/pages/user/invite/invite'>立即邀请</Navigator>
        </View> */}
      </View>
    )
  }
}

export default Coupon
