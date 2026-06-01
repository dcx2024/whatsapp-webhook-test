const https = require('https')

function paystackRequest({ method, path, params = {} }, secretKey) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(params);

        const options = {
            hostname: 'api.paystack.co',
            port: 443,
            path: path,                     //  FIXED: Now dynamic
            method: method.toUpperCase(),   //  FIXED: Now dynamic
            headers: {
                Authorization: `Bearer ${secretKey}`,
                'Content-Type': 'application/json'
            }
        }

        // Only calculate content length for write requests to avoid empty header issues
        if (['POST', 'PUT', 'PATCH'].includes(options.method)) {
            options.headers['Content-Length'] = Buffer.byteLength(data);
        }

        const req = https.request(options, res => {
            let responseBody = ''

            res.on('data', (chunk) => {
                responseBody += chunk
            });

            res.on('end', () => {
                try {
                    const result = JSON.parse(responseBody);
                    resolve(result);
                } catch (error) {
                    reject(new Error('Invalid JSON response: ' + responseBody));
                }
            })
        })

        req.on('error', error => {
            reject(error)
        })

        if (['POST', 'PUT', 'PATCH'].includes(options.method)) {
            req.write(data);
        }

        req.end();
    })  
}

function initializeTransaction(secretKey, params) {
    return paystackRequest({
        method: 'POST',
        path: '/transaction/initialize',
        params
    }, secretKey)
}

function fetchBanks(secretKey) {
    return paystackRequest({
        method: 'GET',
        path: '/bank'
    }, secretKey)
}

function confirmAccount(secretKey, acctNumber, bankCode) {
    const query = `/bank/resolve?account_number=${encodeURIComponent(acctNumber)}&bank_code=${encodeURIComponent(bankCode)}`;
    return paystackRequest({
        method: 'GET',
        path: query
    }, secretKey);
}

function createTransferRecipient(secretKey, params) {
    return paystackRequest({
        method: 'POST',
        path: '/transferrecipient',
        params //  FIXED: Added missing params mapping
    }, secretKey)
}

function transfer(secretKey, params){
    return paystackRequest({
        method: 'POST',
        path: '/transfer',
        params //  FIXED: Added missing params mapping
    }, secretKey) //  FIXED: Passed secretKey
}

function finalizeTransfer(secretKey, params){
    return paystackRequest({
        method: 'POST',
        path: '/transfer/finalize_transfer',
        params //  FIXED: Added missing params mapping
    }, secretKey) //  FIXED: Passed secretKey
}

module.exports = {
    initializeTransaction,
    fetchBanks,
    confirmAccount,
    createTransferRecipient,
    transfer,
    finalizeTransfer
}