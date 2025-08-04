import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cart: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addCart: (state, action) => {
      const p = action.payload;
      const exists = state.cart.find(x => x.ic_code === p.ic_code);

      const discount = p.discount_amount ?? 0;
      const price_after = p.sale_price - discount;
      const earn_point = p.earn_point ?? 0;

      if (exists) {
        exists.qty += 1;
        exists.earn_point = earn_point; // หากต้องการอัปเดต
      } else {
        state.cart.push({
          ...p,
          qty: 1,
          discount_amount: discount,
          price_after_discount: price_after,
          earn_point: earn_point,
        });
      }
    },
    removeCart: (state, action) => {
      state.cart = state.cart.filter(x => x.ic_code !== action.payload);
    },
    setQty: (state, action) => {
      const { ic_code, qty } = action.payload;
      const found = state.cart.find(x => x.ic_code === ic_code);
      if (found) found.qty = Math.max(1, qty);
    },
    clearCart: (state) => {
      state.cart = [];
    }
  }
});

export const { addCart, removeCart, setQty, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
