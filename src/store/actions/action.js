import {
  ADD_TRAIN,
  CHANGE_AUTH_TYPE,
  SET_USER_INFO,
  ADD_GOODS,
  RESET_GOODS_AND_PRICE,
  CALC_TOTAL_PRICE,
  SET_CARRIAGE,
  SET_CARRIAGE_NUM,
  CHANGE_IS_lINK,
  SET_START_STATION,
  SET_END_STATION,
  SET_PROMOTE_STATION,
} from '../constants/constants'

export const onAddTrain = (payload) => {
  return {
    type: ADD_TRAIN,
    payload
  }
}

export const onSetUserInfo = (payload) => {
  return {
    type: SET_USER_INFO,
    payload
  }
}

export const onChangeAuthType = (payload) => {
  return {
    type: CHANGE_AUTH_TYPE,
    payload
  }
}

export const onAddGoods = (payload) => {
  return {
    type: ADD_GOODS,
    payload
  }
}

export const onResetGoodsAndPrice = () => {
  return {
    type: RESET_GOODS_AND_PRICE
  }
}

export const onCalcTotalPrice = (payload) => {
  return {
    type: CALC_TOTAL_PRICE,
    payload
  }
}

export const onSetCarriage = (payload) => {
  return {
    type: SET_CARRIAGE,
    payload
  }
}

export const onSetCarriageNum = (payload) => {
  return {
    type: SET_CARRIAGE_NUM,
    payload
  }
}

export const onChangeIsLink = (payload) => {
  return {
    type: CHANGE_IS_lINK,
    payload
  }
}

export const onSetStartStation = (payload) => {
  return {
    type: SET_START_STATION,
    payload
  }
}

export const onSetEndStation = (payload) => {
  return {
    type: SET_END_STATION,
    payload
  }
}

export const onSetPromoteStation = (payload) => {
  return {
    type: SET_PROMOTE_STATION,
    payload
  }
}


