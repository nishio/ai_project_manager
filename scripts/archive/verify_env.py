"""Script to verify that all required packages are installed and working."""
import sys

def verify_environment():
    try:
        import networkx as nx
        import graphviz
        print(f"Successfully imported networkx {nx.__version__}")
        print(f"Successfully imported graphviz {graphviz.__version__}")
        return True
    except ImportError as e:
        print(f"Error importing required packages: {e}", file=sys.stderr)
        return False

if __name__ == "__main__":
    if not verify_environment():
        sys.exit(1)
