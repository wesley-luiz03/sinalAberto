'use client';

import { useState, useEffect } from 'react';
import { LocationState } from '@/types';

export function useGeolocation(): LocationState {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        latitude: null,
        longitude: null,
        error: 'Geolocalização não é suportada pelo seu navegador.',
        loading: false,
      });
      return;
    }

    // Monitora a posição em tempo real conforme o usuário se desloca
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        });
      },
      (error) => {
        let msg = 'Erro ao obter localização.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Permissão de GPS negada. Ative a localização no navegador.';
        }
        setState({
          latitude: null,
          longitude: null,
          error: msg,
          loading: false,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return state;
}