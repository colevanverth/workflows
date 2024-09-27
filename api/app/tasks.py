"""
Tasks to interface with OpenAI to execute the workflows. 
"""

from celery import shared_task
import os
import time

from app.client import client


@shared_task
def execute_workflow(instructions, input_path, output_path):
    # Expose the file to the client.
    file = client.files.create(file=open(input_path, "rb"), purpose="assistants")

    # Create a new thread with the file.
    thread = client.beta.threads.create(
        messages=[
            {
                "role": "user",
                "content": instructions,
                "attachments": [
                    {"file_id": file.id, "tools": [{"type": "code_interpreter"}]}
                ],
            }
        ]
    )

    # Run the thread with pre-determined assistant.
    run = client.beta.threads.runs.create_and_poll(
        thread_id=thread.id,
        assistant_id=os.environ["ASSISTANT_ID"],
        instructions="You are an autonomous assistant that converts an input .csv spreadsheet into an output.csv spreadsheet with the instructions of the user.",  # Redundant but neccesary.
    )

    if run.status == "completed":
        messages = client.beta.threads.messages.list(thread_id=thread.id)
        openai_path = messages.data[0].content[0].text.annotations[0].file_path.file_id
        spreadsheet = client.files.content(openai_path)
        with open(output_path, "wb") as f:
            f.write(spreadsheet.read())
        return output_path
