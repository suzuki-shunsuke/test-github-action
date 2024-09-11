// hello


locals {
  unused = "test"
}

resource "null_resource" "foo-bar" {}

output "no_description" {
  value = "value"
}

terraform {
  required_version = ">= 1.0"
  required_providers {
    null = {
      source  = "hashicorp/null"
      version = "3.2.0"
    }
  }
}
