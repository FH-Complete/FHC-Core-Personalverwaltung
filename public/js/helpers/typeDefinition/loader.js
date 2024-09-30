import {CoreRESTClient} from '../../../../../js/RESTClient.js';

export const fetchNations = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/v1/CommonsAPI/getNations');
	return CoreRESTClient.getData(res.data);
}

export const fetchSachaufwandTyp = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/v1/CommonsAPI/getSachaufwandtyp');
	return CoreRESTClient.getData(res.data);
}

export const fetchKontakttyp = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/v1/CommonsAPI/getKontakttyp');
	return CoreRESTClient.getData(res.data);
}

export const fetchAdressentyp = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/v1/CommonsAPI/getAdressentyp');
	return CoreRESTClient.getData(res.data);
}

export const fetchSprache = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/v1/CommonsAPI/getSprache');
	return CoreRESTClient.getData(res.data);
}

export const fetchAusbildung = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/v1/CommonsAPI/getAusbildung');
	return CoreRESTClient.getData(res.data);
}

export const fetchStandorteIntern = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/v1/CommonsAPI/getStandorteIntern');
	return CoreRESTClient.getData(res.data);
}

export const fetchOrte = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/v1/CommonsAPI/getOrte');
	return CoreRESTClient.getData(res.data);
}
export const fetchKarenztypen = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/v1/CommonsAPI/getKarenztypen');
	return CoreRESTClient.getData(res.data);
}
export const fetchGehaltstypen = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/v1/CommonsAPI/getGehaltstypen');
	return CoreRESTClient.getData(res.data);
}
export const fetchVertragsarten = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/v1/CommonsAPI/getVertragsarten');
	return CoreRESTClient.getData(res.data);
}
export const fetchVertragsbestandteiltypen = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/v1/CommonsAPI/getVertragsbestandteiltypen');
	return CoreRESTClient.getData(res.data);
}
export const fetchTeilzeittypen = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/v1/CommonsAPI/getTeilzeittypen');
	return CoreRESTClient.getData(res.data);
}
export const fetchFreitexttypen = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/v1/CommonsAPI/getFreitexttypen');
	return CoreRESTClient.getData(res.data);
}

export const fetchHourlyratetypes = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/v1/CommonsAPI/getStundensatztypen');
	return CoreRESTClient.getData(res.data);
}

export const fetchUnternehmen = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/v1/OrgAPI/getUnternehmen');
	return CoreRESTClient.getData(res.data);
}