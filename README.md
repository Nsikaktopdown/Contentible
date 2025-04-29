# 🧠 Content Marketing Assets Generator AI Bot

A powerful AI-driven assistant that helps marketers generate **content marketing assets** (headlines, blog outlines, hashtags, links, and more) using **Vertex AI + Gemini 2.0 Flash**. This project features a **Python-based backend** powered by **Google Cloud's VertexAI** and a **Next.js frontend** for a seamless user experience.

---

## 🚀 Features

- ✨ Generate content assets from campaign briefs or product descriptions
- 🌐 Web-based interface built with **Next.js**
- 🤖 Fast, context-aware responses via **Gemini 2.0 Flash**
- 🔗 Keyword and link extraction support for campaign research
- 🧩 Modular backend with clean Python implementation
- ☁️ Deployed with **Google Cloud Vertex AI**

---

## 🏗️ Tech Stack

| Layer      | Tech                    |
|------------|-------------------------|
| Backend    | Python, Vertex AI SDK, Gemini 2.0 Flash |
| Frontend   | Next.js (React + Tailwind) |
| AI + Hosting    | Google Cloud (Vertex AI + GCP Storage) |


---

## How to run

### Backend
1. setup vritual environment for the python application

```python

    pip install virtualenv
    virtualenv my_env # create a virtual environment named my_env
    source my_env/bin/activate # activate my_env

```
2. Set the following environment variables
```python

    os.environ["GOOGLE_CLOUD_PROJECT"] = "YOUR_GCP_PROJECT_ID"
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "YOUR_CREDENTIAL.json"

```

3. Install all dependencies

```python

    pip install -r requirements.txt

```


## Frontend
1. Install NPM packages

```javascript

    npm install

```    

2. Run the application

```javascript

    npm run dev

``` 

___