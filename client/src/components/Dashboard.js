import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Cookies from "js-cookie";
import LoadingBar from 'react-top-loading-bar';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Correct import for jwt-decode

export default function Dashboard() {
  const [progress, setProgress] = useState(0);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const token = Cookies.get('token');
        if (!token) {
          toast.error("Unauthorized access");
          navigate('/login'); // Redirect to login if not authenticated
          return;
        }

        const decodedToken = jwtDecode(token);
        console.log('Decoded Token:', decodedToken); // Debugging: Check the decoded token

        if (decodedToken.role !== 'admin') {
          toast.error("Access denied");
          navigate('/'); // Redirect to home if not an admin
          return;
        }

        setProgress(30);
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.get('http://localhost:5000/api/product', config);
        setProducts(response.data);
        setProgress(100);
      } catch (error) {
        console.error('Error fetching products:', error.response ? error.response.data : error.message);
        toast.error("Error fetching products");
        setProgress(100);
      }
    }

    fetchProducts();
  }, [navigate]);

  const handleDelete = async (productId) => {
    try {
      const token = Cookies.get('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(`http://localhost:5000/api/product/${productId}`, config);
      setProducts(products.filter(product => product._id !== productId));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error('Error deleting product:', error.response ? error.response.data : error.message);
      toast.error("Error deleting product");
    }
  };

  return (
    <div>
      <LoadingBar
        color='red'
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />

      <h1 className='text-3xl text-center mt-6'>Admin Dashboard</h1>

      <section className="text-gray-600 mt-6 body-font grid place-items-center relative">
        <div className="lg:w-3/4 md:w-1/2 bg-white rounded-lg p-8 flex flex-col mt-10 md:mt-0 relative z-10 shadow-md">
          <h2 className="text-gray-900 text-2xl mb-5 font-medium title-font">Products</h2>
          
          <div className="overflow-auto">
            <table className="table-auto w-full text-left whitespace-no-wrap">
              <thead>
                <tr>
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Material</th>
                  <th className="px-4 py-2">Price</th>
                  <th className="px-4 py-2">Quantity</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="border px-4 py-2">{product.title}</td>
                    <td className="border px-4 py-2">{product.material}</td>
                    <td className="border px-4 py-2">{product.price}</td>
                    <td className="border px-4 py-2">{product.quantity}</td>
                    <td className="border px-4 py-2">
                      {/* <button className="text-blue-500 mr-2" onClick={() => handleEdit(product._id)}>Edit</button> */}
                      <button className="text-red-500" onClick={() => handleDelete(product._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <ToastContainer />
    </div>
  );
}
