import nodemailer from 'nodemailer';
import fetch from 'node-fetch';

// Email configuration
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_EMAIL_PASSWORD
    }
  });
};

// Send email notification
export const sendEmailNotification = async (kycData, files) => {
  try {
    const transporter = createEmailTransporter();
    
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
      
      <h3>Poker Platform Information:</h3>
      <ul>
        <li><strong>Platform:</strong> ${kycData.pokerPlatform || 'Not provided'}</li>
        <li><strong>Player ID:</strong> ${kycData.playerId || 'Not provided'}</li>
      </ul>
      
      <h3>Device Information:</h3>
      <ul>
        <li><strong>IP Address:</strong> ${kycData.ipAddress || 'Not available'}</li>
        <li><strong>Location:</strong> ${kycData.geolocation ? `${kycData.geolocation.city}, ${kycData.geolocation.country}` : 'Not available'}</li>
        <li><strong>Browser:</strong> ${kycData.deviceData?.browserInfo?.name || 'Not available'}</li>
        <li><strong>Platform:</strong> ${kycData.deviceData?.platform || 'Not available'}</li>
        <li><strong>Screen Resolution:</strong> ${kycData.deviceData?.screenResolution || 'Not available'}</li>
        <li><strong>Device ID:</strong> ${kycData.deviceData?.deviceId || 'Not available'}</li>
      </ul>
      
      <h3>Security Analysis:</h3>
      <ul>
        <li><strong>VPN Detection:</strong> ${kycData.vpnDetected ? '⚠️ VPN DETECTED' : '✅ No VPN detected'}</li>
        <li><strong>Location Mismatch:</strong> ${kycData.locationMismatch ? '⚠️ Location mismatch detected' : '✅ Location consistent'}</li>
        <li><strong>Device Fingerprint:</strong> ${kycData.deviceData?.deviceFingerprint || 'Not available'}</li>
      </ul>
      
      <p><strong>Submission Time:</strong> ${new Date().toLocaleString()}</p>
    `;

    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: `New KYC Submission - ${kycData.fullName}`,
      html: htmlContent,
      attachments: files.map(file => ({
        filename: file.originalname,
        path: file.path
      }))
    };

    await transporter.sendMail(mailOptions);
    console.log('Email notification sent successfully');
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw error;
  }
};

// Send Telegram notification
export const sendTelegramNotification = async (kycData) => {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken || !chatId) {
      console.log('Telegram credentials not configured, skipping Telegram notification');
      return;
    }

    const message = `
🚨 *New KYC Submission*

👤 *Personal Info:*
• Name: ${kycData.fullName}
• Email: ${kycData.email || 'Not provided'}
• Phone: ${kycData.phone || 'Not provided'}
• Location: ${kycData.geolocation ? `${kycData.geolocation.city}, ${kycData.geolocation.country}` : 'Not available'}

🎮 *Poker Platform:*
• Platform: ${kycData.pokerPlatform || 'Not provided'}
• Player ID: ${kycData.playerId || 'Not provided'}

🔍 *Security Analysis:*
• IP: ${kycData.ipAddress || 'Not available'}
• VPN: ${kycData.vpnDetected ? '⚠️ DETECTED' : '✅ Clean'}
• Location Match: ${kycData.locationMismatch ? '⚠️ MISMATCH' : '✅ Consistent'}
• Device: ${kycData.deviceData?.browserInfo?.name || 'Unknown'}

⏰ *Submitted:* ${new Date().toLocaleString()}
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

    if (response.ok) {
      console.log('Telegram notification sent successfully');
    } else {
      console.error('Failed to send Telegram notification:', await response.text());
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    // Don't throw error for Telegram failures
  }
};

// Detect VPN and location mismatch
export const analyzeSecurity = (kycData) => {
  const analysis = {
    vpnDetected: false,
    locationMismatch: false
  };

  // Simple VPN detection based on common VPN IP ranges
  const vpnRanges = [
    '10.0.0.0/8',
    '172.16.0.0/12', 
    '192.168.0.0/16'
  ];
  
  // Check if IP is in private range (might indicate VPN)
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
    
    // Simple country comparison (you can make this more sophisticated)
    if (geoCountry.toLowerCase() !== userCountry.toLowerCase()) {
      analysis.locationMismatch = true;
    }
  }

  return analysis;
};

