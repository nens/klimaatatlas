require('!style!css!./node_modules/leaflet/dist/leaflet.css');
import 'babel-polyfill';
import $ from 'jquery';
import _ from 'underscore';
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import MapLayers from './components/MapLayers';
import fetch from 'isomorphic-fetch';
import {
    Button,
    Grid,
    Row,
    Input,
    Col,
    Modal,
    Tooltip,
    OverlayTrigger,
} from 'react-bootstrap';
import Isotope from 'isotope-layout';
import styles from './index.css';
const postcodeRegex = /^[1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2}$/i;
let iso;

class App extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      filtervalue: '',
      showModal: false,
      postcode: (localStorage.getItem('postcode') ? localStorage.getItem('postcode') : ''),
      housenumber: (localStorage.getItem('housenumber') ? localStorage.getItem('housenumber') : ''),
      lat: (localStorage.getItem('lat') ? localStorage.getItem('lat') : ''),
      lng: (localStorage.getItem('lng') ? localStorage.getItem('lng') : ''),
    };
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
    this.handlePostcodeChange = this.handlePostcodeChange.bind(this);
    this.handleHousenumberChange = this.handleHousenumberChange.bind(this);
    this.checkAndSetLocation = this.checkAndSetLocation.bind(this);
    this.clearPostcode = this.clearPostcode.bind(this);
    this.clearHousenumber = this.clearHousenumber.bind(this);
  }

  componentDidMount() {
    iso = new Isotope('#content', {
      layoutMode: 'fitRows',
    });
  }

  handleClick(e) {
    const filtervalue = e.target.value;
    this.setState({ filtervalue });
    if (filtervalue) {
      iso.arrange({
        filter: filtervalue,
      });
    }
    else {
      iso.arrange({
        filter: '*',
      });
    }
  }

  handlePostcodeChange(event) {
    const postcode = event.target.value;

    if (postcode) {
      this.setState({ postcode });
      localStorage.setItem('postcode', postcode);
    }
    else {
      localStorage.removeItem('postcode');
      this.setState({ postcode: '', lat: '', lng: '' });
    }
    this.checkAndSetLocation();
  }

  handleHousenumberChange(event) {
    const housenumber = event.target.value;
    if (housenumber) {
      this.setState({ housenumber });
      localStorage.setItem('housenumber', housenumber);
    }
    else {
      localStorage.removeItem('housenumber');
      this.setState({ housenumber: '', lat: '', lng: '' });
    }
    this.checkAndSetLocation();
  }

  checkAndSetLocation() {
    if (postcodeRegex.test(this.state.postcode) && this.state.housenumber) {
      fetch(`https://postcoder.sandbox.lizard.net/api/v1/geocode?postcode=${this.state.postcode}&housenumber=${this.state.housenumber}`)
        .then(r => r.json())
        .then(data => {
          if (data.lat && data.lng) {
            this.setState({ lat: data.lat, lng: data.lng });
            localStorage.setItem('lat', data.lat);
            localStorage.setItem('lng', data.lng);
          }
          else {
            this.setState({ lat: '', lng: '' });
            localStorage.removeItem('lat');
            localStorage.removeItem('lng');
          }
        })
        .catch(e => console.log('Loading XHR failed', e));
    }
  }

  handleFilter(e) {
    const filtervalue = e.target.value;
    this.setState({ filtervalue: '' });
    iso.arrange({
      filter: (f) => {
        const currentTitle = $(f).find('.repo-header h2 a').text();
        if (currentTitle.toLowerCase().indexOf(filtervalue.toLowerCase()) !== -1) {
          return true;
        }
        return false;
      },
    });
  }

  clearPostcode() {
    localStorage.removeItem('lat');
    localStorage.removeItem('lng');
    localStorage.removeItem('postcode');
    this.setState({ postcode: '', lat: '', lng: '' });
  }

  clearHousenumber() {
    localStorage.removeItem('lat');
    localStorage.removeItem('lng');
    localStorage.removeItem('housenumber');
    this.setState({ housenumber: '', lat: '', lng: '' });
  }

  handleSort(e) {
    const sortValue = $(e.target).val();
    iso.arrange({
      sortBy: sortValue,
    });
  }

  close() {
    this.setState({ showModal: false });
  }

  open() {
    this.setState({ showModal: true });
  }

  render() {
    const self = this;
    const title = this.props.data.title;
    const information = this.props.data.information;
    const maplayers = this.props.data.maps;
    const roles = _.unique(_.flatten(this.props.data.maps.map((_map) => {
      const _roles = _map.roles.split(' ');
      return _roles.map((l) => {
        return l;
      });
    }))).sort(); // returns alphabetical list of single occurrences of every role in the data
    const logo = this.props.data.logo;

    let categoryButtons = roles.map((category, i) => {
      const _category = `.${category}`;
      const tooltipText = `Alles van thema '${category.toLowerCase().replace('-', ' ')}' tonen`;
      const style = { textDecoration: (this.state.filtervalue === _category) ? 'underline' : 'none' };
      const button = <OverlayTrigger
                        key={i}
                        placement="bottom"
                        overlay={<Tooltip id='themaTooltip'>{tooltipText}</Tooltip>}>
                          <Button key={i}
                             style={style}
                             bsStyle="link"
                             onClick={self.handleClick}
                             className={styles.tag}
                             value={_category}>{category.replace('-', ' ')}
                          </Button>
                    </OverlayTrigger>;
      return button;
    });
    const imgUrl = logo;
    const divStyle = {
      backgroundImage: `url('${imgUrl}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      width: '200px',
      height: '100px',
    };
    const titleDiv = (logo) ? <div title={title} style={divStyle}/> : <h3>{title}</h3>;
    const allesStyle = { textDecoration: (this.state.filtervalue === '') ? 'underline' : 'none' };
    const postcodeLabel = (this.state.postcode) ?
      <span>
        Postcode <a style={{ textDecoration: 'none', cursor: 'pointer' }}
                    onClick={this.clearPostcode}>
                    <i className='fa fa-remove'></i>
                 </a>
      </span> : 'Postcode';
    const housenumberLabel = (this.state.housenumber) ?
      <span>
        Huisnummer <a style={{ textDecoration: 'none', cursor: 'pointer' }}
                      onClick={this.clearHousenumber}>
                      <i className='fa fa-remove'></i>
                   </a>
      </span> : 'Huisnummer';

    return (
      <div>
        <Grid className="">
            <Row>
              <Col md={11}>
                {titleDiv}
              </Col>
              <Col md={1}>
                <Button onClick={this.open} style={{ margin: '15px 0 0 0' }}>Info</Button>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <hr/>
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={8}>
                <p><strong>Thema</strong></p>
                <p>
                  <Button key={-1}
                     style={allesStyle}
                     bsStyle="link"
                     onClick={self.handleClick}
                     className={styles.tag}
                     value="">Alles
                  </Button>
                  {categoryButtons}
                </p>
              </Col>
              <Col xs={12} md={4} />
              <Col xs={12} md={4}>
                  <Row>
                    <Col xs={6}>
                      <Input
                        type="text"
                        label={postcodeLabel}
                        hasFeedback
                        value={this.state.postcode}
                        onChange={this.handlePostcodeChange}
                        groupClassName='group-class'
                        labelClassName='label-class'
                        className="form-control" />
                    </Col>
                    <Col xs={6}>
                      <Input
                        type="text"
                        label={housenumberLabel}
                        hasFeedback
                        value={this.state.housenumber}
                        onChange={this.handleHousenumberChange}
                        groupClassName='group-class'
                        labelClassName='label-class'
                        className="form-control" />
                    </Col>
                  </Row>
              </Col>
            </Row>
          </Grid>
          <Grid>
            <MapLayers
              lat={this.state.lat}
              lng={this.state.lng}
              data={maplayers} />
          </Grid>
            <Modal show={this.state.showModal} bsSize="large" onHide={this.close}>
              <Modal.Header closeButton>
                <Modal.Title>Informatie</Modal.Title>
              </Modal.Header>

              <Modal.Body>
                <p dangerouslySetInnerHTML={{ __html: information }} />
              </Modal.Body>

              <Modal.Footer>
                <Button onClick={this.close}>Sluiten</Button>
              </Modal.Footer>
            </Modal>
        </div>
    );
  }
}

App.propTypes = {
  data: PropTypes.object,
};

function render(data) {
  ReactDOM.render(
    <App data={data} />, document.getElementById('root')
	);
}

fetch('config.json').then(r => r.json())
  .then(data => render(data))
  .catch(e => console.log('Loading XHR failed', e));
