import React, { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Banknote,
  Calculator,
  Download,
  Upload,
  FileSpreadsheet,
  TrendingUp,
  Users,
  Building2,
  Calendar,
  DollarSign,
  Percent,
  Shield,
  CheckCircle,
  AlertTriangle,
  Printer,
  Clock,
  AlertCircle,
  Settings,
  MoreVertical,
  Search,
  Filter,
  Plus,
  Activity,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';export default function HRMPayroll() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State management
  const [selectedMonth, setSelectedMonth] = useState('February 2026');
  const [activeTab, setActiveTab] = useState('overview');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isPayrollDialogOpen, setIsPayrollDialogOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  
  // Payroll configuration
  const [payrollConfig, setPayrollConfig] = useState({
    profTax: 200,
    pfRate: 12,
    esiRate: 1.75,
    bonusRate: 8.33,
    hraPercent: 40,
    medicalFixed: 1250,
    tdsRate: 10,
    pfEnabled: true
  });

  // Mock employee salary data
  const [employees] = useState([
    {
      id: 'EMP001',
      name: 'John Smith',
      designation: 'Senior Software Engineer',
      department: 'Engineering',
      baseSalary: 75000,
      allowances: 15000,
      deductions: 8500,
      netSalary: 81500,
      tax: 12000,
      pf: 9000,
      esi: 1315,
      status: 'processed'
    },
    {
      id: 'EMP002',
      name: 'Sarah Johnson',
      designation: 'Product Manager',
      department: 'Product',
      baseSalary: 85000,
      allowances: 17000,
      deductions: 9200,
      netSalary: 92800,
      tax: 15300,
      pf: 10200,
      esi: 1488,
      status: 'processed'
    },
    {
      id: 'EMP003',
      name: 'Mike Brown',
      designation: 'UI/UX Designer',
      department: 'Design',
      baseSalary: 55000,
      allowances: 11000,
      deductions: 6600,
      netSalary: 59400,
      tax: 8250,
      pf: 6600,
      esi: 963,
      status: 'processed'
    },
    {
      id: 'EMP004',
      name: 'Emily Davis',
      designation: 'HR Manager',
      department: 'Human Resources',
      baseSalary: 65000,
      allowances: 13000,
      deductions: 7800,
      netSalary: 70200,
      tax: 9750,
      pf: 7800,
      esi: 1138,
      status: 'processed'
    },
    {
      id: 'EMP005',
      name: 'Alex Wilson',
      designation: 'Sales Executive',
      department: 'Sales',
      baseSalary: 45000,
      allowances: 9000,
      deductions: 5400,
      netSalary: 48600,
      tax: 6750,
      pf: 5400,
      esi: 788,
      status: 'pending'
    }
  ]);

  const [salaries, setSalaries] = useState([
    { id: 'EMP001', name: 'John Smith', designation: 'Senior Software Engineer', department: 'Engineering', basicSalary: 5000, allowances: 1500, deductions: 500, netSalary: 6000, status: 'processed', avatar: 'JS', tax: 450, pf: 150 },
    { id: 'EMP002', name: 'Sarah Johnson', designation: 'Product Manager', department: 'Product', basicSalary: 6000, allowances: 2000, deductions: 600, netSalary: 7400, status: 'processed', avatar: 'SJ', tax: 540, pf: 180 },
    { id: 'EMP003', name: 'Mike Brown', designation: 'UI/UX Designer', department: 'Design', basicSalary: 4000, allowances: 1200, deductions: 400, netSalary: 4800, status: 'pending', avatar: 'MB', tax: 360, pf: 120 },
    { id: 'EM P004', name: 'Emily Davis', designation: 'HR Manager', department: 'Human Resources', basicSalary: 5500, allowances: 1800, deductions: 550, netSalary: 6750, status: 'pending', avatar: 'ED', tax: 495, pf: 165 },
  ]);

  // Calculate summary statistics
  const payrollSummary = useMemo(() => {
    const processedEmployees = employees.filter(emp => emp.status === 'processed');
    const totalGross = employees.reduce((sum, emp) => sum + emp.baseSalary + emp.allowances, 0);
    const totalNet = employees.reduce((sum, emp) => sum + emp.netSalary, 0);
    const totalTax = employees.reduce((sum, emp) => sum + emp.tax, 0);
    const totalPF = employees.reduce((sum, emp) => sum + emp.pf, 0);
    
    return {
      totalEmployees: employees.length,
      processedEmployees: processedEmployees.length,
      pendingEmployees: employees.length - processedEmployees.length,
      totalGross,
      totalNet,
      totalDeductions: totalGross - totalNet,
      totalTax,
      totalPF,
      totalProfTax: employees.length * payrollConfig.profTax
    };
  }, [employees, payrollConfig]);

  // Export functions
  const exportToExcel = async () => {
    setIsProcessing(true);
    
    try {
      const workbook = XLSX.utils.book_new();
      
      // Employee salary sheet
      const salaryData = employees.map(emp => ({
        'Employee ID': emp.id,
        'Name': emp.name,
        'Designation': emp.designation,
        'Department': emp.department,
        'Base Salary': emp.baseSalary,
        'Allowances': emp.allowances,
        'Gross Salary': emp.baseSalary + emp.allowances,
        'Tax Deduction': emp.tax,
        'PF Deduction': emp.pf,
        'ESI Deduction': emp.esi,
        'Professional Tax': payrollConfig.profTax,
        'Total Deductions': emp.deductions,
        'Net Salary': emp.netSalary,
        'Status': emp.status.toUpperCase()
      }));
      
      const salarySheet = XLSX.utils.json_to_sheet(salaryData);
      XLSX.utils.book_append_sheet(workbook, salarySheet, 'Salary Details');
      
      // Summary sheet
      const summaryData = [
        { Metric: 'Total Employees', Value: payrollSummary.totalEmployees },
        { Metric: 'Processed Employees', Value: payrollSummary.processedEmployees },
        { Metric: 'Pending Employees', Value: payrollSummary.pendingEmployees },
        { Metric: 'Total Gross Salary', Value: payrollSummary.totalGross },
        { Metric: 'Total Net Salary', Value: payrollSummary.totalNet },
        { Metric: 'Total Deductions', Value: payrollSummary.totalDeductions },
        { Metric: 'Total Tax', Value: payrollSummary.totalTax },
        { Metric: 'Total PF', Value: payrollSummary.totalPF },
        { Metric: 'Total Professional Tax', Value: payrollSummary.totalProfTax }
      ];
      
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
      
      const filename = `Payroll_${selectedMonth.replace(' ', '_')}_${Date.now()}.xlsx`;
      XLSX.writeFile(workbook, filename);
      
      toast({
        title: "✅ Export Successful",
        description: `Payroll data exported to ${filename}`,
      });
    } catch (error) {
      toast({
        title: "❌ Export Failed",
        description: "Failed to export payroll data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const exportToPDF = async () => {
    setIsProcessing(true);
    
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Payroll Report', 20, 30);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Period: ${selectedMonth}`, 20, 45);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 55);
      
      // Summary section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', 20, 75);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Employees: ${payrollSummary.totalEmployees}`, 20, 90);
      doc.text(`Total Gross: $${payrollSummary.totalGross.toLocaleString()}`, 20, 100);
      doc.text(`Total Net: $${payrollSummary.totalNet.toLocaleString()}`, 20, 110);
      doc.text(`Total Deductions: $${payrollSummary.totalDeductions.toLocaleString()}`, 20, 120);
      
      // Employee details table
      const tableData = employees.map(emp => [
        emp.id,
        emp.name,
        emp.department,
        `$${emp.baseSalary.toLocaleString()}`,
        `$${emp.allowances.toLocaleString()}`,
        `$${emp.deductions.toLocaleString()}`,
        `$${emp.netSalary.toLocaleString()}`,
        emp.status.toUpperCase()
      ]);
      
      autoTable(doc, {
        head: [['ID', 'Name', 'Department', 'Base Salary', 'Allowances', 'Deductions', 'Net Salary', 'Status']],
        body: tableData,
        startY: 140,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 8, cellPadding: 2 }
      });
      
      const filename = `Payroll_Report_${selectedMonth.replace(' ', '_')}_${Date.now()}.pdf`;
      doc.save(filename);
      
      toast({
        title: "✅ PDF Generated",
        description: `Report saved as ${filename}`,
      });
    } catch (error) {
      toast({
        title: "❌ PDF Generation Failed",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const processPayroll = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate payroll processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "✅ Payroll Processed Successfully",
        description: `${selectedMonth} payroll has been processed for ${employees.length} employees.`,
      });
    } catch (error) {
      toast({
        title: "❌ Processing Failed",
        description: "Failed to process payroll. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">💰 Payroll Management</h1>
              <p className="text-blue-100 mt-2">Manage employee salaries, deductions, and statutory compliance</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[200px] bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="February 2026">February 2026</SelectItem>
                  <SelectItem value="January 2026">January 2026</SelectItem>
                  <SelectItem value="December 2025">December 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Employees"
            value={payrollSummary.totalEmployees.toString()}
            icon={<Users className="h-5 w-5" />}
            color="blue"
            trend="up"
          />
          <StatCard 
            title="Gross Payroll"
            value={`$${payrollSummary.totalGross.toLocaleString()}`}
            icon={<DollarSign className="h-5 w-5" />}
            color="emerald"
            trend="up"
          />
          <StatCard 
            title="Net Payroll"
            value={`$${payrollSummary.totalNet.toLocaleString()}`}
            icon={<Banknote className="h-5 w-5" />}
            color="indigo"
            trend="up"
          />
          <StatCard 
            title="Total Deductions"
            value={`$${payrollSummary.totalDeductions.toLocaleString()}`}
            icon={<Percent className="h-5 w-5" />}
            color="orange"
            trend="none"
          />
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Employee Details
            </TabsTrigger>
            <TabsTrigger value="statutory" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Statutory Compliance
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6">
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Payroll Summary - {selectedMonth}
                  </CardTitle>
                  <CardDescription>
                    Comprehensive overview of current payroll cycle
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                      <div className="text-2xl font-bold text-emerald-700">
                        {payrollSummary.processedEmployees}
                      </div>
                      <div className="text-sm text-emerald-600">Processed</div>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <div className="text-2xl font-bold text-amber-700">
                        {payrollSummary.pendingEmployees}
                      </div>
                      <div className="text-sm text-amber-600">Pending</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-700">
                        ${payrollSummary.totalNet.toLocaleString()}
                      </div>
                      <div className="text-sm text-blue-600">Total Net Pay</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      onClick={processPayroll} 
                      disabled={isProcessing}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isProcessing ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <Calculator className="h-4 w-4 mr-2" />
                          Process Payroll
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={exportToExcel} disabled={isProcessing}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export Excel
                    </Button>
                    <Button variant="outline" onClick={exportToPDF} disabled={isProcessing}>
                      <Printer className="h-4 w-4 mr-2" />
                      Generate PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Employee Details Tab */}
          <TabsContent value="employees" className="mt-6">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Employee Salary Details</CardTitle>
                <CardDescription>
                  Detailed breakdown of individual employee salaries and deductions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-right">Base Salary</TableHead>
                        <TableHead className="text-right">Allowances</TableHead>
                        <TableHead className="text-right">Deductions</TableHead>
                        <TableHead className="text-right">Net Salary</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{employee.name}</div>
                              <div className="text-sm text-slate-500">{employee.designation}</div>
                            </div>
                          </TableCell>
                          <TableCell>{employee.department}</TableCell>
                          <TableCell className="text-right">${employee.baseSalary.toLocaleString()}</TableCell>
                          <TableCell className="text-right">${employee.allowances.toLocaleString()}</TableCell>
                          <TableCell className="text-right">${employee.deductions.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-bold">${employee.netSalary.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge 
                              className={employee.status === 'processed' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-amber-100 text-amber-700'
                              }
                            >
                              {employee.status === 'processed' ? 'Processed' : 'Pending'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statutory Compliance Tab */}
          <TabsContent value="statutory" className="mt-6">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Statutory Compliance Summary
                </CardTitle>
                <CardDescription>
                  Tax and statutory deduction details for government compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-lg font-bold text-blue-700">
                        ${payrollSummary.totalTax.toLocaleString()}
                      </div>
                      <div className="text-sm text-blue-600">Total Income Tax</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-lg font-bold text-green-700">
                        ${payrollSummary.totalPF.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-600">Total PF Contribution</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-lg font-bold text-purple-700">
                        ${payrollSummary.totalProfTax.toLocaleString()}
                      </div>
                      <div className="text-sm text-purple-600">Professional Tax</div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead className="text-right">Income Tax</TableHead>
                          <TableHead className="text-right">PF (Employee)</TableHead>
                          <TableHead className="text-right">PF (Employer)</TableHead>
                          <TableHead className="text-right">ESI</TableHead>
                          <TableHead className="text-right">Prof. Tax</TableHead>
                          <TableHead className="text-right">Total Statutory</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {employees.map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{employee.name}</div>
                                <div className="text-sm text-slate-500">{employee.id}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">${employee.tax.toLocaleString()}</TableCell>
                            <TableCell className="text-right">${employee.pf.toLocaleString()}</TableCell>
                            <TableCell className="text-right">${employee.pf.toLocaleString()}</TableCell>
                            <TableCell className="text-right">${employee.esi.toLocaleString()}</TableCell>
                            <TableCell className="text-right">${payrollConfig.profTax}</TableCell>
                            <TableCell className="text-right font-bold">
                              ${(employee.tax + employee.pf * 2 + employee.esi + payrollConfig.profTax).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="mt-6">
            <div className="grid gap-6">
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle>Generate Reports</CardTitle>
                  <CardDescription>
                    Export payroll data in various formats for compliance and record-keeping
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FileSpreadsheet className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">Excel Report</h3>
                          <p className="text-sm text-slate-600 mt-1">
                            Detailed spreadsheet with all salary components and calculations
                          </p>
                          <Button 
                            className="mt-3" 
                            variant="outline" 
                            onClick={exportToExcel}
                            disabled={isProcessing}
                          >
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Export Excel
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Printer className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">PDF Report</h3>
                          <p className="text-sm text-slate-600 mt-1">
                            Professional formatted report suitable for official documentation
                          </p>
                          <Button 
                            className="mt-3" 
                            variant="outline" 
                            onClick={exportToPDF}
                            disabled={isProcessing}
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            Generate PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
  
  const handleDownloadAllZip = async () => {
    toast({
      title: "Feature Coming Soon",
      description: "Bulk ZIP download will be available in the next update.",
    });
  };

  const handleRunPayroll = () => {
    setIsProcessing(true);
    setProcessProgress(0);
    
    const interval = setInterval(() => {
      setProcessProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setSalaries(salaries.map(s => {
            // Recalculate based on current config for pending ones
            if (s.status === 'pending') {
              const hra = (s.basicSalary * payrollConfig.hraPercent) / 100;
              const allowances = hra + payrollConfig.medicalFixed;
              const tax = (s.basicSalary + allowances) * (payrollConfig.tdsRate / 100);
              const pf = payrollConfig.pfEnabled ? s.basicSalary * 0.12 : 0;
              const deductions = tax + pf + payrollConfig.profTax;
              const netSalary = (s.basicSalary + allowances) - deductions;
              
              return { 
                ...s, 
                status: 'processed',
                allowances,
                tax,
                pf,
                deductions,
                netSalary: Math.round(netSalary)
              };
            }
            return s;
          }));
          setIsProcessing(false);
          toast({ 
            title: "Payroll Successfully Disbursed", 
            description: `All salaries for ${selectedMonth} have been processed and bank transfers initiated.` 
          });
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleUpdateConfig = (key: string, value: any) => {
    setPayrollConfig(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Config Updated",
      description: `${key} has been updated. This will affect future calculations.`,
    });
  };

  const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
    processed: { label: 'Paid', class: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
    pending: { label: 'Calculated', class: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
    hold: { label: 'On Hold', class: 'bg-rose-100 text-rose-700 border-rose-200', icon: AlertCircle }
  };

  const filteredSalaries = useMemo(() => {
    return salaries.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, salaries]);

  const handleExport = (type: 'excel' | 'pdf') => {
    setIsExporting(true);
    toast({ title: "Exporting...", description: `Generating payroll report in ${type.toUpperCase()}.` });

    setTimeout(() => {
      if (type === 'excel') {
        const ws = XLSX.utils.json_to_sheet(filteredSalaries);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Payroll");
        XLSX.writeFile(wb, `Payroll_${selectedMonth}.xlsx`);
      } else {
        const doc = new jsPDF();
        doc.text(`Payroll Report - ${selectedMonth}`, 14, 15);
        autoTable(doc, {
          startY: 25,
          head: [['ID', 'Employee', 'Basic', 'Allowances', 'Deductions', 'Net Salary', 'Status']],
          body: filteredSalaries.map(s => [s.id, s.name, s.basicSalary, s.allowances, s.deductions, s.netSalary, s.status]),
        });
        doc.save(`Payroll_${selectedMonth}.pdf`);
      }
      setIsExporting(false);
      toast({ title: "Export Ready", description: "Your document is ready." });
    }, 1200);
  };
}
function StatCard({ title, value, icon, color, sub, trend = 'none' }: { title: string, value: string, icon: React.ReactNode, color: string, sub?: string, trend?: 'up' | 'down' | 'none' }) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100"
  };

  return (
    <Card className="rounded-2xl border-slate-200/60 shadow-sm hover:shadow-md transition-all group overflow-hidden">
      <CardContent className="p-6 relative">
        <div className="flex justify-between items-start mb-4">
          <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110", colorMap[color])}>
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5" }) : icon}
          </div>
          {trend !== 'none' && (
            <div className={cn(
              "flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
              trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            )}>
              {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingUp className="h-3 w-3 rotate-180" />}
              {trend === 'up' ? '+8%' : '-2.5%'}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-900">{value}</h3>
          </div>
          <p className="text-[10px] text-slate-500 font-bold italic tracking-tight">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}
