output "public_ip" {
    description = "Elastic IP of the EC2 instance"
    value       = aws_eip.tea_api.public_ip
  }

  output "ssh_command" {
    description = "SSH command to connect"
    value       = "ssh -i ~/.ssh/tea-ec2-api-key.pem ubuntu@${aws_eip.tea_api.public_ip}"
  }

  output "api_url" {
    description = "Base API URL"
    value       = "http://${aws_eip.tea_api.public_ip}:8080"
  }