// @ts-nocheck
'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ActiveReport } from '@/types';

interface DashboardMapProps {
  reports: ActiveReport[];
}

const RECIFE_CENTER: [number, number] = [-8.0542, -34.8813];

function MapController() {
  const map = useMap();
  useEffect(() => {
    map.setView(RECIFE_CENTER, 13);
  }, [map]);
  return null;
}

export default function DashboardMap({ reports }: DashboardMapProps) {
  const getMarkerColor = (category: string) => {
    switch (category) {
      case 'TRAVADO':
        return { fill: '#f59e0b', border: '#b45309' };
      case 'TRANSVERSAL_VAZIA':
        return { fill: '#ea580c', border: '#c2410c' };
      case 'BLOQUEANDO_EMERGENCIA':
        return { fill: '#dc2626', border: '#991b1b' };
      default:
        return { fill: '#64748b', border: '#334155' };
    }
  };

  const categoryNames: Record<string, string> = {
    TRAVADO: 'Sinal Travado',
    TRANSVERSAL_VAZIA: 'Via Transversal Vazia',
    BLOQUEANDO_EMERGENCIA: 'Bloqueando Emergência',
  };

  return (
    <div className="w-full h-full relative" style={{ minHeight: 'calc(100vh - 73px)' }}>
      <MapContainer
        center={RECIFE_CENTER}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', minHeight: 'calc(100vh - 73px)' }}
        className="w-full h-full z-0"
      >
        <MapController />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {reports.map((report) => {
          const { fill, border } = getMarkerColor(report.category);
          const position: [number, number] = [report.latitude, report.longitude];

          return (
            <CircleMarker
              key={report.id}
              center={position}
              radius={12}
              pathOptions={{
                color: border,
                fillColor: fill,
                fillOpacity: 0.85,
                weight: 3,
              }}
            >
              <Popup>
                <div className="p-1 font-sans text-xs">
                  <strong className="block text-sm font-bold text-slate-900">
                    {categoryNames[report.category] || report.category}
                  </strong>
                  <span className="text-slate-500 block mt-1">
                    Registrado em:{' '}
                    {new Date(report.created_at).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="text-slate-400 text-[10px] block mt-0.5">
                    Lat: {report.latitude.toFixed(4)} | Lng: {report.longitude.toFixed(4)}
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}