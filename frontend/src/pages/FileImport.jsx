/**
 * FileImport - Import students from CTF or CSV files.
 */
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  File,
  Loader2,
  CheckCircle,
  AlertCircle,
  Users,
  Download,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import api from '@/services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';

const FileImport = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [csvFormat, setCsvFormat] = useState('generic');
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [importResult, setImportResult] = useState(null);

  // Load classes on mount
  React.useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data || []);
    } catch (err) {
      console.error('Failed to load classes:', err);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setPreview(null);
    setImportResult(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('file_type', 'auto');
      if (csvFormat) {
        formData.append('csv_format', csvFormat);
      }

      const response = await api.post('/integrations/import/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPreview(response.data);
    } catch (err) {
      console.error('Preview failed:', err);
      toast.error(err.response?.data?.detail || 'Failed to parse file');
      setFile(null);
    } finally {
      setLoading(false);
    }
  }, [csvFormat]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/xml': ['.xml', '.ctf'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleImport = async () => {
    if (!selectedClass || !file) {
      toast.error('Please select a class to import into');
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      let endpoint = '';
      if (preview?.file_type === 'ctf') {
        endpoint = `/integrations/import/ctf/${selectedClass}`;
      } else {
        endpoint = `/integrations/import/csv/${selectedClass}`;
        formData.append('format', csvFormat);
      }

      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setImportResult(response.data);
      toast.success(`Imported ${response.data.students_imported} students!`);
    } catch (err) {
      console.error('Import failed:', err);
      toast.error(err.response?.data?.detail || 'Failed to import students');
    } finally {
      setImporting(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setImportResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/integrations')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Import Students</h1>
              <p className="text-sm text-muted-foreground">Import from CTF or CSV files</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Success State */}
        {importResult && (
          <Alert className="mb-6 border-emerald-200 bg-emerald-50">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <AlertTitle className="text-emerald-800">Import Successful!</AlertTitle>
            <AlertDescription className="text-emerald-700">
              <div className="mt-2 space-y-1">
                <p><strong>{importResult.students_imported}</strong> students imported</p>
                <p><strong>{importResult.students_skipped}</strong> duplicates skipped</p>
                {importResult.source_school && (
                  <p>From: {importResult.source_school.school_name}</p>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" onClick={() => navigate(`/classes/${selectedClass}`)}>
                  View Class
                </Button>
                <Button size="sm" variant="outline" onClick={resetForm}>
                  Import More
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* File Upload */}
        {!importResult && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload File
                </CardTitle>
                <CardDescription>
                  Drag and drop a CTF or CSV file, or click to browse
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* CSV Format Selector */}
                <div className="mb-4">
                  <Label>CSV Format (if uploading CSV)</Label>
                  <Select value={csvFormat} onValueChange={setCsvFormat}>
                    <SelectTrigger className="mt-1.5 w-[250px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="generic">Generic (First Name, Last Name, Email)</SelectItem>
                      <SelectItem value="sims">SIMS Export</SelectItem>
                      <SelectItem value="arbor">Arbor Export</SelectItem>
                      <SelectItem value="bromcom">Bromcom Export</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dropzone */}
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                    isDragActive ? "border-violet-500 bg-violet-50" : "border-slate-300 hover:border-violet-400",
                    file && "border-emerald-500 bg-emerald-50"
                  )}
                >
                  <input {...getInputProps()} data-testid="file-input" />
                  
                  {loading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-10 h-10 text-violet-600 animate-spin mb-3" />
                      <p className="text-muted-foreground">Parsing file...</p>
                    </div>
                  ) : file ? (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-3">
                        {file.name.endsWith('.csv') ? (
                          <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                        ) : (
                          <File className="w-6 h-6 text-emerald-600" />
                        )}
                      </div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          resetForm();
                        }}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6 text-slate-500" />
                      </div>
                      <p className="font-medium">Drop your file here</p>
                      <p className="text-sm text-muted-foreground">
                        Supports .ctf, .xml (CTF), and .csv files
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            {preview && (
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Preview ({preview.students_found} students found)
                    </CardTitle>
                    <Badge variant={preview.file_type === 'ctf' ? 'default' : 'secondary'}>
                      {preview.file_type === 'ctf' ? `CTF v${preview.version || 'unknown'}` : 'CSV'}
                    </Badge>
                  </div>
                  {preview.source_school && (
                    <CardDescription>
                      From: {preview.source_school.school_name} ({preview.source_school.urn})
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {/* Errors */}
                  {preview.errors?.length > 0 && (
                    <Alert className="mb-4 border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700">
                        {preview.errors.map((e, i) => <p key={i}>{e}</p>)}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Warnings */}
                  {preview.warnings?.length > 0 && (
                    <Alert className="mb-4 border-amber-200 bg-amber-50">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-700">
                        {preview.warnings.length} warnings. Some records may be incomplete.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Student Preview Table */}
                  {preview.students?.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>UPN</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Class</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {preview.students.map((student, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">
                                {student.forename} {student.surname}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {student.email || '-'}
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {student.upn || '-'}
                              </TableCell>
                              <TableCell>{student.year_group || '-'}</TableCell>
                              <TableCell>{student.registration_group || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {preview.students_found > 10 && (
                        <p className="p-3 text-sm text-muted-foreground text-center bg-slate-50">
                          Showing 10 of {preview.students_found} students
                        </p>
                      )}
                    </div>
                  )}

                  {/* Class Selection & Import */}
                  {preview.success && preview.students_found > 0 && (
                    <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                      <Label>Import into class</Label>
                      <div className="flex gap-3 mt-2">
                        <Select value={selectedClass} onValueChange={setSelectedClass}>
                          <SelectTrigger className="flex-1" data-testid="class-select">
                            <SelectValue placeholder="Select a class..." />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map(c => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name} ({c.student_count || 0} students)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={handleImport}
                          disabled={!selectedClass || importing}
                          className="bg-emerald-600 hover:bg-emerald-700"
                          data-testid="import-btn"
                        >
                          {importing ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4 mr-2" />
                          )}
                          Import {preview.students_found} Students
                        </Button>
                      </div>
                      {classes.length === 0 && (
                        <p className="mt-2 text-sm text-amber-600">
                          No classes found. <a href="/classes" className="underline">Create a class first</a>.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Help Section */}
            <Card>
              <CardHeader>
                <CardTitle>Supported File Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                      <Badge className="bg-amber-100 text-amber-700">CTF</Badge>
                      Common Transfer File (UK)
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      The UK standard format for transferring pupil data between schools. 
                      Export from SIMS, Arbor, Bromcom, or any UK MIS.
                    </p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Supports CTF 15.0, 17.0, 18.0</li>
                      <li>• Includes UPN, year group, contacts</li>
                      <li>• .ctf or .xml extension</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                      <Badge className="bg-green-100 text-green-700">CSV</Badge>
                      Spreadsheet Export
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Export student lists as CSV from any system. 
                      We support common MIS export formats.
                    </p>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• SIMS, Arbor, Bromcom formats</li>
                      <li>• Generic (First Name, Last Name, Email)</li>
                      <li>• UTF-8 encoding recommended</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default FileImport;
