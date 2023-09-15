import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Input, Picker, PickerView, PickerViewColumn, ScrollView } from '@tarojs/components'
import { AtFloatLayout } from "taro-ui"
import { connect } from '@tarojs/redux'

// js
import moment from 'moment'
import {
  request,
  getUrl,
  GET_DELIVERY_TIME,
  CREATE_ORDER,
  MEMBER_INFO,
  GET_PRODUCT_RECITEM_LIST,
  BEFORE_CREATE_ORDER,
  MPID
} from '../../../static/js/api'
import pay from '../../../static/js/pay/pay'
import Utils from '../../../static/js/utils/utils'

// component
import CartBar from '../../../components/cart_bar/cart_bar'

// css image
import './create_order.scss'
import arrow from '../../../static/img/order/arrow.png'

// redux
import {
  onResetGoodsAndPrice,
  onSetUserInfo,
  onAddGoods,
  onCalcTotalPrice
} from '../../../store/actions/action'

const CARRIAGE_1_8 = ['1车', '2车', '3车', '4车', '5车', '6车', '7车', '8车'];
const CARRIAGE_9_16 = ['9车', '10车', '11车', '12车', '13车', '14车', '15车', '16车'];
const CARRIAGE_1_16 = ['1车', '2车', '3车', '4车', '5车', '6车', '7车', '8车', '9车', '10车', '11车', '12车', '13车', '14车', '15车', '16车'];
const ROW = ['1排', '2排', '3排', '4排', '5排', '6排', '7排', '8排', '9排', '10排', '11排', '12排', '13排', '14排', '15排', '16排', '17排', '18排', '19排', '20排', '21排', '无排'];
const SEAT = ['A座', 'B座', 'C座', 'D座', 'F座', '无座'];

const APP = Taro.getApp();

@connect(({ reducers }) => (
  { ...reducers }
), (dispatch) => ({
  onResetGoodsAndPriece(payload) {
    dispatch(onResetGoodsAndPrice(payload));
  },
  onSetUserInfo(payload) {
    dispatch(onSetUserInfo(payload));
  },
  onAddGoods(payload) {
    dispatch(onAddGoods(payload));
  },
  onCalcTotalPrice(payload) {
    dispatch(onCalcTotalPrice(payload));
  }
}))
export default class CreateOrder extends Component {

  config = {
    navigationBarTitleText: '填写订单',
    navigationBarBackgroundColor: '#FFFFFF'
  }

  constructor(props) {
    super(props);
    this.state = {
      mealsDateIndex: 0,
      mealsDate: [],
      seat: [],
      seatIdx: [0, 0, 0],
      selectedSeat: '请选择座位信息',
      isSelectedSeat: false,
      username: '',
      mobile: '',
      memo: '',
      isOpenMulitSeletor: false,
      isShowRecommended: false,
      recommendedGoodsList: [],
      beforeCreateOrderInfo: {}
    }
  }
  
  componentDidMount() {
    // 判断是否为重连车
    let carriage;
    if (this.props.isLink) {
      carriage = this.props.carriage === 'A' ? CARRIAGE_1_8 : CARRIAGE_9_16;
    } else {
      if (this.props.carriageNum === '8') {
        carriage = CARRIAGE_1_8;
      } else {
        carriage = CARRIAGE_1_16;
      }
    }

    this.setState({
      seat: [carriage, ROW, SEAT],
      // selectedSeat: `${carriage[0]} - ${ROW[0]} - ${SEAT[0]}`
    });
    this.getDeliveryTime();
    this.getProductionRecList();
  }

  componentDidShow() {
    this.beforeCreateOrder();
  }

  // 获取用户信息
  getUserInfo = () => {
    request({
      url: getUrl(MEMBER_INFO)
    }).then(res => {
      if (res.error_code === 'ok') {
        let userInfo = {
          avatarUrl: res.data.memberInfo.avatar,
          mobile: res.data.memberInfo.mobile,
          nickName: res.data.memberInfo.nickname,
        };
        this.props.onSetUserInfo(userInfo);
        this.setState({ mobile: userInfo.mobile });
      }
    });
  }
  
  // 调用预下单信息
  beforeCreateOrder = () => {
    request({
      url: getUrl(BEFORE_CREATE_ORDER)
    }).then(res => {
      this.getUserInfo();
      if (res.error_code === 'ok') {
        this.setState({ beforeCreateOrderInfo: res.data });
        this.calcSelectedGoodsTotalPrice(res.data.status);
      } else {
        Taro.showToast({ title: res.message, icon: 'none', duration: 1500, mask: true });
      }
    }).catch(() => {
      this.getUserInfo();
      Taro.showToast({ title: '获取下单信息失败，请重试', icon: 'none', duration: 1500, mask: true });
    });
  }
  
  // 获取美味推荐列表
  getProductionRecList = () => {
    request({
      url: getUrl(GET_PRODUCT_RECITEM_LIST),
      data: {
        cid: this.props.carriage,
        thisday: moment().format('YYYY-MM-DD'),
        train: this.props.train
      }
    }).then(res => {
      if (res.code === 1) {
        if (res.data && res.data.length) {
          this.setState({
            recommendedGoodsList: res.data,
            isShowRecommended: true,
          });
        }
      } else {
        Taro.showToast({ title: res.message, icon: 'none', duration: 1500, mask: true });
      }
    });
  }

  // 获取配送时间
  getDeliveryTime = () => {
    request({
      url: getUrl(GET_DELIVERY_TIME),
      data: {
        train: this.props.train,
        date: this.props.date,
        ssid: this.props.startStation.id,
        seid: this.props.endStation.id,
        s_time: this.props.startStation.a_time,
        carriage: this.props.carriage
      }
    }).then(res => {
      if (res.error_code === 'ok') {
        this.handleMealDate(res.data);
      } else {
        Taro.showToast({ title: res.msg, icon: 'none', duration: 1500, mask: true });
      }
    }).catch(() => {
      Taro.showToast({ title: '获取配送时间失败，请重试', icon: 'none', duration: 1500, mask: true });
    });
  }

  // 处理配送时间数组数据
  handleMealDate = (mealsDate) => {
    let newMealsDate = [];
    mealsDate.forEach(data => {
      if (data.length > 1) {
        newMealsDate.push(`${data[0]}-${data[1]}`);
      } else {
        newMealsDate.push(`${data[0]}`);
      }
    });
    this.setState({ mealsDate: [...newMealsDate] });
  }

  // 设置表单值
  setFormValue = (e) => {
    this.setState({ [e.currentTarget.dataset['name']]: e.currentTarget.value });
  }

  // 打开座位选择
  openMulitSeletor = () => {
    this.setState({ isOpenMulitSeletor: true });
  }

  // 关闭座位
  closeMulitSeletor = () => {
    this.setState({ isOpenMulitSeletor: false });
  }

  // 选择座位触发
  changeSeatPicker = (e) => {
    let idxs = [...e.detail.value];
    this.setState({
      seatIdx: idxs,
    });
  }
  
  // 确认座位选择
  confirmSeat = () => {
    let idxs = this.state.seatIdx;
    if (this.state.seat[1][idxs[1]] === '无排') {
      // 如果为无排无座，更改数组下标
      idxs[2] = SEAT.length - 1;
      this.setState({
        seatIdx: idxs,
        selectedSeat: `${this.state.seat[0][idxs[0]]} - 无排 - 无座`,
        isOpenMulitSeletor: false,
        isSelectedSeat: true
      });
    } else {
      this.setState({
        isOpenMulitSeletor: false,
        isSelectedSeat: true,
        selectedSeat: `${this.state.seat[0][idxs[0]]} - ${this.state.seat[1][idxs[1]]} - ${this.state.seat[2][idxs[2]]}`
      });
    }
  }

  // 选择送餐时间
  changeMealsDatePicker = (e) => {
    this.setState({ mealsDateIndex: e.detail.value });
  }
  
  // 减去美味推荐商品
  subtractGoods = (e, goods) => {
    let goodsList = this.state.recommendedGoodsList;
    goodsList.forEach(item => {
      if (goods.id === item.id) {
        item['selectedNum'] -= 1;
      }
    });
    this.setState({ recommendedGoodsList: goodsList });
  }
  
  // 添加美味推荐商品
  addGoods = (e, goods) => {
    let goodsList = this.state.recommendedGoodsList;
    goodsList.forEach(item => {
      if (goods.id === item.id) {
        if (item.selectedNum && item.selectedNum > 0) {
          if (item.selectedNum < item.number) {
            item.selectedNum += 1;
          } else {
            Taro.showToast({title: '商品数量已达上限', icon: 'none', duration: 1500, mask: true});
          }
        } else {
          item['selectedNum'] = 1;
        }
      }
    });
    this.setState({ recommendedGoodsList: goodsList });
  }

  // 确定选择美味推荐商品
  selectedRecommendedGoods = () => {
    // 是否选择了美味推荐商品
    let isSelected = false;
    let selectedRecommendGoodsList = [];
    const productionList = JSON.parse(Taro.getStorageSync('productionList'));

    // 讲美味推荐和商品列表中的商品数量合并
    this.state.recommendedGoodsList.forEach(item => {
      productionList.forEach(cate => {
        cate.child.forEach(good => {
          // 判断 item.selectedNum 是否大于0
          if (item.selectedNum && item.selectedNum > 0) {
            isSelected = true;
            // 找到商品列表里对应的商品
            if (item.id === good.pro_id) {
              // 判断原有商品是否已选择，是在原有数量上添加，否新增数量
              if (good.selectedNum && good.selectedNum > 0) {
                good.selectedNum += item.selectedNum;
              } else {
                good['selectedNum'] = item.selectedNum;
              }
            }
          }
        });
      });
    });
    
    if (!isSelected) {
      Taro.showToast({ title: '不要急，您还未添加商品呢', icon: 'none', duration: 1500, mask: true });
      return;
    }
  
    // 查出商品列表中选择数量大于0的
    productionList.forEach(cate => {
      cate.child.forEach(good => {
        if (good.selectedNum && good.selectedNum > 0) {
          selectedRecommendGoodsList.push(good);
        }
      });
    });
    
    this.props.onAddGoods([...selectedRecommendGoodsList]);
    this.calcSelectedGoodsTotalPrice(this.state.beforeCreateOrderInfo.status);
    this.closeRecommended();
  }
  
  // 计算商品总价格
  calcSelectedGoodsTotalPrice = isDiscount => {
    let total = 0; // 商品总价
    let discountPrice = 0; // 折扣价
    if (this.props.selectedGoodsList.length) {
      this.props.selectedGoodsList.forEach(item => {
        discountPrice = (Math.round(discountPrice * 100) + Math.round(+item.discount_settlement_price * 100) * item.selectedNum) / 100;
        total = (Math.round(total * 100) + Math.round(+item.price * 100) * item.selectedNum) / 100;
      });
    }
    // 如果享受折扣
    if (isDiscount) {
      // 如果优惠价高于5元，则为5，低于5元按实际计算
      let diffCount = (Math.round(total * 100) - Math.round(discountPrice * 100)) / 100;
      if (diffCount > 5) {
        total = (Math.round(total * 100) - 5 * 100) / 100;
      } else {
        total = (Math.round(total * 100) - Math.round(diffCount * 100)) / 100;
      }
    }
    this.props.onCalcTotalPrice(total);
  }

  // 关闭美味推荐窗口
  closeRecommended = () => {
    this.setState({ isShowRecommended: false });
  }

  // 创建订单
  createOrder = () => {
    // 验证用户名
    // if (!this.state.username) {
    //   Taro.showToast({ title: '请输入姓名', icon: 'none', duration: 1500, mask: true });
    //   return;
    // }
    // if (!/^[\u4e00-\u9fa5_a-zA-Z\u00a0|\u0020]+$/.test(this.state.username)) {
    //   Taro.showToast({ title: '姓名只能输入中英文', icon: 'none', duration: 1500, mask: true });
    //   return;
    // }
    // 是否选择座位
    if (!this.state.isSelectedSeat) {
      Taro.showToast({ title: '请选择座位信息', icon: 'none', duration: 1500, mask: true });
      return;
    }
    // 验证手机号
    if (!this.state.mobile) {
      Taro.showToast({ title: '请输入手机号码', icon: 'none', duration: 1500, mask: true });
      return;
    }
    if (!Utils.regMobile(this.state.mobile)) {
      Taro.showToast({ title: '请输入正确的手机号码', icon: 'none', duration: 1500, mask: true });
      return;
    }
    // 验证备注
    if (this.state.memo && !Utils.regZhOrEn(this.state.memo)) {
      Taro.showToast({ title: '备注只能输入中英文和数字', icon: 'none', duration: 1500, mask: true });
      return;
    }
    // 处理商品信息
    let order = [{
      totalprice: this.props.totalPrice,
      child: []
    }];
    this.props.selectedGoodsList.forEach(goods => {
      order[0].child.push({
        pro_id: goods.id,
        pro_name: goods.pro_name,
        num: goods.selectedNum,
        price: goods.price
      });
    });
    // 处理车厢信息
    let carriage = this.state.seat[0][this.state.seatIdx[0]];
    // 处理座位信息
    let site = '无座';
    let row = ROW[this.state.seatIdx[1]];
    let seat = SEAT[this.state.seatIdx[2]];
    if (this.state.seatIdx[2] !== SEAT.length - 1) {
      site = `${row.substr(0, row.length - 1)}${seat.substr(0, seat.length - 1)}`;
    }
    request({
      url: getUrl(CREATE_ORDER),
      data: {
        totalprice: this.props.totalPrice,
        train: this.props.train,
        seid: this.props.endStation.id,
        carriage: carriage.substr(0, carriage.length - 1),
        site: site,
        mobile: this.state.mobile,
        mp_id: MPID,
        db_time: this.state.mealsDate[this.state.mealsDateIndex],
        order,
        username: this.state.username,
        memo: this.state.memo
      }
    }).then(res => {
      if (res.error_code === 'ok') {
        // 创建订单成功，开始调起支付接口 res.data.bid/order_id/protype
        pay(res.data, this.props.train);
        // 发送统计数据
        this.sendEventAfterThis();
      } else {
        Taro.showToast({ title: res.msg, icon: 'none', duration: 1500, mask: true });
      }
    }).catch(() => {
      Taro.showToast({ title: '创建订单失败，请重新下单', icon: 'none', duration: 1500, mask: true });
    });
  }

  // 发送统计数据-由推广二维码进入
  sendEventAfterThis = () => {
    if (Utils.isWeApp() && this.props.promoteStation) {
      const H = Utils.getCurrentDateRangeForHour();
      APP.aldstat.sendEvent(`${this.props.promoteStation}-下单`, H);
    }
  }

  render() {
    const { recommendedGoodsList, beforeCreateOrderInfo } = this.state;
    // 计算优惠则扣价
    let discountTotalPrice = 0; // 折扣金额
    let totalProNum = 0; // 商品总数
    let totalPrice = 0; // 商品总价
    this.props.selectedGoodsList.forEach(goods => {
      if (beforeCreateOrderInfo.status) {
        let discountPrice = Math.round(goods.price * 100) - Math.round(goods.discount_settlement_price * 100);
        discountTotalPrice = (Math.round(discountTotalPrice * 100)
                            +  Math.round(discountPrice * goods.selectedNum))
                            / 100;
      }
      totalProNum += goods.selectedNum;
      totalPrice = (Math.round(totalPrice * 100) + Math.round(goods.price * 100) * goods.selectedNum) / 100;
    });
    discountTotalPrice = discountTotalPrice > 5 ? 5 : discountTotalPrice;

    return (
      <View className='create-order'>
        <View className='train-info'>
          <View className='start-train'>
            <View className='date'>{this.props.startStation.a_time}</View>
            <View className='train-name'>{this.props.startStation.station}</View>
          </View>
          <View className='train'>
            <View className='train-num'>{this.props.train}</View>
            <View className='train-arrow'>
              <Image src={arrow} />
            </View>
            <View className='date'>{moment(this.props.date).format('MM月DD日')}</View>
          </View>
          <View className='end-train'>
            <View className='date'>{this.props.endStation.a_time}</View>
            <View className='train-name'>{this.props.endStation.station}</View>
          </View>
        </View>
        <View className='order-info-container'>
          <View className='form-container'>
            {/*<View className='form-item'>*/}
            {/*  <Text>姓名</Text>*/}
            {/*  <Input placeholderClass='input-placeholder' placeholder='请输入姓名' data-name='username' value={this.state.username} onInput={this.setFormValue} />*/}
            {/*</View>*/}
            <View className='form-item'>
              <Text>手机号</Text>
              <Input placeholderClass='input-placeholder' placeholder='请输入手机号' type='number' data-name='mobile' value={this.state.mobile} onInput={this.setFormValue} />
            </View>
            <View className='form-item selection'>
              <Text>送餐至</Text>
              <View className='input-placeholder' onClick={this.openMulitSeletor}>{this.state.selectedSeat}</View>
            </View>
            <View className='form-item selection'>
              <Text>送餐时间</Text>
              <Picker range={this.state.mealsDate} value={this.state.mealsDateIndex} onChange={this.changeMealsDatePicker}>
                <View className='input-placeholder'>{this.state.mealsDate[this.state.mealsDateIndex]}</View>
              </Picker>
            </View>
            <View className='form-item'>
              <Text>备注</Text>
              <Input placeholderClass='input-placeholder' placeholder='备注' data-name='memo' value={this.state.memo} onInput={this.setFormValue} />
            </View>
          </View>
          <View className='order-info'>
            <View className='title'>订单信息</View>
            {
              this.props.selectedGoodsList.map((goods, idx) => {
                return (
                  <View className='order-item' key={idx}>
                    <Image className='pro-pic' src={goods.pics} mode='aspectFit'></Image>
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
          {/*<View className='discount-info'>*/}
          {/*  <View className='discount-item'>*/}
          {/*    <Text>商品金额（共{totalProNum}件）</Text>*/}
          {/*    <Text className='price'>￥{totalPrice}</Text>*/}
          {/*  </View>*/}
          {/*  <View className='discount-item'>*/}
          {/*    <Text>活动优惠</Text>*/}
          {/*    <Text className='price'>-￥{discountTotalPrice}</Text>*/}
          {/*  </View>*/}
          {/*</View>*/}
          {/* <View className='preferential-info'>
            <View className='title'>优惠信息</View>
            <View className='preferential-item'>
              <Text>折扣金额</Text>
              <Text className='price'>-￥0</Text>
            </View>
          </View> */}
        </View>
        <View className='cart-bar'>
          <CartBar
            isShowCartIcon={false}
            totalNum={totalProNum}
            toCreateOrder={this.createOrder}
          />
        </View>

        {
          // 美味推荐
          this.state.isShowRecommended &&
          <View className='recommended-container' catchtouchmove='preventTouchMove'>
            <View className='mask'></View>
            <View className='recommended'>
              <View className='header'>
                <View className='title'>美味享不停</View>
                <View className='desc'>我们建议您多加一份以下美食</View>
              </View>
              <ScrollView scrollY className='content'>
                  {
                    recommendedGoodsList.map((goods, i) => {
                      return (
                        <View className='pro-item' key={i}>
                          <Image className='pro-pic' src={goods.productImg} mode='aspectFit'></Image>
                          <View className='item-content'>
                            <View className='pro-name'>{goods.proname}</View>
                            <View className='num'>剩余{goods.number}份</View>
                            <View className='price-container'>
                              <View className='price'>￥{goods.price}/份</View>
                              <View className='btn-container'>
                                {
                                  goods.selectedNum > 0 &&
                                  <View className='btn subtract-btn' onClick={e => this.subtractGoods(e, goods)}></View>
                                }
                                {
                                  goods.selectedNum > 0 &&
                                  <Text className='select-num'>{goods.selectedNum}</Text>
                                }
                                {
                                  goods.number > 0 &&
                                  <View className='btn add-btn' onClick={e => this.addGoods(e, goods)}></View>
                                }
                              </View>
                            </View>
                          </View>
                        </View>
                      )
                    })
                  }
                </ScrollView>
              <View className='footer'>
                <View className='btn cancel' onClick={this.closeRecommended}>不，谢谢</View>
                <View className='btn confirm' onClick={this.selectedRecommendedGoods}>选好了</View>
              </View>
            </View>
          </View>
        }

        <AtFloatLayout
          isOpened={this.state.isOpenMulitSeletor}
          onClose={this.closeMulitSeletor}
        >
          <View className='picker-confirm-btn' onClick={this.confirmSeat}>确定</View>
          <PickerView
            value={this.state.seatIdx}
            indicatorStyle='height: 40px;' style='width: 100%;height: 300px;text-align: center;line-height: 40px;'
            onChange={this.changeSeatPicker}
          >
            {
              this.state.seat.map((column, idx) => {
                return (
                  <PickerViewColumn key={idx}>
                    {
                      column.map((item, i) => {
                        return (
                          <View key={i * 1000}>{item}</View>
                        )
                      })
                    }
                  </PickerViewColumn>
                )
              })
            }
          </PickerView>
        </AtFloatLayout>
      </View>
    )
  }
}
