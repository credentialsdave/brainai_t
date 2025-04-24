import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from layers.nlu_primary import nlu_primary
from layers.memory_system import memory_system
from layers.nlu_secondary import nlu_secondary
from layers.nlg_primary import nlg_primary  # Updated NLG with system command execution
from layers.response_refinement import response_refinement
from layers.feedback_system import FeedbackManager
from layers.self_analyses import TaskReasoner
#from layers.feedback_system import feedback_system
fgh = TaskReasoner()
feedbackmng= FeedbackManager()

app = Flask(__name__)
CORS(app)

# logging.basicConfig(level=logging.DEBUG, format="%(levelname)s: %(message)s")

def chatbot_pipeline(user_id, text):
    """Processes user input through the chatbot layers and decides on a response."""
    # logging.debug(f"Received input: {text}")
    
    analysis = nlu_primary.analyze(text)
    id = memory_system.store_in_stm(user_id, text, analysis)
    #memory_system.transfer_stm_to_ltm(user_id)
    
    refined_analysis = nlu_secondary.refine_analysis(user_id, analysis,memory_system.get_stm_memory(user_id), memory_system.get_ltm_context(user_id))
    s = nlu_secondary.extract_feedback_from_response(refined_analysis)
    t = nlu_secondary.feedback_analyser(user_id, s)
    feedbackmng.store_feedback(nlu_secondary.extract_feedback_data_detected_feedback(t), nlu_secondary.extract_feedback_data_summary(t), nlu_secondary.extract_feedback_data_layer_tags(t), nlu_secondary.extract_feedback_data_user_suggestion(t))
    ghh=fgh.think_and_assign(refined_analysis)
    lkj=fgh.execute_tasks(ghh)

    # Store feedback in feedback storage
    response = nlg_primary.generate_response(refined_analysis,"here no data present", text)  # Handles both chatbot & system commands
    
    final_response = response_refinement.refine_output(response, text)
    memory_system.update_stm_with_output(id, final_response)
    # Speak the final response

    return final_response
    

@app.route("/chat", methods=["POST"])
def chat():
    """Handles chatbot requests from the frontend."""
    data = request.get_json()
    user_text = data.get("text", "").strip()

    if not user_text:
        return jsonify({"error": "No input provided"}), 400

    response = chatbot_pipeline("USER_DEEPANSHU_VISHWAKARMA_1", user_text)
    return jsonify({"response": response})

@app.route("/trigger_chatbot_action", methods=["POST"])
def trigger_chatbot_action():
    """
    This endpoint triggers the transfer of STM to LTM automatically when hit.
    """
    # Trigger the transfer_stm_to_ltm function directly
    result = memory_system.transfer_stm_to_ltm("USER_DEEPANSHU_VISHWAKARMA_1")

    return jsonify({"status": "Triggered", "result": result})


if __name__ == "__main__":
    app.run(port=5000, debug=True)
