import moment from 'moment'
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

const INIT_STATE = {
  isShowAuthButton: true,
  userInfo: null,
  train: '',
  date: moment().format('YYYY-MM-DD'),
  startStation: null,
  endStation: null,
  carriage: null,
  carriageNum: null,
  isLink: false,
  selectedGoodsList: [],
  totalPrice: 0,
  promoteStation: null
}

export default function reducers (state = INIT_STATE, action) {
  let newState;
  switch (action.type) {
    case ADD_TRAIN:
      newState = {
        ...state,
        train: action.payload
      }
      break;
    case CHANGE_AUTH_TYPE:
      newState = {
        ...state,
        isShowAuthButton: action.payload
      }
      break;
    case SET_USER_INFO:
      newState = {
        ...state,
        userInfo: action.payload
      }
      break;
    case ADD_GOODS:
      newState = {
        ...state,
        selectedGoodsList: [...action.payload]
      }
      break;
    case CALC_TOTAL_PRICE:
      newState = {
        ...state,
        totalPrice: action.payload
      }
      break;
    case RESET_GOODS_AND_PRICE:
      newState = {
        ...state,
        selectedGoodsList: [],
        totalPrice: 0
      }
      break;
    case SET_CARRIAGE:
      newState = {
        ...state,
        carriage: action.payload
      }
      break;
    case SET_CARRIAGE_NUM:
      newState = {
        ...state,
        carriageNum: action.payload
      }
      break;
    case CHANGE_IS_lINK:
      newState = {
        ...state,
        isLink: action.payload
      }
      break;
    case SET_START_STATION:
      newState = {
        ...state,
        startStation: action.payload
      }
      break;
    case SET_END_STATION:
      newState = {
        ...state,
        endStation: action.payload
      }
      break;
    case SET_PROMOTE_STATION:
      newState = {
        ...state,
        promoteStation: action.payload
      }
      break;
    default:
      return state;
  }
  return newState;
}
