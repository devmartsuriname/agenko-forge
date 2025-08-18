import { adminCms } from '@/lib/admin-cms';

// Script to update the homepage about section with the provided image
async function updateHomepageAboutImage() {
  try {
    // Get all pages to find the homepage
    const pages = await adminCms.getAllPages();
    console.log('Found pages:', pages.map(p => ({ title: p.title, slug: p.slug })));
    
    // Find homepage (usually slug is 'home', 'homepage', or empty)
    const homepage = pages.find(page => 
      page.slug === 'home' || 
      page.slug === 'homepage' || 
      page.slug === '' || 
      page.title?.toLowerCase().includes('home')
    );
    
    if (!homepage) {
      console.error('Homepage not found');
      return;
    }
    
    console.log('Found homepage:', homepage);
    
    // Check if homepage has sections
    if (homepage.body?.sections) {
      // Find the about section
      const sections = homepage.body.sections;
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
        await adminCms.updatePage(homepage.id, {
          body: { sections: updatedSections }
        });
        
        console.log('Successfully updated about section with image!');
      } else {
        console.error('About section not found in homepage');
      }
    } else {
      console.error('Homepage does not have sections structure');
    }
  } catch (error) {
    console.error('Error updating homepage about image:', error);
  }
}

// Run the script
updateHomepageAboutImage();