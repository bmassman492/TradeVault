import * as API from '../api.js';

export let strategyName = null;
export let strategyId   = null;
export let stockID = null;
export let positionDays = null;

const strategyIdMap = {};

// Price data only goes up to ~April 2026; exclude triggers whose exit date would land on or after this.
const DATA_CUTOFF = new Date('2026-04-01');

// Map strategy name keywords to their trigger API function.
function getTriggerFn(name) {
    const n = name.toLowerCase();
    if (n.includes('bullish'))  return ticker => API.GetBullishEngulfingTriggers(ticker);
    if (n.includes('inside'))   return ticker => API.GetInsideBarTriggers(ticker);
    if (n.includes('outside'))  return ticker => API.GetOutsideBarTriggers(ticker);
    if (n.includes('golden'))   return ticker => API.GetGoldenCrossTriggers(ticker);
    if (n.includes('pullback')) return ticker => API.GetMAPullbackTriggers(ticker);
    if (n.includes('rsi'))      return ticker => API.GetRSI14Triggers(ticker);
    return null;
}

// Returns false if trigger date + positionDays trading days would reach April 2026.
// Trading days ≈ calendar days × (5/7); multiply by 1.5 for a safe buffer.
function isBeforeCutoff(dateStr, days) {
    const d = new Date(dateStr.slice(0, 10));
    d.setDate(d.getDate() + Math.ceil(days * 1.5));
    return d < DATA_CUTOFF;
}

async function runBacktest() {
    if (!strategyName || !stockID || !positionDays) {
        showResult('Please fill in all three fields before testing.');
        return;
    }

    const triggerFn = getTriggerFn(strategyName);
    if (!triggerFn) {
        showResult(`Could not match "${strategyName}" to a trigger function.`);
        return;
    }

    const btn = document.getElementById('test-strategy-btn');
    btn.disabled = true;
    btn.textContent = 'Running...';
    showResult('');

    try {
        const triggers = await triggerFn(stockID);
        const valid = triggers.filter(t => isBeforeCutoff(t.date, positionDays));

        if (valid.length === 0) {
            showResult('No valid trigger dates found — try a shorter hold period or different stock.');
            return;
        }

        const results = await Promise.all(
            valid.map(async ({ date }) => {
                const d = date.slice(0, 10);
                const [entry, exit] = await Promise.all([
                    API.GetStockDayPrice(stockID, d),
                    API.GetFutureStockDayPrice(stockID, d, positionDays)
                ]);
                return {
                    entryPrice: entry[0]?.mean_price,
                    exitPrice:  exit[0]?.mean_price
                };
            })
        );
        console.log(results);
        const priced = results.filter(r => r.entryPrice != null && r.exitPrice != null);
        const wins   = priced.filter(r => r.exitPrice > r.entryPrice).length;
        const pct    = priced.length > 0 ? ((wins / priced.length) * 100).toFixed(1) : 0;

        showResult(
            `${wins} / ${priced.length} triggers profitable — ${pct}% win rate` +
            (priced.length < valid.length
                ? ` (${valid.length - priced.length} trigger(s) excluded due to missing price data)`
                : '')
        );
    } catch (err) {
        showResult('Error running backtest. Check the console for details.');
        console.error(err);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Test Strategy';
    }
}

function showResult(text) {
    document.getElementById('backtest-result').textContent = text;
    document.getElementById('result-description').value = text;
}

async function saveResult() {
    const userId = parseInt(sessionStorage.getItem('userId'));
    const name   = document.getElementById('result-name').value.trim();
    const description = document.getElementById('result-description').value;
    const notes  = document.getElementById('result-notes').value;

    if (!userId)      return showSaveStatus('You must be logged in to save.');
    if (!strategyId)  return showSaveStatus('Run a backtest first.');
    if (!name)        return showSaveStatus('Please enter a name.');
    if (!description) return showSaveStatus('Run a backtest first.');

    const btn = document.getElementById('save-result-btn');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
        await API.AddResult(userId, strategyId, name, description, notes);
        showSaveStatus('Result saved successfully.');
        document.getElementById('result-name').value = '';
        document.getElementById('result-notes').value = '';
        window.dispatchEvent(new CustomEvent('result-saved'));
    } catch (err) {
        showSaveStatus('Error saving result. Check the console.');
        console.error(err);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save Result';
    }
}

function showSaveStatus(text) {
    document.getElementById('save-status').textContent = text;
}

async function populateStrategyDropdown() {
    const strategies = await API.GetStrategies();
    const select = document.getElementById('strategy-select');
    for (const s of strategies) {
        strategyIdMap[s.strategy_name] = s.strategy_id;
        const opt = document.createElement('option');
        opt.value = s.strategy_name;
        opt.textContent = s.strategy_name;
        select.appendChild(opt);
    }
    select.addEventListener('change', () => {
        strategyName = select.value || null;
        strategyId   = strategyName ? (strategyIdMap[strategyName] ?? null) : null;
    });
}

async function populateStockDropdown() {
    const stocks = await API.GetStocks();
    const select = document.getElementById('stock-select');
    for (const s of stocks) {
        const opt = document.createElement('option');
        opt.value = s.ticker;
        opt.textContent = `${s.ticker} – ${s.name}`;
        select.appendChild(opt);
    }
    select.addEventListener('change', () => {
        stockID = select.value || null;
    });
}

document.getElementById('position-days').addEventListener('input', e => {
    positionDays = parseInt(e.target.value) || null;
});

document.getElementById('test-strategy-btn').addEventListener('click', runBacktest);
document.getElementById('save-result-btn').addEventListener('click', saveResult);

await Promise.all([populateStrategyDropdown(), populateStockDropdown()]);
