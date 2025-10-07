import { useState, useCallback } from 'react';

interface DeviceFingerprint {
  deviceId: string;
  browserInfo: {
    name: string;
    version: string;
    engine: string;
  };
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  userAgent: string;
  canvasFingerprint: string;
  webglFingerprint: string;
  audioFingerprint: string;
  fonts: string[];
  plugins: string[];
}

interface GeolocationData {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  region: string;
  timezone: string;
}

export const useDeviceFingerprint = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getCanvasFingerprint = useCallback((): string => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      canvas.width = 200;
      canvas.height = 50;

      // Draw text
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Device fingerprint', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Device fingerprint', 4, 17);

      return canvas.toDataURL();
    } catch (error) {
      console.error('Canvas fingerprint error:', error);
      return '';
    }
  }, []);

  const getWebGLFingerprint = useCallback((): string => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return '';

      const renderer = gl.getParameter(gl.RENDERER);
      const vendor = gl.getParameter(gl.VENDOR);
      const version = gl.getParameter(gl.VERSION);
      const shadingLanguageVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);

      return `${renderer}|${vendor}|${version}|${shadingLanguageVersion}`;
    } catch (error) {
      console.error('WebGL fingerprint error:', error);
      return '';
    }
  }, []);

  const getAudioFingerprint = useCallback((): string => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);

      oscillator.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(0);

      const audioData = new Float32Array(analyser.frequencyBinCount);
      analyser.getFloatFrequencyData(audioData);

      oscillator.stop();
      audioContext.close();

      return Array.from(audioData).slice(0, 30).join(',');
    } catch (error) {
      console.error('Audio fingerprint error:', error);
      return '';
    }
  }, []);

  const getInstalledFonts = useCallback((): string[] => {
    const fonts = [
      'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold',
      'Calibri', 'Cambria', 'Candara', 'Century Gothic', 'Comic Sans MS',
      'Consolas', 'Courier New', 'Franklin Gothic Medium', 'Gadget',
      'Georgia', 'Helvetica', 'Impact', 'Lucida Console', 'Lucida Sans Unicode',
      'Microsoft Sans Serif', 'Palatino Linotype', 'Segoe UI', 'Tahoma',
      'Times New Roman', 'Trebuchet MS', 'Verdana'
    ];

    const installedFonts: string[] = [];
    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';
    const h = document.getElementsByTagName('body')[0];

    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const baseFontsWidth: { [key: string]: number } = {};

    // Test base fonts
    baseFonts.forEach((baseFont) => {
      const span = document.createElement('span');
      span.style.fontSize = testSize;
      span.style.fontFamily = baseFont;
      span.innerHTML = testString;
      span.style.position = 'absolute';
      span.style.left = '-9999px';
      h.appendChild(span);
      baseFontsWidth[baseFont] = span.offsetWidth;
      h.removeChild(span);
    });

    // Test each font
    fonts.forEach((font) => {
      let detected = false;
      baseFonts.forEach((baseFont) => {
        const span = document.createElement('span');
        span.style.fontSize = testSize;
        span.style.fontFamily = `${font}, ${baseFont}`;
        span.innerHTML = testString;
        span.style.position = 'absolute';
        span.style.left = '-9999px';
        h.appendChild(span);
        const width = span.offsetWidth;
        h.removeChild(span);

        if (width !== baseFontsWidth[baseFont]) {
          detected = true;
        }
      });
      if (detected) {
        installedFonts.push(font);
      }
    });

    return installedFonts;
  }, []);

  const getInstalledPlugins = useCallback((): string[] => {
    const plugins: string[] = [];
    for (let i = 0; i < navigator.plugins.length; i++) {
      plugins.push(navigator.plugins[i].name);
    }
    return plugins;
  }, []);

  const getBrowserInfo = useCallback(() => {
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';
    let engine = 'Unknown';

    // Detect browser
    if (userAgent.includes('Chrome')) {
      browserName = 'Chrome';
      const match = userAgent.match(/Chrome\/(\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Firefox')) {
      browserName = 'Firefox';
      const match = userAgent.match(/Firefox\/(\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browserName = 'Safari';
      const match = userAgent.match(/Version\/(\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Edge')) {
      browserName = 'Edge';
      const match = userAgent.match(/Edge\/(\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    }

    // Detect engine
    if (userAgent.includes('WebKit')) {
      engine = 'WebKit';
    } else if (userAgent.includes('Gecko')) {
      engine = 'Gecko';
    } else if (userAgent.includes('Trident')) {
      engine = 'Trident';
    }

    return {
      name: browserName,
      version: browserVersion,
      engine
    };
  }, []);

  const getDeviceFingerprint = useCallback(async (): Promise<DeviceFingerprint> => {
    setIsLoading(true);
    
    try {
      const browserInfo = getBrowserInfo();
      const canvasFingerprint = getCanvasFingerprint();
      const webglFingerprint = getWebGLFingerprint();
      const audioFingerprint = getAudioFingerprint();
      const fonts = getInstalledFonts();
      const plugins = getInstalledPlugins();

      // Generate device ID based on various factors
      const deviceId = btoa(
        navigator.userAgent +
        navigator.language +
        screen.width +
        screen.height +
        screen.colorDepth +
        new Date().getTimezoneOffset() +
        canvasFingerprint.substring(0, 50)
      ).substring(0, 32);

      return {
        deviceId,
        browserInfo,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        canvasFingerprint,
        webglFingerprint,
        audioFingerprint,
        fonts,
        plugins
      };
    } finally {
      setIsLoading(false);
    }
  }, [getBrowserInfo, getCanvasFingerprint, getWebGLFingerprint, getAudioFingerprint, getInstalledFonts, getInstalledPlugins]);

  const getGeolocation = useCallback((): Promise<GeolocationData | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Use a geolocation service to get city/country info
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            
            if (response.ok) {
              const data = await response.json();
              resolve({
                latitude,
                longitude,
                city: data.city || 'Unknown',
                country: data.countryName || 'Unknown',
                region: data.principalSubdivision || 'Unknown',
                timezone: data.localityInfo?.administrative?.[0]?.name || 'Unknown'
              });
            } else {
              resolve({
                latitude,
                longitude,
                city: 'Unknown',
                country: 'Unknown',
                region: 'Unknown',
                timezone: 'Unknown'
              });
            }
          } catch (error) {
            console.error('Geolocation reverse lookup error:', error);
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              city: 'Unknown',
              country: 'Unknown',
              region: 'Unknown',
              timezone: 'Unknown'
            });
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }, []);

  const getIPAddress = useCallback(async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      if (response.ok) {
        const data = await response.json();
        return data.ip;
      }
    } catch (error) {
      console.error('IP address fetch error:', error);
    }
    return 'Unknown';
  }, []);

  return {
    getDeviceFingerprint,
    getGeolocation,
    getIPAddress,
    isLoading
  };
};
