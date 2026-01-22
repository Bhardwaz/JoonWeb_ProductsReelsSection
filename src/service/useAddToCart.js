import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

const addToCart = async ({ payload, site }) => {
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

        onMutate: () => {
            const toastId = toast.loading("Adding item to cart...");
            return { toastId };
        },

        onSuccess: (data) => {
            console.log("Item added to cart:", data);

            toast.success("Item Added to Cart Successfully", {
                id: context.toastId,
            });
        },

        onError: (error, variables, context) => {
            console.error("Add to cart failed:", error);
            const message = error.response?.data?.message || "Failed to add to cart";

            toast.error(message, {
                id: context.toastId,
            });
        }
    });
};

export default useAddToCart;