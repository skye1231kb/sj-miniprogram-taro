import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Button } from '@tarojs/components'

// css img
import './invite.scss'
import wechatIcon from '../../../static/img/user/invite/wechat.png'
import photoIcon from '../../../static/img/user/invite/photo.png'
import circleIcon from '../../../static/img/user/invite/circle.png'
import inviteBg from '../../../static/img/user/invite/invite_bg.png'

class Invite extends Component {

  config = {
    navigationBarTitleText: '邀请有礼',
    navigationBarBackgroundColor: '#FFFFFF',
  }

  componentWillMount () { }

  componentDidMount () { }

  render () {
    return (
      <View className='invite'>
        <View className='content'>
          <Image className='bg-img' src={inviteBg} mode='widthFix'></Image>
        </View>

        <View className='qrcode-container'>
          <Image className='qrcode'></Image>
          <View>
            <View>在微信长按识别二维码</View>
            <View>注册立享新人专属优惠</View>
          </View>
        </View>

        <View className='bottom-bar'>
            <Button openType='share' className='bar-btn-container'>
              <View className='bar-item'>
                <Image className='icon' src={wechatIcon} mode='aspectFit'></Image>
                <Text>发给好友</Text>
              </View>
            </Button>
          {/* <View className='bar-item'>
            <Image className='icon' src={circleIcon} mode='aspectFit'></Image>
            <Text>朋友圈</Text>
          </View> */}
          <View className='bar-item'>
            <Image className='icon' src={photoIcon} mode='aspectFit'></Image>
            <Text>保存图片</Text>
          </View>
        </View>
      </View>
    )
  }
}

export default Invite