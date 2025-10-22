import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { FileText, Search, Shield, CheckCircle, Upload, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function KYCLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#263144] via-[#253244] to-[#494949] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Logo size="xl" className="mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">
            KYC Verification System
          </h1>
          <p className="text-xl text-white/85 max-w-3xl mx-auto">
            Secure and seamless identity verification for all users. Submit your information to confirm your identity and help maintain a safe and trusted experience for everyone.
          </p>
        </div>


        {/* Main Action */}
        <div className="max-w-md mx-auto mb-12">
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
        </div>


        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <Alert className="max-w-4xl mx-auto">
            <AlertDescription>
              <strong>Disclaimer:</strong> This KYC system securely collects limited information solely to verify your identity and prevent fraud. We do not store, retain, or share any personal data once verification is complete. All information is used only for verification purposes and is automatically discarded after the process. We are committed to maintaining your privacy and ensuring that no personal details are permanently stored on our servers. For any questions, please contact our support team.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
