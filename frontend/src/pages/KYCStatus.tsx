import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, CheckCircle, XCircle, Clock, AlertCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import HomeButton from '../components/HomeButton';

interface KYCStatusData {
  submission_id: string;
  full_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  created_at: string;
  updated_at: string;
  verification_notes?: string;
  verified_at?: string;
}

const STATUS_COLORS = {
  pending: 'text-yellow-300 bg-yellow-400/20',
  approved: 'text-green-300 bg-green-400/20',
  rejected: 'text-red-300 bg-red-400/20',
  under_review: 'text-blue-300 bg-blue-400/20'
};

const STATUS_ICONS = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  under_review: AlertCircle
};

const STATUS_LABELS = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  under_review: 'Under Review'
};

export default function KYCStatus() {
  const [submissionId, setSubmissionId] = useState('');
  const [statusData, setStatusData] = useState<KYCStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const checkStatus = async () => {
    if (!submissionId.trim()) {
      toast.error('Please enter a submission ID');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.getKYCStatus(submissionId.trim());
      const result = await response.json();

      if (response.ok) {
        setStatusData(result.data);
      } else {
        setError(result.error || 'Failed to fetch status');
        setStatusData(null);
      }
    } catch (error) {
      console.error('Status check error:', error);
      setError('Failed to check status. Please try again.');
      setStatusData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const StatusIcon = statusData ? STATUS_ICONS[statusData.status] : Clock;
  const statusColor = statusData ? STATUS_COLORS[statusData.status] : 'text-gray-600 bg-gray-100';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#263144] via-[#253244] to-[#494949] py-8 px-4">
      <HomeButton />
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">KYC Status Check</h1>
          <p className="text-white/70">Enter your submission ID to check the status of your KYC verification.</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Check Status</CardTitle>
            <CardDescription>
              Enter the submission ID you received when you submitted your KYC information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="submissionId">Submission ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="submissionId"
                    value={submissionId}
                    onChange={(e) => setSubmissionId(e.target.value)}
                    placeholder="Enter your submission ID"
                    className="flex-1"
                  />
                  <Button 
                    onClick={checkStatus} 
                    disabled={isLoading || !submissionId.trim()}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {statusData && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${statusColor}`}>
                  <StatusIcon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {STATUS_LABELS[statusData.status]}
                  </CardTitle>
                  <CardDescription>
                    Submission ID: {statusData.submission_id}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-300">Full Name</p>
                  <p className="text-sm">{statusData.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                    {STATUS_LABELS[statusData.status]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Submitted</p>
                  <p className="text-sm">
                    {new Date(statusData.created_at).toLocaleDateString()} at{' '}
                    {new Date(statusData.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300">Last Updated</p>
                  <p className="text-sm">
                    {new Date(statusData.updated_at).toLocaleDateString()} at{' '}
                    {new Date(statusData.updated_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {statusData.verified_at && (
                <div>
                  <p className="text-sm font-medium text-gray-300">Verified</p>
                  <p className="text-sm">
                    {new Date(statusData.verified_at).toLocaleDateString()} at{' '}
                    {new Date(statusData.verified_at).toLocaleTimeString()}
                  </p>
                </div>
              )}

              {statusData.verification_notes && (
                <div>
                  <p className="text-sm font-medium text-gray-300">Verification Notes</p>
                  <div className="mt-1 p-3 bg-white/5 rounded-md">
                    <p className="text-sm text-white/80">{statusData.verification_notes}</p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <Button 
                  onClick={() => {
                    setSubmissionId('');
                    setStatusData(null);
                    setError('');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Check Another Submission
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-white/70">
            Need to submit KYC information?{' '}
            <a 
              href="/kyc" 
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              Click here to submit
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
