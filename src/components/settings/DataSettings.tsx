import { useRef } from 'react';
import { Database, FileJson, FileSpreadsheet, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface DataSettingsProps {
  exportData: (format: 'json' | 'csv') => void;
  importData: (data: string) => boolean | Promise<boolean>;
  clearAllData: () => void;
}

/**
 * Data management settings - Export, import, clear data
 */
export function DataSettings({ exportData, importData, clearAllData }: DataSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const success = await importData(content);
      if (success) {
        toast.success('Data imported successfully!');
      } else {
        toast.error('Failed to import data. Invalid format.');
      }
    };
    reader.readAsText(file);
  };

  const handleExportJSON = () => {
    exportData('json');
    toast.success('JSON backup exported!');
  };

  const handleExportCSV = () => {
    exportData('csv');
    toast.success('CSV export completed!');
  };

  const handleClearData = () => {
    clearAllData();
    toast.success('All data cleared!');
  };

  return (
    <section className="glass-card p-4 slide-up" style={{ animationDelay: '0.25s' }}>
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Database className="w-4 h-4 text-primary" />
        Data Management
      </h3>
      
      <div className="space-y-3">
        {/* Export JSON */}
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2"
          onClick={handleExportJSON}
        >
          <FileJson className="w-4 h-4" />
          Export Full Backup (JSON)
        </Button>

        {/* Export CSV */}
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2"
          onClick={handleExportCSV}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export Habits (CSV)
        </Button>

        {/* Import */}
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-4 h-4" />
          Import Data from Backup
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        {/* Clear Data */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All Data?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your habits, goals, tasks, and logs. 
                This action cannot be undone. Make sure to export a backup first.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleClearData} 
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <p className="text-xs text-muted-foreground mt-2">
          Your data syncs automatically to the cloud when online.
        </p>
      </div>
    </section>
  );
}
