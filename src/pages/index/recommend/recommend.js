import Taro, { Component } from '@tarojs/taro'
import {View, Image, Navigator} from '@tarojs/components'
// js
import {
  request,
  getUrl,
  GET_PRODUCT_RECITEM,
} from '../../../static/js/api'

// css image
import './recommend.scss'
import Utils from "../../../static/js/utils/utils";

// TODO: 临时写定的时间
const DISCOUNT_ACTIVE_START_TIME_1 = '2010-01-09';
const DISCOUNT_ACTIVE_END_TIME_1 = '2010-01-24';
const DISCOUNT_ACTIVE_START_TIME_2 = '2010-01-31';
const DISCOUNT_ACTIVE_END_TIME_2 = '2010-02-19';

export default class CreateOrder extends Component {
  
  config = {
    navigationBarTitleText: '更多推荐',
    navigationBarBackgroundColor: '#FFFFFF'
  }
  
  constructor(props) {
    super(props);
    this.state = {
      productRecList: []
    }
  }
  
  componentWillMount() {
    this.getProductionRec();
  }
  
  // 获取美味推荐列表
  getProductionRec = () => {
    request({
      url: getUrl(GET_PRODUCT_RECITEM)
    }).then(res => {
      if (res.code === 1) {
        this.setState({ productRecList: res.data });
      } else {
        Taro.showToast({title: res.massage, icon: 'none', duration: 1500, mask: true});
      }
    }).catch(() => Taro.showToast({title: '获取美味推荐列表失败', icon: 'none', duration: 1500, mask: true}));
  }
  
  render() {
    return (
      <View className='pro-container'>
        {
          this.state.productRecList.map((goods, i) => {
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
    )
  }
}
