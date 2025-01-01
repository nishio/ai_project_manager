import yaml
import sys

def validate_yaml(file_path):
    try:
        with open(file_path, 'r') as f:
            yaml.safe_load(f)
        print(f"YAML syntax OK for {file_path}")
        return True
    except yaml.YAMLError as e:
        print(f"YAML syntax error in {file_path}: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate_yaml.py <yaml_file>")
        sys.exit(1)
    
    success = validate_yaml(sys.argv[1])
    sys.exit(0 if success else 1)
