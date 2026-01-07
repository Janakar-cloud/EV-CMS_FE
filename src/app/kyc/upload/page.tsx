'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { kycService } from '@/lib/kyc-service';
import { uploadService } from '@/lib/upload-service';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Loader2, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function KYCUploadPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    documentType: '',
    documentNumber: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Only JPG, PNG, and PDF files are allowed');
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.documentType || !formData.documentNumber || !file) {
      toast.error('Please fill in all required fields and upload a document');
      return;
    }

    try {
      setUploading(true);
      
      // Upload file
      const uploadResponse = await uploadService.uploadFile(file, 'kyc');
      
      // Submit KYC
      await kycService.submitKYC({
        documentType: formData.documentType as 'aadhaar' | 'pan' | 'driving_license' | 'passport',
        documentNumber: formData.documentNumber,
        documentUrl: uploadResponse.url,
      });

      toast.success('KYC document submitted successfully');
      router.push('/profile');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit KYC document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Upload KYC Document</CardTitle>
          <CardDescription>Submit your identity verification documents</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type *</Label>
              <Select
                value={formData.documentType}
                onValueChange={(value) => setFormData({ ...formData, documentType: value })}
              >
                <SelectTrigger id="documentType">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                  <SelectItem value="pan">PAN Card</SelectItem>
                  <SelectItem value="driving_license">Driving License</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentNumber">Document Number *</Label>
              <Input
                id="documentNumber"
                placeholder="Enter document number"
                value={formData.documentNumber}
                onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Upload Document *</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="file"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                {file && <FileText className="h-5 w-5 text-green-600" />}
              </div>
              <p className="text-sm text-muted-foreground">
                Supported formats: JPG, PNG, PDF (Max 10MB)
              </p>
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="rounded-md bg-muted p-4">
              <h4 className="mb-2 font-semibold">Important Notes:</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>Document must be clear and readable</li>
                <li>All corners of the document should be visible</li>
                <li>Document should not be expired</li>
                <li>Verification typically takes 24-48 hours</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Submit Document
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
