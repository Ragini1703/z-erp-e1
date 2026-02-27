import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Upload, Download, FileText, CheckCircle, XCircle, 
  AlertTriangle, Users, FileSpreadsheet, ArrowRight,
  Info, Trash2, Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface ImportResult {
  success: number;
  failed: number;
  total: number;
  errors: Array<{ row: number; error: string; data: any }>;
  successData: Array<any>;
}

interface Lead {
  name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  assignedTo: string;
}

export default function BulkImport() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<Lead[]>([]);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV file",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      previewCSV(selectedFile);
    }
  };

  const previewCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Parse first 5 rows for preview
      const preview: Lead[] = [];
      for (let i = 1; i < Math.min(6, lines.length); i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          preview.push({
            name: values[0] || '',
            company: values[1] || '',
            email: values[2] || '',
            phone: values[3] || '',
            status: values[4] || 'New',
            source: values[5] || 'Import',
            assignedTo: values[6] || 'Unassigned',
          });
        }
      }
      setPreviewData(preview);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to import",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    setProgress(0);

    // Simulate file reading and processing
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());

      const successData: any[] = [];
      const errors: any[] = [];
      let processed = 0;

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        try {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          
          // Validate required fields
          if (!values[0] || !values[2]) {
            errors.push({
              row: i + 1,
              error: 'Missing required fields (Name or Email)',
              data: lines[i]
            });
            continue;
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(values[2])) {
            errors.push({
              row: i + 1,
              error: 'Invalid email format',
              data: lines[i]
            });
            continue;
          }

          const lead = {
            name: values[0],
            company: values[1] || '',
            email: values[2],
            phone: values[3] || '',
            status: values[4] || 'New',
            source: values[5] || 'Import',
            assignedTo: values[6] || 'Unassigned',
          };

          successData.push(lead);

          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 50));

        } catch (error) {
          errors.push({
            row: i + 1,
            error: 'Failed to parse row',
            data: lines[i]
          });
        }

        processed++;
        setProgress((processed / (lines.length - 1)) * 100);
      }

      setImportResult({
        success: successData.length,
        failed: errors.length,
        total: lines.length - 1,
        errors,
        successData,
      });

      setImporting(false);

      if (successData.length > 0) {
        toast({
          title: "Import Complete",
          description: `Successfully imported ${successData.length} leads`,
        });
      }
    };

    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = "Name,Company,Email,Phone,Status,Source,Assigned To\n" +
      "John Doe,Acme Corp,john@acme.com,+1234567890,New,Website,Sales Team\n" +
      "Jane Smith,Tech Inc,jane@tech.com,+0987654321,Qualified,Referral,John Doe\n" +
      "Bob Johnson,Global Ltd,bob@global.com,+1122334455,Contacted,LinkedIn,Sales Team";

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lead-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "CSV template has been downloaded",
    });
  };

  const resetImport = () => {
    setFile(null);
    setImportResult(null);
    setPreviewData([]);
    setProgress(0);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bulk Lead Import</h1>
            <p className="text-muted-foreground mt-1">
              Import multiple leads at once using CSV files
            </p>
          </div>
          <Button onClick={downloadTemplate} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload CSV File
                </CardTitle>
                <CardDescription>
                  Select a CSV file containing lead data to import
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <FileSpreadsheet className="w-12 h-12 text-gray-400" />
                    <div>
                      <span className="text-blue-600 hover:text-blue-700 font-medium">
                        Click to upload
                      </span>
                      <span className="text-gray-600"> or drag and drop</span>
                    </div>
                    <p className="text-sm text-gray-500">CSV files only</p>
                  </label>
                </div>

                {file && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetImport}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {importing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Processing...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                <Button
                  onClick={handleImport}
                  disabled={!file || importing}
                  className="w-full"
                  size="lg"
                >
                  {importing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Import Leads
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Preview Data */}
            {previewData.length > 0 && !importResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Data Preview
                  </CardTitle>
                  <CardDescription>
                    Preview of first 5 rows from your CSV
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.map((lead, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{lead.name}</TableCell>
                            <TableCell>{lead.company}</TableCell>
                            <TableCell>{lead.email}</TableCell>
                            <TableCell>{lead.phone}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{lead.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Import Results */}
            {importResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Import Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="summary">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                      <TabsTrigger value="success">
                        Success ({importResult.success})
                      </TabsTrigger>
                      <TabsTrigger value="errors">
                        Errors ({importResult.failed})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary" className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <Users className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                              <div className="text-2xl font-bold">{importResult.total}</div>
                              <div className="text-sm text-muted-foreground">Total Rows</div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                              <div className="text-2xl font-bold text-green-600">
                                {importResult.success}
                              </div>
                              <div className="text-sm text-muted-foreground">Successful</div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <XCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
                              <div className="text-2xl font-bold text-red-600">
                                {importResult.failed}
                              </div>
                              <div className="text-sm text-muted-foreground">Failed</div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          {importResult.success > 0 
                            ? `Successfully imported ${importResult.success} leads into your CRM.`
                            : 'No leads were imported. Please check the errors tab.'}
                        </AlertDescription>
                      </Alert>
                    </TabsContent>

                    <TabsContent value="success">
                      {importResult.successData.length > 0 ? (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {importResult.successData.slice(0, 10).map((lead, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="font-medium">{lead.name}</TableCell>
                                  <TableCell>{lead.company}</TableCell>
                                  <TableCell>{lead.email}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                      {lead.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          {importResult.successData.length > 10 && (
                            <p className="text-sm text-gray-500 mt-2 text-center">
                              Showing first 10 of {importResult.successData.length} successful imports
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No successful imports
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="errors">
                      {importResult.errors.length > 0 ? (
                        <div className="space-y-2">
                          {importResult.errors.map((error, idx) => (
                            <Alert key={idx} variant="destructive">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                <strong>Row {error.row}:</strong> {error.error}
                                <div className="text-xs mt-1 opacity-75">{error.data}</div>
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No errors found
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>

                  <div className="flex gap-2 mt-4">
                    <Button onClick={resetImport} variant="outline" className="flex-1">
                      Import Another File
                    </Button>
                    <Button asChild className="flex-1">
                      <a href="/leads">
                        View All Leads
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Instructions Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs">
                      1
                    </span>
                    Download Template
                  </h4>
                  <p className="text-muted-foreground ml-8">
                    Click the "Download Template" button to get a sample CSV file with the correct format.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs">
                      2
                    </span>
                    Prepare Your Data
                  </h4>
                  <p className="text-muted-foreground ml-8">
                    Fill in your lead data following the template format. Required fields are Name and Email.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs">
                      3
                    </span>
                    Upload & Import
                  </h4>
                  <p className="text-muted-foreground ml-8">
                    Upload your CSV file and click "Import Leads" to add them to your CRM.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">CSV Format</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold">Required Fields:</span>
                  <ul className="mt-1 ml-4 space-y-1 text-muted-foreground">
                    <li>• Name</li>
                    <li>• Email</li>
                  </ul>
                </div>
                <div>
                  <span className="font-semibold">Optional Fields:</span>
                  <ul className="mt-1 ml-4 space-y-1 text-muted-foreground">
                    <li>• Company</li>
                    <li>• Phone</li>
                    <li>• Status</li>
                    <li>• Source</li>
                    <li>• Assigned To</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="w-5 h-5" />
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-yellow-900">
                <p>• Email addresses must be valid and unique</p>
                <p>• Duplicate emails will be skipped</p>
                <p>• Maximum file size: 10MB</p>
                <p>• Recommended: Test with small batch first</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
