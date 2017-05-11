export function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}${s4()}`;
}

export function queryString(obj) {
  const str = [];
  Object.keys(obj).forEach((prop) => {
    str.push(`${encodeURIComponent(prop)}=${encodeURIComponent(obj[prop])}`);
  });
  return str.join('&');
}

export function actionCreator(type, payload) {
  return {
    type,
    payload,
  };
}

export function notifyMsg(title, message, imageUrl) {
  let options = {
    title,
    message,
    type: 'basic',
    iconUrl: 'img/ps_sirius_dog_blue.png',
  };
  if (imageUrl) {
    options = Object.assign({}, options, { type: 'image', imageUrl });
  }
  const id = guid();
  chrome.notifications.create(id, options, () => { });
}
