import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text, ScrollView } from '@tarojs/components'
import { connect } from '@tarojs/redux'

// component
import CartBar from '../cart_bar/cart_bar'

// css image
import './cart.scss'

@connect(({reducers}) => (
  {...reducers}
))
export default class Cart extends Component {

  constructor(props) {
    super(props);
  }

  componentWillMount () { }

  componentDidMount () { }

  addGoods = (e, goods) => {
    this.props.onAddGoods(e, goods);
  }

  subtractGoods = (e, goods) => {
    this.props.onSubtractGoods(e, goods);
  }

  render () {
    return (
      <View className='cart'>
        <View className={`mask ${this.props.openCart ? 'show' : ''}`} onClick={this.props.closeCart}></View>
        <View className={`cart-list-container ${this.props.openCart ? 'show' : ''}`}>
          <View className='cart-list'>
            <View className='cart-title'>已选商品</View>
            <ScrollView scrollY className='cart-item-container'>
              {
                this.props.selectedGoodsList.map((goods, idx) => {
                  return (
                    <View className='cart-item' key={idx}>
                      <Image mode='aspectFit' className='prod-img' src={goods.pics} />
                      <View className='prod-info'>
                        <View className='name'>{goods.pro_name}</View>
                        <View className='price'>￥{goods.price}/份</View>
                      </View>
                      <View className='btn-container'>
                        {/* <Image className='btn subtract-btn' src={subtractIcon} onClick={e => this.subtractGoods(e, goods)} /> */}
                        <View className='btn subtract-btn' onClick={e => this.subtractGoods(e, goods)}></View>
                        <Text className='number'>{goods.selectedNum}</Text>
                        {/* <Image className='btn add-btn' src={addIcon} onClick={e => this.addGoods(e, goods)} /> */}
                        <View className='btn add-btn' onClick={e => this.addGoods(e, goods)} ></View>
                      </View>
                    </View>
                  )
                })
              }
            </ScrollView>
          </View>
          <CartBar
            totalNum={this.props.totalNum}
            toCreateOrder={this.props.toCreateOrder}
          ></CartBar>
        </View>
      </View>
    )
  }
}
