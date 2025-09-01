import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export function PWAInstallPrompt() {
  const { canInstall, installApp, isInstalled } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isInstalled || !canInstall || isDismissed) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (!success) {
      setIsDismissed(true);
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 z-50 max-w-sm bg-background border shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm">Install Devmart</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Get quick access to Devmart with our mobile app experience.
        </p>
        <div className="flex gap-2">
          <Button onClick={handleInstall} size="sm" className="flex-1">
            Install
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsDismissed(true)}
          >
            Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}