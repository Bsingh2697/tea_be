variable "aws_region" {
    description = "AWS region"
    type = string
    default = "ap-south-1"
}

variable "instance_type" { 
    description = "EC2 instance type"
    type = string
    default = "t3.micro"
}

variable "key_pair_name" {
    description = "AWS key pair name for SSH"
    type = string
    default = "tea-ec2-api-key"
}

variable "app_name" {
    description = "App name for naming resources"
    type = string
    default = "tea-api"
}