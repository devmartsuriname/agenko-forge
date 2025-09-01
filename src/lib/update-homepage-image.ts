import { supabase } from '@/integrations/supabase/client';

export async function updateHomepageAboutImage() {
  try {
    // Get all pages to find homepage
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .order('created_at', { ascending: false });

    if (pagesError) throw pagesError;

    // Find homepage
    const homepage = pages?.find(page => 
      page.slug === 'home' || 
      page.slug === 'homepage' || 
      page.slug === '' || 
      page.title?.toLowerCase().includes('home')
    );

    if (!homepage) {
      // Homepage not found - available pages: ${pages?.length || 0}
      throw new Error('Homepage not found');
    }

    // Found homepage: ${homepage.title}

    // Check if homepage has sections
    const pageBody = homepage.body as any;
    if (pageBody?.sections) {
      const sections = pageBody.sections;
      const aboutSectionIndex = sections.findIndex((section: any) => section.type === 'about');

      if (aboutSectionIndex !== -1) {
        // Update the about section with the image
        const updatedSections = [...sections];
        updatedSections[aboutSectionIndex] = {
          ...updatedSections[aboutSectionIndex],
          data: {
            ...updatedSections[aboutSectionIndex].data,
            image: 'https://devmart.sr/storage/pages/hyWFkWRVI3Ia5Xb6LvPmJihxyqUu8MvVPx9RlmFD.jpg'
          }
        };

        // Update the page
        const { error: updateError } = await supabase
          .from('pages')
          .update({ body: { sections: updatedSections } })
          .eq('id', homepage.id);

        if (updateError) throw updateError;

        // ✅ Successfully updated about section with image!
        return true;
      } else {
        throw new Error('About section not found in homepage');
      }
    } else {
      throw new Error('Homepage does not have sections structure');
    }
  } catch (error) {
    console.error('❌ Error updating homepage about image:', error);
    return false;
  }
}