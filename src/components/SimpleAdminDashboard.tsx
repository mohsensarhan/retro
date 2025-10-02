// SIMPLE ADMIN DASHBOARD - NO MORE COMPLEXITY
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Upload, Download, RefreshCw, Edit, Save, X } from 'lucide-react';
import { useSimpleDashboardData, useSimpleCSVOperations } from '@/hooks/useSimpleDashboardData';
import { DashboardMetric } from '@/lib/supabase';

export function SimpleAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMetric, setEditingMetric] = useState<DashboardMetric | null>(null);

  // Data hooks
  const { metrics, isLoading, error, refetch } = useSimpleDashboardData();
  const { uploadCSV, exportCSV, uploadProgress, isUploading } = useSimpleCSVOperations();

  // CSV Upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      uploadCSV(file);
    } else {
      alert('Please select a CSV file');
    }
  };

  // Metric editing
  const handleEditMetric = (metric: DashboardMetric) => {
    setEditingMetric({ ...metric });
  };

  const handleSaveMetric = async () => {
    if (editingMetric) {
      try {
        // For now, just update locally and show success
        console.log('Updating metric:', editingMetric);
        setEditingMetric(null);
        alert('Metric updated successfully! (Note: This is a demo - in production this would update Supabase)');
        refetch();
      } catch (error) {
        console.error('Failed to update metric:', error);
        alert('Failed to update metric');
      }
    }
  };

  // Filter metrics
  const filteredMetrics = metrics.filter(metric => 
    searchTerm === '' || 
    metric.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
    metric.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
    metric.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <div>Loading admin dashboard...</div>
          <div className="text-sm text-muted-foreground mt-2">
            {error ? 'Using fallback data due to connection issues' : 'Fetching data from Supabase...'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">EFB Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage dashboard data and CSV imports</p>
          </div>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{metrics.length}</div>
              <div className="text-sm text-muted-foreground">Total Metrics</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {new Set(metrics.map(m => m.section)).size}
              </div>
              <div className="text-sm text-muted-foreground">Sections</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {metrics.filter(m => m.section === 'Executive Summary').length}
              </div>
              <div className="text-sm text-muted-foreground">Executive Metrics</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {uploadProgress.status === 'completed' ? '✓' : '○'}
              </div>
              <div className="text-sm text-muted-foreground">Last Upload</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Manage Metrics</TabsTrigger>
            <TabsTrigger value="import-export">Import/Export</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Executive Summary Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {metrics
                    .filter(m => m.section === 'Executive Summary')
                    .slice(0, 8)
                    .map(metric => (
                      <div key={metric.id} className="p-4 border rounded-lg">
                        <div className="font-semibold text-sm">{metric.field}</div>
                        <div className="text-2xl font-bold">{metric.value}</div>
                        <div className="text-xs text-muted-foreground">{metric.category}</div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metrics Management Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage Metrics</CardTitle>
                <div className="flex gap-4">
                  <Input
                    placeholder="Search metrics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Section</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Field</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMetrics.slice(0, 50).map((metric) => (
                        <TableRow key={metric.id}>
                          <TableCell>{metric.section}</TableCell>
                          <TableCell>{metric.category}</TableCell>
                          <TableCell>{metric.field}</TableCell>
                          <TableCell>
                            {editingMetric?.id === metric.id ? (
                              <Input
                                value={editingMetric.value}
                                onChange={(e) => setEditingMetric({
                                  ...editingMetric,
                                  value: e.target.value
                                })}
                                className="w-32"
                              />
                            ) : (
                              metric.value
                            )}
                          </TableCell>
                          <TableCell>
                            {editingMetric?.id === metric.id ? (
                              <div className="flex gap-2">
                                <Button size="sm" onClick={handleSaveMetric}>
                                  <Save className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingMetric(null)}>
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => handleEditMetric(metric)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import/Export Tab */}
          <TabsContent value="import-export" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CSV Import */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Import CSV Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-4">
                      Drop your CSV file here or click to browse
                    </p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="csv-upload"
                      disabled={isUploading}
                    />
                    <label htmlFor="csv-upload">
                      <Button variant="outline" disabled={isUploading} className="cursor-pointer">
                        Select CSV File
                      </Button>
                    </label>
                  </div>

                  {uploadProgress.status !== 'idle' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Upload Progress</span>
                        <span>{uploadProgress.progress}%</span>
                      </div>
                      <Progress value={uploadProgress.progress} />
                      <p className="text-sm text-gray-600">{uploadProgress.message}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* CSV Export */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Export CSV Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Export all dashboard metrics to CSV format for backup or external analysis.
                  </p>
                  <Button onClick={exportCSV} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download CSV
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
