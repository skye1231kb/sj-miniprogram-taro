import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
// js

// component

// css image
import './live-broadcast.scss'

// redux


class LiveBroadcast extends Component {

  config = {
    navigationBarTitleText: 'live-broadcast'
  }

  constructor(porps) {
    super(porps);
    this.state = {
    }
  }

  componentWillMount() {}

  componentDidShow() {}

  componentDidHide() {}


  render() {
    return (
      <View >

      </View>
    )
  }
}

export default LiveBroadcast;
