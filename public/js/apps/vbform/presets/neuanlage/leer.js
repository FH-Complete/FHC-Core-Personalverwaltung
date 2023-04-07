import uuid from '../../../../helpers/vbform/uuid.js';

export default {
  type: 'preset',
  guioptions: {
    id: 'leer',
    label: 'Leer',
    description: 'Leere Vorlage. Alles muss manuell definiert werden.'
  },
  children: [
    {
      type: 'dv',
      guioptions: {
      },
      children: []
    },
    {
      type: 'vertragsbestandteillist',
      guioptions: {
        title: 'Arbeitszeit',
        vertragsbestandteiltyp: 'vertragsbestandteilstunden'
      },
      children: []
    },
    {
      type: 'vertragsbestandteillist',
      guioptions: {
        title: 'Zeitaufzeichnung',
        vertragsbestandteiltyp: 'vertragsbestandteilzeitaufzeichnung'
      },
      children: []
    },
    {
      type: 'vertragsbestandteillist',
      guioptions: {
        title: 'Kündigungsfrist',
        vertragsbestandteiltyp: 'vertragsbestandteilkuendigungsfrist'
      },
      children: []
    },
    {
      type: 'vertragsbestandteillist',
      guioptions: {
        title: 'Funktionen',
        vertragsbestandteiltyp: 'vertragsbestandteilfunktion'
      },
      children: []
    },
    {
      type: 'vertragsbestandteillist',
      guioptions: {
        title: 'Sonstiges',
        vertragsbestandteiltyp: 'vertragsbestandteilfreitext'
      },
      children: []
    }
  ],
  data: {
    dienstverhaeltnisid: null,
    unternehmen: '',
    vertragsart_kurzbz: '',
    gueltigkeit: {
      guioptions: {
        sharedstatemode: "set",
        disabled: []
      }
    }
  },
  vbs: {}
}
