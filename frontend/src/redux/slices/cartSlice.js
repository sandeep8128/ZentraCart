import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartCount: 0,
  wishlistCount: 0,
};

const cartSlice = createSlice({
  name: "cart",

  initialState,

  reducers: {
    setCartCount: (state, action) => {
      state.cartCount = action.payload;
    },

    setWishlistCount: (state, action) => {
      state.wishlistCount = action.payload;
    },

    increaseCartCount: (state) => {
      state.cartCount += 1;
    },

    increaseWishlistCount: (state) => {
      state.wishlistCount += 1;
    },

    decreaseCartCount: (state) => {
      if (state.cartCount > 0) {
        state.cartCount -= 1;
      }
    },

    decreaseWishlistCount: (state) => {
      if (state.wishlistCount > 0) {
        state.wishlistCount -= 1;
      }
    },
  },
});

export const {
  setCartCount,
  setWishlistCount,
  increaseCartCount,
  increaseWishlistCount,
  decreaseCartCount,
  decreaseWishlistCount,
} = cartSlice.actions;

export default cartSlice.reducer;