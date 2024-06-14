import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    cPassword: '',
    mobile: '',
  });

  const submit = async (e) => {
    e.preventDefault();

    try {
      if (formData.password !== formData.cPassword) {
        toast.error('Passwords do not match');
      } else if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters long');
      } else if (!formData.mobile.match(/^\d{10}$/)) {
        toast.error('Invalid mobile number');
      } else {
        const res = await axios.post(`http://localhost:5000/api/user/register`, formData); // Removed unnecessary object wrapping
        if (res.data.message === 'User already Exists') {
          toast.error('Email is already registered');
        } else {
          Cookies.set('email', formData.email, { expires: 7 });
          toast.success('Successfully Registered', {
            autoClose: 1000,
          });
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('An error occurred:', error);
      toast.error('Something went wrong!');
    }
  };

  return (
    <div className='mb-6'>
      <form onSubmit={submit}>
        <section className="text-gray-600 mt-14 body-font grid place-items-center relative">
          <div className="lg:w-1/3 md:w-1/2 bg-white rounded-lg p-8 flex flex-col mt-10 md:mt-0 relative z-10 shadow-md">
            <h2 className="text-gray-900 text-2xl mb-5 font-medium title-font">Sign Up</h2>
            <div className="relative mb-4">
              <label htmlFor="firstName" className="leading-7 text-sm text-gray-600">First Name</label>
              <input
                value={formData.firstName}
                onChange={(event) => setFormData({ ...formData, firstName: event.target.value })}
                required
                type="text"
                id="firstName"
                name="firstName"
                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              />
            </div>
            <div className="relative mb-4">
              <label htmlFor="lastName" className="leading-7 text-sm text-gray-600">Last Name</label>
              <input
                value={formData.lastName}
                onChange={(event) => setFormData({ ...formData, lastName: event.target.value })}
                required
                type="text"
                id="lastName"
                name="lastName"
                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              />
            </div>
            <div className="relative mb-4">
              <label htmlFor="email" className="leading-7 text-sm text-gray-600">Email</label>
              <input
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                required
                type="email"
                id="email"
                name="email"
                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              />
            </div>
            <div className="relative mb-4">
              <label htmlFor="password" className="leading-7 text-sm text-gray-600">Password</label>
              <input
                value={formData.password}
                onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                required
                type="password"
                id="password"
                name="password"
                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              />
            </div>
            <div className="relative mb-4">
              <label htmlFor="cPassword" className="leading-7 text-sm text-gray-600">Confirm Password</label>
              <input
                value={formData.cPassword}
                onChange={(event) => setFormData({ ...formData, cPassword: event.target.value })}
                required
                type="password"
                id="cPassword"
                name="cPassword"
                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              />
            </div>
            <div className="relative mb-4">
              <label htmlFor="mobile" className="leading-7 text-sm text-gray-600">Mobile Number</label>
              <input
                value={formData.mobile}
                onChange={(event) => setFormData({ ...formData, mobile: event.target.value })}
                required
                type="text"
                id="mobile"
                name="mobile"
                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              />
            </div>
            <input
              className="cursor-pointer mt-2 text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
              type="submit"
              value="Submit"
            />
            <p className="text-base text-gray-500 mt-3">Already have an account?</p>
            <p className="text-base text-blue-700 mt-3"><Link to="/login">Login</Link></p>
          </div>
        </section>
      </form>
      <ToastContainer />
    </div>
  );
}
