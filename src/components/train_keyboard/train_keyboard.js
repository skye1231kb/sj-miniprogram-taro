import Taro, { Component } from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import { connect } from '@tarojs/redux'

// component
import AuthButton from '../anth_button/auth_button'

// css image
import "../../../node_modules/taro-ui/dist/style/components/flex.scss"
import "./train_keyboard.css"

import blockIcon from '../../static/img/block_icon.png'

@connect(({reducers}) => ({...reducers}))
class TrainKeyboard extends Component {

  constructor(props) {
    super(props);
  }

  render () {
    return (
      <View>
        <View className={this.props.isShowKeyboard ? 'mask mask-show' : 'mask'} onClick={this.props.maskClick}></View>
        <View className={this.props.isShowKeyboard ? 'at-row at-row--wrap train-keyboard slide-in' : 'at-row at-row--wrap train-keyboard'}>
          <View className='at-col at-col-3 train-keyboard-item code en' data-type='code' data-text='G' onClick={this.props.keyboardClick}>G</View>
          <View className='at-col at-col-3 train-keyboard-item code en' data-type='code' data-text='D' onClick={this.props.keyboardClick}>D</View>
          <View className='at-col at-col-3 train-keyboard-item code en' data-type='code' data-text='C' onClick={this.props.keyboardClick}>C</View>
          <View className='at-col at-col-3 train-keyboard-item code' data-text='reset' onClick={this.props.keyboardClick}>重输</View>
          
          <View 
            className={`at-col at-col-3 train-keyboard-item code en ${this.props.isDisabledKT ? 'disabled' : ''}`}
            data-type='code'
            data-text='T' 
            onClick={this.props.keyboardClick}
          >
            T
          </View>
          <View 
            className={`at-col at-col-3 train-keyboard-item code en ${this.props.isDisabledKT ? 'disabled' : ''}`}
            data-type='code'
            data-text='K'
            onClick={this.props.keyboardClick}
          >
            K
          </View>
          <View className='at-col at-col-3 train-keyboard-item code' data-text='' onClick={this.props.keyboardClick}></View>
          <View className='at-col at-col-3 train-keyboard-item code' data-text='' onClick={this.props.keyboardClick}></View>
          
          <View className='at-col at-col-3 train-keyboard-item' data-text='1' onClick={this.props.keyboardClick}>1</View>
          <View className='at-col at-col-3 train-keyboard-item' data-text='2' onClick={this.props.keyboardClick}>2</View>
          <View className='at-col at-col-3 train-keyboard-item' data-text='3' onClick={this.props.keyboardClick}>3</View>
          <View className='at-col at-col-3 train-keyboard-item' data-text='back' onClick={this.props.keyboardClick}>
            <Image className='block-icon' data-text='back in img' src={blockIcon} ></Image>
          </View>
          
          <View className='at-col at-col-3 train-keyboard-item' data-text='4' onClick={this.props.keyboardClick}>4</View>
          <View className='at-col at-col-3 train-keyboard-item' data-text='5' onClick={this.props.keyboardClick}>5</View>
          <View className='at-col at-col-3 train-keyboard-item' data-text='6' onClick={this.props.keyboardClick}>6</View>
          <View className='at-col at-col-3 train-keyboard-item' data-text='0' onClick={this.props.keyboardClick}>0</View>
          
          <View className='at-col at-col-3 train-keyboard-item' data-text='7' onClick={this.props.keyboardClick}>7</View>
          <View className='at-col at-col-3 train-keyboard-item' data-text='8' onClick={this.props.keyboardClick}>8</View>
          <View className='at-col at-col-3 train-keyboard-item' data-text='9' onClick={this.props.keyboardClick}>9</View>
          <View className='at-col at-col-3 train-keyboard-item determine'>
            {
              this.props.isShowAuthButton
              ? <AuthButton onAfterAuthorized={this.props.keyboardClick}></AuthButton>
              : ''
            }
            <View className='text' data-text='determine' onClick={this.props.keyboardClick}>确定</View>
          </View>
        </View>
      </View>
    )
  }
}

export default TrainKeyboard
