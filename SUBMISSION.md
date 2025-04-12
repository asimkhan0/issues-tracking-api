# Testlio Backend Coding Assignment - Implementation Documentation

## Overview

This document outlines the implementation of the Testlio backend coding assignment, which involved creating a REST API for managing issue entities. The implementation covers all the required tasks, from basic CRUD operations to more advanced features like revision tracking and authentication.

## Implementation Details

### Task 1: Issue Creation Endpoint

I implemented a POST endpoint at `/issues` that allows clients to create new issues. The implementation:

- Validates incoming requests using Joi schema validation
- Requires title and description fields
- Stores the author's email (from JWT token) in the `created_by` field
- Returns the newly created issue with appropriate HTTP status codes
- Handles errors gracefully with meaningful error messages

The endpoint is protected by authentication middleware, ensuring only authorized users can create issues.

### Task 2: Issue Listing Endpoint

I created a GET endpoint at `/issues` that retrieves all stored issues. The implementation:

- Returns a JSON array of all issues in the database
- Includes all issue properties (id, title, description, created_by, updated_by, timestamps)
- Is protected by authentication middleware
- Handles potential database errors with appropriate error responses

This endpoint provides a simple way to view all issues at once, which is essential for any issue management system.

### Task 3: Issue Modification Endpoint

I implemented a PUT endpoint at `/issues/:id` that allows updating existing issues. The implementation:

- Validates the request body using Joi schema validation
- Supports partial updates (only specified fields are updated)
- Updates the `updated_by` field with the current user's email
- Returns the updated issue with appropriate status codes
- Returns 404 if the issue doesn't exist
- Is protected by authentication middleware

The endpoint ensures data integrity by validating inputs and properly handling edge cases.

### Task 4: Issue Revisions

I implemented a revision tracking system that records changes to issues. The implementation:

- Creates a revision record whenever an issue is created or updated
- Stores the complete issue state at the time of the revision
- Records specific changes made in each revision (what fields changed, from what value to what value)
- Includes metadata like who made the change and when
- Provides a GET endpoint at `/issues/:id/revisions` to retrieve all revisions for a specific issue

The revision system provides a complete audit trail of all changes made to issues, which is crucial for accountability and troubleshooting.

### Task 5: Authentication

I implemented JWT-based authentication to secure the API. The implementation:

- Requires a valid JWT token for all endpoints (except discovery and health endpoints)
- Requires an X-Client-ID header in all requests
- Verifies token validity and expiration
- Extracts user information (email) from the token
- Stores the user's email in `created_by` and `updated_by` fields when changes are made
- Provides a token generation endpoint for testing purposes

The authentication system ensures that only authorized users can access and modify data in the system.

## Technical Decisions and Trade-offs

### Database Schema

The project utilizes the pre-implemented Sequelize ORM to interact with the MySQL database. The schema consists of two main tables:

1. **issues** - Stores the core issue data (title, description) along with metadata (created_by, updated_by, timestamps)
2. **revisions** - Stores the revision history for each issue, including the complete issue state and specific changes made

This schema design allows for efficient querying of both current issue data and historical changes.

### Error Handling

I implemented comprehensive error handling throughout the application to ensure robustness:

- Validation errors return 400 Bad Request with specific error messages
- Authentication errors return 401 Unauthorized with appropriate details
- Not found errors return 404 Not Found
- Server errors return 500 Internal Server Error with logging for debugging

This approach ensures that clients receive meaningful error messages that help diagnose and fix issues.

### Authentication Flow

The authentication flow uses industry-standard JWT tokens:

1. Client obtains a token via the `/generate-token` endpoint (in a production environment, this would be replaced with a proper login flow)
2. Client includes the token in the Authorization header (Bearer format) and the X-Client-ID in all subsequent requests
3. The auth middleware validates the token and extracts user information
4. Controllers use the extracted user information to track who made changes

This approach provides a secure and stateless authentication mechanism that scales well.

### Task 6: Comparing Different Versions

I made a simple way to see what changed between two versions of an issue. Here's how it works:

- You can send two version IDs to `/issues/:id/revisions/compare` to compare them
- The system checks if both versions exist and belong to the right issue
- It figures out which version came first
- You can compare versions from old-to-new or new-to-old
- You'll get back:
  - What the issue looked like in the older version
  - What it looks like in the newer version
  - A list of what changed
  - All the versions in between these two points
