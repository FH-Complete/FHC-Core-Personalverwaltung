import uuid from '../../../../helpers/vbform/uuid.js';

export default {
  type: 'preset',
  guioptions: {
    id: 'studhilfskraft',
    label: 'Studentische Hilfskraft',
    description: 'Echter DV für Studentische Hilfskräfte'
  },
  children: [
    {
      type: 'tabs',
      guioptions: {

      },
      children: [
        {
          type: 'dv',
          guioptions: {
          },
          children: []
        },
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
                errors: [],
                infos: [],
                childdefaults: {
                  guioptions: {
                    canhavegehaltsbestandteile: false,
                    disabled: [
                      'funktion'
                    ],
                    hidden: []
                  },
                  data: {
                    funktion: "fachzuordnung"
                  }
                }
              },
              children: [
                uuid.get_uuidbyname('oestdkst'),
                uuid.get_uuidbyname('oediszpl'),
                uuid.get_uuidbyname('oefachl')
              ]
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
    [uuid.get_uuidbyname('oestdkst')]: {
      type: 'vertragsbestandteilfunktion',
      guioptions: {
        id: uuid.get_uuidbyname('oestdkst'),
        removable: false,
        canhavegehaltsbestandteile: false,
        nobottomborder: true,
        nobottommargin: true,
        disabled: [
          'funktion'
        ]
      },
      data: {
        funktion: 'kstzuordnung'
      }
    },
    [uuid.get_uuidbyname('oediszpl')]: {
      type: 'vertragsbestandteilfunktion',
      guioptions: {
        id: uuid.get_uuidbyname('oediszpl'),
        removable: false,
        canhavegehaltsbestandteile: false,
        nobottomborder: true,
        nobottommargin: true,
        disabled: [
          'funktion'
        ]
      },
      data: {
        funktion: 'oezuordnung'
      }
    },
    [uuid.get_uuidbyname('oefachl')]: {
      type: 'vertragsbestandteilfunktion',
      guioptions: {
        id: uuid.get_uuidbyname('oefachl'),
        removable: false,
        canhavegehaltsbestandteile: false,
        disabled: [
          'funktion'
        ]
      },
      data: {
        funktion: 'fachzuordnung'
      }
    }
  }
}
