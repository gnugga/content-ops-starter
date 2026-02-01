'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Calculator3DScene = dynamic(() => import('./Calculator3DScene'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-64 md:h-80 lg:h-96 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
            <div className="text-white text-lg">Laster 3D-scene...</div>
        </div>
    ),
});

type OperationType = 'add' | 'subtract' | 'multiply' | 'divide' | 'equals' | 'idle';

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

    const triggerAnimation = useCallback((op: OperationType) => {
        setOperation(op);
        setIsAnimating(true);
        setTimeout(() => {
            if (op !== 'equals') {
                setOperation('idle');
            }
            setIsAnimating(op === 'equals');
        }, 2000);
    }, []);

    const handleNumber = useCallback((num: string) => {
        if (waitingForNewNumber) {
            setDisplay(num);
            setWaitingForNewNumber(false);
        } else {
            setDisplay((prev) => (prev === '0' ? num : prev + num));
        }
        if (operation === 'equals') {
            setOperation('idle');
            setIsAnimating(false);
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
                if (currentValue === 0) {
                    setDisplay('Feil');
                    setPreviousValue(null);
                    setPendingOperation(null);
                    setWaitingForNewNumber(true);
                    return;
                }
                result = previousValue / currentValue;
                break;
            default:
                return;
        }

        const resultString = Number.isInteger(result) ? String(result) : result.toFixed(8).replace(/\.?0+$/, '');
        setDisplay(resultString);
        setPreviousValue(null);
        setPendingOperation(null);
        setWaitingForNewNumber(true);
        triggerAnimation('equals');
    }, [display, previousValue, pendingOperation, triggerAnimation]);

    const handleClear = useCallback(() => {
        setDisplay('0');
        setPreviousValue(null);
        setPendingOperation(null);
        setWaitingForNewNumber(false);
        setOperation('idle');
        setIsAnimating(false);
    }, []);

    const handleBackspace = useCallback(() => {
        setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    }, []);

    const handlePlusMinus = useCallback(() => {
        setDisplay((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
    }, []);

    const handlePercent = useCallback(() => {
        const value = parseFloat(display);
        setDisplay(String(value / 100));
    }, [display]);

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
    }: {
        children: React.ReactNode;
        onClick: () => void;
        className?: string;
        span?: number;
    }) => (
        <button
            onClick={onClick}
            className={`
                p-4 md:p-5 text-lg md:text-xl font-semibold rounded-xl
                transition-all duration-200 transform
                hover:scale-105 active:scale-95
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
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
        <div className={`max-w-md mx-auto p-4 ${className}`}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                {/* 3D Animation Scene */}
                <Calculator3DScene
                    operation={operation}
                    result={display}
                    isAnimating={isAnimating}
                />

                {/* Display */}
                <div className="p-4 bg-slate-100 dark:bg-slate-700">
                    {previousValue !== null && pendingOperation && (
                        <div className="text-right text-sm text-slate-500 dark:text-slate-400 h-5">
                            {previousValue} {getOperationSymbol()}
                        </div>
                    )}
                    <div className="text-right text-4xl md:text-5xl font-bold text-slate-800 dark:text-white truncate">
                        {display}
                    </div>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-4 gap-2 p-4 bg-slate-50 dark:bg-slate-900">
                    {/* Row 1 */}
                    <Button
                        onClick={handleClear}
                        className="bg-red-500 hover:bg-red-600 text-white"
                    >
                        C
                    </Button>
                    <Button
                        onClick={handlePlusMinus}
                        className="bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-800 dark:text-white"
                    >
                        +/-
                    </Button>
                    <Button
                        onClick={handlePercent}
                        className="bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-800 dark:text-white"
                    >
                        %
                    </Button>
                    <Button
                        onClick={() => handleOperation('divide')}
                        className={`${pendingOperation === 'divide' ? 'bg-blue-600' : 'bg-blue-500'} hover:bg-blue-600 text-white`}
                    >
                        ÷
                    </Button>

                    {/* Row 2 */}
                    <Button
                        onClick={() => handleNumber('7')}
                        className="bg-white hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white shadow"
                    >
                        7
                    </Button>
                    <Button
                        onClick={() => handleNumber('8')}
                        className="bg-white hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white shadow"
                    >
                        8
                    </Button>
                    <Button
                        onClick={() => handleNumber('9')}
                        className="bg-white hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white shadow"
                    >
                        9
                    </Button>
                    <Button
                        onClick={() => handleOperation('multiply')}
                        className={`${pendingOperation === 'multiply' ? 'bg-purple-600' : 'bg-purple-500'} hover:bg-purple-600 text-white`}
                    >
                        ×
                    </Button>

                    {/* Row 3 */}
                    <Button
                        onClick={() => handleNumber('4')}
                        className="bg-white hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white shadow"
                    >
                        4
                    </Button>
                    <Button
                        onClick={() => handleNumber('5')}
                        className="bg-white hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white shadow"
                    >
                        5
                    </Button>
                    <Button
                        onClick={() => handleNumber('6')}
                        className="bg-white hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white shadow"
                    >
                        6
                    </Button>
                    <Button
                        onClick={() => handleOperation('subtract')}
                        className={`${pendingOperation === 'subtract' ? 'bg-red-600' : 'bg-red-500'} hover:bg-red-600 text-white`}
                    >
                        -
                    </Button>

                    {/* Row 4 */}
                    <Button
                        onClick={() => handleNumber('1')}
                        className="bg-white hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white shadow"
                    >
                        1
                    </Button>
                    <Button
                        onClick={() => handleNumber('2')}
                        className="bg-white hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white shadow"
                    >
                        2
                    </Button>
                    <Button
                        onClick={() => handleNumber('3')}
                        className="bg-white hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white shadow"
                    >
                        3
                    </Button>
                    <Button
                        onClick={() => handleOperation('add')}
                        className={`${pendingOperation === 'add' ? 'bg-green-600' : 'bg-green-500'} hover:bg-green-600 text-white`}
                    >
                        +
                    </Button>

                    {/* Row 5 */}
                    <Button
                        onClick={handleBackspace}
                        className="bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-800 dark:text-white"
                    >
                        ⌫
                    </Button>
                    <Button
                        onClick={() => handleNumber('0')}
                        className="bg-white hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white shadow"
                    >
                        0
                    </Button>
                    <Button
                        onClick={handleDecimal}
                        className="bg-white hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white shadow"
                    >
                        .
                    </Button>
                    <Button
                        onClick={handleEquals}
                        className="bg-amber-500 hover:bg-amber-600 text-white"
                    >
                        =
                    </Button>
                </div>

                {/* Animation indicator */}
                <div className="px-4 pb-4 bg-slate-50 dark:bg-slate-900">
                    <div className="text-center text-xs text-slate-500 dark:text-slate-400">
                        {isAnimating && operation !== 'idle' && (
                            <span className="inline-flex items-center gap-1">
                                <span className="animate-pulse">●</span>
                                {operation === 'add' && 'Addisjon - Grønne partikler samles!'}
                                {operation === 'subtract' && 'Subtraksjon - Røde kuber imploderer!'}
                                {operation === 'multiply' && 'Multiplikasjon - Lilla knuter spinner!'}
                                {operation === 'divide' && 'Divisjon - Blå plan deler!'}
                                {operation === 'equals' && 'Resultat - Gyllen feiring!'}
                            </span>
                        )}
                        {!isAnimating && (
                            <span>Bruk tastatur eller klikk knappene</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
