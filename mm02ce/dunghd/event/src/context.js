import aliases from './aliases';

function onClickHandler(info, tab) {
  console.log("item " + info.menuItemId + " was clicked");
  console.log("info: " + JSON.stringify(info));
  console.log("tab: " + JSON.stringify(tab));
  switch (info.menuItemId) {
    case 'mm-btn-logout':
      aliases.AUTH_LOGOUT();
      break;
    default:
      console.log('No processing for this ctx menu event');
  }
};

chrome.contextMenus.onClicked.addListener(onClickHandler);
