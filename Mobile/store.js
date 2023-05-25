import { configureStore } from '@reduxjs/toolkit'
import homeReducer from "./reducers/homeSlice"

export const store = configureStore({
  reducer: {
    home: homeReducer
  },
})