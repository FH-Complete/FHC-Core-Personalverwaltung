import uuid from '../../../../helpers/vbform/uuid.js';

export default {
  type: 'preset',
  guioptions: {
    id: 'echterdv',
    label: 'Echter DV Allin',
    description: 'Standard Vorlage für echte Dienstverträge',
    infos: [
        'Test Info auf oberster Ebene'
    ],
    errors:[
        'Test Error auf oberster Ebene'
    ]
  },
  children: [
    {
      type: 'tabs',
      guioptions: {},
      children: [
        {
          type: 'tab',
          guioptions: {
            title: 'Allgemein',
            id: 'allgemein'
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
                title: 'Kündigungsfrist',
                vertragsbestandteiltyp: 'vertragsbestandteilkuendigungsfrist'
              },
              children: []
            },
            {
              type: 'vertragsbestandteillist',
              guioptions: {
                title: 'Befristung',
                vertragsbestandteiltyp: 'vertragsbestandteilfreitext',
                apioptions: {
                  freitexttyp: 'befristung'
                },
                childdefaults: {
                  guioptions: {
                    canhavegehaltsbestandteile: false,
                    disabled: [
                      'freitexttyp'
                    ],
                    hidden: [
                      'titel',
                      'freitext'
                    ]
                  },
                  data: {
                    freitexttyp: "befristung",
                    titel: "Befristung",
                    freitext: "befristeter Dienstvertrag"
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
                uuid.get_uuidbyname('aenderung_allin_std')
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
                uuid.get_uuidbyname('aenderung_allin_za')
              ]
            },
            {
              type: 'vertragsbestandteillist',
              guioptions: {
                title: 'All-In',
                vertragsbestandteiltyp: 'vertragsbestandteilfreitext',
                apioptions: {
                  freitexttyp: 'allin'
                },
                childdefaults: {
                  guioptions: {
                    canhavegehaltsbestandteile: true,
                    disabled: [
                      'freitexttyp'
                    ],
                    hidden: [
                      'titel',
                      'freitext'
                    ]
                  },
                  data: {
                    freitexttyp: "allin",
                    titel: "All-In",
                    freitext: "All-In Vertrag"
                  }
                }
              },
              children: [
                uuid.get_uuidbyname('aenderung_allin_freitext')
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
                title: 'Funktion',
                vertragsbestandteiltyp: 'vertragsbestandteilfunktion',
                errors: [],
                infos: []
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
                vertragsbestandteiltyp: 'vertragsbestandteilfreitext',
                errors: [],
                infos: []
              },
              children: []
            }
          ]
        },
        {
          type: 'tab',
          guioptions: {
            title: 'Sonstiges',
            id: 'sonstiges'
          },
          children: [
            {
              type: 'vertragsbestandteillist',
              guioptions: {
                title: 'Kündigungsfrist',
                vertragsbestandteiltyp: 'vertragsbestandteilkuendigungsfrist',
                errors: [],
                infos: []
              },
              children: []
            }
          ]
        }
      ]
    }
  ],
  data: {
    dienstverhaeltnisid: 1,
    unternehmen: 'gst',
    vertragsart_kurzbz: 'echterdv',
    gueltigkeit: {
      guioptions: {
        sharedstatemode: "set",
        disabled: [
          'gueltig_bis'
        ]
      }
    }
  },
  vbs: {
    [uuid.get_uuidbyname('aenderung_allin_std')]: {
      type: 'vertragsbestandteilstunden',
      guioptions: {
        id: uuid.get_uuidbyname('aenderung_allin_std'),
        infos: [],
        errors: []
      },
      data: {
        id: null,
        stunden: ''
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
            ]
          },
          data: {
            gehaltstyp: 'grund',
            valorisierung: true
          }
        }
      ]
    },
    [uuid.get_uuidbyname('aenderung_allin_freitext')]: {
      type: 'vertragsbestandteilfreitext',
      guioptions: {
        id: uuid.get_uuidbyname('aenderung_allin_freitext'),
        infos: [],
        errors: [],
        disabled: [
          'freitexttyp'
        ],
        hidden: [
          'titel',
          'freitext'
        ]
      },
      data: {
        id: null,
        freitexttyp: 'allin',
        titel: 'All-In',
        freitext: 'All-In Vertrag'
      },
      gbs: [
        {
          type: 'gehaltsbestandteil',
          guioptions: {
            id: uuid.get_uuid(),
            infos: [],
            errors: [],
            removeable: false,
            disabled: [
              'gehaltstyp'
            ]
          },
          data: {
            gehaltstyp: 'zulage',
            valorisierung: true
          }
        }
      ]
    },
    [uuid.get_uuidbyname('aenderung_allin_za')]: {
      "type": "vertragsbestandteilzeitaufzeichnung",
      "guioptions": {
        "id": uuid.get_uuidbyname('aenderung_allin_za'),
        "removeable": false
      },
      "data": {
        "id": null,
        "zeitaufzeichnung": true,
        "azgrelevant": "",
        "homeoffice": true
      }
    }
  }
}
