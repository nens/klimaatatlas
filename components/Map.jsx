require('!style!css!../node_modules/leaflet/dist/leaflet.css');
import 'babel-polyfill';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import L from 'leaflet';
import styles from './Map.css';
let map;

class Map extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {};
  }

  componentDidMount() {
    const self = this;
    L.Icon.Default.imagePath = '//cdn.leafletjs.com/leaflet-0.7.3/images';
    this.map = self.createMap(ReactDOM.findDOMNode(self));
  }

  createMap(element) {
    const topo = L.tileLayer('//{s}.tiles.mapbox.com/v3/nelenschuurmans.iaa98k8k/{z}/{x}/{y}.png', {
      minZoom: 3,
      maxZoom: 20,
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> vrijwilligers',
    });

    const dark = L.tileLayer('//{s}.tiles.mapbox.com/v3/nelenschuurmans.l15h8o1l/{z}/{x}/{y}.png', {
      minZoom: 3,
      maxZoom: 20,
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> vrijwilligers',
    });

    const sat = L.tileLayer('//{s}.tiles.mapbox.com/v3/nelenschuurmans.iaa79205/{z}/{x}/{y}.png', {
      minZoom: 3,
      maxZoom: 20,
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> vrijwilligers',
    });

    let _activeBaseLayer = topo;
    if (this.props.activeBaselayer === 'sat') {
      _activeBaseLayer = sat;
    }
    else if (this.props.activeBaselayer === 'dark') {
      _activeBaseLayer = dark;
    }

    const baseMaps = {
      'Topografisch': topo,
      'Contrast': dark,
      'Satelliet': sat,
    };

    const overlayMaps = {};

    map = L.map(element, {
      center: [this.props.lat, this.props.lng], // Focus on Amsterdam Centrum
      zoom: (this.props.zoom ? this.props.zoom : this.props.zoomLevel),
      layers: [_activeBaseLayer],
      minZoom: 13,
      maxZoom: 20,
      zoomControl: true,
    });

    if (this.props.zoomLevel) {
      map.setMaxBounds(map.getBounds());
    }

    L.control.scale().addTo(map);
    const layerControls = L.control.layers(baseMaps, overlayMaps).addTo(map);

    if (this.props.mapLayers) {
      this.props.mapLayers.forEach((layer) => {
        if (layer.type === 'wms') {
          const l = L.tileLayer.wms(layer.url, {
            layers: layer.layerName,
            STYLES: layer.styles,
            HEIGHT: layer.height,
            WIDTH: layer.width,
            ZINDEX: layer.zindex,
            SRS: layer.srs,
            format: layer.format,
            transparent: layer.transparent,
            attribution: layer.attribution,
          });
          if (layer.active) { l.addTo(map); }
          layerControls.addOverlay(l, layer.name);
        }
        if (layer.type === 'tms') {
          const tl = L.tileLayer(layer.url, {
            attribution: layer.attribution,
          });
          if (layer.active) { tl.addTo(map); }
          layerControls.addOverlay(tl, layer.name);
        }
      });
    }
    // const labels = L.tileLayer('//{s}.tiles.mapbox.com/v3/nelenschuurmans.tm2-basemap/{z}/{x}/{y}.png', {
    //   minZoom: 3,
    //   maxZoom: 20,
    //   zIndex: 999999999999999,
    //   attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> vrijwilligers',
    // }).addTo(map).bringToFront();

    return map;
  }

  render() {
    return (
      <div className={styles.map} ref='map'></div>
    );
  }
}

Map.propTypes = {
  activeBaselayer: PropTypes.string,
  lat: PropTypes.any.isRequired,
  lng: PropTypes.any.isRequired,
  mapLayers: PropTypes.array,
  zoomLevel: PropTypes.number,
};

export default Map;
