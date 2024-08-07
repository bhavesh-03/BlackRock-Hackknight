import React from "react";
import axios from "axios";
import { useAddnuggetsMutation } from "../../features/api/apiSlices/userApiSlice";

const FullWidthBox = ({
  imageSrc,
  title,
  description,
  buttonText,
  buttonLink,
  deductNuggets,
}) => {
  const [addNugget, { isLoading: addnuggetsLoading }] = useAddnuggetsMutation();

  const decreaseNugget = async () => {
    const res = await addNugget({ score: -30 });
    console.log("res : ", res);
  };
  const handleClick = () => {
    if (deductNuggets) {
      decreaseNugget();
    
      window.location.href = buttonLink; // Navigate to game URL without deducting nuggets
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between w-full border p-4 my-2">
      <img
        src={imageSrc}
        alt={title}
        className="max-w-full h-auto object-cover md:max-w-md mr-4" // Adjust max-width and other classes as needed
      />
      <div className="flex-grow">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="mb-4">{description}</p>
        <button
          className={`bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 ${
            !deductNuggets && "cursor-not-allowed"
          }`}
          onClick={handleClick} // Handle button click to navigate to gameLink or deduct nuggets
          disabled={!deductNuggets} // Disable button if nuggets are not deducted
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default FullWidthBox;
