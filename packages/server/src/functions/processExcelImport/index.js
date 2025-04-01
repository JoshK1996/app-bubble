const { Client } = require('pg');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const { v4: uuidv4 } = require('uuid');
const xlsx = require('xlsx');

/**
 * Lambda function for processing Excel file imports and creating material records
 * @param {Object} event - AppSync event
 * @returns {String} Status message with import results
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  // Extract variables from the event
  const { jobId, fileKey } = event.arguments;
  
  // Get current user information
  const userId = event.identity.username || event.identity.sub;
  
  // Initialize clients
  const s3Client = new S3Client({ region: process.env.AWS_REGION });
  const dbClient = await getDbClient();
  
  try {
    // Verify the job exists
    const { rows: jobRows } = await dbClient.query(
      'SELECT * FROM jobs WHERE id = $1',
      [jobId]
    );
    
    if (jobRows.length === 0) {
      throw new Error(`Job with ID ${jobId} not found`);
    }
    
    // Get the Excel file from S3
    const s3Response = await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileKey
      })
    );
    
    // Read the file content and convert to array buffer
    const streamToBuffer = (stream) => new Promise((resolve, reject) => {
      const chunks = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("error", reject);
      stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
    
    const fileData = await streamToBuffer(s3Response.Body);
    
    // Parse the Excel file
    const workbook = xlsx.read(fileData, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);
    
    // Start database transaction
    await dbClient.query('BEGIN');
    
    // Process each row
    const results = {
      total: rows.length,
      successful: 0,
      failed: 0,
      errors: []
    };
    
    for (const row of rows) {
      try {
        // Basic validation
        if (!row.description) {
          throw new Error('Description is required');
        }
        
        // Standardize and validate the material type
        const materialType = (row.materialType || 'OTHER').toUpperCase();
        if (!['PIPE', 'VALVE', 'FITTING', 'EQUIPMENT', 'SPOOL', 'DUCT', 'OTHER'].includes(materialType)) {
          throw new Error(`Invalid material type: ${materialType}`);
        }
        
        // Standardize and validate the system type
        const systemType = (row.systemType || 'OTHER').toUpperCase();
        if (!['CHW', 'HHW', 'COND', 'DUCT_EXHAUST', 'DRAIN', 'OTHER'].includes(systemType)) {
          throw new Error(`Invalid system type: ${systemType}`);
        }
        
        // Generate a unique QR code data for this material
        const qrCodeData = `MAT-${uuidv4()}`;
        
        // Create the material record
        const materialId = uuidv4();
        await dbClient.query(
          `INSERT INTO materials (
            id, job_id, material_identifier, description, material_type, system_type,
            location_level, location_zone, status, qr_code_data, quantity_estimated,
            unit_of_measure, created_by, last_updated_by, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
          )`,
          [
            materialId,
            jobId,
            row.materialIdentifier || null,
            row.description,
            materialType,
            systemType,
            row.locationLevel || null,
            row.locationZone || null,
            'ESTIMATED', // Initial status
            qrCodeData,
            parseFloat(row.quantityEstimated) || 1,
            row.unitOfMeasure || 'EA',
            userId,
            userId
          ]
        );
        
        // Create history record for the creation
        const historyId = uuidv4();
        await dbClient.query(
          `INSERT INTO material_history (
            id, material_id, timestamp, user_id, action, notes
          ) VALUES ($1, $2, NOW(), $3, $4, $5)`,
          [
            historyId,
            materialId,
            userId,
            'IMPORT',
            `Imported from Excel: ${fileKey}`
          ]
        );
        
        results.successful++;
      } catch (error) {
        console.error('Error processing row:', error, row);
        results.failed++;
        results.errors.push({
          row: JSON.stringify(row),
          error: error.message
        });
        // Continue with the next row
      }
    }
    
    // Commit transaction
    await dbClient.query('COMMIT');
    
    return `Import completed. Successfully imported ${results.successful} materials, ${results.failed} failed.`;
  } catch (error) {
    // Rollback in case of error
    await dbClient.query('ROLLBACK');
    console.error('Error processing Excel import:', error);
    throw error;
  } finally {
    // Close database connection
    await dbClient.end();
  }
};

/**
 * Helper function to get a database client
 * @returns {Client} PostgreSQL client
 */
async function getDbClient() {
  let dbConfig;
  
  // In production, get credentials from Secrets Manager
  if (process.env.NODE_ENV === 'production') {
    const secretsManager = new SecretsManagerClient({ region: process.env.AWS_REGION });
    const { SecretString } = await secretsManager.send(
      new GetSecretValueCommand({ SecretId: process.env.DB_SECRET_NAME })
    );
    
    const secret = JSON.parse(SecretString);
    dbConfig = {
      host: secret.host,
      port: secret.port,
      database: secret.dbname,
      user: secret.username,
      password: secret.password,
      ssl: {
        rejectUnauthorized: false
      }
    };
  } else {
    // For local development, use environment variables
    dbConfig = {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    };
  }
  
  const client = new Client(dbConfig);
  await client.connect();
  return client;
} 