import uuid from './uuid.js';
import store from '../../components/vbform/vbsharedstate.js';

export default {
  store: store,
  vbout: {},
  vb2gui: function(vb, mode, child) {
      this.vbout = {
          type: '',
          guioptions: {
              id: uuid.get_uuid(),
              infos: [],
              errors: []
          },
          data: {
              
          },
          gbs: []
      };
      switch(vb.vertragsbestandteiltyp_kurzbz) {
          case 'freitext':
              this.freitext2gui(vb, mode);
              break;
          case 'funktion':
              this.funktion2gui(vb, mode);
              break;
          case 'kuendigungsfrist':
              this.kuendigungsfrist2gui(vb, mode);
              break;
          case 'stunden':
              this.stunden2gui(vb, mode);
              break;
          case 'urlaubsanspruch':
              this.urlaubsanspruch2gui(vb, mode);
              break;
          case 'zeitaufzeichnung':
              this.zeitaufzeichnung2gui(vb, mode);
              break;
          default:
              console.log('unknown Vertragsbestandteil ' 
                      + vb.vertragsbestandteiltyp_kurzbz);
              break;
      }
      for( const gb of vb.gehaltsbestandteile ) {
          this.vbout.gbs.push(this.gehaltsbestandteil2gui(gb, mode));
      }
      if( child?.guioptions?.childdefaults?.guioptions?.canhavegehaltsbestandteile !== undefined ) {
        this.vbout.guioptions.canhavegehaltsbestandteile = child.guioptions.childdefaults.guioptions.canhavegehaltsbestandteile;
      }
      return this.vbout;
  },
  gueltigkeit2gui: function(bt, mode) {
      var gueltigkeit = {
          guioptions: {
              sharedstatemode: 'ignore',
              disabled: [
                  'gueltig_ab'
              ]
          },
          data: {
              gueltig_ab: bt.von,
              gueltig_bis: bt.bis
          }
      };
      return gueltigkeit;
  },
  freitext2gui: function(vb, mode) {
      this.vbout.type = 'vertragsbestandteilfreitext';
      this.vbout.data = {
          id: vb.vertragsbestandteil_id,
          freitexttyp: vb.freitexttyp_kurzbz,
          titel: vb.titel,
          freitext: vb.freitext,
          gueltigkeit: this.gueltigkeit2gui(vb, mode)
      };
      this.vbout.guioptions.disabled = [
          'freitexttyp',
          'titel',
          'freitext'
      ];
  },
  funktion2gui: function(vb, mode) {
      this.vbout.type = 'vertragsbestandteilfunktion';
      this.vbout.data = {
          id: vb.vertragsbestandteil_id,
          funktion: vb.benutzerfunktiondata.funktion_kurzbz,
          orget: vb.benutzerfunktiondata.oe_kurzbz,
          benutzerfunktionid: vb.benutzerfunktion_id,
          mitarbeiter_uid: this.store.mitarbeiter_uid,
          mode: 'bestehende',
          gueltigkeit: this.gueltigkeit2gui(vb, mode)
      };
      this.vbout.guioptions.disabled = [
          'funktion',
          'orget',
          'benutzerfunktionid',
          'mode'
      ];
  },
  kuendigungsfrist2gui: function(vb, mode) {
      this.vbout.type = 'vertragsbestandteilkuendigungsfrist';
      this.vbout.data = {
          id: vb.vertragsbestandteil_id,
          arbeitgeber_frist: vb.arbeitgeber_frist,
          arbeitnehmer_frist: vb.arbeitnehmer_frist,
          gueltigkeit: this.gueltigkeit2gui(vb, mode)
      };
      this.vbout.guioptions.disabled = [
          'arbeitgeber_frist',
          'arbeitnehmer_frist'
      ];
  },
  stunden2gui: function(vb, mode) {
      this.vbout.type = 'vertragsbestandteilstunden';
      this.vbout.data = {
          id: vb.vertragsbestandteil_id,
          stunden: vb.wochenstunden,
          teilzeittyp: vb.teilzeittyp_kurzbz,
          gueltigkeit: this.gueltigkeit2gui(vb, mode)
      };
      this.vbout.guioptions.disabled = [
          'stunden',
          'teilzeittyp'
      ];
  },
  urlaubsanspruch2gui: function(vb, mode) {
      this.vbout.type = 'vertragsbestandteilurlaubsanspruch';
      this.vbout.data = {
          id: vb.vertragsbestandteil_id,
          tage: vb.tage,
          gueltigkeit: this.gueltigkeit2gui(vb, mode)
      };
      this.vbout.guioptions.disabled = [
          'stunden',
          'teilzeittyp'
      ];
  },
  zeitaufzeichnung2gui: function(vb, mode) {
      this.vbout.type = 'vertragsbestandteilzeitaufzeichnung';
      this.vbout.data = {
          id: vb.vertragsbestandteil_id,
          zeitaufzeichnung: vb.zeitaufzeichnung,
          azgrelevant: vb.azgrelevant,
          homeoffice: vb.homeoffice,
          gueltigkeit: this.gueltigkeit2gui(vb, mode)
      };
      this.vbout.guioptions.disabled = [
          'zeitaufzeichnung',
          'azgrelevant',
          'homeoffice'
      ];
  },
  gehaltsbestandteil2gui: function(gb, mode) {
      var gb = {
          type: 'gehaltsbestandteil',
          guioptions: {
              id: uuid.get_uuid(),
              infos: [],
              errors: [],
              disabled: [
                  'gehaltstyp',
                  'anmerkung',
                  'betrag',
                  'valorisierung'
              ]
          },
          data: {
              id: gb.gehaltsbestandteil_id,
              gehaltstyp: gb.gehaltstyp_kurzbz,
              anmerkung: gb.anmerkung,
              betrag: gb.grundbetrag,
              valorisierung: gb.valorisierung,
              gueltigkeit: this.gueltigkeit2gui(gb, mode)
          }
      };
      return gb;
  }
}