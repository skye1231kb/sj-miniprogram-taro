import Taro, { Component } from '@tarojs/taro'
import { View, ScrollView, Form, Input, Button, Navigator } from '@tarojs/components'
import { connect } from '@tarojs/redux'

// js
import moment from 'moment'
import { getUrl, request, GET_TRAIN_INFO, CREATE_FACE_DORDER, IS_RECONNENTION, MPID } from '../../../../static/js/api'
import pay from '../../../../static/js/pay/pay'

// components
import TrainKeyboard from '../../../../components/train_keyboard/train_keyboard'
import Carriage from '../../../../components/carriage/carriage'

// css image
import './scan.scss'

// redux
import {
  onAddTrain,
  onChangeIsLink,
  onSetCarriage,
  onCalcTotalPrice
} from '../../../../store/actions/action'

const TRAIN_TYPE = 'dmfk';

@connect(({ reducers }) => ({
  ...reducers
}), (dispatch) => ({
  onAddTrain(payload) {
    dispatch(onAddTrain(payload));
  },
  onChangeIsLink(payload) {
    dispatch(onChangeIsLink(payload));
  },
  onSetCarriage(payload) {
    dispatch(onSetCarriage(payload));
  },
  onCalcTotalPrice(payload) {
    dispatch(onCalcTotalPrice(payload));
  }
}))
export default class Scan extends Component {

  config = {
    navigationBarTitleText: '当面付款'
  }

  constructor(props) {
    super(props);
    this.state = {
      showKeyboard: false,
      disabledKT: true,
      trainInfo: {
        train: '',
        carriage: '',
        d_link: ''
      },
      money: '',
      isOpenCarriage: false
    }
  }

  componentWillMount () {
    const mcode = this.$router.params['mcode'];
    if (mcode) {
      this.getTrainInfo(mcode);
    }
  }

  componentDidMount () { }

  getTrainInfo = mcode => {
    Taro.showLoading({ title: '加载中...', mask: true });
    request({
      url: getUrl(GET_TRAIN_INFO),
      data: {
        xid: mcode
      }
    }).then(res => {
      Taro.hideLoading();
      if (res.error_code === 'ok') {
        this.setState({
          trainInfo: res.data
        });
        this.props.onAddTrain(res.data.train);
        this.props.onSetCarriage(res.data.cid);
      } else {
        Taro.showToast({ title: res.msg, duration: 1500, icon: 'none', mask: true });
      }
    }).catch(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '获取车次信息失败，请重试', duration: 1500, icon: 'none', mask: true });
    });
  }

  // 隐藏或显示车次键盘
  toggleKeyboard = () => {
    this.setState({
      showKeyboard: !this.state.showKeyboard
    });
  }

  // 车次键盘输入
  onKeyboardClick = (e) => {
    const text = e.currentTarget.dataset.text;
    const type = e.currentTarget.dataset.type;
    let train = this.state.trainInfo.train.split('');
    // 禁用 T/K
    if (text === 'T' || text === 'K') {
      return;
    }
    // 点击了确认按钮
    if (text === 'determine') {
      this.toggleKeyboard();
      return;
    }
    // 点击了重输按钮
    if (text === 'reset') {
      this.setState({ trainInfo: { train: '' } });
      return;
    }
    // 点击了回退按钮
    if (text === 'back') {
      if (!train.length) return;
      train.pop();
      this.setState({ trainInfo: {train: train.join('')} });
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

    this.setState({ trainInfo: {train: train.join('')} });
  }

  // 判断是否为重联车
  isLink = () => {
    const train = this.state.trainInfo.train;
    if (!train) {
      Taro.showToast({title: '请输入车次信息', icon: 'none', duration: 1500, mask: true});
      return;
    }
    Taro.showLoading({ mask: true, title: '加载中...' });
    request({
      url: getUrl(IS_RECONNENTION),
      data: {
        train: train,
        date: moment().format('YYYY-MM-DD'),
        type: TRAIN_TYPE,
        mp_id: MPID
      }
    }).then(res => {
      Taro.hideLoading();
      if (res.error_code === 'ok') {
        if (res.data.d_link === 'Y') {
          // 是重连车, 打开车厢选择
          this.props.onChangeIsLink(true);
          this.setState({
            // isOpenCarriage: true,
            trainInfo: {
              ...this.state.trainInfo,
              d_link: res.data.d_link
            }
          }, () => this.pay());
        } else {
          // 不是重连车
          this.setState({
            trainInfo: {
              ...this.state.trainInfo,
              cid: 'A',
              d_link: res.data.d_link
            }
          }, () => this.pay());
        }
      } else {
        Taro.showToast({title: res.msg, icon: 'none', duration: 1500, mask: true});
      }
    }).catch(() => {
      Taro.hideLoading();
      Taro.showToast({title: '获取车厢失败,请重试', icon: 'none', duration: 1500, mask: true});
    })
  }

  // 选择车厢
  checkCarriage = (e) => {
    this.props.onSetCarriage(e.currentTarget.id);
    this.setState({
      trainInfo: {
        ...this.state.trainInfo,
        cid: e.currentTarget.id
      }
    }, () => this.pay());
  }

  // 关闭车厢选择
  closeCarriage = () => {
    this.setState({isOpenCarriage: false});
  }

  setFormValue = (e) => {
    this.setState({ [e.currentTarget.dataset['name']]: e.currentTarget.value });
  }

  pay = () => {
    if (!this.state.money) {
      Taro.showToast({ title: '请填写金额', duration: 1500, icon: 'none', mask: true });
      return;
    }
    const moneyReg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
    if (!moneyReg.test(this.state.money)) {
      Taro.showToast({ title: '请输入正确的金额', duration: 1500, icon: 'none', mask: true });
      return;
    }
    if (+this.state.money > 5000) {
      Taro.showToast({ title: '支付金额超过限额5000', duration: 1500, icon: 'none', mask: true });
      return;
    }
    Taro.showLoading({ title: '加载中...', mask: true });

    const train = this.state.trainInfo.train;
    const carriage = this.state.trainInfo.cid;
    this.props.onAddTrain(train);
    this.props.onSetCarriage(carriage);

    request({
      url: getUrl(CREATE_FACE_DORDER),
      data: {
        train,
        totalprice: this.state.money,
        d_link: this.state.trainInfo.d_link,
        carriage,
        date: moment().format('YYYY-MM-DD'),
        'mp_id': MPID
      }
    }).then(res => {
      Taro.hideLoading();
      if (res.error_code === 'ok') {
        this.props.onCalcTotalPrice(this.state.money);
        pay(res.data, train);
      } else {
        Taro.showToast({ title: res.msg, duration: 1500, icon: 'none', mask: true });
      }
    }).catch(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '创建订单失败，请重试', duration: 1500, icon: 'none', mask: true });
    })
  }

  render () {
    return (
      <View className='scan'>
        <ScrollView scrollY>
          <Form>
            <View className='head-v-bg cell-s'>
              <View className='h-p-s cell-s'>
                <View className='p-s'>当面付款</View>
                <View className='p-t'>请核对信息后，填写付款金额</View>
              </View>
            </View>
            <View className='face'>
              <View className='form'>
                <View className='cell-row cell-row-border-bottom'>
                  <View className='cell-row-left'>当前车次</View>
                  {
                    this.state.trainInfo.train
                      ? <View className='cell-row-left cell-row' onClick={this.toggleKeyboard}>{this.state.trainInfo.train}</View>
                      : <View className='cell-row-left cell-row' onClick={this.toggleKeyboard}>请输入车次</View>
                  }
                </View>
                <View className='cell-row cell-row-border-bottom'>
                  <View className='cell-row-left'>付款金额</View>
                  <View className='cell-row-left cell-row'>
                    <Input
                      data-name='money'
                      type='digit'
                      className='cell-row-input'
                      placeholder='输入金额'
                      value={this.state.money}
                      onInput={this.setFormValue}
                    />
                  </View>
                </View>
              </View>
              <Button formType='submit' className='pay-btn' onClick={this.isLink}>立即支付</Button>
              <View class='pay-msg1'>请核对车次、金额信息再进行支付</View>
              <View class='pay-msg2'>当面付款是提供线下购物，线上付款的一种便捷购物付款方式。</View>
              <View class='pay-msg2'>支付前，请先咨询高铁工作人员输入正确信息，再做付款操作。</View>
            </View>
          </Form>
          <Navigator class='goinde' url='/pages/index/index' openType='switchTab'>返回首页</Navigator>
        </ScrollView>

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
