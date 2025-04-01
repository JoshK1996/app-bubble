import { useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import { Box, Typography, Paper, Button, Stack } from '@mui/material';
import { Print as PrintIcon, Download as DownloadIcon } from '@mui/icons-material';

/**
 * Component for displaying and printing QR codes for materials
 * @param {Object} props
 * @param {string} props.data - QR code data to encode
 * @param {string} props.identifier - Material identifier to display
 * @param {string} props.description - Material description to display
 * @param {boolean} props.size - Size of QR code in pixels
 */
const MaterialQRCode = ({ data, identifier, description, size = 128 }) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const qrCodeRef = useRef(null);

  // Handle print button click
  const handlePrint = () => {
    setIsPrinting(true);
    
    // Create a new window and document for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code: ${identifier}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              text-align: center;
            }
            .qr-container {
              display: inline-block;
              padding: 15px;
              border: 1px solid #ccc;
              border-radius: 4px;
              margin: 20px auto;
              page-break-inside: avoid;
            }
            .identifier {
              font-size: 14px;
              font-weight: bold;
              margin-top: 10px;
            }
            .description {
              font-size: 12px;
              margin-top: 5px;
              max-width: 200px;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            @media print {
              @page {
                size: 3in 3in;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" style="background-color:white" viewBox="0 0 29 29">
              ${document.querySelector('#material-qr-code svg').innerHTML}
            </svg>
            <div class="identifier">${identifier}</div>
            <div class="description">${description}</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Reset print state after window is closed
    printWindow.onafterprint = () => {
      setIsPrinting(false);
    };
  };

  // Handle download button click - convert SVG to PNG and download
  const handleDownload = () => {
    if (!data || !qrCodeRef.current) return;
    
    setIsDownloading(true);
    
    try {
      const svgElement = qrCodeRef.current.querySelector('svg');
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // Set canvas size to match desired output size
      canvas.width = size * 2; // Higher resolution
      canvas.height = size * 2;
      
      img.onload = () => {
        // Fill with white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Add text if available
        if (identifier || description) {
          ctx.fillStyle = 'black';
          ctx.textAlign = 'center';
          
          if (identifier) {
            ctx.font = 'bold 24px Arial';
            ctx.fillText(identifier, canvas.width / 2, canvas.height - 40);
          }
          
          if (description) {
            ctx.font = '18px Arial';
            ctx.fillText(
              description.length > 25 ? description.substring(0, 25) + '...' : description, 
              canvas.width / 2, 
              canvas.height - 15
            );
          }
        }
        
        // Download the image
        const fileName = `qr-${identifier || 'material'}.png`;
        const link = document.createElement('a');
        link.download = fileName;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        setIsDownloading(false);
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (error) {
      console.error('Error generating QR code image:', error);
      setIsDownloading(false);
    }
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: size + 60,
        width: '100%'
      }}
    >
      <Box 
        id="material-qr-code"
        ref={qrCodeRef}
        sx={{ 
          p: 1, 
          backgroundColor: 'white',
          borderRadius: 1,
          width: size,
          height: size
        }}
      >
        <QRCode 
          value={data || 'No data'} 
          size={size - 10} 
          level="H" 
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </Box>
      
      {identifier && (
        <Typography variant="subtitle1" align="center" sx={{ mt: 1 }}>
          {identifier}
        </Typography>
      )}
      
      {description && (
        <Typography variant="body2" align="center" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
          {description}
        </Typography>
      )}
      
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Button 
          variant="outlined" 
          size="small"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          disabled={isPrinting || !data}
        >
          {isPrinting ? 'Printing...' : 'Print'}
        </Button>
        
        <Button 
          variant="outlined" 
          size="small"
          color="secondary"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          disabled={isDownloading || !data}
        >
          {isDownloading ? 'Processing...' : 'Download'}
        </Button>
      </Stack>
    </Paper>
  );
};

export default MaterialQRCode; 