import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useDeviceFingerprint } from '../hooks/useDeviceFingerprint';
import { api } from '../lib/api';

const kycSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  playerId: z.string().optional(),
});

type KYCFormData = z.infer<typeof kycSchema>;


export default function KYC() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [driverLicenseFile, setDriverLicenseFile] = useState<File | null>(null);
  const [verificationVideoFile, setVerificationVideoFile] = useState<File | null>(null);
  const [deviceData, setDeviceData] = useState<any>(null);
  const [geolocation, setGeolocation] = useState<any>(null);
  const [ipAddress, setIpAddress] = useState<string>('');

  const { getDeviceFingerprint, getGeolocation, getIPAddress } = useDeviceFingerprint();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<KYCFormData>({
    resolver: zodResolver(kycSchema),
  });


  useEffect(() => {
    // Collect device fingerprinting data when component mounts
    const collectDeviceData = async () => {
      try {
        const fingerprint = await getDeviceFingerprint();
        const geo = await getGeolocation();
        const ip = await getIPAddress();
        
        setDeviceData(fingerprint);
        setGeolocation(geo);
        setIpAddress(ip);
      } catch (error) {
        console.error('Error collecting device data:', error);
        toast.error('Failed to collect device information');
      }
    };

    collectDeviceData();
  }, [getDeviceFingerprint, getGeolocation, getIPAddress]);

  const handleFileChange = (file: File | null, type: 'license' | 'video') => {
    if (!file) return;
    
    // File size validation
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast.error(`File too large. Maximum size is 50MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB`);
      return;
    }

    if (type === 'license') {
      setDriverLicenseFile(file);
      toast.success('Driver license uploaded successfully');
    } else {
      setVerificationVideoFile(file);
      toast.success('Verification video uploaded successfully');
    }
  };

  const onSubmit = async (data: KYCFormData) => {
    if (!deviceData) {
      toast.error('Device information is still being collected. Please wait a moment and try again.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress('Preparing upload...');

    try {
      // Check backend availability first for clearer error
      try {
        const health = await api.health({ method: 'GET' });
        if (!health.ok) {
          toast.error('Server unavailable. Please try again later.');
          setIsSubmitting(false);
          return;
        }
      } catch {
        toast.error('Cannot reach server. Please ensure the backend is running.');
        setIsSubmitting(false);
        return;
      }

      // Extended timeout for video uploads (2 minutes)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 120000); // 2 minutes for video uploads

      const formData = new FormData();
      
      // Add form data
      Object.entries(data).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });

      // Add files
      if (driverLicenseFile) {
        formData.append('driverLicense', driverLicenseFile);
      }
      if (verificationVideoFile) {
        formData.append('verificationVideo', verificationVideoFile);
      }

      // Add device and location data
      formData.append('deviceFingerprint', JSON.stringify(deviceData));
      formData.append('geolocationData', JSON.stringify(geolocation));
      formData.append('deviceSpecs', JSON.stringify({
        deviceId: deviceData.deviceId,
        browserInfo: deviceData.browserInfo,
        screenResolution: deviceData.screenResolution,
        timezone: deviceData.timezone,
        language: deviceData.language,
        platform: deviceData.platform,
        userAgent: deviceData.userAgent,
        canvasFingerprint: deviceData.canvasFingerprint,
        webglFingerprint: deviceData.webglFingerprint,
        audioFingerprint: deviceData.audioFingerprint,
        fonts: deviceData.fonts,
        plugins: deviceData.plugins
      }));

      // Clear timeout on successful request start
      clearTimeout(timeoutId);
      setUploadProgress('Uploading files...');
      
      const response = await api.submitKYC(formData, { signal: controller.signal });

      let result: any = {};
      try {
        result = await response.json();
      } catch (_) {
        // Ignore JSON parse error; handled below
      }

      if (response.ok) {
        setUploadProgress('Processing submission...');
        toast.success('KYC submission received successfully!');
        // Redirect to home page after successful submission
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        // Backend provides either error or message; normalize it
        const errorMessage = result?.error || result?.message || (response.status === 400 ? 'Please complete required fields.' : 'Failed to submit KYC data');
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('KYC submission error:', error); 
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        toast.error('Upload timeout. Video files can be large - please try again with a smaller file or better connection.');
      } else if (error instanceof Error) {
        // Friendly mapping for common server/network errors
        const lower = error.message.toLowerCase();
        if (lower.includes('network') || lower.includes('fetch') || lower.includes('failed to')) {
          toast.error('Network error. Please try again.');
        } else if (lower.includes('too many') || lower.includes('rate')) {
          toast.error('Too many requests. Please wait a moment and retry.');
        } else if (lower.includes('file too large') || lower.includes('entity too large')) {
          toast.error('One of the files is too large. Max size is 50MB.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#263144] via-[#253244] to-[#494949] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">KYC Verification</h1>
          <p className="text-white/85">
            Please provide your information for identity verification. All fields marked with * are required.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              We collect this information to verify your identity and prevent fraud.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    {...register('fullName')}
                    placeholder="Enter your full name"
                    className={errors.fullName ? 'border-red-500' : ''}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="your@email.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    {...register('address')}
                    placeholder="Street address"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...register('city')}
                    placeholder="City"
                  />
                </div>

                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    {...register('state')}
                    placeholder="State or Province"
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    {...register('country')}
                    placeholder="Country"
                  />
                </div>

                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    {...register('postalCode')}
                    placeholder="ZIP/Postal Code"
                  />
                </div>
              </div>

              {/* Player ID */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Player Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="playerId">Player ID</Label>
                    <Input
                      id="playerId"
                      {...register('playerId')}
                      placeholder="Your player ID"
                    />
                  </div>
                </div>
              </div>

              {/* File Uploads */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Identity Verification</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="driverLicense">Driver's License Photo</Label>
                    <div className="mt-2">
                      <Input
                        id="driverLicense"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'license')}
                        className="cursor-pointer"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Upload a clear photo of your driver's license (Max 50MB)
                      </p>
                      {driverLicenseFile && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ License selected: {(driverLicenseFile.size / 1024 / 1024).toFixed(1)}MB
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Video upload field - hidden for now */}
                  <div className="hidden">
                    <Label htmlFor="verificationVideo">Verification Video</Label>
                    <div className="mt-2">
                      <Input
                        id="verificationVideo"
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'video')}
                        className="cursor-pointer"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Upload a short video of yourself holding your ID (Max 50MB)
                      </p>
                      {verificationVideoFile && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Video selected: {(verificationVideoFile.size / 1024 / 1024).toFixed(1)}MB
                        </p>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Security Notice */}
              <div className="border-t pt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">Security & Verification</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Your information is being securely processed with advanced fraud detection and identity verification systems. 
                        This helps us protect your account and ensure a safe gaming environment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="border-t pt-6">
                <div className="space-y-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !deviceData}
                    className="w-full h-12 text-base font-medium"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {uploadProgress || 'Processing Your Submission...'}
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-5 w-5" />
                        Submit KYC Information
                      </>
                    )}
                  </Button>
                  
                  {!deviceData && (
                    <div className="flex items-center justify-center space-x-2 text-amber-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-sm">Initializing security verification...</p>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 text-center">
                    By submitting this form, you agree to our verification process and confirm that all information provided is accurate.
                  </p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
