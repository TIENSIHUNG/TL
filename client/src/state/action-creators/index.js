// export const decCounter=(counter)=>{
//     return (dispatch)=>{
//         dispatch({
//             type:'decrease',
//             payload:counter
//         })
//     }
// }


// export const incCounter=(counter)=>{
//     return (dispatch)=>{
//         dispatch({
//             type:'increase',
//             payload:counter
//         })
//     }
// }

export const searchQuery=(counter)=>{
    return (dispatch)=>{
        dispatch({
            type:'searchQuery',
            payload:counter
        })
    }
}

export const SingleItemPageObj=(counter)=>{
    return (dispatch)=>{
        dispatch({
            type:'SingleItemPageObj',
            payload:counter
        })
    }
}

export const SmallCartPreviewArr=(counter)=>{
    return (dispatch)=>{
        dispatch({
            type:'SmallCartPreviewArr',
            payload:counter
        })
    }
}
export const SmallCartPreviewTotal=(counter)=>{
    return (dispatch)=>{
        dispatch({
            type:'SmallCartPreviewTotal',
            payload:counter
        })
    }
}

export const isProductFromCart=(counter)=>{
    return (dispatch)=>{
        dispatch({
            type:'isProductFromCart',
            payload:counter
        })
    }
}


export const displayProductPage=(counter)=>{
    return (dispatch)=>{
        dispatch({
            type:'displayProductPage',
            payload:counter
        })
    }
}

export const paymentDetails=(counter)=>{
    return (dispatch)=>{
        dispatch({
            type:'paymentDetails',
            payload:counter
        })
    }
}
export const SingleOrderPageObj=(counter)=>{
    return (dispatch)=>{
        dispatch({
            type:'SingleOrderPageObj',
            payload:counter
        })
    }
}

export const setSingleItem = (item) => {
    return {
      type: 'SET_SINGLE_ITEM',
      payload: item,
    };
  };

  // actionCreators.js
// Action creators to add items to the cart and update total
export const addToCart = (item) => ({
    type: 'ADD_TO_CART',
    payload: item,
  });
  
  export const updateCartTotal = (total) => ({
    type: 'UPDATE_CART_TOTAL',
    payload: total,
  });
  

