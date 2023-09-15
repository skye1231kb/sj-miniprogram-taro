import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtCalendar, AtIcon } from 'taro-ui'

// js
import moment from 'moment'

// css image
import './date_picker.scss'

export default class DatePicker extends Component {

  config = {
    navigationBarTitleText: '选择乘车日期'
  }

  constructor(props) {
    super(props);
    this.state = {
      minDate: moment().subtract(5, 'day'),
      maxDate: Date.now()
    }
  }

  componentWillMount () { }

  componentDidMount () { }

  onDayClick = (e) => {
    console.log(e.value);
  }

  render () {
    return (
      <View className='date-picker'>
        <View className='tip-container'>
          <AtIcon value='alert-circle' size='15' color='#959595'></AtIcon>
          <Text className='tip-text'>请选择火车票面上的日期</Text>
        </View>
        <AtCalendar 
          minDate={this.state.minDate} 
          maxDate={this.state.maxDate} 
          isSwiper={false} 
          hideArrow
          onDayClick={this.onDayClick}
        >
        </AtCalendar>
      </View>
    )
  }
}