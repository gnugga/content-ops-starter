import React from 'react';
import Head from 'next/head';
import Calculator from '../components/Calculator';

export default function KalkulatorPage() {
    return (
        <>
            <Head>
                <title>Quantum Calculator 3D</title>
                <meta name="description" content="En episk 3D-kalkulator med unike animasjoner for hver matematisk operasjon. Opplev matematikk som aldri før!" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#0f0f23" />
            </Head>
            <main className="min-h-screen bg-[#0f0f23] relative overflow-hidden">
                {/* Animated background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    {/* Gradient orbs */}
                    <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />

                    {/* Grid pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.02]"
                        style={{
                            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                            backgroundSize: '50px 50px',
                        }}
                    />

                    {/* Floating particles */}
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-white/20 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
                                animationDelay: `${Math.random() * 5}s`,
                            }}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className="relative z-10 py-8 px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <header className="text-center mb-8">
                            <div className="inline-block mb-4">
                                <span className="text-xs font-mono text-purple-400 tracking-widest uppercase bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                                    Next-Gen Mathematics
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">
                                <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                                    Quantum
                                </span>
                                <br />
                                <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
                                    Calculator
                                </span>
                            </h1>
                            <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
                                Opplev matematikk transformert til kunst. Hver operasjon utløser
                                unike 3D-animasjoner i sanntid.
                            </p>
                        </header>

                        {/* Calculator */}
                        <Calculator />

                        {/* Features Grid */}
                        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="group p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover:scale-105">
                                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">+</div>
                                <div className="text-emerald-300 font-semibold text-sm">Fusion Merge</div>
                                <div className="text-emerald-400/60 text-xs mt-1">Meteorer kolliderer</div>
                            </div>
                            <div className="group p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 to-rose-500/5 border border-rose-500/20 hover:border-rose-500/40 transition-all hover:scale-105">
                                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">−</div>
                                <div className="text-rose-300 font-semibold text-sm">Black Hole</div>
                                <div className="text-rose-400/60 text-xs mt-1">Partikler suges inn</div>
                            </div>
                            <div className="group p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 hover:border-purple-500/40 transition-all hover:scale-105">
                                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">×</div>
                                <div className="text-purple-300 font-semibold text-sm">DNA Helix</div>
                                <div className="text-purple-400/60 text-xs mt-1">Dobbel helix spinner</div>
                            </div>
                            <div className="group p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 hover:border-cyan-500/40 transition-all hover:scale-105">
                                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">÷</div>
                                <div className="text-cyan-300 font-semibold text-sm">Quantum Split</div>
                                <div className="text-cyan-400/60 text-xs mt-1">Laser skjærer gjennom</div>
                            </div>
                        </div>

                        {/* Easter Egg Info */}
                        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-pink-500/10 border border-amber-500/20">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-2xl">✨</span>
                                <h2 className="text-lg font-bold text-amber-300">Hemmelige Magiske Tall</h2>
                            </div>
                            <p className="text-amber-200/70 text-sm mb-4">
                                Noen resultater utløser spesielle regnbue-animasjoner! Prøv å få disse tallene:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { num: '42', hint: 'Svaret på alt' },
                                    { num: '69', hint: 'Nice' },
                                    { num: '420', hint: 'Blazin\'' },
                                    { num: '1337', hint: 'L33T' },
                                    { num: '666', hint: 'Djevelens tall' },
                                    { num: '777', hint: 'Jackpot!' },
                                    { num: 'π', hint: '3.14159...' },
                                    { num: 'e', hint: '2.71828...' },
                                    { num: 'φ', hint: '1.61803...' },
                                ].map((item) => (
                                    <div
                                        key={item.num}
                                        className="group relative px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-amber-500/50 transition-all cursor-help"
                                    >
                                        <span className="text-white/80 font-mono font-bold">{item.num}</span>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-black/90 text-xs text-white/70 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                            {item.hint}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Keyboard Shortcuts */}
                        <div className="mt-8 text-center">
                            <div className="inline-flex flex-wrap justify-center gap-2 text-xs">
                                <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white/50 font-mono">0-9</kbd>
                                <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white/50 font-mono">+ - * /</kbd>
                                <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white/50 font-mono">Enter</kbd>
                                <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white/50 font-mono">Esc</kbd>
                                <span className="text-white/30 self-center">Tastaturstøtte</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <footer className="mt-12 text-center text-white/20 text-xs font-mono">
                            <p>Bygget med Three.js, React Three Fiber og kjærlighet til matematikk</p>
                        </footer>
                    </div>
                </div>

                {/* Custom CSS for animations */}
                <style jsx>{`
                    @keyframes float {
                        0%, 100% {
                            transform: translateY(0) translateX(0);
                            opacity: 0.2;
                        }
                        50% {
                            transform: translateY(-20px) translateX(10px);
                            opacity: 0.5;
                        }
                    }
                `}</style>
            </main>
        </>
    );
}
