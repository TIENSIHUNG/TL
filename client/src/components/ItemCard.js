import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actionCreators } from '../state/index.js';

const ItemCard = (props) => {
  const { SingleItemPageObj } = bindActionCreators(actionCreators, useDispatch());
  const navigate = useNavigate();

  // Destructure props for easy access
  const { title, type, images, price, stocks, allRatings, ratings, productId } = props;

  // Default values to avoid undefined errors
  const imageUrl = images?.[0] || 'https://via.placeholder.com/150'; // Placeholder image URL

  const handleItemClick = () => {
    navigate(`/singleitempage/${productId}`);
  };

  return (
    <div className="" onClick={handleItemClick}>
      <a className="flex relative h-48 justify-center rounded overflow-hidden">
        <img alt="ecommerce" className="object-contain w-full h-full block" src={imageUrl} />
      </a>
      <div className="mt-4">
        <h3 className="text-gray-900 text-xs tracking-widest title-font mb-1">Type: {type}</h3>
        <h2 className="text-gray-900 title-font text-lg font-medium">{title}</h2>
        <p className="mt-1">{price}.00  VND</p>
        {stocks > 0 ? (
          <p className="mt-1 text-white bg-green-500 w-fit px-2 rounded-lg">In Stock</p>
        ) : (
          <p className="mt-1 text-white bg-red-500 w-fit px-2 rounded-lg">Out of Stock</p>
        )}
      </div>
    </div>
  );
};

export default ItemCard;