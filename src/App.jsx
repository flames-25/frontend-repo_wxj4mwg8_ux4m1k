import { useState } from 'react'

function App() {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const [symbol, setSymbol] = useState('AAPL')
  const [timeframe, setTimeframe] = useState('1d')
  const [lookback, setLookback] = useState(365)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const [broker, setBroker] = useState('alpaca')
  const [paper, setPaper] = useState(true)
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [acct, setAcct] = useState(null)
  const [orderSide, setOrderSide] = useState('buy')
  const [orderQty, setOrderQty] = useState(1)
  const [placing, setPlacing] = useState(false)
  const [orderResp, setOrderResp] = useState(null)

  const analyze = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch(`${baseUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, timeframe, lookback_days: Number(lookback) })
      })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(t || 'Failed to analyze')
      }
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const testBroker = async () => {
    setAcct(null)
    setOrderResp(null)
    try {
      const res = await fetch(`${baseUrl}/api/broker/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ broker, api_key: apiKey, api_secret: apiSecret, paper })
      })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(t)
      }
      const data = await res.json()
      setAcct(data)
    } catch (e) {
      setAcct({ error: e.message })
    }
  }

  const placeOrder = async () => {
    setPlacing(true)
    setOrderResp(null)
    try {
      const res = await fetch(`${baseUrl}/api/broker/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          broker,
          api_key: apiKey,
          api_secret: apiSecret,
          paper,
          symbol,
          side: orderSide,
          qty: Number(orderQty),
          type: 'market',
          time_in_force: 'day'
        })
      })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(t)
      }
      const data = await res.json()
      setOrderResp(data)
    } catch (e) {
      setOrderResp({ error: e.message })
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="px-6 py-4 border-b bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">US Trading Assistant</h1>
          <a href="/test" className="text-blue-600 hover:underline">System Test</a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Market Analysis</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="col-span-2 md:col-span-1">
              <label className="text-sm text-slate-600">Symbol</label>
              <input value={symbol} onChange={e=>setSymbol(e.target.value.toUpperCase())} className="w-full border rounded px-3 py-2" placeholder="AAPL" />
            </div>
            <div>
              <label className="text-sm text-slate-600">Timeframe</label>
              <select value={timeframe} onChange={e=>setTimeframe(e.target.value)} className="w-full border rounded px-3 py-2">
                <option>1d</option>
                <option>1h</option>
                <option>30m</option>
                <option>15m</option>
                <option>5m</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-600">Lookback (days)</label>
              <input type="number" value={lookback} min={30} max={2000} onChange={e=>setLookback(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="flex items-end">
              <button onClick={analyze} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded">
                {loading ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>
          )}
          {result && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-50 border rounded p-4">
                <h3 className="font-semibold mb-2">Overview</h3>
                <ul className="text-sm space-y-1">
                  <li><span className="text-slate-500">Symbol:</span> {result.symbol}</li>
                  <li><span className="text-slate-500">Last Price:</span> ${result.last_price?.toFixed(2)}</li>
                  <li><span className="text-slate-500">Trend:</span> {result.trend}</li>
                  <li><span className="text-slate-500">Signal:</span> <span className={result.signal === 'buy' ? 'text-green-600' : result.signal === 'sell' ? 'text-red-600' : 'text-slate-700'}>{result.signal}</span></li>
                </ul>
              </div>
              <div className="bg-slate-50 border rounded p-4">
                <h3 className="font-semibold mb-2">Indicators</h3>
                <ul className="text-sm space-y-1">
                  <li><span className="text-slate-500">RSI(14):</span> {result.rsi ?? '—'}</li>
                  <li><span className="text-slate-500">SMA 50:</span> {result.sma_50 ?? '—'}</li>
                  <li><span className="text-slate-500">SMA 200:</span> {result.sma_200 ?? '—'}</li>
                </ul>
              </div>
              <div className="md:col-span-2 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded p-4">
                <div className="font-semibold mb-1">Decision</div>
                <div className="text-sm">{result.reason}</div>
              </div>
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Execute Trade (Alpaca)</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-slate-600">Broker</label>
              <select value={broker} onChange={e=>setBroker(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="alpaca">Alpaca</option>
              </select>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-sm text-slate-600">API Key</label>
                <input value={apiKey} onChange={e=>setApiKey(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="APCA-API-KEY-ID" />
              </div>
              <div>
                <label className="text-sm text-slate-600">API Secret</label>
                <input value={apiSecret} onChange={e=>setApiSecret(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="APCA-API-SECRET-KEY" />
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={paper} onChange={e=>setPaper(e.target.checked)} /> Use Paper Trading
              </label>
              <div className="flex gap-2">
                <button onClick={testBroker} className="bg-slate-700 hover:bg-slate-800 text-white px-3 py-2 rounded">Test Connection</button>
                <a href="https://app.alpaca.markets/signup" target="_blank" className="text-blue-600 text-sm self-center">Get Alpaca Keys</a>
              </div>
              {acct && (
                <div className={`text-sm p-3 rounded ${acct.error ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-slate-50 border'}`}>
                  {acct.error ? acct.error : (
                    <div>
                      <div className="font-semibold">Connected</div>
                      <div>Account: {acct.account_id} | Cash: ${acct.cash}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-2 border-t">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm text-slate-600">Side</label>
                  <select value={orderSide} onChange={e=>setOrderSide(e.target.value)} className="w-full border rounded px-3 py-2">
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-600">Quantity</label>
                  <input type="number" min={0} step={1} value={orderQty} onChange={e=>setOrderQty(e.target.value)} className="w-full border rounded px-3 py-2" />
                </div>
                <div className="flex items-end">
                  <button onClick={placeOrder} disabled={placing || !apiKey || !apiSecret} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded">
                    {placing ? 'Placing...' : 'Place Market Order'}
                  </button>
                </div>
              </div>
              {orderResp && (
                <div className={`mt-3 text-sm p-3 rounded ${orderResp.error ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-slate-50 border'}`}>
                  <pre className="whitespace-pre-wrap break-all text-xs">{JSON.stringify(orderResp, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="text-center text-xs text-slate-500 py-6">
        Data for US symbols via Yahoo Finance; live trade execution via Alpaca when keys provided. Use at your own risk.
      </footer>
    </div>
  )
}

export default App
