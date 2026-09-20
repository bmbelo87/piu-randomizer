import axios from "axios";

import { API_URL, STATIC_MODE } from "./config";
import { staticAdapter } from "../static/staticAdapter";

export const api = axios.create({
    baseURL: API_URL,
    ...(STATIC_MODE ? { adapter: staticAdapter } : {})
});
