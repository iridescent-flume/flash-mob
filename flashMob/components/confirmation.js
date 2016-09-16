import React, { Component } from 'react';
import { styles } from './styles.js';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Modal
} from 'react-native';

export class Confirmation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false
    };

    this._submit = this._submit.bind(this);
    this._return = this._return.bind(this);
  }

  // submit event information to the server
  _submit() {
    this.setState({
      modalVisible: true
    });
    
    // geolocation on location
    // store lat and long for fetch
    fetch('http://localhost:3000/api/events', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: this.props.title,
        category: this.props.category,
        location: this.props.location,
        latitude: this.props.latitude,
        longitude: this.props.longitude,
        date: this.props.date,
        description: this.props.description,
        username: this.props.username,
        private: this.props.private,
        invites: this.props.invites,
        instagramHashtag: this.props.instagramHashtag
      })
    });
  }

  // go back to events page after submitting an event
  _return() {
    this.setState({
      modalVisible: false
    });
    this.props.navigator.popToTop(0);
  }

  // modal acts as confirmation of event submission
  render() {
    return (

      <View style={styles.textInputContainer}>
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.modalVisible}
          >
          <TouchableHighlight style={styles.highlight} onPress={this._return}>
            <View style={styles.modalView}>
              <Text style={styles.confirm}>Thanks, your event has been saved!</Text>
              <Text style={styles.confirm}>Press anywhere to return to events</Text>
            </View>
          </TouchableHighlight>
        </Modal>
        <View style={styles.confirm}>

          <Text style={styles.info}>Your Event Name</Text>
          <Text style={[styles.text, styles.textNoBottom]}>{this.props.title}</Text>
          <Text style={styles.text}>{this.props.private ? "(Private Event)" : "(Public Event)"}</Text>
          <Text style={styles.info}>Event Category</Text>
          <Text style={styles.text}>{this.props.category}</Text>
          <Text style={styles.info}>Event Location</Text>
          <Text style={styles.text}>{this.props.location}</Text>
          <Text style={styles.info}>Event Date</Text>
          <Text style={styles.text}>{this.props.date.toString().substring(0,21)}</Text>

          {this.props.private ? <Text style={styles.info}>Invited Friends</Text> : null}
          {this.props.private ? this.props.invites.map((friend) => <Text style={[styles.text, styles.textNoBottom]}>{friend}</Text>) : null}
          <Text style={styles.info}>Instagram Hashtag</Text>
          <Text style={styles.text}>{this.props.instagramHashtag}</Text>
          <Text style={styles.info}>Event Description</Text>
          <Text style={styles.text}>{this.props.description}</Text>
        </View>
        <Text style={styles.confirm}>Is this information correct?</Text>
        <TouchableHighlight style={[styles.button, styles.newButton]} underlayColor='white' onPress={this._submit}> 
          <Text style={styles.buttonText}>Submit Event</Text>
        </TouchableHighlight>
      </View>
    );
  }
}