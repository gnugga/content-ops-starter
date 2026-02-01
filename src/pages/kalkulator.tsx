import React from 'react';
import Head from 'next/head';
import Calculator from '../components/Calculator';

export default function KalkulatorPage() {
    return (
        <>
            <Head>
                <title>3D Kalkulator</title>
                <meta name="description" content="En kalkulator med imponerende 3D-animasjoner for hver matematisk operasjon" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <main className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <header className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-4">
                            3D Kalkulator
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                            En interaktiv kalkulator som viser unike 3D-animasjoner for hver matematisk operasjon.
                            Prøv addisjon, subtraksjon, multiplikasjon og divisjon!
                        </p>
                    </header>

                    <Calculator />

                    <footer className="mt-12 text-center">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg max-w-2xl mx-auto">
                            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">
                                Animasjoner
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                                    <div className="text-2xl mb-1">+</div>
                                    <div className="text-green-700 dark:text-green-300 font-medium">Addisjon</div>
                                    <div className="text-green-600 dark:text-green-400 text-xs">Grønne partikler</div>
                                </div>
                                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
                                    <div className="text-2xl mb-1">-</div>
                                    <div className="text-red-700 dark:text-red-300 font-medium">Subtraksjon</div>
                                    <div className="text-red-600 dark:text-red-400 text-xs">Røde kuber</div>
                                </div>
                                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                    <div className="text-2xl mb-1">×</div>
                                    <div className="text-purple-700 dark:text-purple-300 font-medium">Multiplikasjon</div>
                                    <div className="text-purple-600 dark:text-purple-400 text-xs">Lilla knuter</div>
                                </div>
                                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                    <div className="text-2xl mb-1">÷</div>
                                    <div className="text-blue-700 dark:text-blue-300 font-medium">Divisjon</div>
                                    <div className="text-blue-600 dark:text-blue-400 text-xs">Blå plan</div>
                                </div>
                            </div>
                            <div className="mt-4 p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                                <div className="text-2xl mb-1">=</div>
                                <div className="text-amber-700 dark:text-amber-300 font-medium">Resultat</div>
                                <div className="text-amber-600 dark:text-amber-400 text-xs">Gyllen feiring med ringer og gnister!</div>
                            </div>
                        </div>

                        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                            Tips: Du kan også bruke tastaturet! Tall, +, -, *, /, Enter og Escape fungerer.
                        </p>
                    </footer>
                </div>
            </main>
        </>
    );
}
