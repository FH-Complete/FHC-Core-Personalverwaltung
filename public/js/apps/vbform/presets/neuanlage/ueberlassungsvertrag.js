import uuid from '../../../../helpers/vbform/uuid.js';

export default {
  type: 'preset',
  guioptions: {
    id: 'ueberlassungsvertrag',
    label: 'Überlassungsvertrag',
    description: 'Ueberlassungsvertrag'
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
            title: 'Arbeitszeit & Basisgehalt',
            id: 'arbeitszeit'
          },
          children: [
            {
              type: 'vertragsbestandteillist',
              guioptions: {
                title: 'Arbeitszeit',
                vertragsbestandteiltyp: 'vertragsbestandteilstunden',
                errors: [],
                infos: []
              },
              children: [
                uuid.get_uuidbyname('std1')
              ]
            },
            {
              type: 'vertragsbestandteillist',
              guioptions: {
                title: 'Zeitaufzeichnung',
                vertragsbestandteiltyp: 'vertragsbestandteilzeitaufzeichnung',
                errors: [],
                infos: []
              },
              children: [
                uuid.get_uuidbyname('za1')
              ]
            }
          ]
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
                filter: 'zuordnung',
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
                uuid.get_uuidbyname('oediszpl')
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
      vertragsart_kurzbz: 'ueberlassungsvertrag',
      gueltigkeit: {
        guioptions: {
          sharedstatemode: "set",
          disabled: []
        }
      }
    }
  },
  vbs: {
    [uuid.get_uuidbyname('std1')]: {
      type: 'vertragsbestandteilstunden',
      guioptions: {
        id: uuid.get_uuidbyname('std1'),
        infos: [],
        errors: []
      },
      data: {
        stunden: '38,5'
      },
      gbs: [
        {
          type: 'gehaltsbestandteil',
          guioptions: {
            id: uuid.get_uuid(),
            infos: [],
            errors: [],
            disabled: [
              'gehaltstyp'
            ],
            removeable: true
          },
          data: {
            gehaltstyp: 'basisgehalt',
            valorisierung: true
          }
        }
      ]
    },
    [uuid.get_uuidbyname('za1')]: {
      type: "vertragsbestandteilzeitaufzeichnung",
      guioptions: {
        id: uuid.get_uuidbyname('za1')
      },
      data: {
        id: null,
        zeitaufzeichnung: true,
        azgrelevant: true,
        homeoffice: true,
        gueltigkeit: {
          guioptions: {
            sharedstatemode: "reflect"
          },
          data: {
            "gueltig_ab": "",
            "gueltig_bis": ""
          }
        }
      }
    },
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
    }
  }
}
