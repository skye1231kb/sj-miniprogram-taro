import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import rootReducer from './reducers/index'

const middlewares = [
  thunkMiddleware
]

export default createStore(rootReducer, applyMiddleware(...middlewares));
