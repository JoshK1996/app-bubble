// Lambda function to process Excel imports and create/update materials
const AWS = require('aws-sdk');
const XLSX = require('xlsx');
const { v4: uuidv4 } = require('uuid');

// Initialize AWS services
const s3 = new AWS.S3();
const documentClient = new AWS.DynamoDB.DocumentClient();
const eventBridge = new AWS.EventBridge();

// Constants
const MATERIAL_TABLE = process.env.MATERIAL_TABLE;
const HISTORY_TABLE = process.env.HISTORY_TABLE;
const S3_BUCKET = process.env.IMPORT_BUCKET;
const EVENT_BUS = process.env.EVENT_BUS_NAME || 'default';

// Required columns in the Excel file
const REQUIRED_COLUMNS = [
  'materialIdentifier',
  'description',
  'materialType',
  'systemType',
  'quantityEstimated',
  'unitOfMeasure'
];

// Optional columns
const OPTIONAL_COLUMNS = [
  'locationLevel',
  'locationZone',
  'detailDrawingId',
  'costEstimated'
];

/**
 * Processes an Excel file import to create or update materials
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    // Extract variables from the event
    const { jobId, fileKey, username } = event.arguments;

    if (!jobId || !fileKey) {
      return formatErrorResponse('Job ID and file key are required');
    }

    // Get the job to ensure it exists
    const job = await getJob(jobId);
    if (!job) {
      return formatErrorResponse(`Job with ID ${jobId} not found`);
    }

    // Download the Excel file from S3
    const fileData = await s3.getObject({
      Bucket: S3_BUCKET,
      Key: fileKey
    }).promise();

    // Parse the Excel file
    const workbook = XLSX.read(fileData.Body);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: null });

    if (rows.length === 0) {
      return formatErrorResponse('The Excel file does not contain any data');
    }

    // Validate required columns
    const headers = Object.keys(rows[0]);
    const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));

    if (missingColumns.length > 0) {
      return formatErrorResponse(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Process each row
    const timestamp = new Date().toISOString();
    const results = {
      materialsCreated: 0,
      materialsUpdated: 0,
      errors: []
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        // Check if material already exists by materialIdentifier and jobId
        const existingMaterials = await documentClient.query({
          TableName: MATERIAL_TABLE,
          IndexName: 'jobId-materialIdentifier-index',
          KeyConditionExpression: 'jobId = :jobId AND materialIdentifier = :materialIdentifier',
          ExpressionAttributeValues: {
            ':jobId': jobId,
            ':materialIdentifier': row.materialIdentifier
          }
        }).promise();

        const existingMaterial = existingMaterials.Items && existingMaterials.Items.length > 0 
          ? existingMaterials.Items[0] 
          : null;

        // Generate a new QR code if we're creating a new material
        let qrCodeData = existingMaterial?.qrCodeData;
        if (!qrCodeData) {
          qrCodeData = generateQRCode(jobId, row.materialIdentifier);
        }

        // Prepare material data
        const materialData = {
          materialIdentifier: row.materialIdentifier,
          description: row.description,
          materialType: row.materialType,
          systemType: row.systemType,
          jobId: jobId,
          status: existingMaterial?.status || 'ESTIMATED',
          qrCodeData: qrCodeData,
          quantityEstimated: parseFloat(row.quantityEstimated) || 0,
          unitOfMeasure: row.unitOfMeasure || '',
          updatedAt: timestamp
        };

        // Add optional fields if present
        OPTIONAL_COLUMNS.forEach(col => {
          if (row[col] !== null && row[col] !== undefined) {
            materialData[col] = row[col];
          }
        });

        // Either update or create the material
        if (existingMaterial) {
          // Update existing material
          await updateMaterial(existingMaterial.id, materialData, username);
          results.materialsUpdated++;
        } else {
          // Create new material
          materialData.id = uuidv4();
          materialData.createdAt = timestamp;
          materialData.createdBy = username;
          
          await createMaterial(materialData);
          results.materialsCreated++;

          // Create a history record for the creation
          await createHistoryRecord({
            id: uuidv4(),
            materialId: materialData.id,
            timestamp: timestamp,
            action: 'CREATE',
            userId: username,
            notes: `Created via Excel import for job ${job.jobNumber} - ${job.jobName}`
          });
        }

        // Emit an event for real-time updates
        await emitMaterialEvent(materialData.id, jobId);

      } catch (err) {
        console.error(`Error processing row ${i + 1}:`, err);
        results.errors.push(`Row ${i + 1} (${row.materialIdentifier}): ${err.message}`);
      }
    }

    // Return the results
    return {
      jobId,
      fileKey,
      status: 'COMPLETE',
      ...results
    };
  } catch (error) {
    console.error('Error processing Excel import:', error);
    return formatErrorResponse('Error processing Excel import: ' + error.message);
  }
};

/**
 * Helper function to get a job by ID
 */
async function getJob(jobId) {
  const params = {
    TableName: process.env.JOB_TABLE,
    Key: { id: jobId }
  };

  const result = await documentClient.get(params).promise();
  return result.Item;
}

/**
 * Helper function to create a new material
 */
async function createMaterial(materialData) {
  await documentClient.put({
    TableName: MATERIAL_TABLE,
    Item: materialData
  }).promise();
}

/**
 * Helper function to update an existing material
 */
async function updateMaterial(materialId, materialData, username) {
  // Get the current state for history tracking
  const current = await documentClient.get({
    TableName: MATERIAL_TABLE,
    Key: { id: materialId }
  }).promise();

  const currentMaterial = current.Item;
  
  // Track changes for history
  const changes = [];
  Object.keys(materialData).forEach(key => {
    if (currentMaterial[key] !== materialData[key] && 
        key !== 'updatedAt' && 
        key !== 'qrCodeData' &&
        materialData[key] !== undefined) {
      changes.push({
        fieldName: key,
        oldValue: String(currentMaterial[key] || ''),
        newValue: String(materialData[key])
      });
    }
  });

  // Update the material
  const updateExpression = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  Object.keys(materialData).forEach(key => {
    if (key !== 'id') {
      updateExpression.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = materialData[key];
    }
  });

  // Add lastUpdatedBy
  updateExpression.push('#lastUpdatedBy = :lastUpdatedBy');
  expressionAttributeNames['#lastUpdatedBy'] = 'lastUpdatedBy';
  expressionAttributeValues[':lastUpdatedBy'] = username;

  await documentClient.update({
    TableName: MATERIAL_TABLE,
    Key: { id: materialId },
    UpdateExpression: 'set ' + updateExpression.join(', '),
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues
  }).promise();

  // Create history records for each changed field
  for (const change of changes) {
    await createHistoryRecord({
      id: uuidv4(),
      materialId: materialId,
      timestamp: materialData.updatedAt,
      action: 'UPDATE',
      fieldName: change.fieldName,
      oldValue: change.oldValue,
      newValue: change.newValue,
      userId: username,
      notes: 'Updated via Excel import'
    });
  }
}

/**
 * Helper function to create a history record
 */
async function createHistoryRecord(historyData) {
  await documentClient.put({
    TableName: HISTORY_TABLE,
    Item: historyData
  }).promise();
}

/**
 * Helper function to generate a QR code
 */
function generateQRCode(jobId, materialIdentifier) {
  // Generate a unique string that can be used as QR code data
  return `${jobId}:${materialIdentifier}:${Date.now()}`;
}

/**
 * Helper function to emit an event for real-time updates
 */
async function emitMaterialEvent(materialId, jobId) {
  await eventBridge.putEvents({
    Entries: [
      {
        Source: 'construction-tracker.materials',
        DetailType: 'MaterialImported',
        Detail: JSON.stringify({
          materialId,
          jobId
        }),
        EventBusName: EVENT_BUS
      }
    ]
  }).promise();
}

/**
 * Helper function to format error responses
 */
function formatErrorResponse(message) {
  const error = new Error(message);
  error.name = 'UserInputError';
  throw error;
} 