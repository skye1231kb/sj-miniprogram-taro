import Taro from '@tarojs/taro'
import moment from 'moment';

export default class Utils {

  // 验证手机号码
  static regMobile = mobile => {
    return /^1[0-9]{1}\d{9}$/.test(mobile);
  }

  // 验证中英文输入
  static regZhOrEn = str => {
    return /^[\u4e00-\u9fa5_a-zA-Z0-9\u00a0|\u0020]+$/.test(str);
  }

  // 验证金额
  static regAmount = amount => {
    return /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/.test(amount);
  }
  
  // 判断是否为活动时间
  static isInTimeRange = (startTime, endTime) => {
    return moment().isAfter(startTime) && moment().isBefore(endTime);
  }
  
  // 处理时间格式
  static formatDate = (date = new Date(), format = 'YYYY-MM-DD') => {
    return moment(date).format(format);
  }
  
  // 是否为微信小程序
  static isWeApp = () => {
    return Taro.getEnv() === 'WEAPP';
  }
  
  // 是否为支付宝小程序
  static isAliPay = () => {
    return Taro.getEnv() === 'ALIPAY';
  }
  
  // 获取当前时间范围（小时）
  static getCurrentDateRangeForHour = () => {
    return `${moment().format('HH')}:00:00-${moment().add(1, 'h').format('HH')}:59:59`;
  }

}

