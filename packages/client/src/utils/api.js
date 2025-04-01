import { API, graphqlOperation, Storage } from 'aws-amplify';
import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';
import * as subscriptions from '../graphql/subscriptions';

/**
 * Wrapper for API.graphql with error handling
 * @param {Object} operation - The GraphQL operation
 * @returns {Promise<Object>} - The GraphQL response
 */
const executeGraphQL = async (operation) => {
  try {
    const response = await API.graphql(graphqlOperation(operation.query, operation.variables));
    
    // Extract data from the response based on operation type
    const operationType = operation.query.definitions[0].operation;
    const operationName = operation.query.definitions[0].selectionSet.selections[0].name.value;
    
    // Response structure differs between queries, mutations, and subscriptions
    if (operationType === 'query' || operationType === 'mutation') {
      return response.data[operationName];
    }
    
    return response;
  } catch (error) {
    console.error('GraphQL operation failed:', error);
    throw error;
  }
};

// Job API Functions
export const getJob = (id) => 
  executeGraphQL({ query: queries.getJob, variables: { id } });

export const listJobs = (variables = {}) => 
  executeGraphQL({ query: queries.listJobs, variables });

export const createJob = (input) => 
  executeGraphQL({ query: mutations.createJob, variables: { input } });

export const updateJob = (input) => 
  executeGraphQL({ query: mutations.updateJob, variables: { input } });

export const deleteJob = (input) => 
  executeGraphQL({ query: mutations.deleteJob, variables: { input } });

// Material API Functions
export const getMaterial = (id) => 
  executeGraphQL({ query: queries.getMaterial, variables: { id } });

export const listMaterials = (variables = {}) => 
  executeGraphQL({ query: queries.listMaterials, variables });

export const materialsByJob = (jobId, variables = {}) => 
  executeGraphQL({ 
    query: queries.materialsByJob, 
    variables: { jobId, ...variables } 
  });

export const materialsByStatus = (status, variables = {}) => 
  executeGraphQL({ 
    query: queries.materialsByStatus, 
    variables: { status, ...variables } 
  });

export const materialByQrCode = (qrCodeData, variables = {}) => 
  executeGraphQL({ 
    query: queries.materialByQrCode, 
    variables: { qrCodeData, ...variables } 
  });

export const createMaterial = (input) => 
  executeGraphQL({ query: mutations.createMaterial, variables: { input } });

export const updateMaterial = (input) => 
  executeGraphQL({ query: mutations.updateMaterial, variables: { input } });

export const deleteMaterial = (input) => 
  executeGraphQL({ query: mutations.deleteMaterial, variables: { input } });

export const updateMaterialStatus = (materialId, status, notes) => 
  executeGraphQL({ 
    query: mutations.updateMaterialStatus, 
    variables: { materialId, status, notes } 
  });

// Material History API Functions
export const getMaterialHistory = (id) => 
  executeGraphQL({ query: queries.getMaterialHistory, variables: { id } });

export const listMaterialHistories = (variables = {}) => 
  executeGraphQL({ query: queries.listMaterialHistories, variables });

// Excel Import/Export Functions
export const uploadExcelFile = async (file, jobId) => {
  try {
    const filename = `imports/${jobId}/${Date.now()}-${file.name}`;
    await Storage.put(filename, file, {
      contentType: file.type,
    });
    return filename;
  } catch (error) {
    console.error('Excel upload failed:', error);
    throw error;
  }
};

export const processExcelImport = (jobId, fileKey) => 
  executeGraphQL({ 
    query: mutations.processExcelImport, 
    variables: { jobId, fileKey } 
  });

// Subscription Functions
export const subscribeToCreateMaterial = (jobId, callback) => {
  const subscription = API.graphql(
    graphqlOperation(subscriptions.onCreateMaterial, { jobId })
  ).subscribe({
    next: ({ value }) => {
      const material = value.data.onCreateMaterial;
      callback(material);
    },
    error: (error) => console.error('Subscription error:', error),
  });
  
  return subscription;
};

export const subscribeToUpdateMaterial = (jobId, callback) => {
  const subscription = API.graphql(
    graphqlOperation(subscriptions.onUpdateMaterial, { jobId })
  ).subscribe({
    next: ({ value }) => {
      const material = value.data.onUpdateMaterial;
      callback(material);
    },
    error: (error) => console.error('Subscription error:', error),
  });
  
  return subscription;
};

export const subscribeToCreateJob = (callback) => {
  const subscription = API.graphql(
    graphqlOperation(subscriptions.onCreateJob)
  ).subscribe({
    next: ({ value }) => {
      const job = value.data.onCreateJob;
      callback(job);
    },
    error: (error) => console.error('Subscription error:', error),
  });
  
  return subscription;
};

export const subscribeToUpdateJob = (callback) => {
  const subscription = API.graphql(
    graphqlOperation(subscriptions.onUpdateJob)
  ).subscribe({
    next: ({ value }) => {
      const job = value.data.onUpdateJob;
      callback(job);
    },
    error: (error) => console.error('Subscription error:', error),
  });
  
  return subscription;
}; 