import React, { Component } from 'react';
import { Event } from './event.js';
import { CreateEvent } from './createEvent';
import { styles } from './styles.js';
import {
  StyleSheet,
  Text,
  View,
  ListView,
  TouchableHighlight,
  RefreshControl
} from 'react-native';


// Events list is the scene which render a list of nearby events
// all events need to make it into the listview datasrouce if they are to render
export class EventsList extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    
    this.state = {
      refreshing: false,
      dataSource: this.ds.cloneWithRows([]),
      initialPosition: 'unknown',
      lastPosition: 'unknown',
      latitude: '',
      longitude: '',
      dataForMarkers: null,
      current: true
    };
    this._onForward = this._onForward.bind(this);
    this._onRefresh = this._onRefresh.bind(this);
    this.renderSectionHeader = this.renderSectionHeader.bind(this);
    this.getMyEvents = this.getMyEvents.bind(this);
    this.getMyPastEvents = this.getMyPastEvents.bind(this);
    this.getEvents = this.getEvents.bind(this);
    this.setCurrent = this.setCurrent.bind(this);
    this.setPast = this.setPast.bind(this);
  }

  watchID: ?number = null;

  // get current position then get nearby events
  componentDidMount() {
    //get user's geolocation
    navigator.geolocation.getCurrentPosition(
      (position) => {
        //first params on success
        //position is stringified in doc, not sure if we need it
        //var initialPosition = JSON.stringify(position);
        var initialPosition = position;
        this.setState({initialPosition});
      }, 
      //second params on error
      (err) => console.log('There is an error. It\'s a sad day D=', err),
      //optional param
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
    this.watchID = navigator.geolocation.watchPosition(
      (position) => {
        var lastPosition = position;
        this.setState({lastPosition});
        this.setState({latitude: lastPosition.coords.latitude});
        this.setState({longitude: lastPosition.coords.longitude});
        this.getMyEvents();
      }
    );
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }
  
  getMyEvents() {
    this.getEvents('http://localhost:3000/api/myEvents');
  }

  getMyPastEvents() {
    this.getEvents('http://localhost:3000/api/myPastEvents');
  }

  //function to look for near by events, passing in lat and lng
  getEvents(route) {
    fetch(route, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        latitude: this.state.latitude,
        longitude: this.state.longitude,
        username: this.props.username
      })
      })
      .then((res) => res.json())
      .then((resJSON) => {
        console.log(resJSON);
        this.setState({
          dataSource: this.ds.cloneWithRows(resJSON),
          refreshing: false
        })
      }
    );
  }

  setCurrent() {
    this.setState({
      current: true,
      refreshing: true,
    });
    this.getMyEvents();
  }  

  setPast() {
    this.setState({
      current: false,
      refreshing: true,
    });
    this.getMyPastEvents();
  }

  // go to create an event
  _onForward() {
    console.log('user geo', this.state.latitude, this.state.longitude);
    this.props.navigator.push({
      title: 'create event',
      component: CreateEvent,
      //passing user's geolocation to CreateEvent
      passProps: {latitude: this.state.latitude, longitude: this.state.longitude, username: this.props.username}
    });
  }

  // used to control the spinning wheel and send the call to refresh the event
  _onRefresh() {
    this.setState({
      refreshing: true
    });
    this.getMyEvents();
  }

  // If there are events, greet the user
  renderSectionHeader() {
    return (
      <View style={styles.row}>
        <Text style={styles.greeting}>HI {this.props.username.toUpperCase()} !</Text>
      </View>
      );
  }

  render() {
    return (
      <View style={styles.containerRight}>
        <View>
          <TouchableHighlight style={styles.publicButton} underlayColor='white' onPress={this.addFriends}> 
            <Text style={styles.buttonText}>+</Text>
          </TouchableHighlight>
        </View>
        <View style={[styles.buttonContainer]}>
            <TouchableHighlight underlayColor='white' style={this.state.current ? styles.meComingHightlight : styles.meComing} onPress={this.setCurrent}>
              <Text style={styles.buttonText}>Current Events</Text>
            </TouchableHighlight>
            <TouchableHighlight underlayColor='white' style={this.state.current ? styles.meComing : styles.meComingHightlight} onPress={this.setPast}>
              <Text style={styles.buttonText}>Past Events</Text>
            </TouchableHighlight>
        </View>
        <View style={[styles.container, styles.events]}>
          <ListView
            renderSectionHeader={this.renderSectionHeader}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._onRefresh}
              />
            }
            dataSource={this.state.dataSource}
            renderRow={(rowData) => <Event navigator={this.props.navigator} event={rowData} latitude={this.state.latitude} longitude={this.state.longitude}/>}
          />
        </View>
        <TouchableHighlight style={[styles.button, styles.newButton]} underlayColor='white' onPress={this._onForward}> 
          <Text style={styles.buttonText}>Create Event</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

// const styles1 = StyleSheet.create({
//   wrapper: {
//     flex: 1
//   },
//   events: {
//     marginTop: 70,
//     flexDirection: 'row',
//     flex: 1
//   },
//   bottomBar: {
//     backgroundColor: '#cccccc',
//     marginBottom: 0,
//     paddingBottom: 10,
//     paddingTop: 10,
//     flexDirection: 'row'
//   },
//   footer: {
//     fontSize: 20,
//     textAlign: 'center',
//     flex: 1
//   }
// });
