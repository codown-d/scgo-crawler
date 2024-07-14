//https://csgod.top/api/room/123
import axios from "./config";
const getRome = () => {
  return axios.get("/api/room/128");
};

export {
    getRome,  
}