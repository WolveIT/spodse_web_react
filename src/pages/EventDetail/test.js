
import React from "react";
import { connect } from "react-redux";
import { removeProductFromBasket } from "./actions";

// You can use console.log for debugging purposes.

// This component is already implemented and working as expected.
// `Please focus on Redux related parts.
export function Basket({ products = [], onRemove, totalPrice = 0.0 }) {
  return (
    <div>
      <ul className="products">
        {products.map((product) => (
          <li key={product.id} id={`product-${product.id}`}>
            <span>Name: {product.name}</span>
            <span>Quantity: {product.quantity}</span>
            <button
              id={`remove-${product.id}`}
              onClick={() => onRemove(product.id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div>
        Total price: <span id="total-price">{totalPrice}</span>
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    products: state.basket.products,
    totalPrice: state.basket.products.reduce((acc,curr) => acc + (curr.quantity*curr.price),0)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onRemove: (productId) => dispatch(removeProductFromBasket(productId))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Basket);

//reducer
const initialState = {
    products: [],
  };
  
  export default function basketReducer(state = initialState, action) {
    switch (action.type) {
      case "ADD_PRODUCT_TO_BASKET":
        const prev = products.find(p=>p.id === action.payload.id);
        if(!prev) return {...state, products: [...products, {...action.payload, quantity: 1}]};
        return {...state, products: [...products.filter(p => p.id !== action.payload.id), {...action.payload, quantity: prev.quantity+1}]};
      case "REMOVE_PRODUCT_FROM_BASKET":
        const prev = products.find(p=>p.id === action.payload.productId);
        if(!prev) return state;
        if(prev.quantity === 1) return {...state, products: products.filter(p => p.id !== action.payload.productId)};
        return {...state, products: [...products.filter(p => p.id !== action.payload.id), {...action.payload, quantity: prev.quantity-1}]};
      default:
        return state;
    }
  }

  
//actions:
export function addProductToBasket(product) {
    return {
      payload: product,
      type: "ADD_PRODUCT_TO_BASKET",
    };
  }
  
  export function removeProductFromBasket(productId) {
    return {
      payload: { productId },
      type: "REMOVE_PRODUCT_FROM_BASKET",
    };
  }
  