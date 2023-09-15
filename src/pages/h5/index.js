import Taro, { Component } from '@tarojs/taro'
import { View, WebView } from '@tarojs/components'

class H5 extends Component {

  config = {
    navigationBarBackgroundColor: '#FFFFFF',
  }

  constructor(props) {
    super(props);
    this.state = {
      path: ''
    }
  }

  componentWillMount () {
    const path = this.$router.params.path;
    if (!path) {
      Taro.showToast({ title: '请求参数为空', icon: 'none', duration: 1500, mask: true });
      const timer = setTimeout(() => {
        Taro.navigateBack({ delta: 1 });
        clearTimeout(timer);
      }, 1500);
      return;
    } else {
      this.setState({ path });
    }
  }

  componentDidMount () { }

  render () {
    return (
      <View>
        <WebView src={this.state.path}></WebView>
      </View>
    )
  }
}

export default H5