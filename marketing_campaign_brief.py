# JSON response schema for Marketing Campaign Brief
from pydantic import BaseModel
from google.genai import types
from google.genai.types import GenerateContentConfig, GoogleSearch, Tool
from vertex_ai import get_gen_ai_client, get_file_from_gcloud_storage
import json
from IPython.display import Markdown, display

class MarketingCampaignBrief(BaseModel):
    campaign_name: str
    campaign_objectives: list[str]
    target_audience: str
    media_strategy: list[str]
    timeline: str
    target_countries: list[str]
    performance_metrics: list[str]

client = get_gen_ai_client()
MODEL_ID = "gemini-2.0-flash-001"

def get_sample_marketing_brief():
    # use Gemini 2.0 Flash model
      # @param {type: "string"}

    global client
    global MODEL_ID

    prompt = """ Extract the details from the sample marketing brief. """

    marketing_brief_file = types.Part.from_uri(
        file_uri=get_file_from_gcloud_storage, mime_type="application/pdf")
    contents = [marketing_brief_file, prompt]

    response = client.models.generate_content(
        model=MODEL_ID,
        contents=contents,
        config=GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=MarketingCampaignBrief,
    ),)

    sample_marketing_brief = response.text
    sample_marketing_brief_json = json.loads(sample_marketing_brief)
    print(json.dumps(sample_marketing_brief_json, indent=2))



def print_grounding_response(response):
    """Prints Gemini response with grounding citations."""
    grounding_metadata = response.candidates[0].grounding_metadata

    # Citation indices are in byte units
    ENCODING = "utf-8"
    text_bytes = response.text.encode(ENCODING)

    prev_index = 0
    markdown_text = ""

    for grounding_support in grounding_metadata.grounding_supports:
        text_segment = text_bytes[
            prev_index : grounding_support.segment.end_index
        ].decode(ENCODING)

        footnotes_text = ""
        for grounding_chunk_index in grounding_support.grounding_chunk_indices:
            footnotes_text += f"[[{grounding_chunk_index + 1}]]({grounding_metadata.grounding_chunks[grounding_chunk_index].web.uri})\n"

        markdown_text += f"{text_segment} {footnotes_text}\n"
        prev_index = grounding_support.segment.end_index

    if prev_index < len(text_bytes):
        markdown_text += str(text_bytes[prev_index:], encoding=ENCODING)

    markdown_text += "\n----\n## Grounding Sources\n"

    if grounding_metadata.web_search_queries:
        markdown_text += (
            f"\n**Web Search Queries:** {grounding_metadata.web_search_queries}\n"
        )
        if grounding_metadata.search_entry_point:
            markdown_text += f"\n**Search Entry Point:**\n {grounding_metadata.search_entry_point.rendered_content}\n"
    elif grounding_metadata.retrieval_queries:
        markdown_text += (
            f"\n**Retrieval Queries:** {grounding_metadata.retrieval_queries}\n"
        )

    markdown_text += "### Grounding Chunks\n"

    for index, grounding_chunk in enumerate(
        grounding_metadata.grounding_chunks, start=1
    ):
        context = grounding_chunk.web or grounding_chunk.retrieved_context
        if not context:
            print(f"Skipping Grounding Chunk {grounding_chunk}")
            continue

        markdown_text += f"{index}. [{context.title}]({context.uri})\n"

    display(Markdown(markdown_text))



def grounding_market_search():
    global client
    # Use Grounding with Google Search to do market research
    market_research_prompt = """
        I am planning to launch a mobile phone campaign and I want to understand the latest trends in the phone industry.
        Please answer the following questions:
        - What are the latest phone models and their selling point from the top 2 phone makers?
        - What is the general public sentiment about mobile phones?
    """

    contents = [market_research_prompt]

    google_search_tool = Tool(google_search=GoogleSearch())

    response = client.models.generate_content(
        model=MODEL_ID,
        contents=contents,
        config=GenerateContentConfig(tools=[google_search_tool]),
    )
    print_grounding_response(response)
    return response.text


def generate_marketing_brief():

    global client 

    new_phone_details = """
        Phone Name: Pix Phone 10
        Short description: Pix Phone 10 is the flagship phone with a focus on AI-powered features and a completely redesigned form factor.
        Tech Specs:
            - Camera: 50MP main sensor with 48MP ultrawide lens with autofocus for macro shots
            - Performance: P5 processor for fast performance and AI capabilities
            - Battery: 4700mAh battery for all-day usage
        Key Highlights:
            - Powerful camera system
            - Redesigned software user experience to introduce more fun
            - Compact form factor
        Launch timeline: Jan 2025
        Target countries: US, France and Japan"""

    create_brief_prompt = f"""Given the following details, create a marketing campaign brief for the new phone launch:

    Sample campaign brief:
    {get_sample_marketing_brief}

    Market research:
    {grounding_market_search}

    New phone details:
    {new_phone_details}"""

    contents = [create_brief_prompt]

    response = client.models.generate_content(
        model=MODEL_ID,
        contents=contents,
        config=GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=MarketingCampaignBrief,),)

    creative_brief = response.text
    creative_brief_json = json.loads(creative_brief)
    print(json.dumps(creative_brief_json, indent=2))
    return create_brief_prompt