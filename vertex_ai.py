import json
import os

from google import genai


def get_gen_ai_client():
    PROJECT_ID = str(os.environ.get("GOOGLE_CLOUD_PROJECT"))
    if not PROJECT_ID or PROJECT_ID == "[your-project-id]":
        raise Exception("Missing PROJECT_ID: Provide your project id to the env: GOOGLE_CLOUD_PROJECT")

    LOCATION = os.environ.get("GOOGLE_CLOUD_REGION", "us-central1")
    
    # Instantiate client for Vertex AI
    return genai.Client(vertexai=True, project=PROJECT_ID, location=LOCATION)



def get_file_from_gcloud_storage():
    marketing_brief_file_path = "github-repo/generative-ai/gemini2/use-cases/marketing_example/sample_marketing_campaign_brief.pdf"
    marketing_brief_file_uri = f"gs://{marketing_brief_file_path}"
    marketing_brief_file_url = f"https://storage.googleapis.com/{marketing_brief_file_path}"
    return marketing_brief_file_url

     