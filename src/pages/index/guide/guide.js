import Taro, { Component } from '@tarojs/taro'
import { View, Image, Navigator } from '@tarojs/components'

// js
import Utils from "../../../static/js/utils/utils"

// css image
import './guide.scss'
import banner from '../../../static/img/index/guide/banner.png'

class Guide extends Component {

  config = {
    navigationBarTitleText: '订餐指南'
  }

  constructor(props) {
    super(props);
    this.state = {
      processPicInfo: {
        path: '',
        width: 0,
        height: 0
      },
      bannerPicInfo: {
        path: '',
        width: 0,
        height: 0
      },
    }
  }

  componentWillMount () {
    this.getProcessImg();
  }

  componentDidMount () {
  }
  
  getProcessImg = () => {
    Taro.getImageInfo({
      src: 'https://image0.cdn.minicart.cn/shejian_static/process.png'
    }).then(res => {
      this.setState({
        processPicInfo: {
          path: res.path,
          width: res.width,
          height: res.height
        }
      });
    });
  }

  render () {
    const { processPicInfo } = this.state

    return (
      <View className='guide'>
        <View className='title'></View>
        <View className='banner-container'>
          <Image
            src={banner}
            mode='aspectFit'
            className='banner'></Image>
          <View className='mask'></View>
        </View>
        <Navigator className='nav-btn' url='/pages/index/train/train'>立即订餐</Navigator>
        <View className='tip'>文明分享，请勿滥发短信、恶意诱导骚扰其他用户哟！</View>
        <View className='process-container'>
          <Image
            src={processPicInfo.path}
            mode='widthFix'
            style={`width: ${processPicInfo.width}rpx;height: ${processPicInfo.height}rpx`}
          >
          </Image>
        </View>
      </View>
    )
  }
}

export default Guide
