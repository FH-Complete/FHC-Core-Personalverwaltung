import uuid from '../../../../helpers/vbform/uuid.js';

export default {
  type: 'preset',
  guioptions: {
    id: 'studhilfskraft',
    label: 'Studentische Hilfskraft',
    description: 'Echter DV für Studentische Hilfskräfte',
    for_vertragsart_kurzbz: [
        'studentischehilfskr'
    ],
    default_for_vertragsart_kurzbz: [
        'studentischehilfskr'
    ]
  },
  children: [
    {
      type: 'tabsspacer',
      guioptions: {},
      children: [
        {
          type: 'dv',
          guioptions: {
          },
          children: []
        }
      ]
    },
    {
      type: 'tabs',
      guioptions: {

      },
      children: [
        {
          type: 'tab',
          guioptions: {
            title: 'Funktionen',
            id: 'funktionen'
          },
          children: [
            {
              type: 'vertragsbestandteillist',
              guioptions: {
                title: 'Zuordnung',
                vertragsbestandteiltyp: 'vertragsbestandteilfunktion',
                filter: 'zuordnung',
                errors: [],
                infos: [],
                childdefaults: {
                  guioptions: {
                    canhavegehaltsbestandteile: false,
                    disabled: [],
                    hidden: []
                  },
                  data: {
                    funktion: "fachzuordnung"
                  }
                }
              },
              children: []
            },
            {
              type: 'vertragsbestandteillist',
              guioptions: {
                title: 'Funktion',
                vertragsbestandteiltyp: 'vertragsbestandteilfunktion',
                filter: 'funktion',
                errors: [],
                infos: [],
                childdefaults: {
                  guioptions: {
                    canhavegehaltsbestandteile: false,
                    disabled: [],
                    hidden: []
                  }
                }
              },
              children: []
            }
          ]
        },
        {
          type: 'tab',
          guioptions: {
            title: 'Zusatzvereinbarungen',
            id: 'zusatzvereinbarungen'
          },
          children: [
            {
              type: 'vertragsbestandteillist',
              guioptions: {
                title: 'Zusatzvereinbarungen',
                vertragsbestandteiltyp: 'vertragsbestandteilfreitext'
              },
              children: []
            }
          ]
        }
      ]
    }
  ],
  dv: {
    type: 'dienstverhaeltnis',
    guioptions: {
        infos: [],
        errors: []
    },
    data: {
      dienstverhaeltnisid: null,
      unternehmen: '',
      vertragsart_kurzbz: 'studentischehilfskr',
      gueltigkeit: {
        guioptions: {
          sharedstatemode: "set",
          disabled: []
        }
      }
    }
  },
  vbs: {
  }
}
