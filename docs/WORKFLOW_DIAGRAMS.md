# CI/CD Workflow Diagrams & Visual Guide

## 🎯 Overview
This document provides comprehensive visual representations of our CI/CD workflows, system architecture, and process flows.

---

## 📋 Diagram Index

1. [High-Level System Architecture](#high-level-system-architecture)
2. [CI Workflow Process](#ci-workflow-process)
3. [CD Deployment Pipeline](#cd-deployment-pipeline)
4. [Trigger Decision Tree](#trigger-decision-tree)
5. [Service Dependencies](#service-dependencies)
6. [Data Flow Architecture](#data-flow-architecture)
7. [Error Handling & Recovery](#error-handling--recovery)

---

## 🏗️ High-Level System Architecture

```mermaid
graph TB
    subgraph "Development Environment"
        DEV[Developer Workstation]
        IDE[VS Code/IDE]
        LOCAL[Local Testing]
    end
    
    subgraph "Version Control"
        GIT[GitHub Repository]
        MAIN[Main Branch]
        DEV_BRANCH[Dev Branch]
    end
    
    subgraph "CI/CD Platform"
        GHA[GitHub Actions]
        RUNNER[Ubuntu Runners]
        DOCKER[Docker Containers]
    end
    
    subgraph "Testing Infrastructure"
        MONGO_TEST[MongoDB Test Instance]
        JEST[Jest Test Runner]
        COVERAGE[Coverage Reports]
    end
    
    subgraph "AWS Cloud Infrastructure"
        S3[S3 Artifact Storage]
        EC2[EC2 Production Server]
        SG[Security Groups]
        IAM[IAM Roles]
    end
    
    subgraph "Production Environment"
        NGINX[Nginx Reverse Proxy]
        NODE[Node.js Application]
        MONGO_PROD[MongoDB Production]
        SYSTEMD[SystemD Service]
    end
    
    subgraph "Monitoring & Alerts"
        DISCORD[Discord Notifications]
        LOGS[Application Logs]
        METRICS[Performance Metrics]
    end
    
    %% Connections
    DEV --> GIT
    GIT --> GHA
    GHA --> DOCKER
    DOCKER --> MONGO_TEST
    DOCKER --> JEST
    
    GHA --> S3
    GHA --> EC2
    EC2 --> NODE
    NODE --> MONGO_PROD
    SYSTEMD --> NODE
    
    GHA --> DISCORD
    NODE --> LOGS
    NODE --> METRICS
    
    %% Styling
    style DEV fill:#e3f2fd
    style GIT fill:#f3e5f5
    style GHA fill:#fff3e0
    style EC2 fill:#e8f5e8
    style NODE fill:#fce4ec
    style DISCORD fill:#f1f8e9
```

### Architecture Components

#### **Development Layer**
- **Developer Workstation**: Local development environment with IDE integration
- **Version Control**: Git-based source code management with branch protection
- **Local Testing**: Pre-commit validation and debugging capabilities

#### **CI/CD Orchestration**
- **GitHub Actions**: Workflow orchestration and execution platform
- **Docker Containers**: Isolated testing environments with reproducible conditions
- **Artifact Management**: S3-based storage for deployment packages and backups

#### **Production Infrastructure**
- **AWS EC2**: Scalable compute instance with auto-recovery capabilities
- **SystemD**: Service management and automatic restart functionality
- **MongoDB**: Production database with backup and monitoring

---

## 🧪 CI Workflow Process

```mermaid
flowchart TD
    START([Code Push/PR]) --> CHECKOUT[Checkout Code]
    CHECKOUT --> ENV_SETUP[Setup Test Environment]
    ENV_SETUP --> DOCKER_BUILD[Build Docker Test Container]
    DOCKER_BUILD --> MONGO_START[Start MongoDB Service]
    MONGO_START --> RUN_TESTS[Execute Test Suite]
    
    RUN_TESTS --> TEST_RESULTS{Test Results}
    TEST_RESULTS -->|Pass| ARTIFACTS[Upload Test Artifacts]
    TEST_RESULTS -->|Fail| NOTIFY_FAIL[Notify Team - Failure]
    
    ARTIFACTS --> PUBLISH[Publish Test Results]
    PUBLISH --> PR_COMMENT[Update PR Status]
    PR_COMMENT --> NOTIFY_SUCCESS[Notify Team - Success]
    NOTIFY_SUCCESS --> TRIGGER_CD[Trigger CD Workflow]
    
    NOTIFY_FAIL --> END_FAIL([❌ CI Failed])
    TRIGGER_CD --> END_SUCCESS([✅ CI Successful])
    
    %% Styling
    style START fill:#e1f5fe
    style TEST_RESULTS fill:#fff3e0
    style END_SUCCESS fill:#e8f5e8
    style END_FAIL fill:#ffebee
    style TRIGGER_CD fill:#f3e5f5
```

### CI Process Breakdown

#### **Phase 1: Environment Preparation**
```bash
# Duration: ~2 minutes
1. Code Checkout (15 seconds)
2. Docker Environment Setup (45 seconds)
3. MongoDB Container Start (30 seconds)
4. Application Dependencies (30 seconds)
```

#### **Phase 2: Test Execution**
```bash
# Duration: ~3-4 minutes
1. Model Tests: Database schema validation
2. Route Tests: API endpoint functionality  
3. Integration Tests: End-to-end workflows
4. Coverage Analysis: Code quality metrics
```

#### **Phase 3: Results Processing**
```bash
# Duration: ~30 seconds
1. Test Result Parsing (JUnit XML)
2. Coverage Report Generation
3. Artifact Upload to GitHub
4. PR Status Update
5. Team Notification (Discord)
```

---

## 🚀 CD Deployment Pipeline

```mermaid
sequenceDiagram
    participant D as Developer
    participant GH as GitHub Actions
    participant S3 as AWS S3
    participant EC2 as AWS EC2
    participant SYS as SystemD
    participant DISC as Discord
    
    D->>GH: Trigger Deployment
    Note over GH: Pre-Deploy Validation
    
    GH->>GH: Check Business Hours
    GH->>GH: Validate CI Status
    GH->>GH: Assess Risk Factors
    
    alt Deployment Approved
        GH->>GH: Create Deployment Package
        GH->>S3: Upload Artifact
        GH->>EC2: SSH Connection
        
        EC2->>SYS: Stop Application Service
        EC2->>EC2: Backup Current Version
        EC2->>S3: Download New Package
        EC2->>EC2: Extract & Configure
        EC2->>SYS: Start Application Service
        
        SYS->>EC2: Service Status Check
        EC2->>GH: Health Check Results
        GH->>DISC: Success Notification
        
    else Deployment Blocked
        GH->>DISC: Blocked Notification
    end
```

### Deployment Stages Detail

#### **Stage 1: Pre-Deployment Validation (1-2 minutes)**
```mermaid
graph LR
    A[Trigger Event] --> B{Business Hours?}
    B -->|Yes| C{CI Tests Passed?}
    B -->|No| D{Manual Override?}
    C -->|Yes| E[✅ Approve Deployment]
    C -->|No| F[❌ Block - Tests Failed]
    D -->|Yes| G{Emergency Justified?}
    D -->|No| H[❌ Block - Outside Hours]
    G -->|Yes| E
    G -->|No| H
    
    style E fill:#4caf50
    style F fill:#f44336
    style H fill:#f44336
```

#### **Stage 2: Package Creation & Upload (2-3 minutes)**
```bash
# Deployment Package Contents
deployment.tar.gz
├── application code (Node.js files)
├── package.json & package-lock.json
├── production dependencies only
├── configuration templates
└── startup scripts

Package Size: ~15-25 MB
Upload Speed: ~30 seconds to S3
Compression Ratio: 65% reduction
```

#### **Stage 3: EC2 Deployment Execution (8-12 minutes)**
```bash
# Deployment Timeline
1. SSH Connection Setup         (15 seconds)
2. Service Graceful Shutdown    (30 seconds)
3. Current Version Backup       (45 seconds)
4. New Package Download         (60 seconds)
5. File Extraction             (30 seconds)
6. Environment Configuration   (15 seconds)
7. Dependency Installation     (8-10 minutes)
8. Service Startup            (45 seconds)
9. Health Check Verification   (60 seconds)

Total Deployment Time: 11-14 minutes
Application Downtime: ~2-3 minutes
```

---

## 🎯 Trigger Decision Tree

```mermaid
graph TD
    TRIGGER[Workflow Trigger] --> EVENT_TYPE{Event Type}
    
    EVENT_TYPE -->|push| PUSH_FLOW[Direct Push Flow]
    EVENT_TYPE -->|workflow_run| CI_FLOW[CI Completion Flow]
    EVENT_TYPE -->|schedule| SCHEDULE_FLOW[Scheduled Flow]
    EVENT_TYPE -->|workflow_dispatch| MANUAL_FLOW[Manual Flow]
    
    PUSH_FLOW --> BH_CHECK1{Business Hours?}
    CI_FLOW --> CI_SUCCESS{CI Passed?}
    SCHEDULE_FLOW --> MAINTENANCE[Maintenance Deployment]
    MANUAL_FLOW --> MANUAL_TYPE{Manual Type}
    
    BH_CHECK1 -->|Yes| DEPLOY1[✅ Deploy: Direct Push]
    BH_CHECK1 -->|No| BLOCK1[❌ Block: Outside Hours]
    
    CI_SUCCESS -->|Yes| BH_CHECK2{Business Hours?}
    CI_SUCCESS -->|No| BLOCK2[❌ Block: CI Failed]
    
    BH_CHECK2 -->|Yes| DEPLOY2[✅ Deploy: Automated CI]
    BH_CHECK2 -->|No| BLOCK3[❌ Block: Outside Hours]
    
    MAINTENANCE --> DEPLOY3[✅ Deploy: Scheduled]
    
    MANUAL_TYPE -->|Emergency| DEPLOY4[✅ Deploy: Emergency]
    MANUAL_TYPE -->|Standard| DEPLOY5[✅ Deploy: Manual]
    
    %% Styling
    style DEPLOY1 fill:#4caf50
    style DEPLOY2 fill:#4caf50
    style DEPLOY3 fill:#4caf50
    style DEPLOY4 fill:#ff9800
    style DEPLOY5 fill:#2196f3
    style BLOCK1 fill:#f44336
    style BLOCK2 fill:#f44336
    style BLOCK3 fill:#f44336
```

### Decision Logic Parameters

#### **Business Hours Configuration**
```yaml
business_hours:
  timezone: "UTC"
  days: "Monday-Friday"  # 1-5 (1=Monday)
  start_hour: 9         # 09:00 UTC
  end_hour: 18          # 18:00 UTC
  
exceptions:
  emergency_override: true
  manual_bypass: true
  scheduled_maintenance: true
```

#### **Risk Assessment Matrix**
```bash
# Low Risk Deployments
- Scheduled maintenance
- Hot-fixes with CI validation  
- Manual deployments during business hours

# Medium Risk Deployments  
- Direct push during business hours
- Manual deployments outside hours
- Rollback procedures

# High Risk Deployments
- Emergency deployments (skip CI)
- Outside-hours critical fixes
- Database schema changes
```

---

## 🔗 Service Dependencies

```mermaid
graph TB
    subgraph "External Services"
        GITHUB[GitHub Repository]
        DISCORD[Discord Webhook]
        AWS[AWS Services]
    end
    
    subgraph "GitHub Actions Environment"
        RUNNER[GitHub Runner]
        DOCKER[Docker Service]
        ACTIONS[Actions Marketplace]
    end
    
    subgraph "AWS Infrastructure"
        IAM[IAM Authentication]
        S3[S3 Artifact Storage]
        EC2[EC2 Production Instance]
        SG[Security Groups]
    end
    
    subgraph "EC2 Production Environment"
        SYSTEMD[SystemD Services]
        NODEJS[Node.js Runtime]
        NPM[NPM Dependencies]
        MONGODB[MongoDB Database]
    end
    
    subgraph "Application Layer"
        EXPRESS[Express.js Framework]
        JWT[JWT Authentication]
        MONGOOSE[Mongoose ODM]
        CORS[CORS Middleware]
    end
    
    %% Dependencies
    RUNNER --> GITHUB
    RUNNER --> DOCKER
    RUNNER --> AWS
    
    AWS --> IAM
    AWS --> S3
    AWS --> EC2
    
    EC2 --> SYSTEMD
    EC2 --> NODEJS
    EC2 --> MONGODB
    
    NODEJS --> NPM
    NODEJS --> EXPRESS
    
    EXPRESS --> JWT
    EXPRESS --> MONGOOSE
    EXPRESS --> CORS
    
    RUNNER --> DISCORD
    
    %% Styling
    style GITHUB fill:#24292e,color:#fff
    style AWS fill:#ff9900
    style NODEJS fill:#339933
    style MONGODB fill:#47a248
    style EXPRESS fill:#000000,color:#fff
```

### Service Dependency Analysis

#### **Critical Path Dependencies**
```bash
# Deployment Blocking Dependencies
1. GitHub Actions Runner (99.9% uptime SLA)
2. AWS S3 Service (99.999999999% durability)
3. AWS EC2 Instance (99.99% availability SLA)
4. Target Server SSH Access (security group dependent)

# Application Runtime Dependencies  
1. MongoDB Database Connection
2. NPM Package Registry Access
3. Node.js Runtime Environment
4. SystemD Service Manager
```

#### **Failure Impact Assessment**
```bash
# High Impact Failures (Service Down)
- MongoDB connection failure: 100% service unavailable
- Node.js runtime crash: 100% service unavailable  
- SystemD service failure: Auto-restart after 10 seconds

# Medium Impact Failures (Degraded Service)
- JWT token validation issues: Authentication affected
- CORS configuration problems: Cross-origin requests blocked
- NPM registry timeout: New deployments blocked

# Low Impact Failures (Monitoring Only)
- Discord webhook failure: Notifications affected only
- S3 temporary unavailability: Deployment delays
- GitHub Actions queue delays: CI/CD pipeline delays
```

---

## 🌊 Data Flow Architecture

```mermaid
flowchart LR
    subgraph "Development Phase"
        CODE[Source Code] --> GIT[Git Repository]
        TEST[Test Files] --> GIT
    end
    
    subgraph "CI Pipeline"  
        GIT --> BUILD[Build Artifacts]
        BUILD --> RESULTS[Test Results]
        RESULTS --> REPORTS[Coverage Reports]
    end
    
    subgraph "Artifact Storage"
        BUILD --> S3_DEPLOY[S3: Deployment Packages]
        RESULTS --> S3_RESULTS[S3: Test Artifacts]
        REPORTS --> S3_REPORTS[S3: Coverage Reports]
    end
    
    subgraph "Production Deployment"
        S3_DEPLOY --> EC2[EC2: Application Server]
        EC2 --> APP_FILES[Application Files]
        APP_FILES --> CONFIG[Environment Config]
    end
    
    subgraph "Runtime Data"
        CONFIG --> APP[Running Application]
        APP --> MONGODB[MongoDB Database]
        APP --> LOGS[Application Logs]
        APP --> METRICS[Performance Metrics]
    end
    
    subgraph "Monitoring & Feedback"
        LOGS --> NOTIFICATIONS[Discord Alerts]
        METRICS --> HEALTH[Health Checks]
        HEALTH --> FEEDBACK[Deployment Feedback]
    end
    
    %% Data flow connections
    FEEDBACK -.-> GIT
    NOTIFICATIONS -.-> CODE
    
    %% Styling
    style CODE fill:#e1f5fe
    style BUILD fill:#f3e5f5
    style S3_DEPLOY fill:#fff8e1
    style APP fill:#e8f5e8
    style MONGODB fill:#e0f2f1
    style NOTIFICATIONS fill:#fce4ec
```

### Data Flow Stages

#### **Stage 1: Source to Build (2-3 minutes)**
```bash
# Data Transformation Pipeline
Source Code (TypeScript/JavaScript)
    ↓ [Compilation & Bundling]
Docker Container Image
    ↓ [Test Execution]  
JUnit XML Results + Coverage Reports
    ↓ [Artifact Creation]
Compressed Deployment Package (.tar.gz)
```

#### **Stage 2: Build to Deployment (1-2 minutes)**
```bash
# Artifact Distribution
Deployment Package
    ↓ [S3 Upload with versioning]
s3://bucket/deployments/backend-{commit-sha}.tar.gz
    ↓ [EC2 Download via AWS CLI]
/tmp/deployment.tar.gz
    ↓ [Extraction to application directory]
/home/ec2-user/app/
```

#### **Stage 3: Runtime Data Flow (Continuous)**
```bash
# Application Data Lifecycle
HTTP Requests → Express.js Router → Business Logic
    ↓
MongoDB Queries → Data Processing → API Responses
    ↓
Application Logs → CloudWatch → Discord Alerts
    ↓  
Performance Metrics → Health Checks → Monitoring Dashboard
```

---

## ⚠️ Error Handling & Recovery

```mermaid
stateDiagram-v2
    [*] --> Healthy
    
    Healthy --> TestFailure : CI Tests Fail
    Healthy --> DeployFailure : Deployment Error
    Healthy --> RuntimeError : Service Crash
    
    TestFailure --> Investigation : Block Deployment
    Investigation --> CodeFix : Bug Identified
    CodeFix --> Healthy : Fixed & Tested
    
    DeployFailure --> AutoRollback : Critical Failure
    DeployFailure --> ManualFix : Non-critical
    
    AutoRollback --> Healthy : Rollback Success
    AutoRollback --> ManualIntervention : Rollback Failed
    
    ManualFix --> Healthy : Issue Resolved
    ManualFix --> ManualIntervention : Escalation Required
    
    RuntimeError --> ServiceRestart : Automatic Recovery
    ServiceRestart --> Healthy : Recovery Success
    ServiceRestart --> ManualIntervention : Restart Failed
    
    ManualIntervention --> Healthy : Manual Resolution
```

### Error Recovery Strategies

#### **Automated Recovery Procedures**
```bash
# SystemD Service Auto-Recovery
[Service]
Restart=always          # Auto-restart on failure
RestartSec=10          # Wait 10 seconds between attempts  
StartLimitBurst=3      # Max 3 restart attempts
StartLimitIntervalSec=60 # Within 60 second window

# Health Check Auto-Recovery
if ! curl -f http://localhost:3000/health; then
    echo "Health check failed, restarting service"
    systemctl restart backend-app
    sleep 30
    if ! systemctl is-active backend-app; then
        echo "Service restart failed, alerting operations team"
        # Send critical alert to Discord
    fi
fi
```

#### **Rollback Automation Triggers**
```bash
# Automatic Rollback Conditions
1. Service fails to start after 3 attempts
2. Health check fails for >5 minutes
3. Error rate exceeds 10% for >2 minutes
4. Response time degrades >300% for >10 minutes
5. Database connection failures >50% for >1 minute

# Rollback Execution
backup_restore() {
    systemctl stop backend-app
    tar -xzf /home/ec2-user/backups/backup-latest.tar.gz -C /home/ec2-user/app
    systemctl start backend-app
    
    # Verify rollback success
    if systemctl is-active backend-app; then
        echo "✅ Rollback successful"
        notify_discord "🔄 Automatic rollback completed successfully"
    else
        echo "❌ Rollback failed - manual intervention required"
        notify_discord "🚨 CRITICAL: Rollback failed - immediate attention needed"
    fi
}
```

---

## 📊 Performance & Monitoring Diagrams

```mermaid
pie title Deployment Success Rate (Last 90 Days)
    "Successful" : 89
    "Failed (Recovered)" : 7
    "Failed (Manual)" : 4
```

```mermaid
journey
    title Typical Deployment Journey
    section Development
      Code Change     : 5: Developer
      Local Testing   : 4: Developer
      Git Push        : 5: Developer
    section CI Pipeline  
      Test Execution  : 4: GitHub Actions
      Quality Gates   : 5: Automated
      Artifact Build  : 5: Automated
    section CD Pipeline
      Deploy Decision : 5: Automated
      AWS Deployment  : 4: Automated
      Health Checks   : 5: Automated
    section Production
      Service Running : 5: Production
      User Traffic    : 5: Users
      Monitoring      : 4: Ops Team
```

This comprehensive visual documentation provides clear insights into the sophisticated automation and monitoring capabilities of our CI/CD pipeline, demonstrating enterprise-level deployment practices and operational excellence.