import axios from "axios"
import apiBuilder from "../service/ApiService"

export const groups = async () => {
    const url = apiBuilder.buildUrl('groups')
    const res = await axios.get(url)
    return res.data?.data
}