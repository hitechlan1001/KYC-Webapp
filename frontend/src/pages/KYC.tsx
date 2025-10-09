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
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useDeviceFingerprint } from '../hooks/useDeviceFingerprint';
import { api } from '../lib/api';
import HomeButton from '../components/HomeButton';

const kycSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  pokerPlatform: z.string().optional(),
  playerId: z.string().optional(),
});

type KYCFormData = z.infer<typeof kycSchema>;

const POKER_PLATFORMS = [
  'ClubGG',
  'PokerStars',
  '888poker',
  'partypoker',
  'WSOP.com',
  'GGPoker',
  'Winamax',
  'Unibet',
  'Bet365',
  'Other'
];

export default function KYC() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
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

  const pokerPlatform = watch('pokerPlatform');

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
    if (type === 'license') {
      setDriverLicenseFile(file);
    } else {
      setVerificationVideoFile(file);
    }
  };

  const onSubmit = async (data: KYCFormData) => {
    if (!deviceData) {
      toast.error('Device information is still being collected. Please wait a moment and try again.');
      return;
    }

    setIsSubmitting(true);

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

      // Simple client-side network timeout (15s) to fail fast on bad connections
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

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

      const response = await api.submitKYC(formData, { signal: controller.signal });

      let result: any = {};
      try {
        result = await response.json();
      } catch (_) {
        // Ignore JSON parse error; handled below
      }

      if (response.ok) {
        setSubmissionId(result.submissionId);
        toast.success('KYC submission received successfully!');
      } else {
        // Backend provides either error or message; normalize it
        const errorMessage = result?.error || result?.message || (response.status === 400 ? 'Please complete required fields.' : 'Failed to submit KYC data');
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('KYC submission error:', error);
      if (error instanceof DOMException && error.name === 'AbortError') {
        toast.error('Network timeout. Please check your connection and try again.');
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
    }
  };

  if (submissionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#263144] via-[#253244] to-[#494949] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-300" />
            </div>
            <CardTitle className="text-2xl text-green-300">Submission Successful!</CardTitle>
            <CardDescription className="text-white/80">
              Your KYC information has been received and is being processed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-sm text-white/70 mb-2">Submission ID:</p>
              <p className="font-mono text-sm break-all text-white">{submissionId}</p>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please save this submission ID for your records. You can use it to check the status of your verification.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
              variant="dark"
            >
              Submit Another KYC
            </Button>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
              variant="galaxy"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#263144] via-[#253244] to-[#494949] py-8 px-4">
      <HomeButton />
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

              {/* Poker Platform Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Poker Platform Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pokerPlatform">Poker Platform</Label>
                    <Select onValueChange={(value) => setValue('pokerPlatform', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {POKER_PLATFORMS.map((platform) => (
                          <SelectItem key={platform} value={platform}>
                            {platform}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="playerId">Player ID</Label>
                    <Input
                      id="playerId"
                      {...register('playerId')}
                      placeholder="Your player ID on the platform"
                    />
                  </div>
                </div>
              </div>

              {/* File Uploads */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Identity Verification (Optional)</h3>
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
                        Upload a clear photo of your driver's license (optional)
                      </p>
                    </div>
                  </div>

                  <div>
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
                        Upload a short video of yourself holding your ID (optional)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Device Information Display */}
              {deviceData && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Device Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-black/80 text-sm">
                    <p><strong>IP Address:</strong> {ipAddress || 'Collecting...'}</p>
                    <p><strong>Location:</strong> {geolocation ? `${geolocation.city}, ${geolocation.country}` : 'Collecting...'}</p>
                    <p><strong>Device:</strong> {deviceData.browserInfo?.name} on {deviceData.platform}</p>
                    <p><strong>Screen:</strong> {deviceData.screenResolution}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    This information helps us verify your identity and prevent fraud.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="border-t pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting || !deviceData}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Submit KYC Information
                    </>
                  )}
                </Button>
                {!deviceData && (
                  <p className="text-sm text-amber-600 mt-2 text-center">
                    Collecting device information... Please wait.
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
