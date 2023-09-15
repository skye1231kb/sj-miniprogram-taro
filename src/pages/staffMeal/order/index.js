import Taro, { Component } from '@tarojs/taro'
import { View, Button, Input, Text } from '@tarojs/components'
import { AtActionSheet, AtActionSheetItem, AtFloatLayout } from "taro-ui"

// js
import moment from 'moment'
import { getUrl, staffRequest } from '../../../static/js/api'

// css
import './index.scss'

class Index extends Component {

  config = {
    navigationBarBackgroundColor: '#006699',
    navigationBarTextStyle: 'white',
    navigationBarTitleText: '员工订单'
  }

  constructor(props) {
    super(props);
    this.state = {
      resons: ['临时调班', '不想订了'],
      orderList: [],
      isShowActionSheet: false,
      orderNumber: '',
      isShowFloat: false,
      train: ''
    }
  }

  componentWillMount () {
    this.getOrderList();
  }

  componentDidMount () { }

  // 获取订单列表
  getOrderList = () => {
    staffRequest({
      url: getUrl('/staff/v1/queryOrderLists')
    }).then(res => {
      if (res.code == 1) {
        let orders = [];
        const todayNoon = `${moment().format('YYYY-MM-DD')} 12:00:00`; // 当天12点
        const afterTwoDay = moment().add(2, 'd'); // 2天后
        const afterThreeDay = moment().add(3, 'd'); // 3天后
        res.data.forEach(order => {
          order['isReturn'] = false;
          const orderTime = moment(order.dinnerDate); // 订单时间
          if (order.orderStatus == 2) {
            if (moment().isBefore(todayNoon)) {
              // 当天12点前能取消两天后的订单
              if (orderTime.isSame(afterTwoDay)) {
                order['isReturn'] = true;
              }
            } else {
              // 当天12点后只能取消三天后的订单
              if (orderTime.isSame(afterThreeDay)) {
                order['isReturn'] = true;
              }
            }
          }
          orders.push(order);
        });

        this.setState({ orderList: orders });
      }
    });
  }

  // 打开/关闭取消订单原因弹窗
  toogleActionSheet = (e) => {
    const orderNumber = e ? e.currentTarget.dataset.ordernumber : '';
    this.setState({ isShowActionSheet: !this.state.isShowActionSheet, orderNumber });
  }

  // 取消订单
  refundOrder = (e, idx) => {
    if (!this.state.orderNumber) {
      Taro.showToast({ title: '获取订单号失败，请重新操作', icon: 'none', duration: 1500, mask: true });
      this.toogleActionSheet();
      return;
    }
    staffRequest({
      url: getUrl('/staff/v1/refundOrder'),
      data: {
        orderNumber: this.state.orderNumber,
        refundReason: this.state.resons[idx]
      }
    }).then(res => {
      this.toogleActionSheet();
      if (res.code == 1) {
        Taro.showToast({ title: '取消订单成功', icon: 'none', duration: 1500, mask: true });
        this.getOrderList();
      } else {
        Taro.showToast({ title: res.message, icon: 'none', duration: 1500, mask: true });
      }
    }).catch(() => {
      Taro.showToast({ title: '操作失败，请重试', icon: 'none', duration: 1500, mask: true });
    })
  }

  // 打开/关闭填写车次弹窗
  toogleFloat = (e) => {
    const orderNumber = e ? e.currentTarget.dataset.ordernumber : '';
    this.setState({ isShowFloat: !this.state.isShowFloat, orderNumber });
  }

  // 设置表单值
  setFormValue = (e) => {
    this.setState({ [e.currentTarget.dataset['name']]: e.currentTarget.value });
  }

  // 填写车次
  trainAdd = () => {
    if (!this.state.train) {
      Taro.showToast({ title: '请输入车次', icon: 'none', duration: 1500, mask: true });
      return;
    }
    if (!this.state.orderNumber) {
      Taro.showToast({ title: '获取订单号失败，请重新操作', icon: 'none', duration: 1500, mask: true });
      this.toogleFloat();
      return;
    }
    staffRequest({
      url: getUrl('/staff/v1/editOrderTrain'),
      data: {
        orderNumber: this.state.orderNumber,
        train: this.state.train
      }
    }).then(res => {
      this.toogleFloat();
      if (res.code == 1) {
        Taro.showToast({ title: '填写车次成功', icon: 'none', duration: 1500, mask: true });
        this.getOrderList();
      } else {
        Taro.showToast({ title: res.message, icon: 'none', duration: 1500, mask: true });
      }
    }).catch(() => {
      Taro.showToast({ title: '操作失败，请重试', icon: 'none', duration: 1500, mask: true });
    })
  }

  render () {
    return (
      <View className='order'>
        {
          this.state.orderList.map((order, idx) => {
            return (
              <View className='order-item-container' key={idx}>
                <View className='header'>
                  <View>{order.orderNumber}</View>
                  <View>{order.train || ' '}</View>
                  <View>{order.dinnerDate}用餐</View>
                </View>
                {
                  order.lists.map((goods, i) => {
                    return (
                      <View className='goods' key={i * 10000}>
                        <View>{goods.productName}</View>
                        <View>{goods.quantity}份 ￥{goods.productPrice}</View>
                      </View>
                    )
                  })
                }
                <View className='footer'>
                  <View className='status'>{order.orderStatusText}</View>
                  {
                    !order.train && order.orderStatus == 2
                      ?
                      <Button
                        className='btn'
                        data-ordernumber={order.orderNumber}
                        onClick={e => this.toogleFloat(e)}
                      >
                        填写车次
                      </Button>
                      :
                      <Text decode='emsp'>&emsp;</Text>
                  }
                  {
                    order.isReturn
                      ?
                      <Button
                        className='btn'
                        data-ordernumber={order.orderNumber}
                        onClick={e => this.toogleActionSheet(e)}
                      >
                        取消订单
                      </Button>
                      :
                      <Text decode='emsp'>&emsp;</Text>
                  }
                </View>
              </View>
            )
          })
        }

        <AtActionSheet 
          isOpened={this.state.isShowActionSheet} 
          title='请选择取消原因' 
          cancelText='取消'
          onCancel={this.toogleActionSheet}
        >
          {
            this.state.resons.map((item, idx) => {
              return (
                <AtActionSheetItem key={idx} onClick={e => this.refundOrder(e, idx)}>{item}</AtActionSheetItem>
              )
            })
          }
        </AtActionSheet>

        <AtFloatLayout isOpened={this.state.isShowFloat}>
          <View className='float-form-container'>
            车次 <Input 
              className='float-input' 
              placeholder='请填写车次' 
              maxLength='20' 
              data-name='train'
              onInput={this.setFormValue}
            ></Input>
          </View>
          <View>
            <Button className='float-btn' onClick={this.trainAdd}>确定</Button>
          </View>
        </AtFloatLayout>
      </View>
    )
  }
}

export default Index