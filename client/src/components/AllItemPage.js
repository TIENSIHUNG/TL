import React, { useEffect, useState } from "react";
import PulseLoader from "react-spinners/PulseLoader";
import axios from "axios";
import LoadingBar from "react-top-loading-bar";
import { ToastContainer, toast } from "react-toastify";
import ItemCard from "./ItemCard.js";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

export default function AllItemPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [progress, setProgress] = useState(0);
  const [data, setData] = useState([]); // Initialize data as an empty array
  const [selectedOption, setSelectedOption] = useState("All");
  const [totalPages, setTotalPages] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [loading, setLoading] = useState(true);

  const typeChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const typeChangeSubmit = async () => {
    setProgress(20);
    setLoading(true);

    try {
      const token = Cookies.get("token"); // Get JWT token from cookies

      const res = await axios.get(`http://localhost:5000/api/product`, {
        headers: {
          Authorization: `Bearer ${token}` // Include token in request headers
        },
        params: {
          material: selectedOption !== "All" ? selectedOption : undefined,
          page: pageNum,
          limit: 12,
        },
      });

      if (res.data === "fail") {
        toast.error("Something went wrong!");
      } else {
        setProgress(50);
        console.log("API Response:", res.data); // Log the response

        // Assume the response is directly an array of products
        const products = res.data;
        setData(products); // Set data to the array of products

        // If the API also returns totalCount, use it; otherwise, compute totalPages based on products length
        const totalCount = products.length; // Adjust this if your API returns totalCount differently
        setTotalPages(Math.ceil(totalCount / 12));

        setProgress(100);
      }
    } catch (e) {
      if (e.response && e.response.status === 404) {
        toast.error("Products not found (404)!");
      } else {
        toast.error("Something went wrong!");
      }
      console.error("Error fetching products:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    typeChangeSubmit();
  }, [selectedOption, pageNum]);

  const prev = () => {
    if (pageNum > 1) {
      setPageNum(pageNum - 1);
    }
  };

  const next = () => {
    if (pageNum < totalPages) {
      setPageNum(pageNum + 1);
    }
  };
  // const handleItemSelect = (productId) => {
  //   navigate(`/single-item/${productId}`); // Navigate to single item page using product ID
  // };


  return (
    <div>
      <LoadingBar
        color="red"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />

      <h2 className="font-bold text-base my-2 ml-3 lg:text-3xl lg:my-4">
        Search by Material:
      </h2>
      <select
        className="border border-black rounded mb-2 ml-3 lg:text-xl"
        value={selectedOption}
        onChange={typeChange}
      >
        <option value="All">All</option>
        <option value="Plastic">Plastic</option>
        <option value="Metal">Metal</option>
        <option value="Acrylic">Acrylic</option>
      </select>

      <section className="text-gray-600 body-font ">
        <div className="container px-5 py-12 mx-auto">
          <div className="flex flex-wrap -m-4">
            {loading ? (
              <div className="flex justify-center w-full">
                <PulseLoader
                  color="rgb(74, 87, 224)"
                  loading={loading}
                  size={20}
                  aria-label="Loading Spinner"
                  data-testid="loader"
                />
              </div>
            ) : (
              data && data.length > 0 ? (
                data.map((item) => (
                  <div
                    className="lg:w-1/4 md:w-1/2 p-2 scale-95 my-4 w-full rounded-lg shadow-md cursor-pointer hover:shadow-2xl"
                    key={item._id}
                  >
                    <ItemCard
                      productId={item._id}
                      name={item.title}
                      type={item.material}
                      price={item.price}
                      stocks={item.quantity}
                      images={item.images} // Ensure you're passing the correct prop name
                      allRatings={item.totalrating}
                      reviews={item.ratings}
                    />
                  </div>
                ))
              ) : (
                <div className="flex justify-center w-full">
                  <p>No products available.</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <div id="buttons" className="flex justify-center mb-10 items-center">
        <button
          disabled={pageNum <= 1}
          onClick={prev}
          className="mr-4 inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
        >
          Previous
        </button>
        <p>
          Page: {pageNum}/{totalPages}
        </p>
        <button
          disabled={pageNum >= totalPages}
          onClick={next}
          className="ml-4 inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
        >
          Next
        </button>
      </div>
      <ToastContainer />
    </div>
  );
}
