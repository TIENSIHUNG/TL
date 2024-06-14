const initialState = {
    searchQuery: "",
    SingleItemPageObj: {
        name: '',
        type: '',
        img: [],
        price: 0,
        stocks: 0,
        allRatings: [],
        reviews: []
    },
    SmallCartPreviewArr: [],
    SmallCartPreviewTotal: 0,
    isProductFromCart: false,
    // number: 1,
    paymentDetails:{},
    SingleOrderPageObj:{
        name: '',
        type: '',
        img: [],
        price: 0,
        date:'',
        time:'',
        stocks: 0,
        phoneNum: 0,
        address: '',
        pinCode: 0,
        cardNum: 0
    }
  };

  const reducer = (state = initialState, action) => {
    switch (action.type) {
      case 'searchQuery':
        return { ...state, searchQuery: action.payload };
      case 'SingleItemPageObj':
        return { ...state, SingleItemPageObj: action.payload };
      case 'SmallCartPreviewArr':
        return { ...state, SmallCartPreviewArr: action.payload };
      case 'SmallCartPreviewTotal':
        return { ...state, SmallCartPreviewTotal: action.payload };
      case 'isProductFromCart':
        return { ...state, isProductFromCart: action.payload };
      case 'displayProductPage':
        return { ...state, text: action.payload };
      case 'paymentDetails':
        return { ...state, paymentDetails: action.payload };
      case 'SingleOrderPageObj':
        return { ...state, SingleOrderPageObj: action.payload };
      default:
        return state;
    }
  };
  
  export default reducer;
  