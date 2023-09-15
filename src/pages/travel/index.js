import Taro, { Component } from "@tarojs/taro";
import {Text, View, Image, Navigator} from "@tarojs/components";

// js
import { request, getUrl, GET_SCHEDULE_LIST } from "../../static/js/api";

// css
import './index.scss'

export default class Index extends Component {
  
  config = {
    navigationBarTitleText: '我的行程'
  }
  
  constructor(props) {
    super(props);
    this.state = {
      scheduleList: []
    }
  }
  
  componentDidMount() {
    this.getScheduleList();
  }
  
  // 获取行程列表
  getScheduleList = () => {
    request({
      url: getUrl(GET_SCHEDULE_LIST)
    }).then(res => {
      if (res.code === 1) {
        this.setState({ scheduleList: res.data });
      } else {
        Taro.showToast({title: res.message, icon: 'none', duration: 1500, mask: true});
      }
    }).catch(() => Taro.showToast({title: '获取行程列表失败', icon: 'none', duration: 1500, mask: true}));
  }
  
  render() {
    return (
      <View className='index'>
        {/*<View className='cate-title'>*/}
        {/*  <Text className='cate'>今天</Text>*/}
        {/*  <Text className='date'>12月31日 星期二</Text>*/}
        {/*</View>*/}
        {/*<View className='travel-container'>*/}
        {/*  <View className='title'>*/}
        {/*    <View className='travel-time'>全程3小时18分钟</View>*/}
        {/*    <View className='lave-time'>4小时48分钟后出发</View>*/}
        {/*  </View>*/}
        {/*  <View className='station-container'>*/}
        {/*    <View className='station start'>*/}
        {/*      <View className='name'>广州东站</View>*/}
        {/*      <View className='time'>18:41</View>*/}
        {/*    </View>*/}
        {/*    <View className='train'>*/}
        {/*      <View className='code'>D7521</View>*/}
        {/*      <View className='arrow-icon'></View>*/}
        {/*      <View className='type'>和谐号</View>*/}
        {/*    </View>*/}
        {/*    <View className='station end'>*/}
        {/*      <View className='name'>潮汕</View>*/}
        {/*      <View className='time'>21:41</View>*/}
        {/*    </View>*/}
        {/*  </View>*/}
        {/*  <View className='travel-service'>*/}
        {/*    <View className='ticket-gate'>*/}
        {/*      <View className='name'>检票口</View>*/}
        {/*      <View className='content'>B区B10、B11检票口,A区A10、A11检票口</View>*/}
        {/*    </View>*/}
        {/*    <View className='seat'>*/}
        {/*      <View className='name'>座位</View>*/}
        {/*      <View className='content'>16车21A</View>*/}
        {/*    </View>*/}
        {/*    <View className='operation'>*/}
        {/*      <View className='delete'></View>*/}
        {/*    </View>*/}
        {/*  </View>*/}
        {/*</View>*/}
        {/*<View className='add-icon'></View>*/}
        
        {/*没有行程的时候*/}
        <View className='no-travel-container'>
          <Image className='no-travel-pic' src='../../static/img/travel/no_travel.png' mode='aspectFit' />
          <View className='tip'>暂无行程</View>
          <View className='sub-tip'>添加行程，让出行更效率更贴心</View>
          <Navigator className='add-btn' url='/pages/travel/add/add'>+添加行程</Navigator>
        </View>
        <Navigator className='history' url='/pages/travel/history/history'>更多历史足迹</Navigator>
      </View>
    )
  }
  
}
