export const validSVNR = (svnr) => {
    const weight = [3, 7, 9, 5, 8, 4, 2, 1, 6 ];
    if (svnr == undefined || svnr == '') return true;

    if (svnr.length != 10) return false;
//            var date_regex = /^(((0[1-9]|[12]|[13]\d|3[01])(0[13578]|1[02])(\d{2}))|((0[1-9]|[12]|[13]\d|30)(0[13456789]|1[012])(\d{2}))|((0[1-9]|1\d|2[0-8])02(\d{2}))|(2902((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|(([1][26]|[2468][048]|[3579][26])00))))$/gm;
    // extract date
    var datum = svnr.substring(4);
    console.log('datum = ',datum);                   

    var nummer = svnr.substring(0,3);
    console.log('nummer:',nummer);

    var pruefzahl = svnr.substring(3,4);
    console.log('pruefzahl:', pruefzahl);
    
    let isValid = true; //date_regex.test(datum);

    if(isValid){   
        // calc checksum
        let sum = 0;
        let svnr_raw = nummer + datum;

        for (var i = 0; i < 9; i++) {
            let prod = parseInt(svnr_raw.charAt(i)) * weight[i];
            sum += prod;
        }

        let rest = sum % 11;
        console.log('rest:', rest);

        if (rest == pruefzahl) return true;
    } else {
        console.log('svnr datum invalid');
    }
    return false;
}