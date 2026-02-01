'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const Calculator3DScene = dynamic(() => import('./Calculator3DScene'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-72 md:h-96 lg:h-[28rem] rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
            <div className="text-white text-lg font-mono animate-pulse z-10">Initialiserer 3D-motor...</div>
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white/30 rounded-full animate-ping"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${1 + Math.random() * 2}s`,
                        }}
                    />
                ))}
            </div>
        </div>
    ),
});

type OperationType = 'add' | 'subtract' | 'multiply' | 'divide' | 'equals' | 'idle' | 'magic';

interface HistoryItem {
    expression: string;
    result: string;
    operation: OperationType;
    timestamp: number;
}

// Magic numbers that trigger special animations
const MAGIC_NUMBERS = [42, 69, 420, 1337, 666, 777, 3.14159, 2.71828, 1.61803, 0, 123, 321, 111, 222, 333, 444, 555, 888, 999];

const isMagicNumber = (num: number): boolean => {
    return MAGIC_NUMBERS.some((magic) => Math.abs(num - magic) < 0.001 || num.toString().includes('1337'));
};

// Sound effects using Web Audio API
const createAudioContext = () => {
    if (typeof window === 'undefined') return null;
    return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
};

const playSound = (type: OperationType, audioContext: AudioContext | null) => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const frequencies: Record<string, number[]> = {
        add: [523.25, 659.25, 783.99], // C5, E5, G5 - happy major chord
        subtract: [440, 349.23, 293.66], // A4, F4, D4 - descending
        multiply: [523.25, 622.25, 739.99, 880], // chromatic rise
        divide: [880, 659.25, 440, 329.63], // descending
        equals: [523.25, 659.25, 783.99, 1046.5], // celebration arpeggio
        magic: [440, 554.37, 659.25, 880, 1108.73, 1318.51], // magical arpeggio
    };

    const freqs = frequencies[type] || [440];
    let time = audioContext.currentTime;

    freqs.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.type = type === 'magic' ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, time + i * 0.1);

        gain.gain.setValueAtTime(0, time + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.15, time + i * 0.1 + 0.05);
        gain.gain.linearRampToValueAtTime(0, time + i * 0.1 + 0.3);

        osc.start(time + i * 0.1);
        osc.stop(time + i * 0.1 + 0.4);
    });
};

interface CalculatorProps {
    className?: string;
}

export default function Calculator({ className = '' }: CalculatorProps) {
    const [display, setDisplay] = useState('0');
    const [previousValue, setPreviousValue] = useState<number | null>(null);
    const [operation, setOperation] = useState<OperationType>('idle');
    const [pendingOperation, setPendingOperation] = useState<OperationType | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [waitingForNewNumber, setWaitingForNewNumber] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isMagic, setIsMagic] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [combo, setCombo] = useState(0);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        audioContextRef.current = createAudioContext();
        return () => {
            audioContextRef.current?.close();
        };
    }, []);

    const triggerAnimation = useCallback((op: OperationType, resultValue?: number) => {
        const isMagicResult = resultValue !== undefined && isMagicNumber(resultValue);

        if (isMagicResult) {
            setOperation('magic');
            setIsMagic(true);
            if (soundEnabled) playSound('magic', audioContextRef.current);
        } else {
            setOperation(op);
            setIsMagic(false);
            if (soundEnabled) playSound(op, audioContextRef.current);
        }

        setIsAnimating(true);

        // Vibration feedback if available
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(op === 'equals' || isMagicResult ? [50, 30, 50, 30, 100] : [30]);
        }

        setTimeout(() => {
            if (op !== 'equals' && !isMagicResult) {
                setOperation('idle');
            }
            setIsAnimating(op === 'equals' || isMagicResult);
        }, isMagicResult ? 4000 : 2500);
    }, [soundEnabled]);

    const addToHistory = useCallback((expression: string, result: string, op: OperationType) => {
        setHistory((prev) => [
            { expression, result, operation: op, timestamp: Date.now() },
            ...prev.slice(0, 19), // Keep last 20 items
        ]);
        setCombo((prev) => prev + 1);
    }, []);

    const handleNumber = useCallback((num: string) => {
        if (waitingForNewNumber) {
            setDisplay(num);
            setWaitingForNewNumber(false);
        } else {
            setDisplay((prev) => (prev === '0' ? num : prev.length < 15 ? prev + num : prev));
        }
        if (operation === 'equals' || operation === 'magic') {
            setOperation('idle');
            setIsAnimating(false);
            setIsMagic(false);
        }
    }, [waitingForNewNumber, operation]);

    const handleDecimal = useCallback(() => {
        if (waitingForNewNumber) {
            setDisplay('0.');
            setWaitingForNewNumber(false);
        } else if (!display.includes('.')) {
            setDisplay((prev) => prev + '.');
        }
    }, [display, waitingForNewNumber]);

    const handleOperation = useCallback((op: OperationType) => {
        const currentValue = parseFloat(display);

        if (previousValue !== null && pendingOperation && !waitingForNewNumber) {
            let result: number;
            switch (pendingOperation) {
                case 'add':
                    result = previousValue + currentValue;
                    break;
                case 'subtract':
                    result = previousValue - currentValue;
                    break;
                case 'multiply':
                    result = previousValue * currentValue;
                    break;
                case 'divide':
                    result = previousValue / currentValue;
                    break;
                default:
                    result = currentValue;
            }
            setDisplay(String(result));
            setPreviousValue(result);
        } else {
            setPreviousValue(currentValue);
        }

        setPendingOperation(op);
        setWaitingForNewNumber(true);
        triggerAnimation(op);
    }, [display, previousValue, pendingOperation, waitingForNewNumber, triggerAnimation]);

    const handleEquals = useCallback(() => {
        if (previousValue === null || !pendingOperation) return;

        const currentValue = parseFloat(display);
        let result: number;
        let opSymbol = '';

        switch (pendingOperation) {
            case 'add':
                result = previousValue + currentValue;
                opSymbol = '+';
                break;
            case 'subtract':
                result = previousValue - currentValue;
                opSymbol = '-';
                break;
            case 'multiply':
                result = previousValue * currentValue;
                opSymbol = '×';
                break;
            case 'divide':
                if (currentValue === 0) {
                    setDisplay('UNDEFINED');
                    setPreviousValue(null);
                    setPendingOperation(null);
                    setWaitingForNewNumber(true);
                    triggerAnimation('subtract'); // Error animation
                    return;
                }
                result = previousValue / currentValue;
                opSymbol = '÷';
                break;
            default:
                return;
        }

        const resultString = Number.isInteger(result)
            ? String(result)
            : result.toFixed(8).replace(/\.?0+$/, '');

        const expression = `${previousValue} ${opSymbol} ${currentValue}`;

        setDisplay(resultString);
        addToHistory(expression, resultString, 'equals');
        setPreviousValue(null);
        setPendingOperation(null);
        setWaitingForNewNumber(true);
        triggerAnimation('equals', result);
    }, [display, previousValue, pendingOperation, triggerAnimation, addToHistory]);

    const handleClear = useCallback(() => {
        setDisplay('0');
        setPreviousValue(null);
        setPendingOperation(null);
        setWaitingForNewNumber(false);
        setOperation('idle');
        setIsAnimating(false);
        setIsMagic(false);
        setCombo(0);
    }, []);

    const handleBackspace = useCallback(() => {
        setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    }, []);

    const handlePlusMinus = useCallback(() => {
        setDisplay((prev) => (prev.startsWith('-') ? prev.slice(1) : prev !== '0' ? '-' + prev : prev));
    }, []);

    const handlePercent = useCallback(() => {
        const value = parseFloat(display);
        setDisplay(String(value / 100));
    }, [display]);

    const handleSquare = useCallback(() => {
        const value = parseFloat(display);
        const result = value * value;
        setDisplay(String(result));
        addToHistory(`${value}²`, String(result), 'multiply');
        triggerAnimation('multiply', result);
    }, [display, triggerAnimation, addToHistory]);

    const handleSquareRoot = useCallback(() => {
        const value = parseFloat(display);
        if (value < 0) {
            setDisplay('ERROR');
            return;
        }
        const result = Math.sqrt(value);
        const resultString = Number.isInteger(result) ? String(result) : result.toFixed(8).replace(/\.?0+$/, '');
        setDisplay(resultString);
        addToHistory(`√${value}`, resultString, 'divide');
        triggerAnimation('divide', result);
    }, [display, triggerAnimation, addToHistory]);

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key >= '0' && e.key <= '9') {
                handleNumber(e.key);
            } else if (e.key === '.') {
                handleDecimal();
            } else if (e.key === '+') {
                handleOperation('add');
            } else if (e.key === '-') {
                handleOperation('subtract');
            } else if (e.key === '*') {
                handleOperation('multiply');
            } else if (e.key === '/') {
                e.preventDefault();
                handleOperation('divide');
            } else if (e.key === 'Enter' || e.key === '=') {
                handleEquals();
            } else if (e.key === 'Escape') {
                handleClear();
            } else if (e.key === 'Backspace') {
                handleBackspace();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNumber, handleDecimal, handleOperation, handleEquals, handleClear, handleBackspace]);

    const Button = ({
        children,
        onClick,
        className: btnClassName = '',
        span = 1,
        glow = '',
    }: {
        children: React.ReactNode;
        onClick: () => void;
        className?: string;
        span?: number;
        glow?: string;
    }) => (
        <button
            onClick={onClick}
            className={`
                relative p-4 md:p-5 text-lg md:text-xl font-bold rounded-2xl
                transition-all duration-300 transform
                hover:scale-110 hover:-translate-y-1 active:scale-95
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
                backdrop-blur-xl shadow-lg
                before:absolute before:inset-0 before:rounded-2xl before:transition-opacity
                ${glow ? `before:bg-gradient-to-r ${glow} before:opacity-0 hover:before:opacity-100 before:blur-xl before:-z-10` : ''}
                ${span === 2 ? 'col-span-2' : ''}
                ${btnClassName}
            `}
        >
            {children}
        </button>
    );

    const getOperationSymbol = () => {
        switch (pendingOperation) {
            case 'add': return '+';
            case 'subtract': return '-';
            case 'multiply': return '×';
            case 'divide': return '÷';
            default: return '';
        }
    };

    return (
        <div className={`max-w-lg mx-auto p-4 ${className}`}>
            {/* Main Calculator Card */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_40%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.2),transparent_40%)]" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                    {/* 3D Animation Scene */}
                    <Calculator3DScene
                        operation={operation}
                        result={display}
                        isAnimating={isAnimating}
                        isMagicNumber={isMagic}
                    />

                    {/* Display */}
                    <div className="p-4 backdrop-blur-xl bg-white/5 border-t border-white/10">
                        <div className="flex justify-between items-center mb-2">
                            {previousValue !== null && pendingOperation && (
                                <div className="text-sm text-purple-300/70 font-mono">
                                    {previousValue} {getOperationSymbol()}
                                </div>
                            )}
                            {combo > 1 && (
                                <div className="text-xs text-amber-400 font-bold animate-pulse">
                                    {combo}x COMBO!
                                </div>
                            )}
                        </div>
                        <div className="text-right text-4xl md:text-5xl lg:text-6xl font-bold text-white truncate font-mono tracking-wider">
                            <span className={`transition-all duration-300 ${isMagic ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent animate-pulse' : ''}`}>
                                {display}
                            </span>
                        </div>
                    </div>

                    {/* Control Bar */}
                    <div className="flex justify-between items-center px-4 py-2 backdrop-blur-xl bg-white/5 border-t border-white/10">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="text-xs text-white/50 hover:text-white/80 transition-colors flex items-center gap-1"
                        >
                            <span>{showHistory ? '▼' : '▶'}</span> Historikk ({history.length})
                        </button>
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`text-lg transition-all ${soundEnabled ? 'text-green-400' : 'text-white/30'}`}
                        >
                            {soundEnabled ? '🔊' : '🔇'}
                        </button>
                    </div>

                    {/* History Panel */}
                    {showHistory && history.length > 0 && (
                        <div className="max-h-40 overflow-y-auto backdrop-blur-xl bg-black/30 border-t border-white/10">
                            {history.map((item, i) => (
                                <div
                                    key={item.timestamp}
                                    className="px-4 py-2 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                                    onClick={() => setDisplay(item.result)}
                                >
                                    <div className="text-xs text-white/40 font-mono">{item.expression}</div>
                                    <div className="text-sm text-white/80 font-mono">= {item.result}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="grid grid-cols-4 gap-2 p-4 backdrop-blur-xl bg-black/20">
                        {/* Row 1 - Special Functions */}
                        <Button
                            onClick={handleClear}
                            className="bg-red-500/80 hover:bg-red-500 text-white"
                            glow="from-red-500 to-orange-500"
                        >
                            C
                        </Button>
                        <Button
                            onClick={handleSquare}
                            className="bg-white/10 hover:bg-white/20 text-white/80"
                        >
                            x²
                        </Button>
                        <Button
                            onClick={handleSquareRoot}
                            className="bg-white/10 hover:bg-white/20 text-white/80"
                        >
                            √
                        </Button>
                        <Button
                            onClick={() => handleOperation('divide')}
                            className={`${pendingOperation === 'divide' ? 'bg-cyan-500 ring-2 ring-cyan-300' : 'bg-cyan-500/80 hover:bg-cyan-500'} text-white`}
                            glow="from-cyan-400 to-blue-500"
                        >
                            ÷
                        </Button>

                        {/* Row 2 */}
                        <Button
                            onClick={() => handleNumber('7')}
                            className="bg-white/10 hover:bg-white/20 text-white"
                        >
                            7
                        </Button>
                        <Button
                            onClick={() => handleNumber('8')}
                            className="bg-white/10 hover:bg-white/20 text-white"
                        >
                            8
                        </Button>
                        <Button
                            onClick={() => handleNumber('9')}
                            className="bg-white/10 hover:bg-white/20 text-white"
                        >
                            9
                        </Button>
                        <Button
                            onClick={() => handleOperation('multiply')}
                            className={`${pendingOperation === 'multiply' ? 'bg-purple-500 ring-2 ring-purple-300' : 'bg-purple-500/80 hover:bg-purple-500'} text-white`}
                            glow="from-purple-400 to-pink-500"
                        >
                            ×
                        </Button>

                        {/* Row 3 */}
                        <Button
                            onClick={() => handleNumber('4')}
                            className="bg-white/10 hover:bg-white/20 text-white"
                        >
                            4
                        </Button>
                        <Button
                            onClick={() => handleNumber('5')}
                            className="bg-white/10 hover:bg-white/20 text-white"
                        >
                            5
                        </Button>
                        <Button
                            onClick={() => handleNumber('6')}
                            className="bg-white/10 hover:bg-white/20 text-white"
                        >
                            6
                        </Button>
                        <Button
                            onClick={() => handleOperation('subtract')}
                            className={`${pendingOperation === 'subtract' ? 'bg-rose-500 ring-2 ring-rose-300' : 'bg-rose-500/80 hover:bg-rose-500'} text-white`}
                            glow="from-rose-400 to-red-500"
                        >
                            −
                        </Button>

                        {/* Row 4 */}
                        <Button
                            onClick={() => handleNumber('1')}
                            className="bg-white/10 hover:bg-white/20 text-white"
                        >
                            1
                        </Button>
                        <Button
                            onClick={() => handleNumber('2')}
                            className="bg-white/10 hover:bg-white/20 text-white"
                        >
                            2
                        </Button>
                        <Button
                            onClick={() => handleNumber('3')}
                            className="bg-white/10 hover:bg-white/20 text-white"
                        >
                            3
                        </Button>
                        <Button
                            onClick={() => handleOperation('add')}
                            className={`${pendingOperation === 'add' ? 'bg-emerald-500 ring-2 ring-emerald-300' : 'bg-emerald-500/80 hover:bg-emerald-500'} text-white`}
                            glow="from-emerald-400 to-green-500"
                        >
                            +
                        </Button>

                        {/* Row 5 */}
                        <Button
                            onClick={handlePlusMinus}
                            className="bg-white/10 hover:bg-white/20 text-white/80"
                        >
                            ±
                        </Button>
                        <Button
                            onClick={() => handleNumber('0')}
                            className="bg-white/10 hover:bg-white/20 text-white"
                        >
                            0
                        </Button>
                        <Button
                            onClick={handleDecimal}
                            className="bg-white/10 hover:bg-white/20 text-white"
                        >
                            .
                        </Button>
                        <Button
                            onClick={handleEquals}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white"
                            glow="from-amber-400 to-orange-500"
                        >
                            =
                        </Button>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 backdrop-blur-xl bg-black/30 border-t border-white/10">
                        <div className="text-center text-[10px] text-white/30 font-mono">
                            QUANTUM CALCULATOR v2.0 • Trykk på magiske tall for bonus-animasjoner
                        </div>
                        <div className="flex justify-center gap-2 mt-1">
                            {['42', '69', '420', '1337', 'π'].map((num) => (
                                <span key={num} className="text-[8px] px-1.5 py-0.5 rounded bg-white/10 text-white/40">
                                    {num}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
