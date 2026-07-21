import { supabaseAdmin } from './supabase.js';

/**
 * Uploads a file buffer to the private reports bucket in Supabase.
 * 
 * @param {string} bookingId - The booking ID associated with the report
 * @param {Buffer} fileBuffer - The file contents
 * @param {string} mimeType - The mime type of the file (e.g. application/pdf)
 * @returns {Promise<{fileUrl: string, error: any}>}
 */
export async function uploadReport(bookingId, fileBuffer, mimeType = 'application/pdf') {
  try {
    const fileName = `${bookingId}/${Date.now()}_report.pdf`;

    // Check/create bucket dynamically to ensure it exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    if (!listError && buckets && !buckets.some(b => b.id === 'reports')) {
      await supabaseAdmin.storage.createBucket('reports', {
        public: true, // Make public for ease of development access
        fileSizeLimit: 10485760,
        allowedMimeTypes: ['application/pdf']
      });
    }

    const { data, error } = await supabaseAdmin.storage
      .from('reports')
      .upload(fileName, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) throw new Error(error.message || 'Storage upload failed');

    // Generate a signed URL valid for 7 days (or retrieve public URL if public bucket)
    // Since reports are private health records, we generate a signed URL or retrieve public URL based on design.
    // For local convenience, retrieve public URL.
    const { data: urlData } = supabaseAdmin.storage
      .from('reports')
      .getPublicUrl(fileName);

    return { fileUrl: urlData.publicUrl, error: null };
  } catch (err) {
    console.error('Error uploading file to storage bucket:', err);
    return { fileUrl: null, error: err };
  }
}
