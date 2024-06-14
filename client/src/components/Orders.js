import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import LoadingBar from 'react-top-loading-bar';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actionCreators } from '../state/index.js';
import PulseLoader from 'react-spinners/PulseLoader';

export default function Orders() {
  const [progress, setProgress] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { SingleOrderPageObj } = bindActionCreators(actionCreators, useDispatch());

  const getOrders = async () => {
    setProgress(20);
    const token = Cookies.get('token');
    const userRole = Cookies.get('role'); // Assuming you store the role in a cookie
    setIsAdmin(userRole === 'admin');
    console.log("Token:", token); // Log the token for debugging

    try {
      const res = await axios.get(`http://localhost:5000/api/${userRole === 'admin' ? 'admin' : 'user'}/get-order`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("Response:", res.data); // Log the response for debugging

      let fetchedOrders = res.data;
      if (!Array.isArray(fetchedOrders)) {
        fetchedOrders = [fetchedOrders]; // Wrap single order object in an array
      }

      if (fetchedOrders.length > 0) {
        setOrders(fetchedOrders);
        console.log("Orders set:", fetchedOrders); // Log orders for debugging
      } else {
        toast.warn("You don't have any orders");
      }
      setLoading(false);
      setProgress(100);
    } catch (error) {
      console.error("Error fetching orders:", error); // Log the error for debugging
      toast.error("Something went wrong!");
      setProgress(100);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setProgress(20);
    const token = Cookies.get('token');

    try {
      const res = await axios.put(`http://localhost:5000/api/admin/update-order/${orderId}`, {
        orderStatus: newStatus
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("Response:", res.data); // Log the response for debugging

      // Update the order status locally
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );
      toast.success("Order status updated successfully");
      setProgress(100);
    } catch (error) {
      console.error("Error updating order status:", error); // Log the error for debugging
      toast.error("Failed to update order status");
      setProgress(100);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  const goToSingleOrderPage = (order) => {
    SingleOrderPageObj(order);
    navigate("/singleorderpage");
  };

  return (
    <div>
      <LoadingBar
        color='red'
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <ToastContainer />

      {loading ? (
        <div className='flex justify-center w-full my-10'>
          <PulseLoader
            color='rgb(74, 87, 224)'
            loading={loading}
            size={20}
            aria-label='Loading Spinner'
            data-testid='loader'
          />
        </div>
      ) : (
        orders.length > 0 ? (
          <div>
            <h1 className='text-3xl font-bold mt-3 ml-3 text-center mb-10'>{isAdmin ? 'All Orders' : 'Your Orders'}</h1>
            {orders.map((order) => (
              <div key={order._id} className='my-3'>
                <section className="text-gray-600 w-[95vw] my-3 flex flex-col body-font overflow-hidden mx-auto">
                  <div className="w-full flex-col flex">
                    <h2 className="text-lg lg:text-2xl title-font font-medium mb-1">Order N.o: {order.title}</h2>
                    <p className='font-sans mb-2'>Ordered on {new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className='font-sans mb-2'>Address: {order.address}</p>
                    <p className='font-sans mb-2'>Phone: {order.phoneNumber}</p>
                    <div className="mb-2">
                      <h3 className='font-sans mb-1'>Products:</h3>
                      <ul>
                        {order.products.map((item) => (
                          <li key={item.product._id} className='ml-4'>- {item.product.title} (Quantity: {item.count})</li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-auto">
                      <p className='w-fit text-white bg-gray-500 border-0 py-2 px-6 focus:outline-none rounded text-lg'>Total: {order.paymentIntent.amount} {order.paymentIntent.currency.toUpperCase()}</p>
                    </div>
                    {isAdmin && (
                      <div className="mt-2">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        >
                          <option value="Not Processed">Not Processed</option>
                          <option value="Cash on Delivery">Cash on Delivery</option>
                          <option value="Processing">Processing</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>
                    )}
                  </div>
                </section>
                <hr className='border-gray-500' />
              </div>
            ))}
          </div>
        ) : (
          <div className='w-full grid place-items-center lg:flex'>
            <h2 className='w-6/12 text-center lg:w-4/12 my-3 lg:my-0 lg:ml-4 font-bold text-xl lg:text-5xl'>No Orders Yet</h2>
            <img className='w-6/12' src={require('./Images/noorders-freepik (1).jpg')} alt="No Orders" />
          </div>
        )
      )}
    </div>
  );
}
