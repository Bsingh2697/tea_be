# Get latest Ubuntu 24.04 AMI automatically
data "aws_ami" "ubuntu" {
    most_recent = true
    owners = ["099720109477"]
    filter {
      name   = "name"
      values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
    }
}

# Security group — firewall rules
resource "aws_security_group" "tea_api" {
    name = "${var.app_name}-sg-v2"
    description = "Security group for tea API"

    ingress {
        from_port = 22
        to_port = 22
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
        description = "SSH"
    }

    ingress {
        from_port = 8080
        to_port = 8080
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
        description = "API"
    }

    egress { 
        from_port = 0
        to_port = 0
        protocol = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }

    tags = {
        Name = "${var.app_name}-sg"
    }
}

# EC2 instance
resource "aws_instance" "tea_api" { 
    ami = data.aws_ami.ubuntu.id
    instance_type = var.instance_type
    key_name = var.key_pair_name
    vpc_security_group_ids = [aws_security_group.tea_api.id]

    root_block_device { 
        volume_size = 20
        volume_type = "gp3"
    }

    tags={
        Name = var.app_name
    }
}

# Elastic IP
resource "aws_eip" "tea_api"{
    instance = aws_instance.tea_api.id
    domain= "vpc"

    tags = {
        Name = "${var.app_name}-eip"
    }
}