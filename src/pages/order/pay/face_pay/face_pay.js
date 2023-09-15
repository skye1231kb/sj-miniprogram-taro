import Taro, { Component } from '@tarojs/taro'
import { View, Swiper, SwiperItem, Image, Text, Button, Input } from '@tarojs/components'
import { connect } from '@tarojs/redux'

// js
import moment from 'moment'
import { request, getUrl, ADVERT, IS_RECONNENTION, CREATE_FACE_DORDER, MPID } from '../../../../static/js/api'
import Utils from '../../../../static/js/utils/utils'
import pay from '../../../../static/js/pay/pay'

// component
import TrainKeyboard from '../../../../components/train_keyboard/train_keyboard'
import AuthButton from '../../../../components/anth_button/auth_button'
import Carriage from '../../../../components/carriage/carriage'

// redux
import { onChangeAuthType, onCalcTotalPrice } from '../../../../store/actions/action'

// css
import './face_pay.scss'

@connect(({reducers}) => (
  {...reducers}
), (dispatch) => ({
  onChangeAuthType (payload) {
    dispatch(onChangeAuthType(payload));
  },
  onCalcTotalPrice (payload) {
    dispatch(onCalcTotalPrice(payload));
  }
}))
class FacePay extends Component {

  config = {
    navigationBarTitleText: '当面付款'
  }

  constructor(props) {
    super(props);
    this.state = {
      advertList: [],
      currentTrain: '',
      amount: '',
      showKeyboard: false,
      focusAmountInput: false,
      isOpenCarriage: false,
      carriage: '',
      dLink: ''
    }
  }

  componentWillMount () {
  }

  componentDidMount () {
    this.getAdvert();
    this.verifyAuth();
  }
  
  // 验证授权
  verifyAuth = () => {
    Taro.getSetting().then(res => {
      if (Utils.isWeApp()) {
        this.props.onChangeAuthType(!res.authSetting['scope.userInfo']);
      } else {
        this.props.onChangeAuthType(!res.authSetting['userInfo']);
      }
    }).catch(() => {
      this.props.onChangeAuthType(true);
      Taro.showToast({ title: '获取授权信息失败，请重新打开程序', icon: 'none', duration: 1500, mask: true });
    });
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

  // 隐藏或显示车次键盘
  toggleKeyboard = () => {
    this.setState({
      showKeyboard: !this.state.showKeyboard
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
      this.setState({ focusAmountInput: true });
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
      if (/[A-Z]/.test(this.props.train)) {
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

  // 设置表单值
  setFormValue = (e) => {
    this.setState({ [e.currentTarget.dataset['name']]: e.currentTarget.value });
  }

  // 判断是否为重联车
  isLink = () => {
    if (!this.state.currentTrain) {
      Taro.showToast({title: '请输入车次信息', icon: 'none', duration: 1500, mask: true});
      return;
    }
    if (!Utils.regAmount(+this.state.amount)) {
      Taro.showToast({title: '请填写正确的金额', icon: 'none', duration: 1500, mask: true});
      return;
    }
    if (+this.state.amount > 5000) {
      Taro.showToast({title: '支付金额超过限额5000', icon: 'none', duration: 1500, mask: true});
      return;
    }
    request({
      url: getUrl(IS_RECONNENTION),
      data: {
        train: this.state.currentTrain,
        date: moment().format('YYYY-MM-DD'),
        type: 'dmfk',
        mp_id: MPID
      }
    }).then(res => {
      if (res.error_code === 'ok') {
        if (res.data.d_link === 'Y') {
          // 是重连车, 打开车厢选择
          this.setState({
            isOpenCarriage: true,
            dLink: res.data.d_link
          });
        } else {
          // 不是重连车
          this.setState({
            carriage: 'A',
            dLink: 'N'
          }, () => this.pay());
        }
      } else {
        Taro.showToast({title: res.msg, icon: 'none', duration: 1500, mask: true});
      }
    }).catch(() => Taro.showToast({title: '获取车厢失败,请重试', icon: 'none', duration: 1500, mask: true}));
  }

  // 选择车厢
  checkCarriage = (e) => {
    this.setState({
      carriage: e.currentTarget.id,
      isOpenCarriage: false
    }, () => this.pay());
  }

  // 关闭车厢选择
  closeCarriage = () => {
    this.setState({ isOpenCarriage: false });
  }

  // 支付
  pay = () => {
    request({
      url: getUrl(CREATE_FACE_DORDER),
      data: {
        mp_id: MPID,
        train: this.state.currentTrain,
        totalprice: this.state.amount,
        d_link: this.state.dLink,
        carriage: this.state.carriage,
        date: moment().format('YYYY-MM-DD')
      }
    }).then(res => {
      if (res.error_code == 'ok') {
        this.props.onCalcTotalPrice(this.state.amount);
        pay(res.data, this.state.currentTrain);
      } else {
        Taro.showToast({title: res.msg, icon: 'none', duration: 1500, mask: true});
      }
    }).catch(() => Taro.showToast({title: '支付失败，请重试', icon: 'none', duration: 1500, mask: true}));
  }

  render () {
    return (
      <View className='face-pay'>
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
          <View className='form-item train'>
            <View>
              <View className='icon'></View>
              {
                this.state.currentTrain
                ? <Text className='content' onClick={this.toggleKeyboard}>{this.state.currentTrain}</Text>
                : <Text className='content placeholder' onClick={this.toggleKeyboard}>请输入您的车次号，如G998</Text>
              }
            </View>
            {/* <View className='scan-icon'></View> */}
          </View>
          <View className='form-item amount'>
            <View className='icon'></View>
            <Input
              placeholderClass='amount-placeholder'
              type='digit'
              value={this.state.amount}
              placeholder='请输入金额'
              data-name='amount'
              onInput={this.setFormValue}
              focus={this.state.focusAmountInput}
            ></Input>
          </View>
        </View>

        <View className='btn-container'>
          {
            this.props.isShowAuthButton
            ? <AuthButton onAfterAuthorized={this.isLink}></AuthButton>
            : ''
          }
          <Button className='btn' onClick={this.isLink}>立即支付</Button>
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

export default FacePay
