import Taro, { Component } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'

// css img
import './undeveloped.scss'
import developing from '../../static/img/undeveloped/developing.png'

class Undeveloped extends Component {

  config = {
    navigationBarTitleText: '暂未开放',
    navigationBarBackgroundColor: '#FFFFFF'
  }

  componentWillMount () { }

  componentDidMount () { }

  render () {
    return (
      <View className='undeveloped'>
        <Image src={developing} mode='widthFix' className='developong-img'></Image>
        <View>功能正在完善中，敬请期待！</View>
      </View>
    )
  }
}

export default Undeveloped