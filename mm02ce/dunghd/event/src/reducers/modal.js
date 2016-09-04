const initialState = true;

export default (modalIsOpen = initialState, action) => {
  switch (action.type) {
    case 'OPEN_MODAL':
      return true;
    case 'CLOSE_MODAL':
      return false;
    default:
      return modalIsOpen;
  }
};
