import store from '../../components/vbform/vbsharedstate.js';
import vbconfig from './vbconfig.js';

export default {
  today: null,
  store: store,
  vbconfig: vbconfig,
  checkpayload: function(payload) {
    for( const vb in payload.vbs ) {
        this.checkvb(payload.vbs[vb]);
    }  
  },
  checkvb: function(vb) {
      if( vb.data?.id === undefined || vb.data.id === null || vb.data.id < 1 ) {
          return;
      }
      this.checkRemoveable(vb);
      this.checkDeleteable(vb);
      this.checkEndable(vb);
      this.checkDisabled(vb);
      if( vb?.gbs !== undefined ) {
        for( const gb of vb.gbs ) {
            this.checkRemoveable(gb);
            this.checkDeleteable(gb);
            this.checkEndable(gb);
            this.checkDisabled(gb);
        }
      }
      console.log(JSON.stringify(vb));
  },
  checkDisabled: function(bt) {
      if( bt.data.gueltigkeit.guioptions?.endable !== undefined 
              && bt.data.gueltigkeit.guioptions.endable === true ) {          
          if( !(this.store.mode === 'aenderung' 
                  && this.isFuture(bt.data.gueltigkeit)) ) {
            bt.guioptions.disabled = this.vbconfig.getFieldsForBt(bt.type);
            bt.data.gueltigkeit.guioptions.disabled = [
              'gueltig_ab'
            ]; 
          }
      }
  },
  checkEndable: function(bt) {
    var endable = this.isEndable(bt);
    if( bt.data.gueltigkeit.guioptions?.endable === undefined
            || bt.data.gueltigkeit.guioptions.endable !== endable ) {
        bt.data.gueltigkeit.guioptions.endable = endable;
        bt.data.gueltigkeit.guioptions.sharedstatemode = 'ignore';
    }
  },
  checkRemoveable: function(bt) {
    if( bt.guioptions?.removeable !== undefined 
            && bt.guioptions.removeable === true ) {
        bt.guioptions.removeable = false;
    }
  },
  checkDeleteable: function(bt) {
    var deleteable = this.isDeleteable(bt);
    if( bt.guioptions?.deleteable === undefined 
            || bt.guioptions.deleteable !== deleteable ) {
        bt.guioptions.deleteable = deleteable;
    }
  },
  getToday: function() {
    if( this.today === null ) {
      this.today = new Date();
      this.today.setHours(23, 59, 59, 999);
    }
    return this.today;
  },
  isFuture: function(gueltigkeit) {
    var gueltig_ab = (gueltigkeit.data?.gueltig_ab !== undefined) 
                  ? gueltigkeit.data.gueltig_ab 
                  : null;
    var von = new Date(gueltig_ab);
    von.setHours(0, 0, 0, 0);
    if( von > this.getToday() ) {
      return true;
    }
    return false;
  },  
  isDeleteable: function(bt) {    
    if( this.store.mode === 'korrektur' ) {
        return true;
    }
    if ( this.store.mode === 'aenderung' ) {
      if( bt.data.gueltigkeit.data.gueltig_ab === '' ) {
        return false;  
      }
      if( this.isFuture(bt.data.gueltigkeit) ) {
        return true;
      }
    }
    return false;
  },
  isEndable: function(bt) {
    if ( this.store.mode === 'aenderung' ) {
      if( bt.data.gueltigkeit.data.gueltig_ab === '' ) {
        return false;
      }
      return true;
    }
    return false;
  }
}