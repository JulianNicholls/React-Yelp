import React        from 'react';
import { expect }   from 'chai';
import { shallow }  from 'enzyme';

import App from './App';
import styles from './styles.module.css';

describe('App', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<App />)
  });

  it('has a single container element', () => {
    expect(wrapper.find(`.${styles.wrapper}`)).to.have.length(1);
  });
});
