const initialState = false;

export default (modelIsOpen = initialState, action) => {
  switch (action.type) {
    case 'OPEN_MODAL':
      return true;
    case 'CLOSE_MODAL':
      return false;
    default:
      return modelIsOpen;
  }
};
