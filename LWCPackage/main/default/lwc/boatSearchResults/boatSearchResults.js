import { LightningElement,wire,api,track } from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import {refreshApex} from '@salesforce/apex';

import {publish,MessageContext}  from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

const col=[{label:'Name',fieldName:'Name',type:'string',editable:true},
{label:'Length',fieldName:'Length__c',type:'string',editable:true},
{label:'Price',fieldName:'Price__c',type:'string',editable:true},
{label:'Description',fieldName:'Description__c',type:'string',editable:true},
              ];

// ...
const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE = 'Error';
const ERROR_VARIANT = 'error';
const CONST_ERROR='Error occured';
export default class BoatSearchResults extends LightningElement {
  selectedBoatId;
  columns = col;
  state;
  
  @api get boatTypeId(){
    return this.state ? this.state : '';
  };

  set boatTypeId(value){
   this.state=value;
  };

  boats;
  isLoading = false;
  
  // wired message context
  @wire(MessageContext)
  messageContext;
  // wired getBoats method 
  @wire(getBoats,{boatTypeId:'$boatTypeId'})
  wiredBoats(result) {
    //this.dispatchEvent(new CustomEvent('loading',{bubbles:true,composed:true}));
      this.boats = result;
        if (result.error) {
            this.error = result.error;
            this.boats = undefined;
        }
        this.isLoading = false;
        this.notifyLoading(this.isLoading);
      //this.dispatchEvent(new CustomEvent('doneloading',{bubbles:true,composed:true}));
   };
  
  // public function that updates the existing boatTypeId property
  // uses notifyLoading
  @api searchBoats(boatTypeId) {
    this.isLoading=true;
    this.notifyLoading(this.isLoading);
    this.boatTypeId=boatTypeId;
    this.isLoading=false;
    this.notifyLoading(this.isLoading);
   }
  
  // this public function must refresh the boats asynchronously
  // uses notifyLoading
   async refresh() {
    this.isLoading=true;
    this.notifyLoading(this.isLoading);
    await refreshApex(this.boats);
    this.isLoading=false;
    this.notifyLoading(this.isLoading);
   }
  
  // this function must update selectedBoatId and call sendMessageService
  updateSelectedTile(event) { 
    this.selectedBoatId=event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
  }
  
  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) { 
    publish(this.messageContext,BOATMC,{recordId:boatId}); 
  }
  
  // The handleSave method must save the changes in the Boat Editor
  // passing the updated fields from draftValues to the 
  // Apex method updateBoatList(Object data).
  // Show a toast message with the title
  // clear lightning-datatable draft values
  handleSave(event) {
    // notify loading
    //event.preventDefault();
    //this.notifyLoading('loading');
    const updatedFields = event.detail.draftValues;
    // Update the records via Apex
    updateBoatList({data: updatedFields})
    .then(() => {
     this.refresh();
     //this.notifyLoading('doneloading');
      const toastEvent=new ShowToastEvent({
        "title":SUCCESS_TITLE,
        "message":MESSAGE_SHIP_IT,
        "variant":SUCCESS_VARIANT
      });

      this.dispatchEvent(toastEvent);
    })
    .catch(error => {
      console.log(error);
      const toastErrorEvent=new ShowToastEvent({
        "title":ERROR_TITLE,
        "message":CONST_ERROR,
        "variant":ERROR_VARIANT
      });

      this.dispatchEvent(toastErrorEvent);
    })
    .finally(() => {
    });
  }
  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) {
    if(isLoading){
      this.dispatchEvent(new CustomEvent('loading'));
    }
    else if(!isLoading){
      this.dispatchEvent(new CustomEvent('doneloading'));
    }
   }
}