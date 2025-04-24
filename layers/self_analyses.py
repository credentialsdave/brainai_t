import google.generativeai as genai
import requests
from config import GENAI_MODEL_NAME, GENAI_MAX_TOKENS, GENAI_TEMPERATURE
import json

class TaskReasoner:
    def __init__(self):
        self.model = genai.GenerativeModel(GENAI_MODEL_NAME)

    def _generate(self, system_prompt):
        try:
            response = self.model.generate_content(
                system_prompt,
                generation_config=genai.GenerationConfig(
                    max_output_tokens=GENAI_MAX_TOKENS,
                    temperature=GENAI_TEMPERATURE
                )
            )
            response_text = response.text.strip() if hasattr(response, "text") else ""
            response_text = response_text.replace("```json", "").replace("```", "").strip()
            return response_text
        except Exception as e:
            return f"Gemini Error: {str(e)}"
        

    
       

    def think_and_assign(self, refined_nlu_data):
        prompt = f"""
        [🧠 Task Planner + Handler Assigner]

        🎯 Goal:
        - Analyze the refined NLU data.
        - Group related intents.
        - Decide how each task should be executed.
        - Assign Gemini handler prompts and acknowledgements.

        ✨ Available execution methods:
        - "internal" → Use Gemini generate with handler prompt
        - "factual_memory" → Use factual memory API
        - "knowledge_base" → Use internet/web search API

        🧠 Input:
        Refined NLU: {refined_nlu_data}

        📤 Output JSON:
        ```Return only valid JSON in the following format. Do NOT include markdown (no ```json or explanations)
        {{
            "execution_plan": [
                {{
                    "group": "<group name>",
                    "intents": [
                        {{
                            "intent": "<name>",
                            "method": "internal | factual_memory | knowledge_base",
                            "details": "<extra info>",
                            "handler_prompt": "<Gemini instruction>",
                            "acknowledgement_message": "<what to say after success>"
                        }}
                    ]
                }}
            ]
        }}
        ```
        """
        RAW= self._generate(prompt)
        cleaned = RAW.replace("```json", "").replace("```", "").strip()
        try:
            parsed= json.loads(cleaned)
            return parsed
        except json.JSONDecodeError:
            return {"error": "Failed to decode the response text into JSON."}
        except Exception as e:
            return {"error": str(e)}
    def execute_tasks(self, execution_plan_obj):
        results = []

        for group in execution_plan_obj.get("execution_plan", []):
            for intent_data in group.get("intents", []):
                intent = intent_data.get("intent")
                method = intent_data.get("method")
                details = intent_data.get("details", "")
                handler_prompt = intent_data.get("handler_prompt", "")
                acknowledgement = intent_data.get("acknowledgement_message", "")

                try:
                    # 1. Gemini-based Internal Handler
                    if method == "internal":
                        output = self._generate(handler_prompt)
                        results.append({
                            "intent": intent,
                            "status": "success",
                            "acknowledgement": acknowledgement or "✅ Gemini internal task completed.",
                            "final_text_output": output
                        })

                    # 2. Factual Memory API Call
                    elif method == "factual_memory":
                        response = requests.post("http://localhost:8000/api/factual_memory", json={"query": details})
                        response.raise_for_status()
                        results.append({
                            "intent": intent,
                            "status": "success",
                            "acknowledgement": acknowledgement or "📦 Factual memory retrieved.",
                            "final_text_output": response.json()
                        })

                    # 3. Knowledge Base / Web Search API
                    elif method == "knowledge_base":
                        response = requests.post("http://localhost:8000/api/knowledge_base", json={"query": details})
                        response.raise_for_status()
                        results.append({
                            "intent": intent,
                            "status": "success",
                            "acknowledgement": acknowledgement or "🌐 Knowledge base accessed.",
                            "final_text_output": response.json()
                        })

                    else:
                        raise ValueError(f"Unknown method: {method}")

                except Exception as e:
                    results.append({
                        "intent": intent,
                        "status": "failed",
                        "acknowledgement": f"❌ Error during task execution: {str(e)}",
                        "final_text_output": ""
                    })

        return {"task_results": results}

taskReasoner = TaskReasoner()