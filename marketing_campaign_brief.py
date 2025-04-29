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
    isAboutLaunch: bool

client = get_gen_ai_client()
MODEL_ID = "gemini-2.0-flash-001"
creative_brief_json = {}
creative_brief = ""

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
    return sample_marketing_brief



def print_grounding_response(response):
    """Prints Gemini response with grounding citations."""
    if(len(response.candidates) < 1):
        return ""
    
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



def grounding_market_search(prompt):
    global client
    global creative_brief_json
    global creative_brief

    # Use Grounding with Google Search to do market research
    market_research_prompt = """
        I am planning to launch a campaign for {prompt} and I want to understand the latest trends that industry.
        Please answer the following questions:
        - What are the latest trends regarding this product?
        - What is the general public sentiment about the product?
    """

    contents = [market_research_prompt]

    google_search_tool = Tool(google_search=GoogleSearch())

    response = client.models.generate_content(
        model=MODEL_ID,
        contents=contents,
        config=GenerateContentConfig(tools=[google_search_tool]),
    )
    # print_grounding_response(response)
    return response.text


def generate_marketing_brief(prompt):

    global client 
    global creative_brief_json
    global creative_brief

    market_research = grounding_market_search(prompt=prompt)

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

    create_brief_prompt = f"""Given the following details, create a marketing campaign brief for {prompt}: Set isAboutLaunch to true when the prompt is related to product launch and false is not related.

    Sample campaign brief:
    {get_sample_marketing_brief}

    Market research:
    {market_research}"""

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
    return creative_brief


class AdCopy(BaseModel):
    ad_copy_options: list[str]
    localization_notes: list[str]
    visual_description: list[str]


def generate_ad_copy():
    ad_copy_prompt = f"""
    Given the marketing campaign brief, create an Instagram ad-copy for each target market: {creative_brief_json["target_countries"]}
    Please localize the ad-copy and the visuals to the target markets for better relevancy to the target audience.
    Marketing Campaign Brief:
    {creative_brief}
    """

    contents = [ad_copy_prompt]

    response = client.models.generate_content(
        model=MODEL_ID,
        contents=contents,
        config=GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=AdCopy,
        ),
    )

    ad_copy = response.text
    ad_copy_json = json.loads(ad_copy)
    ##print(json.dumps(ad_copy_json, indent=2, ensure_ascii=False))
    return ad_copy


class AiAction(BaseModel):
    actions: list[str]

def detect_ai_action(prompt):
    global client 

    detect_ai_action_prompt = f"""
        You are an assistant designed to detect specific AI actions based on text.
        Given the following available actions:
        - "launch strategy" → action: "product_launch"
        - "ad copy" → action: "generate_ad_copy"
        - "short video" → action: "generate_short_video"
        - "how are you" → action: "pleasanties"
        - "What is your name" → action: "pleasanties"
        - "social media channel" → action: "find_social_channels"
        - "trends" → action: "generate_trends",
        - "ideas" → action: "general"
        - "just any kind of message" → action: "general"

        Instructions:
            - Read the input text carefully.
            - Detect which keywords or phrases match any of the actions.
            - Return a list of actions in JSON format, e.g. ["plan_launch", "generate_ad_copy"].


        Input Text:
        {prompt}    
            
        """

    response = client.models.generate_content(
        model=MODEL_ID,
        contents=detect_ai_action_prompt,
        config=GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=AiAction,),)
    
    action_json = json.loads(response.text)
    print(action_json)

    ai_response = handle_prompt(action_json["actions"][0], prompt=prompt)

    return ai_response

class AiResponse(BaseModel):
    response: str

def generate_general_prompt(prompt):
    global client 

    detect_ai_action_prompt = f"""
        You are an assistant designed to help content marketers generate marketing ideas.

         campaign creative brief:
        {creative_brief}
        
        Input Text:
        {prompt}    
            
        """
    response = client.models.generate_content(
        model=MODEL_ID,
        contents=detect_ai_action_prompt,
        config=GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=AiResponse,),)
    
    action_json = json.loads(response.text)
    print(action_json)
    
    return response.text

class AiTrendResponse(BaseModel):
    response: list[str]

def generate_trends(prompt):
    global client 
    global creative_brief

    detect_ai_action_prompt = f"""
       You are an AI assistant specialized in helping content marketers search and extract relevant links from the internet based on a provided marketing campaign creative. Your goal is to find websites, articles, resources, and references that align closely with the campaign’s theme, audience, and objectives. Return a curated list of high-quality links that marketers can use for inspiration, partnerships, or promotional activities.

        instructions:
            - It should scrap the web for links to relation post, articles  website like, e.g. www.techcrunch.com, https://techcabal.com, https://www.theverge.com/tech
            - Return a list of actions in JSON format, e.g. ["https://www.byteplus.com/en/topic/407051", "https://everphone.com/en/blog/generative-ki-smartphones-2025/"]

        campaign creative brief:
        {creative_brief}

        Input Text:
        {prompt}    
            
        """
    response = client.models.generate_content(
        model=MODEL_ID,
        contents=detect_ai_action_prompt,
        config=GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=AiTrendResponse,),)
    
    action_json = json.loads(response.text)
    print(action_json)
    
    return response.text

def handle_prompt(action, prompt):
    match action:
        case "product_launch":
            return {"action": action, "response": json.loads(generate_marketing_brief(prompt=prompt))}
        case "generate_ad_copy":
            return {"action": action, "response": json.loads(generate_ad_copy())}
        case "pleasanties":
            return {"action": "general", "response": json.loads(generate_general_prompt(prompt=prompt))["response"] }
        case "generate_trends":
            return {"action": "generate_trends", "response": json.loads(generate_trends(prompt=prompt))["response"] }
        case _:
            return {"action": "general", "response": json.loads(generate_general_prompt(prompt=prompt))["response"] }
     


