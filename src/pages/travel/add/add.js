import Taro, { Component } from '@tarojs/taro'
import {Image, Text, View, Button, ScrollView} from "@tarojs/components"

// css image
import './add.scss'
import scanIcon from '../../../static/img/travel/scan.png'
import switchIcon from '../../../static/img/travel/switch.png'

export default class Add extends Component {
  
  config = {
    navigationBarTitleText: '添加行程'
  }
  
  constructor(props) {
    super(props);
    this.state = {
      addType: 1,
      startStation: '广州',
      endStation: '武汉'
    }
  }
  
  componentDidMount () {
  
  }
  
  changeAddType = () => {
    if (this.state.addType === 1) {
      this.setState({ addType: 2 });
    } else {
      this.setState({ addType: 1 });
    }
  }
  
  render() {
    return (
      <View className='add'>
        <View className='tab-container'>
          <View
            className={`tab-item left ${this.state.addType === 1 ? 'active' : ''}`}
            onClick={this.changeAddType}
          >
            车次查询
          </View>
          <View
            className={`tab-item right ${this.state.addType === 2 ? 'active' : ''}`}
            onClick={this.changeAddType}
          >
            站站查询
          </View>
        </View>
        <View className='content-container'>
          {
            this.state.addType === 1 &&
            <View className='content-item'>
              <View className='train'>
                <View className='name'>车次号</View>
                <View className='input placeholder'>例如：G9</View>
              </View>
              <View className='scan'>
                <Image src={scanIcon} mode='aspectFit' className='scan-icon' />
                <View>扫火车票</View>
              </View>
            </View>
          }
          {
            this.state.addType === 2 &&
            <View className='content-item'>
              <View className='station start'>
                <View className='title'>出发地</View>
                <View className='name'>{this.state.startStation}</View>
              </View>
              <Image src={switchIcon} mode='aspectFit' className='switch-icon' />
              <View className='station end'>
                <View className='title'>目的地</View>
                <View className='name'>{this.state.endStation}</View>
              </View>
            </View>
          }
          <View className='content-item'>
            <View className='date'>
              <View className='name'>出发日期</View>
              <View className='input'>
                <Text>01月09日</Text>
                <Text>星期四</Text>
                <Text className='today'>今天</Text>
              </View>
            </View>
          </View>
          <View className='history'>
            <ScrollView className='history-container' scrollX>
              <View className='history-item'>武汉-北京</View>
              <View className='history-item'>武汉-北京</View>
              <View className='history-item'>武汉-北京</View>
            </ScrollView>
            <View className='reset'>清空</View>
          </View>
        </View>
        <Button className='travel-btn'>查询</Button>
      </View>
    )
  }
  
}
