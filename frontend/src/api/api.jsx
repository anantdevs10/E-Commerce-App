import axios from "axios";
//http client used to make requests to APIs

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api/",
});
// creates a custom instance called api so iusntead of writing  axios.get("http://127.0.0.1:8000/api/products/") we can just write api.get("products")

export default api;
//allows api instance be used in other files