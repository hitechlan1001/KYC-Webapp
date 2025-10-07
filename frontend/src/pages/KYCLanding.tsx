import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { FileText, Search, Shield, CheckCircle, Upload, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import HomeButton from '../components/HomeButton';

export default function KYCLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#263144] via-[#253244] to-[#494949] py-12 px-4">
      <HomeButton />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-600 rounded-full mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            KYC Verification System
          </h1>
          <p className="text-xl text-white/85 max-w-3xl mx-auto">
            Secure identity verification for poker platform users. Submit your information 
            and verify your identity to ensure a safe and trusted gaming environment.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-fuchsia-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-fuchsia-600" />
              </div>
              <CardTitle className="text-lg">Easy Submission</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Submit your personal information and identity documents quickly and securely.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-violet-600" />
              </div>
              <CardTitle className="text-lg">Secure Process</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your data is encrypted and protected using industry-standard security measures.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-violet-600" />
              </div>
              <CardTitle className="text-lg">Quick Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get verified quickly and start playing on your favorite poker platforms.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="border-2 border-violet-200 hover:border-violet-300 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Submit KYC Information</CardTitle>
                  <CardDescription>
                    Start your identity verification process
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 mb-6">
                Provide your personal information, upload identity documents, and complete 
                the verification process. We'll collect device information to ensure security.
              </p>
              <Link to="/kyc">
                <Button className="w-full" size="lg" variant="dark">
                  <Upload className="w-4 h-4 mr-2" />
                  Start KYC Submission
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-fuchsia-200 hover:border-fuchsia-300 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-fuchsia-100 rounded-lg flex items-center justify-center">
                  <Search className="w-5 h-5 text-fuchsia-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Check Status</CardTitle>
                  <CardDescription>
                    Track your verification progress
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 mb-6">
                Already submitted your KYC information? Check the status of your 
                verification using your submission ID.
              </p>
              <Link to="/kyc/status">
                <Button className="w-full" size="lg" variant="dark">
                  <Eye className="w-4 h-4 mr-2" />
                  Check Status
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What We Collect</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Personal information (name, address, contact details)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Poker platform information and player ID
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Identity documents (driver's license, etc.)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Device fingerprinting data for security
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Location information (IP address, geolocation)
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security & Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  All data is encrypted in transit and at rest
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  Device fingerprinting helps prevent fraud
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  Your information is only used for verification
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  We comply with data protection regulations
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-500" />
                  Regular security audits and monitoring
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <Alert className="max-w-2xl mx-auto">
            <AlertDescription>
              <strong>Important:</strong> This KYC system helps verify your identity and prevent fraud. 
              All information is collected securely and used only for verification purposes. 
              If you have any questions, please contact support.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
