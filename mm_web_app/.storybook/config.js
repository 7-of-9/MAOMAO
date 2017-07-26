/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, import/extensions */
import { configure, addDecorator } from '@storybook/react';
import stylesheet from '../styles/index.scss'

addDecorator((story) => (
  <div>
    <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
    <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css' />
    <script src='https://code.jquery.com/jquery-3.2.1.slim.min.js' />
    <script src='https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js' />
    <script src='https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js' />
    {story()}
  </div>
))

function loadStories() {
  require('../stories');
}

configure(loadStories, module);
