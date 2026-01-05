# API Routes Documentation

All routes are prefixed with `/api/` and follow REST conventions.

## Base URL
```
http://localhost:3001/api
```

## Health Check
```
GET /api/health
```
Response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-22T14:30:00.000Z"
}
```

## Generic CRUD Operations

### List All Records
```
GET /api/:table?limit=100&offset=0
```
Parameters:
- `limit` - Number of records to return (default: 100)
- `offset` - Number of records to skip (default: 0)

Examples:
```
GET /api/employees
GET /api/users?limit=50&offset=0
GET /api/attendance?limit=200
```

### Get Single Record
```
GET /api/:table/:id
```
Example:
```
GET /api/employees/e-1
GET /api/users/u-admin
```

### Create Record
```
POST /api/:table
Content-Type: application/json

{
  "field1": "value1",
  "field2": "value2"
}
```

Example:
```bash
curl -X POST http://localhost:3001/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "id": "e-new",
    "name": "John Doe",
    "email": "john@company.com",
    "designation": "Developer",
    "branchId": "b-1"
  }'
```

### Update Record
```
PUT /api/:table/:id
Content-Type: application/json

{
  "field1": "new_value1"
}
```

Example:
```bash
curl -X PUT http://localhost:3001/api/employees/e-1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "designation": "Senior Developer"
  }'
```

### Delete Record
```
DELETE /api/:table/:id
```

Example:
```bash
curl -X DELETE http://localhost:3001/api/employees/e-1
```

## Available Tables

### User Management
- `users` - System users and access control
- `groups` - User groups
- `teams` - Team management

### Employee Management
- `employees` - Employee records
- `departments` - Department management
- `branches` - Office/branch locations

### Attendance & Time
- `attendance` - Daily attendance records
- `timesheets` - Time tracking
- `shifts` - Shift definitions
- `leaves` - Leave requests

### Operations & Assets
- `assets` - Company assets
- `tasks` - Task management

### Recruitment
- `jobs` - Job postings
- `candidates` - Job candidates

### Payroll & Finance
- `payroll` - Payroll records
- `reimbursements` - Expense reimbursements

### Company
- `system_config` - System configuration
- `policy_categories` - Policy categories
- `policies` - Company policies
- `holidays` - Holiday calendar
- `logs` - Activity logs

## Example Workflows

### Create Employee with User Account

1. Create Employee:
```bash
curl -X POST http://localhost:3001/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "id": "e-123",
    "name": "Alice Smith",
    "email": "alice@company.com",
    "phone": "555-0100",
    "designation": "Software Engineer",
    "department": "Engineering",
    "branchId": "b-1",
    "joinDate": "2025-12-22",
    "status": "Active",
    "salary": 85000
  }'
```

2. Create User Account:
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "id": "u-123",
    "name": "Alice Smith",
    "email": "alice@company.com",
    "role": "employee",
    "designation": "Software Engineer",
    "branchIds": ["b-1"],
    "linkedEmployeeId": "e-123",
    "accessModules": ["dashboard", "attendance", "payroll", "tasks"]
  }'
```

### Record Attendance

1. Clock In:
```bash
curl -X POST http://localhost:3001/api/timesheets \
  -H "Content-Type: application/json" \
  -d '{
    "id": "ts-123",
    "employeeId": "e-123",
    "employeeName": "Alice Smith",
    "date": "2025-12-22",
    "clockIn": "2025-12-22T09:00:00Z",
    "status": "Working"
  }'
```

2. Update Attendance:
```bash
curl -X POST http://localhost:3001/api/attendance \
  -H "Content-Type: application/json" \
  -d '{
    "id": "at-123",
    "employeeId": "e-123",
    "employeeName": "Alice Smith",
    "date": "2025-12-22",
    "checkIn": "09:00",
    "status": "Present"
  }'
```

3. Clock Out:
```bash
curl -X PUT http://localhost:3001/api/timesheets/ts-123 \
  -H "Content-Type: application/json" \
  -d '{
    "clockOut": "2025-12-22T17:30:00Z",
    "duration": 510,
    "status": "Completed"
  }'
```

### Search Records

```
GET /api/search?query=Alice&tables=employees,users,candidates
```

Response:
```json
{
  "employees": [
    {
      "id": "e-123",
      "name": "Alice Smith",
      "email": "alice@company.com",
      "designation": "Software Engineer"
    }
  ],
  "users": [
    {
      "id": "u-123",
      "name": "Alice Smith",
      "email": "alice@company.com",
      "role": "employee"
    }
  ],
  "candidates": []
}
```

## Response Format

### Success Response
```json
{
  "id": "record-id",
  "field1": "value1",
  "field2": "value2",
  "created_at": "2025-12-22T14:30:00Z",
  "updated_at": "2025-12-22T14:30:00Z"
}
```

### Error Response
```json
{
  "error": "Error message description"
}
```

## Status Codes
- `200` - OK (successful GET, PUT, DELETE)
- `201` - Created (successful POST)
- `400` - Bad Request
- `404` - Not Found
- `500` - Server Error

## Pagination

List endpoints support pagination:
```
GET /api/:table?limit=20&offset=0
```
- Returns first 20 records
- To get next page: `offset=20`
- To get page 3: `offset=40` (with limit=20)

## Batch Operations

To batch insert multiple records:
```bash
# Create multiple employees
for i in {1..5}; do
  curl -X POST http://localhost:3001/api/employees \
    -H "Content-Type: application/json" \
    -d "{
      \"id\": \"e-batch-$i\",
      \"name\": \"Employee $i\",
      \"email\": \"emp$i@company.com\",
      \"designation\": \"Staff\",
      \"branchId\": \"b-1\"
    }"
done
```

## Rate Limiting
Currently no rate limiting is implemented. Production deployment should add rate limiting middleware.

## Authentication
Currently using mock authentication. Production should implement proper JWT or session-based authentication.

## CORS
CORS is enabled for all origins in development. Restrict to specific domains in production.

## Testing with cURL

```bash
# Test health check
curl http://localhost:3001/api/health

# Get all employees
curl http://localhost:3001/api/employees

# Get specific employee
curl http://localhost:3001/api/employees/e-1

# Create new record
curl -X POST http://localhost:3001/api/employees \
  -H "Content-Type: application/json" \
  -d '{"id":"e-new","name":"New Employee","email":"new@company.com","branchId":"b-1"}'

# Update record
curl -X PUT http://localhost:3001/api/employees/e-1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'

# Delete record
curl -X DELETE http://localhost:3001/api/employees/e-1
```

## Frontend Integration

The frontend API client (`services/api.ts`) provides these methods:

```typescript
// Get all records
const employees = await api.get('employees');

// Create new record
const newEmployee = await api.create('employees', {
  id: 'e-new',
  name: 'John Doe',
  email: 'john@company.com'
});

// Update record
const updated = await api.update('employees', 'e-1', {
  name: 'Jane Doe'
});

// Delete record
await api.delete('employees', 'e-1');

// Health check
const isConnected = await api.checkConnection();
```
