import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

// Email configuration - Try different approach for blocked networks
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SERVICE_EMAIL,
      pass: process.env.SERVICE_EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    }
  });
};

// Send email notification
export const sendEmailNotification = async (kycData, files) => {
  try {
    const transporter = createEmailTransporter();
    
    // Verify transporter connection
    await transporter.verify();
    
    // Perform security analysis
    const securityAnalysis = await analyzeSecurity(kycData);
    
    const htmlContent = `
      <h2>New KYC Submission</h2>
      <h3>Personal Information:</h3>
      <ul>
        <li><strong>Name:</strong> ${kycData.fullName}</li>
        <li><strong>Email:</strong> ${kycData.email || 'Not provided'}</li>
        <li><strong>Phone:</strong> ${kycData.phone || 'Not provided'}</li>
        <li><strong>Address:</strong> ${kycData.address || 'Not provided'}</li>
        <li><strong>City:</strong> ${kycData.city || 'Not provided'}</li>
        <li><strong>State:</strong> ${kycData.state || 'Not provided'}</li>
        <li><strong>Country:</strong> ${kycData.country || 'Not provided'}</li>
        <li><strong>Postal Code:</strong> ${kycData.postalCode || 'Not provided'}</li>
      </ul>
      
      <h3>Player Information:</h3>
      <ul>
        <li><strong>Player ID:</strong> ${kycData.playerId || 'Not provided'}</li>
      </ul>
      
      <h3>Device Information:</h3>
      <ul>
        <li><strong>IP Address:</strong> ${kycData.ipAddress || 'Not available'}</li>
        <li><strong>Browser Location:</strong> ${kycData.geolocation ? `${kycData.geolocation.city}, ${kycData.geolocation.country}` : 'Not available'}</li>
        <li><strong>Browser:</strong> ${kycData.deviceData?.browserInfo?.name || 'Not available'} ${kycData.deviceData?.browserInfo?.version ? `(${kycData.deviceData.browserInfo.version})` : ''}</li>
        <li><strong>Platform:</strong> ${kycData.deviceData?.platform || 'Not available'}</li>
        <li><strong>Screen Resolution:</strong> ${kycData.deviceData?.screenResolution || 'Not available'}</li>
        <li><strong>Device ID:</strong> ${kycData.deviceData?.deviceId || 'Not available'}</li>
        <li><strong>Timezone:</strong> ${kycData.deviceData?.timezone || 'Not available'}</li>
        <li><strong>Language:</strong> ${kycData.deviceData?.language || 'Not available'}</li>
        <li><strong>User Agent:</strong> ${kycData.deviceData?.userAgent || 'Not available'}</li>
        <li><strong>WebGL Fingerprint:</strong> ${kycData.deviceData?.webglFingerprint ? 'Available' : 'Not available'}</li>
        <li><strong>Canvas Fingerprint:</strong> ${kycData.deviceData?.canvasFingerprint ? 'Available' : 'Not available'}</li>
        <li><strong>Audio Fingerprint:</strong> ${kycData.deviceData?.audioFingerprint ? 'Available' : 'Not available'}</li>
        <li><strong>Installed Fonts:</strong> ${kycData.deviceData?.fonts?.length || 0} fonts detected</li>
        <li><strong>Browser Plugins:</strong> ${kycData.deviceData?.plugins?.length || 0} plugins detected</li>
      </ul>
      
      <h3>Real Location (IP2Location):</h3>
      <ul>
        <li><strong>Real Country:</strong> ${securityAnalysis.realLocation?.country || 'Not available'}</li>
        <li><strong>Real City:</strong> ${securityAnalysis.realLocation?.city || 'Not available'}</li>
        <li><strong>Real Region:</strong> ${securityAnalysis.realLocation?.region || 'Not available'}</li>
        <li><strong>ISP:</strong> ${securityAnalysis.realLocation?.isp || 'Not available'}</li>
        <li><strong>Organization:</strong> ${securityAnalysis.realLocation?.organization || 'Not available'}</li>
        <li><strong>Domain:</strong> ${securityAnalysis.realLocation?.domain || 'Not available'}</li>
        <li><strong>Usage Type:</strong> ${securityAnalysis.realLocation?.usageType || 'Not available'}</li>
        <li><strong>Timezone:</strong> ${securityAnalysis.realLocation?.timezone || 'Not available'}</li>
        <li><strong>Coordinates:</strong> ${securityAnalysis.realLocation?.latitude}, ${securityAnalysis.realLocation?.longitude}</li>
      </ul>
      
      <h3>Proxy/VPN Analysis:</h3>
      <ul>
        <li><strong>VPN/Proxy Detected:</strong> ${securityAnalysis.vpnDetected ? 'YES' : 'No'}</li>
        ${securityAnalysis.proxyInfo ? `
        <li><strong>Proxy Type:</strong> ${securityAnalysis.proxyInfo.proxyType || 'Unknown'}</li>
        <li><strong>Provider:</strong> ${securityAnalysis.proxyInfo.provider || 'Unknown'}</li>
        <li><strong>Is VPN:</strong> ${securityAnalysis.proxyInfo.isVpn ? 'Yes' : 'No'}</li>
        <li><strong>Is Tor:</strong> ${securityAnalysis.proxyInfo.isTor ? 'Yes' : 'No'}</li>
        <li><strong>Is Data Center:</strong> ${securityAnalysis.proxyInfo.isDataCenter ? 'Yes' : 'No'}</li>
        <li><strong>Threat Level:</strong> ${securityAnalysis.proxyInfo.threat || 'Unknown'}</li>
        <li><strong>Is Spammer:</strong> ${securityAnalysis.proxyInfo.isSpammer ? 'YES' : 'No'}</li>
        ` : ''}
      </ul>
      
      <h3>Security Analysis:</h3>
      <ul>
        <li><strong>Fraud Score:</strong> ${securityAnalysis.fraudScore}/100 ${securityAnalysis.fraudRisk === 'high' ? 'HIGH RISK' : securityAnalysis.fraudRisk === 'medium' ? 'MEDIUM RISK' : 'LOW RISK'}</li>
        <li><strong>Location Mismatch:</strong> ${securityAnalysis.locationMismatch ? 'Location mismatch detected' : 'Location consistent'}</li>
        <li><strong>Analysis Confidence:</strong> ${securityAnalysis.confidence}</li>
        <li><strong>Device Fingerprint:</strong> ${kycData.deviceData?.deviceFingerprint || 'Not available'}</li>
      </ul>
      
      <p><strong>Submission Time:</strong> ${new Date().toLocaleString()}</p>
    `;

    const mailOptions = {
      from: process.env.SERVICE_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: `New KYC Submission - ${kycData.fullName}`,
      html: htmlContent,
      attachments: files.map(file => ({
        filename: file.originalname,
        path: file.path
      }))
    };

    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email notification:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response
    });
    throw error;
  }
};

// Send Telegram notification
export const sendTelegramNotification = async (kycData, files = []) => {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken || !chatId) {
      return;
    }

    // Perform security analysis
    const securityAnalysis = await analyzeSecurity(kycData);

    const message = `
🚨 *New KYC Submission*

👤 *Personal Information:*
• Name: ${kycData.fullName}
• Email: ${kycData.email || 'Not provided'}
• Phone: ${kycData.phone || 'Not provided'}
• Address: ${kycData.address || 'Not provided'}
• City: ${kycData.city || 'Not provided'}
• State: ${kycData.state || 'Not provided'}
• Country: ${kycData.country || 'Not provided'}
• Postal Code: ${kycData.postalCode || 'Not provided'}

🎮 *Player Information:*
• Player ID: ${kycData.playerId || 'Not provided'}

💻 *Device Information:*
• IP Address: ${kycData.ipAddress || 'Not available'}
• Browser Location: ${kycData.geolocation ? `${kycData.geolocation.city}, ${kycData.geolocation.country}` : 'Not available'}
• Browser: ${kycData.deviceData?.browserInfo?.name || 'Not available'} ${kycData.deviceData?.browserInfo?.version ? `(${kycData.deviceData.browserInfo.version})` : ''}
• Platform: ${kycData.deviceData?.platform || 'Not available'}
• Screen Resolution: ${kycData.deviceData?.screenResolution || 'Not available'}
• Device ID: ${kycData.deviceData?.deviceId || 'Not available'}
• Timezone: ${kycData.deviceData?.timezone || 'Not available'}
• Language: ${kycData.deviceData?.language || 'Not available'}
• User Agent: ${kycData.deviceData?.userAgent || 'Not available'}
• WebGL Fingerprint: ${kycData.deviceData?.webglFingerprint ? 'Available' : 'Not available'}
• Canvas Fingerprint: ${kycData.deviceData?.canvasFingerprint ? 'Available' : 'Not available'}
• Audio Fingerprint: ${kycData.deviceData?.audioFingerprint ? 'Available' : 'Not available'}
• Installed Fonts: ${kycData.deviceData?.fonts?.length || 0} fonts detected
• Browser Plugins: ${kycData.deviceData?.plugins?.length || 0} plugins detected

🌍 *Real Location (IP2Location):*
• Real Country: ${securityAnalysis.realLocation?.country || 'Not available'}
• Real City: ${securityAnalysis.realLocation?.city || 'Not available'}
• Real Region: ${securityAnalysis.realLocation?.region || 'Not available'}
• ISP: ${securityAnalysis.realLocation?.isp || 'Not available'}
• Organization: ${securityAnalysis.realLocation?.organization || 'Not available'}
• Domain: ${securityAnalysis.realLocation?.domain || 'Not available'}
• Usage Type: ${securityAnalysis.realLocation?.usageType || 'Not available'}
• Timezone: ${securityAnalysis.realLocation?.timezone || 'Not available'}
• Coordinates: ${securityAnalysis.realLocation?.latitude}, ${securityAnalysis.realLocation?.longitude}

🔍 *Proxy/VPN Analysis:*
• VPN/Proxy Detected: ${securityAnalysis.vpnDetected ? '⚠️ YES' : '✅ No'}
${securityAnalysis.proxyInfo ? `
• Proxy Type: ${securityAnalysis.proxyInfo.proxyType || 'Unknown'}
• Provider: ${securityAnalysis.proxyInfo.provider || 'Unknown'}
• Is VPN: ${securityAnalysis.proxyInfo.isVpn ? 'Yes' : 'No'}
• Is Tor: ${securityAnalysis.proxyInfo.isTor ? 'Yes' : 'No'}
• Is Data Center: ${securityAnalysis.proxyInfo.isDataCenter ? 'Yes' : 'No'}
• Threat Level: ${securityAnalysis.proxyInfo.threat || 'Unknown'}
• Is Spammer: ${securityAnalysis.proxyInfo.isSpammer ? '⚠️ YES' : 'No'}
` : ''}

🛡️ *Security Analysis:*
• Fraud Score: ${securityAnalysis.fraudScore}/100 ${securityAnalysis.fraudRisk === 'high' ? '🔴 HIGH RISK' : securityAnalysis.fraudRisk === 'medium' ? '🟡 MEDIUM RISK' : '🟢 LOW RISK'}
• Location Mismatch: ${securityAnalysis.locationMismatch ? '⚠️ Location mismatch detected' : '✅ Location consistent'}
• Analysis Confidence: ${securityAnalysis.confidence}
• Device Fingerprint: ${kycData.deviceData?.deviceFingerprint || 'Not available'}

⏰ *Submission Time:* ${new Date().toLocaleString()}
    `;

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    if (!response.ok) {
      console.error('Failed to send Telegram notification:', await response.text());
    }

    // Send images if any files were uploaded
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          // Check if file exists
          if (!fs.existsSync(file.path)) {
            console.error(`File not found: ${file.path}`);
            continue;
          }

          // Determine file type and send accordingly
          const fileExtension = path.extname(file.originalname).toLowerCase();
          const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(fileExtension);
          const isVideo = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'].includes(fileExtension);

          if (isImage) {
            // Send as photo
            const formData = new FormData();
            formData.append('chat_id', chatId);
            formData.append('photo', fs.createReadStream(file.path), {
              filename: file.originalname,
              contentType: 'image/jpeg'
            });
            formData.append('caption', `📷 ${file.originalname} - ${kycData.fullName}`);

            const photoResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
              method: 'POST',
              body: formData,
              headers: formData.getHeaders()
            });

            if (!photoResponse.ok) {
              console.error('Failed to send photo to Telegram:', await photoResponse.text());
            }
          } else if (isVideo) {
            // Send as video
            const formData = new FormData();
            formData.append('chat_id', chatId);
            formData.append('video', fs.createReadStream(file.path), {
              filename: file.originalname,
              contentType: 'video/mp4'
            });
            formData.append('caption', `🎥 ${file.originalname} - ${kycData.fullName}`);

            const videoResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendVideo`, {
              method: 'POST',
              body: formData,
              headers: formData.getHeaders()
            });

            if (!videoResponse.ok) {
              console.error('Failed to send video to Telegram:', await videoResponse.text());
            }
          } else {
            // Send as document
            const formData = new FormData();
            formData.append('chat_id', chatId);
            formData.append('document', fs.createReadStream(file.path), {
              filename: file.originalname
            });
            formData.append('caption', `📄 ${file.originalname} - ${kycData.fullName}`);

            const docResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
              method: 'POST',
              body: formData,
              headers: formData.getHeaders()
            });

            if (!docResponse.ok) {
              console.error('Failed to send document to Telegram:', await docResponse.text());
            }
          }
        } catch (fileError) {
          console.error(`Error sending file ${file.originalname} to Telegram:`, fileError);
        }
      }
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    // Don't throw error for Telegram failures
  }
};

// Detect VPN and get real location using IP2Location API
export const analyzeSecurity = async (kycData) => {
  const analysis = {
    vpnDetected: false,
    locationMismatch: false,
    realLocation: null,
    confidence: 'low'
  };

  if (!kycData.ipAddress) {
    return analysis;
  }

  // Skip localhost IPs for IP2Location API
  if (kycData.ipAddress === '127.0.0.1' || kycData.ipAddress === '::1' || kycData.ipAddress.startsWith('192.168.') || kycData.ipAddress.startsWith('10.')) {
    return fallbackSecurityAnalysis(kycData);
  }

  try {
    const apiKey = process.env.IP2LOCATION_API_KEY;
    if (!apiKey) {
      console.warn('IP2Location API key not configured, using fallback detection');
      return fallbackSecurityAnalysis(kycData);
    }

    // Call IP2Location API
    const response = await fetch(`https://api.ip2location.io/?key=${apiKey}&ip=${kycData.ipAddress}`);
    
    if (!response.ok) {
      console.error('IP2Location API error:', response.status);
      return fallbackSecurityAnalysis(kycData);
    }

    const ipData = await response.json();
    
    // Enhanced VPN/Proxy detection using detailed proxy information
    analysis.vpnDetected = ipData.is_proxy === true || 
                          (ipData.proxy && (ipData.proxy.is_vpn === true || 
                                           ipData.proxy.is_tor === true || 
                                           ipData.proxy.is_data_center === true ||
                                           ipData.proxy.is_public_proxy === true ||
                                           ipData.proxy.is_web_proxy === true));

    // Get comprehensive real location data
    analysis.realLocation = {
      country: ipData.country_name,
      countryCode: ipData.country_code,
      region: ipData.region_name,
      city: ipData.city_name,
      latitude: ipData.latitude,
      longitude: ipData.longitude,
      zipCode: ipData.zip_code,
      timezone: ipData.time_zone_info?.olson || ipData.time_zone,
      isp: ipData.isp,
      organization: ipData.as,
      domain: ipData.domain,
      usageType: ipData.usage_type,
      addressType: ipData.address_type,
      netSpeed: ipData.net_speed,
      elevation: ipData.elevation,
      continent: ipData.continent?.name,
      currency: ipData.country?.currency?.code,
      language: ipData.country?.language?.name
    };

    // Enhanced proxy/VPN information
    analysis.proxyInfo = ipData.proxy ? {
      proxyType: ipData.proxy.proxy_type,
      provider: ipData.proxy.provider,
      isVpn: ipData.proxy.is_vpn,
      isTor: ipData.proxy.is_tor,
      isDataCenter: ipData.proxy.is_data_center,
      isPublicProxy: ipData.proxy.is_public_proxy,
      isWebProxy: ipData.proxy.is_web_proxy,
      isResidentialProxy: ipData.proxy.is_residential_proxy,
      isSpammer: ipData.proxy.is_spammer,
      isScanner: ipData.proxy.is_scanner,
      isBotnet: ipData.proxy.is_botnet,
      threat: ipData.proxy.threat,
      lastSeen: ipData.proxy.last_seen
    } : null;

    // Fraud score analysis
    analysis.fraudScore = ipData.fraud_score || 0;
    analysis.fraudRisk = analysis.fraudScore > 75 ? 'high' : 
                        analysis.fraudScore > 50 ? 'medium' : 'low';

    analysis.confidence = 'high';

    // Check location mismatch between real location and user-provided location
    if (kycData.country && ipData.country_name) {
      const realCountry = ipData.country_name.toLowerCase();
      const userCountry = kycData.country.toLowerCase();
      
      if (realCountry !== userCountry) {
        analysis.locationMismatch = true;
      }
    }


  } catch (error) {
    console.error('Error calling IP2Location API:', error);
    return fallbackSecurityAnalysis(kycData);
  }

  return analysis;
};

// Fallback security analysis when API is not available
const fallbackSecurityAnalysis = (kycData) => {
  const analysis = {
    vpnDetected: false,
    locationMismatch: false,
    realLocation: null,
    confidence: 'low'
  };

  // Simple VPN detection based on common VPN IP ranges
  if (kycData.ipAddress) {
    const ip = kycData.ipAddress;
    if (ip.startsWith('10.') || ip.startsWith('172.') || ip.startsWith('192.168.')) {
      analysis.vpnDetected = true;
    }
  }

  // Check location mismatch between geolocation and user-provided location
  if (kycData.geolocation && kycData.country) {
    const geoCountry = kycData.geolocation.country;
    const userCountry = kycData.country;
    
    if (geoCountry.toLowerCase() !== userCountry.toLowerCase()) {
      analysis.locationMismatch = true;
    }
  }

  return analysis;
};

