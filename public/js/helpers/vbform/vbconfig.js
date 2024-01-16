export default {
   btfields: {
       'vertragsbestandteilfreitext': [
            'freitexttyp',
            'titel',
            'freitext'
        ],
       'vertragsbestandteilfunktion': [
            'funktion',
            'orget',
            'benutzerfunktionid',
            'mode'
        ],
       'vertragsbestandteilkarenz': [
            'karenztyp_kurzbz'
        ],
       'vertragsbestandteilkuendigungsfrist': [
            'arbeitgeber_frist',
            'arbeitnehmer_frist'
        ],
       'vertragsbestandteilstunden': [
            'stunden',
            'teilzeittyp_kurzbz'
        ],
       'vertragsbestandteilurlaubsanspruch': [
            'tage'
        ],
       'vertragsbestandteilzeitaufzeichnung': [
            'zeitaufzeichnung',
            'azgrelevant',
            'homeoffice'
        ],
        'gehaltsbestandteil': [
            'gehaltstyp',
            'anmerkung',
            'betrag',
            'valorisierung',
            'valorisierungssperre',
            'auszahlungen'
        ]
   },
   getFieldsForBt: function(vb) {
       var fields = [];
       if( typeof this.btfields[vb] !== 'undefined' ) {
           fields = this.btfields[vb];
       }
       return fields;
   }
}