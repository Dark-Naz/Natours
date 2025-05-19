/* eslint-disable */
// import axios from 'axios';
import { showAlert } from './alerts';

const baseUrl = 'http://127.0.0.1:3000';
const api = '/api/v1';

export const login = async (email, password) => {
  // console.log(email, password);

  try {
    const res = await axios({
      method: 'POST',
      url: `${baseUrl}${api}/users/login`,
      data: {
        email,
        password,
      },
      withCredentials: true,
      // headers: {
      //   'Content-Type': 'application/json',
      // },
    });
    console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully');

      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    // console.error('Error:', err.response.data || err.message);
    // console.log(res.data);
    showAlert('error', err.response.data.message);
  }
};
