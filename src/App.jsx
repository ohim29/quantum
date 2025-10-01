import React, { useState, useEffect, useCallback, useMemo } from 'react';

const generateMockData = (exchange) => {
  const symbols = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOT', 'AVAX', 'MATIC', 'LINK', 'UNI'];
  return symbols.map(symbol => ({
    symbol: `${symbol}USDT`,
    price: parseFloat((Math.random() * 1000 + (symbol === 'BTC' ? 60000 : symbol === 'ETH' ? 3000 : 100)).toFixed(2)),
    change: parseFloat((Math.random() * 15 - 7.5).toFixed(2)),
    volume: parseFloat((Math.random() * 1000).toFixed(2)),
    openInterest: parseFloat((Math.random() * 500).toFixed(2)),
    fundingRate: parseFloat((Math.random() * 0.1 - 0.05).toFixed(4)),
    exchange,
    type: 'futures'
  }));
};

const generateAISignal = (token) => {
  const recs = ['STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'STRONG_SELL'];
  const rec = recs[Math.floor(Math.random() * recs.length)];
  return {
    symbol: token.symbol,
    recommendation: rec,
    confidence: Math.floor(Math.random() * 40) + 60,
    entryPrice: token.price * (1 + (Math.random() * 0.02 - 0.01)),
    stopLoss: token.price * (1 - (Math.random() * 0.03 + 0.01)),
    takeProfit: token.price * (1 + (Math.random() * 0.05 + 0.02)),
    riskReward: parseFloat((Math.random() * 3 + 1).toFixed(1)),
    timeframes: ['5s', '15s', '30s', '1m'],
    indicators: {
      rsi: Math.floor(Math.random() * 100),
      macd: Math.random() > 0.5 ? 'bullish' : 'bearish',
      ma50: Math.random() > 0.5 ? 'above' : 'below',
      ema200: Math.random() > 0.5 ? 'above' : 'below',
      volume: Math.random() > 0.5 ? 'increasing' : 'decreasing'
    },
    analysis: `AI анализирует ${token.symbol}. Цена ${
      token.change > 0 ? 'растет' : 'падает'
    }. RSI: ${Math.floor(Math.random() * 100)}. MACD ${Math.random() > 0.5 ? 'гистограмма растет' : 'падает'}.`
  };
};

export default function App() {
  const [activeExchange, setActiveExchange] = useState('binance');
  const [selectedToken, setSelectedToken] = useState(null);
  const [aiSignal, setAiSignal] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [oiTimeframe, setOiTimeframe] = useState('5m');
  const [timeframe, setTimeframe] = useState('5s');
  const [showAuth, setShowAuth] = useState(false);

  const binanceData = useMemo(() => generateMockData('binance'), []);
  const bybitData = useMemo(() => generateMockData('bybit'), []);
  const currentData = activeExchange === 'binance' ? binanceData : bybitData;

  const topGainers = useMemo(() => 
    [...currentData].sort((a, b) => b.change - a.change).slice(0, 5), 
    [currentData]
  );

  useEffect(() => {
    if (!selectedToken && currentData.length > 0) {
      setSelectedToken(currentData[0]);
      setAiSignal(generateAISignal(currentData[0]));
    }
  }, [currentData, selectedToken]);

  const handleSelect = (token) => {
    setSelectedToken(token);
    setAiSignal(generateAISignal(token));
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `
          linear-gradient(rgba(0,200,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,200,255,0.1) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }}></div>

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
            Quantum AI Tracker
          </h1>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 bg-green-600/20 text-green-400 rounded text-sm border border-green-500/30">WS: OK</span>
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1.5 rounded text-sm ${
                autoRefresh ? 'bg-green-600' : 'bg-red-600'
              }`}
            >
              {autoRefresh ? 'ON' : 'OFF'}
            </button>
            <button 
              onClick={() => setShowAuth(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded text-sm"
            >
              ВХОД
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Top Tokens */}
            <div className="bg-gray-900/60 p-4 rounded-xl border border-purple-500/30">
              <div className="flex gap-2 mb-3">
                <button className="flex-1 py-1 bg-green-600/20 text-green-400 rounded text-xs">📈 Рост</button>
                <button className="flex-1 py-1 bg-red-600/20 text-red-400 rounded text-xs">📉 Падение</button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {topGainers.map(token => (
                  <div
                    key={token.symbol}
                    onClick={() => handleSelect(token)}
                    className={`p-2.5 rounded cursor-pointer transition-colors ${
                      selectedToken?.symbol === token.symbol 
                        ? 'bg-gradient-to-r from-cyan-900/40 to-purple-900/40 border border-cyan-500/50' 
                        : 'hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm">{token.symbol.replace('USDT', '')}</span>
                      <div className="text-right">
                        <div className="font-semibold">${token.price.toFixed(2)}</div>
                        <div className={`text-xs ${token.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {token.change >= 0 ? '+' : ''}{token.change.toFixed(2)}%
                        </div>
                        <div className={`text-xs ${token.fundingRate >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                          {token.fundingRate >= 0 ? '+' : ''}{(token.fundingRate * 100).toFixed(3)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Open Interest */}
            {selectedToken && (
              <div className="bg-gray-900/60 p-4 rounded-xl border border-purple-500/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-cyan-300">Open Interest</span>
                  <div className="flex gap-1">
                    {['1m', '5m', '15m'].map(tf => (
                      <button
                        key={tf}
                        onClick={() => setOiTimeframe(tf)}
                        className={`px-2 py-0.5 text-xs rounded ${
                          oiTimeframe === tf ? 'bg-purple-600 text-white' : 'bg-gray-700'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Taker Buy</span><span className="text-green-400">22,439</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Taker Sell</span><span className="text-red-400">21,325</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Open Interest</span><span>10.7M</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Δ OI</span><span>0</span></div>
                </div>
              </div>
            )}

            {/* Exchange Switch */}
            <div className="bg-gray-900/60 p-4 rounded-xl border border-purple-500/30">
              <h3 className="text-sm font-semibold mb-2">Exchange</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveExchange('binance')}
                  className={`flex-1 py-2 rounded text-sm font-medium ${
                    activeExchange === 'binance' ? 'bg-blue-600 text-white' : 'bg-gray-800'
                  }`}
                >
                  Binance
                </button>
                <button
                  onClick={() => setActiveExchange('bybit')}
                  className={`flex-1 py-2 rounded text-sm font-medium ${
                    activeExchange === 'bybit' ? 'bg-orange-600 text-white' : 'bg-gray-800'
                  }`}
                >
                  Bybit
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Chart */}
            {selectedToken && (
              <div className="bg-gray-900/60 p-5 rounded-xl border border-cyan-500/30">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{selectedToken.symbol.replace('USDT', '')}</h2>
                    <p className="text-gray-400 text-sm">{selectedToken.symbol} • {activeExchange} Futures</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${selectedToken.price.toFixed(2)}</div>
                    <div className={`text-lg ${selectedToken.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedToken.change >= 0 ? '+' : ''}{selectedToken.change.toFixed(2)}%
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900/80 h-64 rounded-xl flex items-center justify-center border border-cyan-500/20">
                  <div className="text-center text-gray-400">
                    <div className="font-bold">TradingView Chart</div>
                    <div className="text-sm mt-1">Real-time {selectedToken.symbol}</div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Analysis */}
            {aiSignal && (
              <div className="bg-gray-900/60 p-5 rounded-xl border border-cyan-500/30">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <h3 className="text-xl font-bold text-cyan-300">🤖 Quantum AI Signal</h3>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    {aiSignal.timeframes.map(tf => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-2.5 py-1 rounded text-xs ${
                          timeframe === tf ? 'bg-purple-600 text-white' : 'bg-gray-700'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded text-sm font-bold ${
                        aiSignal.recommendation.includes('BUY') ? 'bg-green-600/30 text-green-400' :
                        aiSignal.recommendation.includes('SELL') ? 'bg-red-600/30 text-red-400' : 'bg-yellow-600/30 text-yellow-400'
                      }`}>
                        {aiSignal.recommendation.replace('_', ' ')}
                      </span>
                      <span className="text-sm">Conf: {aiSignal.confidence}%</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center"><div className="text-gray-400 text-xs">Entry</div><div className="font-bold">${aiSignal.entryPrice.toFixed(2)}</div></div>
                      <div className="text-center"><div className="text-gray-400 text-xs">SL</div><div className="font-bold text-red-400">${aiSignal.stopLoss.toFixed(2)}</div></div>
                      <div className="text-center"><div className="text-gray-400 text-xs">TP</div><div className="font-bold text-green-400">${aiSignal.takeProfit.toFixed(2)}</div></div>
                    </div>
                    <div className="text-sm text-gray-300">{aiSignal.analysis}</div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h4 className="font-bold mb-2 text-sm">Technical Indicators</h4>
                    {Object.entries(aiSignal.indicators).map(([key, val]) => (
                      <div key={key} className="flex justify-between py-1 border-b border-gray-700">
                        <span className="text-gray-400 text-sm">{key.toUpperCase()}</span>
                        <span className={`text-sm font-bold ${
                          (key === 'rsi' && val > 70) || val === 'bearish' || val === 'below' || val === 'decreasing'
                            ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* All Tokens */}
            <div className="bg-gray-900/60 p-5 rounded-xl border border-cyan-500/30">
              <h3 className="text-xl font-bold mb-4">All Futures</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto">
                {currentData.map(token => (
                  <div
                    key={token.symbol}
                    onClick={() => handleSelect(token)}
                    className={`p-3 rounded cursor-pointer border ${
                      selectedToken?.symbol === token.symbol 
                        ? 'border-cyan-500 bg-cyan-900/20' 
                        : 'border-gray-700 hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="font-bold text-sm mb-1">{token.symbol.replace('USDT', '')}</div>
                    <div className="text-xs">${token.price.toFixed(2)}</div>
                    <div className={`text-xs ${token.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {token.change >= 0 ? '+' : ''}{token.change.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-md border border-cyan-500/30">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-cyan-300">Вход</h2>
              <button onClick={() => setShowAuth(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            <div className="space-y-3">
              <input type="email" placeholder="Email" className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500" />
              <input type="password" placeholder="Пароль" className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500" />
              <button className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 py-2 rounded font-medium">
                Войти
              </button>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-800 text-center">
              <button className="text-cyan-400 hover:text-cyan-300 text-sm">
                или войти через Google / Apple
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
