import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Mock data generators
const generateMockData = (exchange, type) => {
  const symbols = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOT', 'AVAX', 'MATIC', 'LINK', 'UNI', 'ATOM', 'LTC', 'BCH', 'NEAR', 'APT'];
  return symbols.map((symbol, index) => ({
    symbol: `${symbol}USDT`,
    price: parseFloat((Math.random() * 1000 + (symbol === 'BTC' ? 60000 : symbol === 'ETH' ? 3000 : 100)).toFixed(2)),
    change: parseFloat((Math.random() * 20 - 10).toFixed(2)),
    volume: parseFloat((Math.random() * 1000).toFixed(2)),
    openInterest: type === 'futures' ? parseFloat((Math.random() * 500).toFixed(2)) : null,
    fundingRate: type === 'futures' ? parseFloat((Math.random() * 0.1 - 0.05).toFixed(4)) : null,
    liquidation: parseFloat((Math.random() * 10).toFixed(2)),
    volatility: parseFloat((Math.random() * 5).toFixed(2)),
    aiScore: Math.floor(Math.random() * 100),
    exchange,
    type
  }));
};

const generateAISignal = (token) => {
  const recommendations = ['STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'STRONG_SELL'];
  const recommendation = recommendations[Math.floor(Math.random() * recommendations.length)];
  const confidence = Math.floor(Math.random() * 40) + 60;
  
  return {
    symbol: token.symbol,
    recommendation,
    confidence,
    entryPrice: token.price * (1 + (Math.random() * 0.02 - 0.01)),
    stopLoss: token.price * (1 - (Math.random() * 0.03 + 0.01)),
    takeProfit: token.price * (1 + (Math.random() * 0.05 + 0.02)),
    riskReward: parseFloat((Math.random() * 3 + 1).toFixed(1)),
    timeframes: ['5s', '15s', '30s', '1m'],
    indicators: {
      rsi: Math.floor(Math.random() * 100),
      macd: Math.random() > 0.5 ? 'bullish' : 'bearish',
      ma50: token.price > token.price * 0.98 ? 'above' : 'below',
      ema200: token.price > token.price * 0.95 ? 'above' : 'below',
      volume: Math.random() > 0.5 ? 'increasing' : 'decreasing'
    },
    analysis: `AI анализирует ${token.symbol} на ${token.exchange}. Цена ${
      token.change > 0 ? 'растет' : 'падает'
    } с волатильностью ${token.volatility}%. RSI: ${Math.floor(Math.random() * 100)} (${
      Math.random() > 0.5 ? 'перекупленность' : 'перепроданность'
    }). MACD ${Math.random() > 0.5 ? 'гистограмма растет' : 'гистограмма падает'}.`
  };
};

const App = () => {
  const [activeExchange, setActiveExchange] = useState('binance');
  const [activeType, setActiveType] = useState('futures');
  const [selectedToken, setSelectedToken] = useState(null);
  const [aiSignal, setAiSignal] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeframe, setTimeframe] = useState('5s');
  const [showLiquidations, setShowLiquidations] = useState(true);
  const [showFunding, setShowFunding] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [oiTimeframe, setOiTimeframe] = useState('5m');

  // Mock data
  const [binanceFutures, setBinanceFutures] = useState(generateMockData('binance', 'futures'));
  const [binanceSpot, setBinanceSpot] = useState(generateMockData('binance', 'spot'));
  const [bybitFutures, setBybitFutures] = useState(generateMockData('bybit', 'futures'));
  const [bybitSpot, setBybitSpot] = useState(generateMockData('bybit', 'spot'));

  // Get current data based on selections
  const getCurrentData = useMemo(() => {
    if (activeExchange === 'binance') {
      return activeType === 'futures' ? binanceFutures : binanceSpot;
    } else {
      return activeType === 'futures' ? bybitFutures : bybitSpot;
    }
  }, [activeExchange, activeType, binanceFutures, binanceSpot, bybitFutures, bybitSpot]);

  // Filter data by search
  const filteredData = useMemo(() => {
    return getCurrentData.filter(token =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [getCurrentData, searchQuery]);

  // Auto refresh
  const autoRefreshData = useCallback(() => {
    if (!autoRefresh) return;
    
    setBinanceFutures(prev => prev.map(token => ({
      ...token,
      price: token.price + (Math.random() - 0.5) * 0.5,
      change: token.change + (Math.random() - 0.5) * 0.1,
      volume: token.volume + (Math.random() - 0.5) * 10,
      openInterest: token.openInterest ? token.openInterest + (Math.random() - 0.5) * 5 : null,
      fundingRate: token.fundingRate ? token.fundingRate + (Math.random() - 0.5) * 0.001 : null,
      liquidation: token.liquidation + (Math.random() - 0.5) * 0.1,
      volatility: token.volatility + (Math.random() - 0.5) * 0.1,
      aiScore: Math.max(0, Math.min(100, token.aiScore + (Math.random() - 0.5) * 5))
    })));
    
    setBinanceSpot(prev => prev.map(token => ({
      ...token,
      price: token.price + (Math.random() - 0.5) * 0.5,
      change: token.change + (Math.random() - 0.5) * 0.1,
      volume: token.volume + (Math.random() - 0.5) * 10
    })));
    
    setBybitFutures(prev => prev.map(token => ({
      ...token,
      price: token.price + (Math.random() - 0.5) * 0.5,
      change: token.change + (Math.random() - 0.5) * 0.1,
      volume: token.volume + (Math.random() - 0.5) * 10,
      openInterest: token.openInterest ? token.openInterest + (Math.random() - 0.5) * 5 : null,
      fundingRate: token.fundingRate ? token.fundingRate + (Math.random() - 0.5) * 0.001 : null,
      liquidation: token.liquidation + (Math.random() - 0.5) * 0.1,
      volatility: token.volatility + (Math.random() - 0.5) * 0.1,
      aiScore: Math.max(0, Math.min(100, token.aiScore + (Math.random() - 0.5) * 5))
    })));
    
    setBybitSpot(prev => prev.map(token => ({
      ...token,
      price: token.price + (Math.random() - 0.5) * 0.5,
      change: token.change + (Math.random() - 0.5) * 0.1,
      volume: token.volume + (Math.random() - 0.5) * 10
    })));
  }, [autoRefresh]);

  useEffect(() => {
    const interval = setInterval(autoRefreshData, refreshInterval * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshData, refreshInterval]);

  // Handle token selection
  const handleTokenSelect = useCallback((token) => {
    setSelectedToken(token);
    setAiSignal(generateAISignal(token));
  }, []);

  // Initialize with first token
  useEffect(() => {
    if (filteredData.length > 0 && !selectedToken) {
      handleTokenSelect(filteredData[0]);
    }
  }, [filteredData, selectedToken, handleTokenSelect]);

  // Get top gainers/losers
  const topGainers = useMemo(() => 
    [...getCurrentData].sort((a, b) => b.change - a.change).slice(0, 5), 
    [getCurrentData]
  );
  
  const topLosers = useMemo(() => 
    [...getCurrentData].sort((a, b) => a.change - b.change).slice(0, 5), 
    [getCurrentData]
  );

  // AI Score gradient
  const getAIScoreColor = (score) => {
    if (score >= 80) return 'from-green-400 to-emerald-600';
    if (score >= 60) return 'from-blue-400 to-cyan-600';
    if (score >= 40) return 'from-yellow-400 to-orange-600';
    return 'from-red-400 to-pink-600';
  };

  // Neon border animation for buttons
  const NeonButton = ({ children, onClick, active = false, className = '' }) => (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
        active 
          ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white' 
          : 'bg-gray-800/50 hover:bg-gray-700 text-gray-300'
      } ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <div className={`absolute inset-0 rounded-lg ${
        active ? 'border-cyan-400' : 'border-gray-600'
      } border-2 opacity-0 animate-pulse`}
           style={{
             animation: active ? 'neonGlow 2s infinite alternate' : 'none'
           }}></div>
    </button>
  );

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `
            linear-gradient(rgba(0,200,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,200,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent animate-gradient">
              Quantum AI Tracker
            </h1>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
            <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-cyan-500/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-mono">WS: CONNECTED</span>
            </div>
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                autoRefresh 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
                  : 'bg-gradient-to-r from-red-600 to-pink-600 text-white'
              }`}
            >
              {autoRefresh ? 'AUTO REFRESH: ON' : 'AUTO REFRESH: OFF'}
            </button>
            <button 
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              ВХОД
            </button>
          </div>
        </div>

        {/* Exchange & Type Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
            <h3 className="text-sm font-semibold text-cyan-300 mb-2">Exchange</h3>
            <div className="flex gap-2">
              <NeonButton
                onClick={() => setActiveExchange('binance')}
                active={activeExchange === 'binance'}
              >
                Binance
              </NeonButton>
              <NeonButton
                onClick={() => setActiveExchange('bybit')}
                active={activeExchange === 'bybit'}
              >
                Bybit
              </NeonButton>
            </div>
          </div>
          
          <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
            <h3 className="text-sm font-semibold text-cyan-300 mb-2">Market Type</h3>
            <div className="flex gap-2">
              <NeonButton
                onClick={() => setActiveType('futures')}
                active={activeType === 'futures'}
              >
                Futures
              </NeonButton>
              <NeonButton
                onClick={() => setActiveType('spot')}
                active={activeType === 'spot'}
              >
                Spot
              </NeonButton>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md bg-gray-900/60 backdrop-blur-sm border border-cyan-500/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Token List */}
          <div className="lg:col-span-1 space-y-6">
            {/* Top Gainers/Losers */}
            <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
              <div className="flex gap-2 mb-4">
                <button className="flex-1 py-1 px-3 bg-green-600/20 text-green-400 rounded-lg text-sm font-medium">
                  📈 Top Gainers
                </button>
                <button className="flex-1 py-1 px-3 bg-red-600/20 text-red-400 rounded-lg text-sm font-medium">
                  📉 Top Losers
                </button>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {topGainers.slice(0, 8).map((token, index) => (
                  <div
                    key={token.symbol}
                    onClick={() => handleTokenSelect(token)}
                    className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-700/50 ${
                      selectedToken?.symbol === token.symbol ? 'bg-purple-600/30 border border-purple-500/50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{token.symbol.replace('USDT', '')}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          token.change >= 0 ? 'bg-green-400' : 'bg-red-400'
                        }`}></div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${token.price.toFixed(2)}</div>
                        <div className={`text-xs ${
                          token.change >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {token.change >= 0 ? '+' : ''}{token.change.toFixed(2)}%
                        </div>
                        {showFunding && token.fundingRate !== null && (
                          <div className={`text-xs ${
                            token.fundingRate >= 0 ? 'text-blue-400' : 'text-orange-400'
                          }`}>
                            {token.fundingRate >= 0 ? '+' : ''}{(token.fundingRate * 100).toFixed(3)}%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Open Interest Panel */}
            {selectedToken && selectedToken.openInterest && (
              <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">Open Interest • {selectedToken.symbol}</span>
                  <div className="flex gap-1">
                    {['1m', '5m', '15m'].map(tf => (
                      <button
                        key={tf}
                        onClick={() => setOiTimeframe(tf)}
                        className={`px-2 py-1 text-xs rounded ${
                          oiTimeframe === tf 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-700/50 text-gray-300'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Taker Buy ({oiTimeframe})</span>
                    <span className="text-green-400">22,439.3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Taker Sell ({oiTimeframe})</span>
                    <span className="text-red-400">21,325.52</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Open Interest (now)</span>
                    <span>10,742,841.32</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Δ OI vs prev</span>
                    <span>0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Всего (Buy+Sell, {oiTimeframe})</span>
                    <span>43,764.82</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">Обновлено: {new Date().toLocaleTimeString()}</div>
                </div>
              </div>
            )}

            {/* Settings */}
            <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
              <h3 className="font-semibold mb-3">Display Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Liquidations</span>
                  <button 
                    onClick={() => setShowLiquidations(!showLiquidations)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${
                      showLiquidations ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                      showLiquidations ? 'translate-x-5' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Funding Rates</span>
                  <button 
                    onClick={() => setShowFunding(!showFunding)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${
                      showFunding ? 'bg-purple-600' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                      showFunding ? 'translate-x-5' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
                <div>
                  <label className="text-sm block mb-2">Refresh Interval</label>
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value={1}>1 minute</option>
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Token Overview */}
            {selectedToken && (
              <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-5 border border-cyan-500/20">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-5">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center font-bold text-lg">
                        {selectedToken.symbol.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{selectedToken.symbol.replace('USDT', '')}</h2>
                        <p className="text-gray-400">
                          {selectedToken.symbol} • {activeExchange.charAt(0).toUpperCase() + activeExchange.slice(1)} {activeType}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right mt-3 lg:mt-0">
                    <div className="text-2xl font-bold">${selectedToken.price.toFixed(2)}</div>
                    <div className={`text-lg font-semibold ${
                      selectedToken.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {selectedToken.change >= 0 ? '+' : ''}{selectedToken.change.toFixed(2)}% (24h)
                    </div>
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="bg-gray-900/80 rounded-xl h-80 flex items-center justify-center border border-cyan-500/20">
                  <div className="text-center">
                    <div className="text-xl font-bold mb-2">TradingView Chart</div>
                    <div className="text-gray-400">Real-time {selectedToken.symbol} chart</div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Analysis - Moved Higher */}
            {aiSignal && (
              <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-5 border border-cyan-500/20">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-5">
                  <h3 className="text-xl font-bold text-cyan-300">
                    🤖 Quantum AI Signal Analysis
                  </h3>
                  <div className="flex gap-2 mt-2 lg:mt-0">
                    {aiSignal.timeframes.map(tf => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          timeframe === tf
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700/50 hover:bg-gray-700'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Signal Card */}
                  <div className="bg-gray-800/50 rounded-xl p-5">
                    <div className="flex items-center gap-4 mb-5">
                      <div className={`px-4 py-2 rounded font-bold ${
                        aiSignal.recommendation.includes('BUY') 
                          ? 'bg-green-600/20 text-green-400'
                          : aiSignal.recommendation.includes('SELL')
                          ? 'bg-red-600/20 text-red-400'
                          : 'bg-yellow-600/20 text-yellow-400'
                      }`}>
                        {aiSignal.recommendation.replace('_', ' ')}
                      </div>
                      <div className="text-sm">
                        <div className="text-gray-400">Confidence</div>
                        <div className="font-bold">{aiSignal.confidence}%</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-gray-400">Risk/Reward</div>
                        <div className="font-bold">{aiSignal.riskReward}:1</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <div className="text-center">
                        <div className="text-gray-400 text-sm mb-1">Entry</div>
                        <div className="font-bold">${aiSignal.entryPrice.toFixed(4)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400 text-sm mb-1">Stop Loss</div>
                        <div className="font-bold text-red-400">${aiSignal.stopLoss.toFixed(4)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400 text-sm mb-1">Take Profit</div>
                        <div className="font-bold text-green-400">${aiSignal.takeProfit.toFixed(4)}</div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-300 leading-relaxed">
                      {aiSignal.analysis}
                    </div>
                  </div>

                  {/* Technical Indicators */}
                  <div className="bg-gray-800/50 rounded-xl p-5">
                    <h4 className="font-bold mb-3">Technical Indicators</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">RSI (14)</span>
                        <span className={`font-bold ${
                          aiSignal.indicators.rsi > 70 ? 'text-red-400' : 
                          aiSignal.indicators.rsi < 30 ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {aiSignal.indicators.rsi}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">MACD</span>
                        <span className={`font-bold ${
                          aiSignal.indicators.macd === 'bullish' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {aiSignal.indicators.macd}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">MA50</span>
                        <span className={`font-bold ${
                          aiSignal.indicators.ma50 === 'above' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {aiSignal.indicators.ma50}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">EMA200</span>
                        <span className={`font-bold ${
                          aiSignal.indicators.ema200 === 'above' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {aiSignal.indicators.ema200}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
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

            {/* Full Token List */}
            <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-5 border border-cyan-500/20">
              <h3 className="text-xl font-bold mb-5">All Tokens</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {filteredData.map(token => (
                  <div
                    key={token.symbol}
                    onClick={() => handleTokenSelect(token)}
                    className={`p-4 rounded-lg cursor-pointer transition-all hover:bg-gray-700/50 border ${
                      selectedToken?.symbol === token.symbol 
                        ? 'border-purple-500 bg-purple-600/20' 
                        : 'border-gray-700/50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center font-bold text-sm">
                          {token.symbol.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold">{token.symbol.replace('USDT', '')}</div>
                          <div className="text-xs text-gray-400">{token.exchange}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${token.price.toFixed(2)}</div>
                        <div className={`text-sm ${
                          token.change >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {token.change >= 0 ? '+' : ''}{token.change.toFixed(2)}%
                        </div>
                        {showFunding && token.fundingRate !== null && (
                          <div className={`text-xs ${
                            token.fundingRate >= 0 ? 'text-blue-400' : 'text-orange-400'
                          }`}>
                            {token.fundingRate >= 0 ? '+' : ''}{(token.fundingRate * 100).toFixed(3)}%
                          </div>
                        )}
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
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md border border-cyan-500/30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-cyan-300">
                {authMode === 'login' ? 'Вход' : 'Регистрация'}
              </h2>
              <button 
                onClick={() => setShowAuthModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            {authMode === 'login' ? (
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-cyan-700 hover:to-purple-700 transition-all">
                  Войти с Email
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-cyan-700 hover:to-purple-700 transition-all">
                  Зарегистрироваться
                </button>
              </div>
            )}
            
            <div className="mt-6 space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900/90 text-gray-400">Или продолжить с</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 bg-gray-800/50 hover:bg-gray-700 border border-gray-600 rounded-lg py-2 transition-all">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button className="flex items-center justify-center gap-2 bg-gray-800/50 hover:bg-gray-700 border border-gray-600 rounded-lg py-2 transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C6.48 0 2 4.48 2 10.017c0 4.422 2.865 8.167 6.839 9.495.5.09.68-.22.68-.48l-.01-1.73c-2.78 0.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.38-1.99 1-2.69-.1-.25-.44-1.27.1-2.65 0 0 .81-.26 2.64 1 0 0 .78-.22 2.15-.22.36 0 1.02.09 1.48.13 1.04-1.48 2.57-2.11 3.99-2.11.84 0 1.65.09 2.45.27.8-.9 1.92-1.48 3.14-1.48 1.04 0 1.95.46 2.58 1.2.63-.14 1.29-.26 1.97-.35.68-.09 1.37-.13 2.07-.13.69 0 1.38.04 2.07.13 1.22.09 2.34.67 3.14 1.48.8.79 1.29 1.7 1.29 2.71 0 1.38-.47 2.64-1.25 3.64.14.12.26.34.26.57l-.01 2.32c0 .26.18.57.69.48 3.97-1.33 6.83-5.07 6.83-9.49C22 4.48 17.52 0 12.017 0z"/>
                  </svg>
                  Apple
                </button>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <button 
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-cyan-400 hover:text-cyan-300 text-sm"
              >
                {authMode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes neonGlow {
          0% { box-shadow: 0 0 5px rgba(0, 200, 255, 0.3); }
          100% { box-shadow: 0 0 20px rgba(124, 58, 237, 0.6); }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 6s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default App;