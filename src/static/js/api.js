import Taro from '@tarojs/taro'

// 正式环境
// export const BASE_URL = 'https://v3i.minicart.cn';
export const MPID = 9;
export const BID = 1;

// 测试环境
export const BASE_URL = 'https://v3it.minicart.cn';

export const GET_TOKEN = "/shopping/v1/getXcxToken"; // 登录后台获取token

export const ADVERT = '/shopping/v2/advert'; // 获取首页广告图
export const IS_RECONNENTION = '/shopping/v2/getIsReconnection'; // 判断是否重连车
export const GET_TRAIN_ALL_STATION = '/shopping/v2/getTrainAllStation'; // 获取车次所有站点
export const GET_DELIVERY_TIME = '/shopping/v2/getDeliveryTime'; // 获取配送时间段
export const CREATE_ORDER = '/shopping/v2/createSjOrder'; // 创建订单
export const GET_ORDER_LIST = '/shopping/v2/sjOrderList'; // 订单列表
export const GET_ORDER_DETAIL = '/shopping/v2/sjOrderDetail'; // 订单详情
export const GET_INVOICE_INFO = '/shopping/v1/getInvInfo'; // 发票信息
export const SEND_INVOICE_INFO = '/shopping/v3/invEli'; // 提交发票信息
export const SEND_INVOICE_EMAIL = '/shopping/v1/sendEmail'; // 重发电子邮件
export const GET_PAYMENT_METHOD = '/shopping/v2/getPaymentMethod'; // 获取支付方式
export const EXECUTION_PAYMENT = '/shopping/v2/executionPayment'; // 获取支付信息

export const GET_ACTIVE = '/shopping/v1/getActive'; // 获取活动广告图
export const GET_GOODS_LIST = '/shopping/v2/currCateProduct'; // 获取商品列表
export const GET_TRAIN_NUM = '/shopping/v3/getTrainnum'; // 获取车次列表

export const getUrl = (url) => {
  return BASE_URL + url;
}

// 发出ajax请求
export const request = ({url, data = {}, header = {}}) => {
  const token = Taro.getStorageSync('token') || '';

  // 设置默认请求头
  header['X-Mpid'] = MPID;
  header['X-Bid'] = BID;
  header['token'] = token;
  return new Promise((resolve, reject) => {
    Taro.request({
      method: 'POST',
      url,
      data,
      header
    }).then(res => {
      if (res.statusCode === 200 && res.data) {
        if ([10001, 400005, 400004].includes(res.data.error_code)) {
          getUserInfo(url, data, header)
            .then(result => resolve(result))
            .catch(() => reject());
        } else {
          resolve(res.data);
        }
      } else {
        reject();
      }
    }).catch(error => reject(error));
  });
}

// 获取用户信息
const getUserInfo = (url, data, header) => {
  return new Promise((resolve, reject) => {
    Taro.getUserInfo().then(userInfo => {
      if (userInfo.errMsg === 'getUserInfo:ok') {
        platformLogin(url, data, header, userInfo.userInfo).then(result => resolve(result));
      } else {
        reject();
      }
    });
  });
}

// 登录平台
const platformLogin = (url, data, header, userInfo) => {
  return new Promise((resolve, reject) => {
    Taro.login().then(res => {
      if (res.code) {
        login(url, data, header, userInfo, res.code).then(result => resolve(result));
      } else {
        reject();
      }
    });
  });
}

// 登录后台
const login = (url, data, header, userInfo, code) => {
  return new Promise((resolve, reject) => {
    request({
      url: getUrl(GET_TOKEN),
      data: {
        id: MPID,
        code,
        avatarUrl: userInfo.avatarUrl,
        gender: userInfo.gender,
        nickName: userInfo.nickName
      }
    }).then(res => {
      if (res.error_code === 'ok') {
        Taro.setStorage({key: 'token', data: res.token});
        // 重新请求
        request({ url, data, header }).then(result => resolve(result));
      } else {
        reject();
      }
    });
  });
}
