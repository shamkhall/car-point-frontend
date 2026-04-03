import { CheckCircle, XCircle, Clock, Car, Shield } from 'lucide-react';
import type { VINReport } from '@/lib/api';
import { cn } from '@/lib/utils';

interface VINReportViewProps {
  report: VINReport;
}

export function VINReportView({ report }: VINReportViewProps) {
  const riskLevel = report.score >= 80 ? 'low' : report.score >= 50 ? 'medium' : 'high';
  
  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className={cn(
        "p-4 rounded-lg",
        riskLevel === 'low' ? "bg-green-50 text-green-900" :
        riskLevel === 'medium' ? "bg-yellow-50 text-yellow-900" : "bg-red-50 text-red-900"
      )}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Etibarlılıq skoru</span>
          <span className="text-2xl font-bold">{report.score}/100</span>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Car className="w-4 h-4" /> Nəqliyyat vasitəsi məlumatları
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-muted-foreground">VIN:</div>
          <div className="font-mono">{report.vin}</div>
          <div className="text-muted-foreground">Marka/Model:</div>
          <div>{report.vehicleInfo.brand} {report.vehicleInfo.model}</div>
          <div className="text-muted-foreground">İl:</div>
          <div>{report.vehicleInfo.year}</div>
        </div>
      </div>

      {report.history.mileageRecords.length > 0 && (
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Kilometraj tarixi
          </h3>
          <div className="space-y-2">
            {report.history.mileageRecords.map((record, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{record.date}</span>
                <span>{record.mileage.toLocaleString()} km</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4" /> Risklər xülasəsi
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Speedometr dönməsi</span>
            {report.risks.mileageFraud ? <XCircle className="w-4 h-4 text-red-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
          </div>
          <div className="flex justify-between">
            <span>Qəza zədəsi</span>
            {report.risks.accidentDamage ? <XCircle className="w-4 h-4 text-red-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
          </div>
        </div>
      </div>
    </div>
  );
}
