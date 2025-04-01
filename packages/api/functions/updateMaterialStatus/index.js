// Lambda function to update material status and record history
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Initialize DynamoDB DocumentClient
const documentClient = new AWS.DynamoDB.DocumentClient();

// Constants for table names
const MATERIAL_TABLE = process.env.MATERIAL_TABLE;
const HISTORY_TABLE = process.env.HISTORY_TABLE;

/**
 * Updates the status of a material and creates a history record
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    // Extract variables from the event
    const { materialId, status, notes, username } = event.arguments;

    if (!materialId || !status) {
      return formatErrorResponse('Material ID and status are required');
    }

    // Get the current material record to compare changes
    const currentMaterial = await getMaterial(materialId);
    
    if (!currentMaterial) {
      return formatErrorResponse(`Material with ID ${materialId} not found`);
    }

    // Check if the status is a valid transition
    if (!isValidStatusTransition(currentMaterial.status, status)) {
      return formatErrorResponse(`Invalid status transition from ${currentMaterial.status} to ${status}`);
    }

    // Prepare the update parameters
    const timestamp = new Date().toISOString();
    const updateParams = {
      TableName: MATERIAL_TABLE,
      Key: { id: materialId },
      UpdateExpression: 'set #status = :status, lastUpdatedBy = :username, updatedAt = :timestamp',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':username': username || 'system',
        ':timestamp': timestamp
      },
      ReturnValues: 'ALL_NEW'
    };

    // Update the material status
    const updateResult = await documentClient.update(updateParams).promise();
    const updatedMaterial = updateResult.Attributes;

    // Create history record
    const historyItem = {
      id: uuidv4(),
      materialId: materialId,
      timestamp: timestamp,
      action: 'UPDATE_STATUS',
      fieldName: 'status',
      oldValue: currentMaterial.status,
      newValue: status,
      userId: username || 'system',
      notes: notes || null
    };

    // Save history record
    await documentClient.put({
      TableName: HISTORY_TABLE,
      Item: historyItem
    }).promise();

    // Return the updated material with the history item
    return {
      ...updatedMaterial,
      history: [historyItem]
    };
  } catch (error) {
    console.error('Error updating material status:', error);
    return formatErrorResponse('Error updating material status: ' + error.message);
  }
};

/**
 * Helper function to retrieve a material by ID
 */
async function getMaterial(materialId) {
  const params = {
    TableName: MATERIAL_TABLE,
    Key: { id: materialId }
  };

  const result = await documentClient.get(params).promise();
  return result.Item;
}

/**
 * Helper function to check if the status transition is valid
 */
function isValidStatusTransition(currentStatus, newStatus) {
  // Define the valid transitions from each status
  const validTransitions = {
    ESTIMATED: ['DETAILED'],
    DETAILED: ['RELEASED_TO_FAB'],
    RELEASED_TO_FAB: ['IN_FABRICATION'],
    IN_FABRICATION: ['FABRICATED', 'DAMAGED'],
    FABRICATED: ['SHIPPED_TO_FIELD', 'DAMAGED'],
    SHIPPED_TO_FIELD: ['RECEIVED_ON_SITE', 'DAMAGED', 'MISSING'],
    RECEIVED_ON_SITE: ['INSTALLED', 'DAMAGED', 'EXCESS'],
    INSTALLED: [],
    DAMAGED: ['RETURNED_TO_WAREHOUSE'],
    EXCESS: ['RETURNED_TO_WAREHOUSE'],
    RETURNED_TO_WAREHOUSE: [],
    MISSING: []
  };

  // If the current status doesn't have defined transitions, use a default empty array
  const transitions = validTransitions[currentStatus] || [];
  
  // Check if the new status is a valid transition
  return transitions.includes(newStatus);
}

/**
 * Helper function to format error responses
 */
function formatErrorResponse(message) {
  const error = new Error(message);
  error.name = 'UserInputError';
  throw error;
} 