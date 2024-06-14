import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import LoadingBar from 'react-top-loading-bar';
import { useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actionCreators } from '../state/index.js';

export default function SingleItemPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const dispatch = useDispatch();
  const [progress, setProgress] = useState(0);
  const [qty, setQty] = useState(1);
  const [SingleItemPageObj, setSingleItemPageObj] = useState(null);

  const { SmallCartPreviewArr, SmallCartPreviewTotal, isProductFromCart } = bindActionCreators(actionCreators, dispatch);

  const fetchProductDetails = async (productId) => {
    try {
      setProgress(30);
      const response = await axios.get(`http://localhost:5000/api/product/${productId}`);
      setSingleItemPageObj(response.data);
      setProgress(100);
    } catch (error) {
      console.error('Failed to fetch product details:', error);
      toast.error('Failed to fetch product details');
      setProgress(100);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProductDetails(productId);
    }
  }, [productId]);

  const { ratings = [], images = [], title, material, price, quantity } = SingleItemPageObj || {};
  const imgArr = images || [];
  const [bigImage, setBigImage] = useState(imgArr[0] || '');

  useEffect(() => {
    if (imgArr.length) {
      setBigImage(imgArr[0]);
    }
  }, [imgArr]);

  const imgChange = (e) => {
    setBigImage(e.target.getAttribute('src'));
  };

  const addToCart = async () => {
    try {
      const token = Cookies.get('token'); // Get token from cookie
      if (!token) {
        toast.warn('Login to continue');
        navigate('/login');
        return; // Exit early if user is not logged in
      }
  
      // Log the productId for debugging
      console.log('productId:', productId);
  
      // Call the addToWishlist API with token in headers
      const res = await axios.put('http://localhost:5000/api/product/wishlist/', { proId: productId }, {
        headers: {
          Authorization: `Bearer ${token}` // Include token in request headers
        }
      });
  
      // Check if the request was successful
      if (res.status === 200) {
        const updatedUser = res.data;
        if (updatedUser && updatedUser.wishlist.includes(productId)) {
          toast.success('Product added to cart');
        } else {
          toast.success('Product removed from cart');
        }
      } else {
        toast.error('Failed to update cart');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      throw new Error('Something went wrong while updating cart');
    }
  };

  const goToAddress = () => {
    setProgress(20);
    const cookieVal = Cookies.get('email');
    if (quantity === 0) {
      toast.warn('Product is out of stock');
    } else if (!cookieVal) {
      toast.warn('Login to continue');
      navigate('/login');
    } else {
      SmallCartPreviewArr([{ SingleItemPageObj, qty }]);
      isProductFromCart(false);
      SmallCartPreviewTotal(price * qty);
      navigate('/address');
    }
    setProgress(100);
  };

  const totalRating = ratings.length ? (ratings.reduce((sum, { rating }) => sum + rating, 0) / ratings.length).toFixed(1) : 0;

  if (!SingleItemPageObj) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <LoadingBar color='red' progress={progress} onLoaderFinished={() => setProgress(0)} />
      <section className="text-gray-600 body-font overflow-hidden">
        <div className="container px-5 py-24 mx-auto">
          <div className="lg:w-4/5 mx-auto flex flex-wrap">
            <div className='lg:w-1/2 flex flex-wrap w-full lg:h-auto'>
              <div className='lg:w-1/12 flex flex-wrap mb-4 lg:mr-3'>
                {imgArr.map((e, index) => (
                  <div key={index}>
                    <img
                      onMouseOver={imgChange}
                      className='w-9 h-11 mr-4 lg:w-12 object-contain object-center border border-black rounded-md hover:shadow-md hover:shadow-indigo-500 cursor-pointer'
                      src={e}
                      alt=""
                    />
                  </div>
                ))}
              </div>
              <div className='lg:w-10/12 w-full h-[40vh] lg:h-[80vh] border border-black flex justify-center'>
                <img alt="ecommerce" className="object-contain h-full rounded" src={bigImage} />
              </div>
            </div>
            <div className="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0">
              <h2 className="text-sm title-font text-gray-500 tracking-widest">Material: {material}</h2>
              <h1 className="text-gray-900 text-3xl title-font font-medium mb-1">{title}</h1>
              <h2 className="text-lg font-semibold tracking-widest">
                Rating: {totalRating}/5
                <i className="text-yellow-400 fa-solid fa-star mr-2"></i>
                ({ratings.length} ratings)
              </h2>
              <div className="my-3 w-full flex">
                <div className="border-2 border-gray-600 w-5/12 grid place-items-center rounded-lg">
                  <i className="fa-solid fa-truck-fast text-5xl mt-2"></i>
                  <h2 className="text-center title-font font-medium text-lg mt-2 text-gray-900">Free delivery</h2>
                </div>
                <div className="ml-4 border-2 border-gray-600 w-5/12 grid place-items-center rounded-lg">
                  <i className="fa-solid fa-box text-5xl mt-2"></i>
                  <h2 className="text-center title-font font-medium text-lg mt-2 text-gray-900">Best quality product</h2>
                </div>
              </div>
              {quantity > 0 ? (
                <p className="mt-1 text-white bg-green-500 w-fit px-2 rounded-lg">In Stock</p>
              ) : (
                <p className="mt-1 text-white bg-red-500 w-fit px-2 rounded-lg">Out of Stock</p>
              )}

              <hr className='mt-3 mb-3'/>
              <div className="flex">
                <span className="title-font font-medium text-2xl text-gray-900">Rs. {price}.00</span>
                <div className='items-center ml-auto mr-4'>
                  <button onClick={addToCart} className="items-center mb-2 w-full text-center flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded">
                    Add to Cart
                    <i className="ml-3 fa-solid fa-cart-shopping"></i>
                  </button>
                  <button onClick={goToAddress} className="flex w-full text-center text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded">
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className='ml-4 mb-4'>
        {ratings.length ? (
          <div>
            <p className='text-3xl font-semibold'>All Reviews:</p>
            {ratings.map((e, index) => (
              <div key={index} className='my-4'>
                <p className='text-sm text-gray-500'>~{e.name.split('@')[0]}</p>
                <p className='text-xl'>{e.message}</p>
                <hr className='border-gray-500' />
              </div>
            ))}
          </div>
        ) : (
          <p className='text-3xl font-semibold'>No Reviews yet</p>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}
