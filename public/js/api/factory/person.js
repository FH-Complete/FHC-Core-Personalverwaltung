/**
 * Copyright (C) 2025 fhcomplete.org
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

export default {
    filterPerson(searchVal) {
      return {
        method: 'post',
        url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/filterPerson',
        params: { searchVal }
      }
    },    
    personBaseData(person_id) {
      return { 
        method: 'get',
        url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/personBaseData',
        params: { person_id }
      } 
    },
    updatePersonBaseData(payload) {        
        return {
          method: 'post',
          url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/updatePersonBaseData',
          params: payload
        }
    },
    personEmployeeData(person_id) {
        return { 
          method: 'get',
          url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/personEmployeeData',
          params: { person_id }
        }
    },
    updatePersonEmployeeData(payload) {
        return {
          method: 'post',
          url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/updatePersonEmployeeData',
          params: payload
        }
    },
    personEmployeeKurzbzExists(uid, kurzbz) {
        return {
          method: 'get',
          url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/personEmployeeKurzbzExists',
          params: { uid, kurzbz }
        }
    },

    deletePersonBankData(bankverbindung_id) {
        return {
          method: 'post',
          url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/deletePersonBankData',
          params: { bankverbindung_id }
        }
    },
    upsertPersonBankData(payload) {
        return {
          method: 'post',
          url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/upsertPersonBankData',
          params: payload
        }
    },
    personBankData(person_id) {
      return {
        method: 'get',
        url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/personBankData',
        params: { person_id }
      }
    },
    personAddressData(person_id) {
      return {
        method: 'get',
        url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/personAddressData',
        params: { person_id }
      }
    },
    deletePersonAddressData(adresse_id) {
      return {
        method: 'post',
        url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/deletePersonAddressData',
        params: { adresse_id }
      }
    },
    upsertPersonAddressData(payload) {
        return {
          method: 'post',
          url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/upsertPersonAddressData',
          params: payload
        }
    },
    personContactData(person_id) {
      return {
        method: 'get',
        url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/personContactData',
        params: { person_id }
      }
    },
    deletePersonContactData(kontakt_id) {
      return {
        method: 'post',
        url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/deletePersonContactData',
        params: { kontakt_id }
      }
    },
    upsertPersonContactData(payload) {
      return {
        method: 'post',
        url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/upsertPersonContactData',
        params: payload
      }
    },
    uidByPerson(person_id, uid) {
        return {
          method: 'get',
          url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/uidByPerson',
          params: { person_id: person_id, person_uid: uid}
        }
    },
    personMaterialExpenses(person_id, uid) {
        return {
          method: 'get',
          url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/personMaterialExpenses',
          params: { person_id: person_id, person_uid: uid}
        }
    },
    deletePersonMaterialExpenses(sachaufwand_id) {        
        return {
          method: 'post',
          url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/deletePersonMaterialExpenses',
          params: { sachaufwand_id }
        }
      },
    upsertPersonMaterialExpenses(payload) {
        return {
          method: 'post',
          url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/upsertPersonMaterialExpenses',
          params: payload
        }
    },
    deletePersonJobFunction(benutzerfunktion_id) {
      return {
        method: 'post',
        url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/deletePersonJobFunction',
        params: { benutzerfunktion_id }
      }
    },
    upsertPersonJobFunction(payload) {   
      return {
        method: 'post',
        url: '/extensions/FHC-Core-Personalverwaltung/api/frontend/v1/PersonAPI/upsertPersonJobFunction',
        params: payload
      }
    },
    updatePersonUnruly(payload) {
      return {
        method: 'post',
        url: '/api/frontend/v1/checkperson/CheckPerson/updatePersonUnrulyStatus',
        params: payload
      }
    }
}