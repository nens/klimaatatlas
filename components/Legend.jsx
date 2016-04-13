import 'babel-polyfill';
import React, { Component, PropTypes } from 'react';
import {
    Panel,
} from 'react-bootstrap';
import styles from './Legend.css';

class Legend extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {};
  }

  render() {
    const legends = this.props.data.mapLayers.map((layer, i) => {
      if (layer.legend) {
        let list = layer.legend.steps.map((step, j) => {
          return (
            <li key={j} className={styles.legendItem}>
              <svg height="10" width="10">
                <circle cx="5" cy="5" r="5" stroke="none" fill={step.color} />
              </svg>&nbsp;
              {step.label}
            </li>
          );
        });
        return (
          <div key={i} className={styles.legendWrapper}>
            <strong>{layer.name}</strong>
            <ul className={styles.legend}>
              {list}
            </ul>
          </div>
        );
      }
      return false;
    })
    .filter((legend) => { if (legend) { return legend; } return false; });
    return (
      <Panel header={'Legenda'}>
        {legends.length > 0 ? legends : <p>Geen legenda beschikbaar</p>}
      </Panel>
    );
  }
}

Legend.propTypes = {
  data: PropTypes.object,
};

export default Legend;
