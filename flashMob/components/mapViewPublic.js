import React, { Component } from 'react';
import { CreateEvent } from './createEvent.js';
import MapView from 'react-native-maps';
import { styles } from './styles.js';
import { EventPage } from './eventPage.js';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight
} from 'react-native';

export class MapPublic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialPosition: 'unknown',
      lastPosition: 'unknown',
      region: {
        latitude: 38.4429984,
        longitude: -122.6925904,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      },
      markers: []
    }
    this._onForward = this._onForward.bind(this);
    this.onRegionChange = this.onRegionChange.bind(this);
    this.fetchMarkers = this.fetchMarkers.bind(this);
    this._onCalloutPress = this._onCalloutPress.bind(this);
  }

  watchID: ?number = null;

  // use post request for fetching markers so we can send information regarding current map view
  fetchMarkers() {
    fetch('http://localhost:3000/api/eventsMap', {
    //fetch('http://localhost:3000/api/myEvents', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        latitude: this.state.region.latitude,
        longitude: this.state.region.longitude,
        latitudeDelta: this.state.region.latitudeDelta,
        longitudeDelta: this.state.region.longitudeDelta
        })
      })
      .then((res) => res.json())
      .then((resJSON) => {
        console.log(resJSON);
        this.setState({
          markers: resJSON
        })
      }
    );
  }

  fetchMarkersPrivate() {
    fetch('http://localhost:3000/api/myEvents', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        username: this.props.username, //need to pass this in from previous state
        latitude: this.state.region.latitude,
        longitude: this.state.region.longitude,
        latitudeDelta: this.state.region.latitudeDelta,
        longitudeDelta: this.state.region.longitudeDelta
        })
      })
      .then((res) => res.json())
      .then((resJSON) => {
        console.log(resJSON);
        this.setState({
          markers: resJSON
        })
      }
    );
  }


  componentWillMount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  // get current location then fetch markers using that location
  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        var initialPosition = JSON.stringify(position);
        console.log(initialPosition);
        this.setState({initialPosition});
      },
      (error) => alert(error),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
    this.watchID = navigator.geolocation.watchPosition((position) => {
      var lastPosition = JSON.stringify(position);
      var parsedPosition = JSON.parse(lastPosition);
      this.setState({lastPosition});
      this.setState({
        region: {
          latitude: parsedPosition.coords.latitude,
          longitude: parsedPosition.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421
        }
      })
      this.fetchMarkers();
    });
  }

  // set region then fetch markers for new region
  onRegionChange(region) {
    this.setState({region});
    this.fetchMarkers();
  }
  
  // push info to create event scene
  _onForward() {
    this.props.navigator.push({
      component: CreateEvent,
      title: 'Create Event',
      passProps: {latitude: this.state.region.latitude, longitude: this.state.region.longitude}
    });
  }

  _onCalloutPress(marker) {
    this.props.navigator.push({
      title: 'Event: ' + marker.title,
      component: EventPage,
      passProps: {
        title: marker.title,
        category: marker.category,
        location: marker.location,
        latitude: marker.latlng.latitude,
        longitude: marker.latlng.longitude,
        date: (new Date(marker.date).toString().slice(4, 15)),
        description: marker.description,
        private: marker.private,
        invites: marker.invites,
        time: 'Loading Time',
        hashtag: marker.instagramHashtag,
        username: this.props.username,
        refreshCurrent: this.props.refreshCurrent, 
        refreshPast: this.props.refreshPast,
        current: this.props.current 
      }
    });
  }

  // the map render with a button to create events
  render() {
    return (
      <View style={localStyles.map}>
        <MapView
          style={localStyles.mapLayout}
          region={this.state.region}
          showsUserLocation={true}
          onRegionChange={this.onRegionChange}
        >
          {this.state.markers.map(marker => (
            <MapView.Marker
              coordinate={marker.latlng}
              title={marker.title}
              description={marker.description}
              image={require('./img/flash-logo-pink-pin.png')}
              pinColor={'#FF0093'}
              onCalloutPress={()=> this._onCalloutPress(marker)}
            />
          ))}
        </MapView>
        <TouchableHighlight style={[styles.button, styles.newButton, localStyles.button]} underlayColor='white' onPress={this._onForward}> 
          <Text style={styles.buttonText}>Create Event</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  map: {
    position: 'absolute',
    top: 65,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    flex: 1
  },
  mapLayout: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  button: {
    backgroundColor: 'white'
  }
})
