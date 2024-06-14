import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actionCreators } from '../state/index.js';
import SmallCartPreview from './SmallCartPreview.js';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function Address() {
    const location = useLocation();
    const { data, orderQuantities } = location.state || {};
    const navigate = useNavigate();
    const { paymentDetails } = bindActionCreators(actionCreators, useDispatch());

    const [formData, setFormData] = useState({
        phone: '',
        address: '',
    });

    const [totalAmount, setTotalAmount] = useState(0); // State to store total amount

    useEffect(() => {
        toast.info("We only deliver in DANANG for now!", {
            autoClose: false,
        });
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        if (formData.phone.length !== 10) {
            toast.error("Phone number should be 10 digits long");
            return;
        }
    
        try {
            // Get the token from the cookie
            const token = Cookies.get('token'); // replace 'token' with the name of your cookie
    
            if (!token) {
                toast.error("No token found");
                return;
            }
    
            // Data to be sent to the server
            const orderDetails = {
                phone: formData.phone,
                address: formData.address,
                products: data.map(item => ({
                    productId: item._id,
                    count: orderQuantities[item._id] || 0
                })),
                totalAmount: totalAmount
            };
    
            // Send POST request to server to create order
            const response = await axios.post('http://localhost:5000/api/user/cart/cash-order/', orderDetails, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (response.data.message === 'Order created successfully') {
                paymentDetails({
                    phoneNum: formData.phone,
                    address: formData.address,
                });
                toast.success("Order created successfully!");
                navigate("/orders");
            } else {
                toast.error("Failed to create order");
            }
        } catch (error) {
            toast.error(`An error occurred: ${error.response?.data?.error || error.message}`);
        }
    };
    

    return (
        <div className='lg:flex w-full my-3'>
            <form onSubmit={submit} className='lg:w-8/12 text-gray-600 body-font grid place-items-center'>
                <div className="lg:w-1/2 md:w-1/2 bg-white rounded-lg p-8 flex flex-col mt-10 md:mt-0 relative z-10 shadow-md">
                    <h2 className="text-gray-900 text-2xl mb-5 font-medium title-font">Delivery Details :</h2>

                    <div className="relative mb-4">
                        <label htmlFor="phone" className="leading-7 text-sm text-gray-600">Phone Number</label>
                        <input value={formData.phone} onChange={(event) => setFormData({ ...formData, [event.target.name]: event.target.value })} required type="number" id="phone" name="phone" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                    </div>
                    <div className="relative mb-4">
                        <label htmlFor="address" className="leading-7 text-sm text-gray-600">Address</label>
                        <textarea value={formData.address} onChange={(event) => setFormData({ ...formData, [event.target.name]: event.target.value })} required id="address" name="address" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                    </div>

                    <input type="submit" className="mt-3 cursor-pointer text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg" value="Submit" />
                </div>
            </form>

            <div className='lg:w-4/12 lg:border'>
                <SmallCartPreview data={data} orderQuantities={orderQuantities} setTotalAmount={setTotalAmount} />
            </div>

            <ToastContainer />
        </div>
    );
}
