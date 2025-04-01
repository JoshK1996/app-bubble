/* eslint-disable */
// This file is auto-generated - do not edit directly

export const getJob = /* GraphQL */ `
  query GetJob($id: ID!) {
    getJob(id: $id) {
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

export const listJobs = /* GraphQL */ `
  query ListJobs(
    $filter: ModelJobFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listJobs(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        jobNumber
        jobName
        clientName
        status
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const jobsByJobNumber = /* GraphQL */ `
  query JobsByJobNumber(
    $jobNumber: String!
    $sortDirection: ModelSortDirection
    $filter: ModelJobFilterInput
    $limit: Int
    $nextToken: String
  ) {
    jobsByJobNumber(
      jobNumber: $jobNumber
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        jobNumber
        jobName
        clientName
        status
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const getMaterial = /* GraphQL */ `
  query GetMaterial($id: ID!) {
    getMaterial(id: $id) {
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

export const listMaterials = /* GraphQL */ `
  query ListMaterials(
    $filter: ModelMaterialFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMaterials(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      }
      nextToken
    }
  }
`;

export const materialsByStatus = /* GraphQL */ `
  query MaterialsByStatus(
    $status: MaterialStatus!
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMaterialFilterInput
    $limit: Int
    $nextToken: String
  ) {
    materialsByStatus(
      status: $status
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      }
      nextToken
    }
  }
`;

export const materialByQrCode = /* GraphQL */ `
  query MaterialByQrCode(
    $qrCodeData: String!
    $id: ModelIDKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMaterialFilterInput
    $limit: Int
    $nextToken: String
  ) {
    materialByQrCode(
      qrCodeData: $qrCodeData
      id: $id
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
    }
  }
`;

export const materialsByJob = /* GraphQL */ `
  query MaterialsByJob(
    $jobId: ID!
    $materialIdentifier: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMaterialFilterInput
    $limit: Int
    $nextToken: String
  ) {
    materialsByJob(
      jobId: $jobId
      materialIdentifier: $materialIdentifier
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      }
      nextToken
    }
  }
`;

export const getMaterialHistory = /* GraphQL */ `
  query GetMaterialHistory($id: ID!) {
    getMaterialHistory(id: $id) {
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

export const listMaterialHistories = /* GraphQL */ `
  query ListMaterialHistories(
    $filter: ModelMaterialHistoryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMaterialHistories(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
    }
  }
`;

export const materialHistoryByMaterial = /* GraphQL */ `
  query MaterialHistoryByMaterial(
    $materialId: ID!
    $timestamp: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMaterialHistoryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    materialHistoryByMaterial(
      materialId: $materialId
      timestamp: $timestamp
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
    }
  }
`;

// Admin Queries
export const listUsers = /* GraphQL */ `
  query ListUsers {
    listUsers {
      items {
        id
        username
        email
        groups
        status
        createdAt
        updatedAt
      }
    }
  }
`; 