import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import LoadingBar from 'react-top-loading-bar';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actionCreators } from '../state/index.js';
import PulseLoader from 'react-spinners/PulseLoader';
import SmallCartPreview from './SmallCartPreview'; // Import the SmallCartPreview component

const Wishlist = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [orderQuantities, setOrderQuantities] = useState({});
  const { SingleItemPageObj } = bindActionCreators(actionCreators, useDispatch());

  const getItemsFromWishlist = async () => {
    setProgress(20);
    const token = Cookies.get('token'); // Get token from cookie

    if (!token) {
      toast.warn('Please log in to view your wishlist');
      navigate('/login');
      return;
    }

    try {
      setProgress(50);

      const res = await axios.get(`http://localhost:5000/api/user/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in request headers
        },
      });

      if (res.data.wishlist && res.data.wishlist.length === 0) {
        toast.warn('Your wishlist is empty');
        setData([]); // Ensure data is an array
        setLoading(false);
      } else if (res.data.wishlist) {
        setData(res.data.wishlist);
        setOrderQuantities(res.data.wishlist.reduce((acc, item) => {
          acc[item._id] = 1; // Default quantity is 1
          return acc;
        }, {}));
        setLoading(false);
      }

      setProgress(70);
    } catch (e) {
      toast.error('Something went wrong!');
    }

    setProgress(100);
  };

  const deleteFromCart = async (itemId) => {
    try {
      const token = Cookies.get('token'); // Get token from cookie
      if (!token) {
        toast.warn('Login to continue');
        navigate('/login');
        return; // Exit early if user is not logged in
      }

      const res = await axios.put('http://localhost:5000/api/product/wishlist/', { proId: itemId }, {
        headers: {
          Authorization: `Bearer ${token}` // Include token in request headers
        }
      });

      // Check if the request was successful
      if (res.status === 200) {
        const updatedUser = res.data;
        if (updatedUser && !updatedUser.wishlist.includes(itemId)) {
          toast.success('Product removed from wishlist');
          // Fetch updated wishlist after removing item
          getItemsFromWishlist();
        } else {
          toast.error('Failed to remove product from wishlist');
        }
      } else {
        toast.error('Failed to remove product from wishlist');
      }
    } catch (error) {
      console.error('Error removing product from wishlist:', error);
      throw new Error('Something went wrong while removing product from wishlist');
    }
  };

  const handleButtonClick = (id) => {
    deleteFromCart(id);
  };

  const handleQuantityChange = (id, quantity) => {
    if (quantity < 1) return;
    setOrderQuantities(prevQuantities => ({
      ...prevQuantities,
      [id]: quantity,
    }));
  };

  const handleOrder = () => {
    navigate('/address', { state: { data, orderQuantities } });
  };

  useEffect(() => {
    getItemsFromWishlist();
  }, []);

  const goToProductPage = (index) => {
    SingleItemPageObj({
      name: data[index].title,
      type: data[index].type,
      img: data[index].images,
      price: data[index].price,
      stocks: data[index].quantity,
      allRatings: data[index].totalrating,
      reviews: data[index].ratings,
      productId: data[index]._id
    });
    navigate(`/singleitempage/${data[index]._id}`);
  };

  return (
    loading === false ? (
      <div>
        <LoadingBar
          color='red'
          progress={progress}
          onLoaderFinished={() => setProgress(0)}
        />
        {
          data.length > 0 ? (
            <div>
              <h1 className='text-3xl font-bold mt-3 ml-3 text-center mb-10'>Your Wishlist</h1>
              {data.map((e, index) => (
                <div key={e._id} className='my-3'>
                  <section className='text-gray-600 w-[95vw] my-3 flex body-font overflow-hidden mx-auto'>
                    <div className='w-3/12 mr-3 grid place-items-center'>
                      <div className='w-32 h-32 flex items-center justify-center overflow-hidden'>
                        <img onClick={() => goToProductPage(index)} alt='ecommerce' className='cursor-pointer object-cover object-center h-full w-full' src={e.images[0]} />
                      </div>
                    </div>
                    <div className='w-8/12 flex-col flex'>
                      <h2 className='text-xs lg:text-lg text-gray-500 tracking-widest'>Material: {e.material}</h2>
                      <h1 onClick={() => goToProductPage(index)} className='cursor-pointer hover:text-indigo-500 w-fit text-gray-900 text-lg lg:text-2xl title-font font-medium mb-1'>{e.title}</h1>
                      {
                        e.quantity > 0 ? <p className='mt-1 text-white bg-green-500 w-fit px-2 rounded-lg'>In Stock</p> : <p className='mt-1 text-white bg-red-500 w-fit px-2 rounded-lg'>Out of Stock</p>
                      }
                      <div className='flex items-center ml-4 pt-2 mt-3'>
                        <button onClick={() => handleQuantityChange(e._id, orderQuantities[e._id] - 1)} className='px-2 py-1 border border-gray-300 rounded-l bg-gray-200'>-</button>
                        <input
                          type='text'
                          value={orderQuantities[e._id]}
                          readOnly
                          className='w-12 text-center border-t border-b border-gray-300'
                        />
                        <button onClick={() => handleQuantityChange(e._id, orderQuantities[e._id] + 1)} className='px-2  py-1 border border-gray-300 rounded-r bg-gray-200'>+</button>
                      </div>
                      <div className='flex mt-auto items-center'>
                        <span className='title-font font-medium text-xl lg:text-2xl text-gray-900'> {e.price} VND</span>
                        <button onClick={() => handleButtonClick(e._id)} className='ml-auto text-white bg-gray-400 py-0 px-4 focus:outline-none hover:bg-gray-600 rounded'>Delete</button>
                      </div>
                    </div>
                  </section>
                  <hr className='border-gray-500' />
                </div>
              ))}
              <div className='flex justify-center mt-10'>
                <button onClick={handleOrder} className='text-white bg-blue-500 py-2 px-6 rounded-lg focus:outline-none hover:bg-blue-600'>
                  Place Order
                </button>
              </div>
            </div>
          ) : (
            <div className='w-full grid place-items-center lg:flex'>
              <h2 className='w-6/12 text-center lg:w-4/12 my-3 lg:my-0 lg:ml-4 font-bold text-xl lg:text-5xl'>Your wishlist is empty</h2>
              <img className='w-6/12' src={require('./Images/empty-freepik (1).jpg')} alt='Empty Wishlist' />
            </div>
          )
        }
      </div>
    ) : (
      <div className='flex justify-center w-full my-10'>
        <PulseLoader
          color='rgb(74, 87, 224)'
          loading={loading}
          size={20}
          aria-label='Loading Spinner'
          data-testid='loader'
        />
      </div>
    )
  );
}

export default Wishlist;

