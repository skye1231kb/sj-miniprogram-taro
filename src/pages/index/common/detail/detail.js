import Taro, { Component } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'

// js
import { COMMON } from '../../../../static/js/common'
import Utils from '../../../../static/js/utils/utils'

// css image
import './detail.scss'

class Detail extends Component {

  config = {
    navigationBarTitleText: '出行常识详情'
  }

  constructor(props) {
    super(props);
    this.state = {
      commonList: COMMON,
      title: '',
      content: [],
      picInfo: {
        path: '',
        width: '',
        height: ''
      }
    }
  }

  componentWillMount () {
    // 处理数组数据
    const id = +this.$router.params.id;
    this.state.commonList.menu.forEach(common => {
      if (common.subtitles.some(item => item.id === id)) {
        this.setState({ title:  common.subtitles.find(menu => menu.id === id).content});
      }
    });
    this.state.commonList.content.forEach(common => {
      if (common.id === id) {
        this.setState({ content: common.text });
      }
    });

    // 获取并处理banner
    Taro.getImageInfo({
      src: 'https://image0.cdn.minicart.cn/shejian_static/common_banner.png'
    }).then(res => {
      if (Utils.isWeApp() && res.errMsg == 'getImageInfo:ok') {
        this.setState({
          picInfo: {
            path: res.path,
            width: res.width,
            height: res.height
          }
        });
      } else {
        this.setState({
          picInfo: {
            path: res.path,
            width: res.width,
            height: res.height
          }
        });
      }
    });
  }

  componentDidMount () { }

  render () {
    const { picInfo } = this.state;

    return (
      <View className='detail'>
        <Image
          src={picInfo.path}
          mode='widthFix'
          className='banner'
          style={`width: ${picInfo.width}rpx;height: ${picInfo.height}rpx`}
        ></Image>
        <View className='title'>{this.state.title}</View>
        {
          this.state.content.map((text, i) => {
            return (
              <View className='content' key={i}>{text}</View>
            )
          })
        }
      </View>
    )
  }
}

export default Detail
