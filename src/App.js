import * as React from "react";
import { FlapDisplay, Presets } from "react-split-flap-effect";
import styled, {css } from "styled-components";
import useInterval from "./useInterval";
import useOnline from "./useOnline";
import "./style.css"

const timeDisplayOptions = {
  hour: "numeric",
  minute: "numeric",
  timeZone: "Europe/London",
  hour12: true,
}

const getCurrentTime = displayOptions => {
  const date = new Date();
  return new Intl.DateTimeFormat("en-GB", displayOptions).format(date);
}

const App = () => {
  const stopId = new URL(window.location).searchParams.get("stop");
  const [busTimetable, setBusTimetable] = React.useState({'buses':[]})
  const [currentTime, setCurrentTime] = React.useState(getCurrentTime(timeDisplayOptions))
  const [currentWeather, setCurrentWeather] = React.useState({})
  const onlineStatus = useOnline();
  React.useEffect(()=>{
    if (onlineStatus) {
      getBus(stopId).then(data=>setBusTimetable(data))
      getWeather(stopId).then(data=>setCurrentWeather(data))
  }
  }, [onlineStatus])
  useInterval(()=> {
    getBus(stopId).then(data=>setBusTimetable(data))
  }, 15000)
  useInterval(() => {
    getWeather(stopId).then((data) => setCurrentWeather(data));
  }, 1800000);
  useInterval(()=> {
    setCurrentTime(getCurrentTime(timeDisplayOptions))
  }, 1000)
  if (stopId) {
  return (
    <main>
      <FlapDisplay
        className="M"
        chars={Presets.ALPHANUM}
        padMode="start"
        length={8}
        value={currentTime}
      />
      <div className="times">
        {busTimetable.buses.map((bus) => (
          <JustifiedBusTime length={18} busTime={bus} />
        ))}
      </div>
      <DataWrapper className="weather" gap="5vw">
          <Wind speed={currentWeather.windSpeed || 0} bearing={currentWeather.windBearing || 0} width="2.5vw" />
          <Weather forecast={currentWeather.forecast || ""} temperature={currentWeather.temperature || 0} width="2.5vw" />
      </DataWrapper>
    </main>
  );
  }
  else {
    return(<main>
      <FlapDisplay className="XL" chars={Presets.ALPHANUM} length={20} value="No stop provided" />
    </main>)
  }
}

const JustifiedBusTime = props => {
  const number = props.busTime.number;
  const due = props.busTime.due;
  const spacing = (props.length) - (number.length + due.length);
  const shortSpace = (" ").repeat(4)
  const longSpace = (" ").repeat(spacing-shortSpace.length);
  const justifiedValue = `${number}${shortSpace}${longSpace}${due}`;
  return (
    <FlapDisplay className="XL" chars={Presets.ALPHANUM} padMode="start" length={props.length} value={justifiedValue} />
  )
}

const DataWrapper = styled.div(props=>css`
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  > * + * {
    margin-left: ${props.gap};
  }
`)

const IconWrapper = styled.div(props=>css`
  width: ${props.width || "100%"};
  transform: rotate(${props.rotation || 0}deg);
  transition: 1s ease;
  opacity: ${props.visible ? 1 : 0};
  > * {
    width: 100%;
    height: 100%;
    transition: all 1s ease;
  }
`)

const DataDisplay = styled.span(props=>css`
  color: #ffffff;
  font-size: 2.5vw;
`)


const Wind = props => {
  return (
    <DataWrapper gap="1vw">
      <DataDisplay>{props.speed}mph</DataDisplay>
      <IconWrapper width={props.width} rotation={props.bearing}>
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8.35355 0.146447C8.15829 -0.0488155 7.84171 -0.0488155 7.64645 0.146447L4.46447 3.32843C4.2692 3.52369 4.2692 3.84027 4.46447 4.03553C4.65973 4.2308 4.97631 4.2308 5.17157 4.03553L8 1.20711L10.8284 4.03553C11.0237 4.2308 11.3403 4.2308 11.5355 4.03553C11.7308 3.84027 11.7308 3.52369 11.5355 3.32843L8.35355 0.146447ZM7.5 15.5C7.5 15.7761 7.72386 16 8 16C8.27614 16 8.5 15.7761 8.5 15.5H7.5ZM7.5 0.5V15.5H8.5V0.5H7.5Z"
            fill="white"
          />
        </svg>
      </IconWrapper>
    </DataWrapper>
  );
}

const Weather = props => {
  return (
    <DataWrapper gap="1vw">
      <DataDisplay>{props.temperature.toFixed(1)}°C</DataDisplay>
      <IconWrapper visible={props.forecast.toLowerCase().includes("rain")} width={props.width}>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11 8.71682C10.7239 8.71682 10.5 8.48676 10.5 8.20297C10.5 7.87076 10.3772 7.65333 10.2106 7.51028C10.0327 7.35745 9.77648 7.26751 9.5 7.26751C9.22352 7.26751 8.96732 7.35745 8.78938 7.51028C8.62281 7.65333 8.5 7.87076 8.5 8.20297L8.5 8.31847C8.50002 11.2977 8.50003 12.8667 8.36919 13.7408C8.30092 14.1968 8.18711 14.549 7.95775 14.824C7.75006 15.073 7.48021 15.2112 7.25806 15.325L7.17452 15.3679L7.12127 15.3815C5.97885 15.6751 5.16475 15.3937 4.64645 14.861C4.16506 14.3663 4 13.7152 4 13.3415C4 13.0577 4.22386 12.8276 4.5 12.8276C4.77614 12.8276 5 13.0577 5 13.3415C5 13.4816 5.08494 13.8583 5.35355 14.1343C5.58052 14.3676 6.00343 14.5954 6.82672 14.3975C7.05939 14.2768 7.13984 14.2255 7.1985 14.1552C7.25039 14.093 7.32408 13.9635 7.38081 13.5845C7.49827 12.7999 7.5 11.3152 7.5 8.20398C7.5 7.87177 7.37719 7.65333 7.21062 7.51028C7.03268 7.35745 6.77648 7.26751 6.5 7.26751C6.22352 7.26751 5.96732 7.35745 5.78938 7.51028C5.62281 7.65333 5.5 7.87076 5.5 8.20297C5.5 8.48676 5.27614 8.71682 5 8.71682C4.72386 8.71682 4.5 8.48676 4.5 8.20297C4.5 7.88728 4.38129 7.66343 4.1859 7.49223C3.97661 7.30886 3.66243 7.17453 3.28274 7.11289C2.90662 7.05182 2.50092 7.06816 2.14213 7.15232C1.77607 7.23819 1.50463 7.38336 1.35355 7.53861C1.21055 7.68557 0.995495 7.72954 0.808658 7.65C0.621821 7.57047 0.5 7.3831 0.5 7.17527C0.5 4.9518 1.45524 3.26371 2.88463 2.14535C4.3001 1.03788 6.16243 0.5 8 0.5C9.83757 0.5 11.6999 1.03788 13.1154 2.14535C14.5448 3.26371 15.5 4.9518 15.5 7.17527C15.5 7.3831 15.3782 7.57047 15.1913 7.65C15.0045 7.72954 14.7894 7.68557 14.6464 7.53861C14.4954 7.38336 14.2239 7.23819 13.8579 7.15232C13.4991 7.06816 13.0934 7.05182 12.7173 7.11289C12.3376 7.17453 12.0234 7.30886 11.8141 7.49223C11.6187 7.66343 11.5 7.88728 11.5 8.20297C11.5 8.48676 11.2761 8.71682 11 8.71682ZM1.9196 6.15039C1.80124 6.17815 1.68321 6.21215 1.56757 6.2528C1.78314 4.8288 2.49895 3.73875 3.49037 2.96306C4.6999 2.01672 6.33757 1.5277 8 1.5277C9.66243 1.5277 11.3001 2.01672 12.5096 2.96306C13.5011 3.73875 14.2169 4.8288 14.4324 6.2528C14.3168 6.21215 14.1988 6.17815 14.0804 6.15039C13.599 6.03746 13.0648 6.01601 12.5612 6.09777C12.0612 6.17896 11.5557 6.36811 11.1653 6.71017C11.1086 6.75991 11.0546 6.81259 11.0038 6.86816C10.956 6.81637 10.9052 6.76751 10.8519 6.7217C10.4673 6.39142 9.97352 6.23981 9.5 6.23981C9.02648 6.23981 8.53268 6.39142 8.14812 6.7217C8.09619 6.76629 8.04674 6.81377 8 6.86403C7.95326 6.81377 7.90381 6.76629 7.85188 6.7217C7.46732 6.39142 6.97352 6.23981 6.5 6.23981C6.02648 6.23981 5.53268 6.39142 5.14812 6.7217C5.09477 6.76751 5.04404 6.81637 4.99617 6.86816C4.94538 6.81259 4.89144 6.75991 4.83468 6.71017C4.44428 6.36811 3.93884 6.17896 3.43879 6.09777C2.93517 6.01601 2.40099 6.03746 1.9196 6.15039Z"
            fill="white"
          />
        </svg>
      </IconWrapper>
    </DataWrapper>
  );
}

const getBus = async stop => {
    const result = await fetch(`http://127.0.0.1:5000/times/${stop}`).then(res=>res.json())
    return(result)
}

const getWeather = async (stop) => {
  const result = await fetch(
    `http://127.0.0.1:5000/weather/${stop}`
  ).then((res) => res.json());
  return result;
};

export default App;
