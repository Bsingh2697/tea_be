# Terraform Infrastructure as Code

Terraform codifies the AWS infrastructure so it can be recreated instantly with one command instead of clicking through the AWS console manually.

---

## Why Terraform

| Manual (AWS Console) | Terraform |
|---|---|
| Click through UI every time | One command: `terraform apply` |
| Easy to make mistakes | Consistent, repeatable |
| No record of what was created | Code is the documentation |
| Hard to recreate on new server | Spin up identical server in seconds |
| No version control | Tracked in git |

---

## Files

```
terraform/
├── main.tf        # AWS provider setup
├── variables.tf   # reusable input values
├── ec2.tf         # actual infrastructure resources
└── outputs.tf     # prints useful info after apply
```

---

## main.tf

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}
```

- Tells Terraform to use the AWS provider (plugin)
- `~> 5.0` = use any version 5.x
- Region comes from `variables.tf`
- Credentials come automatically from `~/.aws/credentials`

---

## variables.tf

```hcl
variable "aws_region"    { default = "ap-south-1" }
variable "instance_type" { default = "t3.micro" }
variable "key_pair_name" { default = "tea-ec2-api-key" }
variable "app_name"      { default = "tea-api" }
```

- Reusable values used across all other files
- Change once here → updates everywhere
- Like constants/config for your infrastructure

---

## ec2.tf

Creates 3 resources in this order (Terraform figures out the order automatically from references):

### 1. AMI lookup
```hcl
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]  # Canonical's official AWS account
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }
}
```
Finds the latest Ubuntu 24.04 AMI automatically. `data` = read only, creates nothing.

### 2. Security group (firewall)
```hcl
resource "aws_security_group" "tea_api" {
  ingress { from_port = 22,   protocol = "tcp", cidr_blocks = ["0.0.0.0/0"] }  # SSH
  ingress { from_port = 8080, protocol = "tcp", cidr_blocks = ["0.0.0.0/0"] }  # API
  egress  { protocol = "-1",  cidr_blocks = ["0.0.0.0/0"] }                    # all outbound
}
```
- `ingress` = incoming traffic rules
- `egress` = outgoing traffic (needed for Docker pulls, MongoDB, GitHub)
- `cidr_blocks = ["0.0.0.0/0"]` = allow from anywhere

### 3. EC2 instance
```hcl
resource "aws_instance" "tea_api" {
  ami                    = data.aws_ami.ubuntu.id        # from step 1
  instance_type          = var.instance_type             # t3.micro
  key_name               = var.key_pair_name             # tea-ec2-api-key
  vpc_security_group_ids = [aws_security_group.tea_api.id]  # from step 2
  root_block_device { volume_size = 20, volume_type = "gp3" }
}
```

### 4. Elastic IP
```hcl
resource "aws_eip" "tea_api" {
  instance = aws_instance.tea_api.id  # from step 3
  domain   = "vpc"
}
```
Permanent fixed IP attached to the EC2 instance.

---

## outputs.tf

```hcl
output "public_ip"   { value = aws_eip.tea_api.public_ip }
output "ssh_command" { value = "ssh -i ~/.ssh/tea-ec2-api-key.pem ubuntu@${aws_eip.tea_api.public_ip}" }
output "api_url"     { value = "http://${aws_eip.tea_api.public_ip}:8080" }
```

Printed after `terraform apply` so you don't have to look up values in AWS console.

---

## How files connect

```
~/.aws/credentials      ← AWS access keys (set via aws configure)
↓
main.tf                 ← uses credentials, sets region from variables.tf
↓
variables.tf            ← supplies values to ec2.tf
↓
ec2.tf:
  data.aws_ami          ← looks up Ubuntu AMI
  aws_security_group    ← uses var.app_name
  aws_instance          ← uses AMI + security group + variables
  aws_eip               ← uses EC2 instance id
↓
outputs.tf              ← reads public_ip from aws_eip → prints it
```

---

## How Terraform gets AWS access

```
aws configure
↓
saves to ~/.aws/credentials:
  aws_access_key_id     = AKIA...
  aws_secret_access_key = xxxx...
↓
Terraform reads automatically — never put credentials in .tf files
```

IAM user `terraform-user` with `AdministratorAccess` was created in AWS console for this.

---

## Commands

```bash
terraform init      # download AWS provider (run once)
terraform plan      # preview what will be created (dry run)
terraform apply     # create the infrastructure
terraform destroy   # delete everything Terraform created
```

### What each does:

| Command | What it does |
|---|---|
| `init` | Downloads provider plugins (like `npm install`) |
| `plan` | Shows what will change — nothing is created yet |
| `apply` | Actually creates/updates resources on AWS |
| `destroy` | Deletes all resources Terraform created |

---

## Terraform state

After `terraform apply`, Terraform saves what it created in `terraform.tfstate`.

```
terraform.tfstate = Terraform's memory of what it built
```

- Never delete this file — Terraform loses track of infrastructure
- Never commit it to git — it may contain sensitive values
- It's in `.gitignore` for this reason

---

## Key concepts

| Term | Meaning |
|---|---|
| Provider | Plugin for a cloud platform (AWS, GCP etc.) |
| Resource | Infrastructure to create (`aws_instance`, `aws_eip`) |
| Data source | Read existing AWS data without creating anything |
| Variable | Reusable input value |
| Output | Value printed after apply |
| State | Terraform's record of what it created |
| CIDR | IP range notation — `0.0.0.0/0` = all IPs, `/32` = one IP |

---

## Note on existing infrastructure

The manual EC2 at `13.234.134.238` is separate from Terraform. Running `terraform apply` creates a **brand new** server — it does not affect the existing one.

To manage existing resources with Terraform use `terraform import`.
