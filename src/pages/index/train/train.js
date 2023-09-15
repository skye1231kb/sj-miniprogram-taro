import Taro, { Component } from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import { View, Text, Button, Swiper, SwiperItem, Image } from '@tarojs/components'

// js
import moment from 'moment'
import { request, getUrl, IS_RECONNENTION, ADVERT ,MPID } from '../../../static/js/api'

// css img
import './train.scss'

// component
import TrainKeyboard from '../../../components/train_keyboard/train_keyboard'
import AuthButton from '../../../components/anth_button/auth_button'
import Carriage from '../../../components/carriage/carriage'

// redux
import {
  onChangeAuthType,
  onAddTrain,
  onSetCarriage,
  onChangeIsLink,
  onSetCarriageNum
} from '../../../store/actions/action'

const TRAIN_TYPE = 'zzdc';

@connect(({reducers}) => (
  {...reducers}
), (dispatch) => ({
  onAddTrain (payload) {
    dispatch(onAddTrain(payload));
  },
  onSetCarriage (payload) {
    dispatch(onSetCarriage(payload));
  },
  onSetCarriageNum (payload) {
    dispatch(onSetCarriageNum(payload));
  },
  onChangeIsLink (payload) {
    dispatch(onChangeIsLink(payload));
  },
  onChangeAuthType (payload) {
    dispatch(onChangeAuthType(payload));
  },
}))
class Train extends Component {

  config = {
    navigationBarTitleText: '输入车次信息'
  }

  constructor(props) {
    super(props)
    this.state = {
      showKeyboard: false,
      disabledKT: true,
      currentTab: TRAIN_TYPE,
      isOpenCarriage: false,
      currentTrain: '',
      advertList: []
    }
  }

  componentDidMount() {
    this.getAdvert();
    this.setState({ currentTrain: this.props.train });
  }

  // 获取广告图
  getAdvert = () => {
    request({
      url: getUrl(ADVERT)
    }).then(res => {
      if (res.error_code == 'ok') {
        this.setState({ advertList: res.data });
      } else {
        Taro.showToast({title: '无法获取图片', icon: 'none', duration: 1500});
      }
    }).catch(() => Taro.showToast({title: '无法获取图片', icon: 'none', duration: 1500}));
  }

  // 点击广告位跳转
  toMiniProgram = (e, advert) => {
    const path = advert.ads_path || advert.url;
    if (advert.channel_type == 'h5') {
      Taro.navigateTo({ url: `pages/h5/index?path=${advert.path}` });
    } else {
      Taro.navigateToMiniProgram({
        appId: advert.appid,
        path: path,
        extraData: advert.extraData
      });
    }
  }

  // 隐藏或显示车次键盘
  toggleKeyboard = () => {
    this.setState({
      showKeyboard: !this.state.showKeyboard
    }, () => {
      // 判断键盘是否会阻挡输入框
      if (this.state.showKeyboard) {
        Taro.getSystemInfo().then(res => {
          console.log(res);
        });
      } else {
      
      }
    });
  }

  // 车次键盘输入
  onKeyboardClick = (e) => {
    // 因为确认按钮会覆盖授权按钮，所以有可能获取不到e
    const text = e && e.currentTarget ? e.currentTarget.dataset.text : 'determine';
    const type = e && e.currentTarget ? e.currentTarget.dataset.type : '';
    let train = this.state.currentTrain.split('');
    // 禁用 T/K
    if (text === 'T' || text === 'K') {
      return;
    }
    // 点击了确认按钮
    if (text === 'determine') {
      this.toggleKeyboard();
      this.isLink();
      return;
    }
    // 点击了重输按钮
    if (text === 'reset') {
      this.setState({ currentTrain: '' });
      return;
    }
    // 点击了回退按钮
    if (text === 'back') {
      if (!train.length) return;
      train.pop();
      this.setState({ currentTrain: train.join('') });
      return;
    }
    // 输入车次
    if (type === 'code') {
      if (/[A-Z]/.test(this.state.currentTrain)) {
        train[0] = text;
      } else {
        train.unshift(text);
      }
    } else {
      // 限制输入车次的字符长度
      if (train.length >= 6) {
        return;
      }
      train.push(text);
    }

    this.setState({ currentTrain: train.join('') });
  }

  // 判断是否为重联车
  isLink = () => {
    this.props.onChangeAuthType(false);
    if (!this.state.currentTrain) {
      Taro.showToast({title: '请输入车次信息', icon: 'none', duration: 1500, mask: true});
      return;
    }
    request({
      url: getUrl(IS_RECONNENTION),
      data: {
        train: this.state.currentTrain,
        date: this.props.date,
        type: this.state.currentTab,
        mp_id: MPID
      }
    }).then(res => {
      if (res.error_code === 'ok') {
        this.props.onAddTrain(this.state.currentTrain);
        this.props.onSetCarriageNum(res.data.carriage_num);
        if (res.data.d_link === 'Y') {
          // 是重连车, 打开车厢选择
          this.props.onChangeIsLink(true);
          this.setState({isOpenCarriage: true});
        } else {
          // 不是重连车
          this.props.onSetCarriage('A');
          Taro.navigateTo({url: '/pages/index/site/site'});
        }
      } else {
        Taro.showToast({title: res.msg, icon: 'none', duration: 1500, mask: true});
      }
    }).catch(() => {
      Taro.showToast({title: '获取车厢失败,请重试', icon: 'none', duration: 1500, mask: true});
    })
  }

  // 选择车厢
  checkCarriage = (e) => {
    this.props.onSetCarriage(e.currentTarget.id);
    Taro.navigateTo({url: '/pages/index/site/site'});
  }

  // 关闭车厢选择
  closeCarriage = () => {
    this.setState({isOpenCarriage: false});
  }

  render () {
    return (
      <View className='train'>
        <Swiper className='banner-container' autoplay circular interval={3000}>
          {
            this.state.advertList.map((advert, i) => {
              return (
                <SwiperItem key={i}>
                  <Image
                    className='banner'
                    mode='widthFix'
                    src={advert.ad_content}
                  >
                  </Image>
                </SwiperItem>
              )
            })
          }
        </Swiper>

        <View className='remake'>- 一路有我 享您所想 -</View>

        <View className='form-container'>
          <View className='form-item date'>
            <View className='icon'></View>
            <Text className='content'>{moment().format('MM月DD日')} 今天</Text>
          </View>
          <View className='form-item train' onClick={this.toggleKeyboard}>
            <View>
              <View className='icon'></View>
              {
                this.state.currentTrain
                ? <Text className='content'>{this.state.currentTrain}</Text>
                : <Text className='content placeholder'>请输入您的车次号，如G998</Text>
              }
            </View>
            {/* <View className='scan-icon'></View> */}
          </View>
        </View>

        <View className='btn-container'>
          {
            this.props.isShowAuthButton
            ? <AuthButton onAfterAuthorized={this.isLink}></AuthButton>
            : ''
          }
          <Button className='btn' onClick={this.isLink}>查看可定美食</Button>
        </View>

        <TrainKeyboard
          isShowKeyboard={this.state.showKeyboard}
          isDisabledKT={this.state.disabledKT}
          keyboardClick={this.onKeyboardClick}
          maskClick={this.toggleKeyboard}
        />

        <Carriage openCarriage={this.state.isOpenCarriage} checkCarriage={this.checkCarriage} closeCarriage={this.closeCarriage} />
      </View>
    )
  }
}

export default Train;
