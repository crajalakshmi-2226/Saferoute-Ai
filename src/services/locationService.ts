import { Coordinates } from '../types';

export type GeolocationStatus =
  | 'idle'
  | 'prompting'
  | 'locating'
  | 'success'
  | 'permission_denied'
  | 'position_unavailable'
  | 'timeout'
  | 'unsupported';

export interface LocationResult {
  status: GeolocationStatus;
  coordinates?: Coordinates;
  accuracyMeters?: number;
  errorMessage?: string;
  timestamp?: number;
}

export async function requestCurrentPosition(): Promise<LocationResult> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return {
      status: 'unsupported',
      errorMessage: 'Geolocation is not supported by your browser or environment.',
    };
  }

  return new Promise((resolve) => {
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 10000,
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          status: 'success',
          coordinates: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          },
          accuracyMeters: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
      },
      (error: GeolocationPositionError) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            resolve({
              status: 'permission_denied',
              errorMessage:
                'Location permission was denied. Please allow location access in your browser site settings or enter your origin address manually.',
            });
            break;
          case error.POSITION_UNAVAILABLE:
            resolve({
              status: 'position_unavailable',
              errorMessage:
                'Location information is currently unavailable from your device GPS/network sensors. Please enter origin manually.',
            });
            break;
          case error.TIMEOUT:
            resolve({
              status: 'timeout',
              errorMessage:
                'The request to get your location timed out. You can retry with a clear signal or enter your origin address manually.',
            });
            break;
          default:
            resolve({
              status: 'position_unavailable',
              errorMessage: error.message || 'An unknown geolocation error occurred.',
            });
        }
      },
      options
    );
  });
}
