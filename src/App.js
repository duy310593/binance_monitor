import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';

import React, {Fragment, useEffect, useState} from "react";

import axios from "axios";

function App() {

    const [prePriceChange, setPrePriceChange] = useState([]);

    const [currentPriceChange, setCurrentPriceChange] = useState([]);

    const [resultData, setResultData] = useState([]);

    const [timestamp, setTimestamp] = useState(Date.now());

    useEffect(() => {
        Notification.requestPermission().then();

        setInterval(() => {
            setTimestamp(Date.now());
        }, 1000*50*6);
    }, []);

    useEffect(() => {
        var notificationMessage = '###BINANCE MONITOR###\r\r';

        var data = prePriceChange.sort((a, b) => {
            return Math.abs(currentPriceChange.filter(k => b.symbol === k.symbol)[0].priceChangePercent - b.priceChangePercent) - Math.abs(currentPriceChange.filter(k => a.symbol === k.symbol)[0].priceChangePercent - a.priceChangePercent)
        }).slice(0, 5).map((i, iIndex) => {
            let value = Math.abs(currentPriceChange.filter(j => i.symbol === j.symbol)[0].priceChangePercent - i.priceChangePercent).toFixed(3);
            notificationMessage += i.symbol + '\r' + '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t' + value + (iIndex !== 4 ? '\r\r' : '');
            return {
                symbol: i.symbol,
                value: value
            }
        });

        setResultData(data);

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
                priceChangePercent: i.priceChangePercent
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
                {React.useMemo(() => (resultData.length !== 0) && <div className="row" style={{
                    padding: '0 32px'
                }}>
                    {resultData.map((i, iIndex) => <Fragment key={iIndex}>
                        <div className="col-6 text-start">{i.symbol}</div>
                        <div className="col-6 text-end" style={{
                            textShadow: i.value > 5 ? (i.value > 10 ? (i.value > 15 ? '0 0 4px #ff0080, 0 0 11px #ff0080, 0 0 19px #ff0080' : '0 0 4px #e300ff, 0 0 11px #e300ff, 0 0 19px #e300ff') : '0 0 4px #00edff, 0 0 11px #00edff, 0 0 19px #00edff') : 'none'
                        }}>{i.value}</div>
                    </Fragment>)}
                </div>, [timestamp, resultData])}
            </header>
        </div>
    );
}

export default App;
