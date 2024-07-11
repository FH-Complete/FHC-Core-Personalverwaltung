import {CoreRESTClient} from '../../../../../js/RESTClient.js';

export const fetchNations = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getNations');
	return CoreRESTClient.getData(res.data);
}

export const fetchSachaufwandTyp = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getSachaufwandtyp');
	return CoreRESTClient.getData(res.data);
}

export const fetchKontakttyp = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getKontakttyp');
	return CoreRESTClient.getData(res.data);
}

export const fetchAdressentyp = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getAdressentyp');
	return CoreRESTClient.getData(res.data);
}

export const fetchSprache = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getSprache');
	return CoreRESTClient.getData(res.data);
}

export const fetchAusbildung = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getAusbildung');
	return CoreRESTClient.getData(res.data);
}

export const fetchStandorteIntern = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getStandorteIntern');
	return CoreRESTClient.getData(res.data);
}

export const fetchOrte = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getOrte');
	return CoreRESTClient.getData(res.data);
}
export const fetchKarenztypen = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getKarenztypen');
	return CoreRESTClient.getData(res.data);
}
export const fetchGehaltstypen = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getGehaltstypen');
	return CoreRESTClient.getData(res.data);
}
export const fetchVertragsarten = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getVertragsarten');
	return CoreRESTClient.getData(res.data);
}
export const fetchVertragsbestandteiltypen = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getVertragsbestandteiltypen');
	return CoreRESTClient.getData(res.data);
}
export const fetchTeilzeittypen = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getTeilzeittypen');
	return CoreRESTClient.getData(res.data);
}
export const fetchFreitexttypen = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getFreitexttypen');
	return CoreRESTClient.getData(res.data);
}

export const fetchHourlyratetypes = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getStundensatztypen');
	return CoreRESTClient.getData(res.data);
}

export const fetchUnternehmen = async () => {
	const res = await CoreRESTClient.get(
		'extensions/FHC-Core-Personalverwaltung/api/getUnternehmen');
	return CoreRESTClient.getData(res.data);
}