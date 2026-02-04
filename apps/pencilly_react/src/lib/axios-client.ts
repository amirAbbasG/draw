import axios from "axios";
import {envs} from "@/constants/envs";

export const axiosClient = axios.create({
  baseURL: envs.apiUrl,
  withCredentials: true,
});
