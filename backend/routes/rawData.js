const express = require('express');
const { Dropbox } = require('dropbox');
const fetch = require('isomorphic-fetch');
const router = express.Router();
require('dotenv').config();

// Initialize Dropbox client
const dbx = new Dropbox({
    clientId: process.env.DROPBOX_APP_KEY,
    clientSecret: process.env.DROPBOX_APP_SECRET,
    refreshToken: process.env.DROPBOX_REFRESH_TOKEN,
    fetch: fetch,
});

// Get access token
async function getAccessToken() {
    try {
        const authResponse = await dbx.checkAndRefreshAccessToken();
        return authResponse.access_token;
    } catch (error) {
        console.error('Error getting access token:', error);
        throw new Error('Failed to get Dropbox access token');
    }
}

// List available raw data files with filtering
router.get('/files', async (req, res) => {
    try {
        const { userRole, clubId, regionId, startDate, endDate } = req.query;
        
        console.log('📋 Raw data request:', { userRole, clubId, regionId, startDate, endDate });
        
        const accessToken = await getAccessToken();
        const dbxWithToken = new Dropbox({ accessToken, fetch });
        
        // List files from Dropbox
        const response = await dbxWithToken.filesListFolder({ 
            path: process.env.DROPBOX_RAW_FILES_DIR || '/Universal/Raw Data' 
        });
        
        let files = response.result.entries.filter(entry => entry['.tag'] === 'file');
        
        // Filter files based on user role and permissions
        if (userRole === 'club_owner' && clubId) {
            // Club owners can only see files for their specific club
            files = files.filter(file => file.name.includes(`_${clubId}_`));
        } else if (userRole === 'region_head' && regionId) {
            // Region heads can see files for clubs in their region
            // This would need to be mapped based on your club-region relationship
            // For now, showing all files (you can implement region-specific filtering)
            files = files; // TODO: Implement region-based filtering
        }
        
        // Filter by date range if provided
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            files = files.filter(file => {
                const fileDate = new Date(file.client_modified);
                return fileDate >= start && fileDate <= end;
            });
        }
        
        // Format response
        const formattedFiles = files.map(file => ({
            id: file.id,
            name: file.name,
            size: file.size,
            modified: file.client_modified,
            path: file.path_display,
            // Extract club ID from filename (assuming format: clubId_date.xlsx)
            clubId: file.name.split('_')[0],
            date: file.name.split('_')[1]?.replace('.xlsx', '') || null
        }));
        
        res.json({
            success: true,
            files: formattedFiles,
            total: formattedFiles.length
        });
        
    } catch (error) {
        console.error('Error listing raw data files:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to list raw data files',
            details: error.message
        });
    }
});

// Download specific raw data file
router.get('/download/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        const { userRole, clubId, regionId } = req.query;
        
        console.log('📥 Download request:', { fileId, userRole, clubId, regionId });
        
        const accessToken = await getAccessToken();
        const dbxWithToken = new Dropbox({ accessToken, fetch });
        
        // Get file metadata first
        const fileInfo = await dbxWithToken.filesGetMetadata({ path: fileId });
        
        // Check permissions based on user role
        if (userRole === 'club_owner' && clubId) {
            // Verify the file belongs to this club
            if (!fileInfo.name.includes(`_${clubId}_`)) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied: You can only download files for your club'
                });
            }
        }
        // Add similar check for region_head if needed
        
        // Download file content
        const downloadResponse = await dbxWithToken.filesDownload({ path: fileId });
        
        // Set response headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.name}"`);
        res.setHeader('Content-Length', downloadResponse.result.size);
        
        // Send file content
        res.send(downloadResponse.result.fileBinary);
        
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to download file',
            details: error.message
        });
    }
});

// Get file info for a specific file
router.get('/file/:fileId/info', async (req, res) => {
    try {
        const { fileId } = req.params;
        
        const accessToken = await getAccessToken();
        const dbxWithToken = new Dropbox({ accessToken, fetch });
        
        const fileInfo = await dbxWithToken.filesGetMetadata({ path: fileId });
        
        res.json({
            success: true,
            file: {
                id: fileInfo.id,
                name: fileInfo.name,
                size: fileInfo.size,
                modified: fileInfo.client_modified,
                path: fileInfo.path_display,
                clubId: fileInfo.name.split('_')[0],
                date: fileInfo.name.split('_')[1]?.replace('.xlsx', '') || null
            }
        });
        
    } catch (error) {
        console.error('Error getting file info:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get file info',
            details: error.message
        });
    }
});

module.exports = router;
