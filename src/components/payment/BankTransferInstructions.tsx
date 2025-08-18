import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Copy, Upload, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { BankDetails } from '@/types/payment';
import { toast } from 'sonner';

interface BankTransferInstructionsProps {
  bankDetails: BankDetails;
  orderId: string;
  onUploadProof?: (file: File) => Promise<void>;
}

export function BankTransferInstructions({ 
  bankDetails, 
  orderId, 
  onUploadProof 
}: BankTransferInstructionsProps) {
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPG, PNG) or PDF file');
        return;
      }

      if (file.size > maxSize) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setProofFile(file);
    }
  };

  const handleUploadProof = async () => {
    if (!proofFile || !onUploadProof) return;

    setUploading(true);
    try {
      await onUploadProof(proofFile);
      toast.success('Proof of payment uploaded successfully');
      setProofFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload proof of payment');
    } finally {
      setUploading(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Status Header */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-amber-800 dark:text-amber-200">
              Payment Pending Verification
            </CardTitle>
          </div>
          <CardDescription className="text-amber-700 dark:text-amber-300">
            Your order has been created. Complete the bank transfer to proceed.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Bank Transfer Details */}
      <Card>
        <CardHeader>
          <CardTitle>Bank Transfer Details</CardTitle>
          <CardDescription>
            Use the following information to complete your bank transfer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex justify-between items-center">
              <Label className="font-medium">Bank Name:</Label>
              <div className="flex items-center gap-2">
                <span>{bankDetails.bankName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(bankDetails.bankName)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Label className="font-medium">Account Name:</Label>
              <div className="flex items-center gap-2">
                <span>{bankDetails.accountName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(bankDetails.accountName)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Label className="font-medium">Account Number:</Label>
              <div className="flex items-center gap-2">
                <span className="font-mono">{bankDetails.accountNumber}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(bankDetails.accountNumber)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Label className="font-medium">SWIFT Code:</Label>
              <div className="flex items-center gap-2">
                <span className="font-mono">{bankDetails.swiftCode}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(bankDetails.swiftCode)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <Label className="font-medium">Amount to Transfer:</Label>
              <Badge variant="secondary" className="text-lg">
                {formatAmount(bankDetails.amount, bankDetails.currency)}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <Label className="font-medium">Reference Number:</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  {bankDetails.reference}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(bankDetails.reference)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 list-decimal list-inside">
            {bankDetails.instructions.map((instruction, index) => (
              <li key={index} className="text-sm">
                {instruction}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Upload Proof of Payment */}
      {onUploadProof && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Proof of Payment</CardTitle>
            <CardDescription>
              Upload a screenshot or photo of your bank transfer receipt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="proof-upload">Select File</Label>
              <Input
                id="proof-upload"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Accepted formats: JPG, PNG, PDF (max 5MB)
              </p>
            </div>

            {proofFile && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{proofFile.name}</span>
                </div>
                <Button
                  onClick={handleUploadProof}
                  disabled={uploading}
                  size="sm"
                >
                  {uploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-pulse" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Important Notice */}
      <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-800 dark:text-red-200">
              Important Notice
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-red-700 dark:text-red-300 text-sm space-y-2">
          <p>• Keep your transfer receipt safe until payment is verified</p>
          <p>• Payment verification may take 1-3 business days</p>
          <p>• Contact support if you have any issues with the transfer</p>
          <p>• This order will expire if payment is not received within 7 days</p>
        </CardContent>
      </Card>
    </div>
  );
}