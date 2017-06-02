import { configure, addDecorator } from '@storybook/react';
import stylesheet from '../styles/index.scss'

addDecorator((story) => (
  <div>
    <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
    {story()}
  </div>
))

function loadStories() {
  require('../stories');
}

configure(loadStories, module);
