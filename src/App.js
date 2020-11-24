import * as React from "react";
import { FlapDisplay, Presets } from "react-split-flap-effect";
import styled, {css } from "styled-components";
import useInterval from "./useInterval";
import "./style.css"

const App = () => {
  const stopId = new URL(window.location).searchParams.get("stop");
  const [busTimetable, setBusTimetable] = React.useState({'buses':[]})
  React.useEffect(()=>{
    getBus(stopId).then(data=>setBusTimetable(data))
  }, [])
  useInterval(()=>{
    getBus(stopId).then(data=>setBusTimetable(data))
  }, 15000)
  if (stopId) {
  return (
    <main>
      {busTimetable.buses.map(bus=><JustifiedBusTime length={50} busTime={bus} />)}
    </main>
  );
  }
  else {
    return(<main>
      <FlapDisplay className="XL" chars={Presets.ALPHANUM} length="50" value="No stop provided" />
    </main>)
  }
}

const JustifiedBusTime = props => {
  const number = props.busTime.number;
  const destination = props.busTime.destination;
  const due = props.busTime.due;
  const spacing = (props.length) - (number.length + destination.length + due.length);
  const shortSpace = (" ").repeat(8)
  const longSpace = (" ").repeat(spacing-shortSpace.length);
  const justifiedValue = `${number}${shortSpace}${destination}${longSpace}${due}`;
  return (
    <FlapDisplay className="XL" chars={Presets.ALPHANUM} padMode="start" length={props.length} value={justifiedValue} />
  )
}

const getBus = async stop => {
    const result = await fetch(`http://127.0.0.1:5000/stop/${stop}`).then(res=>res.json())
    return(result)
}

export default App;
