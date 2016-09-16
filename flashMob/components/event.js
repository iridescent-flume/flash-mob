import React, { Component } from 'react';
import { styles } from './styles.js';
import { distance } from './util.js';
import { EventPage } from './eventPage.js';
import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  TouchableHighlight,
  Image
} from 'react-native';

export class Event extends Component {
  constructor(props) {
    super(props);
    this.state = {
      descriptionHidden: false,
      isComing: false
    };
    this._showDescription = this._showDescription.bind(this);
    this._toggleDescription = this._toggleDescription.bind(this);
    this._toggleIsComing = this._toggleIsComing.bind(this);
    this._date = new Date(this.props.event.date).toString().slice(4, 15);
    this._time = 'Loading Time';
  }

  // show description when tapped on
  _toggleDescription() {
    this.setState({
      descriptionHidden: !this.state.descriptionHidden
    });
  }

  // light up events you are going to
  _toggleIsComing() {
    this.setState({
      isComing: !this.state.isComing
    });
  }

  _forwardToEventPage() {
    this.props.navigator.push({
      title: 'Event Title',
      component: EventPage,
      passProps: {
        title: this.props.event.title,
        category: this.props.event.category,
        location: this.props.event.location,
        latitude: this.props.event.latitude,
        longitude: this.props.event.longitude,
        date: this._date,
        description: this.props.event.description,
        private: this.props.event.private,
        invites: this.props.event.invites,
        time: this._time
      }
    });
  }

  // append description to event on eventlist
  _showDescription() {
    if (this.state.descriptionHidden) {
      return (
        <View>
        <Text style={styles.eventText}>
          {this.props.event.description}
        </Text>
          <View style={styles.hiddenButtons}>
            <TouchableHighlight style={styles.Coming} underlayColor='white' onPress={this._toggleIsComing}>
              <Text style={styles.meComingText}>i am coming!</Text>
            </TouchableHighlight>
            <TouchableHighlight style={styles.EventInfo} underlayColor='white' onPress={this._forwardToEventPage.bind(this)}>
              <Text style={styles.meComingText}>event info</Text>
            </TouchableHighlight>
          </View>
        </View>
      );
    } else {
      return null;
    }
  }

  render() {
    var minutes = new Date(this.props.event.date).toString().slice(18, 21);
    var hours = new Date(this.props.event.date).toString().slice(16, 18);
    AMPMhours = ((Number(hours) + 11) % 12 + 1);
    var suffix = Number(hours) >= 12 ? ' PM' : ' AM';
    this._time = AMPMhours + minutes + suffix;

    return (
      <TouchableWithoutFeedback style={styles.highlight} onPress={this._toggleDescription}>
        <View style={styles.event}>
          <View style={styles.row}>
          {this.state.isComing ? <Image style={styles.imageIcon} source={require('./img/flash-logo-pink-sm-solid.png')} /> : <Image style={styles.imageIcon} source={require('./img/flash-logo-pink-sm.png')} />}
            <Text style={styles.title}>{'  ' + this.props.event.title}</Text>
            <Text style={styles.category}>{this.props.event.category}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.distAndTime}>{
              Math.floor(distance(this.props.latitude, this.props.longitude, this.props.event.latitude, this.props.event.longitude) * 10) / 10
            } miles away @ {
              (this._time + ', ' + this._date)
            }</Text>
          </View>
          <View style={styles.hidden}>
            {this._showDescription()}
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}