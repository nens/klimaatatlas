import 'babel-polyfill';
import React, { Component, PropTypes } from 'react';
import {
    Badge,
    Button,
    Row,
    Col,
    Modal,
} from 'react-bootstrap';

import styles from './Postcode.css';

class Postcode extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      showModal: false,
    };
  }

  render() {
    return (
      <div>Postcode</div>
    );
  }
}

Postcode.propTypes = {
  data: PropTypes.object,
};

export default Postcode;
