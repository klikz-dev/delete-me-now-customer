import axios from "axios";

export const passwordResetRequestService = async (email) => {
  try {
    return await axios.post(`${window.$server_url}/customer/forgot`, {
      email: email,
    });
  } catch (err) {
    return {
      error: true,
      errMsg: err.message,
    };
  }
};

export const passwordResetService = async (id, password) => {
  try {
    return await axios.post(`${window.$server_url}/customer/reset`, {
      id: id,
      password: password,
    });
  } catch (err) {
    return {
      error: true,
      errMsg: err.message,
    };
  }
};
