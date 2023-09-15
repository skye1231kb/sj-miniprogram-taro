import Taro, { Component } from '@tarojs/taro'
import { View, Text, Button, Video, Input } from '@tarojs/components'
// js

// component

// css image
import img from '@/static/img/video/pexels-photo.jpg'
import './video.scss'

// redux


class VideoPage extends Component {

  config = {
    navigationBarTitleText: 'video'
  }

  constructor(porps) {
    super(porps);
    this.state = {
      showBottom: true,
      praiseActive: false,
      videoPause: false,
      showComment: false,
      commentArr: ['这是第一条评论'],
      commentText: ''
    }
  }

  componentWillMount() {}

  componentDidShow() {}

  componentDidHide() {}

  onShareAppMessage() {
    return {
      title: '分享视频',
      path: '/page/video',
      imageUrl: img
    }
  }

  clickPraise = () => {
    let praiseActive = this.state.praiseActive
    this.setState({
      praiseActive: !praiseActive
    })
  };

  addCart = () => {
    Taro.showToast({
      title: '添加购物车成功',
      icon: 'none',
      duration: 2000
    });
  };

  pauseVideo = () => {
    this.setState({
      videoPause: true
    })
  }

  playVideo = () => {
    if (!this.state.videoPause) return
    let videoContext = Taro.createVideoContext('video')
    videoContext.play()
    this.setState({
      videoPause: false,
      showBottom: false
    })
  }

  commentShow = () => {
    this.setState({
      showComment: true
    })
  }

  inputComment = (e) => {
    this.setState({
      commentText: e.currentTarget.value
    })
  }

  addComment = () => {
    console.log(123)
    let arr = this.state.commentArr
    arr.push(this.state.commentText)
    this.setState({
      commentArr: arr,
      commentText: ''
    })
  }

  bottomHandle = () => {
    let bottom = this.state.showBottom
    this.setState({
      showBottom: !bottom,
      videoPause: false,
      showComment: false
    })
    if (!this.state.videoPause) return
    let videoContext = Taro.createVideoContext('video')
    videoContext.play()
  };


  render() {
    return (
      <View>
        <Video
          id='video'
          className='video' // src={videoSrc}
          src='http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400'
          controls={!this.state.showBottom}  // 控制按钮
          autoplay // 自动播放
          loop // 循环播放
          showPlayBtn // 底部播放按钮
          showCenterPlayBtn
          showFullscreenBtn={false}
          object-fit='contain'
          onClick={this.bottomHandle} // 全屏按钮
          onPause={this.pauseVideo}
          onPlay={this.playVideo}
        />
        {this.state.videoPause && <View className='play-btn' onClick={this.playVideo}>
          播放
        </View>}

        {this.state.showBottom && <View className='bottom-menu'>
          <Text className='video-title'>视频标题</Text>
          <View className='goods' onClick={this.addCart}>
            商品链接
          </View>
          <View className='button-list'>
            <View className={`praise ${this.state.praiseActive && 'active'}`} onClick={this.clickPraise}>
              点赞
            </View>
            <View className='comment' onClick={this.commentShow}>
              评论
            </View>
            <Button className='share' openType='share'>
              分享
            </Button>
          </View>
        </View>}

        <View className={`comment-box ${this.state.showComment && 'active'}`}>
          <View className='comment-list'>
            {this.state.commentArr.map((item, index) => <Text className='comment-item' key={index + '1'}>{item}</Text>)}
          </View>
          <View className='comment-content'>
            <Input
              type='text'
              placeholder='请输入评论内容'
              placeholderClass='comment-input-placeholder'
              className='comment-input'
              value={this.state.commentText}
              onInput={this.inputComment}
            />

            <Text className='comment-submit' onClick={this.addComment}>提交</Text>
          </View>
          <View className='close-comment' onClick={this.bottomHandle}>
            关闭
          </View>
        </View>
      </View>
    )
  }
}

export default VideoPage;
