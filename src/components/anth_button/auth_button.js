import Taro, { Component } from '@tarojs/taro'
import { View, Button } from '@tarojs/components'
import { connect } from '@tarojs/redux'

// redux
import { onChangeAuthType, onSetUserInfo } from '../../store/actions/action'

// css 
import './auth_button.scss'

@connect(({reducers}) => (
  {...reducers}
), (dispatch) => ({
  onChangeAuthType (payload) {
    dispatch(onChangeAuthType(payload));
  },
  onSetUserInfo (payload) {
    dispatch(onSetUserInfo(payload));
  },
}))
class AuthButton extends Component {

  constructor(props) {
    super(props);
  }

  componentWillMount () {
  }

  componentDidMount () { }

  getUserInfo = (e) => {
    e.stopPropagation();
    if (Taro.getEnv() === 'ALIPAY') {
      my.getOpenUserInfo({
        fail: () => {
          Taro.showToast({title: '获取用户信息失败', icon: 'none', duration: 1500, mask: true});
        },
        success: (res) => {
          let userInfo = JSON.parse(res.response).response // 以下方的报文格式解析两层 response
          userInfo['avatarUrl'] = userInfo.avatar;
          this.props.onSetUserInfo(userInfo);
          this.props.onAfterAuthorized();
          this.props.onChangeAuthType(false);
        }
      });
    } else {
      if (e.detail['userInfo']) {
        this.props.onAfterAuthorized();
        this.props.onSetUserInfo(e.detail.userInfo);
        this.props.onChangeAuthType(false);
      }
    }
  }

  render () {
    return (
      <View className='autn-button'>
        {
          Taro.getEnv() === 'ALIPAY'
          ?
          <Button className='btn' openType='getAuthorize' scope='userInfo' onGetAuthorize={this.getUserInfo}></Button>
          :
          <Button className='btn' openType='getUserInfo' onGetUserInfo={this.getUserInfo}></Button>
        }
      </View>
    )
  }
}

AuthButton.defaultProps = {
  onAfterAuthorized(e) {
    return e;
  }
}

export default AuthButton
