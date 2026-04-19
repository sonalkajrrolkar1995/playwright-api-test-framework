require('dotenv').config();

const environments = {
  reqres: {
    baseURL: 'https://reqres.in',
    headers: {
      'x-api-key': process.env.REQRES_API_KEY || '',
    },
  },
  booker: {
    baseURL: 'https://restful-booker.herokuapp.com',
    credentials: {
      username: 'admin',
      password: 'password123',
    },
  },
};

module.exports = environments;
