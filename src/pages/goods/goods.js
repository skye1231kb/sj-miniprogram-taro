import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, ScrollView } from '@tarojs/components'
import { connect } from '@tarojs/redux'

// js
import moment from 'moment'
import { request, getUrl, GET_GOODS_LIST } from '../../static/js/api'

// component
import Cart from '../../components/cart/cart'
import CartBar from '../../components/cart_bar/cart_bar'
import GoodsDetail from '../../components/goods_detail/goods_detail'

// css image
import './goods.scss'

// redux
import {
  onChangeAuthType,
  onAddGoods,
  onCalcTotalPrice,
  onAddTrain,
  onChangeIsLink,
  onSetCarriage
} from '../../store/actions/action'


@connect(({reducers}) => (
  {...reducers}
), (dispatch) => ({
  onChangeAuthType (payload) {
    dispatch(onChangeAuthType(payload));
  },
  onAddGoods (payload) {
    dispatch(onAddGoods(payload));
  },
  onCalcTotalPrice (payload) {
    dispatch(onCalcTotalPrice(payload));
  },
  onAddTrain (payload) {
    dispatch(onAddTrain(payload));
  },
  onChangeIsLink (payload) {
    dispatch(onChangeIsLink(payload));
  },
  onSetCarriage (payload) {
    dispatch(onSetCarriage(payload));
  },
}))
class Goods extends Component {

  config = {
    navigationBarTitleText: '商品'
  }

  constructor(porps) {
    super(porps);
    this.state = {
      bannerImg: '',
      goodsList: [],
      selectedCate: 'A0', // 默认选中第一类商品，因小程序id限制，改为拼接的字符串
      isOpenCart: false,
      isShowGoodsDetail: false,
      selectedGoods: {},
    }
  }

  componentWillMount() {
  }

  componentDidShow() {
    if (this.props.train && this.props.startStation && this.props.endStation) {
      let data = {
        train: this.props.train,
        carriage: this.props.carriage,
        ssid: this.props.startStation ? this.props.startStation['station_id'] : '',
        seid: this.props.endStation ? this.props.endStation['station_id'] : ''
      }
      this.getGoodsList(data);
    }
  }

  componentDidHide() {
    this.setState({
      isOpenCart: false,
      isShowGoodsDetail: false
    });
  }

  // 获取商品列表
  getGoodsList = (data = {}) => {
    Taro.showLoading({ mask: true, title: '加载中...' });
    data['date'] = moment().format('YYYY-MM-DD');
    request({
      url: getUrl(GET_GOODS_LIST),
      data
    }).then(res => {
      Taro.hideLoading();
      if (res.error_code === 'ok') {
        if (!res.data.product.length) {
          Taro.showToast({ title: '该车无可售商品', icon: 'none', duration: 1500, mask: true });
        }
        this.setState({
          bannerImg: res.data.img,
          goodsList: this.handleProductData(res.data.product)
        }, () => this.setGoodsListForStore());
      } else if (res.error_code === 40113) {
        Taro.showToast({ title: res.msg, icon: 'none', duration: 1500, mask: true });
        const T = setTimeout(() => {
          Taro.navigateBack({ delta: 1 });
          clearTimeout(T);
        }, 1500);
      } else {
        this.setState({ goodsList: [] });
        Taro.showToast({ title: res.msg, icon: 'none', duration: 1500, mask: true });
      }
    }).catch(
      () => {
        Taro.hideLoading();
        Taro.showToast({ title: '获取商品失败', icon: 'none', duration: 1500, mask: true });
      }
    );
  }

  handleProductData = (product) => {
    let newArr = [...product];
    newArr.forEach(goodsCate => {
      // 匹配购物车里的商品
        goodsCate.child.forEach(goods => {
          // 先将商品的 selectedNum 设置为0
          goods['selectedNum'] = 0;
          if (this.props.selectedGoodsList.length > 0) {
            this.props.selectedGoodsList.forEach(selectedGoods => {
              // 如果商品ID和购物车里的商品ID一致，修改值
              if (goods.id === selectedGoods.id) {
                goods['selectedNum'] = selectedGoods['selectedNum'];
              }
            });
          }
        });
    });
    return newArr;
  }

  selectGoodsCate = (e, cateName) => {
    e.preventDefault();
    this.setState({selectedCate: cateName});
  }

  // 打开购物车
  openCart = (e) => {
    e.preventDefault();
    if (!this.props.selectedGoodsList.length) {
      Taro.showToast({ title: '您还未选择商品', icon: 'none', duration: 1500, mask: true });
      return;
    }
    this.setState({ isOpenCart: true });
  }

  // 关闭购物车
  closeCart = () => {
    this.setState({ isOpenCart: false });
  }

  // 查看商品详情
  openGoodsDetail = (e, goods) => {
    this.setState({
      selectedGoods: goods,
      isShowGoodsDetail: true
    });
  }

  // 关闭商品详情
  closeGoodsDetail = () => {
    this.setState({ isShowGoodsDetail: false });
  }

  // 添加商品
  addGoods = (e, goods) => {
    let newGoodsList = this.state.goodsList;
    newGoodsList.forEach(goodsCate => {
      goodsCate.child.forEach(item => {
        if (item.id === goods.id) {
          if (goods.selectedNum < item.number) {
            item.selectedNum += 1;
          } else {
            Taro.showToast({title: '商品数量已达上限', icon: 'none', duration: 1500, mask: true});
          }
        }
      });
    });
    this.setState({
      goodsList: newGoodsList
    }, () => {
      Taro.setStorageSync('productionList', JSON.stringify(newGoodsList));
      this.setGoodsListForStore();
    });
  }

  // 删除商品
  subtractGoods = (e, goods) => {
    let newGoodsList = this.state.goodsList;
    newGoodsList.forEach(goodsCate => {
      goodsCate.child.forEach(item => {
        if (item.id === goods.id) {
          item.selectedNum -= 1;
        }
      });
    });
    this.setState({
      goodsList: newGoodsList
    }, () => {
      this.setGoodsListForStore();
    });
  }

  // 将选中商品保存进store
  setGoodsListForStore = () => {
    let newGoodsList = [];
    this.state.goodsList.forEach(goodsCate => {
      goodsCate.child.forEach(item => {
        if (item.selectedNum > 0) {
          newGoodsList.push(item);
        }
      })
    });
    this.props.onAddGoods(newGoodsList);
    this.calcSelectedGoodsTotalPrice();
  }

  // 计算商品总价格
  calcSelectedGoodsTotalPrice = () => {
    let total = 0;
    if (this.props.selectedGoodsList.length) {
      this.props.selectedGoodsList.forEach(item => {
        total = (Math.round(total * 100) + Math.round(+item.price * 100) * item.selectedNum) / 100;
      });
    }
    this.props.onCalcTotalPrice(total);
  }

  // 去下单
  toCreateOrder = () => {
    if (!this.props.selectedGoodsList.length) {
      Taro.showToast({title: '您还未选择商品！', icon: 'none', duration: 1500, mask: true});
      return;
    }
    Taro.navigateTo({url: '/pages/order/create_order/create_order'});
  }
  
  // 去修改车次
  toSelectTrain = () => {
    Taro.navigateTo({ url: '/pages/index/train/train' });
  }

  render() {
    let totalNum = 0;
    let cost = 0;
    this.props.selectedGoodsList.forEach(item => {
      cost = (Math.round(cost * 100) + Math.round(item.price * 100) * item.selectedNum) / 100;
      totalNum += item.selectedNum;
    })
    
    return (
      <View className='goods'>
        <View className='banner'>
          <Image className='banner-img' src={this.state.bannerImg} />
        </View>
        <View className='train'>
          {
            (this.props.train && this.props.startStation && this.props.endStation)
              ?
              <View>
                {this.props.date} {this.props.train} {this.props.startStation.station} 至 {this.props.endStation.station}
                <Text className='train-tip' onClick={this.toSelectTrain}>(点击修改)</Text>
              </View>
              :
              <View>
                您未输入车次信息，
                <Text className='train-tip' onClick={this.toSelectTrain}>现在输入？</Text>
              </View>
          }
        </View>
        <View className='goods-list-container'>
          <View className='goods-list-cate'>
            {
              this.state.goodsList.map((goods, idx) => {
                return (
                  <View
                    className={`cate-item ${this.state.selectedCate === `A${idx}` ? 'active' : ''}`}
                    key={idx}
                    data-index={idx}
                    onClick={(e) => this.selectGoodsCate(e, `A${idx}`)}
                  >
                    {goods.cate_name}
                  </View>
                )
              })
            }
          </View>
          <ScrollView scrollY className='goods-list' scrollIntoView={this.state.selectedCate}>
            {
              this.state.goodsList.map((childGoods, idx) => {
                return (
                  <View className='target-view' id={(`A${idx}`)} key={(idx * 1000).toString()}>
                    {
                      childGoods.child.map((goods, index) => {
                        return (
                          <View className='goods-item' key={index}>
                            <View className='goods-img-container'>
                              <Image mode='scaleToFill' lazyLoad src={goods.pics}  onClick={e => this.openGoodsDetail(e, goods)} />
                            </View>
                            <View className='goods-info'>
                              <View className='goods-name'>{goods.pro_name}</View>
                              <View className='goods-tag-container'>
                                <Text className='goods-tag'>{goods.cate_name}</Text>
                              </View>
                              <View className='goods-num'>剩余{goods.number}份</View>
                              <View className='goods-price'>
                                ￥<Text>{goods.price}</Text>
                              </View>
                              <View className='btn-container'>
                                {
                                  (goods.selectedNum > 0) &&
                                  <View className='btn subtract-btn' onClick={e => this.subtractGoods(e, goods)}></View>
                                }
                                {
                                  (goods.selectedNum > 0) &&
                                  <Text className='number'>{goods.selectedNum}</Text>
                                }
                                {
                                  goods.number &&
                                  <View className='btn add-btn' onClick={e => this.addGoods(e, goods)} ></View>
                                }
                              </View>
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
        </View>
        <View className='good-tip'>以车厢上实际商品和数量为准</View>
        <CartBar
          totalNum={totalNum}
          cost={cost}
          openCart={this.openCart}
          toCreateOrder={this.toCreateOrder}
        ></CartBar>
        <Cart
          totalNum={totalNum}
          openCart={this.state.isOpenCart}
          closeCart={this.closeCart}
          onAddGoods={this.addGoods}
          onSubtractGoods={this.subtractGoods}
          toCreateOrder={this.toCreateOrder}
        ></Cart>
        <GoodsDetail
          showGoodsDetail={this.state.isShowGoodsDetail}
          closeGoodsDetail={this.closeGoodsDetail}
          goods={this.state.selectedGoods}
          openCart={this.openCart}
          onAddGoods={this.addGoods}
          onSubtractGoods={this.subtractGoods}
        ></GoodsDetail>
      </View>
    )
  }
}

export default Goods;
