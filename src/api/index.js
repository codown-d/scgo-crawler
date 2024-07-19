//https://csgod.top/api/room/123
import axios from "./config";
import { axiosIns } from "./config";
//https://csgod.top/api/room
const getRomeList = () => {
  return axios.get("/api/room");
};
const getRomeInfo = (rommId) => {
  return axios.get(`/api/room/${rommId}`);
};
const getUserCsgoInfo = (profile_id, season) => {
  return axios.get(`/api/profile/${profile_id}/match?page=1&season=${season}`);
};
const getUserCs2Info = (profile_id, season) => {
  return axios.get(
    `/api/profile/${profile_id}/match?season=100&page=1&season=${season}`
  );
};

const getProfile = (profile_id) => {
  return axios.get(
    `/profile/${profile_id}/__data.json?x-sveltekit-invalidated=001`
  );
};
const getSeason = () => {
  return axiosIns.get(`/api/season`);
};

export {
  getRomeList,
  getRomeInfo,
  getUserCsgoInfo,
  getUserCs2Info,
  getProfile,
  getSeason,
};
