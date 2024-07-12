import os
import json

# Define the content to be written in each JSON file
content = {
    "NAME": 3,
    "GROUP": 1,
    "KEYWORDS": {
        "None": "None"
    },
    "TASK": "None",
    "ANSWER": {
        "INTRODUCTION": "None",
        "BODY": {
            "OPINION_1": "None",
            "OPINION_2": "None"
        },
        "CONCLUSION": "None"
    },
    "VOCABULARY": {
        "one": "một",
        "two": "hai"
    }
}

# Directory to save the files
directory = 'data'

# Ensure the directory exists
os.makedirs(directory, exist_ok=True)

# Create JSON files from op_4.json to op_61.json with incrementing NAME value
for i in range(4, 62):
    file_name = f'op_{i}.json'
    file_path = os.path.join(directory, file_name)
    
    # Update the NAME field with the current value of i
    content["NAME"] = i
    # gropu 4-21 -> 1, 22-26 -> 2, 27-45 -> 46-49 -> 4, 50-60 -> 5, 61 -> 6 
    if i in range(4, 22):
        content["GROUP"] = 1
    elif i in range(22, 27):
        content["GROUP"] = 2
    elif i in range(27, 46):
        content["GROUP"] = 3
    elif i in range(46, 50):
        content["GROUP"] = 4
    elif i in range(50, 61):
        content["GROUP"] = 5
    else:
        content["GROUP"] = 6
    
    with open(file_path, 'w', encoding='utf-8') as file:
        json.dump(content, file, ensure_ascii=False, indent=4)

print(f"Files created in {directory}")
