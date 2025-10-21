import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Loader2, Eye, Download, CheckCircle, XCircle, Clock, AlertCircle, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import HomeButton from '../components/HomeButton';

interface KYCSubmission {
  id: number;
  submission_id: string;
  full_name: string;
  email: string;
  phone: string;
  poker_platform: string;
  player_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  created_at: string;
  updated_at: string;
  ip_address: string;
}

interface KYCSubmissionDetails extends KYCSubmission {
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  driver_license_file_path: string;
  verification_video_path: string;
  device_fingerprint: string;
  geolocation_data: any;
  device_specs: any;
  verification_notes: string;
  verified_by: number;
  verified_at: string;
  device_id: string;
  browser_info: any;
  screen_resolution: string;
  timezone: string;
  language: string;
  platform: string;
  user_agent: string;
  canvas_fingerprint: string;
  webgl_fingerprint: string;
  audio_fingerprint: string;
  fonts: string[];
  plugins: string[];
}

const STATUS_COLORS = {
  pending: 'bg-yellow-400/20 text-yellow-300',
  approved: 'bg-green-400/20 text-green-300',
  rejected: 'bg-red-400/20 text-red-300',
  under_review: 'bg-blue-400/20 text-blue-300'
};

const STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  under_review: 'Under Review'
};

export default function KYCAdmin() {
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmissionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [newStatus, setNewStatus] = useState<'pending' | 'approved' | 'rejected' | 'under_review'>('pending');

  const fetchSubmissions = async () => {
    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await api.getKYCSubmissions(params);
      const result = await response.json();

      if (response.ok) {
        setSubmissions(result.data);
        setTotalPages(result.pagination.totalPages);
      } else {
        setError(result.error || 'Failed to fetch submissions');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError('Failed to fetch submissions');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissionDetails = async (id: number) => {
    try {
      const response = await api.getKYCSubmission(id);
      const result = await response.json();

      if (response.ok) {
        setSelectedSubmission(result.data);
        setVerificationNotes(result.data.verification_notes || '');
        setNewStatus(result.data.status);
        setIsDetailsOpen(true);
      } else {
        toast.error(result.error || 'Failed to fetch submission details');
      }
    } catch (error) {
      console.error('Error fetching submission details:', error);
      toast.error('Failed to fetch submission details');
    }
  };

  const updateSubmissionStatus = async () => {
    if (!selectedSubmission) return;

    setIsUpdating(true);

    try {
      const response = await api.updateKYCStatus(selectedSubmission.id, {
        status: newStatus,
        verificationNotes: verificationNotes
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Status updated successfully');
        setIsDetailsOpen(false);
        fetchSubmissions();
      } else {
        toast.error(result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const downloadFile = async (submissionId: string, fileType: 'license' | 'video') => {
    try {
      const response = await api.downloadFile(submissionId, fileType);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileType === 'license' ? 'driver-license' : 'verification-video'}.${fileType === 'license' ? 'jpg' : 'mp4'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        toast.error('Failed to download file');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [currentPage, statusFilter]);

  const filteredSubmissions = submissions.filter(submission =>
    submission.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.submission_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#263144] via-[#253244] to-[#494949] py-8 px-4 space-y-6">
      <HomeButton />
      
      {/* Header with Logo */}
      <div className="text-center mb-8">
        <div className="w-[80px] h-[80px] mx-auto mb-4 relative">
          <img
            src="/logo.png"
            alt="Union Logo"
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              (
                e.currentTarget.nextElementSibling as HTMLElement
              ).style.display = "block";
            }}
          />
          {/* SVG Fallback */}
          <div
            className="w-full h-full bg-cyan-500/20 rounded-full items-center justify-center text-white text-xl font-bold flex"
            style={{ display: "none" }}
          >
            UU
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">KYC Management</h1>
        <p className="text-white/85">Review and manage KYC submissions</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or submission ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchSubmissions} className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Submissions</CardTitle>
          <CardDescription>
            {submissions.length} submission(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submission ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-mono text-sm">
                        {submission.submission_id}
                      </TableCell>
                      <TableCell>{submission.full_name}</TableCell>
                      <TableCell>{submission.email || 'N/A'}</TableCell>
                      <TableCell>
                        {submission.poker_platform && (
                          <div>
                            <div className="font-medium">{submission.poker_platform}</div>
                            {submission.player_id && (
                              <div className="text-sm text-gray-500">{submission.player_id}</div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[submission.status]}>
                          {STATUS_LABELS[submission.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(submission.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchSubmissionDetails(submission.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>KYC Submission Details</DialogTitle>
            <DialogDescription>
              Review submission details and update status
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <p className="text-sm">{selectedSubmission.full_name}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm">{selectedSubmission.email || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <p className="text-sm">{selectedSubmission.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Address</Label>
                    <p className="text-sm">
                      {selectedSubmission.address ? 
                        `${selectedSubmission.address}, ${selectedSubmission.city}, ${selectedSubmission.state} ${selectedSubmission.postal_code}, ${selectedSubmission.country}` : 
                        'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Poker Platform */}
              {selectedSubmission.poker_platform && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Poker Platform</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Platform</Label>
                      <p className="text-sm">{selectedSubmission.poker_platform}</p>
                    </div>
                    <div>
                      <Label>Player ID</Label>
                      <p className="text-sm">{selectedSubmission.player_id || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Device Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Device Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>IP Address</Label>
                    <p className="text-sm font-mono">{selectedSubmission.ip_address}</p>
                  </div>
                  <div>
                    <Label>Device ID</Label>
                    <p className="text-sm font-mono">{selectedSubmission.device_id || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Browser</Label>
                    <p className="text-sm">
                      {selectedSubmission.browser_info ? 
                        `${selectedSubmission.browser_info.name} ${selectedSubmission.browser_info.version}` : 
                        'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <Label>Platform</Label>
                    <p className="text-sm">{selectedSubmission.platform || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Screen Resolution</Label>
                    <p className="text-sm">{selectedSubmission.screen_resolution || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Timezone</Label>
                    <p className="text-sm">{selectedSubmission.timezone || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Language</Label>
                    <p className="text-sm">{selectedSubmission.language || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>User Agent</Label>
                    <p className="text-xs font-mono break-all">{selectedSubmission.user_agent || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>WebGL Fingerprint</Label>
                    <p className="text-sm">{selectedSubmission.webgl_fingerprint ? 'Available' : 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Canvas Fingerprint</Label>
                    <p className="text-sm">{selectedSubmission.canvas_fingerprint ? 'Available' : 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Audio Fingerprint</Label>
                    <p className="text-sm">{selectedSubmission.audio_fingerprint ? 'Available' : 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Installed Fonts</Label>
                    <p className="text-sm">{selectedSubmission.fonts?.length || 0} fonts detected</p>
                  </div>
                  <div>
                    <Label>Browser Plugins</Label>
                    <p className="text-sm">{selectedSubmission.plugins?.length || 0} plugins detected</p>
                  </div>
                </div>
                
                {/* Detailed Fingerprint Information */}
                {selectedSubmission.device_fingerprint && (
                  <div className="mt-4">
                    <Label>Device Fingerprint (JSON)</Label>
                    <div className="bg-gray-100 p-3 rounded text-xs font-mono max-h-40 overflow-y-auto">
                      <pre>{JSON.stringify(JSON.parse(selectedSubmission.device_fingerprint), null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Location Information */}
              {selectedSubmission.geolocation_data && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Location Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Location</Label>
                      <p className="text-sm">
                        {selectedSubmission.geolocation_data.city}, {selectedSubmission.geolocation_data.country}
                      </p>
                    </div>
                    <div>
                      <Label>Coordinates</Label>
                      <p className="text-sm">
                        {selectedSubmission.geolocation_data.latitude}, {selectedSubmission.geolocation_data.longitude}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* File Downloads */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Uploaded Files</h3>
                <div className="flex gap-2">
                  {selectedSubmission.driver_license_file_path && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(selectedSubmission.submission_id, 'license')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Driver License
                    </Button>
                  )}
                  {selectedSubmission.verification_video_path && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(selectedSubmission.submission_id, 'video')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Verification Video
                    </Button>
                  )}
                </div>
              </div>

              {/* Status Update */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Update Status</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="notes">Verification Notes</Label>
                    <Textarea
                      id="notes"
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      placeholder="Add verification notes..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={updateSubmissionStatus}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Update Status
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsDetailsOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
