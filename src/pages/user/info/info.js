import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, Button } from '@tarojs/components'
import { connect } from '@tarojs/redux'

// js
import Utils from "../../../static/js/utils/utils"
import { request, getUrl, BIND_MOBILE, MEMBER_INFO } from '../../../static/js/api'

// css img
import './info.scss'
import avatarIcon from '../../../static/img/user/avatar.png'
import setRight from '../../../static/img/user/set_right.png'
import setRight2 from '../../../static/img/user/set_right_2.png'

// redux
import { onSetUserInfo } from '../../../store/actions/action'

@connect(({ reducers }) => ({
  ...reducers
}), (dispatch) => ({
  onSetUserInfo(payload) {
    dispatch(onSetUserInfo(payload));
  }
}))
class Info extends Component {

  config = {
    navigationBarTitleText: '我的资料',
    navigationBarBackgroundColor: '#ffd128'
  }

  constructor(props) {
    super(props);
  }

  componentWillMount () {
  }

  componentDidMount () { }

  // 获取用户手机号----微信
  getPhoneNumberForWeChat = e => {
    if (e.detail.errMsg == 'getPhoneNumber:ok') {
      request({
        url: getUrl(BIND_MOBILE),
        data: {
          info: e.detail.encryptedData,
          iv: e.detail.iv
        }
      }).then(res => {
        if (res.error_code == 'ok') {
          request({
            url: getUrl(MEMBER_INFO)
          }).then(userInfo => {
            if (userInfo.error_code == 'ok') {
              let info = {
                avatarUrl: res.data.memberInfo.avatar,
                mobile: res.data.memberInfo.mobile,
                nickName: res.data.memberInfo.nickname,
              };
              this.props.onSetUserInfo(info);
            } else {
              Taro.showToast({ title: userInfo.msg, icon: 'none', duration: 1500, mask: true });
            }
          });
        } else {
          Taro.showToast({ title: res.msg, icon: 'none', duration: 1500, mask: true });
        }
      })
    } else {
      Taro.showToast({ title: '获取手机号失败', icon: 'none', duration: 1500, mask: true });
    }
  }
  
  // 获取用户手机号---支付宝
  getPhoneNumberForAliPay = () => {
    my.getPhoneNumber({
      success(res) {
        console.log(res);
        console.log(JSON.parse(res.response));
      },
      fail() {
        Taro.showToast({ title: '获取手机号失败', icon: 'none', duration: 1500, mask: true });
      }
    })
  }

  render () {
    return (
      <View className='info'>
        <View className='info-item avatar'>
          <Image
            src={this.props.userInfo.avatarUrl ? this.props.userInfo.avatarUrl : avatarIcon}
            mode='aspectFit'
            className='avatar-img'
          >
          </Image>
          {/*<Image src={setRight} mode='aspectFit' className='set-right'></Image>*/}
        </View>
        {/*<View className='info-item'>*/}
        {/*  <Text className='title'>真实姓名</Text>*/}
        {/*  <View>*/}
        {/*    <Text>请输入真实姓名</Text>*/}
        {/*    <Image src={setRight2} mode='aspectFit' className='set-right'></Image>*/}
        {/*  </View>*/}
        {/*</View>*/}
        {/*<View className='info-item'>*/}
        {/*  <Text className='title'>生日</Text>*/}
        {/*  <View>*/}
        {/*    <Text>请选择生日</Text>*/}
        {/*    <Image src={setRight2} mode='aspectFit' className='set-right'></Image>*/}
        {/*  </View>*/}
        {/*</View>*/}
        <View className='info-item'>
          <Text className='title'>昵称</Text>
          <View>
            <Text>
              {
                this.props.userInfo.nickName
                ? this.props.userInfo.nickName
                : '请输入昵称'
              }
            </Text>
            {/*<Image src={setRight2} mode='aspectFit' className='set-right'></Image>*/}
          </View>
        </View>
        {/*<View className='info-item'>*/}
        {/*  <Text className='title'>绑定邮箱</Text>*/}
        {/*  <View>*/}
        {/*    <Text>请绑定邮箱</Text>*/}
        {/*    <Image src={setRight2} mode='aspectFit' className='set-right'></Image>*/}
        {/*  </View>*/}
        {/*</View>*/}
        <View className='info-item'>
          <Text className='title'>手机号码</Text>
          <View>
            {
              this.props.userInfo.mobile
              ? <Text>{this.props.userInfo.mobile}</Text>
              : Utils.isWeApp()
                ?
                <Button
                  openType='getPhoneNumber'
                  className='bind-mobile-btn'
                  onGetPhoneNumber={this.getPhoneNumberForWeChat}
                >
                  请绑定手机号码
                </Button>
                :
                <Button
                  openType='getAuthorize'
                  scope='phoneNumber'
                  className='bind-mobile-btn'
                  onGetAuthorize={this.getPhoneNumberForAliPay}
                >
                  请绑定手机号码
                </Button>
            }
            {
              !this.props.userInfo.mobile &&
              <Image src={setRight2} mode='aspectFit' className='set-right'></Image>
            }
          </View>
        </View>
      </View>
    )
  }
}

export default Info
