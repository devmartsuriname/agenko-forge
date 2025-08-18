import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updateHomepageAboutImage } from '@/lib/update-homepage-image';
import { adminToast } from '@/lib/toast-utils';

export function UpdateHomepageImage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasUpdated, setHasUpdated] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const success = await updateHomepageAboutImage();
      if (success) {
        adminToast.success('Homepage about section updated with image!');
        setHasUpdated(true);
      } else {
        adminToast.error('Failed to update homepage image');
      }
    } catch (error) {
      console.error('Error:', error);
      adminToast.error('Error updating homepage image');
    }
    setIsUpdating(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Homepage About Image</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will add the Devmart image to the homepage about section.
          </p>
          <p className="text-xs text-muted-foreground">
            Image URL: https://devmart.sr/storage/pages/hyWFkWRVI3Ia5Xb6LvPmJihxyqUu8MvVPx9RlmFD.jpg
          </p>
          <Button 
            onClick={handleUpdate} 
            disabled={isUpdating || hasUpdated}
            variant={hasUpdated ? "outline" : "default"}
          >
            {isUpdating ? 'Updating...' : hasUpdated ? 'Updated ✓' : 'Update Homepage Image'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}