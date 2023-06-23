// Slightly expand the content segment when hovered.

import { FC, MouseEvent, useCallback, useMemo, useState } from "react";
import useMeasure from "react-use-measure";
import { motion } from "framer-motion";

import Content from "./partial/Content";
import { Triangle } from "@atoms/Icons";

type SensorGroupItemProps = {
  name: string;
  index: number;
  url: string;
  onEditClick: () => void;
  onDeleteClick: () => void;
};

const SensorGroupItem: FC<SensorGroupItemProps> = ({
  name,
  index,
  url,
  onEditClick,
  onDeleteClick,
}) => {
  const [isOpened, setIsOpened] = useState<boolean>(false);

  const clickHandler = useCallback((event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setIsOpened((prev) => !prev);
  }, []);

  const editClickHandler = useCallback(() => {
    onEditClick();
  }, [onEditClick]);

  const deleteClickHandler = useCallback(() => {
    onDeleteClick();
  }, [onDeleteClick]);

  const [isHovering, setIsHovering] = useState(false);
  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const [ref, bounds] = useMeasure();
  const contentHeight = useMemo(() => {
    return isOpened ? bounds.height : isHovering ? "1rem" : 0;
  }, [isOpened, isHovering, bounds.height]);

  return (
    <div
      className="flex w-full cursor-pointer rounded-md bg-zinc-500 text-white"
      onClick={clickHandler}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex w-8 shrink-0 items-center justify-center border-r border-black">
        <span className="text-base">{index}</span>
      </div>
      <div className="flex h-full w-full flex-col items-center justify-center gap-y-0 truncate">
        <div className="flex h-10 w-full items-center justify-center border-b border-black px-2">
          <span className="truncate text-base">{name}</span>
        </div>
        <motion.div
          className="h-full w-full overflow-hidden"
          animate={{ height: contentHeight }}
          initial={false}
          transition={{ duration: 0.3 }}
        >
          <div ref={ref}>
            <Content
              url={url}
              isOpened={isOpened}
              name={name}
              onEditClick={editClickHandler}
              onDeleteClick={deleteClickHandler}
            />
          </div>
        </motion.div>
        <div className="flex w-full grow items-end justify-center border-t border-black py-1">
          <Triangle
            className="transform-gpu transition-transform duration-300 ease-in-out"
            style={{
              borderLeft: "20px solid transparent",
              borderRight: "20px solid transparent",
              borderTop: "10px solid white",
              transform: isOpened ? "rotateX(180deg)" : "rotateX(0deg)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SensorGroupItem;
