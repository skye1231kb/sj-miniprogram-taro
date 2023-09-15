import Taro, { Component } from '@tarojs/taro'
import { View, Navigator } from '@tarojs/components'

// js
import { COMMON } from '../../../static/js/common'

// css
import './common.scss'

class Common extends Component {

  config = {
    navigationBarTitleText: '出行常识'
  }

  constructor() {
    this.state = {
      commonList: COMMON
    }
  }

  componentWillMount () { }

  componentDidMount () { }

  render () {
    const { commonList } = this.state;

    return (
      <View className='common'>
        {
          commonList.menu.map((menu, i) => {
            return (
              <View className='common-menu-list' key={i}>
                <View className={`title title-${i + 1}`}>{menu.title}</View>
                {
                  menu.subtitles.map((common, idx) => {
                    return (
                      <Navigator
                        className='subtitle'
                        key={idx}
                        url={`/pages/index/common/detail/detail?id=${common.id}`}
                      >
                        {common.content}
                      </Navigator>
                    )
                  })
                }
              </View>
            )
          })
        }
      </View>
    )
  }
}

export default Common
