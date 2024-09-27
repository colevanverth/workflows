"""
Routes for retrieving and making updates to Workflow objects. 
"""

from flask import Blueprint, request, jsonify, g, send_file, abort
from sqlalchemy import select
from datetime import datetime
import os
from celery.result import AsyncResult

from app.models import Workflow
from app.database import db
from app.tasks import execute_workflow
from app.route_wrapper import login_required

workflows = Blueprint("workflows", __name__)


@workflows.get("/workflows")
@login_required
def get_workflows():
    """Retrieve the workflows associated with a user."""

    workflows = db.session.execute(select(Workflow).filter_by(user_id=g.user.id))
    result = []
    for item in workflows.scalars():
        result.append(
            {
                "id": item.id,
                "name": item.name,
                "instructions": item.instructions,
                "updated_at": item.updated_at,
                "created_at": item.created_at,
                "input_file": item.input_file,
            }
        )

    return result


@workflows.get("/workflows/<int:workflow_id>")
@login_required
def get_workflow(workflow_id):
    """Retrieve a workflow of a user given a workflow id, ensuring that they own it."""
    workflow = db.session.get(Workflow, workflow_id)

    # The workflow does not exist or is not owned by the user.
    if workflow is None or workflow.user_id != g.user.id:
        abort(404)

    return {
        "id": workflow.id,
        "name": workflow.name,
        "instructions": workflow.instructions,
        "updated_at": workflow.updated_at,
        "created_at": workflow.created_at,
        "input_file": workflow.input_file,
    }


@workflows.post("/workflows/file/<int:workflow_id>")
@login_required
def upload_file(workflow_id):
    file = request.files.get("file")

    # Ensure the file exists.
    if file is None:
        abort(400)

    # Ensure that the workflow exists and the user owns it.
    workflow = db.session.get(Workflow, workflow_id)
    if workflow is None or workflow.user_id != g.user.id:
        abort(404)

    # Ensure that the file is csv or xlsx.
    filename = file.filename
    if "." not in filename or filename.rsplit(".", 1)[1].lower() not in {"csv", "xlsx"}:
        abort(400)

    # Save the file to disk.
    filepath = os.path.join(os.getcwd(), "files", str(workflow_id))
    file.save(filepath)

    # Update the filename.
    workflow = db.session.get(Workflow, workflow_id)
    workflow.input_file = filename
    workflow.updated_at = datetime.now()
    db.session.commit()
    return "", 200


@workflows.put("/workflows/<int:workflow_id>")
@login_required
def update_workflow(workflow_id):
    """Update a workflow for a user."""

    # Ensure that name and instructions are provided.
    data = request.get_json()
    name = data.get("name")
    instructions = data.get("instructions")
    if name is None or instructions is None:
        abort(400)

    workflow = db.session.get(Workflow, workflow_id)

    # The workflow does not exist or is not owned by the user.
    if workflow is None or workflow.user_id != g.user.id:
        abort(404)

    # Update workflow.
    workflow.name = name
    workflow.instructions = instructions
    workflow.updated_at = datetime.now()
    db.session.commit()
    return "", 200


@workflows.post("/workflows/new")
@login_required
def new_workflow():
    """Create an empty workflow for a user."""
    workflow = Workflow(
        name="",
        instructions="",
        created_at=datetime.now(),
        updated_at=datetime.now(),
        input_file=None,
        user_id=g.user.id,
    )
    db.session.add(workflow)
    db.session.commit()
    return jsonify({"workflow_id": workflow.id})


@workflows.delete("/workflows/<int:workflow_id>")
@login_required
def delete_workflow(workflow_id):
    """ Delete a specified workflow if the user owns it. """ ""
    workflow = db.session.get(Workflow, workflow_id)

    # The workflow does not exist or is not owned by the user.
    if workflow is None or workflow.user_id != g.user.id:
        abort(404)

    db.session.delete(workflow)
    db.session.commit()
    return "", 200


@workflows.post("/workflows/run/<int:workflow_id>")
@login_required
def run_workflow(workflow_id):
    workflow = db.session.get(Workflow, workflow_id)

    # The workflow does not exist or is not owned by the user.
    if workflow is None or workflow.user_id != g.user.id:
        abort(404)

    # Verify that a file is uploaded associated with this workflow.
    input_path = os.path.join(os.getcwd(), "files", str(workflow.id))
    if not os.path.exists(input_path):
        abort(400)

    # Run the workflow and send back the task id.
    output_path = os.path.join(os.getcwd(), "files", str(workflow.id) + "_output.csv")
    res = execute_workflow.delay(workflow.instructions, input_path, output_path)
    return jsonify({"task_id": res.id})


@workflows.get("/workflows/run/<int:workflow_id>")
@login_required
def check_run(workflow_id):
    workflow = db.session.get(Workflow, workflow_id)

    # The workflow does not exist or is not owned by the user.
    if workflow is None or workflow.user_id != g.user.id:
        raise Exception

    # Return the file if the task is complete.
    task_id = request.args.get("task_id")
    result = AsyncResult(task_id)
    if result.ready():
        filepath = result.get()
        return send_file(filepath, download_name="output.csv")
    else:
        abort(502)
