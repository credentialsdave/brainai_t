app.route("/trigger_chatbot_action", methods=["POST"])
def trigger_chatbot_action():
    """
    This endpoint triggers the transfer of STM to LTM automatically when hit.
    """
    # Trigger the transfer_stm_to_ltm function directly
    result = memory_system.transfer_stm_to_ltm("USER_DEEPANSHU_VISHWAKARMA_1")

    return jsonify({"status": "Triggered", "result": result})
