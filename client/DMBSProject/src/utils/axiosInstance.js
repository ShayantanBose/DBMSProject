import axios from "axios";

const api = axios.create({
  baseURL: "example://Url",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
});

export default api;
