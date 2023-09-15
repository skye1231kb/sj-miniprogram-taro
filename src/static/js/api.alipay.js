import Taro from '@tarojs/taro'
import md5 from 'md5'

// 正式环境
export const BASE_URL = 'https://v3i.minicart.cn';
// export const BASE_URL = 'https://v3i.yishizongheng.com';
// 测试环境
// export const BASE_URL = 'https://v3it.minicart.cn';
// export const BASE_URL = 'https://v3it.yishizongheng.com';

export const MPID = '10002';
export const BID = '1';
const APP_SECRET = 'MTMyMWFkYXNjZGFnMzI5Nzkx';

export const GET_TOKEN = "/user-center/api/alipayLogin"; // 登录后台获取token

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

function getSign(params, nonceStr) {
  if (typeof params == "string") {
    return paramsStrSort(params);
  } else if (typeof params == "object") {
    let arr = [];
    arr.push(`mpid=${MPID}`);
    arr.push(`noncestr=${nonceStr}`);
    for (let i in params) {
      arr.push((i + "=" + params[i]));
    }
    return paramsStrSort(arr.join(("&")));
  }
}

function paramsStrSort(paramsStr) {
  let urlStr = paramsStr.split("&").sort().join("&");
  let newUrl = `${urlStr}&key=${APP_SECRET}`;
  return md5(newUrl);
}

// 发出ajax请求
export const request = ({url, data = {}, header = {}}, isSign = true) => {
  const token = Taro.getStorageSync('token') || '';

  // 设置默认请求头
  header['X-Mpid'] = MPID;
  header['X-Bid'] = BID;
  header['token'] = token;
  header['testapp'] = BID;
  if (isSign) {
    // 接口签名
    let nonceStr = new Date().getTime().toString();
    data['sign'] = getSign(data, nonceStr).toUpperCase();
    data['noncestr'] = nonceStr;
    data['mpId'] = MPID;
  }
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
    my.getSetting({
      success (res) {
        if (res.authSetting['userInfo']) {
          my.getOpenUserInfo({
            fail: () => {
              reject();
            },
            success: (info) => {
              let userInfo = JSON.parse(info.response).response;
              getAuthCode(url, data, header, userInfo).then(result => resolve(result));
            }
          });
        } else {
          getAuthCode(url, data, header).then(result => resolve(result));
        }
      },
      fail () {
        getAuthCode(url, data, header).then(result => resolve(result));
      }
    });
  });
}

// 获取 auth_code
const getAuthCode = (url, data, header, userInfo = {}) => {
  return new Promise((resolve, reject) => {
    my.getAuthCode({
      scopes: 'auth_base',
      success: (res) => {
        login(url, data, header, userInfo, res.authCode).then(result => resolve(result));
      },
      fail: () => {
        reject();
      }
    })
  })
}

// 登录后台
const login = (url, data, header, userInfo, code) => {
  return new Promise((resolve, reject) => {
    let gender;
    // 判断性别
    if (userInfo.gender === 'm') {
      gender = 1;
    } else if (userInfo.gender === 'f') {
      gender = 2;
    } else {
      gender = 0;
    }
    request({
      url: getUrl(GET_TOKEN),
      data: {
        id: MPID,
        code,
        avatar: userInfo.avatar,
        gender,
        nickname: userInfo.nickName
      }
    }).then(res => {
      if (res.code === 1) {
        Taro.setStorage({key: 'token', data: res.data});
        // 重新请求
        request({ url, data, header }, false).then(result => resolve(result));
      } else {
        reject();
      }
    });
  });
}
