import Taro, { Component } from '@tarojs/taro'
import { View, Button, Image, Text, ScrollView } from '@tarojs/components'
import { connect } from '@tarojs/redux'

// js
import moment from 'moment';
import {request, getUrl, GET_TRAIN_ALL_STATION} from '../../../static/js/api'

// css image
import './site.scss'
import arrowIcon from '../../../static/img/index/arrow.png'
import arrowActiveIcon from '../../../static/img/index/arrow_active.png'

// redux
import { onSetStartStation, onSetEndStation } from '../../../store/actions/action'
import AuthButton from "../../../components/anth_button/auth_button";

@connect(({reducers}) => (
  {...reducers}
), (dispatch) => ({
  onSetStartStation(payload) {
    dispatch(onSetStartStation(payload));
  },
  onSetEndStation(payload) {
    dispatch(onSetEndStation(payload));
  },
}))
export default class Site extends Component {

  config = {
    navigationBarTitleText: '选择站点'
  }

  constructor(props) {
    super(props);
    this.state = {
      stations: [],
      selectStartStation: null,
      selectEndStation: null,
    }
  }
  
  componentDidMount () {
    this.getTrainAllStation();
  }

  // 获取所有站点信息
  getTrainAllStation = () => {
    request({
      url: getUrl(GET_TRAIN_ALL_STATION),
      data: {
        train: this.props.train
      }
    }).then(res => {
      if (res.error_code === 'ok') {
        this.splitStations(res.data.station)
      } else {
        Taro.showToast({title: res.msg, icon: 'none', duration: 1500, mask: true});
      }
    }).catch(() => {
      Taro.showToast({title: '获取车次站点失败', icon: 'none', duration: 1500, mask: true});
    })
  }

  //车站信息重组
  // 拆分数组
  splitStations = (stations) => {
    let newStations = [];
    let childArr = [];
    let newStationsIndex = 0;
    let stationsLength = stations.length;
    // 将 stations 按每组三个拆分为二维数组
    stations.forEach((station, index) => {
      childArr.push(station);
      // 满三就加进父数组，或者最后不满也加
      if (childArr.length === 3 || index === stationsLength - 1) {
        // 将下标为奇数的子数组元素反转
        if ((newStationsIndex % 2) === 1) {
          // 数组长2补1
          if (childArr.length == 2) {
            childArr.push({});
            // 数组长1补2
          } else if (childArr.length == 1) {
            childArr.push({}, {});
          }
          newStations[newStationsIndex] = this.handleStationData([...childArr].reverse(), newStationsIndex);
        } else {
          newStations[newStationsIndex] = this.handleStationData([...childArr], newStationsIndex);
        }
        newStationsIndex++;
        childArr.length = 0;
      }
    });

    this.setState({
      stations: newStations
    });
  }

  // 给每个元素添加其他需要的属性
  handleStationData = (stations, stationsIndex) => {
    let newStations = [];
    const isOdd = (stationsIndex % 2) === 0;
    // 设置箭头
    stations.forEach((station, index) => {
      // 设置所有属性
      station['isActive'] = false; // 选中站点之间的样式
      station['isLowerArrow'] = false;
      station['isRightArrow'] = false;
      station['isLeftArrow'] = false;
      station['isVia'] = false; // 选中站点样式

      //  判断是否为奇数行（下标）
      if (isOdd) {
        //  判断是否为子数组中的第一个元素
        if (index === 0) {
          //  判断子数组是否父数组的第一个元素，true不设置箭头，false设置向下箭头
          if (stationsIndex !== 0) {
            station['isLowerArrow'] = true;
          }
        } else {
          //  不为子数组第一个元素设置向右箭头
          station['isRightArrow'] = true;
        }
      } else {
        //  为偶数行
        //  判断是否为子数组中的最后一个元素，true设置向下箭头，false设置向左箭头
        if (index === 2) {
          station['isLowerArrow'] = true;
        } else {
          // 偶数行第一个元素不需要箭头
          station['isLeftArrow'] = true;
        }
      }
      newStations.push(station);
    });
    return newStations;
  }

  // 点击站点触发
  selectStation = (e, station) => {
    e.preventDefault();
    const stationId = station.station_id;
    let start = this.state.selectStartStation;
    let end = this.state.selectEndStation;

    // 判断是否选中了已选站点的中间站
    if (station.isActive && !station.isVia) {
      Taro.showToast({title: '请先取消选中的站点', icon: 'none', duration: 1500, mask: true});
      return;
    } else {
      // 判断是否选中了起始或终点站
      if (station.isVia) {
        // 判断是否选中了起始站
        if (start && stationId === start['station_id']) {
          this.setState({
            selectStartStation: null
          }, () => this.changeSiteCss());
        } else {
          this.setState({
            selectEndStation: null
          }, () => this.changeSiteCss());
        }
        station.isVia = false;
      } else {
        // 判断是否有起始站
        if (start) {
          // 判断是否有终点站
          if (end) {
            Taro.showToast({title: '请先取消选中的站点', icon: 'none', duration: 1500, mask: true});
            return;
          } else {
            // 判断选择的站点时间是否比起始站晚
            const startTime = `${moment().format('YYYY-MM-DD')} ${start.a_time}`;
            const stationTime = `${moment().format('YYYY-MM-DD')} ${station.a_time}`;
            if (moment(stationTime).isAfter(startTime)) {
              this.setState({
                selectEndStation: station
              }, () => this.changeSiteCss());
            } else {
              this.setState({
                selectStartStation: station,
                selectEndStation: start
              }, () => this.changeSiteCss());
            }
          }
          station.isVia = true;
        } else {
          station.isVia = true;
          // 判断时间是否比终点站晚
          const endTime = end && `${moment().format('YYYY-MM-DD')} ${end.a_time}`;
          const stationTime = `${moment().format('YYYY-MM-DD')} ${station.a_time}`;
          if (moment(stationTime).isAfter(endTime)) {
            this.setState({
              selectStartStation: end,
              selectEndStation: station
            }, () => this.changeSiteCss());
          } else {
            this.setState({
              selectStartStation: station
            }, () => this.changeSiteCss());
          }
        }
      }
    }
  }

  // 修改样式
  changeSiteCss = () => {
    let stations = this.state.stations;
    let start = this.state.selectStartStation;
    let startTime = start && `${moment().format('YYYY-MM-DD')} ${start.a_time}`;
    let end = this.state.selectEndStation;
    let endTime = end && `${moment().format('YYYY-MM-DD')} ${end.a_time}`;

    stations.forEach(childStations => {
      childStations.forEach(station => {
        // 判断是否已经选有两个站点
        if (start && end) {
          let stationTime = `${moment().format('YYYY-MM-DD')} ${station.a_time}`;
          // 判断是否在起始站点之后 并且 在终点站之前 或者 是终点站
          if (
            moment(stationTime).isAfter(startTime)
            && (moment(stationTime).isBefore(endTime) || moment(stationTime).isSame(endTime))
          ) {
            station.isActive = true;
          } else {
            station.isActive = false;
          }
        } else {
          station.isActive = false;
        }
      });
    });
    this.setState({
      stations
    });
  }

  selectedStation = () => {
    if (!this.state.selectStartStation || !this.state.selectEndStation) {
      Taro.showToast({title: '请选择站点', icon: 'none', duration: 1500, mask: true});
      return;
    }
    this.props.onSetStartStation(this.state.selectStartStation);
    this.props.onSetEndStation(this.state.selectEndStation);
    if (this.$router.params.isScanIn == 1) {
      Taro.navigateTo({url: '/pages/order/create_order/create_order'});
    } else {
      Taro.navigateTo({url: '/pages/goods/goods'});
    }
  }

  render () {
    return (
      <View className='site'>
        <ScrollView className='site-container' scrollY>
          {
            this.state.stations.map((childStations, index) => {
              return (
                <View className='site-list' key={index * 1000}>
                  {
                    childStations.map((station, idx) => {
                      return (
                        <View className={`site-item ${station.station ? '' : 'hide'}`} key={idx} onClick={(e) => this.selectStation(e, station)}>
                          {/* 箭头 */}
                          {
                            (station.isLeftArrow || station.isRightArrow || station.isLowerArrow)
                            &&
                            <Image
                              className={
                                `arrow ${station.isLeftArrow ? 'left-arrow' : ''} ${station.isRightArrow ? 'right-arrow' : ''} ${station.isLowerArrow ? 'lower-arrow' : ''}`
                              }
                              mode='aspectFit'
                              src={station.isActive ? arrowActiveIcon : arrowIcon}
                            />
                          }
                          {/* 内容 */}
                          <View className={`content ${station.isActive ? 'active' : ''} ${station.isVia ? 'via' : ''}`}>
                            <Text className='site-name' decode>{station.station || '&emsp;'}</Text>
                          </View>
                        </View>
                      )
                    })
                  }
                </View>
              )
            })
          }
        </ScrollView>
        <View className='btn-container'>
          {
            this.props.isShowAuthButton &&
            <AuthButton onAfterAuthorized={this.selectedStation}></AuthButton>
          }
          <Button className='btn' onClick={this.selectedStation}>确定</Button>
        </View>
      </View>
    )
  }
}
