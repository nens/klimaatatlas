import 'babel-polyfill';
import MapLayer from './MapLayer';
import React, { Component, PropTypes } from 'react';

class MapLayers extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {};
  }

  render() {
    const { data, lat, lng } = this.props;

    const mapLayerComponents = data.sort((a, b) => {
      if (a.name < b.name) { return -1; }
      if (a.name > b.name) { return 1; }
      return 0;
    });

    const mapLayerComponentSorted = mapLayerComponents.map((mapLayerComponent, i) => {
      return (
        <MapLayer
          key={i}
          lat={lat}
          lng={lng}
          data={mapLayerComponent} />
      );
    });

    return (
      <div id="content">
        {mapLayerComponentSorted}
      </div>
    );
  }
}

MapLayers.propTypes = {
  data: PropTypes.array,
};

export default MapLayers;
