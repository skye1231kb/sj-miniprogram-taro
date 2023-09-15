import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Navigator, Block } from '@tarojs/components'
import { connect } from '@tarojs/redux'

// js
import moment from 'moment'
import Utils from "../../../static/js/utils/utils"
import { request, getUrl, SIGN_IN, GET_MEMBER_POINTS } from '../../../static/js/api'

// component
import AuthButton from '../../../components/anth_button/auth_button'

// css img
import './integral.scss'
import integralCtxImg from '../../../static/img/user/integral/integral_ctx.png'
import signedIcon from '../../../static/img/user/integral/signed.png'
import orderIcon from '../../../static/img/user/integral/order.png'
import detailIcon from '../../../static/img/user/integral/detail.png'
import activityIcon from '../../../static/img/user/integral/activity.png'
import coupon1 from '../../../static/img/user/integral/coupon_1.png'
import coupon2 from '../../../static/img/user/integral/coupon_2.png'
import coupon3 from '../../../static/img/user/integral/coupon_3.png'
import coupon4 from '../../../static/img/user/integral/coupon_4.png'
import noCouponIcon from '../../../static/img/user/integral/no_coupon.png'

const APP = Taro.getApp();

@connect(({ reducers }) => ({
  ...reducers
}))
class Integral extends Component {

  config = {
    navigationBarTitleText: '我的积分',
    navigationBarBackgroundColor: '#FFFFFF',
  }

  constructor(props) {
    super(props);
    this.state = {
      signData: {},
      initDate: []
    }
  }

  componentWillMount () {
    this.handleInitDate();
    this.getMemberPoints();
  }

  componentDidMount () { }

  // 初始化7天的时间，避免接口数据获取不到
  handleInitDate = () => {
    let initDate = [];
    for (let i = 0; i < 7; i++) {
      initDate.push(moment().add(i, 'd').format('MM.DD'));
    }
    this.setState({ initDate });
  }

  // 获取用户积分详情
  getMemberPoints = () => {
    request({
      url: getUrl(GET_MEMBER_POINTS)
    }).then(res => {
      if (res.error_code == 'ok') {
        this.setState({ signData: res.data });
      } else {
        Taro.showToast({ title: res.msg, icon: 'none', duration: 1500, mask: true });
      }
    }).catch(() => {
      Taro.showToast({ title: '获取积分信息失败', icon: 'none', duration: 1500, mask: true });
    });
  }

  // 签到
  signin = () => {
    if (this.state.signData.is_sign_in || this.props.isShowAuthButton) {
      return;
    } else {
      request({
        url: getUrl(SIGN_IN)
      }).then(res => {
        if (res.error_code === 'ok') {
          Taro.showToast({ title: '签到成功', icon: 'none', duration: 1500, mask: true });
          if (Utils.isWeApp()) {
            const H = Utils.getCurrentDateRangeForHour();
            APP.aldstat.sendEvent('积分签到', H);
          }
          this.getMemberPoints();
        } else {
          Taro.showToast({ title: res.msg, icon: 'none', duration: 1500, mask: true });
        }
      }).catch(() => {
        Taro.showToast({ title: '签到失败', icon: 'none', duration: 1500, mask: true });
      });
    }
  }

  render () {
    const { signData } = this.state;

    return (
      <View className='integral'>
        <View className='integral-container'>
          <Navigator
            className='integral-rules'
            url='/pages/h5/index?path=https://v3it.minicart.cn/html/memberPointsRule.html'
          >
            积分规则
          </Navigator>
          <View className='integral-img-container'>
            <View className='img-wrap'>
              <Image src={integralCtxImg} mode='aspectFit'></Image>
              <View className='sign-ctx' onClick={this.signin}>
                {
                  this.props.isShowAuthButton && <AuthButton onAfterAuthorized={this.getMemberPoints} />
                }
                {
                  signData.is_sign_in
                    ?
                    <Block>
                      <Text>{signData.points}分</Text>
                      <Text className='integral-text'>积分</Text>
                    </Block>
                    :
                    <Text>签到</Text>
                }
              </View>
            </View>
          </View>
        </View>

        {/* 签到天数 */}
        <View className='sign-date-container'>
          <View className='sign-date'>
            <View>已连续签到</View>
            <View>
              <Text className='date'>{signData.sign_in_days}</Text>
              <Text>天</Text>
            </View>
          </View>
          <View className='separated'></View>
          <View className='sign-progress'>
            <View className='date-range'>
              {
                signData && signData.sign_in_next_day_list
                ?
                signData.sign_in_next_day_list.map((date, i) => {
                  if (moment(date.date).isSame(moment(), 'day')) {
                    return (
                      <Text key={i}>今日</Text>
                    )
                  }
                  return (
                    <Text key={i}>{moment(date.date).format('MM.DD')}</Text>
                  )
                })
                :
                this.state.initDate.map((date, i) => {
                  return (
                    <Text key={i}>{date}</Text>
                  )
                })
              }
            </View>
            <View className='sign-item'>
              {
                signData && signData.sign_in_next_day_list
                ?
                signData.sign_in_next_day_list.map((date, i) => {
                  if (
                    moment(date.date).isBefore(signData.last_sign_in_date, 'day')
                    ||
                    moment(date.date).isSame(signData.last_sign_in_date, 'day')
                  ) {
                    return (
                      <View className='sign-dot active' key={i}>
                        <Image src={signedIcon} mode='aspectFit' className='signed'></Image>
                      </View>
                    )
                  }
                  return (
                    <View className='sign-dot' key={i}>
                      <Text>+{date.points}</Text>
                    </View>
                  )
                })
                :
                this.state.initDate.map((date, i) => {
                  return (
                    <View className='sign-dot' key={i}>
                      <Text>+{i + 1}</Text>
                    </View>
                  )
                })
              }
            </View>
          </View>
        </View>
     
        <View className='menu-container'>
          <Navigator url='/pages/user/integral/detail/detail'>
            <View className='menu-item'>
              <Image className='menu-icon' src={detailIcon} mode='aspectFit'></Image>
              <View>积分明细</View>
            </View>
          </Navigator>
          <View className='separated'></View>
          <Navigator url='/pages/user/integral/order/order'>
            <View className='menu-item'>
              <Image className='menu-icon' src={orderIcon} mode='aspectFit'></Image>
              <View>积分订单</View>
            </View>
          </Navigator>
          <View className='separated'></View>
          <Navigator url='/pages/undeveloped/undeveloped'>
            <View className='menu-item'>
              <Image className='menu-icon' src={activityIcon} mode='aspectFit'></Image>
              <View>积分活动</View>
            </View>
          </Navigator>
        </View>

        <View className='coupon-container'>
          <View className='header'>
            <Text>积分兑换</Text>
            {/* <Text className='more'>更多</Text> */}
          </View>
          {/* <View className='coupon-list'>

            <View className='coupon-item'>
              <View className='content'>
                <View className='name'>
                  <View className='range'>指定商品4折</View>
                  <View className='lines'>100积分</View>
                </View>
                <View className='coupon'>
                  <Image className='coupon-icon' src={coupon2} mode='aspectFit'></Image>
                  <View className='desc'>
                    <View>指定商品</View>
                    <View>4折</View>
                  </View>
                </View>
              </View>
            </View>
            
            <View className='coupon-item'>
              <View className='content'>
                <View className='name'>
                  <View className='range'>全场商品4折</View>
                  <View className='lines'>200积分</View>
                </View>
                <View className='coupon'>
                  <Image className='coupon-icon' src={coupon1} mode='aspectFit'></Image>
                  <View className='desc'>
                    <View>全场商品</View>
                    <View>4折</View>
                  </View>
                </View>
              </View>
            </View>
            
            
            <View className='coupon-item'>
              <View className='content'>
                <View className='name'>
                  <View className='range'>指定商品满减50</View>
                  <View className='lines'>200积分</View>
                </View>
                <View className='coupon'>
                  <Image className='coupon-icon' src={coupon3} mode='aspectFit'></Image>
                  <View className='desc'>
                    <View>指定商品</View>
                    <View>满减50</View>
                  </View>
                </View>
              </View>
            </View>
            
            
            <View className='coupon-item'>
              <View className='content'>
                <View className='name'>
                  <View className='range'>全场商品满减50</View>
                  <View className='lines'>200积分</View>
                </View>
                <View className='coupon'>
                  <Image className='coupon-icon' src={coupon4} mode='aspectFit'></Image>
                  <View className='desc'>
                    <View>全场商品</View>
                    <View>满减50</View>
                  </View>
                </View>
              </View>
            </View>

          </View> */}
          <View className='no-coupon'>
            <Image src={noCouponIcon} mode='aspectFit'></Image>
            <Text>暂无可兑换商品</Text>
          </View>
        </View>
      </View>
    )
  }
}

export default Integral
