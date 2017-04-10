import React from 'react';
import { compose, pure } from 'recompose';
import { Menu, MainButton, ChildButton } from 'react-mfb';
import 'react-mfb/mfb.css';

const effect = 'zoomin';
const pos = 'br';
const method = 'hover';

const FloatingShare = () =>
  <Menu effect={effect} method={method} position={pos}>
    <MainButton iconResting="ion-plus-round" iconActive="ion-close-round" />
    <ChildButton
      icon="ion-social-github"
      label="View on Github"
      href="https://github.com/nobitagit/react-material-floating-button/"
    />
    <ChildButton
      icon="ion-social-octocat"
      label="Follow me on Github"
      href="https://github.com/nobitagit"
    />
    <ChildButton
      icon="ion-social-twitter"
      label="Share on Twitter"
      href="http://twitter.com/share?text=Amazing Google Inbox style material floating menu as a React component!&url=http://nobitagit.github.io/react-material-floating-button/&hashtags=material,menu,reactjs,react,component"
    />
  </Menu>;

const enhance = compose(
  pure,
);

export default enhance(FloatingShare);
