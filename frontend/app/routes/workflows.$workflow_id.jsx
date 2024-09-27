/**
 * Display an edit menu for a workflow.
 */

import { useLoaderData, Form, useFetcher } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";

import Button from "../components/button";
import Alert from "../components/alert";
import { getSession } from "../components/sessions";

// Fetch the workflow.
export const loader = async ({ params, request }) => {
  const session_token = (await getSession(request.headers.get("Cookie"))).get(
    "session_token"
  );
  const res = await fetch(
    process.env.API_URL + "/workflows/" + params.workflow_id,
    {
      headers: {
        Authorization: `Bearer ${session_token}`,
      },
    }
  );
  const data = await res.json();
  return { workflow: data };
};

export default function Workflow() {
  const fetcher = useFetcher();
  const { workflow } = useLoaderData();

  const [alert, setAlert] = useState(false);
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");

  const fileLoader = useRef(null);

  // Remove the workflow alert.
  useEffect(() => {
    let timer;
    if (alert) {
      timer = setTimeout(() => {
        setAlert(false);
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [alert]);

  // Trigger a file upload.
  const handleClick = () => {
    fileLoader.current.click();
  };

  // Auto-save the workflow.
  useEffect(() => {
    const timer = setTimeout(() => {
      save();
    }, 500);
    return () => clearTimeout(timer);
  }, [name, instructions]);

  // Load loader information.
  useEffect(() => {
    setName(workflow.name);
    setInstructions(workflow.instructions);
  }, [workflow]);

  // Trigger a workflow run and enable the alert.
  const handleRun = async (e) => {
    setAlert(true);
    const resp = await fetch("/workflows/run/" + workflow.id, {
      method: "POST",
    });
    const data = await resp.json();
    const task_id = data.task_id;
    checkRun(task_id);
  };

  // Periodically check if the workflow has completed to download the output.
  const checkRun = (task_id) => {
    const timerId = setInterval(async () => {
      const response = await fetch(
        "/workflows/run/" + workflow.id + "?task_id=" + task_id,
        {
          method: "GET",
        }
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `output.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        clearInterval(timerId);
      }
    }, 2000);
  };

  // Printable workflow save time.
  const printSaveTime = () => {
    const updatedDate = new Date(workflow.updated_at);
    updatedDate.setHours(updatedDate.getHours() + 7);
    return updatedDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Save the workflow.
  const save = () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("instructions", instructions);
    fetcher.submit(formData, {
      method: "PUT",
      action: "/workflows/save/" + workflow.id,
    });
  };

  // Upload a file to the workflow.
  const handleUpload = (e) => {
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    fetcher.submit(formData, {
      method: "POST",
      action: "/workflows/file/" + workflow.id,
      encType: "multipart/form-data",
    });
  };

  return (
    <div className="workflows__body__display">
      <div className="workflows__body__top">
        <div className="workflows__body__info">
          <h2> Edit Workflow </h2>
          <a className="workflow__saved">Saved: {printSaveTime()}</a>
        </div>
        <div className="workflows__body__actions">
          <div className="workflow__actions">
            <Button label="Run" icon="run" color={true} onClick={handleRun} />
          </div>
          <div className="workflow__actions">
            <Form action={`/workflows/delete/${workflow.id}`} method="post">
              <Button label="" icon="trash" color={false} />
            </Form>
          </div>
        </div>
      </div>
      <Form action="/workflows" className="workflow__form">
        <div className="workflow__form__name">
          <label htmlFor="name">NAME</label>
          <input
            type="text"
            className="workflow__form__input"
            value={name}
            placeholder="My Workflow"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="workflow__form__file">
          <label htmlFor="file">FILE</label>
          <label
            htmlFor="file-upload"
            onClick={handleClick}
            className={
              workflow.input_file
                ? "workflow__form__file__done"
                : "workflow__form__file__upload"
            }
          >
            {workflow.input_file ? workflow.input_file : "Upload File"}
          </label>
          <input
            type="file"
            ref={fileLoader}
            onChange={(e) => handleUpload(e)}
          />
        </div>
        <div className="workflow__form__instructions">
          <label htmlFor="instructions">INSTRUCTIONS</label>
          <textarea
            className="workflow__form__input"
            value={instructions}
            placeholder="Convert all the text to lowercase."
            onChange={(e) => setInstructions(e.target.value)}
            rows={16}
          ></textarea>
        </div>
        {alert && <Alert message="Running workflow!" color="purple" />}
      </Form>
    </div>
  );
}
