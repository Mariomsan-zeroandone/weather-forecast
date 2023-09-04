# DevOps Project with AWS, Pulumi, and Amazon ECR

This repository contains the infrastructure-as-code (IaC) project for deploying a web application to AWS using AWS Fargate, Pulumi, and Amazon Elastic Container Registry (ECR).

## Project Overview

The goal of this project is to demonstrate how to set up and deploy a web application in AWS with a focus on DevOps best practices. The project includes the following components:

- Web UI: A web front-end for the application.
- Web API: A backend API that serves data to the web UI.
- AWS Fargate: Containerized services that run your application.
- Amazon ECR: A container registry for storing Docker images.
- AWS Application Load Balancer (ALB): Exposes the Web UI to the internet.

## Prerequisites

Before getting started, make sure you have the following prerequisites:

- [Pulumi CLI](https://www.pulumi.com/docs/get-started/install/)
- [AWS CLI](https://aws.amazon.com/cli/)
- Docker installed for building and pushing Docker images.

## Project Structure

- `Pulumi.yaml`: Pulumi configuration file.
- `index.ts`: Pulumi TypeScript code for defining AWS resources.
- Dockerfiles: Dockerfiles for building your application's containers.
- Other project files and folders.

## Getting Started

1. Clone this repository:

   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Configure your AWS credentials:

   Ensure your AWS credentials are set up either through the AWS CLI or environment variables.

3. Authenticate Docker with ECR:

   Use the AWS CLI to authenticate Docker with your ECR repository:

   ```bash
   aws ecr get-login-password --region <your-ecr-region> | docker login --username AWS --password-stdin <your-account-id>.dkr.ecr.<your-ecr-region>.amazonaws.com
   ```

   Replace `<your-ecr-region>` with your ECR region and `<your-account-id>` with your AWS account ID.

4. Build and push Docker images:

   Build your Docker Compose images and push them to your ECR repository:

   ```bash
   docker compose build ./path/to/your-service
   docker tag <your-image-name>:latest <your-account-id>.dkr.ecr.<your-ecr-region>.amazonaws.com/<your-image-name>:latest
   docker push <your-account-id>.dkr.ecr.<your-ecr-region>.amazonaws.com/<your-image-name>:latest
   ```

   Replace `<your-image-name>`, `<your-ecr-region>`, and `<your-account-id>` with your specific values.

5. Configure your Pulumi stack:

   Modify the `index.ts` file to define your AWS resources, including referencing your ECR images.


6. Deploy your Pulumi stack:

   Run the following command to create or update your AWS resources:

   ```bash
   pulumi up
   ```

7. Access your application:

   After the deployment is complete, you can access your application using the ALB DNS name.

## Project Customization

- Customize the AWS resources, security groups, and subnets in the Pulumi code to match your specific requirements.
- Update Dockerfiles for building your application containers.
- Manage additional AWS resources as needed for your application.

## Cleanup

To clean up and delete the AWS resources created by Pulumi, run:

```bash
pulumi destroy
```

## Acknowledgments

- [Pulumi Documentation](https://www.pulumi.com/docs/)
- [AWS Documentation](https://aws.amazon.com/documentation/)

## Author

Mario Msan
