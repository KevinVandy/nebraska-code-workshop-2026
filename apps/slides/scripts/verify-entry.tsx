import { createRoot } from "react-dom/client"
import { createElement } from "react"
import { App } from "../src/App"

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

function pressKey(key: string) {
  document.body.dispatchEvent(
    new window.KeyboardEvent("keydown", {
      key,
      bubbles: true,
      cancelable: true,
    })
  )
}

function report(label: string) {
  const lis = Array.from(document.querySelectorAll("main li"))
  const hidden = lis.filter((li) => li.classList.contains("bullet-hidden"))
  console.log(
    `${label}: slide=${window.location.hash} lis=${lis.length} hidden=${hidden.length}`
  )
  return { total: lis.length, hidden: hidden.length }
}

export async function run() {
  window.location.hash = "#17" // router overview slide
  const root = createRoot(document.getElementById("root")!)
  root.render(createElement(App))
  await wait(100)

  const initial = report("after mount")
  if (initial.total === 0) {
    console.log("FAIL: no <li> elements rendered on the overview slide")
    return
  }

  pressKey("ArrowRight")
  await wait(100)
  const after1 = report("after ArrowRight x1")

  pressKey("ArrowRight")
  await wait(100)
  const after2 = report("after ArrowRight x2")

  pressKey(".")
  await wait(100)
  const afterAll = report('after "."')

  const revealWorks =
    after1.hidden === initial.total - 1 && after2.hidden === initial.total - 2
  const showAllWorks = afterAll.hidden === 0 && window.location.hash === "#17"
  console.log(
    revealWorks ? "PASS: arrow reveal works" : "FAIL: arrow reveal broken"
  )
  console.log(showAllWorks ? 'PASS: "." reveals all' : 'FAIL: "." broken')
}
