import { LightningElement, wire,api } from 'lwc';

export default class Comp2 extends LightningElement {
    @api status2;

    connectedCallback(){
        const fireEvent=new CustomEvent('decode',{
            bubbles:true,
            composed:false
        });

        this.dispatchEvent(fireEvent);
    }
}