/**
 * Geolocation Service
 * Provides IP-based geolocation using ip-api.com (free, no API key required)
 */

export interface LocationData {
    city: string;
    region: string;
    country: string;
    countryCode: string;
    lat: number;
    lon: number;
    timezone: string;
    isp: string;
}

/**
 * Get location data from IPv4 address using ip-api.com
 * @param ipAddress - IPv4 address (e.g., "8.8.8.8")
 * @returns Location data or null if failed
 */
export async function getLocationFromIP(ipAddress: string): Promise<LocationData | null> {
    try {
        // Skip private/local IP addresses
        if (
            !ipAddress || 
            ipAddress === '0.0.0.0' || 
            ipAddress === '127.0.0.1' || 
            ipAddress.startsWith('192.168.') || 
            ipAddress.startsWith('10.') ||
            ipAddress.startsWith('172.')
        ) {
            return {
                city: 'Local',
                region: 'Private Network',
                country: 'Local Network',
                countryCode: 'LOCAL',
                lat: 0,
                lon: 0,
                timezone: 'Local',
                isp: 'Local Network'
            };
        }

        // Use ip-api.com (free, no key required, 45 requests/minute limit)
        const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,message,country,countryCode,region,city,lat,lon,timezone,isp`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Geolocation API error:', response.statusText);
            return null;
        }

        const data = await response.json();

        if (data.status === 'fail') {
            console.error('Geolocation lookup failed:', data.message);
            return null;
        }

        return {
            city: data.city || 'Unknown',
            region: data.region || 'Unknown',
            country: data.country || 'Unknown',
            countryCode: data.countryCode || 'XX',
            lat: data.lat || 0,
            lon: data.lon || 0,
            timezone: data.timezone || 'Unknown',
            isp: data.isp || 'Unknown'
        };
    } catch (error) {
        console.error('Failed to get location from IP:', error);
        return null;
    }
}

/**
 * Format location data for display
 * @param location - Location data from getLocationFromIP
 * @returns Formatted string like "New York, United States"
 */
export function formatLocation(location: LocationData | null): string {
    if (!location) return 'Unknown Location';
    
    if (location.countryCode === 'LOCAL') {
        return 'Local Network';
    }

    const parts: string[] = [];
    if (location.city && location.city !== 'Unknown') parts.push(location.city);
    if (location.region && location.region !== 'Unknown' && location.region !== location.city) {
        parts.push(location.region);
    }
    if (location.country && location.country !== 'Unknown') parts.push(location.country);

    return parts.length > 0 ? parts.join(', ') : 'Unknown Location';
}

/**
 * Get location short format (city, country code)
 * @param location - Location data
 * @returns Short format like "New York, US"
 */
export function formatLocationShort(location: LocationData | null): string {
    if (!location) return 'Unknown';
    if (location.countryCode === 'LOCAL') return 'Local';
    
    const city = location.city !== 'Unknown' ? location.city : '';
    const country = location.countryCode !== 'XX' ? location.countryCode : '';
    
    if (city && country) return `${city}, ${country}`;
    if (city) return city;
    if (country) return country;
    return 'Unknown';
}
