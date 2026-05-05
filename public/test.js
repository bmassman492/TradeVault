// public/test.js

import * as API from './api.js';

const triggers = await API.GetGoldenCrossTriggers('AAPL');
console.log('Golden Cross triggers for AAPL:', triggers);

for (const { date } of triggers) {
    const d     = date.slice(0, 10);
    const entry = await API.GetStockDayPrice('AAPL', d);
    const exit  = await API.GetFutureStockDayPrice('AAPL', d, 30);
    console.log(d, '| entry:', entry[0]?.mean_price, '| exit (+30):', exit[0]?.mean_price);
}
