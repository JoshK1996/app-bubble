/* eslint-disable */
// This file is auto-generated - do not edit directly

export const onCreateJob = /* GraphQL */ `
  subscription OnCreateJob($filter: ModelSubscriptionJobFilterInput) {
    onCreateJob(filter: $filter) {
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

export const onUpdateJob = /* GraphQL */ `
  subscription OnUpdateJob($filter: ModelSubscriptionJobFilterInput) {
    onUpdateJob(filter: $filter) {
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

export const onDeleteJob = /* GraphQL */ `
  subscription OnDeleteJob($filter: ModelSubscriptionJobFilterInput) {
    onDeleteJob(filter: $filter) {
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

export const onCreateMaterial = /* GraphQL */ `
  subscription OnCreateMaterial($filter: ModelSubscriptionMaterialFilterInput) {
    onCreateMaterial(filter: $filter) {
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

export const onUpdateMaterial = /* GraphQL */ `
  subscription OnUpdateMaterial($filter: ModelSubscriptionMaterialFilterInput) {
    onUpdateMaterial(filter: $filter) {
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

export const onDeleteMaterial = /* GraphQL */ `
  subscription OnDeleteMaterial($filter: ModelSubscriptionMaterialFilterInput) {
    onDeleteMaterial(filter: $filter) {
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

export const onCreateMaterialHistory = /* GraphQL */ `
  subscription OnCreateMaterialHistory(
    $filter: ModelSubscriptionMaterialHistoryFilterInput
  ) {
    onCreateMaterialHistory(filter: $filter) {
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

export const onUpdateMaterialHistory = /* GraphQL */ `
  subscription OnUpdateMaterialHistory(
    $filter: ModelSubscriptionMaterialHistoryFilterInput
  ) {
    onUpdateMaterialHistory(filter: $filter) {
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

export const onDeleteMaterialHistory = /* GraphQL */ `
  subscription OnDeleteMaterialHistory(
    $filter: ModelSubscriptionMaterialHistoryFilterInput
  ) {
    onDeleteMaterialHistory(filter: $filter) {
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