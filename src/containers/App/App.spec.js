import React        from 'react';
import { expect }   from 'chai';
import { shallow }  from 'enzyme';

import App from './App';
import styles from './styles.module.css';

describe('App', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<App />);
  });

  it('has a router component', () => {
    expect(wrapper.find('Router')).to.have.length(1);
  });
});
