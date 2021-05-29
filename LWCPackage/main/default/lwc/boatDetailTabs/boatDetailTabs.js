import { LightningElement,wire,api } from 'lwc';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import {subscribe,MessageContext,APPLICATION_SCOPE} from 'lightning/messageService';
import {getFieldValue, getRecord} from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';


// Custom Labels Imports
// import labelDetails for Details
// import labelReviews for Reviews
// import labelAddReview for Add_Review
// import labelFullDetails for Full_Details
// import labelPleaseSelectABoat for Please_select_a_boat
// Boat__c Schema Imports
// import BOAT_ID_FIELD for the Boat Id
// import BOAT_NAME_FIELD for the boat Name
import labelDetails from '@salesforce/label/c.Details';
import labelReviews from '@salesforce/label/c.Reviews';
import labelAddReview from '@salesforce/label/c.Add_Review';
import labelFullDetails from '@salesforce/label/c.Full_Details';
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat'


import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';
import TYPE from '@salesforce/schema/Boat__c.BoatType__c';
import LENGTH from '@salesforce/schema/Boat__c.Length__c';
import PRICE from '@salesforce/schema/Boat__c.Price__c';
import DESCRIPTION from '@salesforce/schema/Boat__c.Description__c';
const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];
export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
  boatId;
  @wire(getRecord,{recordId:'$boatId',fields:BOAT_FIELDS})
  wiredRecord;
  label = {
    labelDetails,
    labelReviews,
    labelAddReview,
    labelFullDetails,
    labelPleaseSelectABoat
  };

  price=PRICE;
  length=LENGTH;
  type=TYPE;
  description=DESCRIPTION;

  @wire(MessageContext)
  messageContext;
  // Decide when to show or hide the icon
  // returns 'utility:anchor' or null
  get detailsTabIconName() { 
      return this.wiredRecord.data ? 'utility:anchor' : null;
  }
  
  // Utilize getFieldValue to extract the boat name from the record wire
  get boatName() { 
      return getFieldValue(this.wiredRecord.data,BOAT_NAME_FIELD)
  }
  
  // Private
  subscription = null;
  
  // Subscribe to the message channel
  subscribeMC() {
    // local boatId must receive the recordId from the message
    this.subscription=subscribe(this.messageContext,BOATMC,(message)=>{this.boatId=message.recordId},{scope:APPLICATION_SCOPE});
  }
  
  // Calls subscribeMC()
  connectedCallback() {
      this.subscribeMC();
   }
  
  // Navigates to record page
  navigateToRecordViewPage() {
      this[NavigationMixin.Navigate]({
          type:'standard__recordPage',
          attributes:{
              recordId:this.boatId,
              actionName:'view'
          }
      });
   }
  
  // Navigates back to the review list, and refreshes reviews component
  handleReviewCreated() {
    this.template.querySelector('lightning-tabset').activeTabValue='labelReview';
      this.template.querySelector('c-boat-reviews').refresh();
   }
}
