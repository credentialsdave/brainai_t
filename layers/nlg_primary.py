import google.generativeai as genai
import subprocess
from config import GENAI_MODEL_NAME, GENAI_MAX_TOKENS, GENAI_TEMPERATURE



class NLGPrimary:
    def __init__(self):
        self.model = genai.GenerativeModel(GENAI_MODEL_NAME)

    def is_system_command(self, user_request):
        """Determines whether the input requires execution or is a normal conversation."""
        system_prompt = f"""
        Classify the user request into one of the following categories:
        - "SYSTEM_COMMAND" → If the request requires executing a Python script (e.g., file operations, network tasks, automation).
        - "CHAT_RESPONSE" → If the request is a general chatbot conversation.

        User Request: "{user_request}"

        Return only the classification (either "SYSTEM_COMMAND" or "CHAT_RESPONSE").
        """

        try:
            response = self.model.generate_content(system_prompt, generation_config=genai.GenerationConfig(
                max_output_tokens=5, temperature=0
            ))
            classification = response.text.strip()

            return classification == "SYSTEM_COMMAND"

        except Exception as e:
            return False  # Default to chatbot response on error

    def generate_code_for_task(self, analysis):
        """Generates Python code based on structured task analysis."""
        tasks = analysis
        if not tasks:
            return "No executable tasks found."

        #task_description = tasks[0].get("description", "")

        system_prompt = f"""
        Generate a fully functional Python script to execute complete the following task as promt for it :
        "{tasks}"
        The script should be self-contained, with necessary imports and no user input required.
        
        Return only the Python code.
        """

        try:
            response = self.model.generate_content(system_prompt, generation_config=genai.GenerationConfig(
                max_output_tokens=1500,
                temperature=GENAI_TEMPERATURE,
            ))
            code = response.text.strip().replace("```python", "").replace("```", "").strip()
            return code
        except Exception as e:
            return f"Code Generation Error: {e}"


    def execute_generated_code(self, code):
        """Executes the generated Python code and returns the output."""
        try:
            script_filename = "generated_script.py"
            with open(script_filename, "w") as f:
                f.write(code)

            result = subprocess.run(["python", script_filename], capture_output=True, text=True)
            return result.stdout.strip() if result.stdout else "Script executed successfully."

        except Exception as e:
            return f"Execution Error: {str(e)}"

    def generate_response(self, refined_analysis, taskexecuted,input_text):
        """Decides whether to generate a chatbot response or execute system commands."""
        user_text = refined_analysis

        if self.is_system_command(user_text):
            code = self.generate_code_for_task(user_text)
            output = self.execute_generated_code(code)
            return f" **Command Executed Successfully!**\n\n```python\n{code}\n```\n**Output:**\n{output}"

        # If it's a chatbot request, generate a response as usual
        
        system_prompt = f"""
        You are a chatbot that mimics the user's emotional tone and context.
        Your task is to generate a human-like response based on the following information:
        
        1. Refined NLU Analysis (Intent, Emotion, and Contextual Insights):
        {refined_analysis}
        
        2. The Original User Input (Their Message):
        {input_text}
        
        3. Information about Executed Tasks:
        {taskexecuted}
        
        Generate a response that:
        - Matches the user's emotional tone (as indicated in the refined analysis).
        - Addresses the task information if applicable.
        - Simulates human-like conversation, maintaining context and showing empathy if necessary.
        - Provides a smooth, contextually aware answer, whether the tasks were successfully executed or there's still a need for further input.
        
        The response should sound as natural and human-like as possible, aligning with the user's tone and situation.
        Response:
        """


        try:
            response = self.model.generate_content(system_prompt, generation_config=genai.GenerationConfig(
                max_output_tokens=GENAI_MAX_TOKENS,
                temperature=GENAI_TEMPERATURE,
            ))
            response_text = response.text.strip().replace("```json", "").replace("```", "").strip()
            return response_text

        except Exception as e:
            return f"NLG Primary Error: {e}"

nlg_primary = NLGPrimary()
