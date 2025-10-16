import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "column"]

  connect() {
    this.token = document.querySelector("meta[name=csrf-token]").content
    this.enableDragAndDrop()
  }

  create(event) {
    event.preventDefault()
    const title = this.inputTarget.value.trim()
    if (title === "") return

    fetch("/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": this.token,
        "Accept": "application/json"
      },
      body: JSON.stringify({ task: { title: title } })
    })
      .then(res => res.json())
      .then((task) => {
        const todoCol = this.columnTargets.find(c => c.dataset.status === "todo")
        todoCol.insertAdjacentHTML("beforeend", `<div class="task" draggable="true" data-id="${task.id}">${task.title}</div>`)
        this.inputTarget.value = ""
        this.enableDragAndDrop()
      })
  }

  enableDragAndDrop() {
    this.element.querySelectorAll(".task").forEach(task => {
      task.addEventListener("dragstart", e => e.dataTransfer.setData("id", task.dataset.id))
    })
    this.columnTargets.forEach(col => {
      col.addEventListener("dragover", e => e.preventDefault())
      col.addEventListener("drop", e => this.drop(e, col))
    })

  }

  drop(event, column) {
    const id = event.dataTransfer.getData("id")
    const task = this.element.querySelector(`[data-id='${id}']`)
    column.appendChild(task)

    fetch(`/tasks/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": this.token,
        "Accept": "application/json"
      },
      body: JSON.stringify({ task: { status: column.dataset.status } })
    })
  }
}
