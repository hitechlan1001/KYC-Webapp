import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing email configuration...');
console.log('Service Email:', process.env.SERVICE_EMAIL);
console.log('Admin Email:', process.env.ADMIN_EMAIL);

// Test 1: Simple Gmail service
console.log('\n=== Test 1: Gmail Service ===');
const transporter1 = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.SERVICE_EMAIL,
    pass: process.env.SERVICE_EMAIL_PASSWORD
  }
});

try {
  await transporter1.verify();
  console.log('✅ Gmail service connection successful');
} catch (error) {
  console.log('❌ Gmail service failed:', error.message);
}

// Test 2: Direct SMTP with different DNS
console.log('\n=== Test 2: Direct SMTP ===');
const transporter2 = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SERVICE_EMAIL,
    pass: process.env.SERVICE_EMAIL_PASSWORD
  }
});

try {
  await transporter2.verify();
  console.log('✅ Direct SMTP connection successful');
} catch (error) {
  console.log('❌ Direct SMTP failed:', error.message);
}

// Test 3: Alternative Gmail servers
console.log('\n=== Test 3: Alternative Gmail ===');
const transporter3 = nodemailer.createTransport({
  host: 'smtp.googlemail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SERVICE_EMAIL,
    pass: process.env.SERVICE_EMAIL_PASSWORD
  }
});

try {
  await transporter3.verify();
  console.log('✅ Alternative Gmail connection successful');
} catch (error) {
  console.log('❌ Alternative Gmail failed:', error.message);
}
