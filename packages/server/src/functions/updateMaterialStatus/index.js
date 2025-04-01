const { Client } = require('pg');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const { v4: uuidv4 } = require('uuid');

/**
 * Lambda function for updating a material's status and creating an audit history record
 * @param {Object} event - AppSync event
 * @returns {Object} Updated material object
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  // Extract variables from the event
  const { materialId, status, notes } = event.arguments;
  
  // Get current user information from the event context
  const userId = event.identity.username || event.identity.sub;
  const userGroups = event.identity.claims['cognito:groups'] || [];
  
  // Initialize database connection
  const dbClient = await getDbClient();
  
  try {
    // Start a transaction
    await dbClient.query('BEGIN');
    
    // Get the current material from the database
    const { rows: materialRows } = await dbClient.query(
      `SELECT * FROM materials WHERE id = $1`,
      [materialId]
    );
    
    if (materialRows.length === 0) {
      throw new Error(`Material with ID ${materialId} not found`);
    }
    
    const material = materialRows[0];
    const oldStatus = material.status;
    
    // Role-based validation - example (can be enhanced with more complex rules)
    if (status === 'INSTALLED' && !userGroups.includes('FieldInstaller') && !userGroups.includes('Admin')) {
      throw new Error('Unauthorized: Only Field Installers or Admins can mark items as Installed');
    }
    
    // Update the material status
    const { rows: updatedRows } = await dbClient.query(
      `UPDATE materials 
       SET status = $1, last_updated_by = $2, updated_at = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [status, userId, materialId]
    );
    
    // Create a material history record
    const historyId = uuidv4();
    await dbClient.query(
      `INSERT INTO material_history
       (id, material_id, timestamp, user_id, action, field_name, old_value, new_value, notes)
       VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, $8)`,
      [
        historyId,
        materialId,
        userId,
        'UPDATE_STATUS',
        'status',
        oldStatus,
        status,
        notes || null
      ]
    );
    
    // Commit the transaction
    await dbClient.query('COMMIT');
    
    // Return the updated material in the format expected by GraphQL
    const updatedMaterial = mapDbRowToGraphQL(updatedRows[0]);
    
    return updatedMaterial;
  } catch (error) {
    // Rollback in case of error
    await dbClient.query('ROLLBACK');
    console.error('Error updating material status:', error);
    throw error;
  } finally {
    // Close the database connection
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

/**
 * Helper function to map database row to GraphQL structure
 * @param {Object} dbRow - Database row
 * @returns {Object} GraphQL-formatted object
 */
function mapDbRowToGraphQL(dbRow) {
  return {
    id: dbRow.id,
    jobId: dbRow.job_id,
    materialIdentifier: dbRow.material_identifier,
    description: dbRow.description,
    materialType: dbRow.material_type,
    systemType: dbRow.system_type,
    locationLevel: dbRow.location_level,
    locationZone: dbRow.location_zone,
    status: dbRow.status,
    qrCodeData: dbRow.qr_code_data,
    quantityEstimated: dbRow.quantity_estimated,
    unitOfMeasure: dbRow.unit_of_measure,
    detailDrawingId: dbRow.detail_drawing_id,
    createdBy: dbRow.created_by,
    lastUpdatedBy: dbRow.last_updated_by,
    createdAt: dbRow.created_at.toISOString(),
    updatedAt: dbRow.updated_at.toISOString(),
    cognitoGroups: [] // This would be populated differently in AppSync
  };
} 