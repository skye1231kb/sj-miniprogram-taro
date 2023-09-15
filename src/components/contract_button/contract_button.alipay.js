import Taro, { Component } from '@tarojs/taro'
import { View } from "@tarojs/components"

// css
import './contract_button.scss'

class ContractButton extends Component {
  
  config = {
    usingComponents: {
      'contract-button': './index'
    }
  }
  
  constructor(props) {
    super(props);
  }
  
  componentWillMount () {
  }
  
  componentDidMount () { }
  
  render () {
    return (
      <View className='service-container'>
        <contract-button />
      </View>
    )
  }
}

export default ContractButton
