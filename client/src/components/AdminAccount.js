import axios from 'axios';
import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import Cookies from "js-cookie";
import LoadingBar from 'react-top-loading-bar';

export default function AdminAccount() {
  const [progress, setProgress] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    material: '',
    price: '',
    quantity: '',
    description: ''
  });

  const [message, setMessage] = useState('');
  const [images, setImages] = useState([]);

  function isValidUrl(text) {
    const urlRegex = /^(https?|ftp|file):\/\/\S+$/i;
    return urlRegex.test(text);
  }

  async function submit(e) {
    e.preventDefault();

    // Validate form fields
    if (!formData.title || !formData.material || !formData.price || !formData.quantity || !formData.description) {
      toast.error("All fields are required");
      return;
    }

    try {
      // Create the product data object
      const productData = {
        title: formData.title,
        slug: formData.title.toLowerCase().replace(/ /g, '-'),
        description: formData.description,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        material: formData.material,
        images: images
      };
    // Retrieve JWT token from cookie
    const token = Cookies.get('token');

    // Set authorization header with the JWT token
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

      // Send the product data to the server
      const response = await axios.post('http://localhost:5000/api/product', productData, config);

      // Handle the server response
      if (response.status === 201) {
        // Product created successfully
        toast.success("Product added successfully");
        // Reset form fields and images
        setFormData({ title: '', material: '', price: '', quantity: '', description: '' });
        setImages([]);
      } else {
        // Error creating product
        toast.error("Something went wrong!");
      }
    } catch (error) {
      // Enhanced error logging
      console.error('Error creating product:', error.response ? error.response.data : error.message);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error("Something went wrong!");
      }
    }
  }

  const handleChange = (event) => {
    setMessage(event.target.value);
  };

  const urlSend = (event) => {
    if (message === '') {
      toast.warn("URL cannot be empty");
    } else if (!isValidUrl(message)) {
      toast.error("It is not a valid URL");
    } else if (images.length >= 6) {
      toast.error("Max 6 images are allowed");
    } else {
      setImages([message, ...images]);
      setMessage('');
    }
  };

  const handleDelete = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const logOut = () => {
    setProgress(100);
    Cookies.remove('email');
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const logFormData = () => {
    console.log("Form Data:", formData);
    console.log("Images:", images);
  };

  return (
    <div>
      <LoadingBar
        color='red'
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />

      <h1 className='text-3xl text-center mt-6'>Admin Account</h1>

      <form onSubmit={submit}>
        <section className="text-gray-600 mt-6 body-font grid place-items-center relative">
          <div className="lg:w-1/3 md:w-1/2 bg-white rounded-lg p-8 flex flex-col mt-10 md:mt-0 relative z-10 shadow-md">
            <h2 className="text-gray-900 text-2xl mb-5 font-medium title-font">Add a product here :</h2>

            <div className="relative mb-4">
              <label htmlFor="title" className="leading-7 text-sm text-gray-600">Name of the product</label>
              <input value={formData.title} onChange={handleInputChange} required type="text" id="title" name="title" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
            </div>
            <div className="relative mb-4">
              <label htmlFor="material" className="leading-7 text-sm text-gray-600">Product Material</label>
              <select value={formData.material} onChange={handleInputChange} required id="material" name="material" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
                <option value="">Select Material</option>
                <option value="Plastic">Plastic</option>
                <option value="Metal">Metal</option>
                <option value="Acrylic">Acrylic</option>
              </select>
            </div>
            <div className="relative mb-4">
              <label htmlFor="price" className="leading-7 text-sm text-gray-600">Price</label>
              <input value={formData.price} onChange={handleInputChange} required type="number" id="price" name="price" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
            </div>
            <div className="relative mb-4">
              <label htmlFor="quantity" className="leading-7 text-sm text-gray-600">Number of stocks</label>
              <input value={formData.quantity} onChange={handleInputChange} required type="number" id="quantity" name="quantity" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
            </div>
            <div className="relative mb-4">
              <label htmlFor="description" className="leading-7 text-sm text-gray-600">Description</label>
              <textarea value={formData.description} onChange={handleInputChange} required id="description" name="description" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"></textarea>
            </div>
            <div className="relative mb-4">
              <label htmlFor="img" className="leading-7 text-sm text-gray-600">Enter image URL</label>
              <input value={message} onChange={handleChange} type="text" id="img" name="img" className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
            </div>

            <button type='button' className="cursor-pointer text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg" onClick={urlSend}>Add Image URL</button>

            <br />
            <div>
              {images.map((img, index) => (
                <div key={index}>
                  {img}
                  <button type='button' className='ml-2' onClick={() => handleDelete(index)}><i className="fa-solid fa-trash-can"></i></button>
                  <br />
                  <br />
                </div>
              ))}
            </div>

            <input className="cursor-pointer text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg" type="submit" value={"Submit"} />
          </div>
          <button type='button' onClick={logFormData} className="mb-4 mt-4 text-gray-700 bg-gray-100 border-0 py-2 px-6 focus:outline-none hover:bg-gray-200 rounded text-lg">Log Form Data</button>
          <button onClick={logOut} className="mb-4 mt-4 text-gray-700 bg-gray-100 border-0 py-2 px-6 focus:outline-none hover:bg-gray-200 rounded text-lg">Log Out</button>
        </section>
      </form>
      <ToastContainer />
    </div>
  );
}
