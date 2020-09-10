import React from "react"
import Page from "./Page"
import { GitHubIcon } from "../components/icons"

function About() {
  return (
    <Page title="About Us">
      <div className="text-center mt-5">
        <h1>About</h1>

        <p>
          This project was built for practice purposes using <strong>Context API</strong> by React.
          <br />
          This app is using websocket for chat feature, and allow users to create post and do search.
        </p>
        <p className="lead text-muted">This website is hosted with Azure Static Website</p>
        <p> It connects to a MongoDB to save user and post information</p>

        <a className="btn btn-primary" href="https://github.com/leanback2020/azure-react-userinteraction">
          <GitHubIcon width={"18px"} /> <span className="ml-2 mr-4">Visit Repo</span>
        </a>
      </div>
    </Page>
  )
}

export default About
