import os

backend_dirs = [
    "backend",
    "backend/api",
    "backend/services",
    "backend/agents",
    "backend/models",
    "backend/database",
    "backend/utils",
    "backend/ml",
    "backend/ml/crop_model",
    "backend/ml/disease_model",
    "backend/ml/weather",
    "backend/ml/rag",
    "backend/ml/datasets"
]

for directory in backend_dirs:
    path = os.path.join(os.getcwd(), directory)
    os.makedirs(path, exist_ok=True)
    # Add a .gitkeep or __init__.py where appropriate to ensure directories are tracked/prepared
    if "ml/" not in directory and directory != "backend":
        init_file = os.path.join(path, "__init__.py")
        with open(init_file, "w") as f:
            f.write("# Auto-generated init file\n")
    print(f"Created: {path}")
