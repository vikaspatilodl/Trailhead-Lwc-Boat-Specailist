import { LightningElement,wire,api } from 'lwc';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import {subscribe,MessageContext, APPLICATION_SCOPE} from 'lightning/messageService';
import getSimilarBoats from '@salesforce/apex/BoatDataService.getSimilarBoats';
import {ShowToastEvent} from 'lightning/platformShowToastEvent'; 
import {NavigationMixin} from 'lightning/navigation';

const ERRORTITLE='Error';
const ERRORVARIANT='error';
const ERRORMESSAGE='Error occured';

// imports
// import getSimilarBoats
export default class SimilarBoats extends NavigationMixin(LightningElement) {
    // Private
    currentBoat;
    relatedBoats;
    boatId;
    error;

    @wire(MessageContext)
    messageContext;
    
    // public
    @api
    get recordId() {
        // returns the boatId
        return this.boatId;
      }
      set recordId(value) {
          // sets the boatId value
          // sets the boatId attribute
          this.boatId=value;
          this.setAttribute('boatId',value);
      }
    
    // public
    @api similarBy;
    
    // Wire custom Apex call, using the import named getSimilarBoats
    // Populates the relatedBoats list
    @wire(getSimilarBoats,{boatId:'$boatId',similarBy:'$similarBy'})
    similarBoats({ error, data }) { 
      if(data){
      this.relatedBoats=data;
      console.log(this.relatedBoats);
      }
      else if(error){
        const errorEvent=new ShowToastEvent({
          title:ERRORTITLE,
          mesasge:ERRORMESSAGE,
          variant:ERRORVARIANT
        });
      }
    }
    get getTitle() {
      return 'Similar boats by ' + this.similarBy;
    }
    get noBoats() {
      return !(this.relatedBoats && this.relatedBoats.length > 0);
    }
    
    // Navigate to record page
    openBoatDetailPage(event) {
      this[NavigationMixin.Navigate]({
        type:'standard__recordPage',
        attributes:{
          recordId:event.detail.boatId,
          objectApiName:'Boat__c',
          actionName:'view'
        }
      })
     }
    /*
    connectedCallback(){
      subscribe(this.messageContext,BOATMC,(message)=>this.boatId=message.recordId,{scope:APPLICATION_SCOPE});
    }
    */
  }
  