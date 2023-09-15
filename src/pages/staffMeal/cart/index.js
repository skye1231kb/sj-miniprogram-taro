import Taro, { Component } from '@tarojs/taro'
import { View, Picker, Image, Text, Input, Form, Button } from '@tarojs/components'
import { AtList, AtListItem, AtBadge, AtFloatLayout, AtInputNumber } from "taro-ui"

// js
import moment from 'moment'
import { getUrl, staffRequest } from '../../../static/js/api'

// css
import './index.scss'

class Index extends Component {

  config = {
    navigationBarBackgroundColor: '#006699',
    navigationBarTextStyle: 'white',
    navigationBarTitleText: '员工餐列表',
    backgroundColor: '#E4E4E4'
  }

  constructor(props) {
    super(props);
    this.state = {
      type: 'base',
      baseList: [],
      baseId: 0,
      date: '',
      endDate: '',
      goodsList: [],
      selectedGoddsList: [],
      totalPrice: 0,
      totalNum: 0,
      train: '',
      staffType: Taro.getStorageSync('staffType')
    }
  }

  componentWillMount () {
    this.getBaseList();
    this.handleMealDate();
  }

  componentDidMount () { }

  // 处理订餐时间
  handleMealDate = () => {
    const todayNoon = `${moment().format('YYYY-MM-DD')} 09:00:00`; // 当天上午9点
    let date = '';
    // 9点前可订1天后的，9点后可订2天后的
    if (moment().isBefore(todayNoon)) {
      date = moment().add(1, 'd').format('YYYY-MM-DD');
    } else {
      date = moment().add(2, 'd').format('YYYY-MM-DD');
    }
    this.setState({
      date,
      endDate: moment().add(6, 'd').format('YYYY-MM-DD')
    });
  }

  // 获取基地列表
  getBaseList = () => {
    staffRequest({
      url: getUrl('/staff/v1/queryBase')
    }).then(res => {
      if (res.code == 1) {
        this.setState({ baseList: res.data });
      } else {
        Taro.showToast({ title: res.message, icon: 'none', duration: 1500, mask: true });
      }
    }).catch(() => {
      Taro.showToast({ title: '获取基地失败，请重试！', icon: 'none', duration: 1500, mask: true });
    });
  }

  // 选择基地触发
  selectedBase = (e, baseId) => {
    this.getBaseGoodsList(baseId);
  }

  // 获取基地商品列表
  getBaseGoodsList = (id) => {
    staffRequest({
      url: getUrl('/staff/v1/getProductLists'),
      data: {
        baseId: id,
        dinnerDate: this.state.date
      }
    }).then(res => {
      if (res.code == 1) {
        this.setState({
          baseId: id,
          goodsList: res.data,
          type: 'cart'
        });
      } else if (res.code == 4000006) {
        Taro.showToast({ title: `${this.state.date} 该上车站暂无员工餐`, icon: 'none', duration: 1500, mask: true });
      } else {
        Taro.showToast({ title: res.message, icon: 'none', duration: 1500, mask: true });
      }
    })
  }

  // 选择订餐时间
  selectedDate = e => {
    this.setState({
      date: e.detail.value
    });
  }

  // 填充表单
  setFormValue = e => {
    this.setState({
      [e.currentTarget.dataset.name]: e.currentTarget.value
    })
  }

  // 添加商品
  addGoods = (e, goods) => {
    let goodsList = [...this.state.selectedGoddsList];
    // 判断购物车里是否有当前商品
    if (goodsList.some(item => item.productId === goods.productId)) {
      // 有，增加数量
      goodsList.forEach(item => {
        if (item.productId === goods.productId) {
          item['quantity']++;
        }
      });
      this.calculationTotal(goodsList);
    } else {
      // 无，新增商品
      goods['quantity'] = 1;
      goodsList.push(goods);
      this.calculationTotal(goodsList);
    }
  }

  // 删除选中商品
  removeGoods = (e, goods) => {
    goods['quantity'] = 0;
    let goodsList = this.state.selectedGoddsList.filter(item => item.productId !== goods.productId);
    this.calculationTotal(goodsList);
  }

  // 修改当前商品数量
  changeSelectedGoodsNum = (num, goods) => {
    let goodsList = this.state.selectedGoddsList;
    goodsList.forEach(item => {
      if (item.productId === goods.productId) {
        item['quantity'] = +num;
      }
    });
    this.calculationTotal(goodsList);
  }

  // 计算总数和总价
  calculationTotal = (goodsList) => {
    let totalPrice = 0;
    let totalNum = 0;
    goodsList.forEach(goods => {
      totalNum += goods.quantity;
      totalPrice += +goods.productPrice * goods.quantity;
      goods['priceSum'] = +goods.productPrice * goods.quantity;
    });
    this.setState({
      totalPrice,
      totalNum,
      selectedGoddsList: goodsList
    });
  }

  // 显示/隐藏购物车
  toggleCartFLoat = () => {
    this.setState({ isShowCartDetail: !this.state.isShowCartDetail });
  }

  // 检验购物车商品数量
  regCart = () => {
    if (!this.state.selectedGoddsList.length) {
      Taro.showToast({ title: `请先选择员工餐`, icon: 'none', duration: 1500, mask: true });
      return;
    }
    let checkGoods = {};
    this.state.selectedGoddsList.forEach(goods => {
      checkGoods[goods.productId] = goods;
    });
    staffRequest({
      url: getUrl('/staff/v1/settlement'),
      data: {
        checkGoods,
        dinnerDate: this.state.date
      }
    }).then(res => {
      if (res.code == 1) {
        this.setState({ type: 'pay' });
      } else {
        Taro.showToast({ title: `${res.message}`, icon: 'none', duration: 1500, mask: true });
      }
    }).catch(() => {
      Taro.showToast({ title: `操作失败，请重试`, icon: 'none', duration: 1500, mask: true });
    });
  }

  // 提交表单
  submitForm = e => {
    if (!this.state.selectedGoddsList.length) {
      Taro.showToast({ title: `请选择员工餐后再支付`, icon: 'none', duration: 1500, mask: true });
      return;
    }
    staffRequest({
      url: getUrl('/staff/v1/staffCreateOrder'),
      data: {
        formId: e.detail.formId,
        baseId: this.state.baseId,
        baseName: this.state.baseList.find(item => item.baseId === this.state.baseId).baseName,
        totalPrice: this.state.totalPrice,
        dinnerDate: this.state.date,
        orderLists: this.state.selectedGoddsList,
        train: this.state.train
      }
    }).then(res => {
      if (res.code == 1) {
        if (res.data.orderStatus == 2) {
          // 内部员工直接支付成功
          this.paySuccess();
        } else if (res.data.orderStatus == 1) {
          staffRequest({
            url: getUrl('/staff/v1/staffPay'),
            data: {
              orderNumber: res.data.orderNumber
            }
          }).then(payInfo => {
            if (payInfo.code == 1) {
              Taro.requestPayment({
                'timeStamp': payInfo.data.timeStamp,
                'nonceStr': payInfo.data.nonceStr,
                'package': payInfo.data.package,
                'signType': payInfo.data.signType,
                'paySign': payInfo.data.paySign
              }).then(() => {
                this.paySuccess();
              }).catch(() => {
                Taro.showToast({ title: `支付失败`, icon: 'none', duration: 1500, mask: true });
              });
            } else {
              Taro.showToast({ title: `${payInfo.message}`, icon: 'none', duration: 1500, mask: true });
            }
          }).catch(() => {
            Taro.showToast({ title: `支付失败`, icon: 'none', duration: 1500, mask: true });
          });
        }
      } else {
        Taro.showToast({ title: `${res.message}`, icon: 'none', duration: 1500, mask: true });
      }
    }).catch(() => {
      Taro.showToast({ title: `操作失败，请重试`, icon: 'none', duration: 1500, mask: true });
    });
  }

  paySuccess = () => {
    Taro.showToast({ title: `支付成功`, icon: 'none', duration: 1500, mask: true });
    const timer = setTimeout(() => {
      Taro.redirectTo({url: '/pages/staffMeal/home/index'});
      clearTimeout(timer);
    }, 1500);
  }

  render () {
    return (
      <View className='cart'>
        {
          this.state.type === 'base'
          &&
          <View className='base-container'>
            <View className='title'>选择用餐时间</View>
            <View className='date-picker-container'>
              <Picker
                className='date-picker'
                mode='date'
                value={this.state.date}
                start={this.state.date}
                end={this.state.endDate}
                onChange={this.selectedDate}
              >
                <View>{this.state.date}</View>
              </Picker>
            </View>
            <View className='title'>选择保障基地</View>
            <AtList hasBorder={false}>
              {
                this.state.baseList.map((base, idx) => {
                  return (
                    <AtListItem
                      title={base.baseName}
                      arrow='right'
                      key={idx}
                      onClick={e => this.selectedBase(e, base.baseId)}
                    >
                    </AtListItem>
                  )
                })
              }
            </AtList>
            <View className='tip'>
              <View>温馨提示：</View>
              <View>该处选择的是保障基地，为我司内部配送业务的责任划分，与实际上餐站点无关。每个车次均有固定的保障基地划分，为保证配送成功，必须填写值乘车次对应保障基地，如有不清楚，可向餐车值乘人员咨询。</View>
            </View>
          </View>
        }
        {
          this.state.type === 'cart'
          &&
          <View className='cart-container'>
            <View className='tip'>温馨提示：每个用餐日期最多选择一份早餐和两份正餐商品</View>
            <View className='item-container'>
              {
                this.state.goodsList.map((goods, idx) => {
                  return (
                    <View className='item' key={idx} onClick={e => this.addGoods(e, goods)}>
                      <View className='tag'>
                        {
                          goods.goodsType == 1
                          ?
                          <Text>早餐</Text>
                          :
                          <Text>正餐</Text>
                        }
                      </View>
                      <Image src={goods.productImg}  mode='aspectFit' className='img'></Image>
                      <View className='name'>{goods.productName}</View>
                      <View className='bottom'>
                        <Text className='price'>￥{goods.productPrice}</Text>
                        <View className='staff-cart-icon'>
                          {
                            goods.quantity > 0 &&
                            <Text className='goods-num'>{goods.quantity}</Text>
                          }
                        </View>
                      </View>
                    </View>
                  )
                })
              }
              <View className='cart-bar'>
                <View className='price'>
                  <AtBadge value={this.state.totalNum}>
                    <View className='at-icon at-icon-shopping-cart' onClick={this.toggleCartFLoat}></View>
                  </AtBadge>
                  <Text>共需支付 ￥{this.state.totalPrice} 元</Text>
                </View>
                <View className='to-pay-btn' onClick={this.regCart}>去结算</View>
              </View>
            </View>

            <AtFloatLayout isOpened={this.state.isShowCartDetail} onClose={this.toggleCartFLoat}>
              <View className='at-row'>
                <View className='at-col at-col-5 cart-list-title text-left'>商品名称</View>
                <View className='at-col at-col-4 cart-list-title'>商品数量</View>
                <View className='at-col at-col-3 cart-list-title'>操作</View>
              </View>
              {
                this.state.selectedGoddsList.map((goods, idx) => {
                  return (
                    <View className='at-row' key={idx}>
                      <View className='at-col at-col-5'>{goods.productName}</View>
                      <View className='at-col at-col-4'>
                        <AtInputNumber value={goods.quantity} onChange={num => this.changeSelectedGoodsNum(num, goods)} min={1}></AtInputNumber>
                      </View>
                      <View className='at-col at-col-3'>
                        <View className='goods-detail-btn' onClick={e => this.removeGoods(e, goods)}>删除</View>
                      </View>
                    </View>
                  )
                })
              }
              <View className='at-row'>
                <View className='at-col at-col-12'>
                  <View className='cart-list-btn' onClick={this.toggleCartFLoat}>确认</View>
                </View>
              </View>
            </AtFloatLayout>
          </View>
        }
        {
          this.state.type === 'pay'
          &&
          <View className='pay-container'>
            <View className='title'>订单信息</View>
            <View className='goods-list-container'>
              {
                this.state.selectedGoddsList.map((goods, idx) => {
                  return (
                    <View className='at-row' key={idx}>
                      <View className='at-col at-col-8'>{goods.productName}</View>
                      <View className='at-col at-col-2'>{goods.quantity}份</View>
                      <View className='at-col at-col-2'>￥{goods.priceSum}</View>
                    </View>
                  )
                })
              }
            </View>
            <View className='title'>用餐信息</View>
            <View className='train-container'>
              <View className='at-row'>
                <View className='at-col at-col-3'>用餐日期</View>
                <View className='at-col at-col-9'>{this.state.date}</View>
              </View>
              <View className='at-row'>
                <View className='at-col at-col-3'>车次</View>
                <View className='at-col at-col-9'>
                  <Input placeholder='请填写车次' className='train-input' data-name='train' onInput={this.setFormValue}></Input>
                </View>
              </View>
              <View className='at-row tip'>
                <View className='at-col at-col-2'>提示：</View>
                <View className='at-col at-col-10'>
                  <View>未填写车次会导致餐食无法配送上车，订单费用将不予退还，请确保在开车前一天18：00前填写好车次</View>
                </View>
              </View>
            </View>
            <View className='title'>支付方式</View>
            <View className='at-row pay-type-container'>
              {
                this.state.staffType === 0
                  ?
                  <View className='at-col at-col-3'>
                    <View className='pay-type-btn'>微信</View>
                  </View>
                  :
                  <View className='at-col at-col-6'>
                    <View className='pay-type-btn'>内部员工免费</View>
                  </View>
              }
            </View>
            <Form reportSubmit onSubmit={this.submitForm}>
              {
                this.state.staffType === 0
                  ?
                  <Button className='bottom-btn' formType='submit'>马上支付（￥{this.state.totalPrice}）</Button>
                  :
                  <Button className='bottom-btn' formType='submit'>确认下单</Button>
              }
            </Form>
          </View>
        }
      </View>
    )
  }
}

export default Index
