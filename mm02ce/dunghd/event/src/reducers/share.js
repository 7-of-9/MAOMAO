const initialState = false;

export default (modalShareIsOpen = initialState, action) => {
  switch (action.type) {
    case 'OPEN_SHARE_MODAL':
      return true;
    case 'CLOSE_SHARE_MODAL':
      return false;
    default:
      return modalShareIsOpen;
  }
};
