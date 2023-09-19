import { Modal } from '../Modal.js';
import { ModalDialog } from '../ModalDialog.js';
import { Toast } from '../Toast.js';


export const HourlyRateData = {
	components: {
		Modal,
		ModalDialog,
		Toast
	},
	props: {
		editMode: { type: Boolean, required: true },
		personID: { type: Number, required: true },
		personUID: { type: String, required: true },
		writePermission: { type: Boolean, required: false },
	},
	setup (props) {
		const { personID: currentPersonID , personUID: currentPersonUID  } = Vue.toRefs(props);

		const readonly = Vue.ref(false);
		const isFetching = Vue.ref(false);

		const hourlyRatedataList = Vue.ref([]);
		const dialogRef = Vue.ref();

		const types = Vue.inject('hourlyratetypes');
		const unternehmen = Vue.inject('unternehmen');

		const fetchData = async () => {
			if (currentPersonUID.value == null)
			{
				hourlyRatedataList.value = [];
				return;
			}
			isFetching.value = true

			try
			{
				const response = await Vue.$fhcapi.Stundensatz.getStundensaetze(currentPersonUID.value);
				hourlyRatedataList.value = response.data.retval;
			}
			catch (error)
			{
				console.log(error)
				isFetching.value = false;
			}
			finally
			{
				isFetching.value = false;
			}
		}

		const createShape = () => {
			return {
				stundensatz_id: 0,
				uid: currentPersonUID.value,
				stundensatztyp: "",
				stundensatz: "",
				oe_kurzbz: "",
				gueltig_von: "",
				gueltig_bis: "",
			}
		}

		const currentValue = Vue.ref(createShape());
		const preservedValue = Vue.ref(createShape());

		Vue.watch(currentPersonUID, (currentVal, oldVal) => {
			fetchData();
		});

		Vue.onMounted(() => {
			currentValue.value = createShape();
			fetchData();
		})

		const houryratedataListArray = Vue.computed(() => (hourlyRatedataList.value ? Object.values(hourlyRatedataList.value) : []));

		// Modal
		const modalRef = Vue.ref();
		const confirmDeleteRef = Vue.ref();

		const showAddModal = () => {
			currentValue.value = createShape();
			// reset form state
			frmState.beginnBlurred=false;
			frmState.bisBlurred=false;
			frmState.typBlurred=false;
			frmState.satzBlurred=false;
			frmState.unternehmenBlurred=false;
			// call bootstrap show function
			modalRef.value.show();
		}

		const hideModal = () => {
			modalRef.value.hide();
		}

		const showEditModal = (id) => {
			currentValue.value = { ...hourlyRatedataList.value[id] };
			modalRef.value.show();
		}

		const showDeleteModal = async (id) => {
			currentValue.value = { ...hourlyRatedataList.value[id] };
			const ok = await confirmDeleteRef.value.show();

			if (ok)
			{
				try {
					const res = await Vue.$fhcapi.Stundensatz.deleteStundensatz(id);

					if (res.data.error === 0)
					{
						delete hourlyRatedataList.value[id];
						showDeletedToast();
					}
				} catch (error) {
					console.log(error)
				} finally {
					isFetching.value = false
				}
			}
		}

		const okHandler = async () => {
			if (validate())
			{
				try {
					const r = await Vue.$fhcapi.Stundensatz.updateStundensatz(currentValue.value);
					if (r.data.error === 0)
					{
						hourlyRatedataList.value[r.data.retval[0].stundensatz_id] = r.data.retval[0];
						preservedValue.value = currentValue.value;
						showToast();
					}
				}
				catch (error)
				{
					console.log(error)
				}
				finally
				{
					isFetching.value = false
				}

				hideModal();
			}
			else
			{
				console.log("form invalid");
			}
		}

		// -------------
		// form handling
		// -------------

		const houryrateDataFrm = Vue.ref();

		const frmState = Vue.reactive({ beginnBlurred: false, typBlurred: false, bisBlurred: false, satzBlurred: false, unternehmenBlurred: false,  wasValidated: false });

		const validBeginn = (n) => {
			return !!n && n.trim() != "";
		}

		const validInput = (input) => {
			if (input === undefined || input === '')
				return false;
			else
				return true;
		}

		const checkDates = (beginn, ende) => {

			if (beginn !== '' && ende !== '' && ende !== null && beginn !== null)
			{
				beginn = new Date(beginn);
				ende = new Date(ende);

				if (ende >= beginn)
				{
					frmState.bisBlurred = false;
					return true;
				}
				else
				{
					frmState.bisBlurred = true;
					return false;
				}
			}
			else
			{
				frmState.bisBlurred = false;
				return true;
			}

		}


		const validate = () => {
			frmState.beginnBlurred = true;
			frmState.typBlurred = true;
			frmState.satzBlurred = true;
			frmState.unternehmenBlurred = true;
			if (validBeginn(currentValue.value.gueltig_von) &&
				validInput(currentValue.value.stundensatz) &&
				validInput(currentValue.value.stundensatztyp) &&
				validInput(currentValue.value.oe_kurzbz) &&
				checkDates(currentValue.value.gueltig_von, currentValue.value.gueltig_bis)
			) {
				return true;
			}
			return false;
		}

		const formatDate = (d) => {
			if (d != null && d != '') {
				return d.substring(8, 10) + "." + d.substring(5, 7) + "." + d.substring(0, 4);
			} else {
				return ''
			}
		}

		// Toast
		const toastRef = Vue.ref();
		const deleteToastRef = Vue.ref();

		const showToast = () => {
			toastRef.value.show();
		}

		const showDeletedToast = () => {
			deleteToastRef.value.show();
		}

		return {
			hourlyRatedataList,
			houryratedataListArray,
			currentValue,
			readonly,
			frmState,
			dialogRef,
			toastRef,
			deleteToastRef,
			houryrateDataFrm,
			modalRef,
			types,
			unternehmen,

			validBeginn, validInput, checkDates, formatDate,
			showToast, showDeletedToast,
			showAddModal, hideModal, okHandler,
			showDeleteModal, showEditModal, confirmDeleteRef,
		}
	},
	template: `
	<div class="row">

		<div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
		  <Toast ref="toastRef">
			<template #body><h4>Stundensätze gespeichert.</h4></template>
		  </Toast>
		</div>

		<div class="toast-container position-absolute top-0 end-0 pt-4 pe-2">
			<Toast ref="deleteToastRef">
				<template #body><h4>Stundensätze gelöscht.</h4></template>
			</Toast>
		</div>
	</div>
	<div class="row pt-md-4">
		 <div class="col">
			 <div class="card">
				<div class="card-header">
					<div class="h5"><h5>Stundensätze</h5></div>        
				</div>

				<div class="card-body">
					<div class="d-grid gap-2 d-md-flex justify-content-end ">
						<button type="button" class="btn btn-sm btn-outline-secondary" @click="showAddModal()">
						<i class="fa fa-plus"></i>
						</button>
					</div>
					<div class="table-responsive">
						<table class="table table-hover table-sm">
							<thead>                
							<tr>
								<th scope="col">Typ</th>
								<th scope="col">Gültig von</th>
								<th scope="col">Gültig bis</th>
								<th scope="col">Unternehmen</th>
								<th scope="col">Stundensatz</th>
							</tr>
							</thead>
							<tbody>
							<tr v-for="hourlyratedata in houryratedataListArray" :key="hourlyratedata.stundensatz_id">
								<td class="align-middle">{{ hourlyratedata.stundensatztyp }}</td>
								<td class="align-middle">{{ formatDate(hourlyratedata.gueltig_von) }}</td>
								<td class="align-middle">{{ formatDate(hourlyratedata.gueltig_bis) }}</td>
								<td class="align-middle">{{ hourlyratedata.oe_kurzbz }}</td>
								<td class="align-middle">{{ hourlyratedata.stundensatz }}</td>
								<td class="align-middle" width="5%">
									<div class="d-grid gap-2 d-md-flex align-middle">
										<button type="button" class="btn btn-outline-dark btn-sm" @click="showDeleteModal(hourlyratedata.stundensatz_id)">
											<i class="fa fa-minus"></i>
										</button>
										<button type="button" class="btn btn-outline-dark btn-sm" @click="showEditModal(hourlyratedata.stundensatz_id)">
											<i class="fa fa-pen"></i>
										</button>
									</div>
								</td>
							</tr>
							</tbody>
						</table>            
					</div>
				</div>
			 </div>
		 </div>
	</div>

	<!-- detail modal -->
	<Modal title="Stundensatz" ref="modalRef">
		<template #body>
			<form class="row g-3" ref="houryrateDataFrm">
							
				<div class="col-md-8">
					<label for="stundensatztyp" class="required form-label">Typ</label><br>
					<select v-if="!readonly" id="stundensatztyp" @blur="frmState.typBlurred = true"  :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validInput(currentValue.stundensatztyp) && frmState.typBlurred}" v-model="currentValue.stundensatztyp" class="form-select form-select-sm" aria-label=".form-select-sm " >
						<option v-for="(item, index) in types" :value="item.stundensatztyp">
							{{ item.bezeichnung }}
						</option>                       
					</select>
					<input v-else type="text" readonly class="form-control-sm form-control-plaintext" id="stundensatztyp" :value="currentValue.stundensatztyp">
				</div>
				<div class="col-md-4"></div>
				<div class="col-md-4">
					<label for="beginn" class="required form-label">Von</label>
					<input type="date" :readonly="readonly" @blur="frmState.beginnBlurred = true" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validBeginn(currentValue.gueltig_von) && frmState.beginnBlurred}" id="beginn" v-model="currentValue.gueltig_von">
				</div>
				<div class="col-md-4">
					<label for="ende" class="form-label">Bis</label>
					<input type="date" :readonly="readonly" @blur="frmState.bisBlurred = true" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !checkDates(currentValue.gueltig_von, currentValue.gueltig_bis) && frmState.bisBlurred}" id="ende" v-model="currentValue.gueltig_bis">
				</div>
				<div class="col-md-4">
				</div>
				<!-- -->
			   <div class="col-md-4">
					<label for="stundensatz" class="required form-label">Stundensatz</label>
					<input type="number" :readonly="readonly" @blur="frmState.satzBlurred = true" class="form-control-sm" :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validInput(currentValue.stundensatz) && frmState.satzBlurred}" id="stundensatz" v-model="currentValue.stundensatz">
				</div>
			  
			   <div class="col-md-4">
					<label for="unternehmen" class="required form-label">Unternehmen</label><br>
					<select v-if="!readonly" id="unternehmen" @blur="frmState.unternehmenBlurred = true"  :class="{ 'form-control-plaintext': readonly, 'form-control': !readonly, 'is-invalid': !validInput(currentValue.oe_kurzbz) && frmState.unternehmenBlurred}" v-model="currentValue.oe_kurzbz" class="form-select form-select-sm" aria-label=".form-select-sm " >
						<option v-for="(item, index) in unternehmen" :value="item.value">
							{{ item.label }}
						</option>                       
					</select>
					<input v-else type="text" readonly class="form-control-sm form-control-plaintext" id="unternehmen" :value="currentValue.oe_kurzbz">
				</div>
			   
				
				<!-- changes -->
				<div class="col-8">
					<div class="modificationdate">{{ currentValue.insertamum }}/{{ currentValue.insertvon }}, {{ currentValue.updateamum }}/{{ currentValue.updatevon }}</div>
				</div>
				
			</form>
		</template>
		<template #footer>
			<button type="button" class="btn btn-secondary" @click="hideModal()">
				Abbrechen
			</button>
			<button type="button" class="btn btn-primary" @click="okHandler()" >
				OK
			</button>
		</template>

	</Modal>

	<ModalDialog title="Warnung" ref="dialogRef">
	  <template #body>
		Stundensätze schließen? Geänderte Daten gehen verloren!
	  </template>
	</ModalDialog>

	<ModalDialog title="Warnung" ref="confirmDeleteRef">
		<template #body>
			Stundensatz mit dem Typ '{{ currentValue?.stundensatztyp }}' ({{ currentValue?.gueltig_von }}<span v-if="currentValue?.gueltig_bis"> - {{ currentValue?.gueltig_bis }}</span>) wirklich löschen?
		</template>
	</ModalDialog>
	`
}