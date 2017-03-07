import axios from 'axios';

function queryString(obj) {
  const str = [];
  Object.keys(obj).forEach((prop) => {
    str.push(`${encodeURIComponent(prop)}=${encodeURIComponent(obj[prop])}`);
  });
  return str.join('&');
}

function createUser(url, user) {
  return new Promise((resolve, reject) => {
    console.log('Register user with data', user);
    return axios({
      method: 'post',
      url,
      data: queryString(user),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }).then(response => resolve(response))
      .catch(error => reject(error));
  });
}

export default createUser;
