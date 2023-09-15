import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtTabs } from 'taro-ui'

// js
import moment from 'moment'
import { request, getUrl, GET_MEMBER_POINTS_LIST } from '../../../../static/js/api'

// css
import './detail.scss'

class Detail extends Component {

  config = {
    navigationBarTitleText: '积分明细',
    navigationBarBackgroundColor: '#FFFFFF'
  }

  constructor(props) {
    super(props);
    this.state = {
      currentTab: 0,
      page: 1,
      type: 0,
      pointList: [],
      isShowNoMore: false
    }
  }

  componentWillMount () {
    this.getMemberPointsList();
  }

  componentDidMount () { }

  // 获取积分列表
  getMemberPointsList = () => {
    request({
      url: getUrl(GET_MEMBER_POINTS_LIST),
      data: {
        page: this.state.page,
        type: this.state.type
      }
    }).then(res => {
      if (res.error_code == 'ok') {
        let pointList = [...this.state.pointList, ...res.data];
        this.setState({ 
          pointList,
          isShowNoMore: res.data.length < 10
        });
      } else {
        Taro.showToast({ title: res.msg, icon: 'none', duration: 1500, mask: true });
      }
    }).catch(() => {
      Taro.showToast({ title: '获取历史积分列表失败', icon: 'none', duration: 1500, mask: true });
    });
  }

  // 切换tab
  changeTab = value => {
    this.setState({
      currentTab: value,
      page: 1,
      type: value,
      pointList: []
    }, () => {
      this.getMemberPointsList();
    });
  }

  // 上拉加载更多
  onReachBottom = () => {
    if (this.state.isShowNoMore) {
      return;
    }
    this.setState({ page: this.state.page + 1 }, () => {
      this.getMemberPointsList();
    });
  }

  render () {
    const tabList = [
      { title: '全部' },
      { title: '获得' },
      { title: '消耗' },
    ]

    return (
      <View className='detail'>
        <View className='tab-container'>
          <AtTabs current={this.state.currentTab} tabList={tabList} onClick={this.changeTab}></AtTabs>
        </View>
        
        <View className='integral-list'>
          {
            this.state.pointList.map((point, i) => {
              return (
                <View className='integral-item' key={i}>
                  <View className='desc'>
                    <View className='content'>{point.remark}</View>
                    <View className='date'>{moment(point.create_time).format('YYYY.MM.DD')}</View>
                  </View>
                  <View className='num'>
                    {
                      point.type == 1
                      ? '+'
                      : '-'
                    }
                    {point.points}
                  </View>
                </View>
              )
            })
          }
        </View>
        {
          this.state.isShowNoMore &&
          <View className='no-more'>- 没有更多记录了 -</View>
        }
      </View>
    )
  }
}

export default Detail