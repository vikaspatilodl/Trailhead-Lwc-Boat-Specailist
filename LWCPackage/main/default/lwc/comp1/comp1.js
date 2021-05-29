import { LightningElement, wire,api } from 'lwc';
export default class Comp1 extends LightningElement {

    status;
    root;
    comp;
    handleDecode(){
        //console.log(event.detail.Id);
        this.status='status1';
    }

    handleRoot(){
        this.root='shadow root fired in comp1'
    }

    handleComp(){
        this.comp='comp handled';
    }
}