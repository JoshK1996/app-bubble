// Lambda function to fetch material history records
const AWS = require('aws-sdk');

// Initialize DynamoDB DocumentClient
const documentClient = new AWS.DynamoDB.DocumentClient();

// Constants for table names
const HISTORY_TABLE = process.env.HISTORY_TABLE;

/**
 * Retrieves history records for a specific material
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    // Extract variables from the event
    const { materialId, limit = 50, nextToken } = event.arguments;

    if (!materialId) {
      return formatErrorResponse('Material ID is required');
    }

    // Prepare the query parameters
    const queryParams = {
      TableName: HISTORY_TABLE,
      IndexName: 'materialId-timestamp-index', // Using GSI for efficient queries
      KeyConditionExpression: 'materialId = :materialId',
      ExpressionAttributeValues: {
        ':materialId': materialId
      },
      ScanIndexForward: false, // Sort by timestamp in descending order (newest first)
      Limit: limit
    };

    // Add next token if available
    if (nextToken) {
      queryParams.ExclusiveStartKey = JSON.parse(Buffer.from(nextToken, 'base64').toString());
    }

    // Execute the query
    const result = await documentClient.query(queryParams).promise();

    // Prepare the pagination token if there are more results
    let paginationToken = null;
    if (result.LastEvaluatedKey) {
      paginationToken = Buffer.from(
        JSON.stringify(result.LastEvaluatedKey)
      ).toString('base64');
    }

    // Return the results with pagination info
    return {
      items: result.Items,
      nextToken: paginationToken
    };
  } catch (error) {
    console.error('Error fetching material history:', error);
    return formatErrorResponse('Error fetching material history: ' + error.message);
  }
};

/**
 * Helper function to format error responses
 */
function formatErrorResponse(message) {
  const error = new Error(message);
  error.name = 'UserInputError';
  throw error;
} 