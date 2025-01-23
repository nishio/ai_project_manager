import os
import json
import jsonpatch
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def apply_json_patch(original_data_path, patch_path, output_path):
    """Apply JSON patch to original data and save the result.
    
    Args:
        original_data_path (str): Path to original JSON file
        patch_path (str): Path to patch file
        output_path (str): Path to save patched result
    """
    print(f"Reading original data from: {original_data_path}")
    print(f"Reading patch from: {patch_path}")
    print(f"Will save output to: {output_path}")
    
    # Load original data
    with open(original_data_path, "r", encoding="utf-8") as original_file:
        original_data = json.load(original_file)

    # Load patch
    with open(patch_path, "r", encoding="utf-8") as patch_file:
        patch = json.load(patch_file)

    # Apply patch
    patched_data = jsonpatch.apply_patch(original_data, patch)

    # Save result
    with open(output_path, "w", encoding="utf-8") as output_file:
        json.dump(patched_data, output_file, ensure_ascii=False, indent=2)
    print("Patch applied successfully")


# Get data root path from environment
data_root = os.getenv("DATA_ROOT", "/home/ubuntu/repos/ai_project_manager_data")

# Define paths
BACKLOG_PATH = os.path.join(data_root, "tasks", "backlog.json")
PATCH_PATH = os.path.join(data_root, "tasks", "patch.json")

# Execute script
apply_json_patch(BACKLOG_PATH, PATCH_PATH, BACKLOG_PATH)
