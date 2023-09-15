import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Button, Input } from '@tarojs/components'
import { connect } from "@tarojs/redux"

// js
import moment from 'moment'
import Utils from "../../../../static/js/utils/utils"
import {
  request,
  getUrl,
  MEMBER_INFO,
  BIND_MOBILE,
  GET_TRAIN_ALL_STATION,
  GET_PRODUCT_LIST,
  CREATE_OFFLINE_ORDER,
  MPID
} from '../../../../static/js/api'
import pay from '../../../../static/js/pay/pay'

// component
import AuthButton from '../../../../components/anth_button/auth_button'

// css
import './scan_order.scss'

// redux
import { onCalcTotalPrice } from "../../../../store/actions/action";

@connect(({ reducers }) => ({
  ...reducers
}), (dispatch) => ({
  onCalcTotalPrice(payload) {
    dispatch(onCalcTotalPrice(payload));
  }
}))
class ScanOrder extends Component {

  config = {
    navigationBarTitleText: '扫码下单'
  }

  constructor() {
    super();
    this.state = {
      userInfo: {},
      train: '',
      offlineCode: '',
      startStation: {},
      endStation: {},
      goodsList: [],
      vTnum: '',
      totalPrice: 0,
      isShowAuthBtn: false
    }
  }

  componentWillMount () {
    Taro.getSetting().then(res => {
      if (Utils.isWeApp()) {
        if (res.authSetting['scope.userInfo']) {
          this.getMemberInfo();
        } else {
          this.setState({ isShowAuthBtn: true });
          this.decodeDataForQrcode();
        }
      } else {
        if (res.authSetting['userInfo']) {
          this.getMemberInfo();
        } else {
          this.setState({ isShowAuthBtn: true });
          this.decodeDataForQrcode();
        }
      }
    }).catch(() => {
      this.decodeDataForQrcode();
    });
  }

  componentDidMount () { }

  // 获取用户信息
  getMemberInfo = () => {
    request({
      url: getUrl(MEMBER_INFO)
    }).then(res => {
      if (res.error_code == 'ok') {
        this.setState({
          userInfo: res.data.memberInfo,
          isShowAuthBtn: false
        });
      } else {
        this.setState({ isShowAuthBtn: true });
      }
    }).catch(() => {
      this.setState({ isShowAuthBtn: true });
      Taro.showToast({ title: '获取用户信息失败，请重试', icon: 'none', duration: 1500, mask: true });
    });
    this.decodeDataForQrcode();
  }

  // 解析二维码数据
  decodeDataForQrcode = () => {
    let url;
    let dataArr;
    if (Utils.isWeApp()) {
      url = decodeURIComponent(this.$router.params['q']);
      dataArr = decodeURIComponent(url.split('=')[1]).replace(/\{|\}/g, '').split(',');
    } else {
      let qrCode = Taro.getStorageSync('qrCode');
      url = decodeURIComponent(qrCode).split('{')[1].split('}')[0];
      dataArr = url.split(',');
    }
    let data = [];
    let train = '';
    let vTnum = '';
    let t = '';
    dataArr.forEach(item => {
      let itemArr = item.split('=');
      if (itemArr[0] == 'n') {
        train = itemArr[1];
      } else if (itemArr[0] == 'v') {
        vTnum = itemArr[1];
      } else if (itemArr[0] == 't') {
        t = itemArr[1];
      } else {
        data.push({ id: +itemArr[0], num: +itemArr[1] });
      }
    });
    this.getTrainAllStation(train, t);
    this.getGoodsList(vTnum, data);
  }

  // 获取站点信息
  getTrainAllStation = (train, t) => {
    request({
      url: getUrl(GET_TRAIN_ALL_STATION),
      data: {
        train
      }
    }).then(res => {
      if (res.error_code == 'ok') {
        this.setState({
          train,
          offlineCode: train + t,
          startStation:  res.data.station[0],
          endStation: res.data.station[res.data.station.length - 1]
        });
      } else {
        Taro.showToast({ title: res.msg, icon: 'none', duration: 1500, mask: true });
      }
    }).catch(() => Taro.showToast({ title: '获取站点信息失败，请重试', icon: 'none', duration: 1500, mask: true }));
  }

  // 获取商品列表
  getGoodsList = (vTnum, data) => {
    request({
      url: getUrl(GET_PRODUCT_LIST),
      data: {
        v_tnum: vTnum
      }
    }).then(res => {
      if (res.error_code === 'ok') {
        let goodsList = [];
        let totalPrice = 0;
        res.data.forEach(goods => {
          data.forEach(item => {
            if (goods.id == item.id) {
              goods['selectedNum'] = item.num;
              goods['totalPrice'] = (item.num * Math.round(goods.price * 100)) / 100;
              totalPrice += (item.num * Math.round(goods.discount_settlement_price * 100)) / 100;
              goodsList.push(goods);
            }
          });
        });
        this.setState({
          goodsList,
          totalPrice
        });
      } else {
        Taro.showToast({ title: '获取商品信息失败，请重试', icon: 'none', duration: 1500, mask: true });
      }
    }).catch(() => Taro.showToast({ title: '获取商品信息失败，请重试', icon: 'none', duration: 1500, mask: true }))
  }

  // 设置表单值
  setFormValue = (e) => {
    this.setState({ [e.currentTarget.dataset['name']]: e.currentTarget.value });
  }

  // 获取用户手机号
  getPhoneNumber = e => {
    if (e.detail.errMsg == 'getPhoneNumber:ok') {
      request({
        url: getUrl(BIND_MOBILE),
        data: {
          info: e.detail.encryptedData,
          iv: e.detail.iv
        }
      }).then(res => {
        if (res.error_code === 'ok') {
          this.setState({
            'userInfo.mobile': res.data.phoneNumber
          }, () => this.pay());
        }
      })
    }
  }

  // 支付
  pay = () => {
    let cartData = [];
    this.state.goodsList.forEach(item => {
      cartData.push({
        num: item.selectedNum,
        price: item.price,
        pro_id: item.id,
        pro_name: item.pro_name
      });
    });
    let data = {
      mp_id: MPID,
      offline_code: this.state.offlineCode,
      totalprice: this.state.totalPrice,
      train: this.state.train,
      mobile: this.state.userInfo.mobile,
      carriage: /\_2$/.test(this.state.vTnum) ? '9' : '1',
      site: '无座',
      db_time: '即订即送',
      ssid: this.state.startStation.station_id,
      seid: this.state.endStation.station_id,
      order: [{
        totalprice: this.state.totalPrice,
        child: cartData
      }]
    }
    request({
      url: getUrl(CREATE_OFFLINE_ORDER),
      data
    }).then(res => {
      if (res.error_code === 'ok') {
        this.props.onCalcTotalPrice(this.state.totalPrice);
        // 创建订单成功，开始调起支付接口 res.data.bid/order_id/protype
        pay(res.data, this.state.train);
      } else {
        Taro.showToast({ title: res.msg, icon: 'none', duration: 1500, mask: true });
      }
    }).catch(() => {
      Taro.showToast({ title: '创建订单失败，请重新下单', icon: 'none', duration: 1500, mask: true });
    });
  }

  render () {
    const { goodsList } = this.state;
    // 计算优惠则扣价
    let discountTotalPrice = 0; // 折扣总价
    let totalProNum = 0; // 商品总数
    let totalAmount = 0; // 商品总价
    goodsList.forEach(goods => {
      // 总价 - 折后价
      let discountPrice = Math.round(goods.price * 100) - Math.round(goods.discount_settlement_price * 100);
      discountTotalPrice = (Math.round(discountTotalPrice * 100) + Math.round(discountPrice * goods.selectedNum)) / 100;
      totalProNum += goods.selectedNum;
      totalAmount = (Math.round(totalAmount * 100) + (Math.round(goods.price * 100) * goods.selectedNum)) / 100;
    });
    
    return (
      <View className='scan-order'>
        <View className='train-info'>
          <View className='start-train'>
            <View className='date'>{this.state.startStation.a_time}</View>
            <View className='train-name'>{this.state.startStation.station}</View>
          </View>
          <View className='train'>
            <View className='train-num'>{this.state.train}</View>
            <View className='train-arrow'></View>
            <View className='date'>{moment().format('MM月DD日')}</View>
          </View>
          <View className='end-train'>
            <View className='date'>{this.state.endStation.a_time}</View>
            <View className='train-name'>{this.state.endStation.station}</View>
          </View>
        </View>
        
        <View className='order-info-container'>
          <View className='order-info'>
            <View className='title'>订单信息</View>
            {
              goodsList.map((goods, idx) => {
                return (
                  <View className='order-item' key={idx}>
                    <Image className='pro-pic' src={goods.product.product_img} mode='aspectFit'></Image>
                    <View className='content'>
                      <Text className='name'>{goods.pro_name}</Text>
                      <View className='price-container'>
                        <Text className='price'>￥{goods.price}/份</Text>
                        <Text className='num'>x{goods.selectedNum}</Text>
                      </View>
                    </View>
                  </View>
                )
              })
            }
          </View>
          <View className='discount-info'>
            <View className='discount-item'>
              <Text>商品金额（共{totalProNum}件）</Text>
              <Text className='price'>￥{totalAmount}</Text>
            </View>
            <View className='discount-item'>
              <Text>活动优惠</Text>
              <Text className='price'>-￥{discountTotalPrice}</Text>
            </View>
          </View>
          {/* <View className='form-container'>
            <View className='form-item'>
              <Text>手机号</Text>
              <Input
                placeholderClass='input-placeholder'
                placeholder='请输入手机号'
                type='number'
                data-name='mobile'
                value={this.state.userInfo.mobile}
                onInput={this.setFormValue}
              />
            </View>
          </View> */}
        </View>

        <View className='cart-bar'>
          <View className='price'>合计：￥{this.state.totalPrice}</View>
          <View className='btn-container'>
            {
              this.state.isShowAuthBtn &&
              <AuthButton onAfterAuthorized={this.getMemberInfo}></AuthButton>
            }
            {
              // 有手机号 --- 微信 --- true
              // 没手机号 --- 微信 --- false
              // 有手机号 --- 支付宝 --- false
              // 没手机号 --- 支付宝 --- true
              Utils.isWeApp() && !this.state.userInfo.mobile
              ? <Button className='btn' openType='getPhoneNumber' onGetPhoneNumber={this.getPhoneNumber}>去支付</Button>
              : <Button className='btn' onClick={this.pay}>去支付</Button>
            }
          </View>
        </View>
      </View>
    )
  }
}

export default ScanOrder
