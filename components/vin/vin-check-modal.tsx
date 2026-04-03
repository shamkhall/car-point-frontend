'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Shield, CheckCircle } from 'lucide-react';
import { checkVIN, purchaseVINReport, type VINCheckResponse } from '@/lib/api';
import { VINReportView } from './vin-report';

interface VINCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  carInfo: { brand: string; model: string; year: number | null };
}

export function VINCheckModal({ isOpen, onClose, carInfo }: VINCheckModalProps) {
  const [vin, setVin] = useState('');
  const [checking, setChecking] = useState(false);
  const [vinData, setVinData] = useState<VINCheckResponse | null>(null);
  const [step, setStep] = useState<'input' | 'confirm' | 'payment' | 'result'>('input');

  const handleCheck = async () => {
    if (vin.length !== 17) return;
    setChecking(true);
    try {
      const data = await checkVIN({ vin: vin.toUpperCase() });
      setVinData(data);
      setStep(data.available ? 'confirm' : 'input');
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  const handlePurchase = async () => {
    setChecking(true);
    try {
      // Mock payment success
      const report = await purchaseVINReport(vin, "mock_token");
      setVinData({ ...vinData!, report });
      setStep('result');
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> VIN Yoxlama
          </DialogTitle>
        </DialogHeader>

        {step === 'input' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">VIN Nömrəsi (17 simvol)</label>
              <Input
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                placeholder="17 simvolluq VIN kodu"
                maxLength={17}
                className="font-mono"
              />
            </div>
            <Button onClick={handleCheck} disabled={vin.length !== 17 || checking} className="w-full">
              {checking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Yoxla'}
            </Button>
          </div>
        )}

        {step === 'confirm' && vinData && (
          <div className="space-y-4">
            <div className="bg-green-50 text-green-900 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Məlumat tapıldı!</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Hesabat qiyməti</p>
                <p className="text-2xl font-bold">{vinData.price} AZN</p>
              </div>
              <Button onClick={() => setStep('payment')}>Almaq</Button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">Ödəniş sistemi inteqrasiyası...</p>
            <Button onClick={handlePurchase} disabled={checking} className="w-full">
              {checking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : `${vinData?.price} AZN ödə (Test)`}
            </Button>
          </div>
        )}

        {step === 'result' && vinData?.report && (
          <VINReportView report={vinData.report} />
        )}
      </DialogContent>
    </Dialog>
  );
}