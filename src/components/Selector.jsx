import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";

export default function Selector({ inputLimit, setInputLimit }) {
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

  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      changeTime(1);
    } else if (e.key === "ArrowDown") {
      changeTime(-1);
    }
  };

  const changeTime = (delta) => {
    setSeconds((prevSeconds) => {
      let newSeconds = prevSeconds + delta;

      if (newSeconds > 59) {
        setMinutes((prevMinutes) => {
          if (prevMinutes + 1 > 59) {
            setHours((prevHours) => prevHours + 1); // Add an hour when minutes exceed 59
            return 0;
          }
          return prevMinutes + 1;
        });
        return 0;
      }

      if (newSeconds < 0) {
        setMinutes((prevMinutes) => {
          if (prevMinutes - 1 < 0) {
            setHours((prevHours) => Math.max(prevHours - 1, 0)); // Prevent negative hours
            return 59;
          }
          return prevMinutes - 1;
        });
        return 59;
      }

      return newSeconds;
    });
  };

  useEffect(() => {
    let element = containerRef.current;
    if (element) {
      element.focus();
      element.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (element) {
        element.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex h-full items-center justify-center select-none cursor-pointer outline-none"
      onMouseDown={handleMouseDown}
      tabIndex={0}
    >
      <div className="flex w-1/2 items-end justify-center">
        <Counter hours={hours} minutes={minutes} seconds={seconds} />
      </div>
    </div>
  );
}

function Counter({ hours, minutes, seconds }) {
  return (
    <div className="flex h-12 overflow-hidden">
      <DigitColumn value={hours} place={10} />
      <DigitColumn value={hours} place={1} />
      <h1 className="text-5xl">:</h1>
      <DigitColumn value={minutes} place={10} />
      <DigitColumn value={minutes} place={1} />
      <h1 className="text-5xl">:</h1>
      <DigitColumn value={seconds} place={10} />
      <DigitColumn value={seconds} place={1} />
    </div>
  );
}

function DigitColumn({ value, place }) {
  let animatedValue = useSpring(value, { stiffness: 300, damping: 30 });

  useEffect(() => {
    animatedValue.set(value);
  }, [value]);

  return (
    <div className="relative w-12">
      {[...Array(10).keys()].map((i) => (
        <Number key={i} place={place} mv={animatedValue} number={i} />
      ))}
    </div>
  );
}

function Number({ place, mv, number }) {
  let y = useTransform(mv, (latest) => {
    let height = 48;
    let placeValue = Math.floor(Math.abs(latest) / place) % 10;
    let offset = (10 + number - placeValue) % 10;
    let memo = offset * height;

    if (offset > 5) {
      memo -= 10 * height;
    }

    return memo;
  });

  return (
    <motion.h1 style={{ y }} className="absolute inset-0 flex justify-center items-center text-5xl">
      {number}
    </motion.h1>
  );
}
