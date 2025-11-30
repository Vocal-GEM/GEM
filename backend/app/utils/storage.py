import os
import boto3
from flask import current_app
from werkzeug.utils import secure_filename

class StorageService:
    def __init__(self):
        self.s3_client = None
        self.bucket_name = os.environ.get('AWS_BUCKET_NAME')
        self.region = os.environ.get('AWS_REGION', 'us-east-1')
        
        aws_access_key = os.environ.get('AWS_ACCESS_KEY_ID')
        aws_secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY')
        
        if aws_access_key and aws_secret_key and self.bucket_name:
            try:
                self.s3_client = boto3.client(
                    's3',
                    aws_access_key_id=aws_access_key,
                    aws_secret_access_key=aws_secret_key,
                    region_name=self.region
                )
                print("StorageService: AWS S3 initialized.")
            except Exception as e:
                print(f"StorageService: Failed to initialize S3 client: {e}")
        else:
            print("StorageService: AWS credentials not found. Using local storage.")

    def upload_file(self, file_obj, filename, content_type=None):
        """
        Uploads a file to S3 or saves locally.
        Returns the public URL (or local path).
        """
        filename = secure_filename(filename)
        
        if self.s3_client:
            try:
                extra_args = {'ACL': 'public-read'}
                if content_type:
                    extra_args['ContentType'] = content_type
                
                self.s3_client.upload_fileobj(
                    file_obj,
                    self.bucket_name,
                    filename,
                    ExtraArgs=extra_args
                )
                
                # Construct S3 URL
                url = f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com/{filename}"
                return url
            except Exception as e:
                print(f"StorageService: S3 upload failed: {e}")
                # Fallback to local? Or raise error? 
                # Let's raise error so user knows S3 failed if they expected it.
                # But for robustness, maybe fallback is better? 
                # Let's try fallback if S3 fails, but log it.
                print("StorageService: Falling back to local storage.")
        
        # Local Storage
        upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        file_path = os.path.join(upload_folder, filename)
        
        # Reset file pointer if it was read during failed S3 attempt
        file_obj.seek(0)
        file_obj.save(file_path)
        
        return f"/uploads/{filename}"

    def delete_file(self, filename):
        if self.s3_client:
            try:
                self.s3_client.delete_object(Bucket=self.bucket_name, Key=filename)
                return True
            except Exception as e:
                print(f"StorageService: S3 delete failed: {e}")
                return False
        else:
            upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
            file_path = os.path.join(upload_folder, filename)
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False

# Singleton instance
storage_service = StorageService()
