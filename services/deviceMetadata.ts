/**
 * Device Metadata Service
 * Collects accurate device information for 2FA trusted devices
 */

export interface DeviceMetadata {
  deviceName: string;
  deviceType: string;
  browser: string;
  os: string;
  ipAddress: string;
}

/**
 * Detect browser name
 */
function detectBrowser(): string {
  const ua = navigator.userAgent;
  
  if (ua.includes('Chrome') && !ua.includes('Chromium')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  if (ua.includes('Trident')) return 'Internet Explorer';
  
  return 'Unknown Browser';
}

/**
 * Detect operating system
 */
function detectOS(): string {
  const ua = navigator.userAgent;
  
  if (ua.includes('Win')) return 'Windows';
  if (ua.includes('Mac')) {
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'macOS';
  }
  if (ua.includes('Linux')) {
    if (ua.includes('Android')) return 'Android';
    return 'Linux';
  }
  if (ua.includes('X11')) return 'Unix';
  
  return 'Unknown OS';
}

/**
 * Detect device type
 */
function detectDeviceType(): string {
  const ua = navigator.userAgent;
  
  if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) return 'Mobile';
  if (ua.includes('Tablet') || ua.includes('iPad')) return 'Tablet';
  
  return 'Desktop';
}

/**
 * Get user's IP address (client-side approximation)
 * Note: This requires a backend call or external service for accuracy
 */
async function getIPAddress(): Promise<string> {
  try {
    // Try to get IP from ipify or similar service
    const response = await fetch('https://api.ipify.org?format=json', {
      method: 'GET',
      mode: 'cors'
    });
    const data = await response.json();
    return data.ip || '0.0.0.0';
  } catch {
    // Fallback: use localhost or unknown
    return '0.0.0.0';
  }
}

/**
 * Generate a human-readable device name with timestamp
 */
function generateDefaultDeviceName(): string {
  const os = detectOS();
  const browser = detectBrowser();
  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  return `${os} - ${browser} (${date})`;
}

/**
 * Collect complete device metadata
 */
export async function collectDeviceMetadata(customName?: string): Promise<DeviceMetadata> {
  const ipAddress = await getIPAddress();
  
  return {
    deviceName: customName || generateDefaultDeviceName(),
    deviceType: detectDeviceType(),
    browser: detectBrowser(),
    os: detectOS(),
    ipAddress
  };
}

/**
 * Get metadata for display
 */
export function getDeviceMetadataDisplay(metadata: DeviceMetadata): {
  displayName: string;
  icon: string;
  details: string[];
} {
  const icon = 
    metadata.deviceType === 'Mobile' ? '📱' :
    metadata.deviceType === 'Tablet' ? '📱' :
    '🖥️';
  
  const details = [
    `${metadata.os}`,
    `${metadata.browser}`,
    metadata.ipAddress !== '0.0.0.0' ? `IP: ${metadata.ipAddress}` : 'IP: Not available'
  ].filter(Boolean);
  
  return {
    displayName: metadata.deviceName,
    icon,
    details
  };
}
