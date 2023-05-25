import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  to: "",
  token: "",
  amount: "",
  toError: null,
  tokenError: null,
  amountError: null,
  basketItems: []
}

export const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    addToBasket: (state, action) => {
      var toError = null, tokenError = null, amountError = null
      if (action.payload.to == "") {
        toError = 'To can not be empty'
      }
      if (action.payload.token == "") {
        tokenError = "Token address can't be empty"
      }
      if (action.payload.amount == "") {
        amountError = "Amount can't be empty"
      }

      if (isEmpty(toError) && isEmpty(tokenError) && isEmpty(amountError)) {
        basketItems = [...state.basketItems, action.payload]
        state = {
          ...state, basketItems: basketItems, to: '', token: '', amount: '', toError: null, tokenError: null, amountError: null
        }
      } else {
        state = {
          ...initialState, ...state, basketItems: state.basketItems, toError: toError, tokenError: tokenError, amountError: amountError
        }
      }
      return state;
    },
    onToChanged: (state, action) => {
      var isValid = new RegExp("^0x[a-fA-F0-9]{40}$").test(action.payload.toAddress)
      toError = null;
      if (action.payload.toAddress == "") {
        isValid = true;
      }
      if (!isValid) {
        toError = "Please use an EVM Address, starts with 0x"
      }
      state = {
        ...initialState, ...state, toError: toError, to: action.payload.toAddress
      }
      return state;
    },
    onTokenChanged: (state, action) => {
      var isValid = new RegExp("^0x[a-fA-F0-9]{40}$").test(action.payload.tokenAddress)
      tokenError = null;
      if (action.payload.tokenAddress == "") {
        isValid = true;
      }
      if (action.payload.tokenError != null) {
        tokenError = action.payload.tokenError
      }
      if (!isValid) {
        tokenError = "Please use an EVM Address, starts with 0x"
      }
      state = {
        ...initialState, ...state, tokenError: tokenError, token: action.payload.tokenAddress
      }
      return state;
    },
    onAmountChanged: (state, action) => {
      state = {
        ...initialState, ...state, amountError: null, amount: action.payload.amount
      }
      return state;
    }
  },
})
function isEmpty(value) {
  return (value == null || value.length === 0);
}

export const { addToBasket, onToChanged, onTokenChanged, onAmountChanged } = homeSlice.actions

export const homeState = (state) => state.home

export default homeSlice.reducer