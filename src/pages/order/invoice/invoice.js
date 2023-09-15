import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text, Input, RadioGroup, Radio, Block } from '@tarojs/components'

// js
import { request, getUrl, GET_INVOICE_INFO, SEND_INVOICE_INFO, SEND_INVOICE_EMAIL } from '../../../static/js/api'

// css image
import './invoice.scss'
import Utils from "../../../static/js/utils/utils";

export default class Invoice extends Component {

  config = {
    navigationBarTitleText: '填写发票信息'
  }

  constructor(props) {
    super(props);
    this.state = {
      invoiceInfo: {
        billId: '',     //账单id
        billMoney: '',  //开票金额（账单金额）
        money: '',  //开票金额（账单金额）
        gpName: '',     //发票抬头
        gpCode: '',     //税号
        type: 2,      //开票类型
        mail: '',       //接收邮件的邮箱
        typeText: '',   //发票类型：个人发票/企业发票
        gpPhone: '',    //手机号码
        bank: '',       //开户行
        bankNumber: '', //银行账号
        gpAddress: ''   //地址
      },
      isInvoice: false
    }
  }

  componentWillMount() {
    let isInvoice = +this.$router.params.isInvoice;
    let invoiceInfo = {...this.state.invoiceInfo};
    if (isInvoice) {
      this.getInvoiceInfo();
    }
    this.setState({
      isInvoice,
      invoiceInfo: {
        ...invoiceInfo,
        type: 2,
        billId: this.$router.params.billId,
        money: this.$router.params.price,
        billMoney: this.$router.params.price
      }
    })
  }

  componentDidMount() { }

  getInvoiceInfo = () => {
    request({
      url: getUrl(GET_INVOICE_INFO),
      data: {
        billId: this.$router.params.billId
      }
    }).then(res => {
      if (res.error_code === '0000') {
        let invoiceInfo = res.data;
        invoiceInfo['type'] = res.data.typeText === '企业单位' ? 2 : 1;
        this.setState({
          invoiceInfo
        });
      } else {
        Taro.showToast({ title: res.msg, icon: 'none', duration: 1500, mask: true });
      }
    }).catch(() => {
      Taro.showToast({ title: '获取发票信息失败，请重试', icon: 'none', duration: 1500, mask: true });
    });
  }

  // 切换发票抬头类型
  changeInvoiceType = e => {
    let invoiceInfo = {...this.state.invoiceInfo}
    this.setState({
      invoiceInfo: {
        ...invoiceInfo,
        type: +e.detail.value
      }
    });
  }

  // 设置发票信息
  setFormValue = (e) => {
    let invoiceInfo = {...this.state.invoiceInfo};
    invoiceInfo[e.currentTarget.dataset['name']] = e.currentTarget.value;
    this.setState({
      invoiceInfo
    });
  }

  // 提交发票信息
  sendInvoiceInfo = () => {
    if (!this.state.invoiceInfo.gpName) {
      if (this.state.invoiceInfo.type === 2) {
        Taro.showToast({ title: '请填写单位信息', icon: 'none', duration: 1500, mask: true });
      } else {
        Taro.showToast({ title: '请填写姓名', icon: 'none', duration: 1500, mask: true });
      }
      return;
    }
    if (this.state.invoiceInfo.type === 2 && !this.state.invoiceInfo.gpCode) {
      Taro.showToast({ title: '请填写纳税人识别号', icon: 'none', duration: 1500, mask: true });
      return;
    }
    if (!this.state.invoiceInfo.mail) {
      Taro.showToast({ title: '请填写邮箱', icon: 'none', duration: 1500, mask: true });
      return;
    }
    // if (this.state.invoiceInfo.gpPhone && !/^1[0-9]{1}\d{9}$/.test(this.state.invoiceInfo.gpPhone)) {
    //   Taro.showToast({ title: '请输入正确的手机号码', icon: 'none', duration: 1500, mask: true });
    //   return;
    // }
    let invoiceInfo = this.state.invoiceInfo;
    invoiceInfo.gpPhone = invoiceInfo.gpPhone.replace(/−/g, '-');
    request({
      url: getUrl(SEND_INVOICE_INFO),
      data: invoiceInfo
    }).then(res => {
      if (res.error_code === 'ok') {
        if (Utils.isWeApp()) {
          Taro.showModal({
            title: '成功',
            content: '发票信息提交成功，请稍后留意邮箱',
            showCancel: false
          }).then(result => {
            if (result.confirm) {
              Taro.navigateBack({delta: 1});
            }
          });
        } else {
          my.alert({
            title: '成功',
            content: '发票信息提交成功，请稍后留意邮箱',
            success: () => {
              Taro.navigateBack({delta: 1});
            }
          });
        }
      } else {
        Taro.showToast({ title: res.msg, icon: 'none', duration: 1500, mask: true });
      }
    }).catch(() => {
      Taro.showToast({ title: '发票开具失败，请重试', icon: 'none', duration: 1500, mask: true });
    })
  }

  // 重发电子邮件
  reSendEmail = () => {
    if (!this.state.invoiceInfo.mail) {
      Taro.showToast({ title: '请填写邮箱', icon: 'none', duration: 1500, mask: true });
      return;
    }
    request({
      url: getUrl(SEND_INVOICE_EMAIL),
      data: {
        billId: this.$router.params.billId,
        mail: this.state.invoiceInfo.mail
      }
    }).then(res => {
      if (res.error_code === 'ok') {
        if (Utils.isWeApp()) {
          Taro.showModal({
            title: '成功',
            content: '发票信息提交成功，请稍后留意邮箱',
            showCancel: false
          }).then(result => {
            if (result.confirm) {
              Taro.navigateBack({delta: 1});
            }
          });
        } else {
          my.alert({
            title: '成功',
            content: '发票信息提交成功，请稍后留意邮箱',
            success: () => {
              Taro.navigateBack({delta: 1});
            }
          });
        }
      } else {
        Taro.showToast({ title: res.msg, icon: 'none', duration: 1500, mask: true });
      }
    }).catch(() => {
      Taro.showToast({ title: '邮件发送失败，请重试', icon: 'none', duration: 1500, mask: true });
    })
  }

  // 选择发票抬头
  selectInvoice = () => {
    if (Utils.isWeApp()) {
      Taro.authorize({
        scope: 'scope.invoiceTitle'
      }).then(res => {
        if (res.errMsg === 'authorize:ok') {
          Taro.chooseInvoiceTitle().then(invoice => {
            if (invoice.errMsg === 'chooseInvoiceTitle:ok') {
              this.setState({
                invoiceInfo: {
                  ...this.state.invoiceInfo,
                  gpName: invoice.title,
                  gpCode: invoice.taxNumber,
                  gpPhone: invoice.telephone,
                  bank: invoice.bankName,
                  bankNumber: invoice.bankAccount,
                  gpAddress: invoice.companyAddress,
                  type: invoice.type === '0' ? 2 : 1
                }
              });
            } else {
              Taro.showToast({ title: '获取发票信息失败', icon: 'none', duration: 1500, mask: true });
            }
          }).catch(() => {
            Taro.showToast({ title: '获取发票信息失败', icon: 'none', duration: 1500, mask: true });
          });
        }
      }).catch(() => {
        Taro.showModal({
          title: '授权提示',
          content: '检测到您未打开发票抬头信息授权，是否前往开启',
          confirmText: '去开启',
          confirmColor: '#f3ac2e'
        }).then(modalRes => {
          if (modalRes.confirm) {
            Taro.openSetting();
          }
        });
      });
    }
  }

  render() {
    return (
      <View className='invoice'>
        <View className='header'>
          <Text className='title'>发票信息</Text>
          {
            Utils.isWeApp() &&
            <View className='choose-title' onClick={this.selectInvoice}>选择发票抬头</View>
          }
        </View>
        <View className='form-container'>
          <View className='form-item'>
            <Text className='title'>抬头类型</Text>
            <RadioGroup onChange={this.changeInvoiceType}>
              <Radio value={1} color='#f3ac2e' checked={this.state.invoiceInfo.type === 1}>个人</Radio>
              {
                Utils.isAliPay() && <Text>个人</Text>
              }
              <Radio value={2} color='#f3ac2e' checked={this.state.invoiceInfo.type === 2}>单位</Radio>
              {
                Utils.isAliPay() && <Text>单位</Text>
              }
            </RadioGroup>
          </View>
          {
            this.state.invoiceInfo.type === 2
            ?
            <Block>
              <View className='form-item'>
                <Text className='title'>单位名称</Text>
                <Input
                  placeholder='单位名称（必填）'
                  disabled={this.state.isInvoice}
                  data-name='gpName'
                  onInput={this.setFormValue}
                  value={this.state.invoiceInfo.gpName}
                />
              </View>
              <View className='form-item'>
                <Text className='title'>税号</Text>
                <Input
                  placeholder='纳税人识别号（必填）'
                  disabled={this.state.isInvoice}
                  data-name='gpCode'
                  onInput={this.setFormValue}
                  value={this.state.invoiceInfo.gpCode}
                />
              </View>
              <View className='form-item'>
                <Text className='title'>金额</Text>
                <Input
                  placeholder='金额'
                  disabled
                  value={this.state.invoiceInfo.money}
                />
              </View>
              <View className='form-item'>
                <Text className='title'>单位地址</Text>
                <Input
                  placeholder='单位地址信息'
                  disabled={this.state.isInvoice}
                  data-name='gpAddress'
                  onInput={this.setFormValue}
                  value={this.state.invoiceInfo.gpAddress}
                />
              </View>
              <View className='form-item'>
                <Text className='title'>电话号码</Text>
                <Input
                  placeholder='电话号码'
                  disabled={this.state.isInvoice}
                  data-name='gpPhone'
                  onInput={this.setFormValue}
                  value={this.state.invoiceInfo.gpPhone}
                />
              </View>
              <View className='form-item'>
                <Text className='title'>开户银行</Text>
                <Input
                  placeholder='开户银行名称'
                  disabled={this.state.isInvoice}
                  data-name='bank'
                  onInput={this.setFormValue}
                  value={this.state.invoiceInfo.bank}
                />
              </View>
              <View className='form-item'>
                <Text className='title'>银行账户</Text>
                <Input
                  placeholder='银行账户号码'
                  disabled={this.state.isInvoice}
                  data-name='bankNumber'
                  onInput={this.setFormValue}
                  value={this.state.invoiceInfo.bankNumber}
                />
              </View>
            </Block>
            :
            <Block>
              <View className='form-item'>
                <Text className='title'>名称</Text>
                <Input
                  placeholder='姓名（必填）'
                  disabled={this.state.isInvoice}
                  data-name='gpName'
                  onInput={this.setFormValue}
                  value={this.state.invoiceInfo.gpName}
                />
              </View>
            </Block>

          }
        </View>
        {/* {
          this.state.invoiceInfo.type === 2
          ?
          (
            <View className='form-container'>
            </View>
          )
          :
          (
            <View className='form-container'>
            </View>
          )
        } */}
        <View className='module-title'>接受方式（可修改）</View>
        <View className='form-container'>
          <View className='form-item'>
            <Text className='title'>电子邮箱</Text>
            <Input
              placeholder='填写接受电子发票的邮箱（必填）'
              data-name='mail'
              onInput={this.setFormValue}
              value={this.state.invoiceInfo.mail}
            />
          </View>
        </View>
        <View className='module-title'>*注：目前系统暂不支持重开发票，请仔细核对开票信息。不便之处，敬请谅解。</View>
        {
          this.state.isInvoice
          ?
          <View className='btn-container'>
            <Button className='btn' onClick={this.reSendEmail}>重发电子邮件</Button>
          </View>
          :
          <View className='btn-container'>
            <Button className='btn' onClick={this.sendInvoiceInfo}>提交</Button>
          </View>
        }
      </View>
    )
  }
}
