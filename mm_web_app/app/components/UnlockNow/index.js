/**
*
* UnlockNow
*
*/

import React from 'react';
// import styled from 'styled-components';


function UnlockNow({ title }) {
  return (
    <div> {title} </div>
  );
}

UnlockNow.propTypes = {
  title: React.PropTypes.string.isRequired,
};

export default UnlockNow;
