import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { useState } from "react";

const addToCart = async ({ payload, site }) => {
    const response = await axios.post(location.origin + `/cart.json`, payload, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
    console.log(response, "responnse received after add to cart")
    return response.data;
};

export const useAddToCart = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addToCart,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        }
    });
};

export default useAddToCart;