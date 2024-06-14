import React, { useEffect } from 'react';

export default function SmallCartPreview({ data, orderQuantities, setTotalAmount }) {
  // Calculate the total amount (previously called subtotal)
  const totalAmount = data.reduce((total, item) => {
    const quantity = orderQuantities[item._id] || 0;
    return total + item.price * quantity;
  }, 0);

  // Pass the totalAmount back to the parent component
  useEffect(() => {
    setTotalAmount(totalAmount);
  }, [totalAmount, setTotalAmount]);

  return (
    <div>
      <h2 className='font-bold text-center text-lg lg:text-2xl mt-3 mb-8'>Your Order's Preview:</h2>
      {data && data.length > 0 ? (
        data.map((item, index) => (
          <div key={index} className='my-3'>
            <section className="text-gray-600 w-full my-3 flex body-font overflow-hidden mx-auto">
              <div className='w-2/12 mr-3 grid place-items-center'>
                <img alt="ecommerce" className="items-center w-fit object-cover object-center rounded" src={item.images[0]} />
              </div>
              <div className="w-10/12 flex-col flex">
                <h1 className="w-fit text-gray-900 text-sm lg:text-lg title-font font-medium">{item.title}</h1>
                <div className="flex">
                  <p className='font-sans'>Qty: {orderQuantities[item._id]}</p>
                </div>
                <div className="flex">
                  <span className="title-font font-medium text-sm lg:text-lg text-gray-900">{item.price * (orderQuantities[item._id] || 0)} VND</span>
                </div>
              </div>
            </section>
            <hr className='border-gray-500' />
          </div>
        ))
      ) : (
        <p className='text-center'>Your cart is empty</p>
      )}
      <h2 className='font-semibold text-base lg:text-xl ml-3 my-2'>Your Total Amount: {totalAmount} VND</h2>
    </div>
  );
}
