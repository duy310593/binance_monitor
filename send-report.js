const axios = require('axios');

const nodemailer = require('nodemailer');

const { Spot } = require('@binance/connector');

const apiKey = 'mHSCoy8G9MjarsDZZwmmVSAm7nM6jftpwSAezhDU2VlcMLKtir4MQiSqWDpUBsmk';

const apiSecret = '3kD49Kzhl34WkNuaEOMK8PeYWoMn5xah8YlMwDPueQv07hP33uK4Ytn0WrD9IXny';

const client = new Spot(apiKey, apiSecret);

let getSpotBTC = new Promise(resolve => {
    client.accountSnapshot('SPOT', {limit: 7}).then(response => {
        const lastData = response.data.snapshotVos.pop();
        resolve(lastData.data.totalAssetOfBtc);
    });
});

let getFuturesUSDT = new Promise(resolve => {
    client.accountSnapshot('FUTURES', {limit: 7}).then(response => {
        const lastData = response.data.snapshotVos.pop();
        resolve(lastData.data.assets.filter(i => i.asset === 'USDT')[0].walletBalance);
    });
});

let getFundingUSDT = new Promise(resolve => {
    client.fundingWallet().then(response => {
        resolve(response.data.filter(i => i.asset === 'USDT')[0].free);
    });
});

let convertUSDTVND = function (usdt) {
    return new Promise(resolve => {
        axios.get('https://aliniex.com/api/ticker/USDT-VND').then((response) => {
            resolve(parseFloat(usdt) * response.data.ask);
        });
    });
};

let convertBTCVND = function (btc) {
    return new Promise(resolve => {
        axios.get('https://aliniex.com/api/ticker/BTC-VND').then((response) => {
            resolve(parseFloat(btc) * response.data.ask);
        });
    });
};

let spot = getSpotBTC.then((btc) => {
    return convertBTCVND(btc);
});

let futures = getFuturesUSDT.then((usdt) => {
    return convertUSDTVND(usdt);
});

let funding = getFundingUSDT.then((usdt) => {
    return convertUSDTVND(usdt);
});

Promise.all([spot, futures, funding]).then((data) => {
    console.log('TODAY:', (new Date()).toLocaleDateString("vi-VN", {timeZone: "Asia/Ho_Chi_Minh"}) + ' 6:59:59 AM GMT+07:00');
    console.log('####################################');
    console.log('SPOT:', data[0].toLocaleString('en-US', {style : 'currency', currency : 'VND'}));
    console.log('FUTURES:', data[1].toLocaleString('en-US', {style : 'currency', currency : 'VND'}));
    console.log('FUNDING:', data[2].toLocaleString('en-US', {style : 'currency', currency : 'VND'}));
    console.log('####################################');
    console.log('TOTAL:', (data[0] + data[1] + data[2]).toLocaleString('en-US', {style : 'currency', currency : 'VND'}));

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'duy310593@gmail.com',
            pass: '395013yuD'
        }
    });

    let mailOptions = {
        from: 'duy310593@gmail.com',
        to: 'pecipe4647@ztymm.com',
        subject: '[DUYPN] Binance Wallet ' + (new Date()).toLocaleDateString("vi-VN", {timeZone: "Asia/Ho_Chi_Minh"}),
        html: '<p>' +
            '<b>TODAY:</b> ' + (new Date()).toLocaleDateString("vi-VN", {timeZone: "Asia/Ho_Chi_Minh"}) + ' 6:59:59 AM GMT+07:00' + '<br/><br/>' +
            '####################################' + '<br/><br/>' +
            '<b>SPOT:</b> ' + data[0].toLocaleString('en-US', {style : 'currency', currency : 'VND'}) + '<br/>' +
            '<b>FUTURES:</b> ' + data[1].toLocaleString('en-US', {style : 'currency', currency : 'VND'}) + '<br/>' +
            '<b>FUNDING:</b> ' + data[2].toLocaleString('en-US', {style : 'currency', currency : 'VND'}) + '<br/><br/>' +
            '####################################' + '<br/><br/>' +
            '<b>TOTAL:</b> ' + (data[0] + data[1] + data[2]).toLocaleString('en-US', {style : 'currency', currency : 'VND'}) + '<br/>' +
            '</p>'
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
        console.log('>');
    });
});
