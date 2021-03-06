import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';

import React, {Fragment, useEffect, useState} from "react";

import axios from "axios";

function App() {

    const [prePriceChange, setPrePriceChange] = useState([]);

    const [currentPriceChange, setCurrentPriceChange] = useState([]);

    const [resultPercentData, setResultPercentData] = useState([]);

    const [resultPriceData, setResultPriceData] = useState([]);

    const [timestamp, setTimestamp] = useState(Date.now());

    useEffect(() => {
        Notification.requestPermission().then();

        setInterval(() => {
            setTimestamp(Date.now());
        }, 1000*60*5);

        setInterval(() => {
            var data = new FormData();

            data.append('title', 'GOTIFY SYSTEM');
            data.append('message', 'IS RUNNING');
            data.append('priority', 0);

            axios.post('http://18.116.234.155:5000/message?token=AJemvXYpZeL2iVR', data).then(() => {
                console.log('GOTIFY SYSTEM is running.');
            }).catch((error) => {
                console.log(error.message);
            });
        }, 1000*60*30);
    }, []);

    useEffect(() => {
        var notificationMessage = '###BINANCE MONITOR###';

        notificationMessage += '\r\r#########PERCENT#########\r\r';

        var percentData = prePriceChange.sort((a, b) => {
            if (currentPriceChange.filter(k => b.symbol === k.symbol).length) {
                return Math.abs(currentPriceChange.filter(k => b.symbol === k.symbol)[0].priceChangePercent - b.priceChangePercent) - Math.abs(currentPriceChange.filter(k => a.symbol === k.symbol)[0].priceChangePercent - a.priceChangePercent)
            } else {
                return 0;
            }
        }).slice(0, 5).map((i, iIndex) => {
            let value1 = Math.abs(currentPriceChange.filter(j => i.symbol === j.symbol)[0].priceChangePercent - i.priceChangePercent).toFixed(3);
            let value2 = (Math.abs(currentPriceChange.filter(j => i.symbol === j.symbol)[0].lastPrice - i.lastPrice) / i.lastPrice * 100).toFixed(3);
            notificationMessage += i.symbol + '\r' + '\t\t\t\t\t\t\t\t\t\t\t\t\t' + value1 + ' | ' + value2 + (iIndex !== 4 ? '\r\r' : '');
            return {
                symbol: i.symbol,
                value1: value1,
                value2: value2
            }
        });

        notificationMessage += '\r\r#########PRICE#########\r\r';

        var priceData = prePriceChange.sort((a, b) => {
            if (currentPriceChange.filter(k => b.symbol === k.symbol).length) {
                return (Math.abs(currentPriceChange.filter(k => b.symbol === k.symbol)[0].lastPrice - b.lastPrice) / b.lastPrice * 100) - (Math.abs(currentPriceChange.filter(k => a.symbol === k.symbol)[0].lastPrice - a.lastPrice) / a.lastPrice * 100)
            } else {
                return 0;
            }
        }).slice(0, 5).map((i, iIndex) => {
            let value1 = Math.abs(currentPriceChange.filter(j => i.symbol === j.symbol)[0].priceChangePercent - i.priceChangePercent).toFixed(3);
            let value2 = (Math.abs(currentPriceChange.filter(j => i.symbol === j.symbol)[0].lastPrice - i.lastPrice) / i.lastPrice * 100).toFixed(3);
            notificationMessage += i.symbol + '\r' + '\t\t\t\t\t\t\t\t\t\t\t\t\t' + value1 + ' | ' + value2 + (iIndex !== 4 ? '\r\r' : '');
            return {
                symbol: i.symbol,
                value1: value1,
                value2: value2
            }
        });

        setResultPercentData(percentData);
        setResultPriceData(priceData);

        var lowPriceData = priceData.filter(i => i.value2 >= 2 && i.value2 < 4);

        var normalPriceData = priceData.filter(i => i.value2 >= 4 && i.value2 < 6);

        var highPriceData = priceData.filter(i => i.value2 >= 6);

        if (lowPriceData.length) {
            lowPriceData.forEach(i => {
                var data = new FormData();

                data.append('title', 'BINANCE MONITOR [LOW]');
                data.append('message', i.symbol + ': ' + i.value1 + ' | ' + i.value2);
                data.append('priority', 1);

                axios.post('http://18.116.234.155:5000/message?token=ApgHgxPk9xvo9.6', data).then(() => {
                    console.log(i.symbol + ': ' + i.value1 + ' | ' + i.value2);
                }).catch((error) => {
                    console.log(error.message);
                });
            });
        }

        if (normalPriceData.length) {
            normalPriceData.forEach(i => {
                var data = new FormData();

                data.append('title', 'BINANCE MONITOR [NORMAL]');
                data.append('message', i.symbol + ': ' + i.value1 + ' | ' + i.value2);
                data.append('priority', 4);

                axios.post('http://18.116.234.155:5000/message?token=ApgHgxPk9xvo9.6', data).then(() => {
                    console.log(i.symbol + ': ' + i.value1 + ' | ' + i.value2);
                }).catch((error) => {
                    console.log(error.message);
                });
            });
        }

        if (highPriceData.length) {
            highPriceData.forEach(i => {
                var data = new FormData();

                data.append('title', 'BINANCE MONITOR [HIGH]');
                data.append('message', i.symbol + ': ' + i.value1 + ' | ' + i.value2);
                data.append('priority', 8);

                axios.post('http://18.116.234.155:5000/message?token=ApgHgxPk9xvo9.6', data).then(() => {
                    console.log(i.symbol + ': ' + i.value1 + ' | ' + i.value2);
                }).catch((error) => {
                    console.log(error.message);
                });
            });
        }

        if (window.Notification && Notification.permission === 'granted') {
            try {
                new Notification(notificationMessage);
            } catch (error) {
                console.log(error);
            }
        };
    }, [currentPriceChange]);

    useEffect(() => {
        getData();
    }, [timestamp]);

    function getData() {
        axios.get('https://www.binance.com/fapi/v1/ticker/24hr').then((response) => {
            let priceChange = response.data.map(i => ({
                symbol: i.symbol,
                priceChangePercent: i.priceChangePercent,
                lastPrice: i.lastPrice
            }));

            if (prePriceChange.length === 0) {
                setPrePriceChange(priceChange);
            } else {
                setPrePriceChange(currentPriceChange);
            }

            setCurrentPriceChange(priceChange);
        }).catch((error) => {
            console.log(error);
        });
    }

    return (
        <div className="App">
            <header className="App-header">
                <img src="https://gcdn.pbrd.co/images/MXho7UMaA6te.png" className="App-logo" alt="logo" style={{
                    filter: 'hue-rotate(15deg)'
                }}/>
                <h3>Binance Monitor</h3>
                <hr/>
                {React.useMemo(() => (resultPercentData.length !== 0) && <div className="row" style={{
                    padding: '0 32px',
                    width: '100%',
                    maxWidth: '768px'
                }}>
                    <div className="col-12">PERCENT</div>
                    {resultPercentData.map((i, iIndex) => <Fragment key={iIndex}>
                        <div className="col-6 text-start">{i.symbol}</div>
                        <div className="col-6 text-end" style={{
                            textShadow: i.value1 > 5 ? (i.value1 > 10 ? (i.value1 > 15 ? '0 0 4px #ff0080, 0 0 11px #ff0080, 0 0 19px #ff0080' : '0 0 4px #e300ff, 0 0 11px #e300ff, 0 0 19px #e300ff') : '0 0 4px #00edff, 0 0 11px #00edff, 0 0 19px #00edff') : 'none'
                        }}>{i.value1} | {i.value2}</div>
                    </Fragment>)}
                </div>, [timestamp, resultPercentData])}
                {React.useMemo(() => (resultPriceData.length !== 0) && <div className="row" style={{
                    padding: '0 32px',
                    width: '100%',
                    maxWidth: '768px'
                }}>
                    <div className="col-12">PRICE</div>
                    {resultPriceData.map((i, iIndex) => <Fragment key={iIndex}>
                        <div className="col-6 text-start">{i.symbol}</div>
                        <div className="col-6 text-end" style={{
                            textShadow: i.value2 > 2 ? (i.value2 > 4 ? (i.value2 > 6 ? '0 0 4px #ff0080, 0 0 11px #ff0080, 0 0 19px #ff0080' : '0 0 4px #e300ff, 0 0 11px #e300ff, 0 0 19px #e300ff') : '0 0 4px #00edff, 0 0 11px #00edff, 0 0 19px #00edff') : 'none'
                        }}>{i.value1} | {i.value2}</div>
                    </Fragment>)}
                </div>, [timestamp, resultPriceData])}
            </header>
        </div>
    );
}

export default App;
