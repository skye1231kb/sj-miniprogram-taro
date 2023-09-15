import Taro from '@tarojs/taro'
import { request, getUrl, GET_PAYMENT_METHOD, EXECUTION_PAYMENT, MPID } from '../api'

// 获取支付方式
const getPaymentMethod = (orderInfo, train) => {
  if (!orderInfo) {
    return;
  }
  Taro.showLoading({ mask: true, title: '加载中...' });
  return new Promise((resolve, reject) => {
    request({
      url: getUrl(GET_PAYMENT_METHOD),
      data: {
        train: train,
        order_id: orderInfo.order_id,
        protype: orderInfo.protype,
        mp_id: MPID
      }
    }).then(res => {
      Taro.hideToast();
      if (res.error_code === 'ok') {
        resolve(res.data[0]);
      } else {
        reject('获取支付方式失败');
      }
    }).catch(() => {
      Taro.hideToast();
      reject();
    });
  });
}

// 获取支付信息
const executionPayment = (orderInfo, payMethod) => {
  if (!payMethod) {
    return;
  }
  Taro.showLoading({ mask: true, title: '加载中...' });
  return new Promise((resolve, reject) => {
    request({
      url: getUrl(EXECUTION_PAYMENT),
      data: {
        bid: orderInfo.bid,
        mch_id: payMethod.mch_id,
        trade_type: payMethod.trade_type
      }
    }).then(res => {
      Taro.hideToast();
      if (res.error_code === 'ok') {
        resolve(res.data);
      } else {
        reject(res.msg);
      }
    }).catch(() => {
      Taro.hideToast();
      reject(); 
    });
  });
}

// 请求微信支付
export default function pay (orderInfo, train) {
  getPaymentMethod(orderInfo, train)
  .then(payMethod => executionPayment(orderInfo, payMethod))
  .then(
    payInfo => {
      const payParams = {
        timeStamp: payInfo.sj.timeStamp,
        nonceStr: payInfo.sj.nonceStr,
        package: payInfo.sj.packages,
        signType: payInfo.sj.signType,
        paySign: payInfo.sj.paySign,
      }
      return Taro.requestPayment(payParams);
    }
  )
  .then(() => {
    setTimeout(() => {
      Taro.reLaunch({url: '/pages/order/pay/pay_success/pay_success'});
    }, 500);
  })
  .catch(str => {
    if (str && typeof str === 'string') {
      Taro.showToast({ title: str, icon: 'none', duration: 1500, mask: true }).then(() => {
        setTimeout(() => {
          Taro.reLaunch({url: '/pages/order/pay/pay_fail/pay_fail?orderId=' + orderInfo.order_id});
        }, 1500);
      });
    } else {
      setTimeout(() => {
        Taro.reLaunch({url: '/pages/order/pay/pay_fail/pay_fail?orderId=' + orderInfo.order_id});
      }, 500);
    }
  });
}
