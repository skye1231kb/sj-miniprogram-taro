import Taro, { Component } from "@tarojs/taro";
import { Text, View, Image } from "@tarojs/components";

// js
import { request, getUrl, GET_HISTORY_SCHEDULE_LIST } from "../../../static/js/api";

// css
import './history.scss'

export default class History extends Component {
  
  config = {
    navigationBarTitleText: '历史行程'
  }
  
  constructor(props) {
    super(props);
    this.state = {
      scheduleHistoryList: []
    }
  }
  
  componentDidMount() {
    this.getScheduleHistoryList();
  }
  
  // 获取行程列表
  getScheduleHistoryList = () => {
    request({
      url: getUrl(GET_HISTORY_SCHEDULE_LIST)
    }).then(res => {
      if (res.code === 1) {
        this.setState({ scheduleHistoryList: res.data });
      } else {
        Taro.showToast({title: res.message, icon: 'none', duration: 1500, mask: true});
      }
    }).catch(() => Taro.showToast({title: '获取行程列表失败', icon: 'none', duration: 1500, mask: true}));
  }
  
  render() {
    return (
      <View className='history'>
        <View className='cate-title'>
          <Text className='cate'>今天</Text>
          <Text className='date'>12月31日 星期二</Text>
        </View>
        <View className='travel-container'>
          <View className='title'>
            <View className='travel-time'>全程3小时18分钟</View>
          </View>
          <View className='station-container'>
            <View className='station start'>
              <View className='name'>广州东站</View>
              <View className='time'>18:41</View>
            </View>
            <View className='train'>
              <View className='code'>D7521</View>
              <View className='arrow-icon'></View>
              <View className='type'>和谐号</View>
            </View>
            <View className='station end'>
              <View className='name'>潮汕</View>
              <View className='time'>21:41</View>
            </View>
          </View>
        </View>
      </View>
    )
  }
  
}
