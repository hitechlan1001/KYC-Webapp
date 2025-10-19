import { put } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';

// Direct file upload to Vercel Blob (bypasses 4.5MB limit)
export const uploadToBlob = async (file, filename) => {
  try {
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: true
    });
    
    return {
      success: true,
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname
    };
  } catch (error) {
    console.error('Blob upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate signed URL for direct upload from frontend
export const generateUploadUrl = async (filename) => {
  try {
    const { url, pathname } = await put(filename, null, {
      access: 'public',
      addRandomSuffix: true
    });
    
    return {
      success: true,
      uploadUrl: url,
      pathname: pathname
    };
  } catch (error) {
    console.error('Generate upload URL error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
