import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

const addToCart = async ({payload, site}) => {
    const response = await axios.post(`https://${site}/cart.json`, payload, {
        headers: {
            'Content-Type': 'application/json', 
        }
    });
    console.log(response, "responnse received after add to cart")
    return response.data;
};

export const useAddToCart = () => {
    return useMutation({
        mutationFn: addToCart,

        onSuccess: (data) => {
            console.log("Item added to cart:", data);
            console.log("API Successfull --- added successfully");
            toast.success("Item Added to Cart Successfully");
        },

        onError: (error) => {
            console.error("Add to cart failed:", error);
            const message = error.response?.data?.message || "Failed to add to cart";
            toast.error(message);
        }
    });
};

export default useAddToCart;