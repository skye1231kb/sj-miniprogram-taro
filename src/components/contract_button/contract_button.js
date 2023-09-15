import Taro, { Component } from '@tarojs/taro'
import { View } from "@tarojs/components"

// css
import './contract_button.scss'

class AuthButton extends Component {
  
  config = {
  }
  
  constructor(props) {
    super(props);
  }
  
  componentWillMount () {
  }
  
  componentDidMount () { }
  
  render () {
    return (
      <View className='service-container'></View>
    )
  }
}

export default AuthButton
