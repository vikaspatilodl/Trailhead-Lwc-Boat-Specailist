// import BOATMC from the message channel
import { LightningElement,api,wire } from 'lwc';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { subscribe,
  unsubscribe,
  MessageContext,
  APPLICATION_SCOPE
} from 'lightning/messageService';
import { getRecord } from 'lightning/uiRecordApi';
const LONGITUDE_FIELD='Boat__c.Geolocation__Longitude__s';
const LATITUDE_FIELD='Boat__c.Geolocation__Latitude__s';
const BOAT_FIELDS=[LONGITUDE_FIELD,LATITUDE_FIELD];

export default class BoatMap extends LightningElement {
  // private
  subscription = null;
  boatId;
  // Getter and Setter to allow for logic to run on recordId change
  // this getter must be public
  @wire(MessageContext)
  messageContext;

  @api get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    this.setAttribute('boatId', value);
    this.boatId = value;
  }

  error = undefined;
  mapMarkers = [];

  // Initialize messageContext for Message Service

  // Getting record's location to construct map markers using recordId
  // Wire the getRecord method using ('$boatId')
  @wire(getRecord,{recordId:'$boatId',fields:BOAT_FIELDS})
  wiredRecord({ error, data }) {
    // Error handling
    if (data) {
      this.error = undefined;
      var longitude = data.fields.Geolocation__Longitude__s.value;
      var latitude = data.fields.Geolocation__Latitude__s.value;
      this.updateMap(longitude, latitude);
    } else if (error) {
      this.error = error;
      this.boatId = undefined;
      this.mapMarkers = [];
    }
  }

  // Subscribes to the message channel
  subscribeMC() {
    // recordId is populated on Record Pages, and this component
    // should not update when this component is on a record page.
    if (this.subscription || this.recordId) {
      return;
    }
    if(!this.subscription){

    this.subscription=subscribe(this.messageContext,BOATMC,(message)=>{this.boatId=message.recordId},
    {scope:APPLICATION_SCOPE}
    );

    }
    // Subscribe to the message channel to retrieve the recordId and explicitly assign it to boatId.
  }

  funcSubscribe(message){
    console.log(message.recordId);
    this.recordId=message.recordId;
  }
  // Calls subscribeMC()
  
  connectedCallback() {
    this.subscribeMC();
  }

  disconnectedCallback() {
    unsubscribe(this.subscription);
    this.subscription=null;
  }
  // Creates the map markers array with the current boat's location for the map.
  updateMap(Longitude, Latitude) {
    this.mapMarkers=[
      {
        location:{
          Latitude:Latitude,
          Longitude:Longitude
        }
      }
    ];
  }

  // Getter method for displaying the map component, or a helper method.
  get showMap() {
    return this.mapMarkers.length > 0;
  }
}