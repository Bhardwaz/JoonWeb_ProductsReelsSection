import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const incrementAtcCounter = async (id) => {
    let url = "https://shoppable-reels.manage.jooncorporation.com"
    // if(import.meta.env.VITE_NODE_ENV === 'development'){
    //     url = import.meta.env.VITE_LOCAL_API_URL
    // }

    const response = await axios.post(`${url}/api/v1/media/atc/${id}`);
    return response.data;
};

export const useAtcAnalytics = () => {
    return useMutation({
        mutationFn: incrementAtcCounter,

        onSuccess: (data) => {
            if (import.meta.env.VITE_NODE_ENV === 'development') {
                console.log("Analytics: ATC count incremented", data);
            }
        },

        onError: (error) => {
            console.warn("Analytics Error: Failed to track ATC click", error.message);
        }
    });
};

export default useAtcAnalytics;