import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'

// css
import './carriage.scss'

export default class Carriage extends Component {

  componentWillMount () { }

  componentDidMount () { }

  render () {
    return (
      <View className={`carriage ${this.props.openCarriage ? 'show' : ''}`}>
        <View className='mask' onClick={this.props.closeCarriage}></View>
        <View className='carriage-select'>
          <View>请选择您所在的车厢范围</View>
          <View className='btn' id='A' onClick={this.props.checkCarriage}>1-8号车厢</View>
          <View className='btn' id='B' onClick={this.props.checkCarriage}>9-16号车厢</View>
        </View>
      </View>
    )
  }
}