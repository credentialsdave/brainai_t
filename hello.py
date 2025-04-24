

from layers.nlu_primary import nlu_primary
from layers.memory_system import memory_system
from layers.nlu_secondary import nlu_secondary
from layers.nlg_primary import nlg_primary  # Updated NLG with system command execution
from layers.response_refinement import response_refinement
from layers.self_analyses import TaskReasoner
#from layers.feedback_system import feedback_system
fgh = TaskReasoner()

import json
import sqlite3
from layers.feedback_system import FeedbackManager

manager = FeedbackManager()
user_id = "USER_DEEPANSHU_VISHWAKARMA_1"
input_text = "how does india won from east india company and mars is a red planet so how can we drinkm waterfrom plastic water bottle"
analysis = nlu_primary.analyze(input_text)
memory_system.transfer_stm_to_ltm(user_id)
f = nlu_secondary.refine_analysis(user_id, analysis,memory_system.get_stm_memory, memory_system.get_ltm_context(user_id))
s = nlu_secondary.extract_feedback_from_response(f)
t = nlu_secondary.feedback_analyser(user_id, s)
manager.store_feedback(nlu_secondary.extract_feedback_data_detected_feedback(t), nlu_secondary.extract_feedback_data_summary(t), nlu_secondary.extract_feedback_data_layer_tags(t), nlu_secondary.extract_feedback_data_user_suggestion(t))
ghh=fgh.think_and_assign(f)
lkj=fgh.execute_tasks(ghh)

ccc = nlg_primary.generate_response(f,lkj,input_text)
ggg = response_refinement.refine_output(ccc, input_text)
print(ggg)
