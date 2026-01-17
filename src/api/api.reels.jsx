import axios from "axios";
import apiBuilder from "../service/ApiService";

export const fetchReelItemsAndProducts = async () => {
    const url = apiBuilder.buildUrl('widgets')
    const res = await axios.get(url)
    return res.data?.data
}