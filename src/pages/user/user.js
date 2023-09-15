import Taro, { Component } from '@tarojs/taro'
import { View, Image, Navigator, Button } from '@tarojs/components'
import { connect } from '@tarojs/redux'

// js
import Utils from "../../static/js/utils/utils"
import { request, getUrl, MEMBER_INFO } from '../../static/js/api'

// css img
import './user.scss'
import banner from '../../static/img/user/banner.png'
import avatarIcon from '../../static/img/user/avatar.png'
import setRight from '../../static/img/user/set_right.png'
import integralIcon from '../../static/img/user/integral-icon.png'
import mallIcon from '../../static/img/user/mall-icon.png'
import couponsIcon from '../../static/img/user/coupons-icon.png'
import invitationIcon from '../../static/img/user/invitation_icon.png'
import signInIcon from '../../static/img/user/sign_in_icon.png'
import newGiftBagImg from '../../static/img/user/new_gift_bag.png'
import advertImg from '../../static/img/user/advert.png'
import payToFaceIcon from '../../static/img/user/pay_to_face_icon.png'
import serviceIcon from '../../static/img/user/service.png'

// component
import AuthButton from '../../components/anth_button/auth_button'
import ContractButton from '../../components/contract_button/contract_button'


// redux
import { onSetUserInfo } from '../../store/actions/action'

const APP = Taro.getApp();

@connect(({ reducers }) => ({
  ...reducers
}), (dispatch) => ({
  onSetUserInfo(payload) {
    dispatch(onSetUserInfo(payload));
  }
}))
export default class User extends Component {

  config = {
    navigationBarTitleText: '用户中心',
    navigationBarBackgroundColor: '#FFFFFF'
  }

  constructor(props) {
    super(props);
    this.state = {
    }
  }

  componentWillMount() {
  }

  componentDidMount() { }
  
  componentDidShow() {
    this.getUserInfo();
  }
  
  // 获取用户信息
  getUserInfo = () => {
    request({
      url: getUrl(MEMBER_INFO)
    }).then(res => {
      if (res.error_code === 'ok') {
        let userInfo = {
          avatarUrl: res.data.memberInfo.avatar,
          mobile: res.data.memberInfo.mobile,
          nickName: res.data.memberInfo.nickname,
        };
        this.props.onSetUserInfo(userInfo);
      } else {
        Taro.showToast({ title: res.msg, icon: 'none', duration: 1500, mask: true })
      }
    });
  }
  
  toUserInfo = () => {
    if (this.props.isShowAuthButton || Utils.isAliPay())  {
      return;
    }
    Taro.navigateTo({ url: '/pages/user/info/info' });
  }

  toFacePay = () => {
    Taro.navigateTo({ url: '/pages/order/pay/face_pay/face_pay' });
  }

  // 优惠券事件埋点
  toCoupon = (e, eventName) => {
    if (Utils.isWeApp()) {
      const H = Utils.getCurrentDateRangeForHour();
      APP.aldstat.sendEvent(eventName, H);
    }
  }

  render() {
    return (
      <View className='user'>
        <View className='header'>
          <Image className='bg-banner' src={banner} />
          {/* 用户信息 */}
          <View className='user-info' onClick={this.toUserInfo}>
            <View className='user-info-container'>
              {
                this.props.isShowAuthButton
                  ? <AuthButton onAfterAuthorized={this.getUserInfo}></AuthButton>
                  : ''
              }
              {
                (!this.props.isShowAuthButton && this.props.userInfo.avatarUrl)
                  ?
                  <Image className='user-avatar' src={this.props.userInfo.avatarUrl} />
                  :
                  <Image className='user-avatar' src={avatarIcon} />
              }
              <View>
                {
                  (!this.props.isShowAuthButton && this.props.userInfo.nickName)
                    ?
                    <View className='username'>{this.props.userInfo.nickName}</View>
                    :
                    <View className='username'>登录/注册</View>
                }
                {
                  !this.props.isShowAuthButton && this.props.userInfo.nickName && this.props.userInfo.mobile &&
                  <View className='mobile'>{this.props.userInfo.mobile}</View>
                }
                {
                  this.props.isShowAuthButton &&
                  <View className='mobile'>登录后有机会享受更多好礼哦~</View>
                }
              </View>
            </View>
            {
              this.props.isShowAuthButton || Utils.isAliPay()
              ? ''
              :
              <View className='set-right'>
                <Image src={setRight} mode='aspectFit' />
              </View>
            }
          </View>
          {
            Utils.isWeApp() &&
            <Button
              className='service-container'
              openType='contact'
              sessionFrom={`nickName=${this.props.userInfo.nickName}|avatarUrl=${this.props.userInfo.avatarUrl}`}
            >
              <Image src={serviceIcon} mode='aspectFit' className='service' />
            </Button>
          }
          {
            Utils.isAliPay() &&
            <ContractButton />
          }
        </View>

        {/* 菜单项 */}
        <View className='menu-container'>
          <View className='main-menu-container'>
            <Navigator url='/pages/undeveloped/undeveloped'>
              <View className='main-menu-item'>
                <Image src={mallIcon} mode='aspectFit' className='integral' />
                <View className='desc'>优品商城</View>
              </View>
            </Navigator>
            <View className='separated'></View>
            <Navigator url='/pages/user/integral/integral'>
              <View className='main-menu-item'>
                <Image src={integralIcon} mode='aspectFit' className='mall'></Image>
                <View className='desc'>我的积分</View>
              </View>
            </Navigator>
            <View className='separated'></View>
            <Navigator
              className='main-menu-item'
              url='/pages/user/coupon/coupon'
              onClick={e => this.toCoupon(e, '个人中心-优惠券')}
            >
              <Image src={couponsIcon} mode='aspectFit' className='coupons'></Image>
              <View className='desc'>优惠券</View>
            </Navigator>
          </View>
          {/* <View className='secondary-menu-container'>
            <Navigator url='/pages/user/integral/integral'>
              <View className='secondary-menu-item'>
                <View className='title'>
                  <View>每日签到</View>
                  <View className='desc'>积分兑好礼</View>
                </View>
                <Image className='menu-icon' src={signInIcon} mode='aspectFit'></Image>
              </View>
            </Navigator>
            <View className='separated'></View>
            <View className='secondary-menu-item'>
              <View className='title'>
                <View>邀请有礼</View>
                <View className='desc'>邀请领好礼</View>
              </View>
              <Image className='menu-icon' src={invitationIcon} mode='aspectFit'></Image>
            </View>
          </View> */}
          {/* <View className='new-gift-bag'>
            <Image src={newGiftBagImg} mode='aspectFit'></Image>
          </View> */}
          <Navigator className='advert-container' url='/pages/index/train/train'>
            <Image src={advertImg} mode='aspectFit'></Image>
          </Navigator>
        </View>

        <Image className='pay-to-face' src={payToFaceIcon} mode='aspectFit' onClick={this.toFacePay}></Image>
      </View>
    )
  }
}
