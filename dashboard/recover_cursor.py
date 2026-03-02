import os, json, glob, shutil

history_dir = os.path.expanduser("~/Library/Application Support/Cursor/User/History")
search_pattern = "/Users/ahmedmansour/anan/anan-lit/dashboard/src/components/dashboard"
dest_dir = "/Users/ahmedmansour/anan/anan-lit/dashboard/src/shared/components/dashboard"

for entries_file in glob.glob(os.path.join(history_dir, "*", "entries.json")):
    with open(entries_file, "r") as f:
        try:
            data = json.load(f)
        except:
            continue
            
        repo_path = data.get("resource", "")
        if repo_path.startswith("file://"):
            repo_path = repo_path[7:]
            
        if repo_path.startswith(search_pattern):
            # This is a file we want to recover
            entries = data.get("entries", [])
            if not entries:
                continue
                
            entries.sort(key=lambda x: x.get("timestamp", 0), reverse=True)
            latest_id = entries[0]["id"]
            
            src_file = os.path.join(os.path.dirname(entries_file), latest_id)
            if not os.path.exists(src_file):
                continue
                
            rel_path = os.path.relpath(repo_path, search_pattern)
            dest_file = os.path.join(dest_dir, rel_path)
            
            os.makedirs(os.path.dirname(dest_file), exist_ok=True)
            shutil.copy2(src_file, dest_file)
            print(f"Recovered {rel_path}")

