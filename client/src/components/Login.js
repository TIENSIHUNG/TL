import React, { useState } from 'react';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    try {
      
      if (!formData.email || !formData.password) {
        toast.error("Please fill in all fields");
        return;
      }

      const res = await axios.post(`http://localhost:5000/api/user/login`, formData);

      if (res.data.token) {
        Cookies.set("email", res.data.email, { expires: 7 });
        Cookies.set("token", res.data.token, { expires: 7 }); // Store the token in cookies if needed
        toast.success("Successfully Logged In");
        navigate('/'); // Redirect to the desired page after successful login
      } else {
        toast.error("Something went wrong!");
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong!");
      }
      console.error("An error occurred:", error);
    }
  };

  return (
    <div className='mb-6'>
      <form method='/login' action="POST" onSubmit={submit}>
        <section className="text-gray-600 mt-14 body-font grid place-items-center relative">
          <div className="lg:w-1/3 md:w-1/2 bg-white rounded-lg p-8 flex flex-col mt-10 md:mt-0 relative z-10 shadow-md">
            <h2 className="text-gray-900 text-2xl mb-5 font-medium title-font">Login</h2>
            <div className="relative mb-4">
              <label htmlFor="email" className="leading-7 text-sm text-gray-600">Email</label>
              <input value={formData.email} onChange={(event) => setFormData({ ...formData, [event.target.name]: event.target.value })} required type="email" id="email" name="email" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
            </div>
            <div className="relative mb-4">
              <label htmlFor="password" className="leading-7 text-sm text-gray-600">Password</label>
              <input value={formData.password} onChange={(event) => setFormData({ ...formData, [event.target.name]: event.target.value })} required type="password" id="password" name="password" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
            </div>
            <input className="mt-3 cursor-pointer text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg" type="submit" value={"Submit"} />
            <p className="text-base text-blue-700 mt-3"><Link to={"/forgotpassword"}>Forgot Password</Link></p>
            <p className="text-base text-gray-500 mt-3">Don't have an account?</p>
            <p className="text-base text-blue-700 mt-3"><Link to={"/signup"}>Signup</Link></p>
          </div>
        </section>
      </form>
      <ToastContainer />
    </div>
  );
}
