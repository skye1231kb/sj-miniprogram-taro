import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, Button, Block, ScrollView } from '@tarojs/components'

// component
import CartBar from '../cart_bar/cart_bar'

// css image
import './goods_detail.scss'
import downIcon from '../../static/img/index/down.png'
import addCartIcon from '../../static/img/index/tianjia.png'
import addIcon from '../../static/img/index/add.png'
import subtractIcon from '../../static/img/index/subtract.png'

export default class GoodsDetail extends Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() { }

  componentDidMount() { }

  addGoods = (e, goods) => {
    this.props.onAddGoods(e, goods);
  }

  subtractGoods = (e, goods) => {
    this.props.onSubtractGoods(e, goods);
  }

  render() {
    return (
      <View className={`goods-detail-container ${this.props.showGoodsDetail ? 'show' : ''}`}>
        <View className='goods-detail'>
          <ScrollView scrollY style='height: 100%'>
            <View className='goods-detail-banner'>
              <Image src={downIcon} className='down-icon' onClick={this.props.closeGoodsDetail} />
              <Image mode='aspectFill' src={this.props.goods.pics} />
            </View>
            <View className='goods-detail-title'>
              <View className='goods-name'>{this.props.goods.pro_name}</View>
              <View className='goods-desc'>
                <Text>月销100</Text>
                <Text>好评率100%</Text>
              </View>
              <View className='price'>
                ￥<Text>{this.props.goods.price}</Text>
              </View>
              <View className='btn-container'>
                {
                  (this.props.goods.selectedNum > 0)
                    ?
                    <Block>
                      <Image className='btn subtract-btn' src={subtractIcon} onClick={e => this.subtractGoods(e, this.props.goods)} />
                      <Text className='number'>{this.props.goods.selectedNum}</Text>
                      <Image className='btn add-btn' src={addIcon} onClick={e => this.addGoods(e, this.props.goods)} />
                    </Block>
                    :
                    <Button className='add-cart' onClick={e => this.addGoods(e, this.props.goods)}>
                      <Image src={addCartIcon} className='add-cart-icon' /> 加入购物车
                </Button>
                }
              </View>
            </View>
            <View className='goods-detail-content'>
              <View className='title'>商品详情</View>
              <View className='content-item'>
                {
                  this.props.goods.intro_img.map((url, idx) => {
                    return (
                      <Image src={url} key={idx} />
                    )
                  })
                }
                <View>{this.props.goods.intro_text}</View>
              </View>
            </View>
          </ScrollView>
          <View className='cart-bar-container'>
            <CartBar openCart={this.props.openCart}></CartBar>
          </View>
        </View>
      </View>
    )
  }
}
