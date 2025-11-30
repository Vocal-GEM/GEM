import os
from .rag import rag_system

def load_knowledge_base(app):
    """
    Scans the backend/knowledge_base directory and uploads new files to the RAG system.
    """
    kb_dir = os.path.join(os.getcwd(), 'backend', 'knowledge_base')
    
    # Ensure directory exists
    if not os.path.exists(kb_dir):
        try:
            os.makedirs(kb_dir)
            print(f"[AutoLoader] Created knowledge base directory at {kb_dir}")
        except Exception as e:
            print(f"[AutoLoader] Failed to create directory: {e}")
            return

    print(f"[AutoLoader] Scanning {kb_dir} for new documents...")
    
    files = [f for f in os.listdir(kb_dir) if os.path.isfile(os.path.join(kb_dir, f))]
    
    count = 0
    for filename in files:
        file_path = os.path.join(kb_dir, filename)
        
        # Check if already exists
        if rag_system.document_exists(filename):
            print(f"[AutoLoader] Skipping {filename} (already exists)")
            continue
            
        print(f"[AutoLoader] Processing {filename}...")
        
        try:
            chunks_added = 0
            if filename.lower().endswith('.pdf'):
                chunks_added = rag_system.add_pdf(file_path)
            elif filename.lower().endswith('.txt') or filename.lower().endswith('.md'):
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
                chunks_added = rag_system.add_document(text, source=filename)
            
            if chunks_added > 0:
                print(f"[AutoLoader] Successfully loaded {filename} ({chunks_added} chunks)")
                count += 1
            else:
                print(f"[AutoLoader] Failed to load {filename} or file was empty")
                
        except Exception as e:
            print(f"[AutoLoader] Error processing {filename}: {e}")
            
    if count > 0:
        print(f"[AutoLoader] Finished. Added {count} new documents.")
    else:
        print("[AutoLoader] No new documents added.")
