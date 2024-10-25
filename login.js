/* eslint-disable */

const baseUrl = 'http://127.0.0.1:3000';
const api = '/api/v1';

const login = async (email, password) => {
  console.log(email, password);

  try {
    const res = await axios(
      {
        method: 'POST',
        url: `${baseUrl}${api}/users/login`,
        data: {
          email,
          password,
        },
      },
      {
        withCredentials: true,
        credentials: 'include',
      },
    );

    if (res.data.status === 'success') {
      alert('Logged in successfully');

      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    console.log(err);
  }
};

document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('Hello from the server');
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  console.log(email, password);
  login(email, password);
});
