import React, { useState, useEffect, useCallback, useMemo } from 'react';

const generateMockData = (exchange, type) => {
    const symbols = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOT', 'AVAX', 'MATIC', 'LINK', 'UNI', 'ATOM', 'LTC', 'BCH', 'NEAR', 'APT'];
    return symbols.map(symbol => ({
        symbol: `${symbol}USDT`,
        price: parseFloat((Math.random() * 1000 + (symbol === 'BTC' ? 60000 : symbol === 'ETH' ? 3000 : 100)).toFixed(2)),
        change: parseFloat((Math.random() * 20 - 10).toFixed(2)),
        volume: parseFloat((Math.random() * 1000).toFixed(2)),
        openInterest: type === 'futures' ? parseFloat((Math.random() * 500).toFixed(2)) : null,
        fundingRate: type === 'futures' ? parseFloat((Math.random() * 0.1 - 0.05).toFixed(4)) : null,
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
            ma50: Math.random() > 0.5 ? 'above' : 'below',
            ema200: Math.random() > 0.5 ? 'above' : 'below',
            volume: Math.random() > 0.5 ? 'increasing' : 'decreasing'
        },
        analysis: `AI анализирует ${token.symbol} на ${token.exchange}. Цена ${token.change > 0 ? 'растет' : 'падает'
            } с высокой волатильностью. RSI: ${Math.floor(Math.random() * 100)} (${Math.random() > 0.5 ? 'перекупленность' : 'перепроданность'
            }). MACD ${Math.random() > 0.5 ? 'гистограмма растет' : 'гистограмма падает'}.`
    };
};

export default function App() {
    const [activeExchange, setActiveExchange] = useState('binance');
    const [activeType, setActiveType] = useState('futures');
    const [selectedToken, setSelectedToken] = useState(null);
    const [aiSignal, setAiSignal] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(5);
    const [searchQuery, setSearchQuery] = useState('');
    const [timeframe, setTimeframe] = useState('5s');
    const [showFunding, setShowFunding] = useState(true);
    const [oiTimeframe, setOiTimeframe] = useState('5m');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('login');

    const [binanceFutures] = useState(generateMockData('binance', 'futures'));
    const [bybitFutures] = useState(generateMockData('bybit', 'futures'));

    const getCurrentData = useMemo(() => {
        return activeExchange === 'binance' ? binanceFutures : bybitFutures;
    }, [activeExchange, binanceFutures, bybitFutures]);

    const filteredData = useMemo(() => {
        return getCurrentData.filter(token =>
            token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [getCurrentData, searchQuery]);

    const autoRefreshData = useCallback(() => {
        if (!autoRefresh) return;
        // Mock refresh logic would go here
    }, [autoRefresh]);

    useEffect(() => {
        const interval = setInterval(autoRefreshData, refreshInterval * 60 * 1000);
        return () => clearInterval(interval);
    }, [autoRefreshData, refreshInterval]);

    const handleTokenSelect = useCallback((token) => {
        setSelectedToken(token);
        setAiSignal(generateAISignal(token));
    }, []);

    useEffect(() => {
        if (filteredData.length > 0 && !selectedToken) {
            handleTokenSelect(filteredData[0]);
        }
    }, [filteredData, selectedToken, handleTokenSelect]);

    const topGainers = useMemo(() =>
        [...getCurrentData].sort((a, b) => b.change - a.change).slice(0, 5),
        [getCurrentData]
    );

    const topLosers = useMemo(() =>
        [...getCurrentData].sort((a, b) => a.change - b.change).slice(0, 5),
        [getCurrentData]
    );

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: `
          linear-gradient(rgba(0,200,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,200,255,0.1) 1px, transparent 1px)
        `,
                backgroundSize: '50px 50px'
            }}></div>

            <div className="container mx-auto px-4 py-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent animate-gradient">
                        Quantum AI Tracker
                    </h1>
                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 bg-gray-900/80 px-3 py-1.5 rounded-lg border border-cyan-500/20">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-xs">WS: CONNECTED</span>
                        </div>
                        <button
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${autoRefresh ? 'bg-green-600' : 'bg-red-600'
                                }`}
                        >
                            {autoRefresh ? 'AUTO: ON' : 'AUTO: OFF'}
                        </button>
                        <button
                            onClick={() => setShowAuthModal(true)}
                            className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium"
                        >
                            ВХОД
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gray-900/60 p-4 rounded-xl border border-purple-500/20">
                            <div className="flex gap-2 mb-4">
                                <button className="flex-1 py-1 px-2 bg-green-600/20 text-green-400 rounded text-xs">📈 Top Gainers</button>
                                <button className="flex-1 py-1 px-2 bg-red-600/20 text-red-400 rounded text-xs">📉 Top Losers</button>
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {topGainers.map(token => (
                                    <div
                                        key={token.symbol}
                                        onClick={() => handleTokenSelect(token)}
                                        className={`p-2.5 rounded cursor-pointer ${selectedToken?.symbol === token.symbol ? 'bg-purple-600/30 border border-purple-500/50' : 'hover:bg-gray-700/50'
                                            }`}
                                    >
                                        <div className="flex justify-between">
                                            <span className="font-bold text-sm">{token.symbol.replace('USDT', '')}</span>
                                            <div className="text-right">
                                                <div className="font-semibold">${token.price.toFixed(2)}</div>
                                                <div className={`text-xs ${token.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {token.change >= 0 ? '+' : ''}{token.change.toFixed(2)}%
                                                </div>
                                                {showFunding && token.fundingRate !== null && (
                                                    <div className={`text-xs ${token.fundingRate >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                                                        {token.fundingRate >= 0 ? '+' : ''}{(token.fundingRate * 100).toFixed(3)}%
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedToken?.openInterest && (
                            <div className="bg-gray-900/60 p-4 rounded-xl border border-purple-500/20">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-semibold">Open Interest</span>
                                    <div className="flex gap-1">
                                        {['1m', '5m', '15m'].map(tf => (
                                            <button
                                                key={tf}
                                                onClick={() => setOiTimeframe(tf)}
                                                className={`px-1.5 py-0.5 text-xs rounded ${oiTimeframe === tf ? 'bg-purple-600 text-white' : 'bg-gray-700/50'
                                                    }`}
                                            >
                                                {tf}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1.5 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-400">Taker Buy ({oiTimeframe})</span><span className="text-green-400">22,439.3</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Taker Sell ({oiTimeframe})</span><span className="text-red-400">21,325.5</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Open Interest</span><span>10,742,841</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Δ OI vs prev</span><span>0</span></div>
                                    <div className="flex justify-between"><span className="text-gray-400">Total (Buy+Sell)</span><span>43,764.8</span></div>
                                </div>
                            </div>
                        )}

                        <div className="bg-gray-900/60 p-4 rounded-xl border border-purple-500/20">
                            <h3 className="font-semibold mb-2 text-sm">Settings</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs">Funding Rates</span>
                                    <button
                                        onClick={() => setShowFunding(!showFunding)}
                                        className={`w-8 h-4 rounded-full relative ${showFunding ? 'bg-purple-600' : 'bg-gray-600'}`}
                                    >
                                        <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${showFunding ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3 space-y-6">
                        {selectedToken && (
                            <div className="bg-gray-900/60 p-5 rounded-xl border border-cyan-500/20">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center font-bold">
                                            {selectedToken.symbol.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">{selectedToken.symbol.replace('USDT', '')}</h2>
                                            <p className="text-gray-400 text-sm">{selectedToken.symbol} • {activeExchange} {activeType}</p>
                                        </div>
                                    </div>
                                    <div className="text-right mt-3 md:mt-0">
                                        <div className="text-2xl font-bold">${selectedToken.price.toFixed(2)}</div>
                                        <div className={`text-lg ${selectedToken.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {selectedToken.change >= 0 ? '+' : ''}{selectedToken.change.toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-900/80 h-64 rounded-xl flex items-center justify-center border border-cyan-500/20">
                                    <div className="text-center text-gray-400">
                                        <div className="font-bold">TradingView Chart</div>
                                        <div className="text-sm">{selectedToken.symbol}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {aiSignal && (
                            <div className="bg-gray-900/60 p-5 rounded-xl border border-cyan-500/20">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                    <h3 className="text-xl font-bold text-cyan-300">🤖 Quantum AI Signal Analysis</h3>
                                    <div className="flex gap-2 mt-2 md:mt-0">
                                        {aiSignal.timeframes.map(tf => (
                                            <button
                                                key={tf}
                                                onClick={() => setTimeframe(tf)}
                                                className={`px-2.5 py-1 rounded text-xs ${timeframe === tf ? 'bg-purple-600 text-white' : 'bg-gray-700/50'
                                                    }`}
                                            >
                                                {tf}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-800/50 p-4 rounded-lg">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className={`px-2.5 py-1 rounded text-sm font-bold ${aiSignal.recommendation.includes('BUY') ? 'bg-green-600/20 text-green-400' :
                                                    aiSignal.recommendation.includes('SELL') ? 'bg-red-600/20 text-red-400' : 'bg-yellow-600/20 text-yellow-400'
                                                }`}>
                                                {aiSignal.recommendation.replace('_', ' ')}
                                            </span>
                                            <span className="text-sm">Conf: {aiSignal.confidence}%</span>
                                            <span className="text-sm">RR: {aiSignal.riskReward}:1</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 mb-3">
                                            <div className="text-center"><div className="text-gray-400 text-xs">Entry</div><div className="font-bold">${aiSignal.entryPrice.toFixed(4)}</div></div>
                                            <div className="text-center"><div className="text-gray-400 text-xs">SL</div><div className="font-bold text-red-400">${aiSignal.stopLoss.toFixed(4)}</div></div>
                                            <div className="text-center"><div className="text-gray-400 text-xs">TP</div><div className="font-bold text-green-400">${aiSignal.takeProfit.toFixed(4)}</div></div>
                                        </div>
                                        <div className="text-sm text-gray-300">{aiSignal.analysis}</div>
                                    </div>
                                    <div className="bg-gray-800/50 p-4 rounded-lg">
                                        <h4 className="font-bold mb-2">Technical Indicators</h4>
                                        <div className="space-y-1.5">
                                            {Object.entries(aiSignal.indicators).map(([key, val]) => (
                                                <div key={key} className="flex justify-between">
                                                    <span className="text-gray-400 capitalize text-sm">{key}</span>
                                                    <span className={`font-bold text-sm ${(key === 'rsi' && val > 70) || (val === 'bearish') || (val === 'below') || (val === 'decreasing')
                                                            ? 'text-red-400' : 'text-green-400'
                                                        }`}>
                                                        {val}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-gray-900/60 p-5 rounded-xl border border-cyan-500/20">
                            <h3 className="text-xl font-bold mb-4">All Tokens</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                                {filteredData.map(token => (
                                    <div
                                        key={token.symbol}
                                        onClick={() => handleTokenSelect(token)}
                                        className={`p-3 rounded cursor-pointer border ${selectedToken?.symbol === token.symbol ? 'border-purple-500 bg-purple-600/20' : 'border-gray-700/50 hover:bg-gray-700/50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-gradient-to-r from-cyan-500 to-purple-500 rounded flex items-center justify-center font-bold text-xs">
                                                    {token.symbol.charAt(0)}
                                                </div>
                                                <span className="font-bold text-sm">{token.symbol.replace('USDT', '')}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold">${token.price.toFixed(2)}</div>
                                                <div className={`text-xs ${token.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {token.change >= 0 ? '+' : ''}{token.change.toFixed(2)}%
                                                </div>
                                                {showFunding && token.fundingRate !== null && (
                                                    <div className={`text-xs ${token.fundingRate >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
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

            {showAuthModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900/90 p-6 rounded-2xl w-full max-w-md border border-cyan-500/30">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-cyan-300">{authMode === 'login' ? 'Вход' : 'Регистрация'}</h2>
                            <button onClick={() => setShowAuthModal(false)} className="text-gray-400 text-2xl">×</button>
                        </div>
                        <div className="space-y-3">
                            <input type="email" placeholder="Email" className="w-full bg-gray-800/50 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400" />
                            <input type="password" placeholder="Password" className="w-full bg-gray-800/50 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400" />
                            <button className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 py-2 rounded font-medium">
                                {authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
                            </button>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-700">
                            <div className="grid grid-cols-2 gap-2">
                                <button className="flex items-center justify-center gap-2 bg-gray-800/50 py-2 rounded border border-gray-600">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                    Google
                                </button>
                                <button className="flex items-center justify-center gap-2 bg-gray-800/50 py-2 rounded border border-gray-600">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C6.48 0 2 4.48 2 10.017c0 4.422 2.865 8.167 6.839 9.495.5.09.68-.22.68-.48l-.01-1.73c-2.78 0.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.38-1.99 1-2.69-.1-.25-.44-1.27.1-2.65 0 0 .81-.26 2.64 1 0 0 .78-.22 2.15-.22.36 0 1.02.09 1.48.13 1.04-1.48 2.57-2.11 3.99-2.11.84 0 1.65.09 2.45.27.8-.9 1.92-1.48 3.14-1.48 1.04 0 1.95.46 2.58 1.2.63-.14 1.29-.26 1.97-.35.68-.09 1.37-.13 2.07-.13.69 0 1.38.04 2.07.13 1.22.09 2.34.67 3.14 1.48.8.79 1.29 1.7 1.29 2.71 0 1.38-.47 2.64-1.25 3.64.14.12.26.34.26.57l-.01 2.32c0 .26.18.57.69.48 3.97-1.33 6.83-5.07 6.83-9.49C22 4.48 17.52 0 12.017 0z" /></svg>
                                    Apple
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}