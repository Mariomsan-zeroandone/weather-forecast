import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// Create a new VPC for the application
const vpc = new awsx.ec2.Vpc("air-tek-vpc-1", {
  numberOfAvailabilityZones: 2,
  tags: {
    Name: "air-tek-vpc-1",
    Environment: "DEV",
    Project: "weather-app",
  },
});

// Create a security group for the application
const albSecurityGroup = new aws.ec2.SecurityGroup("air-tek-alb-sg", {
  vpcId: vpc.vpcId,
  ingress: [
    {
      description: "alb-ingress",
      fromPort: 80,
      toPort: 80,
      cidrBlocks: ["0.0.0.0/0"],
      ipv6CidrBlocks: ["::/0"],
      protocol: "tcp",
    },
  ],
  egress: [
    {
      fromPort: 0,
      toPort: 0,
      protocol: "-1",
      cidrBlocks: ["0.0.0.0/0"],
      ipv6CidrBlocks: ["::/0"],
    },
  ],
  tags: {
    Name: "air-tek-security-group",
    Environment: "DEV",
    Project: "weather-app",
  },
});

// Create a security group for the application
const securityGroup = new aws.ec2.SecurityGroup("air-tek-sg", {
  vpcId: vpc.vpcId,
  ingress: [
    {
      fromPort: 3000,
      toPort: 3000,
      securityGroups: [albSecurityGroup.id],
      protocol: "tcp",
    },
    {
      fromPort: 5000,
      toPort: 5000,
      self: true,
      protocol: "tcp",
    },
  ],
  egress: [
    {
      fromPort: 0,
      toPort: 0,
      protocol: "-1",
      cidrBlocks: ["0.0.0.0/0"],
      ipv6CidrBlocks: ["::/0"],
    },
  ],
  tags: {
    Name: "air-tek-security-group",
    Environment: "DEV",
    Project: "weather-app",
  },
});

// Create Web UI ECR repository
const webUIRepository = new awsx.ecr.Repository("web-ui-repository", {
  tags: {
    Name: "web-ui-ecr-repo",
    Environment: "DEV",
    Project: "weather-app",
  },
});
// Create Web API ECR repository
const webAPIRepository = new awsx.ecr.Repository("web-api-repository", {
  tags: {
    Name: "web-api-ecr-repo",
    Environment: "DEV",
    Project: "weather-app",
  },
});

// Create ECS Cluster
const cluster = new aws.ecs.Cluster("air-tek-cluster", {
  tags: {
    Name: "air-tek-cluster",
    Environment: "DEV",
    Project: "weather-app",
  },
});

// Create an ALB associated with the default VPC for this region.
const alb = new awsx.lb.ApplicationLoadBalancer("web-traffic", {
  subnetIds: vpc.publicSubnetIds,
  securityGroups: [albSecurityGroup.id],
  listener: { port: 80 },
  defaultTargetGroup: {
    port: 3000,
    targetType: "ip",
  },
  tags: {
    Name: "air-tek-alb",
    Environment: "DEV",
    Project: "weather-app",
  },
});

// Create Fargate services for Web UI
const webService = new awsx.ecs.FargateService("web-service", {
  cluster: cluster.arn,
  networkConfiguration: {
    subnets: vpc.privateSubnetIds,
    securityGroups: [securityGroup.id],
  },
  desiredCount: 1,
  taskDefinitionArgs: {
    containers: {
      infraapi: {
        name: "infraapi",
        image:
          "143626331994.dkr.ecr.us-east-1.amazonaws.com/web-api-repository-43deb99:latest",
        cpu: 512,
        memory: 128,
        portMappings: [
          {
            hostPort: 5000,
            containerPort: 5000,
          },
        ],
        essential: true,
      },
      infraweb: {
        name: "infraweb",
        image:
          "143626331994.dkr.ecr.us-east-1.amazonaws.com/web-ui-repository-82d70ac:latest",
        cpu: 512,
        memory: 128,
        environment: [
          {
            name: "ApiAddress",
            value: `http://localhost:5000/WeatherForecast`,
          },
        ],
        dependsOn: [{ containerName: "infraapi", condition: "START" }],
        essential: true,
        portMappings: [
          {
            targetGroup: alb.defaultTargetGroup,
            hostPort: 3000,
            containerPort: 3000,
          },
        ],
      },
    },
  },
  tags: {
    Name: "web-api-ecs-service",
    Environment: "DEV",
    Project: "weather-app",
  },
});

// Export endpoint
export const endpoint = alb.loadBalancer.dnsName;
