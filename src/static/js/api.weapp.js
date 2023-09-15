import Taro from '@tarojs/taro'

// 正式环境
export const BASE_URL = 'https://v3i.minicart.cn';
// export const BASE_URL = 'https://v3i.yishizongheng.com';
// 测试环境
// export const BASE_URL = 'https://v3it.minicart.cn';
// export const BASE_URL = 'https://v3it.yishizongheng.com';

export const MPID = 9;
export const BID = 1;


export const GET_TOKEN = "/shopping/v1/getXcxToken"; // 登录后台获取token

export const ADVERT = '/shopping/v2/advert'; // 获取首页广告图
export const IS_RECONNENTION = '/shopping/v2/getIsReconnection'; // 判断是否重连车
export const GET_TRAIN_ALL_STATION = '/shopping/v2/getTrainAllStation'; // 获取车次所有站点
export const GET_DELIVERY_TIME = '/shopping/v2/getDeliveryTime'; // 获取配送时间段
export const CREATE_ORDER = '/shopping/v2/createSjOrder'; // 创建订单
export const CREATE_OFFLINE_ORDER = '/shopping/v2/createOfflineOrder'; // 创建扫A8二维码订单
export const GET_ORDER_LIST = '/shopping/v2/sjOrderList'; // 订单列表
export const URGE_ORDER = '/shopping/v2/urgeOrder'; // 催单
export const GET_ORDER_DETAIL = '/shopping/v2/sjOrderDetail'; // 订单详情
export const GET_INVOICE_INFO = '/shopping/v1/getInvInfo'; // 发票信息
export const SEND_INVOICE_INFO = '/shopping/v3/invEli'; // 提交发票信息
export const SEND_INVOICE_EMAIL = '/shopping/v1/sendEmail'; // 重发电子邮件
export const BEFORE_CREATE_ORDER = '/shopping/v2/beforeCreateSjOrder'; // 预下单
export const GET_PAYMENT_METHOD = '/shopping/v2/getPaymentMethod'; // 获取支付方式
export const EXECUTION_PAYMENT = '/shopping/v2/executionPayment'; // 获取支付信息

export const GET_ACTIVE = '/shopping/v1/getActive'; // 获取活动广告图
export const GET_GOODS_LIST = '/shopping/v2/currCateProduct'; // 获取商品列表
export const GET_PRODUCT_LIST = '/shopping/v2/ProductList'; // 获取A8商品列表
export const GET_PRODUCT_RECITEM_LIST = '/api/productRec/getProductRecItem'; // 获取美味推荐商品列表
export const GET_TRAIN_NUM = '/shopping/v3/getTrainnum'; // 获取车次列表
export const GET_TRAIN_INFO = '/shopping/v1/getTravelInfo'; // 根据 mcode 获取车次信息
export const CREATE_FACE_DORDER = '/shopping/v2/facePayment'; // 创建当面订单
export const BIND_ORDER_FOR_MEMBER = '/shopping/v2/bindingMember'; // 绑定订单到用户

export const BIND_MOBILE = '/shopping/v1/bindMobile'; // 绑定手机号
export const MEMBER_INFO = '/shopping/v3/member/info'; // 获取用户信息
export const SIGN_IN = '/shopping/v3/member/signIn'; // 签到
export const GET_MEMBER_POINTS = '/shopping/v3/member/getMemberPoints'; // 获取用户积分详情
export const GET_MEMBER_POINTS_LIST = '/shopping/v3/member/getMemberPointsHistoryList'; // 获取用户积分列表
export const GET_ACTIVE_RANGE = '/shopping/v3/Train/getActivityAndTeamByTrain'; // 获取活动推广范围

export const GET_TOP_BANNER = '/api/homepage/getTopBanner'; // 获取首页顶部banner
export const GET_MIDDLE_BANNER = '/api/homepage/getMiddleBanner'; // 获取首页中部banner
export const GET_PRODUCT_RECITEM = '/api/homepage/getProductRecItem'; // 获取首页美味推荐
export const GET_FIRST_SCHEDULE = '/api/schedule/getFirstSchedule'; // 获取行程列表
export const GET_SCHEDULE_LIST = '/api/schedule/getScheduleList'; // 获取行程列表
export const GET_HISTORY_SCHEDULE_LIST = '/api/schedule/getHistory'; // 获取历史行程列表

export const getUrl = (url) => {
  return BASE_URL + url;
}

// 发出ajax请求
export const request = ({url, data = {}, header = {}}) => {
  Taro.showLoading({ mask: true, title: '加载中...' });
  const token = Taro.getStorageSync('token') || '';

  // 设置默认请求头
  header['X-Mpid'] = MPID;
  header['X-Bid'] = BID;
  header['token'] = token;
  header['testapp'] = BID;

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
            .catch(() => {
              Taro.hideLoading();
              reject();
            });
        } else {
          Taro.hideLoading();
          resolve(res.data);
        }
      } else {
        Taro.hideLoading();
        reject();
      }
    }).catch(error => {
      Taro.hideLoading();
      reject(error)
    });
  });
}

// 获取用户信息
const getUserInfo = (url, data, header) => {
  return new Promise((resolve, reject) => {
    Taro.getSetting().then(res => {
      if (res.authSetting['scope.userInfo']) {
        Taro.getUserInfo().then(userInfo => {
          if (userInfo.errMsg === 'getUserInfo:ok') {
            platformLogin(url, data, header, userInfo.userInfo).then(result => resolve(result));
          } else {
            reject();
          }
        }).catch(() => reject());
      } else {
        reject();
      }
    }).catch(() => reject());
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

// 员工登录
export const staffRequest = ({url, data = {}}) => {
  Taro.showLoading({ mask: true, title: '加载中...' });
  return new Promise((reslove, reject) => {
    const staffToken = Taro.getStorageSync('staffToken');
    Taro.request({
      method: 'POST',
      url,
      data,
      header: {
        staffToken
      }
    }).then(res => {
      Taro.hideLoading();
      if (res.data.code == 4000003) {
        Taro.showToast({ title: `${res.data.message} ,请重新登录！`, icon: 'none', duration: 1500, mask: true });
        reject();
        const timer = setTimeout(() => {
          Taro.redirectTo({ url: '/pages/staffMeal/index' });
          clearTimeout(timer);
        }, 1500);
      } else {
        reslove(res.data);
      }
    }).catch(() => {
      reject();
      Taro.showToast({ title: `请重试！`, icon: 'none', duration: 1500, mask: true });
    });
  });
}
