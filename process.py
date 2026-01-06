import os
import json
import glob

def process_jsonl_files(directory_path):
    # Get all jsonl files in the directory
    jsonl_files = glob.glob(os.path.join(directory_path, "*.jsonl"))
    
    # 使用natsort库进行自然序排序
    try:
        from natsort import natsorted
        jsonl_files = natsorted(jsonl_files)
    except ImportError:
        # 如果没有natsort库，提供一个简单的自然序排序实现
        import re
        def natural_sort_key(s):
            return [int(text) if text.isdigit() else text.lower()
                    for text in re.split(r'(\d+)', os.path.basename(s))]
        
        jsonl_files.sort(key=natural_sort_key)
    
    # Dictionary to store the results
    document_samples = {}
    print(jsonl_files)
    
    # Process each file
    for i, file_path in enumerate(jsonl_files, 1):
        file_name = os.path.basename(file_path)
        snippets = []
        
        # Read the file and extract text from the first 20 lines
        with open(file_path, 'r', encoding='utf-8') as file:
            line_count = 0
            for line in file:
                if line_count >= 20:
                    break
                    
                try:
                    # Parse the JSON line
                    data = json.loads(line.strip())
                    
                    # Extract the text field
                    if 'text' in data:
                        # Remove newlines and limit to first 200 words
                        text = data['text'].replace('\n', ' ')
                        words = text.split()
                        if len(words) > 200:
                            text = ' '.join(words[:200]) + '...'
                        snippets.append({"snippet": text})
                        line_count += 1
                except json.JSONDecodeError:
                    # Skip invalid JSON lines
                    continue
        
        # Add to document_samples dictionary
        document_samples[str(i)] = snippets
    
    return document_samples

def format_output(document_samples):
    # Format the output as JavaScript object
    output = []
    
    for doc_id, snippets in document_samples.items():
        output.append(f'  documentSamples["{doc_id}"] = [')
        
        for snippet in snippets:
            text = snippet["snippet"].replace('"', '\\"')
            output.append(f'    {{ snippet: "{text}" }},')
        
        output.append('  ];')
        output.append('')
    
    return '\n'.join(output)

if __name__ == "__main__":
    directory_path = "/Users/sdiao/Downloads/climb-site/data"
    
    # Process the files
    document_samples = process_jsonl_files(directory_path)
    
    # Format and print the output
    formatted_output = format_output(document_samples)
    # print(formatted_output)
    
    # Optionally, save to a file
    with open("document_samples.js", "w", encoding="utf-8") as f:
        f.write(formatted_output)
    
    print(f"Processed {len(document_samples)} files. Output saved to document_samples.js")