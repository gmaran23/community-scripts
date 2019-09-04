// IBAN finder by https://renouncedthoughts.wordpress.com
// Heavily inspired by Find Emails.js
// Regex evaluated at https://regexr.com/4kb6e
// Tested against sample vulnerable page https://neverwind.azurewebsites.net/Admin/Download/Get
// Runs as a part of nightly baseline scans in many DevSecOps environments
// Complements the Pluralsight course - Writing Custom Scripts for OWASP Zed Attack Proxy

function scan(ps, msg, src) {
    // first lets set up some details incase we find an IBAN, these will populate the alert later
    alertRisk = 1
    alertReliability = 3
    alertTitle = 'IBAN found - investigation required (script)'
    alertDesc = 'IBAN numbers were found'
    alertSolution = 'Investigate IBAN numbers found in the response, remove or mask as required'
    cweId = 200
    wascId = 0

	// lets build a regular expression that can find IBAN addresses
	// the regex must appear within /( and )/g
    re = /([A-Za-z]{2}[0-9]{2}[A-Za-z]{4}[0-9]{10})/g

	// we need to set the url variable to the request or we cant track the alert later
    url = msg.getRequestHeader().getURI().toString();

	// lets check its not one of the files types that are never likely to contain stuff, like pngs and jpegs
     contenttype = msg.getResponseHeader().getHeader("Content-Type")
	unwantedfiletypes = ['image/png', 'image/jpeg','image/gif','application/x-shockwave-flash','application/pdf']
	
	if (unwantedfiletypes.indexOf(""+contenttype) >= 0) {
		// if we find one of the unwanted headers quit this scan, this saves time and reduces false positives
    		return
	}else{
	// now lets run our regex against the body response
        body = msg.getResponseBody().toString()
        if (re.test(body)) {
            re.lastIndex = 0 // After testing reset index
            // Look for IBAN addresses
            var foundIBAN = []
            while (comm = re.exec(body)) {
                foundIBAN.push(comm[0]);
            }
		  // woohoo we found an IBAN lets make an alert for it
            ps.raiseAlert(alertRisk, alertReliability, alertTitle, alertDesc, url, '', '', foundIBAN.toString(), alertSolution, foundIBAN.toString(), cweId, wascId, msg);
        }
    }
}
