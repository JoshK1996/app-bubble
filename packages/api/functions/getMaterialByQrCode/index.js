// Lambda function to fetch materials by QR code data
const AWS = require('aws-sdk');

// Initialize DynamoDB DocumentClient
const documentClient = new AWS.DynamoDB.DocumentClient();

// Constants for table names
const MATERIAL_TABLE = process.env.MATERIAL_TABLE;

/**
 * Retrieves materials by QR code data
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    // Extract variables from the event
    const { qrCodeData, limit = 20, nextToken } = event.arguments;

    if (!qrCodeData) {
      return formatErrorResponse('QR code data is required');
    }

    // Prepare the query parameters
    const queryParams = {
      TableName: MATERIAL_TABLE,
      IndexName: 'qrCodeData-index', // Using GSI for efficient queries by QR code
      KeyConditionExpression: 'qrCodeData = :qrCodeData',
      ExpressionAttributeValues: {
        ':qrCodeData': qrCodeData
      },
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
    console.error('Error fetching material by QR code:', error);
    return formatErrorResponse('Error fetching material by QR code: ' + error.message);
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