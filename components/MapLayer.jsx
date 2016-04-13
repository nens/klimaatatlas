import 'babel-polyfill';
import Legend from './Legend';
import Map from './Map';
import React, { Component, PropTypes } from 'react';
import {
    Badge,
    Button,
    Row,
    Col,
    Modal,
} from 'react-bootstrap';

import styles from './MapLayer.css';

class MapLayer extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      showModal: false,
    };
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
  }

  close() {
    this.setState({ showModal: false });
  }

  open() {
    this.setState({ showModal: true });
  }

  render() {
    const { data, lat, lng } = this.props;

    let _lat;
    let _lng;
    let _zoom;

    if (lat && lng) {
      _lat = lng;
      _lng = lat;
      _zoom = 17;
    }
    else {
      _lat = data.lat;
      _lng = data.lng;
      _zoom = undefined;
    }

    const isotopeClasses = `${styles.repocontainer} element ${data.roles}`;
    // const repoClasses = `repo ${data.key}`;
    const rolesText = data.roles.replace(/ /g, ', ').replace('-', ' ');
    const badges = data.roles.split(' ').map((role, i) => {
      return <Badge key={i} style={{ marginRight: 2 }}>{role.replace('-', ' ')}</Badge>;
    });
    const imgUrl = data.coverImage;
    const divStyle = {
      backgroundImage: `url('${imgUrl}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundColor: 'rgba(246,246,246,0.75)',
    };

    const bekijkInLizard = (data.lizardUrl) ?
      <p><a href={data.lizardUrl} target="_blank"><Button>Bekijk in Lizard</Button></a></p> : <div/>;

    return (
        <div className={isotopeClasses} key={data.key}>
          <div style={{ cursor: 'pointer' }}>
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
                <p dangerouslySetInnerHTML={{ __html: data.description }} />
                {bekijkInLizard}
                <Row>
                <Col md={10}>
                  <Map
                    lat={_lat}
                    lng={_lng}
                    zoom={_zoom}
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
    );
  }
}

MapLayer.propTypes = {
  data: PropTypes.object,
};

export default MapLayer;
