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
    analysis: `Цена выше MA50 и EMA200; MACD гистограмма < 0; RSI>70 (перекупленность).`
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
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse"
            style={{ textShadow: '0 0 10px rgba(0,255,255,0.3), 0 0 20px rgba(139,92,246,0.3)' }}>
            Quantum AI Tracker
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-900/80 px-3 py-1.5 rounded-lg border border-cyan-500/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-mono">WS: подключено</span>
            </div>
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                autoRefresh 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20' 
                  : 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/20'
              }`}
            >
              {autoRefresh ? 'Автообновление: ВКЛ' : 'Автообновление: ВЫКЛ'}
            </button>
            <button 
              onClick={() => setShowAuth(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium text-sm hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/20"
            >
              ВХОД
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Top Futures */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30 shadow-xl">
              <div className="flex gap-2 mb-4">
                <button className="flex-1 py-2 px-3 bg-gradient-to-r from-green-600/30 to-emerald-600/30 text-green-400 rounded-lg text-sm font-bold border border-green-500/30">
                  📈 Рост
                </button>
                <button className="flex-1 py-2 px-3 bg-gradient-to-r from-red-600/30 to-rose-600/30 text-red-400 rounded-lg text-sm font-bold border border-red-500/30">
                  📉 Падение
                </button>
              </div>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {topGainers.map(token => (
                  <div
                    key={token.symbol}
                    onClick={() => handleSelect(token)}
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] border-2 ${
                      selectedToken?.symbol === token.symbol 
                        ? 'border-cyan-400 bg-gradient-to-r from-cyan-900/30 to-purple-900/30 shadow-lg shadow-cyan-500/20' 
                        : 'border-gray-700/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center font-bold text-sm">
                          {token.symbol.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-sm">{token.symbol.replace('USDT', '')}</div>
                          <div className="text-xs text-gray-400">{token.exchange}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">${token.price.toFixed(2)}</div>
                        <div className={`text-sm font-semibold ${
                          token.change >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {token.change >= 0 ? '+' : ''}{token.change.toFixed(2)}%
                        </div>
                        <div className={`text-xs ${
                          token.fundingRate >= 0 ? 'text-blue-400' : 'text-orange-400'
                        }`}>
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
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30 shadow-xl">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-cyan-300">Open Interest</span>
                  <div className="flex gap-1">
                    {['1m', '5m', '15m'].map(tf => (
                      <button
                        key={tf}
                        onClick={() => setOiTimeframe(tf)}
                        className={`px-2 py-1 text-xs rounded font-medium ${
                          oiTimeframe === tf 
                            ? 'bg-purple-600 text-white border border-purple-400' 
                            : 'bg-gray-800 text-gray-300 border border-gray-700'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex justify-between"><span className="text-gray-400">Taker Buy ({oiTimeframe})</span><span className="text-green-400">22,439.3</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Taker Sell ({oiTimeframe})</span><span className="text-red-400">21,325.52</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Open Interest (now)</span><span>10,742,841.32</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Δ OI vs prev</span><span>0</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Всего (Buy+Sell, {oiTimeframe})</span><span>43,764.82</span></div>
                </div>
                <div className="text-xs text-gray-500 mt-2">Обновлено: {new Date().toLocaleTimeString()}</div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Token Info + Chart */}
            {selectedToken && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-cyan-500/30 shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center font-bold text-xl animate-pulse"
                      style={{ boxShadow: '0 0 15px rgba(0,255,255,0.4)' }}>
                      {selectedToken.symbol.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedToken.symbol.replace('USDT', '')}</h2>
                      <p className="text-gray-400">{selectedToken.symbol} • {activeExchange.charAt(0).toUpperCase() + activeExchange.slice(1)} Futures</p>
                    </div>
                  </div>
                  <div className="text-right mt-4 md:mt-0">
                    <div className="text-3xl font-bold">${selectedToken.price.toFixed(2)}</div>
                    <div className={`text-xl font-bold ${
                      selectedToken.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {selectedToken.change >= 0 ? '+' : ''}{selectedToken.change.toFixed(2)}% 24h
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900/80 rounded-xl h-96 flex items-center justify-center border border-cyan-500/30"
                  style={{ boxShadow: 'inset 0 0 20px rgba(0,200,255,0.1)' }}>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2 text-cyan-300">TradingView Chart</div>
                    <div className="text-gray-400">График для {selectedToken.symbol}</div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Signal Analysis — moved right after chart */}
            {aiSignal && (
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-cyan-500/30 shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text">
                    🤖 Quantum AI Signal Analysis
                  </h3>
                  <div className="flex gap-2 mt-3 md:mt-0">
                    {aiSignal.timeframes.map(tf => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium font-mono ${
                          timeframe === tf
                            ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white border border-cyan-400'
                            : 'bg-gray-800 text-gray-300 border border-gray-700'
                        }`}
                      >
                        {tf.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-800/40 rounded-xl p-5 border border-cyan-500/20">
                    <div className="flex items-center gap-4 mb-5">
                      <div className={`px-4 py-2 rounded-lg font-bold text-lg ${
                        aiSignal.recommendation.includes('BUY') 
                          ? 'bg-green-600/30 text-green-400 border border-green-500/30'
                          : aiSignal.recommendation.includes('SELL')
                          ? 'bg-red-600/30 text-red-400 border border-red-500/30'
                          : 'bg-yellow-600/30 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {aiSignal.recommendation.replace('_', ' ')}
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">Confidence</div>
                        <div className="font-bold text-xl text-cyan-400">{aiSignal.confidence}%</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">RR</div>
                        <div className="font-bold text-xl text-purple-400">{aiSignal.riskReward}:1</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-5">
                      <div className="text-center">
                        <div className="text-gray-400 text-sm mb-1">Вход</div>
                        <div className="font-bold text-lg">${aiSignal.entryPrice.toFixed(4)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400 text-sm mb-1">SL</div>
                        <div className="font-bold text-lg text-red-400">${aiSignal.stopLoss.toFixed(4)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400 text-sm mb-1">TP</div>
                        <div className="font-bold text-lg text-green-400">${aiSignal.takeProfit.toFixed(4)}</div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-300 leading-relaxed bg-gray-900/30 p-3 rounded-lg border border-cyan-500/10">
                      Итог: <span className="font-bold">ЛОНА</span>. Вход на рынке от {aiSignal.entryPrice.toFixed(4)} SL — {aiSignal.stopLoss.toFixed(4)} TP — {aiSignal.takeProfit.toFixed(4)}.
                    </div>
                    <div className="text-xs mt-2 text-gray-400">
                      Причина: {aiSignal.analysis}
                    </div>
                  </div>

                  <div className="bg-gray-800/40 rounded-xl p-5 border border-purple-500/20">
                    <h4 className="font-bold mb-4 text-lg text-purple-400">Technical Indicators</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-gray-900/30 rounded border border-cyan-500/10">
                        <span className="text-gray-400">RSI (14)</span>
                        <span className={`font-bold ${
                          aiSignal.indicators.rsi > 70 ? 'text-red-400' : 
                          aiSignal.indicators.rsi < 30 ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {aiSignal.indicators.rsi}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-900/30 rounded border border-purple-500/10">
                        <span className="text-gray-400">MACD</span>
                        <span className={`font-bold ${
                          aiSignal.indicators.macd === 'bullish' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {aiSignal.indicators.macd}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-900/30 rounded border border-pink-500/10">
                        <span className="text-gray-400">MA50</span>
                        <span className={`font-bold ${
                          aiSignal.indicators.ma50 === 'above' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {aiSignal.indicators.ma50}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-900/30 rounded border border-yellow-500/10">
                        <span className="text-gray-400">EMA200</span>
                        <span className={`font-bold ${
                          aiSignal.indicators.ema200 === 'above' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {aiSignal.indicators.ema200}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-900/30 rounded border border-cyan-500/10">
                        <span className="text-gray-400">Volume Trend</span>
                        <span className={`font-bold ${
                          aiSignal.indicators.volume === 'increasing' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {aiSignal.indicators.volume}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* All Tokens */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-cyan-500/30 shadow-xl">
              <h3 className="text-2xl font-bold mb-6">Все фьючерсы</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {currentData.map(token => (
                  <div
                    key={token.symbol}
                    onClick={() => handleSelect(token)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] border-2 ${
                      selectedToken?.symbol === token.symbol 
                        ? 'border-cyan-400 bg-gradient-to-r from-cyan-900/40 to-purple-900/40 shadow-lg shadow-cyan-500/30' 
                        : 'border-gray-700/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center font-bold text-sm">
                          {token.symbol.charAt(0)}
                        </div>
                        <span className="font-bold">{token.symbol.replace('USDT', '')}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${token.price.toFixed(2)}</div>
                        <div className={`text-sm ${
                          token.change >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {token.change >= 0 ? '+' : ''}{token.change.toFixed(2)}%
                        </div>
                      </div>
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900/90 backdrop-blur-xl p-6 rounded-2xl w-full max-w-md border border-cyan-500/30 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text">
                Вход в аккаунт
              </h2>
              <button onClick={() => setShowAuth(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>
            <div className="space-y-4">
              <input type="email" placeholder="Email" className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              <input type="password" placeholder="Пароль" className="w-full bg-gray-800/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              <button className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-cyan-700 hover:to-purple-700 transition-all shadow-lg shadow-cyan-500/20">
                Войти с Email
              </button>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-800/50 text-center">
              <button className="text-cyan-400 hover:text-cyan-300 font-medium">
                или войти через Google / Apple
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
