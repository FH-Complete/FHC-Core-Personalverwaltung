export const formatter = {
	formatDateGerman: function(date) {
		if (typeof date == 'undefined') return '';

		const re = /([0-9]{4})-([0-9]{2})-([0-9]{2})/;
		var matches = null;

		if( null !== date && null !== (matches = date.match(re)) ) {
			return matches[3] + '.' + matches[2] + '.' + matches[1];
		} else {
			return date;
		}
	},
	formatCurrencyGerman: function(amount) {
		return new Intl.NumberFormat(
			"de-DE",
			{ minimumFractionDigits: 2, maximumFractionDigits: 2 }
		).format(amount);
	}
}
