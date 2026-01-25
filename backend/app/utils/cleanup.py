import os
from flask import after_this_request

def cleanup_file_after_request(filepath):
    """
    Schedules a file to be deleted after the current request is finished.
    Useful for temporary files served via send_file.
    """
    @after_this_request
    def remove_file(response):
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
        except Exception as e:
            # Log the error but don't fail the response
            print(f"Error cleaning up temp file {filepath}: {e}")
        return response
