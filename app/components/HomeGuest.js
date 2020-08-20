import React, { useState, useEffect, useContext, useLayoutEffect, useRef } from "react"
import Page from "./Page"
import Axios from "axios"
import { useImmerReducer } from "use-immer"
import { CSSTransition } from "react-transition-group"
import DispatchContext from "../DispatchContext"
import * as am4core from "@amcharts/amcharts4/core"
import * as am4charts from "@amcharts/amcharts4/charts"
import am4themes_animated from "@amcharts/amcharts4/themes/animated"

am4core.useTheme(am4themes_animated)

function HomeGuest() {
  const appDispatch = useContext(DispatchContext)
  const chart = useRef(null)

  const initialState = {
    username: {
      value: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0,
    },
    email: {
      value: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0,
    },
    password: {
      value: "",
      hasErrors: false,
      message: "",
    },
    submitCount: 0,
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "usernameImmediately":
        draft.username.hasErrors = false
        draft.username.value = action.value
        if (draft.username.value.length > 30) {
          draft.username.hasErrors = true
          draft.username.message = "Username cannot exceed 30 characters!"
        }
        if (draft.username.value && !/^([a-zA-Z0-9]+)$/.test(draft.username.value)) {
          draft.username.hasErrors = true
          draft.username.message = "Username can only contain letters and numbers"
        }
        break
      case "usernameAfterDelay":
        if (draft.username.value.length < 3) {
          draft.username.hasErrors = true
          draft.username.message = "Username must be at least 3 characters!"
        }
        if (!draft.hasErrors && !action.noRequest) {
          draft.username.checkCount++
        }
        break
      case "usernameUniqueResults":
        if (action.value) {
          draft.username.hasErrors = true
          draft.username.isUnique = false
          draft.username.message = "That username is already taken!"
        } else {
          draft.username.hasErrors = false
          draft.username.isUnique = true
        }
        break
      case "emailImmediately":
        draft.email.hasErrors = false
        draft.email.value = action.value
        break
      case "emailAfterDelay":
        if (!/^\S+@\S+$/.test(draft.email.value)) {
          draft.email.hasErrors = true
          draft.email.message = "You must provide a valid email address!"
        }
        if (!draft.email.hasErrors && !action.noRequest) {
          draft.email.checkCount++
        }
        break
      case "emailUniqueResults":
        if (action.value) {
          draft.email.hasErrors = true
          draft.email.isUnique = false
          draft.email.message = "Email already exist!"
        } else {
          draft.email.isUnique = true
        }
        break
      case "passwordImmediately":
        draft.password.hasErrors = false
        draft.password.value = action.value
        if (draft.password.value.length > 50) {
          draft.password.hasErrors = true
          draft.password.message = "Password cannot exceed 50 characters!"
        }
        break
      case "passwordAfterDelay":
        if (draft.password.value.length < 12) {
          draft.password.hasErrors = true
          draft.password.message = "Password must be at least 12 characters!"
        }
        break
      case "submitForm":
        if (!draft.username.hasErrors && draft.username.isUnique && !draft.email.hasErrors && draft.email.isUnique && !draft.password.hasErrors) {
          draft.submitCount++
        }
        break
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  useEffect(() => {
    if (state.username.value) {
      const delay = setTimeout(() => dispatch({ type: "usernameAfterDelay" }), 800)
      return () => clearTimeout(delay)
    }
  }, [state.username.value])

  useEffect(() => {
    if (state.email.value) {
      const delay = setTimeout(() => dispatch({ type: "emailAfterDelay" }), 800)
      return () => clearTimeout(delay)
    }
  }, [state.email.value])

  useEffect(() => {
    if (state.password.value) {
      const delay = setTimeout(() => dispatch({ type: "passwordAfterDelay" }), 800)
      return () => clearTimeout(delay)
    }
  }, [state.password.value])

  useEffect(() => {
    if (state.username.checkCount) {
      const ourRequest = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post("/doesUsernameExist", { username: state.username.value }, { cancelToken: ourRequest.token })
          dispatch({ type: "usernameUniqueResults", value: response.data })
        } catch (error) {
          console.log("Search Request Cancelled: " + error)
        }
      }
      fetchResults()
      return () => ourRequest.cancel()
    }
  }, [state.username.checkCount])

  useEffect(() => {
    if (state.email.checkCount) {
      const ourRequest = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post("/doesEmailExist", { email: state.email.value }, { cancelToken: ourRequest.token })
          dispatch({ type: "emailUniqueResults", value: response.data })
        } catch (error) {
          console.log("Search Request Cancelled: " + error)
        }
      }
      fetchResults()
      return () => ourRequest.cancel()
    }
  }, [state.email.checkCount])

  useEffect(() => {
    if (state.submitCount) {
      const ourRequest = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post("/Register", { username: state.username.value, email: state.email.value, password: state.password.value }, { cancelToken: ourRequest.token })
          appDispatch({ type: "login", data: response.data })
          appDispatch({ type: "flashMessage", value: "Congrats! Welcome to your new account!" })
        } catch (error) {
          console.log("Could noe register user: " + error)
        }
      }
      fetchResults()
      return () => ourRequest.cancel()
    }
  }, [state.submitCount])

  useEffect(() => {
    // Create chart
    var chart = am4core.create("chartdiv", am4charts.XYChart)
    var watermark = new am4core.Label()
    chart.padding(0, 15, 0, 15)

    var ticker = "TSLA"
    //curl "https://www.quandl.com/api/v3/datasets/WIKI/FB.csv?column_index=4&start_date=2014-01-01&end_date=2014-12-31&collapse=monthly&transform=rdiff&api_key=YOURAPIKEY
    // Load data '         "https://www.quandl.com/api/v3/datasets/WIKI/FB/data.csv?api_key=YOURAPIKEY"'
    chart.dataSource.url = `https://www.quandl.com/api/v3/datasets/WIKI/${ticker}.csv?start_date=2018-01-01&end_date=2020-08-19&api_key=${process.env.QUANDL_API_TOKEN}`
    chart.dataSource.parser = new am4core.CSVParser()
    chart.dataSource.parser.options.useColumnNames = true
    chart.dataSource.parser.options.reverse = true

    // the following line makes value axes to be arranged vertically.
    chart.leftAxesContainer.layout = "vertical"

    // uncomment this line if you want to change order of axes
    //chart.bottomAxesContainer.reverseOrder = true;

    var dateAxis = chart.xAxes.push(new am4charts.DateAxis())
    dateAxis.renderer.grid.template.location = 0
    dateAxis.renderer.ticks.template.length = 8
    dateAxis.renderer.ticks.template.strokeOpacity = 0.1
    dateAxis.renderer.grid.template.disabled = true
    dateAxis.renderer.ticks.template.disabled = false
    dateAxis.renderer.ticks.template.strokeOpacity = 0.2
    dateAxis.renderer.minLabelPosition = 0.01
    dateAxis.renderer.maxLabelPosition = 0.99
    dateAxis.keepSelection = true
    dateAxis.minHeight = 30

    dateAxis.groupData = true
    dateAxis.minZoomCount = 5

    // these two lines makes the axis to be initially zoomed-in
    // dateAxis.start = 0.7;
    // dateAxis.keepSelection = true;

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis())
    valueAxis.tooltip.disabled = true
    valueAxis.zIndex = 1
    valueAxis.renderer.baseGrid.disabled = true
    // height of axis
    valueAxis.height = am4core.percent(65)

    valueAxis.renderer.gridContainer.background.fill = am4core.color("#000000")
    valueAxis.renderer.gridContainer.background.fillOpacity = 0.05
    valueAxis.renderer.inside = true
    valueAxis.renderer.labels.template.verticalCenter = "bottom"
    valueAxis.renderer.labels.template.padding(2, 2, 2, 2)

    //valueAxis.renderer.maxLabelPosition = 0.95;
    valueAxis.renderer.fontSize = "0.8em"

    var series = chart.series.push(new am4charts.CandlestickSeries())
    series.dataFields.dateX = "Date"
    series.dataFields.openValueY = "Open"
    series.dataFields.valueY = "Close"
    series.dataFields.lowValueY = "Low"
    series.dataFields.highValueY = "High"
    series.clustered = false
    series.tooltipText = "open: {openValueY.value}\nlow: {lowValueY.value}\nhigh: {highValueY.value}\nclose: {valueY.value}"
    series.name = "MSFT"

    series.opacity = 0.5
    series.defaultState.transitionDuration = 1
    var fillModifier = new am4core.LinearGradientModifier()
    fillModifier.opacities = [1, 0]
    fillModifier.offsets = [0, 1]
    fillModifier.gradient.rotation = 90
    series.fillModifier = fillModifier

    chart.cursor = new am4charts.XYCursor()

    var scrollbarX = new am4charts.XYChartScrollbar()

    var sbSeries = chart.series.push(new am4charts.LineSeries())
    sbSeries.dataFields.valueY = "Close"
    sbSeries.dataFields.dateX = "Date"
    scrollbarX.series.push(sbSeries)
    sbSeries.disabled = true
    scrollbarX.marginBottom = 20
    chart.scrollbarX = scrollbarX
    scrollbarX.scrollbarChart.xAxes.getIndex(0).minHeight = undefined

    watermark.text = ticker
    watermark.toFront()
    chart.plotContainer.children.push(watermark)
    watermark.fontSize = 120
    watermark.opacity = 0.2
    watermark.align = "center"
    watermark.valign = "middle"

    return () => {
      x.dispose()
    }
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    dispatch({ type: "usernameImmediately", value: state.username.value })
    dispatch({ type: "uusernameAfterDelay", value: state.username.value, noRequest: true })
    dispatch({ type: "emailImmediately", value: state.email.value })
    dispatch({ type: "emailAfterDelay", value: state.email.value, noRequest: true })
    dispatch({ type: "passwordImmediately", value: state.password.value })
    dispatch({ type: "passwordAfterDelay", value: state.password.value })
    dispatch({ type: "submitForm" })
    /*  try {
      await Axios.post("/register", { username: username, email, password })
      console.log("User was successfully created!")
    } catch (error) {
      console.log("Failed to reigster user: " + error)
    }*/
  }

  return (
    <Page title="Home" wide={true}>
      <div className="row align-items-center">
        <div className="col-lg-7 py-3 py-md-5">
          <h1 className="display-3">Welcome!!</h1>
          <div id="chartdiv" style={{ width: "100%", height: "450px" }}></div>
        </div>
        <div className="col-lg-5 pl-lg-5 pb-3 py-lg-5">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username-register" className="text-muted mb-1">
                <small>Username</small>
              </label>
              <input onChange={(e) => dispatch({ type: "usernameImmediately", value: e.target.value })} id="username-register" name="username" className="form-control" type="text" placeholder="Pick a username" autoComplete="off" />
              <CSSTransition in={state.username.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.username.message}</div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="email-register" className="text-muted mb-1">
                <small>Email</small>
              </label>
              <input onChange={(e) => dispatch({ type: "emailImmediately", value: e.target.value })} id="email-register" name="email" className="form-control" type="text" placeholder="you@example.com" autoComplete="off" />
              <CSSTransition in={state.email.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.email.message}</div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="password-register" className="text-muted mb-1">
                <small>Password</small>
              </label>
              <input onChange={(e) => dispatch({ type: "passwordImmediately", value: e.target.value })} id="password-register" name="password" className="form-control" type="password" placeholder="Create a password" />
              <CSSTransition in={state.password.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.password.message}</div>
              </CSSTransition>
            </div>

            <button type="submit" className="py-3 mt-4 btn btn-lg btn-success btn-block">
              Sign up
            </button>
          </form>
        </div>
      </div>
    </Page>
  )
}
export default HomeGuest
