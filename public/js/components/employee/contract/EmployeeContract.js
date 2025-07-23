import vbform_wrapper from './vbform/vbform_wrapper.js';
import enddvmodal from './vbform/enddvmodal.js';
import deletedvmodal from './vbform/deletedvmodal.js';
import karenzmodal from './vbform/karenzmodal.js';
import { DropDownButton } from '../../DropDownButton.js';
import { ModalDialog } from '../../ModalDialog.js';
import { OffCanvasTimeline } from './OffCanvasTimeline.js';
import { Toast } from '../../Toast.js';
import { usePhrasen } from '../../../../../../../public/js/mixins/Phrasen.js';

export const EmployeeContract = {
	name: 'EmployeeContract',
    components: {
        'vbform_wrapper': vbform_wrapper,
        'enddvmodal': enddvmodal,
        'deletedvmodal': deletedvmodal,
        'karenzmodal': karenzmodal,
        'DropDownButton': DropDownButton,
        "p-skeleton": primevue.skeleton,
        "datepicker": VueDatePicker,
        ModalDialog,
        OffCanvasTimeline,
        Toast,
    },
    props: {
        id: Number,
        uid: String,
        dienstverhaeltnis_id: {type: Number, required: false},
        openhistory: {type: Boolean, required: false},
    },
    emits: ['updateHeader'],
    setup(props, { emit }) {

        const { watch, ref, reactive, computed, inject, onMounted, provide } = Vue;
        const route = VueRouter.useRoute();
        const router = VueRouter.useRouter();
        const { t } = usePhrasen();
        const dvList = ref([]);
        const vertragList = ref([]);
        const gbtList = ref([]);
        const gbtChartData = ref([]);
        const isFetching = ref(false);
        const currentDVID = ref(null);
        const currentDV = ref(null);
        const currentVertragID = ref(null);
        const dvSelectedIndex = ref(1);
        const currentVBS = reactive({
            funktion: {
                zuordnung: [],
                taetigkeit: []
            },
            zeitaufzeichnung: [],
            kuendigungsfrist: [],
            stunden: [],
            allIn: [],
            befristung: [],
            urlaubsanspruch: [],
            zusatzvereinbarung: [],
            karenz: [],
        });
        //const dienstverhaeltnisDialogRef = ref();
        const VbformWrapperRef = ref();
        const vbformmode = ref('neuanlage');
        const vbformDV = ref(null);

        const enddvmodalRef = ref();
        const endDV = ref(null);

        const deletedvmodalRef = ref();
        const delDV = ref(null);

        const karenzmodalRef = ref();
        const curKarenz = ref(null);
        const openhistoryFlag = ref(props.openhistory);

        const truncateDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);

        const numberFormat = new Intl.NumberFormat();
        const now = ref(truncateDate(new Date()));

        const currentDate = ref(now.value);
        const confirmDeleteDVRef = ref();

        const offCanvasRef = ref();

        const karenztypen = Vue.inject('karenztypen');
        const vertragsarten = inject('vertragsarten');
        const freitexttypen = inject('freitexttypen');
        const beendigungsgruende = inject('beendigungsgruende');
        const teilzeittypen = inject('teilzeittypen');

        const readonly = ref(false);
        const valorisationValid = ref(true);
		
        const hassalarypermission = ref(false);
		const hasdvpermission = ref(false);
		const hasdvkorrpermission = ref(false);

		provide('hassalarypermission', hassalarypermission);
		provide('hasdvpermission', hasdvpermission);
		provide('hasdvkorrpermission', hasdvkorrpermission);

        const fhcApi = inject('$fhcApi');  
        const fhcAlert = inject('$fhcAlert');

        const convert2UnixTS = (ds) => {
            let d = new Date(ds);
            return Math.round(d.getTime() / 1000)
        }

        // dummy data for chart
        const dates = ref([]);
        const salaries = ref([]);

        const chartOptions = reactive({
            lang: {
                thousandsSep: '.'
            },
            chart: {
                type: 'line'
            },
            title: {
                text: 'Gehalt'
            },
            series: [{
                    name: 'Gehalt',
                    data: [],
                    color: '#6fcd98',
                    step: 'left' // or 'center' or 'right'
                },{
                    name: 'Gehalt (ohne Val.)',
                    data: [],
                    color: '#d6af02',
                    step: 'left', // or 'center' or 'right'
                    visible: false,
                },
                {
                    name: 'Abgerechnet',
                    data: [],
                    color: '#cd6fca',
                    step: 'left' // or 'center' or 'right'
                },
            ],
            xAxis: {
                type: 'datetime',
                currentDateIndicator: {
                    width: 2,
                    dashStyle: 'dot',
                    color: 'red',
                    label: {
                      format: '%d.%m.%Y'
                    }
                },
                labels: {
                  // Format the date
                  formatter: function() {
                    return Highcharts.dateFormat('%d.%m.%Y', this.value);
                  },
                  rotation: 90
                },
                /*tickPositioner: function() {
                  return dates.value.map(function(date) {
                    return Date.parse(date);
                  });
                }*/
            },
            tooltip: {
                pointFormat: '<b>€ {point.y:,.2f}</b>',
                xDateFormat: '%d.%m.%Y'
            },
            yAxis: {
                //min: 0,
                title: {
                    text: '€'
                }
            },
            credits: {
                enabled: false
              },



        })        

        const fetchData = async (uid) => {
            if (uid == null) {
                dvList.value = [];
                vertragList.value = [];
                return;
            }
            isFetching.value = true
            try {
              const res = await fhcApi.factory.Employee.dvByPerson(uid);
                dvList.value = res.retval;
                isFetching.value = false;
                if (dvList.value.length > 0) {
                    if (props.dienstverhaeltnis_id != undefined) {
                        currentDVID.value = props.dienstverhaeltnis_id;
                        currentDV.value = dvList.value.find(item => item.dienstverhaeltnis_id == props.dienstverhaeltnis_id);
                    } else {
                        currentDVID.value = dvList.value[0].dienstverhaeltnis_id;
                        currentDV.value = dvList.value[0];
                    }
                    
                } else {
                    currentDVID.value = null;
                    currentDV.value = null;
                }
            } catch (error) {
                console.log(error)
                isFetching.value = false
            }


        }

        const fetchVertrag = async (dv_id, date) => {
            isFetching.value = true
            try {
                const res = await fhcApi.factory.Vertrag.vertragByDV(dv_id, convert2UnixTS(date));
                vertragList.value = res;
                getCurrentVertragsbestandteil();
                //}
            } catch (error) {
                console.log(error)
            } finally {
                isFetching.value = false
            }
        }

        // Gehaltsbestandteile
        const fetchGBT = async (dv_id, date) => {
            if(!hassalarypermission.value) {
                gbtList.value = [];
                return;
            }

            isFetching.value = true
            try {
                const res = await fhcApi.factory.Gehaltsbestandteil.gbtByDV(dv_id, convert2UnixTS(date));
                gbtList.value = res;
            } catch (error) {
                console.log(error)
            } finally {
                isFetching.value = false
            }

        }

        // fetch chart data
        const fetchGBTChartData = async (dv_id, date) => {
            if(!hassalarypermission.value) {
                gbtChartData.value = [];
                return;
            }

            isFetching.value = true
            let tempData1 = [], tempData2 = [], tempData3 = [];
            try {
                if (dv_id != null) {
                    const res = await fhcApi.factory.Gehaltsbestandteil.gbtChartDataByDV(dv_id);
                    gbtChartData.value = res;
                    
                    // chartOptions.series[0].data.length = 0;
					Object.keys(res.valorisiert).forEach(element => {
						tempData1.push([new Date(element).getTime(), parseFloat(res.valorisiert[element])]);
					});
                    Object.keys(res.gesamt).forEach(element => {
                       tempData2.push([new Date(element).getTime(), parseFloat(res.gesamt[element])]);
                    });
                    res.abgerechnet.forEach(element => {
                        tempData3.push([new Date(element.datum).getTime(), parseFloat(element.sum)]);
                    });
                }
            } catch (error) {
                console.log(error)
            } finally {
                chartOptions.series[0].data = tempData1;
                chartOptions.series[1].data = tempData2;
				chartOptions.series[2].data = tempData3;
                isFetching.value = false
            }

        }

        const deleteDV = async (dv_id) => {
            isFetching.value = true
            try {
                const res = await fhcApi.factory.Employee.deleteDV(dv_id);
                emit('updateHeader');
            } catch (error) {
                console.log(error);
            } finally {
                isFetching.value = false;
            }
        }

        const activeDV = computed(() => {
            return dvList.value.filter((dv) => {
                let von = new Date(dv.von);
                let bis = dv.bis != null ? new Date(dv.bis) : null;
                return von <= currentDate.value && (bis == null || bis >= currentDate.value);
            })
        })

        const isCurrentDVActive = computed(() => {
            if (currentDV.value == null) return false;
            let von = truncateDate(new Date(currentDV.value.von));
            let bis = currentDV.value.bis != null ? truncateDate(new Date(currentDV.value.bis)) : null;
            return von <= currentDate.value && (bis == null || bis >= currentDate.value);
        })

        const isCurrentDate = computed(() => {
            return currentDate.value.getTime() == now.value.getTime()
        })

        fetchData(props.uid);
        watch(
            () => props.uid,
            (newVal) => {
                fetchData(newVal);
            }
        )
        watch(
            currentDVID,
            async (newVal) => {
                if (newVal == null) return
                fetchVertrag(newVal, currentDate.value);
                await checkSalaryPermission();
				await checkDvPermission();
				await checkDvKorrPermission();
                fetchGBT(newVal, currentDate.value);
                fetchGBTChartData(newVal);
                checkValorisation();
                if (openhistoryFlag.value) {
                    console.log('*** watch currentDVID ***');
                    Vue.nextTick().then(() => {
                        showOffCanvas();
                        openhistoryFlag.value = false;
                    })
                }
            }
        )
        watch(
            () => props.dienstverhaeltnis_id,
            (newVal) => {
                currentDVID.value = props.dienstverhaeltnis_id;
                currentDV.value = dvList.value.find(item => item.dienstverhaeltnis_id == props.dienstverhaeltnis_id);
            }
        )

        watch(
            currentDate,
            (newDate) => {
                console.log('watch newDate=', newDate)
                fetchVertrag(currentDVID.value, newDate);
                fetchGBT(currentDVID.value, newDate)
                fetchGBTChartData(currentDVID.value);
            }
        )

        const dvSelectedHandler = (e) => {
            console.log("DV selected: ", e.target);
            dvSelectedIndex.value = e.target.selectedIndex + 1;
            currentDV.value = dvList.value[e.target.selectedIndex];
            currentDVID.value = currentDV.value.dienstverhaeltnis_id;
            let url = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '/')
                    + FHC_JS_DATA_STORAGE_OBJECT.ci_router
                    + '/extensions/FHC-Core-Personalverwaltung/Employees/'
                    + props.id + '/' + props.uid
                    + '/contract/' + currentDV.value.dienstverhaeltnis_id;
            router.push( url );
        }


        const formatDate = (d) => {
            if (d != null && d != '') {
                return d.substring(8, 10) + "." + d.substring(5, 7) + "." + d.substring(0, 4);
            } else {
                return ''
            }
        }


        const formatDateISO = (ds) => {
            let padNum = (n) => {
                if (n<10) return '0' + n;
                return n;
            }
            if (ds == null) return '';
            var d = new Date(ds);
            return d.getFullYear() + "-" + padNum((d.getMonth()+1)) + "-" + padNum(d.getDate());
        }

        const filterVertragsbestandteil = (vertragsbestandteile, kurzbz) => {
            let ws = vertragsbestandteile.filter(value => value.vertragsbestandteiltyp_kurzbz == kurzbz);
            return ws;
        }

        const createDVDialog = () => {
            vbformmode.value = 'neuanlage';
            vbformDV.value = null;
            VbformWrapperRef.value.showModal();
        }

        const updateDVDialog = () => {
            vbformmode.value = 'aenderung';
            vbformDV.value = currentDV.value;
            VbformWrapperRef.value.showModal();
        }

        const korrekturDVDialog = () => {
            vbformmode.value = 'korrektur';
            vbformDV.value = currentDV.value;
            VbformWrapperRef.value.showModal();
        }

        const endDVDialog = () => {
            endDV.value = {
                    dienstverhaeltnisid: currentDV.value.dienstverhaeltnis_id,
                    unternehmen: currentDV.value.oe_kurzbz,
                    vertragsart_kurzbz: currentDV.value.vertragsart_kurzbz,
                    dvendegrund_kurzbz: currentDV.value.dvendegrund_kurzbz,
                    dvendegrund_anmerkung: currentDV.value.dvendegrund_anmerkung,
                    gueltigkeit: {
                        guioptions: {
                           sharedstatemode: 'ignore',
                           disabled: [
                               'gueltig_ab'
                           ]
                        },
                        data: {
                            gueltig_ab: currentDV.value.von,
                            gueltig_bis: currentDV.value.bis,
                        }
                    },
                    unruly: currentDV.value.unruly,
                    person_id: currentDV.value.person_id
                };
            enddvmodalRef.value.showModal();
        }

        const deleteDVDialog = () => {
            delDV.value = {
                    dienstverhaeltnisid: currentDV.value.dienstverhaeltnis_id,
                    label: formatVertragsart(currentDV.value.vertragsart_kurzbz) + '/' +
                           currentDV.value.oe_bezeichnung + ', ' +
                           formatDate(currentDV.value.von) + ' - ' +
                           formatDate(currentDV.value.bis)
            };
            deletedvmodalRef.value.showModal();
        }

        const linkToLehrtaetigkeitsbestaetigungODT = () => {
            window.location.href = FHC_JS_DATA_STORAGE_OBJECT.app_root + 'content/mitarbeiter/lehrtaetigkeit.pdf.php?output=odt&uid=' + currentDV.value.uid;
        }

        const linkToLehrtaetigkeitsbestaetigungPDF = () => {
            window.location.href = FHC_JS_DATA_STORAGE_OBJECT.app_root + 'content/mitarbeiter/lehrtaetigkeit.pdf.php?output=pdf&uid=' + currentDV.value.uid;
        }

        const karenzDialog = () => {
            curKarenz.value = {
                    type: 'vertragsbestandteilkarenz',
                    guioptions: {
                        id: 'test'
                    },
                    data: {
                        id: null,
                        karenztyp_kurzbz: '',
                        geplanter_geburtstermin: '',
                        tatsaechlicher_geburtstermin: '',
                        gueltigkeit: {
                            guioptions: {
                               sharedstatemode: 'ignore',
                               disabled: []
                            },
                            data: {
                                gueltig_ab: '',
                                gueltig_bis: '',
                            }
                        }
                    }
                };
            karenzmodalRef.value.showModal();
        }

        const showOffCanvas = () => {
            offCanvasRef.value.show();
        }

        

        const handleDvSaved = async () => {
            fetchData(props.uid).then(() => {
                // data might have changed but currentDVID is still the same -> fetch updated data
                if (currentDVID != null && currentDVID.value > 0) {
                    fetchVertrag(currentDVID.value, currentDate.value);
                    fetchGBT(currentDVID.value, currentDate.value);
                    fetchGBTChartData(currentDVID.value);
                    checkValorisation();
                    emit('updateHeader');
                }
            })
        }

        const handleDvEnded = async () => {
            fetchData(route.params.uid);
            emit('updateHeader');
        }

        const handleUpdateUnruly = async () => {
            fetchData(route.params.uid);
            emit('updateHeader');
        }

        const handleDvDeleted = () => {
            delDV.value = null;
            let url = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '/')
                + FHC_JS_DATA_STORAGE_OBJECT.ci_router
                + '/extensions/FHC-Core-Personalverwaltung/Employees/'
                + props.id + '/' + props.uid
                + '/contract';
            router.push( url ).then(() => {
                router.go(0);
            });
        }

        const handleKarenzSaved = async () => {
            // TODO do something sensible
            console.log('Karenz saved');
        }

        const formatNumber = (num) => {
            return numberFormat.format(parseFloat(num));
        }

        const setDateHandler = (d) => {
            console.log('date set: ', d);
            currentDate.value = truncateDate(new Date(d));
            //currentDate.value = truncateDate(new Date(d.target.value));
        }

        // event hander for vertragshistorie
        const dateSelectedHandler = (d) => {
            currentDate.value = truncateDate(new Date(d));
        }

        const setDate2BisDatum = () => {
            currentDate.value = truncateDate(new Date(currentDV.value.bis));
        }

        const setDate2VonDatum = () => {
            currentDate.value = truncateDate(new Date(currentDV.value.von));
        }

        const getCurrentVertragsbestandteil = () => {
            let zuordnung = [];
            let taetigkeit = [];
            let zeitaufzeichnung = [];
            let kuendigungsfrist = [];
            let stunden = [];
            let allIn = [];
            let befristung = [];
            let urlaubsanspruch = [];
            let zusatzvereinbarung = [];
            let karenz = [];
            vertragList.value.forEach(vbs => {
                if (vbs.vertragsbestandteiltyp_kurzbz == 'funktion') {
                    if (vbs.benutzerfunktiondata.funktion_kurzbz.match(/.*zuordnung/)) {
                        zuordnung.push(vbs.benutzerfunktiondata);
                    } else {
                        taetigkeit.push(vbs.benutzerfunktiondata);
                    }
                } else if (vbs.vertragsbestandteiltyp_kurzbz == 'freitext') {
                    if (vbs.freitexttyp_kurzbz == 'allin') {
                        allIn.push(vbs);
                    } else if (vbs.freitexttyp_kurzbz == 'befristung') {
                        befristung.push(vbs);
                    } else {
                        zusatzvereinbarung.push(vbs);
                    }
                } else if (vbs.vertragsbestandteiltyp_kurzbz == 'kuendigungsfrist') {
                    kuendigungsfrist.push(vbs);
                } else if (vbs.vertragsbestandteiltyp_kurzbz == 'stunden') {
                    stunden.push(vbs);
                } else if (vbs.vertragsbestandteiltyp_kurzbz == 'urlaubsanspruch') {
                    urlaubsanspruch.push(vbs);
                } else if (vbs.vertragsbestandteiltyp_kurzbz == 'zeitaufzeichnung') {
                    zeitaufzeichnung.push(vbs);
                } else if (vbs.vertragsbestandteiltyp_kurzbz == 'karenz') {
                    karenz.push(vbs);
                }
            });
            currentVBS.funktion.zuordnung = zuordnung;
            currentVBS.funktion.taetigkeit = taetigkeit;
            currentVBS.zeitaufzeichnung = zeitaufzeichnung;
            currentVBS.stunden = stunden;
            currentVBS.kuendigungsfrist = kuendigungsfrist;
            currentVBS.allIn = allIn;
            currentVBS.befristung = befristung;
            currentVBS.zusatzvereinbarung = zusatzvereinbarung;
            currentVBS.urlaubsanspruch = urlaubsanspruch;
            currentVBS.karenz = karenz;


        }

        const dropdownLink1 = () => {
            console.log('dropdown link clicked');
        }

        const dvDeleteHandler = () => {
            console.log('dvDeleteHandler link clicked', currentDVID);
            deleteDV(currentDVID.value).then(async () => {
                fetchData(props.uid)
                let url = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '/')
                    + FHC_JS_DATA_STORAGE_OBJECT.ci_router
                    + '/extensions/FHC-Core-Personalverwaltung/Employees/'
                    + props.id + '/' + props.uid
                    + '/contract';
                await router.push( url )
            });
        }

        const capitalize = (s) => {
            return s.charAt(0).toUpperCase() + s.slice(1);
        }

        const formatGBTGrund = (item) => {
            if (!item) return ''
            if (item.vertragsbestandteiltyp_kurzbz=='funktion') {
                return item.fkt_beschreibung + '/' + (item.fb_bezeichnung!=null?item.fb_bezeichnung:'') + (item.org_bezeichnung!=null?item.org_bezeichnung:'')
            } else if (item.vertragsbestandteiltyp_kurzbz=='freitext') {
                return capitalize(item.freitexttyp_kurzbz) + '/' + item.freitext_titel
            }
            return capitalize(item.vertragsbestandteiltyp_kurzbz)
        }

        const formatKarenztyp = (item) => {
            let karenztyp = karenztypen.value.find(kt => kt.value == item);
            return karenztyp != undefined ? karenztyp.label : item;
        }

        const formatVertragsart = (item) => {
            let va = vertragsarten.value.find(kt => kt.value == item);
            return va != undefined ? va.label : item;
        }

        const formatFreitexttyp = (item) => {
            let va = freitexttypen.value.find(kt => kt.value == item);
            return va != undefined ? va.label : item;
        }

        const formatBeendigungsgrund = (item) => {
            let va = beendigungsgruende.value.find(kt => kt.value == item);
            return va != undefined ? va.label : item;
        }

        const formatTeilzeittyp = (item) => {
            let va = teilzeittypen.value.find(kt => kt.value == item);
            return va != undefined ? va.label : item;
        }

        const truncate = (input) => input?.length > 8 ? `${input.substring(0, 8)}...` : input;

        const checkValorisation = async () => {
			if (currentDVID != null && currentDVID.value > 0) {
                                if(!hassalarypermission.value) {
                                    valorisationValid.value = true;
                                    return;
                                }
				isFetching.value = true
				try {
					const res = await fhcApi.factory.ValorisierungCheck.checkValorisationValidityOfDv(currentDVID.value);
					valorisationValid.value = res.data;
				} catch (error) {
					console.log(error)
				} finally {
					isFetching.value = false
				}
			}
        }
        checkValorisation();

        const valorisationCheckPath = computed(() => {
			const ciPath = FHC_JS_DATA_STORAGE_OBJECT.app_root.replace(/(https:|)(^|\/\/)(.*?\/)/g, '') + FHC_JS_DATA_STORAGE_OBJECT.ci_router;
			return `/${ciPath}/extensions/FHC-Core-Personalverwaltung/Valorisation/Check/`+currentDVID.value;
        });

        const checkSalaryPermission = async () => {
            var isBerechtigt = false;
            if (currentDVID != null && currentDVID.value > 0) {
                try {
                    const res = await fhcApi.factory.permission.isBerechtigt(
                        'basis/gehaelter', 
                        's',
                        currentDV.value.oe_kurzbz, 
                        null
                    );
                    isBerechtigt = res.data.data.isBerechtigt;
                } catch (error) {
                    isBerechtigt = false;
                    console.log(error)
                }
            }
            hassalarypermission.value = isBerechtigt;
            return isBerechtigt;
        };
        checkSalaryPermission();
		
		const checkDvPermission = async() => {
			var isBerechtigt = false;
			if (currentDVID != null && currentDVID.value > 0) {
				try {
					const res = await fhcApi.factory.permission.isBerechtigt(
						'extension/pv21_dv', 
						's',
						currentDV.value.oe_kurzbz, 
						null
					);
					isBerechtigt = res.data.data.isBerechtigt;
				} catch (error) {
					isBerechtigt = false;
					console.log(error)
				}
			}
            hasdvpermission.value = isBerechtigt;
            return isBerechtigt;
		};
		checkDvPermission();

		const checkDvKorrPermission = async() => {
			var isBerechtigt = false;
			if (currentDVID != null && currentDVID.value > 0) {
				try {
					const res = await fhcApi.factory.permission.isBerechtigt(
						'extension/pv21_dv_korr', 
						's',
						currentDV.value.oe_kurzbz, 
						null
					);
					isBerechtigt = res.data.data.isBerechtigt;
				} catch (error) {
					isBerechtigt = false;
					console.log(error)
				}
			}
            hasdvkorrpermission.value = isBerechtigt;
            return isBerechtigt;
		};
		checkDvKorrPermission();
		
        return {
            isFetching, dvList, vertragList, gbtList, currentDV, currentDVID, dvSelectedHandler, confirmDeleteDVRef, offCanvasRef,
            VbformWrapperRef, route, vbformmode, vbformDV, formatNumber, activeDV, isCurrentDVActive, isCurrentDate,
            currentVBS, dropdownLink1, setDateHandler, dvDeleteHandler, formatGBTGrund, truncate, setDate2BisDatum, setDate2VonDatum,
            createDVDialog, updateDVDialog, korrekturDVDialog, handleDvSaved, formatDate, formatDateISO, dvSelectedIndex,
            currentDate, chartOptions, enddvmodalRef, endDVDialog, endDV, handleDvEnded, handleUpdateUnruly, showOffCanvas, dateSelectedHandler,
            karenzmodalRef, karenzDialog, curKarenz, handleKarenzSaved, formatKarenztyp, formatVertragsart, formatFreitexttyp,
            readonly, t, linkToLehrtaetigkeitsbestaetigungODT, linkToLehrtaetigkeitsbestaetigungPDF, formatBeendigungsgrund,
            deletedvmodalRef, deleteDVDialog, delDV, handleDvDeleted, formatTeilzeittyp, valorisationCheckPath, valorisationValid,
            hassalarypermission, hasdvpermission, hasdvkorrpermission
        }
    },
    template: `



    <div class="d-flex justify-content-between align-items-center ms-sm-auto col-lg-12 p-md-2">

      <div class="container-fluid px-1">

            <div class="row">

                <div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
                    <Toast ref="toastRef">
                        <template #body><h4>Vertrag gespeichert.</h4></template>
                    </Toast>
                </div>

                <div class="col-md-12">
                    <div class="d-flex justify-content-end mb-2">
                        <div class="me-2"><span style="font-size:0.5em;font-style:italic" v-if="dvList?.length>0">({{ dvSelectedIndex }} von {{ dvList.length }})  id={{currentDVID}}</span></div>
                        <div v-if="!isCurrentDate"><span class="badge badge-sm bg-warning me-1">Anzeigedatum ist nicht aktueller Tag</span></div>
                        <div><span class="badge badge-sm me-1" :class="{'bg-success': activeDV.length > 0, 'bg-danger': activeDV.length == 0}" v-if="!isFetching">{{ activeDV.length }} aktiv zu gewähltem Datum</span></div>
                        <div><span class="badge badge-sm bg-secondary">{{ dvList?.length }} <span v-if="dvList">gesamt</span></span></div>
                    </div>
                    <div class="d-flex">
                        <div class="me-auto">
                            <button v-if="!readonly && hasdvpermission" type="button" class="btn btn-sm btn-primary me-2" @click="createDVDialog()"><i class="fa fa-plus"></i> Dienstverhältnis</button>
                            <button v-if="!readonly && hasdvpermission" type="button" class="btn btn-sm btn-outline-secondary me-2" @click="updateDVDialog()">DV bearbeiten</button>
                            <DropDownButton class="me-2" :links="[{action:linkToLehrtaetigkeitsbestaetigungODT,text:'Lehrtätigkeitsbestätigung (odt)'},{action:linkToLehrtaetigkeitsbestaetigungPDF,text:'Lehrtätigkeitsbestätigung (pdf)'}]">
                                Bestätigung drucken
                            </DropDownButton>
                            <!-- Drop Down Button -->
                            <DropDownButton v-if="hasdvpermission" class="me-2" :links="(hasdvkorrpermission) ? [{action:korrekturDVDialog,text:'DV korrigieren'},{action:endDVDialog,text:'DV beenden'},{action:deleteDVDialog,text:'DV löschen (nur in Ausnahmefällen)'}] : [{action:endDVDialog,text:'DV beenden'}]">
                                Weitere Aktionen
                            </DropDownButton>
                            <!--button v-if="!readonly" type="button" class="btn btn-sm btn-secondary" @click="showOffCanvas()">Vertragshistorie</button-->
                        </div>

                        <div class="d-flex align-items-end flex-column">
                            <div class="d-grid d-sm-flex gap-2 mb-2 flex-nowrap">
                                <select  v-if="!isFetching && dvList?.length>0" class="form-select form-select-sm" v-model="currentDVID" @change="dvSelectedHandler" aria-label="DV auswählen">
                                    <option v-for="(item, index) in dvList" :value="item.dienstverhaeltnis_id"  :key="item.dienstverhaeltnis_id">
                                    {{ formatVertragsart(item.vertragsart_kurzbz) }}/{{item.oe_bezeichnung}}, {{ formatDate(item.von) }} - {{ formatDate(item.bis) }}
                                    </option>
                                </select>
                                <div v-else-if="isFetching" style="width:150px"><p-skeleton style="width:100%;height:100%"></p-skeleton></div>

                                <datepicker id="currentDateSelect" :modelValue="formatDateISO(currentDate)"
                                    @update:model-value="setDateHandler"
                                    v-bind:enable-time-picker="false"
                                    :clearable="false"
                                    six-weeks
                                    auto-apply
                                    locale="de"
                                    format="dd.MM.yyyy"
                                    model-type="yyyy-MM-dd"
                                    input-class-name="dp-custom-input"
									:config="{ keepActionRow: true }"
									:action-row="{ showNow: true, showSelect: false, showCancel: false }"
									now-button-label="Heute"
                                    style="max-width:140px;min-width:140px" ></datepicker>
                            </div>
                        </div>
                    </div>

                </div>

                <div class="row justify-content-center pt-md-2" v-if="!isCurrentDVActive && dvList?.length">
                        <div class="alert alert-warning mt-3" role="alert">
                            Dienstverhältnis ist zum ausgewählten Datum inaktiv.
                            <span v-if="currentDV?.bis != null">
                                Anzeigedatum auf letztgültiges Datum des Dienstverhältnisses setzen: &nbsp;
                                <button type="button" class="btn btn-sm btn-outline-secondary" @click="setDate2BisDatum">
                                    Datum setzen
                                </button>

                            </span>
                            <span v-else-if="currentDV?.von != null">
                                Anzeigedatum auf Von-Datum des Dienstverhältnisses setzen: &nbsp;
                                <button type="button" class="btn btn-sm btn-outline-secondary" @click="setDate2VonDatum">
                                    Datum setzen
                                </button>

                            </span>
                        </div>
                </div>
                <div class="row pt-md-2" v-if="isCurrentDVActive && dvList?.length">
                    <div class="col-6">
                        <!-- Allgemein -->
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Allgemein</h5>
                            </div>
                            <div class="card-body">
                                <div ref="baseDataFrm" class="row g-3" v-if="currentDV != null">

                                    <div class="col-md-4">
                                        <label class="col-sm-6 form-label">Organisation</label>
                                        <input type="text" readonly class="form-control-sm form-control-plaintext" :value="currentDV.oe_bezeichnung" >
                                    </div>

                                    <div class="col-md-4">
                                        <label for="dvArt" class="col-sm-6 form-label">Vertragsart</label>
                                        <div class="col-sm-12">
                                            <input type="text" readonly class="form-control-sm form-control-plaintext" id="dvArt" :value="formatVertragsart(currentDV.vertragsart_kurzbz)">
                                        </div>
                                    </div>

                                    <div class="col-md-4"></div>

                                    <!-- von bis -->
                                    <div class="col-md-4">
                                        <label class="form-label" >Von</label>
                                        <input type="text" readonly class="form-control-sm form-control-plaintext" :value="formatDate(currentDV.von)" >
                                    </div>

                                    <div class="col-md-4">
                                        <label class="form-label" >Bis</label>
                                        <input type="text" readonly class="form-control-sm form-control-plaintext" :value="formatDate(currentDV?.bis)" >
                                    </div>

                                    <!--div class="col-md-4">
                                        <label  class="form-label" >Befristet</label>
                                        <div class="col-sm-8">
                                            <input class="form-check-input mt-2" type="checkbox" id="befristetCheck" disabled >
                                        </div>
                                    </div-->

                                    <!-- DV Beendigungsgrund -->
                                    <div class="col-md-4" v-if="currentDV?.dvendegrund_kurzbz != null">
                                        <label  class="form-label" >Beendigungsgrund</label>
                                        <input readonly class="form-control-sm form-control-plaintext" type="text" id="dvendegrundKurzbz" :value="formatBeendigungsgrund(currentDV?.dvendegrund_kurzbz)"  >
                                    </div>
                                    <div class="col-md-4"  v-else></div>

                                    <div class="col-md-8" v-if="currentDV?.dvendegrund_kurzbz != null">
                                        <label  class="form-label" >Anmerkung</label>
                                        <textarea class="form-control-sm form-control-plaintext" readonly >{{ currentDV?.dvendegrund_anmerkung }} </textarea>
                                    </div>
                                    <div class="col-md-8"  v-else></div>

                                    <div class="col-md-4"></div>

                                    <!-- Befristung -->
                                    <template v-for="(item, index) in currentVBS.befristung"  >
                                        <div class="col-md-4">
                                            <label for="befristet_von" class="form-label" >Befristung Von</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext" :value="formatDate(item.von)" >
                                        </div>

                                        <div class="col-md-4">
                                            <label for="befristet_bis" class="form-label" >Befristung Bis</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext" :value="formatDate(item.bis)" >
                                        </div>

                                        <div class="col-md-4">
                                            <label for="befristetCheck" class="form-label" >Befristet</label>
                                            <div class="col-sm-8">
                                                <input class="form-check-input mt-2" type="checkbox" id="befristetCheck" checked disabled>
                                            </div>
                                        </div>
                                    </template>

                                    <!-- Kündigungsfrist -->
                                    <template v-for="(item, index) in currentVBS.kuendigungsfrist"  >
                                        <div class="col-md-4">
                                            <label for="dvKuendigungsfristAG" class="form-label">Kündigungsfrist AG</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext" id="dvKuendigungsfristAG" :value="item.arbeitgeber_frist">
                                        </div>

                                        <div class="col-md-4">
                                            <label for="dvKuendigungsfristAN" class="form-label">Kündigungsfrist AN</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext" id="dvKuendigungsfristAN" :value="item.arbeitnehmer_frist">
                                        </div>

                                        <div class="col-md-4"></div>
                                    </template>

                                    <!-- Urlaubsanspruch -->
                                    <template v-for="(item, index) in currentVBS.urlaubsanspruch"  >
                                        <div class="col-md-3">
                                            <label for="dvUrlaubsanspruch" class="form-label">Urlaubsanspruch</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext" id="dvUrlaubsanspruch" :value="item.tage">
                                        </div>
                                    </template>

                                </div>
                            </div><!-- card body -->
                        </div><!-- card -->

                        <!-- Arbeitszeit -->
                        <div class="card mt-3">
                            <div class="card-header">
                                <h5 class="mb-0">Arbeitszeit</h5>
                            </div>
                            <div class="card-body">
                                <div class="col-md-12 py-3" v-if="currentVBS.stunden.length == 0">
                                    Kein aktiver Vertragsbestandteil vorhanden.
                                </div>
                                <template v-for="(item, index) in currentVBS.stunden"  >
                                    <div class="row">
                                        <div class="col-md-4">
                                            <label for="dvStunden" class="form-label">Wochenstunden</label>
                                            <div class="col-sm-12">
                                                <input type="text" readonly class="form-control-sm form-control-plaintext" id="dvStunden"  :value="formatNumber(item.wochenstunden)">
                                            </div>
                                        </div>

                                        <div class="col-md-4">
                                            <label for="dvTeilzeittyp" class="form-label">Teilzeittyp</label>
                                            <div class="col-sm-12">
                                                <input type="text" readonly class="form-control-sm form-control-plaintext" id="dvTeilzeittyp" :value="formatTeilzeittyp(item.teilzeittyp_kurzbz)">
                                            </div>
                                        </div>

                                        <div class="col-md-4">
                                                <template v-for="(item, index) in currentVBS.allIn"  >
                                                    <label  class="form-label" >AllIn</label>
                                                    <div class="col-sm-8">
                                                        <input class="form-check-input mt-2" type="checkbox" id="allInCheck" checked disabled>
                                                    </div>
                                                </template>
                                            </div>
                                    </div>
                                </template>
                            </div><!-- card-body -->
                        </div><!-- card -->

                        <!-- Zeitaufzeichnung -->
                        <div class="card mt-3">
                            <div class="card-header">
                                <h5 class="mb-0">Zeitaufzeichnung</h5>
                            </div>
                            <div class="card-body">
                                 <div class="col-md-12 py-3" v-if="currentVBS.zeitaufzeichnung.length == 0">
                                    Kein aktiver Vertragsbestandteil vorhanden.
                                </div>
                                <div class="row">
                                    <div class="col-md-4">
                                        <template v-for="(item, index) in currentVBS.zeitaufzeichnung"  >
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="zapflichtigCheck" :checked="item.zeitaufzeichnung" disabled>
                                                <label class="form-check-label" >Zeitaufzeichnungspflichtig</label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="azgCheck" :checked="item.azgrelevant" disabled>
                                                <label class="form-check-label" >AZG relevant</label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="homeofficeCheck" :checked="item.homeoffice" disabled>
                                                <label class="form-check-label" >Homeoffice</label>
                                            </div>
                                        </template>
                                    </div>
                                    <div class="col-md-8"></div>
                                </div>
                            </div><!-- card body -->
                        </div><!-- card -->

                        <!-- Sonstige Vereinbarung -->
                        <div class="card mt-3">
                            <div class="card-header">
                                <h5 class="mb-0">Sonstige Vereinbarung</h5>
                            </div>
                            <div class="card-body">
                                <div class="row g-3" v-if="currentDV != null">
                                    <div class="col-md-12 py-3" v-if="currentVBS.zusatzvereinbarung.length == 0">
                                        Kein aktiver Vertragsbestandteil vorhanden.
                                    </div>
                                    <template v-for="(item, index) in currentVBS.zusatzvereinbarung"  >
                                        <div class="col-md-3">
                                            <label class="form-label" >Freitexttyp</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext" :value="formatFreitexttyp(item.freitexttyp_kurzbz)" >
                                        </div>

                                        <div class="col-md-5">
                                            <label class="form-label" >Titel</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext" :value="item.titel" >
                                        </div>

                                        <div class="col-md-2">
                                            <label  class="form-label" >Von</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext"  :value="formatDate(item.von)">
                                        </div>

                                        <div class="col-md-2">
                                            <label class="form-label" >Bis</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext"  :value="formatDate(item.bis)">
                                        </div>

                                        <div class="col-md-12">
                                            <label class="form-label" >Text</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext"  :value="item.anmerkung">
                                        </div>
                                    </template>
                                </div>
                            </div><!-- card-body -->
                        </div><!-- card -->

                        <!-- Karenz -->
                        <div class="card mt-3">
                            <div class="card-header">
                                <h5 class="mb-0">Karenz</h5>
                            </div>
                            <div class="card-body">
                                <div class="row g-3" v-if="currentDV != null">
                                    <div class="col-md-12 py-3" v-if="currentVBS.karenz.length == 0">
                                        Kein aktiver Vertragsbestandteil vorhanden.
                                    </div>
                                    <template v-for="(item, index) in currentVBS.karenz"  >
                                        <div class="col-md-4">
                                            <label class="form-label" v-if="index==0" >Karenztyp</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext"  :value="formatKarenztyp(item.karenztyp_kurzbz)">
                                        </div>

                                        <div class="col-md-2">
                                            <label class="form-label" v-if="index==0" >Von</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext"  :value="formatDate(item.von)">
                                        </div>

                                        <div class="col-md-2">
                                            <label class="form-label" v-if="index==0" >Bis</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext"  :value="formatDate(item.bis)">
                                        </div>

                                        <div class="col-md-2">
                                            <label class="form-label" v-if="index==0" >Geplanter Geb.termin</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext"  :value="formatDate(item.geplanter_geburtstermin)">
                                        </div>

                                        <div class="col-md-2">
                                            <label class="form-label" v-if="index==0" >Tats. Geb.termin</label>
                                            <input  readonly class="form-control-sm form-control-plaintext" type="text" :value="formatDate(item.tatsaechlicher_geburtstermin)" >
                                        </div>
                                    </template>

                                </div>
                            </div>
                        </div>

                        <!-- Dokumente -->
                        <div class="card mt-3">
                            <div class="card-header">
                                <h5 class="mb-0">Dokumente</h5>
                            </div>
                            <div class="card-body">
                                <div class="col-md-12 py-3">
                                    Keine Dokumente vorhanden.
                                </div>
                            </div>
                        </div>

                        <!-- Notizen -->
                        <div class="card mt-3">
                            <div class="card-header">
                                <h5 class="mb-0">Notizen</h5>
                            </div>
                            <div class="card-body">
                               <div class="col-md-12 py-3">
                                    Keine Notizen vorhanden.
							   </div>
                            </div>
                        </div>

                    </div><!-- col-6 -->

                    <div class="col-6">
                        <!-- Zuordnung und Tätigkeit -->
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Zuordnung &amp; Tätigkeit</h5>
                            </div>
                            <div class="card-body">
                                <div class="row g-3" v-if="currentDV != null">
                                    <template v-for="(item, index) in currentVBS.funktion.zuordnung"  >

                                        <div class="col-md-4">
                                            <label class="form-label" v-if="index == 0" >Zuordnung</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext" :value="item.funktion_bezeichnung" >
                                        </div>

                                        <div class="col-md-6">
                                            <label class="form-label" v-if="index == 0">Organisationseinheit</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext"  :value="'[' + item.oe_typ_bezeichnung + '] ' + item.oe_bezeichnung">
                                        </div>

                                        <div class="col-md-2">
                                            <label class="form-label" v-if="index == 0">SAP Kostenstelle</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext" v-if="item.funktion_kurzbz == 'kstzuordnung' && item.oe_kurzbz_sap != null" :value="item.oe_kurzbz_sap">
                                        </div>

                                    </template>

                                    <div class="col-md-12 py-4" v-if="currentVBS.funktion.taetigkeit.length == 0">
                                        Keine aktive Tätigkeit vorhanden.
                                    </div>
                                    <template v-for="(item, index) in currentVBS.funktion.taetigkeit"  >

                                        <div class="col-md-4">
                                            <label class="form-label" v-if="index == 0" >Tätigkeit</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext" :value="item.funktion_bezeichnung" >
                                        </div>

                                        <div class="col-md-6">
                                            <label class="form-label" v-if="index == 0">Organisationseinheit</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext"  :value="'[' + item.oe_typ_bezeichnung + '] ' + item.oe_bezeichnung">
                                        </div>

                                        <div class="col-md-2">
                                        </div>

                                    </template>
                                </div>
                            </div><!-- card-body -->
                        </div><!-- card -->

                        <!-- Bruttomonatsgehalt  -->
                        <div class="card mt-3" v-if="hassalarypermission">
                            <div class="card-header">
								<div class="d-flex justify-content-between align-items-center">
									<div><h5 class="mb-0">Bruttomonatsgehalt</h5></div>
									<div v-if="!valorisationValid">
										<router-link :to="valorisationCheckPath"
											class="flex-sm-fill text-sm-start">
											Zur Valorisierungsprüfung
										</router-link>
									</div>
								</div>
                            </div>
                            <div class="card-body">
                                <div class="row g-3" v-if="currentDV != null">
                                    <div class="col-md-12 py-3" v-if="gbtList.length == 0">
                                        Kein aktiver Gehaltsbestandteil vorhanden.
                                    </div>
                                    <template v-for="(item, index) in gbtList"  >

                                        <div class="col-md-3">
                                            <label class="form-label" v-if="index==0" >Grund</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext"  :value="formatGBTGrund(item)">
                                        </div>

                                        <div class="col-md-2">
                                            <label class="form-label" v-if="index==0" >Gehaltstyp</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext"  :value="item?.gehaltstyp_bezeichnung">
                                        </div>

                                        <div class="col-md-2">
                                            <label class="form-label" v-if="index==0" >Betrag</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext"  :value="formatNumber(item.grund_betrag_decrypted)">
                                        </div>

                                        <div class="col-md-2">
                                            <label class="form-label" v-if="index==0" >Betrag val.</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext"  :value="formatNumber(item.betrag_val_decrypted)">
                                        </div>

                                        <div class="col-md-1">
                                            <label class="form-label" v-if="index==0" >Val.</label>
                                            <div class="col-sm-8">
                                                <input class="form-check-input" type="checkbox" :checked="item.valorisierung" disabled>
                                            </div>
                                        </div>

                                        <div class="col-md-2">
                                            <label class="form-label" v-if="index==0" >Anmerkung</label>
                                            <input type="text" readonly class="form-control-sm form-control-plaintext"  :value="truncate(item.anmerkung)">
                                        </div>

                                    </template>
                                </div>
                            </div><!-- card-body -->
                        </div> <!-- card -->

                        <!-- Gehalt -->
                        <div class="card mt-3" v-if="hassalarypermission">
                            <div class="card-header">
                                <h5 class="mb-0">Gehalt</h5>
                            </div>
                            <div class="card-body" style="text-align:center">
                                <div style="width:100%;height:100%;overflow:auto">
                                    <figure>
                                        <highcharts class="chart" :options="chartOptions"></highcharts>
                                    </figure>
                                </div>
                            </div><!-- card-body -->
                        </div><!-- card -->

                    </div>  <!-- col-6 -->
                </div>  <!-- row -->

            </div>
        </div>

    </div>

    <vbform_wrapper
        id="vbFormWrapper"
        ref="VbformWrapperRef"
        :title="'Dienstverhältnis'"
        :mode="vbformmode"
        :curdv="vbformDV"
        :mitarbeiter_uid="uid"
        @dvsaved="handleDvSaved">
    </vbform_wrapper>

    <ModalDialog title="Warnung" ref="confirmDeleteDVRef">
        <template #body>
            Dienstverhältnis wirklich löschen?
        </template>
    </ModalDialog>

    <enddvmodal
        ref="enddvmodalRef"
        :curdv="endDV"
        @dvended="handleDvEnded"
        @updateunruly="handleUpdateUnruly">
    </enddvmodal>

    <deletedvmodal
        ref="deletedvmodalRef"
        :curdv="delDV"
        @dvdeleted="handleDvDeleted">
    </deletedvmodal>

    <OffCanvasTimeline
        ref="offCanvasRef"
        @dateSelected="dateSelectedHandler"
        :curdv="currentDV"
        :alldv="dvList">
    </OffCanvasTimeline>

    <karenzmodal
        ref="karenzmodalRef"
        :curkarenz="curKarenz"
        @karenzsaved="handleKarenzSaved">
    </karenzmodal>
    `
}
