// Admin Dashboard for CSV Upload and Data Management
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Search,
  Edit,
  Trash2,
  Save,
  X,
  Database,
  FileText,
  Activity,
  Settings
} from 'lucide-react';
import { useCSVUpload, useDashboardMetrics, useMetricOperations, useDataChanges, useCSVUploadHistory } from '@/hooks/useDashboardData';
import { DashboardMetric } from '@/lib/supabase';
import { formatDisplayValue } from '@/lib/csvParser';
import { cn } from '@/lib/utils';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('upload');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMetric, setEditingMetric] = useState<DashboardMetric | null>(null);

  // Data hooks
  const { metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useDashboardMetrics();
  const { uploadCSV, uploadProgress, isUploading, resetUpload } = useCSVUpload();
  const { updateMetric, deleteMetric, isUpdating, isDeleting } = useMetricOperations();
  const { data: dataChanges = [], isLoading: changesLoading } = useDataChanges(50);
  const { data: uploadHistory = [], isLoading: historyLoading } = useCSVUploadHistory(20);

  // CSV Upload handlers
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        alert('Please select a CSV file');
        return;
      }
      
      uploadCSV(file);
    }
  }, [uploadCSV]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      uploadCSV(file);
    } else {
      alert('Please drop a CSV file');
    }
  }, [uploadCSV]);

  // Metric editing handlers
  const handleEditMetric = (metric: DashboardMetric) => {
    setEditingMetric({ ...metric });
  };

  const handleSaveMetric = () => {
    if (editingMetric) {
      updateMetric({
        section: editingMetric.section,
        category: editingMetric.category,
        field: editingMetric.field,
        value: editingMetric.value,
        description: editingMetric.description,
        methodology: editingMetric.methodology,
        data_source: editingMetric.data_source,
        interpretation: editingMetric.interpretation,
        significance: editingMetric.significance,
        benchmarks: editingMetric.benchmarks,
        recommendations: editingMetric.recommendations
      });
      setEditingMetric(null);
    }
  };

  const handleDeleteMetric = (metric: DashboardMetric) => {
    if (confirm(`Are you sure you want to delete "${metric.field}" from ${metric.section}?`)) {
      deleteMetric({
        section: metric.section,
        category: metric.category,
        field: metric.field
      });
    }
  };

  // Filter metrics based on search
  const filteredMetrics = metrics.filter(metric =>
    metric.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
    metric.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    metric.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
    metric.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">EFB Dashboard Admin</h1>
          <p className="text-gray-600">Manage dashboard data, upload CSV files, and monitor system activity</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              CSV Upload
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Data Management
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Activity Log
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* CSV Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload CSV Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload Area */}
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    isUploading ? "border-blue-300 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                  )}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">Drop your CSV file here</p>
                      <p className="text-gray-500">or click to browse</p>
                    </div>
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
                </div>

                {/* Upload Progress */}
                {uploadProgress.status !== 'idle' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Upload Progress</span>
                      <Badge variant={
                        uploadProgress.status === 'completed' ? 'default' :
                        uploadProgress.status === 'error' ? 'destructive' :
                        'secondary'
                      }>
                        {uploadProgress.status}
                      </Badge>
                    </div>
                    
                    <Progress value={uploadProgress.progress} className="w-full" />
                    
                    <p className="text-sm text-gray-600">{uploadProgress.message}</p>
                    
                    {uploadProgress.errors.length > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-1">
                            <p className="font-medium">Warnings/Errors:</p>
                            {uploadProgress.errors.slice(0, 5).map((error, index) => (
                              <p key={index} className="text-sm">{error}</p>
                            ))}
                            {uploadProgress.errors.length > 5 && (
                              <p className="text-sm text-gray-500">
                                ... and {uploadProgress.errors.length - 5} more
                              </p>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {uploadProgress.status === 'completed' && (
                      <div className="flex gap-2">
                        <Button onClick={() => refetchMetrics()} variant="outline">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh Data
                        </Button>
                        <Button onClick={resetUpload} variant="outline">
                          Upload Another File
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Upload History */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Recent Uploads</h3>
                  {historyLoading ? (
                    <div className="text-center py-4">Loading upload history...</div>
                  ) : (
                    <div className="space-y-2">
                      {uploadHistory.slice(0, 5).map((upload) => (
                        <div key={upload.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{upload.filename}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(upload.uploaded_at).toLocaleString()} • 
                              {upload.processed_rows}/{upload.total_rows} rows processed
                            </p>
                          </div>
                          <Badge variant={
                            upload.status === 'COMPLETED' ? 'default' :
                            upload.status === 'FAILED' ? 'destructive' :
                            'secondary'
                          }>
                            {upload.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Management Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Dashboard Metrics ({filteredMetrics.length})
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search metrics..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button onClick={() => refetchMetrics()} variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <div className="text-center py-8">Loading metrics...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Section</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Field</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Last Updated</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMetrics.map((metric) => (
                          <TableRow key={`${metric.section}-${metric.category}-${metric.field}`}>
                            <TableCell className="font-medium">{metric.section}</TableCell>
                            <TableCell>{metric.category}</TableCell>
                            <TableCell>{metric.field}</TableCell>
                            <TableCell>
                              {formatDisplayValue(metric.field, metric.value)}
                            </TableCell>
                            <TableCell>
                              {new Date(metric.updated_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditMetric(metric)}
                                  disabled={isUpdating}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteMetric(metric)}
                                  disabled={isDeleting}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Edit Metric Modal */}
            {editingMetric && (
              <Card className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Edit Metric
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingMetric(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Section</Label>
                        <Input
                          value={editingMetric.section}
                          onChange={(e) => setEditingMetric({...editingMetric, section: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Input
                          value={editingMetric.category}
                          onChange={(e) => setEditingMetric({...editingMetric, category: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Field</Label>
                      <Input
                        value={editingMetric.field}
                        onChange={(e) => setEditingMetric({...editingMetric, field: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label>Value</Label>
                      <Input
                        value={editingMetric.value}
                        onChange={(e) => setEditingMetric({...editingMetric, value: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={editingMetric.description || ''}
                        onChange={(e) => setEditingMetric({...editingMetric, description: e.target.value})}
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setEditingMetric(null)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveMetric} disabled={isUpdating}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Data Change History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {changesLoading ? (
                  <div className="text-center py-8">Loading activity log...</div>
                ) : (
                  <div className="space-y-4">
                    {dataChanges.map((change) => (
                      <div key={change.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm",
                          change.change_type === 'INSERT' ? 'bg-green-500' :
                          change.change_type === 'UPDATE' ? 'bg-blue-500' :
                          'bg-red-500'
                        )}>
                          {change.change_type === 'INSERT' ? '+' :
                           change.change_type === 'UPDATE' ? '~' : '-'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{change.change_type}</span>
                            <span className="text-sm text-gray-500">{change.table_name}</span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-500">
                              {new Date(change.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">
                            Field: <span className="font-medium">{change.field_name}</span>
                          </p>
                          {change.old_value && change.new_value && (
                            <p className="text-sm text-gray-600">
                              "{change.old_value}" → "{change.new_value}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Settings panel coming soon. This will include schema management, 
                      dashboard layout configuration, and SAP API integration settings.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Database Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Total Metrics:</span>
                            <span className="font-medium">{metrics.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Update:</span>
                            <span className="font-medium">
                              {metrics.length > 0 ? 
                                new Date(Math.max(...metrics.map(m => new Date(m.updated_at).getTime()))).toLocaleString() :
                                'No data'
                              }
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Real-time Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Real-time updates active</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

