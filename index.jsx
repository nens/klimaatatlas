/*jshint esnext: true*/

require("!style!css!./node_modules/leaflet/dist/leaflet.css");
import 'babel-polyfill';
import $ from 'jquery';
import _ from 'underscore';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import fetch from 'isomorphic-fetch';
import { Button, Badge, Grid, Row, Nav, Input, Col, Navbar, NavItem, NavDropdown, Panel, Modal, MenuItem, Tooltip, OverlayTrigger } from 'react-bootstrap';
import Isotope from 'isotope-layout';
import L from 'leaflet';
import styles from './index.css';
var iso, map;

class App extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      maplayers: [],
      showModal: false
    }
    this.close = this.close.bind(this);    
    this.open = this.open.bind(this);    
    this.handleClick = this.handleClick.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
  }

  componentDidMount() {
    fetch('config.json').then(r => r.json())
      .then(data => this.setState({
        'title': data.title,
        'information': data.information,
        'maplayers': data.maps,
        'logo': data.logo,
      }))
      .then(() =>
        iso = new Isotope('#content', {
            layoutMode: 'fitRows'
        })     
      )
      .catch(e => console.log("Loading XHR failed", e))     
  }

  handleClick(e) {
      var filtervalue = e.target.value;
      if(filtervalue) {
        iso.arrange({
          filter: filtervalue
        });          
      } else {
        iso.arrange({
          filter: '*'
        });          
      }
  }

  handleFilter(e) {
    var input = this.refs.filter;
    var filtervalue = this.refs.filter.refs.input.value;
    iso.arrange({
      filter: (f) => {
        var currentTitle = $(f).find('.repo-header h2 a').text();
        if( currentTitle.toLowerCase().indexOf(filtervalue.toLowerCase()) != -1) {
          return true;
        } else {
          return false;
        }
      }
    });
  }

  handleSort(e) {
      var sortValue = $(e.target).val();
      iso.arrange({
          sortBy: sortValue
      });
  }

  close() {
    this.setState({ showModal: false });
  }

  open() {
    this.setState({ showModal: true });
  }  

  render() {
    var self = this;
    const {} = this.props

    var allroles = this.state.maplayers.map(function(layer) { 
      var layers = layer.roles.split(' ');
      return layers.map(function(l) {
        return l;
      })
    });
    var roles = _.unique(_.flatten(allroles));

    let categoryButtons = roles.map((category, i) => {
      var _category = `.${category}`;
      var tooltipText = `Alles van thema '${category.toLowerCase().replace('-', ' ')}' tonen`;
      var button = <OverlayTrigger 
                    key={i} 
                    placement="bottom" 
                    overlay={<Tooltip id='themaTooltip'>{tooltipText}</Tooltip>}>
                  <Button key={i}
                     bsStyle="link" 
                     onClick={self.handleClick} 
                     className={styles.tag}
                     value={_category}>{category.replace('-', ' ')}
                  </Button></OverlayTrigger>;
      return button;
    });

    var imgUrl = this.state.logo;
    var divStyle = {
      backgroundImage: `url('${imgUrl}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      width: '200px',
      height: '100px'
    };
    var title = (this.state.logo) ? <div title={this.state.title} style={divStyle}/> : <h3>{this.state.title}</h3>;


    return (
      <div>
        <Grid className="">
            <Row>
              <Col md={11}>
                {title}
              </Col>
              <Col md={1}>
                <Button onClick={this.open} style={{margin:'15px 0 0 0'}}>Info</Button>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <hr/>
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={6}>
                <p><strong>Thema's</strong></p>
                <p>
                  <Button key={-1}
                     bsStyle="link" 
                     onClick={self.handleClick} 
                     className={styles.tag}
                     value="">Alles
                  </Button>
                  {categoryButtons}
                </p>
              </Col>
              <Col xs={12} md={6}>
                <Input
                   id="filterinput"
                   type="text"
                   placeholder="Typ hier een (deel) van de naam van het thema"
                   label="Filter"
                   hasFeedback
                   groupClassName='group-class'
                   labelClassName='label-class'                     
                   ref="filter" 
                   onChange={this.handleFilter} />
              </Col>                  
            </Row>
          </Grid>
          <Grid>
            <MapLayers data={this.state.maplayers} />
          </Grid>
            <Modal show={this.state.showModal} bsSize="large" onHide={this.close}>

              <Modal.Header closeButton>
                <Modal.Title>Informatie</Modal.Title>
              </Modal.Header>
              
              <Modal.Body>
                <p dangerouslySetInnerHTML={{__html: this.state.information}} />
              </Modal.Body>

              <Modal.Footer>
                <Button onClick={this.close}>Sluiten</Button>
              </Modal.Footer>

            </Modal>              
        </div>
    )
  }
}


class MapLayers extends Component {

  constructor(props, context) {
    super(props, context)
    this.state = {}
  }

  render() {
    const { data } = this.props

    var mapLayerComponents = data.sort((a, b) => {
      if(a.name < b.name) return -1;
      if(a.name > b.name) return 1;
      return 0;
    });

    var mapLayerComponentSorted = mapLayerComponents.map((mapLayerComponent, i) => {
      return (
        <MapLayer
          key={i}
          data={mapLayerComponent} />
      )
    });

    return (
      <div id="content">
        {mapLayerComponentSorted}
      </div>
    )
  }
}


class Map extends Component {

  constructor(props, context) {
    super(props, context)
    this.state = {}
  }

  componentDidMount() {
    var self = this;
    L.Icon.Default.imagePath = '//cdn.leafletjs.com/leaflet-0.7.3/images';
    this.map = self.createMap(ReactDOM.findDOMNode(self));
  }  

  createMap(element) {
    var self = this;

    var topo = L.tileLayer('//{s}.tiles.mapbox.com/v3/nelenschuurmans.iaa98k8k/{z}/{x}/{y}.png', {
      minZoom: 3,
      maxZoom: 20,
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> vrijwilligers',
    });

    var dark = L.tileLayer('//{s}.tiles.mapbox.com/v3/nelenschuurmans.l15h8o1l/{z}/{x}/{y}.png', {
      minZoom: 3,
      maxZoom: 20,
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> vrijwilligers',
    });

    var sat = L.tileLayer('//{s}.tiles.mapbox.com/v3/nelenschuurmans.iaa79205/{z}/{x}/{y}.png', {
      minZoom: 3,
      maxZoom: 20,
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> vrijwilligers',
    });

    var _activeBaseLayer = topo;
    if(this.props.activeBaselayer === 'sat') {
      _activeBaseLayer = sat;
    } else if(this.props.activeBaselayer === 'dark') {
      _activeBaseLayer = dark;
    }

    let baseMaps = {
      "Topografisch": topo,
      "Contrast": dark,
      "Satelliet": sat,
    };

    let overlayMaps = {};

    map = L.map(element,{
      center: [this.props.lat, this.props.lng], // Focus on Amsterdam Centrum
      zoom: this.props.zoomLevel, 
      layers: [_activeBaseLayer],
      minZoom: 13,
      maxZoom: 20,
      zoomControl: true,
    });

    map.setMaxBounds(map.getBounds());
        
    var scale = L.control.scale().addTo(map);
    var layerControls = new L.control.layers(baseMaps, overlayMaps).addTo(map);    

    if(this.props.mapLayers) {
      this.props.mapLayers.forEach((layer) => {
        if(layer.type === 'wms') {
          var l = L.tileLayer.wms(layer.url, {
            layers: layer.layerName,
            STYLES: layer.styles,
            HEIGHT: layer.height,
            WIDTH: layer.width,
            ZINDEX: layer.zindex,
            SRS: layer.srs,
            format: layer.format,
            transparent: layer.transparent,
            attribution: layer.attribution
          });
          if(layer.active) l.addTo(map);
          layerControls.addOverlay(l, layer.name);
        }
        if(layer.type === 'tms') {
          var tl = L.tileLayer(layer.url, {
            attribution: layer.attribution
          });
          if(layer.active) tl.addTo(map);
          layerControls.addOverlay(tl, layer.name);
        }
      });
    }    
    
    return map;
  }    

  render() {
    const {data} = this.props

    return (
      <div className={styles.map} ref='map'></div>
    )
  }
}


class Legend extends Component {

  constructor(props, context) {
    super(props, context)
    this.state = {}
  }

  render() {
    var legends = this.props.data.mapLayers.map(function(layer,i ) {
      if(layer.legend) {
        var list = layer.legend.steps.map(function(step, j) {
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
    });

    var legends = legends.filter(function(legend){ if(legend) return legend;});
    return (
      <Panel header={'Legenda'}>
        {legends.length > 0 ? legends : <p>Geen legenda beschikbaar</p>}
      </Panel>
    )
  }
}


class MapLayer extends Component {

  constructor(props, context) {
    super(props, context)
    this.state = {
      showModal: false
    }
    this.close = this.close.bind(this);    
    this.open = this.open.bind(this);
  }


  close() {
    this.setState({ showModal: false });
  }

  open() {
    var self = this;
    this.setState({ showModal: true });
  }

  render() {
    const {data} = this.props

    var isotopeClasses = styles.repocontainer + ' element ' + data.roles;
    var repoClasses = 'repo ' + data.key;
    var rolesText = data.roles.replace(/ /g, ', ').replace('-', ' ');
    var badges = data.roles.split(' ').map((role, i) => {
      return <Badge key={i} style={{marginRight:2}}>{role.replace('-', ' ')}</Badge>
    });
    var imgUrl = data.coverImage;
    var divStyle = {
      backgroundImage: 'url(' + imgUrl + ')',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundColor: 'rgba(246,246,246,0.75)',
    };

    var bekijkInLizard = (data.lizardUrl) ? <p><a href={data.lizardUrl} target="_blank"><Button>Bekijk in Lizard</Button></a></p> : <div/>;

    return (
        <div className={isotopeClasses} key={data.key}>
          <div style={{cursor:'pointer'}}>
            <div className="repo" onClick={this.open}>
              <div className="repo-header">
                <h2 className={styles.title}>
                  <a className={styles.repolink}>{data.name}</a>
                </h2>
                <h3 className={styles.reporoles}>{rolesText}</h3>
              </div>
              <div className={styles.picture} style={divStyle}></div>
            </div>

            <Modal show={this.state.showModal} bsSize="large" onHide={this.close}>

              <Modal.Header closeButton>
                <Modal.Title>{data.name} {badges}</Modal.Title>
              </Modal.Header>
              
              <Modal.Body>
                <p dangerouslySetInnerHTML={{__html: data.description}} />
                {bekijkInLizard}
                <Row>
                <Col md={10}>
                  <Map 
                    lat={data.lat}
                    lng={data.lng}
                    activeBaselayer={data.activeBaselayer}
                    zoomLevel={data.zoomLevel}
                    mapLayers={data.mapLayers} />
                </Col>
                <Col md={2}>
                  <Legend data={data} />
                </Col>
                </Row>
              </Modal.Body>

              <Modal.Footer>
                <Button onClick={this.close}>Sluiten</Button>
              </Modal.Footer>

            </Modal>                  
          </div>                
        </div>
    )

  }
}


function render() {
  	ReactDOM.render(
  		<App />, document.getElementById('root')
	);
}

render();
