// Vercel Blob direct upload functionality
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8083';

export const uploadToBlob = async (file: File, filename: string) => {
  try {
    // Get upload URL from backend
    const response = await fetch(`${API_BASE_URL}/api/kyc/upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename }),
    });

    if (!response.ok) {
      throw new Error('Failed to get upload URL');
    }

    const { uploadUrl, pathname } = await response.json();

    // Upload directly to Vercel Blob
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file');
    }

    return {
      success: true,
      url: uploadResponse.url,
      pathname: pathname,
    };
  } catch (error) {
    console.error('Blob upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Alternative: Direct upload without backend (if you have BLOB_READ_WRITE_TOKEN)
export const uploadDirectToBlob = async (file: File, filename: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/kyc/upload`, {
      method: 'POST',
      body: file,
      headers: {
        'Content-Type': file.type,
        'X-Filename': filename,
      },
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Direct upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
