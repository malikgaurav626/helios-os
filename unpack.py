import os

def unpack(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    idx = content.find('\n===FILE=== ')
    if idx == -1:
        if content.startswith('===FILE=== '):
            idx = 0
        else:
            print("No files found.")
            return

    if content.startswith('===FILE=== '):
        parts = content.split('\n===FILE=== ')
        parts[0] = parts[0][len('===FILE=== '):]
    else:
        parts = content[idx + len('\n===FILE=== '):].split('\n===FILE=== ')

    for part in parts:
        lines = part.split('\n', 1)
        if len(lines) < 2:
            continue
        rel_path = lines[0].strip()
        file_data = lines[1]
        
        if file_data.endswith('\n'):
            file_data = file_data[:-1]
            
        os.makedirs(os.path.dirname(rel_path), exist_ok=True)
        with open(rel_path, 'w', encoding='utf-8') as out:
            out.write(file_data)
        print(f"Wrote {rel_path}")

unpack('project-builder.md')
