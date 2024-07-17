//https://csgod.top/api/room/123
import axios from "./config";
//https://csgod.top/api/room
const getRomeList = () => {
  return axios.get("/api/room");
};
const getRomeInfo = (rommId) => {
  return axios.get(`/api/room/${rommId}`);
};
const getUserCsgoInfo = (profile_id, season = 10) => {
  return axios.get(`/api/profile/${profile_id}/match?season=${season}&page=1`);
};
const getUserCs2Info = (profile_id) => {
  return axios.get(`/api/profile/${profile_id}/match?season=100&page=1`);
};

//https://csgod.top/profile/1197868644/__data.json?season=10&x-sveltekit-invalidated=001
const getProfile = (profile_id, season = 10) => {
  return axios.get(
    `/profile/${profile_id}/__data.json?season=${season}&x-sveltekit-invalidated=001`
  );
};

export {
  getRomeList,
  getRomeInfo,
  getUserCsgoInfo,
  getUserCs2Info,
  getProfile,
};
