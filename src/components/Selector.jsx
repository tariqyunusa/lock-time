import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";

export default function Selector({ inputLimit, setInputLimit, reset }) {
  let [hours, setHours] = useState(0);
  let [minutes, setMinutes] = useState(0);
  let [seconds, setSeconds] = useState(0);
  let startY = useRef(null);
  let containerRef = useRef(null);

  useEffect(() => {
    setInputLimit(
      `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    );
  }, [hours, minutes, seconds, setInputLimit]);

  useEffect(() => {
    setHours(0);
    setMinutes(0);
    setSeconds(0);
  }, [reset]);

  const handleMouseMove = (e) => {
    if (startY.current !== null) {
      let delta = startY.current - e.clientY;
      if (Math.abs(delta) > 10) {
        changeTime(Math.sign(delta));
        startY.current = e.clientY;
      }
    }
  };

  const handleMouseDown = (e) => {
    startY.current = e.clientY;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseUp = () => {
    startY.current = null;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const handleInputChange = (e, type) => {
    let value = parseInt(e.target.value, 10) || 0;
    value = Math.max(0, Math.min(type === "hours" ? 99 : 59, value));

    if (type === "hours") setHours(value);
    if (type === "minutes") setMinutes(value);
    if (type === "seconds") setSeconds(value);
  };

  const changeTime = (delta) => {
    setSeconds((prevSeconds) => {
      let newSeconds = prevSeconds + delta;

      if (newSeconds > 59) {
        setMinutes((prevMinutes) => {
          if (prevMinutes + 1 > 59) {
            setHours((prevHours) => prevHours + 1);
            return 0;
          }
          return prevMinutes + 1;
        });
        return 0;
      }

      if (newSeconds < 0) {
        setMinutes((prevMinutes) => {
          if (prevMinutes - 1 < 0) {
            setHours((prevHours) => Math.max(prevHours - 1, 0));
            return 59;
          }
          return prevMinutes - 1;
        });
        return 59;
      }

      return newSeconds;
    });
  };

  return (
    <div
      ref={containerRef}
      className="flex h-full items-center justify-center select-none cursor-pointer outline-none"
      onMouseDown={handleMouseDown}
      tabIndex={0}
    >
      <div className="flex text-center text-5xl">
        <div className="flex items-center flex-col">
        <EditableDigit value={hours} onChange={(e) => handleInputChange(e, "hours")} />
          <p className="text-gray-200 text-xl">HR</p>
        </div>
        <span>:</span>
        <div>
        <EditableDigit value={minutes} onChange={(e) => handleInputChange(e, "minutes")} />
        <p className="text-gray-200 text-xl">MIN</p>
        </div>
        <span>:</span>
        <div>
        <EditableDigit value={seconds} onChange={(e) => handleInputChange(e, "seconds")} />
        <p className="text-gray-200 text-xl">SS</p>
        </div>
      </div>
    </div>
  );
}


function EditableDigit({ value, onChange }) {
  return (
    <input
      type="text"
      value={String(value).padStart(2, "0")}
      onChange={onChange}
      className="w-16 text-center bg-transparent border-none outline-none"
    />
  );
}
