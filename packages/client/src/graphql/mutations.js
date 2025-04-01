/* eslint-disable */
// This file is auto-generated - do not edit directly

export const createJob = /* GraphQL */ `
  mutation CreateJob(
    $input: CreateJobInput!
    $condition: ModelJobConditionInput
  ) {
    createJob(input: $input, condition: $condition) {
      id
      jobNumber
      jobName
      clientName
      status
      createdAt
      updatedAt
    }
  }
`;

export const updateJob = /* GraphQL */ `
  mutation UpdateJob(
    $input: UpdateJobInput!
    $condition: ModelJobConditionInput
  ) {
    updateJob(input: $input, condition: $condition) {
      id
      jobNumber
      jobName
      clientName
      status
      createdAt
      updatedAt
    }
  }
`;

export const deleteJob = /* GraphQL */ `
  mutation DeleteJob(
    $input: DeleteJobInput!
    $condition: ModelJobConditionInput
  ) {
    deleteJob(input: $input, condition: $condition) {
      id
      jobNumber
      jobName
      clientName
      status
      createdAt
      updatedAt
    }
  }
`;

export const createMaterial = /* GraphQL */ `
  mutation CreateMaterial(
    $input: CreateMaterialInput!
    $condition: ModelMaterialConditionInput
  ) {
    createMaterial(input: $input, condition: $condition) {
      id
      jobId
      materialIdentifier
      description
      materialType
      systemType
      locationLevel
      locationZone
      status
      qrCodeData
      quantityEstimated
      unitOfMeasure
      detailDrawingId
      createdBy
      lastUpdatedBy
      createdAt
      updatedAt
      job {
        id
        jobNumber
        jobName
        clientName
        status
      }
    }
  }
`;

export const updateMaterial = /* GraphQL */ `
  mutation UpdateMaterial(
    $input: UpdateMaterialInput!
    $condition: ModelMaterialConditionInput
  ) {
    updateMaterial(input: $input, condition: $condition) {
      id
      jobId
      materialIdentifier
      description
      materialType
      systemType
      locationLevel
      locationZone
      status
      qrCodeData
      quantityEstimated
      unitOfMeasure
      detailDrawingId
      createdBy
      lastUpdatedBy
      createdAt
      updatedAt
    }
  }
`;

export const deleteMaterial = /* GraphQL */ `
  mutation DeleteMaterial(
    $input: DeleteMaterialInput!
    $condition: ModelMaterialConditionInput
  ) {
    deleteMaterial(input: $input, condition: $condition) {
      id
      jobId
      materialIdentifier
      description
      materialType
      systemType
      locationLevel
      locationZone
      status
      createdAt
      updatedAt
    }
  }
`;

export const createMaterialHistory = /* GraphQL */ `
  mutation CreateMaterialHistory(
    $input: CreateMaterialHistoryInput!
    $condition: ModelMaterialHistoryConditionInput
  ) {
    createMaterialHistory(input: $input, condition: $condition) {
      id
      materialId
      timestamp
      userId
      action
      fieldName
      oldValue
      newValue
      notes
      location
      createdAt
      updatedAt
    }
  }
`;

export const updateMaterialHistory = /* GraphQL */ `
  mutation UpdateMaterialHistory(
    $input: UpdateMaterialHistoryInput!
    $condition: ModelMaterialHistoryConditionInput
  ) {
    updateMaterialHistory(input: $input, condition: $condition) {
      id
      materialId
      timestamp
      userId
      action
      fieldName
      oldValue
      newValue
      notes
      location
      createdAt
      updatedAt
    }
  }
`;

export const deleteMaterialHistory = /* GraphQL */ `
  mutation DeleteMaterialHistory(
    $input: DeleteMaterialHistoryInput!
    $condition: ModelMaterialHistoryConditionInput
  ) {
    deleteMaterialHistory(input: $input, condition: $condition) {
      id
      materialId
      timestamp
      userId
      action
      fieldName
      oldValue
      newValue
      notes
      location
      createdAt
      updatedAt
    }
  }
`;

export const updateMaterialStatus = /* GraphQL */ `
  mutation UpdateMaterialStatus(
    $materialId: ID!
    $status: MaterialStatus!
    $notes: String
  ) {
    updateMaterialStatus(materialId: $materialId, status: $status, notes: $notes) {
      id
      jobId
      materialIdentifier
      description
      materialType
      systemType
      locationLevel
      locationZone
      status
      qrCodeData
      createdAt
      updatedAt
    }
  }
`;

export const processExcelImport = /* GraphQL */ `
  mutation ProcessExcelImport($jobId: ID!, $fileKey: String!) {
    processExcelImport(jobId: $jobId, fileKey: $fileKey)
  }
`; 