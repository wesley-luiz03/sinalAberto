'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';
import { ActiveReport } from '@/types';
import { TrafficCone, AlertTriangle, Siren, RefreshCw, Layers } from 'lucide-react';

// Carrega o mapa dinamicamente desabilitando SSR para evitar erros do Leaflet no servidor
const DashboardMap = dynamic(() => import('@/components/DashboardMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500 text-sm font-medium">
      Carregando mapa interativo...
    </div>
  ),
});

export default function DashboardPage() {
  const [reports, setReports] = useState<ActiveReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar ocorrências ativas (última 1 hora)
  const fetchActiveReports = async () => {
    try {
      const { data, error } = await supabase
        .from('active_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setReports(data as ActiveReport[]);
    } catch (err) {
      console.error('Erro ao buscar ocorrências:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveReports();

    // Inscrição em tempo real para novos reportes
    const channel = supabase
      .channel('realtime-reports')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reports' },
        () => {
          fetchActiveReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Totalizadores por categoria
  const counts = {
    TRAVADO: reports.filter((r) => r.category === 'TRAVADO').length,
    TRANSVERSAL_VAZIA: reports.filter((r) => r.category === 'TRANSVERSAL_VAZIA').length,
    BLOQUEANDO_EMERGENCIA: reports.filter((r) => r.category === 'BLOQUEANDO_EMERGENCIA').length,
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Barra Superior de Monitoramento */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-sm z-10">
        <div>
          <h1 className="text-xl font-black text-amber-600 tracking-tight">
            SinalAberto <span className="text-slate-800 text-sm font-light">Recife</span>
          </h1>
          <p className="text-xs text-slate-500">
            Painel Público de Monitoramento Semafórico • Janela Ativa: Última 1 hora
          </p>
        </div>

        {/* Indicadores numéricos resumidos */}
        <div className="flex items-center gap-3 text-xs font-bold">
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl">
            <TrafficCone className="w-4 h-4 text-amber-600" />
            <span>{counts.TRAVADO} Travados</span>
          </div>

          <div className="flex items-center gap-1.5 bg-orange-50 text-orange-900 border border-orange-200 px-3 py-1.5 rounded-full">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <span>{counts.TRANSVERSAL_VAZIA} Vias Vazinhas</span>
          </div>

          <div className="flex items-center gap-1.5 bg-red-50 text-red-900 border border-red-200 px-3 py-1.5 rounded-full">
            <Siren className="w-4 h-4 text-red-600" />
            <span>{counts.BLOQUEANDO_EMERGENCIA} Emergências</span>
          </div>

          <button
            onClick={fetchActiveReports}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full border border-slate-300 transition"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Conteúdo Principal: Mapa em Tela Cheia com Legenda */}
      <div className="flex-1 relative w-full h-[calc(100vh-73px)]">
        <DashboardMap reports={reports} />

        {/* Legenda Flutuante */}
        <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md border border-slate-300 p-4 rounded-2xl shadow-xl z-[1000] max-w-xs text-xs space-y-2">
          <div className="font-bold text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-200">
            <Layers className="w-4 h-4 text-slate-600" /> Legenda de Pings
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-amber-700"></span>
            <span>Sinal Travado</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-orange-500 border-2 border-orange-700"></span>
            <span>Via Transversal Vazia</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-red-600 border-2 border-red-800"></span>
            <span>Bloqueando Emergência</span>
          </div>
        </div>
      </div>
    </div>
  );
}