'use client';

import React, { useState } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { supabase } from '@/lib/supabaseClient';
import { ReportCategory } from '@/types';
import {
  MapPin,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  TrafficCone,
  Siren,
  ArrowLeft,
  Navigation,
  RefreshCw,
} from 'lucide-react';

export default function Home() {
  const { latitude, longitude, error, loading } = useGeolocation();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSelectCategory = (category: ReportCategory) => {
    setSelectedCategory(category);
    setStep(3);
  };

  const handleConfirmAndSend = async () => {
    if (!latitude || !longitude || !selectedCategory) return;

    setSubmitting(true);
    setFeedback(null);

    const deviceHash = window.navigator.userAgent + (screen.width * screen.height);

    try {
      const { data, error: rpcError } = await supabase.rpc('submit_report', {
        lat: latitude,
        lng: longitude,
        cat: selectedCategory,
        dev_hash: deviceHash,
      });

      if (rpcError) throw rpcError;

      if (data && !data.success) {
        setFeedback({ type: 'error', message: data.message });
      } else {
        setFeedback({ type: 'success', message: 'Reporte registrado com sucesso!' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao conectar com o servidor.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedCategory(null);
    setFeedback(null);
  };

  const categoryLabels: Record<
    ReportCategory,
    { title: string; icon: React.ReactNode; color: string }
  > = {
    TRAVADO: {
      title: 'Sinal Travado',
      icon: <TrafficCone className="w-6 h-6 text-amber-600" />,
      color: 'border-amber-300 bg-amber-50',
    },
    TRANSVERSAL_VAZIA: {
      title: 'Via Transversal Vazia',
      icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
      color: 'border-orange-300 bg-orange-50',
    },
    BLOQUEANDO_EMERGENCIA: {
      title: 'Bloqueando Emergência',
      icon: <Siren className="w-6 h-6 text-red-600" />,
      color: 'border-red-300 bg-red-50',
    },
  };

  const googleMapsUrl = latitude && longitude
    ? `https://maps.google.com/maps?q=${latitude},${longitude}&z=17&output=embed`
    : '';

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 flex justify-center">
      <main className="w-full max-w-md min-h-screen bg-white flex flex-col justify-between p-5 font-sans">
        {/* Header Fixo com Mapa */}
        <header className="pt-2 text-center relative">
          {step > 1 && !feedback && (
            <button
              onClick={() => setStep((prev) => (prev - 1) as 1 | 2)}
              className="absolute left-0 top-3 text-slate-600 hover:text-slate-900 flex items-center gap-1 text-xs font-semibold bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm transition z-20"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
          )}

          <h1 className="text-2xl font-black tracking-tight text-amber-600">
            SinalAberto <span className="text-slate-800 text-base font-light">Recife</span>
          </h1>

          {/* Status do GPS */}
          <div className="mt-2 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium">
            <MapPin className={`w-3.5 h-3.5 ${latitude ? 'text-emerald-600' : 'text-amber-500 animate-spin'}`} />
            <span>
              {loading
                ? 'Obtendo GPS...'
                : error
                ? 'GPS Desativado'
                : 'Localização ativa (GPS)'}
            </span>
          </div>

          {/* Google Maps ao Vivo */}
          {latitude && longitude && !feedback && step === 1 && (
            <div className="mt-4 w-full h-36 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
              <iframe
                title="Google Maps ao Vivo"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={googleMapsUrl}
              ></iframe>
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-700 border border-emerald-300 flex items-center gap-1 shadow-sm">
                <Navigation className="w-3 h-3 animate-pulse text-emerald-600" /> Google Maps Ao Vivo
              </div>
            </div>
          )}
        </header>

        {/* FEEDBACK APÓS ENVIO */}
        {feedback ? (
          <div className="my-auto space-y-6 text-center">
            <div
              className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                  : 'bg-rose-50 border-rose-400 text-rose-950'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-16 h-16 text-emerald-600 animate-bounce" />
              ) : (
                <ShieldAlert className="w-16 h-16 text-rose-600" />
              )}
              <h2 className="text-xl font-bold">
                {feedback.type === 'success' ? 'Ocorrência Registrada!' : 'Atenção'}
              </h2>
              <p className="text-sm opacity-90">{feedback.message}</p>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl border border-slate-300 shadow-sm flex items-center justify-center gap-2 transition"
            >
              <RefreshCw className="w-5 h-5 text-amber-600" /> Fazer Novo Reporte
            </button>
          </div>
        ) : (
          <>
            {/* PASSO 1: BOTÃO NO MEIO DA PÁGINA + TEXTO ABAIXO */}
            {step === 1 && (
              <div className="my-auto flex flex-col items-center justify-center text-center py-4">
                {/* Botão Vermelho Pulsando no Centro */}
                <div className="relative flex items-center justify-center my-6">
                  <span className="absolute w-64 h-64 bg-red-400/20 rounded-full animate-ping duration-1000"></span>
                  <span className="absolute w-52 h-52 bg-red-500/15 rounded-full animate-pulse"></span>

                  <button
                    onClick={() => setStep(2)}
                    disabled={loading || !!error}
                    className="relative z-10 w-48 h-48 rounded-full bg-gradient-to-tr from-red-600 via-red-500 to-rose-500 border-4 border-white shadow-[0_10px_35px_rgba(225,29,72,0.35)] flex flex-col items-center justify-center text-white active:scale-95 transition transform disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Siren className="w-16 h-16 mb-2 animate-bounce" />
                    <span className="text-lg font-black tracking-wider uppercase">REPORTAR</span>
                    <span className="text-xs font-semibold opacity-90">SINAL</span>
                  </button>
                </div>

                {/* Texto Movido para Baixo do Botão */}
                <p className="text-slate-600 text-sm mt-4 font-medium max-w-xs">
                  Presenciou um problema no sinal? Toque no botão acima:
                </p>

                {error && (
                  <p className="text-rose-700 text-xs mt-4 bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl">
                    {error}
                  </p>
                )}
              </div>
            )}

            {/* PASSO 2: CLASSIFICAR OCORRÊNCIA */}
            {step === 2 && (
              <div className="my-auto space-y-4">
                <div className="text-center mb-6">
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                    Passo 1 de 2
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">Classifique a Ocorrência</h2>
                  <p className="text-xs text-slate-500 mt-1">Qual é a situação exata deste cruzamento?</p>
                </div>

                <button
                  onClick={() => handleSelectCategory('TRAVADO')}
                  className="w-full py-5 px-4 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black rounded-2xl border-2 border-amber-400 shadow-md flex items-center gap-4 text-left transition"
                >
                  <TrafficCone className="w-9 h-9 shrink-0 text-slate-950" />
                  <div>
                    <div className="text-base uppercase tracking-wide">Sinal Travado</div>
                    <div className="text-xs font-normal opacity-90">
                      Sinal demorado ou preso sem motivo
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectCategory('TRANSVERSAL_VAZIA')}
                  className="w-full py-5 px-4 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black rounded-2xl border-2 border-orange-400 shadow-md flex items-center gap-4 text-left transition"
                >
                  <AlertTriangle className="w-9 h-9 shrink-0 text-white" />
                  <div>
                    <div className="text-base uppercase tracking-wide">Via Transversal Vazia</div>
                    <div className="text-xs font-normal opacity-90">
                      Ninguém cruza, o sinal segue fechado
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectCategory('BLOQUEANDO_EMERGENCIA')}
                  className="w-full py-5 px-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black rounded-2xl border-2 border-red-500 shadow-md flex items-center gap-4 text-left transition animate-pulse"
                >
                  <Siren className="w-9 h-9 shrink-0 text-white" />
                  <div>
                    <div className="text-base uppercase tracking-wide">Bloqueando Emergência</div>
                    <div className="text-xs font-normal opacity-90">
                      Sinal impedindo a passagem de socorro
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* PASSO 3: CONFIRMAR LOCALIZAÇÃO */}
            {step === 3 && selectedCategory && (
              <div className="my-auto space-y-4">
                <div className="text-center">
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                    Passo 2 de 2
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">Confirmar Localização</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Confira seu posicionamento exato no Google Maps
                  </p>
                </div>

                <div className="bg-white border border-slate-300 rounded-2xl overflow-hidden shadow-sm">
                  <div className="h-52 w-full relative bg-slate-100">
                    {latitude && longitude ? (
                      <iframe
                        title="Google Maps Posicionamento Exato"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        src={googleMapsUrl}
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                        Obtendo coordenadas do GPS...
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-white flex items-center justify-between border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg border ${categoryLabels[selectedCategory].color}`}>
                        {categoryLabels[selectedCategory].icon}
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Motivo</div>
                        <div className="text-xs font-bold text-slate-800">
                          {categoryLabels[selectedCategory].title}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <Navigation className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                      <span>GPS ao Vivo</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleConfirmAndSend}
                  disabled={submitting}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-base tracking-wider rounded-2xl shadow-lg flex items-center justify-center gap-2 border border-emerald-500 transition disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" /> CONFIRMAR E ENVIAR
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}