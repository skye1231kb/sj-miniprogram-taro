import Taro, {Component} from '@tarojs/taro'
import { connect } from '@tarojs/redux'
import {View, Swiper, SwiperItem, Image, Navigator} from '@tarojs/components'

// js
// import moment from "moment"
import {
  request,
  getUrl,
  GET_TRAIN_NUM,
  GET_TOP_BANNER,
  GET_MIDDLE_BANNER,
  GET_PRODUCT_RECITEM,
  GET_FIRST_SCHEDULE,
} from '../../static/js/api'
import { STATIONS } from '../../static/js/common'
import Utils from '../../static/js/utils/utils';

// component
// import AuthButton from "../../components/anth_button/auth_button";

// css img
import './index.scss'
import mallBanner from '../../static/img/index/mall_banner.png'

// redux
import {
  onChangeAuthType,
  onSetPromoteStation,
  onAddTrain,
  onSetCarriage,
  onChangeIsLink
} from '../../store/actions/action'

const APP = Taro.getApp();

@connect(({reducers}) => (
  {...reducers}
), (dispatch) => ({
  onChangeAuthType (payload) {
    dispatch(onChangeAuthType(payload));
  },
  onSetPromoteStation (payload) {
    dispatch(onSetPromoteStation(payload));
  },
  onAddTrain (payload) {
    dispatch(onAddTrain(payload));
  },
  onSetCarriage (payload) {
    dispatch(onSetCarriage(payload));
  },
  onChangeIsLink (payload) {
    dispatch(onChangeIsLink(payload));
  }
}))
class Index extends Component {

  config = {
    navigationStyle: 'custom'
  }

  constructor(props) {
    super(props);
    this.state = {
      currentBannerIdx: 0,
      topBannerList: [],
      middleBannerList: [],
      productRecList: [],
      // currentSchedule: null
    }
  }

  componentWillMount () {
  }

  componentDidMount() {
    this.isScanIn();
    this.verifyAuth();
    this.getTopBanner();
    this.getMiddleBanner();
    this.getProductionRec();
    // this.getCurrentSchedule();
  }

  // 验证授权
  verifyAuth = () => {
    Taro.getSetting().then(res => {
      if (Utils.isWeApp()) {
        this.props.onChangeAuthType(!res.authSetting['scope.userInfo']);
      } else {
        this.props.onChangeAuthType(!res.authSetting['userInfo']);
      }
    }).catch(() => {
      this.props.onChangeAuthType(true);
      Taro.showToast({ title: '获取授权信息失败，请重新打开程序', icon: 'none', duration: 1500, mask: true });
    });
  }

  // 判断是否由一车一码进入
  isScanIn = () => {
    let q;
    // 判断是扫码进入哪个端的小程序
    if (Utils.isWeApp()) {
      q = this.$router.params['q'];
    } else if (Utils.isAliPay()) {
      q = Taro.getStorageSync('qrCode');
    }
    // q 存在即是扫码进入的
    if (q) {
      // 判断字段名
      let typeArr = decodeURIComponent(q).split('?')[1].split('=');
      if (typeArr[0] === 'code') {
        this.getTrainInfoForCode(typeArr[1]);
      } else if (typeArr[0] === 'station') {
        this.sendEventToAldStat(typeArr[1]);
      }
    }
  }

  // 根据一车一码code获取车次信息
  getTrainInfoForCode = code => {
    Taro.setStorageSync('trainCode', code);
    request({
      url: getUrl(GET_TRAIN_NUM),
      data: {
        qr_code: code
      }
    }).then(res => {
      if (res.error_code === 'ok') {
        // 判断是否为重联车
        if (res.data['d_link'] === 'Y') {
          this.props.onChangeIsLink(true);
        }
        this.props.onAddTrain(res.data['train']);
        this.props.onSetCarriage(res.data['cid']);
        Taro.navigateTo({ url: '/pages/index/site/site' });
      } else {
        Taro.showToast({title: res.msg, icon: 'none', duration: 1500, mask: true});
      }
    }).catch(() => {
      Taro.showToast({title: '获取车次列表失败，请重试', icon: 'none', duration: 1500, mask: true});
    });
  }

  // 获取顶部banner图片
  getTopBanner = () => {
    request({
      url: getUrl(GET_TOP_BANNER)
    }).then(res => {
      if (res.code === 1) {
        this.setState({ topBannerList: res.data });
      } else {
        Taro.showToast({title: res.message, icon: 'none', duration: 1500, mask: true});
      }
    }).catch(() => Taro.showToast({title: '获取顶部banner失败', icon: 'none', duration: 1500, mask: true}));
  }

  // 获取中部banner图片
  getMiddleBanner = () => {
    request({
      url: getUrl(GET_MIDDLE_BANNER)
    }).then(res => {
      if (res.code === 1) {
        this.setState({ middleBannerList: res.data });
      } else {
        Taro.showToast({title: res.message, icon: 'none', duration: 1500, mask: true});
      }
    }).catch(() => Taro.showToast({title: '获取新鲜事失败', icon: 'none', duration: 1500, mask: true}));
  }

  // 获取美味推荐列表
  getProductionRec = () => {
    request({
      url: getUrl(GET_PRODUCT_RECITEM)
    }).then(res => {
      if (res.code === 1) {
        this.setState({ productRecList: res.data.slice(0, 6) });
      } else {
        Taro.showToast({title: res.message, icon: 'none', duration: 1500, mask: true});
      }
    }).catch(() => Taro.showToast({title: '获取美味推荐列表失败', icon: 'none', duration: 1500, mask: true}));
  }

  // 获取当前行程
  getCurrentSchedule = () => {
    request({
      url: getUrl(GET_FIRST_SCHEDULE)
    }).then(res => {
      if (res.code === 1) {
        res.data.schedule.startTime = Utils.formatDate(res.data.schedule.startTime, 'HH:mm');
        res.data.schedule.endTime = Utils.formatDate(res.data.schedule.endTime, 'HH:mm');
        // this.setState({ currentSchedule: res.data });
      } else {
        Taro.showToast({title: res.message, icon: 'none', duration: 1500, mask: true});
      }
    }).catch(() => Taro.showToast({title: '获取行程失败', icon: 'none', duration: 1500, mask: true}))
  }

  // 车站推广统计分析
  sendEventToAldStat = (stationId) => {
    if (Utils.isWeApp()) {
      const H = Utils.getCurrentDateRangeForHour();
      APP.aldstat.sendEvent(STATIONS[stationId], H);
    }
    this.props.onSetPromoteStation(STATIONS[stationId]);
  }

  // 中部banner切换
  changeBanner = e => {
    this.setState({ currentBannerIdx: e.currentTarget.current });
  }

  // 跳转车站通小程序
  toMiniProgram = () => {
    if (Utils.isWeApp()) {
      const H = Utils.getCurrentDateRangeForHour();
      APP.aldstat.sendEvent('首页-快捷入口-旅客服务', H);
      Taro.navigateToMiniProgram({ appId: 'wx8d75e764f0c4bf1c' });
    } else if (Utils.isAliPay()) {
      Taro.navigateToMiniProgram({ appId: '2019012663094851' });
    }
  }

  // 跳转舌尖商城小程序
  toMealMiniProgram = (e, eventName) => {
    const H = Utils.getCurrentDateRangeForHour();
    APP.aldstat.sendEvent(eventName, H);
    Taro.navigateToMiniProgram({ appId: 'wx51a909520aeb57f6' });
  }

  // 事件统计埋点
  sendEvent = (e, eventName) => {
    if (Utils.isWeApp()) {
      const H = Utils.getCurrentDateRangeForHour();
      APP.aldstat.sendEvent(eventName, H);
    }
  }

  render () {
    const { topBannerList, middleBannerList, productRecList } = this.state;

    return (
      <View className='index'>
        <Swiper
          className='swiper'
          indicatorDots
          indicatorColor='rgba(255, 255, 255, .5)'
          indicatorActiveColor='rgb(255, 255, 255)'
          autoplay
          interval={4000}
          circular
          previousMargin='0px'
          nextMargin='0px'
        >
          {
            Utils.isWeApp() &&
            <SwiperItem>
              <Image
                onClick={e => this.toMealMiniProgram(e, '首页-banner-舌尖上的商城')}
                src={mallBanner}
                className='banner'
              />
            </SwiperItem>
          }
          {
            topBannerList.map((banner, i) => {
              return (
                <SwiperItem key={i}>
                  {
                    banner.linkType.key === 0 &&
                    <Image src={banner.imageUrl} className='banner' />
                  }
                  {
                    banner.linkType.key === 1 &&
                    <Navigator url={`/pages/h5/index?path=${banner.toUrl}`}>
                      <Image src={banner.imageUrl} className='banner' />
                    </Navigator>
                  }
                </SwiperItem>
              )
            })
          }
        </Swiper>

        <View className='nav-bar'>
          <View
            className='nav-item'
            onClick={this.toMiniProgram}
          >
            <View className='nav-icon traveller-service' />
            <View>旅客服务</View>
          </View>
          <Navigator url='/pages/index/guide/guide' onClick={e => this.sendEvent(e, '首页-订餐指南')}>
            <View className='nav-item'>
              <View className='nav-icon guide' />
              <View>订餐指南</View>
            </View>
          </Navigator>
          <Navigator url='/pages/index/common/common' onClick={e => this.sendEvent(e, '首页-出行常识')}>
            <View className='nav-item'>
              <View className='nav-icon common' />
              <View>出行常识</View>
            </View>
          </Navigator>
          <Navigator url='/pages/undeveloped/undeveloped' onClick={e => this.sendEvent(e, '首页-人文杂志')}>
            <View className='nav-item'>
              <View className='nav-icon magazine' />
              <View>人文杂志</View>
            </View>
          </Navigator>
        </View>

        <View className='menu-container'>
          <Navigator
            className='menu-item order'
            url='/pages/index/train/train'
            onClick={e => this.sendEvent(e, '首页-三宫格-现在订餐')}
          >
            <View className='menu-icon' />
            <View>
              <View className='title'>现在订餐</View>
              <View className='desc'>现在下单，立享美味</View>
            </View>
          </Navigator>
          <View className='right'>
            <Navigator url='/pages/undeveloped/undeveloped'>
              <View className='menu-item train'>
                <View className='menu-icon' />
                <View>
                  <View className='title'>查询车次</View>
                  <View className='desc'>车次实时动态</View>
                </View>
              </View>
            </Navigator>
            {
              Utils.isWeApp()
                ?
                <View
                  className='menu-item preferential'
                  onClick={e => this.toMealMiniProgram(e, '首页-三宫格-舌尖上的商城')}
                >
                  <View>
                    <View className='title'>舌尖上的商城</View>
                    <View className='desc'>一路畅购，享您所想</View>
                  </View>
                </View>
                :
                <Navigator
                  className='menu-item preferential'
                  url='/pages/user/coupon/coupon'
                  onClick={e => this.sendEvent(e, '首页-三宫格-优惠下单')}
                >
                  <View>
                    <View className='title'>优惠下单</View>
                    <View className='desc'>用券下单享优惠</View>
                  </View>
                </Navigator>
            }
          </View>
        </View>

        {/*<View className='module-title'>*/}
        {/*  <View className='text'>我的行程</View>*/}
        {/*  {*/}
        {/*    currentSchedule &&*/}
        {/*    <Navigator className='more' url='/pages/travel/index'>*/}
        {/*      添加*/}
        {/*      <View className='more-icon'></View>*/}
        {/*    </Navigator>*/}
        {/*  }*/}
        {/*</View>*/}
        {/*<View className='trip-container'>*/}
        {/*  {*/}
        {/*    this.props.isShowAuthButton &&*/}
        {/*    <AuthButton onAfterAuthorized={this.getCurrentSchedule}></AuthButton>*/}
        {/*  }*/}
        {/*  {*/}
        {/*    currentSchedule*/}
        {/*    ?*/}
        {/*      <Block>*/}
        {/*        <Navigator url=''>*/}
        {/*          <View className='header'>*/}
        {/*            <View>*/}
        {/*              <View className='train-iocn'></View>*/}
        {/*              {*/}
        {/*                currentSchedule.state === 0 && <Text>{currentSchedule.date}</Text>*/}
        {/*              }*/}
        {/*              {*/}
        {/*                currentSchedule.state === 1 && <Text>即将出发</Text>*/}
        {/*              }*/}
        {/*              {*/}
        {/*                currentSchedule.state === 2 && <Text>下一站：{currentSchedule.nextStation}</Text>*/}
        {/*              }*/}
        {/*              {*/}
        {/*                (currentSchedule.state === 3 || currentSchedule.state === 4) && <Text>{currentSchedule.date}</Text>*/}
        {/*              }*/}
        {/*            </View>*/}
        {/*            {*/}
        {/*              (currentSchedule.late === 0 && currentSchedule.startLessTime) &&*/}
        {/*              <View className='on-time'>*/}
        {/*                <Text>{currentSchedule.startLessTime}</Text>*/}
        {/*              </View>*/}
        {/*            }*/}
        {/*            {*/}
        {/*              // 只在即将开始和进行中显示正晚点信息*/}
        {/*              (currentSchedule.state === 1 && currentSchedule.state === 2 && currentSchedule.late === 1) &&*/}
        {/*              <View className='on-time'>正点</View>*/}
        {/*            }*/}
        {/*            {*/}
        {/*              // 只在即将开始和进行中显示正晚点信息*/}
        {/*              (currentSchedule.state === 1 && currentSchedule.state === 2 && currentSchedule.late === 2) &&*/}
        {/*              <View className='on-time'>早点</View>*/}
        {/*            }*/}
        {/*            {*/}
        {/*              // 只在即将开始和进行中显示正晚点信息*/}
        {/*              (currentSchedule.state === 1 && currentSchedule.state === 2 && currentSchedule.late === 3) &&*/}
        {/*              <View className='on-time'>晚点</View>*/}
        {/*            }*/}
        {/*            {*/}
        {/*              // 只在即将开始和进行中显示正晚点信息*/}
        {/*              (currentSchedule.state === 3 && currentSchedule.state === 4) &&*/}
        {/*              <View className='on-time'>已结束</View>*/}
        {/*            }*/}
        {/*          </View>*/}
        {/*          <View className='content'>*/}
        {/*            <View className='site'>*/}
        {/*              <View className='name'>{currentSchedule.schedule.startStation}</View>*/}
        {/*              <View className='time'>{currentSchedule.schedule.startTime}</View>*/}
        {/*            </View>*/}
        {/*            <View className='info'>*/}
        {/*              <View className='train'>{currentSchedule.schedule.trainNo}</View>*/}
        {/*              <View className='arrow-icon'></View>*/}
        {/*              <View className='take'>{currentSchedule.lengthTime}</View>*/}
        {/*            </View>*/}
        {/*            <View className='site'>*/}
        {/*              <View className='name'>{currentSchedule.schedule.endStation}</View>*/}
        {/*              <View className='time'>{currentSchedule.schedule.endTime}</View>*/}
        {/*            </View>*/}
        {/*          </View>*/}
        {/*          <View className='ticket-info'>*/}
        {/*            <View className='wicket'>*/}
        {/*              <View className='title'>检票口</View>*/}
        {/*              <View>{currentSchedule.schedule.ticketCheck}</View>*/}
        {/*            </View>*/}
        {/*            <View className='seat'>*/}
        {/*              <View className='title'>座位号</View>*/}
        {/*              <View>{currentSchedule.schedule.seatNumber || '--'}</View>*/}
        {/*            </View>*/}
        {/*          </View>*/}
        {/*        </Navigator>*/}
        {/*        <Navigator className='order-nav' openType='switchTab' url='/pages/order/order'>*/}
        {/*          我的订单：待收货*/}
        {/*          <View className='arrow-right-2'></View>*/}
        {/*        </Navigator>*/}
        {/*      </Block>*/}
        {/*      :*/}
        {/*      <Navigator className='no-trip' url='/pages/travel/add/add'>*/}
        {/*        <View>*/}
        {/*        <View className='train-iocn'></View>暂无行程，立即添加*/}
        {/*        </View>*/}
        {/*        <View className='arrow-right-2'></View>*/}
        {/*      </Navigator>*/}
        {/*    */}
        {/*  }*/}
        {/*</View>*/}

        <View className='module-title'>
            <View className='text'>新鲜事</View>
        </View>
        <Swiper
          className='center-swiper'
          circular
          previousMargin='45px'
          nextMargin='45px'
          onChange={this.changeBanner}
        >
          {
            middleBannerList.map((banner, i) => {
              return (
                <SwiperItem
                  className={`banner-container ${this.state.currentBannerIdx === i ? 'small' : ''}`}
                  key={i}
                >
                  <Image
                    src={banner.imageUrl}
                    mode='aspectFit'
                    className='center-banner'
                  ></Image>
                </SwiperItem>
              )
            })
          }
        </Swiper>

        <View className='module-title'>
          <View className='text'>美味推荐</View>
          {
            productRecList.length &&
            <Navigator className='more' url='/pages/index/recommend/recommend'>
              更多 <View className='more-icon'></View>
            </Navigator>
          }
        </View>
        <View className='pro-container'>
          {
            productRecList.map((goods, i) => {
              return (
                <Navigator url='/pages/index/train/train' key={i}>
                  <View className='pro-item'>
                    <Image src={goods.thumbImg} className='pro-pic'></Image>
                    <View className='content'>
                      <View className='name'>{goods.proname}</View>
                      <View className='price'>
                        ¥{goods.price}
                      </View>
                      <View className='num'>已售{goods.saleVolume}件</View>
                    </View>
                  </View>
                </Navigator>
              )
            })
          }
        </View>

        <View className='advantage'>
          <View className='title'>服务优势</View>
          <View className='advantage-wrap'>
            <View className='advantage-item'>
              <View className='advantage-icon convenient'></View>
              <View className='name'>便捷</View>
              <View className='desc'>送餐到座，可开发票</View>
            </View>
            <View className='advantage-item'>
              <View className='advantage-icon delicious'></View>
              <View className='name'>美味</View>
              <View className='desc'>大牌美食，应有尽有</View>
            </View>
            <View className='advantage-item'>
              <View className='advantage-icon preferential'></View>
              <View className='name'>优惠</View>
              <View className='desc'>大额优惠，限时抢购</View>
            </View>
          </View>
        </View>
        <Navigator
          className='to-video'
          url='/pages/video/video'
        >查看视频</Navigator>
        <Navigator
          className='to-live-broadcast'
          url='plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=4'
        >查看直播</Navigator>
      </View>
    )
  }
}

export default Index;
